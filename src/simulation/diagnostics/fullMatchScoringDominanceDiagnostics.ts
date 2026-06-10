import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type FullMatchScoringDominanceWarning =
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN"
  | "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE"
  | "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION"
  | "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF";

export type FullMatchScoringDominanceReport = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly warnings: readonly FullMatchScoringDominanceWarning[];
  readonly score: {
    readonly home: number;
    readonly away: number;
  };
  readonly scoringEventsByTeam: readonly {
    readonly teamId: string;
    readonly scoringEventCount: number;
    readonly points: number;
    readonly mainScoringZones: readonly string[];
    readonly mainScoringEventTypes: readonly string[];
  }[];
  readonly dominatedTeamId?: string;
  readonly dominantTeamId?: string;
  readonly dominatedTeamEvidenceEventIds: readonly string[];
  readonly affectedZones: readonly string[];
  readonly interpretation: string;
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly recommendedNextActions: readonly string[];
};

const HIGH_SINGLE_TEAM_SCORING_EVENTS = 10;
const DOMINANCE_POINT_SHARE = 0.9;
const CLUSTER_SHARE = 0.6;

function scorePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function scoringType(event: MatchEvent): string {
  return event.tags.find((tag) => tag.startsWith("scoring_type_"))?.replace("scoring_type_", "") ?? event.tacticalContext.moveType ?? "scoring";
}

function segmentKey(event: MatchEvent): string {
  const matchPrefix = `${event.matchId}-`;
  const withoutMatch = event.eventId.startsWith(matchPrefix) ? event.eventId.slice(matchPrefix.length) : event.eventId;
  const segmentMatch = /^segment-\d+/.exec(withoutMatch);

  return segmentMatch?.[0] ?? "single";
}

function topValues<T extends string>(values: readonly T[], limit: number): readonly T[] {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value);
}

function topShare(values: readonly string[]): number {
  if (values.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Math.max(...counts.values()) / values.length;
}

function teamIdsForReport(report: MatchReport): readonly TeamId[] {
  return [...new Set([
    ...report.teamStats.map((stats) => stats.teamId),
    ...report.timeline.map((event) => event.teamId),
  ])];
}

function hasDangerSignal(event: MatchEvent): boolean {
  return event.eventType === "progression" || event.tags.includes("danger_high") || event.tags.includes("finishing_opportunity");
}

function hasPressureSignal(event: MatchEvent): boolean {
  return event.tags.includes("pressure_high") ||
    event.tags.includes("pressure_medium") ||
    event.tags.includes("territorial_pressure_high") ||
    event.tags.includes("stability_low");
}

export function analyzeFullMatchScoringDominance(report: MatchReport): FullMatchScoringDominanceReport {
  const warnings = new Set<FullMatchScoringDominanceWarning>();
  const teamIds = teamIdsForReport(report);
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring" || scorePoints(event) > 0);
  const scoringEventsByTeam = teamIds.map((teamId) => {
    const teamScoringEvents = scoringEvents.filter((event) => event.teamId === teamId);

    return {
      teamId,
      scoringEventCount: teamScoringEvents.length,
      points: teamScoringEvents.reduce((total, event) => total + scorePoints(event), 0),
      mainScoringZones: topValues(teamScoringEvents.map((event) => event.zone), 3),
      mainScoringEventTypes: topValues(teamScoringEvents.map(scoringType), 3),
    };
  });
  const totalPoints = scoringEventsByTeam.reduce((total, item) => total + item.points, 0);
  const dominantTeam = scoringEventsByTeam
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)[0];
  const dominatedTeam = scoringEventsByTeam
    .filter((item) => item.teamId !== dominantTeam?.teamId)
    .sort((a, b) => a.points - b.points || a.scoringEventCount - b.scoringEventCount)[0];
  const dominantScoringEvents = dominantTeam === undefined
    ? []
    : scoringEvents.filter((event) => event.teamId === dominantTeam.teamId);
  const dominatedEvents = dominatedTeam === undefined
    ? []
    : report.timeline.filter((event) => event.teamId === dominatedTeam.teamId && event.eventType !== "kickoff");
  const dominatedDangerEvents = dominatedEvents.filter(hasDangerSignal);
  const dominatedPressureEvents = dominatedEvents.filter(hasPressureSignal);
  const dominatedFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === dominatedTeam?.teamId);

  if (dominantTeam !== undefined && totalPoints > 0 && dominantTeam.points / totalPoints >= DOMINANCE_POINT_SHARE) {
    warnings.add("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN");
  }

  if (scoringEventsByTeam.some((item) => item.scoringEventCount === 0) && scoringEvents.length > 0) {
    warnings.add("ZERO_SCORING_EVENTS_FOR_ONE_TEAM");
  }

  if (scoringEventsByTeam.some((item) => item.scoringEventCount >= HIGH_SINGLE_TEAM_SCORING_EVENTS)) {
    warnings.add("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM");
  }

  if (topShare(dominantScoringEvents.map((event) => event.zone)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE");
  }

  if (topShare(dominantScoringEvents.map(scoringType)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY");
  }

  if (topShare(dominantScoringEvents.map(segmentKey)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && dominatedDangerEvents.length > 0) {
    warnings.add("DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && dominatedPressureEvents.length > 0) {
    warnings.add("DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && (dominatedFatigue?.highIntensityLoad ?? 0) >= 80) {
    warnings.add("DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF");
  }

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings: [...warnings],
    score: report.score,
    scoringEventsByTeam,
    ...(dominatedTeam === undefined ? {} : { dominatedTeamId: dominatedTeam.teamId }),
    ...(dominantTeam === undefined ? {} : { dominantTeamId: dominantTeam.teamId }),
    dominatedTeamEvidenceEventIds: [...new Set([...dominatedDangerEvents, ...dominatedPressureEvents].map((event) => event.eventId))].slice(0, 8),
    affectedZones: topValues([...dominantScoringEvents, ...dominatedDangerEvents, ...dominatedPressureEvents].map((event) => event.zone as ZoneId), 4),
    interpretation:
      "This is a single-run full-match harness dominance warning. It identifies local harness/report behavior and cannot invalidate the validated 50-match scoring economy.",
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [
      "explain the single-run scoring dominance in the coach report",
      "inspect repeated scoring zones and event families",
      "surface dominated-team danger or pressure without conversion",
      "keep scoring values tied to the validated 50-match economy, not this single run",
    ],
  };
}
