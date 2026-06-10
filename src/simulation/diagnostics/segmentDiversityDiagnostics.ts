import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface SegmentDiversityDiagnostic {
  readonly segmentIndex: number;
  readonly eventIdPrefix: string;
  readonly scoreChanges: number;
  readonly scoringTeams: readonly string[];
  readonly eventFamilyPattern: string;
  readonly primaryActorPattern: string;
  readonly zonePattern: string;
  readonly fatigueDelta: number;
  readonly momentumDelta: number;
  readonly segmentInfluenceActive: boolean;
  readonly segmentInfluenceTagCount: number;
}

export type SegmentDiversityWarning =
  | "REPEATED_SCORING_PATTERN"
  | "REPEATED_ZONE_PATTERN"
  | "LOW_EVENT_FAMILY_DIVERSITY"
  | "NO_FATIGUE_DELTA"
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "SAME_TEAM_SCORES_IN_MOST_SEGMENTS"
  | "HIGH_LOAD_NO_SCORING_PAYOFF"
  | "SEGMENT_VARIATION_WITH_LOW_OPPONENT_THREAT"
  | "SEGMENT_INFLUENCE_INACTIVE_AFTER_FIRST_SEGMENT";

export interface SegmentDiversitySummary extends SegmentDiversityDiagnostic {
  readonly scoringPattern: string;
  readonly eventFamilyCount: number;
}

export type SegmentDiversityReport = {
  readonly segmentCount: number;
  readonly repeatedScoringPatternCount: number;
  readonly repeatedZonePatternCount: number;
  readonly repeatedEventTypePatternCount: number;
  readonly segmentInfluenceActiveSegmentCount: number;
  readonly segmentSummaries: readonly SegmentDiversitySummary[];
  readonly warnings: readonly SegmentDiversityWarning[];
  readonly dominanceSummary: string;
};

function segmentKeyForEvent(event: MatchEvent): string {
  const matchPrefix = `${event.matchId}-`;

  if (!event.eventId.startsWith(matchPrefix)) {
    return "unknown";
  }

  const remaining = event.eventId.slice(matchPrefix.length);
  const segmentMatch = /^segment-\d+/.exec(remaining);

  return segmentMatch?.[0] ?? "single";
}

function scoreChangeValue(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function fatigueDelta(events: readonly MatchEvent[]): number {
  const firstCondition = events[0]?.fatigueContext.teamCondition;
  const lastCondition = events[events.length - 1]?.fatigueContext.teamCondition;

  if (firstCondition === undefined || lastCondition === undefined) {
    return 0;
  }

  return Math.abs(firstCondition - lastCondition);
}

function momentumDelta(events: readonly MatchEvent[]): number {
  return events
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "momentum_change")
    .reduce((total, consequence) => total + Math.abs(consequence.value ?? 0), 0);
}

function segmentInfluenceTagCount(events: readonly MatchEvent[]): number {
  return events.filter((event) => event.tags.includes("segment_influence_active")).length;
}

export function createSegmentDiversityDiagnostics(report: MatchReport): readonly SegmentDiversityDiagnostic[] {
  const eventsBySegment = new Map<string, MatchEvent[]>();

  for (const event of report.timeline.filter((candidate) => candidate.eventType !== "kickoff")) {
    const segmentKey = segmentKeyForEvent(event);
    const events = eventsBySegment.get(segmentKey) ?? [];
    events.push(event);
    eventsBySegment.set(segmentKey, events);
  }

  return [...eventsBySegment.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([eventIdPrefix, events], index) => ({
      segmentIndex: index,
      eventIdPrefix,
      scoreChanges: events.reduce((total, event) => total + scoreChangeValue(event), 0),
      scoringTeams: [...new Set(events.filter((event) => event.eventType === "scoring").map((event) => event.teamId))],
      eventFamilyPattern: events.map((event) => event.eventType).join(">"),
      primaryActorPattern: events.map((event) => event.primaryPlayerId ?? event.teamId).join(">"),
      zonePattern: events.map((event) => event.zone).join(">"),
      fatigueDelta: fatigueDelta(events),
      momentumDelta: momentumDelta(events),
      segmentInfluenceActive: segmentInfluenceTagCount(events) > 0,
      segmentInfluenceTagCount: segmentInfluenceTagCount(events),
    }));
}

function repeatedPatternCount(patterns: readonly string[]): number {
  const counts = new Map<string, number>();

  for (const pattern of patterns) {
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }

  return [...counts.values()].filter((count) => count > 1).reduce((total, count) => total + count - 1, 0);
}

export function createSegmentDiversityReport(report: MatchReport): SegmentDiversityReport {
  const diagnostics = createSegmentDiversityDiagnostics(report);
  const segmentSummaries: readonly SegmentDiversitySummary[] = diagnostics.map((diagnostic) => {
    const eventFamilies = new Set(diagnostic.eventFamilyPattern.split(">").filter((item) => item.length > 0));

    return {
      ...diagnostic,
      scoringPattern: diagnostic.scoringTeams.join("+") || "none",
      eventFamilyCount: eventFamilies.size,
    };
  });
  const repeatedScoringPatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.scoringPattern));
  const repeatedZonePatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.zonePattern));
  const repeatedEventTypePatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.eventFamilyPattern));
  const segmentInfluenceActiveSegmentCount = segmentSummaries.filter((summary) => summary.segmentInfluenceActive).length;
  const warnings = new Set<SegmentDiversityWarning>();

  if (repeatedScoringPatternCount > 0) {
    warnings.add("REPEATED_SCORING_PATTERN");
  }

  if (repeatedZonePatternCount > 0) {
    warnings.add("REPEATED_ZONE_PATTERN");
  }

  if (segmentSummaries.some((summary) => summary.eventFamilyCount <= 2)) {
    warnings.add("LOW_EVENT_FAMILY_DIVERSITY");
  }

  if (segmentSummaries.every((summary) => summary.fatigueDelta <= 1)) {
    warnings.add("NO_FATIGUE_DELTA");
  }

  const scoringTeams = segmentSummaries.flatMap((summary) => summary.scoringTeams);
  if (scoringTeams.length > 0 && new Set(scoringTeams).size === 1 && segmentSummaries.length > 1) {
    warnings.add("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN");
  }

  const scoringTeamCounts = new Map<string, number>();
  for (const summary of segmentSummaries) {
    for (const teamId of summary.scoringTeams) {
      scoringTeamCounts.set(teamId, (scoringTeamCounts.get(teamId) ?? 0) + 1);
    }
  }
  const dominantEntry = [...scoringTeamCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const allTeamIds = [...new Set([...report.teamStats.map((stats) => stats.teamId), ...report.timeline.map((event) => event.teamId)])];
  const zeroScoringTeams = allTeamIds.filter((teamId) => !scoringTeams.includes(teamId));
  const highLoadNoPayoffTeams = zeroScoringTeams.filter((teamId) =>
    (report.fatigueReport.teamSummaries.find((summary) => summary.teamId === teamId)?.highIntensityLoad ?? 0) >= 80,
  );

  if (zeroScoringTeams.length > 0 && scoringTeams.length > 0) {
    warnings.add("ZERO_SCORING_EVENTS_FOR_ONE_TEAM");
  }

  if (dominantEntry !== undefined && dominantEntry[1] >= Math.ceil(segmentSummaries.length * 0.6)) {
    warnings.add("SAME_TEAM_SCORES_IN_MOST_SEGMENTS");
  }

  if (highLoadNoPayoffTeams.length > 0) {
    warnings.add("HIGH_LOAD_NO_SCORING_PAYOFF");
  }

  if (segmentSummaries.length > 1 && zeroScoringTeams.length > 0 && repeatedEventTypePatternCount < segmentSummaries.length - 1) {
    warnings.add("SEGMENT_VARIATION_WITH_LOW_OPPONENT_THREAT");
  }

  if (segmentSummaries.length > 1 && segmentInfluenceActiveSegmentCount < segmentSummaries.length - 1) {
    warnings.add("SEGMENT_INFLUENCE_INACTIVE_AFTER_FIRST_SEGMENT");
  }

  const dominanceSummary = dominantEntry === undefined
    ? "No scoring dominance pattern was detected in the segment stream."
    : `${dominantEntry[0]} dominated the single-run scoring stream across ${dominantEntry[1]} segment(s). ${zeroScoringTeams.length === 0 ? "Both teams had scoring payoff." : `${zeroScoringTeams.join(", ")} produced no scoring payoff.`} Treat this as a harness plausibility warning, not a scoring-economy verdict.`;

  return {
    segmentCount: segmentSummaries.length,
    repeatedScoringPatternCount,
    repeatedZonePatternCount,
    repeatedEventTypePatternCount,
    segmentInfluenceActiveSegmentCount,
    segmentSummaries,
    warnings: [...warnings],
    dominanceSummary,
  };
}
