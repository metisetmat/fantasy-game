import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { Rating } from "../core/ratings";
import { createMatchReportSignature, runMatch } from "./runMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertRating(label: string, value: Rating): void {
  assertGuard(Number.isFinite(value) && value >= 0 && value <= 100, `${label} must be within 0-100, received ${value}.`);
}

function validateReportReferences(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));

  for (const event of report.timeline) {
    assertGuard(event.matchId === report.matchId, `${event.eventId} does not preserve report matchId ${report.matchId}.`);
    assertGuard(event.sequenceId.length > 0, `${event.eventId} must have a non-empty sequenceId.`);
    assertGuard(event.teamId.length > 0, `${event.eventId} must have a non-empty teamId.`);
    assertGuard(event.opponentTeamId.length > 0, `${event.eventId} must have a non-empty opponentTeamId.`);
    assertGuard(event.teamId !== event.opponentTeamId, `${event.eventId} teamId and opponentTeamId must differ.`);
    assertGuard(
      event.tags.some((tag) => tag !== "run_match_adapter"),
      `${event.eventId} must include at least one useful adapter tag beyond run_match_adapter.`,
    );
  }

  for (const insight of report.coachInsights) {
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(eventIds.has(eventId), `${insight.insightId} references missing event ${eventId}.`);
      }
    }
  }

  for (const diagnosis of report.tacticalReport.diagnoses) {
    for (const eventId of diagnosis.evidenceEventIds) {
      assertGuard(eventIds.has(eventId), `${diagnosis.diagnosisId} references missing event ${eventId}.`);
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `Key moment ${moment.title} references missing event ${moment.eventId}.`);
  }
}

function validateTacticalPlanTags(report: MatchReport): void {
  const planTags = report.timeline.flatMap((event) => event.tags.filter((tag) => tag.startsWith("plan_")));

  assertGuard(planTags.length > 0, "runMatch report must include at least one tactical-plan-derived tag.");
}

function validatePlanInfluenceDiagnosis(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));
  const diagnosis = report.tacticalReport.diagnoses.find((candidate) => candidate.title === "Plan de match observé");

  if (diagnosis === undefined) {
    throw new Error("runMatch report must include a Plan de match observé tactical diagnosis.");
  }

  assertGuard(
    diagnosis.evidenceEventIds.length > 0,
    "Plan de match observé diagnosis must reference at least one event.",
  );
  for (const eventId of diagnosis.evidenceEventIds) {
    assertGuard(eventIds.has(eventId), `Plan de match observé diagnosis references missing event ${eventId}.`);
  }
  assertGuard(
    diagnosis.summary.includes("tempo rapide") || diagnosis.summary.includes("risque élevé"),
    "Plan de match observé diagnosis must include readable tactical-plan summary text.",
  );
}

function validateEvidenceDrivenInsights(report: MatchReport): void {
  const totalEvents = report.timeline.length;
  const focusedInsight = report.coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.eventIds.length > 0 && evidence.eventIds.length < totalEvents),
  );
  const evidenceFactInsight = report.coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.summary.includes("Fait de preuve")),
  );

  assertGuard(evidenceFactInsight !== undefined, "runMatch must create at least one evidence-driven coach insight.");

  if (totalEvents > 1) {
    assertGuard(
      focusedInsight !== undefined,
      "at least one CoachInsight must reference fewer than all timeline events when possible.",
    );
  }
}

function validateReadableKeyMoments(report: MatchReport): void {
  const insightEvidenceEventIds = new Set(
    report.coachInsights.flatMap((insight) => insight.evidence.flatMap((evidence) => evidence.eventIds)),
  );
  const keyMomentEventIds = new Set(report.keyMoments.map((moment) => moment.eventId));

  assertGuard(
    report.keyMoments.length <= report.timeline.length,
    `keyMoments length ${report.keyMoments.length} cannot exceed timeline length ${report.timeline.length}.`,
  );

  if (report.timeline.length > 3) {
    assertGuard(
      report.keyMoments.length < report.timeline.length,
      "keyMoments must be selected, not copied from the entire timeline.",
    );
  }

  for (const moment of report.keyMoments) {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    if (event === undefined) {
      throw new Error(`Key moment ${moment.title} references missing event ${moment.eventId}.`);
    }

    if (event.eventType !== "kickoff") {
      assertGuard(moment.title !== "Adapter kickoff", `${moment.eventId} must not use the placeholder title Adapter kickoff.`);
    }
  }

  if (insightEvidenceEventIds.size > 0) {
    assertGuard(
      [...insightEvidenceEventIds].some((eventId) => keyMomentEventIds.has(eventId)),
      "at least one key moment must reference an insight evidence event.",
    );
  }
}

function validateSuggestedFocus(report: MatchReport): void {
  const hasEvidenceDrivenInsight = report.coachInsights.some((insight) =>
    insight.evidence.some((evidence) => evidence.summary.includes("Fait de preuve")),
  );

  if (!hasEvidenceDrivenInsight) {
    return;
  }

  assertGuard(
    report.suggestedFocus.some((focus) => focus.title !== "Finaliser l'adapter du contrat moteur"),
    "evidence-driven reports should produce a focus beyond the adapter completion fallback.",
  );
}

function compareTimelineEvents(a: MatchReport["timeline"][number], b: MatchReport["timeline"][number]): number {
  if (a.timestamp.minute !== b.timestamp.minute) {
    return a.timestamp.minute - b.timestamp.minute;
  }

  if (a.timestamp.tick !== b.timestamp.tick) {
    return a.timestamp.tick - b.timestamp.tick;
  }

  if (a.eventType === "scoring" && b.eventType !== "scoring") {
    return 1;
  }

  if (a.eventType !== "scoring" && b.eventType === "scoring") {
    return -1;
  }

  return a.eventId.localeCompare(b.eventId);
}

function validateTimelineChronology(report: MatchReport): void {
  for (let index = 1; index < report.timeline.length; index += 1) {
    const previousEvent = report.timeline[index - 1];
    const currentEvent = report.timeline[index];

    if (previousEvent === undefined || currentEvent === undefined) {
      continue;
    }

    assertGuard(
      compareTimelineEvents(previousEvent, currentEvent) <= 0,
      `${currentEvent.eventId} appears before ${previousEvent.eventId} in chronological order.`,
    );
  }
}

function validateTeamStats(report: MatchReport, input: MatchInput): void {
  const teamIds = new Set(report.teamStats.map((stats) => stats.teamId));

  assertGuard(report.teamStats.length === 2, `teamStats must contain exactly two teams, received ${report.teamStats.length}.`);
  assertGuard(teamIds.has(input.homeTeam.teamId), `teamStats must include home team ${input.homeTeam.teamId}.`);
  assertGuard(teamIds.has(input.awayTeam.teamId), `teamStats must include away team ${input.awayTeam.teamId}.`);

  const homeStats = report.teamStats.find((stats) => stats.teamId === input.homeTeam.teamId);
  const awayStats = report.teamStats.find((stats) => stats.teamId === input.awayTeam.teamId);

  if (homeStats === undefined || awayStats === undefined) {
    throw new Error("teamStats missing home or away stats after team ID validation.");
  }

  assertGuard(homeStats.score === report.score.home, `home teamStats score ${homeStats.score} must match report score ${report.score.home}.`);
  assertGuard(awayStats.score === report.score.away, `away teamStats score ${awayStats.score} must match report score ${report.score.away}.`);

  const scoringEventsByTeam = report.timeline.reduce(
    (counts, event) => ({
      home: counts.home + (event.teamId === input.homeTeam.teamId && event.eventType === "scoring" ? 1 : 0),
      away: counts.away + (event.teamId === input.awayTeam.teamId && event.eventType === "scoring" ? 1 : 0),
    }),
    { home: 0, away: 0 },
  );

  if (homeStats.scoringEventCount !== undefined) {
    assertGuard(
      homeStats.scoringEventCount === scoringEventsByTeam.home,
      `home scoringEventCount ${homeStats.scoringEventCount} must match timeline scoring events ${scoringEventsByTeam.home}.`,
    );
  }

  if (awayStats.scoringEventCount !== undefined) {
    assertGuard(
      awayStats.scoringEventCount === scoringEventsByTeam.away,
      `away scoringEventCount ${awayStats.scoringEventCount} must match timeline scoring events ${scoringEventsByTeam.away}.`,
    );
  }

  if (homeStats.eventShare !== undefined && awayStats.eventShare !== undefined) {
    assertGuard(
      homeStats.eventShare + awayStats.eventShare === 100,
      `home/away event shares must sum to 100, received ${homeStats.eventShare + awayStats.eventShare}.`,
    );
  }
}

function validateZoneStats(report: MatchReport): void {
  const nonKickoffEvents = report.timeline.filter((event) => event.eventType !== "kickoff");
  const timelineZones = new Set(nonKickoffEvents.map((event) => event.zone));
  const statZones = new Set(report.zoneStats.map((stats) => stats.zone));

  for (const zone of timelineZones) {
    assertGuard(statZones.has(zone), `zoneStats must include timeline zone ${zone}.`);
  }

  for (const stats of report.zoneStats) {
    const eventsInZone = nonKickoffEvents.filter((event) => event.zone === stats.zone);

    assertGuard(stats.entries === eventsInZone.length, `${stats.zone} entries ${stats.entries} must match timeline count ${eventsInZone.length}.`);
    assertGuard(
      stats.successfulProgressions <= stats.entries,
      `${stats.zone} successfulProgressions ${stats.successfulProgressions} cannot exceed entries ${stats.entries}.`,
    );
  }
}

function validateScoringConsequences(report: MatchReport): void {
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring");

  for (const event of scoringEvents) {
    assertGuard(
      event.consequences.some((consequence) => consequence.type === "score_change"),
      `${event.eventId} scoring event must include a score_change consequence.`,
    );
  }
}

function validateScoreFromConsequences(report: MatchReport, homeTeamId: string, awayTeamId: string): void {
  const scoreFromEvents = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === homeTeamId ? points : 0),
        away: score.away + (event.teamId === awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(
    scoreFromEvents.home === report.score.home && scoreFromEvents.away === report.score.away,
    `score consequences ${scoreFromEvents.home}-${scoreFromEvents.away} do not match report score ${report.score.home}-${report.score.away}.`,
  );
}

function validateReportRatings(report: MatchReport): void {
  for (const event of report.timeline) {
    assertRating(`${event.eventId}.narrativeWeight`, event.narrativeWeight);
    assertRating(`${event.eventId}.fatigueContext.teamCondition`, event.fatigueContext.teamCondition);
  }

  for (const stats of report.playerStats) {
    assertRating(`${stats.playerId}.contributionScore`, stats.contributionScore);
  }

  for (const summary of report.fatigueReport.teamSummaries) {
    assertRating(`${summary.teamId}.averageConditionEnd`, summary.averageConditionEnd);
    assertRating(`${summary.teamId}.highIntensityLoad`, summary.highIntensityLoad);
  }

  for (const summary of report.fatigueReport.playerSummaries) {
    assertRating(`${summary.playerId}.conditionStart`, summary.conditionStart);
    assertRating(`${summary.playerId}.conditionEnd`, summary.conditionEnd);
    assertRating(`${summary.playerId}.mentalFreshnessEnd`, summary.mentalFreshnessEnd);
  }
}

function withSeed(input: MatchInput, seed: string): MatchInput {
  return {
    ...input,
    seed,
  };
}

function withUnsupportedHomeTeam(input: MatchInput): MatchInput {
  return {
    ...input,
    homeTeam: {
      ...input.homeTeam,
      teamId: "unsupported-team",
      name: "Unsupported Team",
    },
  };
}

function validateUnsupportedTeamLimitation(input: MatchInput): void {
  try {
    runMatch(withUnsupportedHomeTeam(input));
  } catch (error) {
    assertGuard(
      error instanceof Error && error.message.includes("unsupported teamId"),
      `unsupported team error should mention unsupported teamId, received ${error instanceof Error ? error.message : String(error)}.`,
    );
    return;
  }

  throw new Error("runMatch should reject unsupported team IDs until the adapter is generic.");
}

export function validateRunMatchAdapter(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runMatch(input);
  const repeatedReport = runMatch(input);
  const alternateSeedReport = runMatch(withSeed(input, `${input.seed}-alternate`));
  const signature = createMatchReportSignature(report);
  const repeatedSignature = createMatchReportSignature(repeatedReport);
  const alternateSeedSignature = createMatchReportSignature(alternateSeedReport);
  const seedStatus =
    signature === alternateSeedSignature
      ? "different seeds currently produce the same minimal adapter signature; seed is forwarded to mini-match, but the adapter accepts this documented limitation until simulation variation is fully wired"
      : "different seeds produce different adapter signatures";

  assertGuard(report.matchId === input.matchId, `runMatch report matchId ${report.matchId} did not preserve ${input.matchId}.`);
  assertGuard(Number.isFinite(report.score.home), "home score must be numeric.");
  assertGuard(Number.isFinite(report.score.away), "away score must be numeric.");
  assertGuard(report.timeline.length >= 1 + 6, "runMatch timeline must include kickoff plus at least one event per mini-match sequence.");
  validateReportReferences(report);
  validateTacticalPlanTags(report);
  validatePlanInfluenceDiagnosis(report);
  validateEvidenceDrivenInsights(report);
  validateReadableKeyMoments(report);
  validateSuggestedFocus(report);
  validateTimelineChronology(report);
  validateTeamStats(report, input);
  validateZoneStats(report);
  validateScoringConsequences(report);
  validateScoreFromConsequences(report, input.homeTeam.teamId, input.awayTeam.teamId);
  validateReportRatings(report);
  validateUnsupportedTeamLimitation(input);
  assertGuard(signature === repeatedSignature, "same MatchInput seed did not produce a stable MatchReport signature.");

  return [
    "runMatch preserves MatchInput.matchId",
    "runMatch returns numeric score",
    "runMatch returns kickoff plus sequence-derived official timeline events",
    "every timeline event has matchId, sequenceId, teamId, and opponentTeamId",
    "every timeline event has useful adapter taxonomy tags",
    "report includes tactical-plan-derived tags",
    "report includes coach-visible tactical plan diagnosis",
    "coach insights and tactical diagnoses reference existing timeline evidence",
    "at least one coach insight is evidence-driven and focused",
    "key moments are selected, capped, and coach-readable",
    "evidence-driven reports produce evidence-based suggested focus",
    "report timeline is chronological",
    "team stats contain home/away teams and match report score",
    "zone stats cover non-kickoff timeline zones with consistent entries",
    "scoring events include score_change consequences",
    "report score equals score_change consequences by team",
    "unsupported team IDs fail with an explicit adapter limitation",
    "runMatch coach insight and key moment references resolve to timeline events",
    "same seed produces a stable MatchReport signature",
    seedStatus,
  ];
}

if (require.main === module) {
  const checks = validateRunMatchAdapter();

  console.log("runMatch adapter guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
