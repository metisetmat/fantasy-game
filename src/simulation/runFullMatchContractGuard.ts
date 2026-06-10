import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { analyzeFullMatchHarnessSanity } from "./diagnostics/fullMatchHarnessSanity";
import { analyzeFullMatchScoringDominance } from "./diagnostics/fullMatchScoringDominanceDiagnostics";
import { createSegmentDiversityReport } from "./diagnostics/segmentDiversityDiagnostics";
import { createMatchReportSignature } from "./runMatch";
import { runFullMatch } from "./runFullMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function compareTimelineEvents(a: MatchEvent, b: MatchEvent): number {
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

function validateChronology(report: MatchReport): void {
  for (let index = 1; index < report.timeline.length; index += 1) {
    const previousEvent = report.timeline[index - 1];
    const currentEvent = report.timeline[index];

    if (previousEvent === undefined || currentEvent === undefined) {
      continue;
    }

    assertGuard(
      compareTimelineEvents(previousEvent, currentEvent) <= 0,
      `${currentEvent.eventId} appears before ${previousEvent.eventId}.`,
    );
  }
}

function validateUniqueEventIds(report: MatchReport): void {
  const eventIds = new Set<string>();

  for (const event of report.timeline) {
    assertGuard(!eventIds.has(event.eventId), `Duplicate eventId ${event.eventId}.`);
    eventIds.add(event.eventId);
  }
}

function validateScoreFromConsequences(report: MatchReport, input: MatchInput): void {
  const score = report.timeline.reduce(
    (currentScore, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: currentScore.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: currentScore.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(
    score.home === report.score.home && score.away === report.score.away,
    `Full-match score ${report.score.home}-${report.score.away} does not match score_change consequences ${score.home}-${score.away}.`,
  );
}

function validateKeyMoments(report: MatchReport): void {
  assertGuard(report.keyMoments.length <= 5, `Full-match key moments must stay capped at 5, received ${report.keyMoments.length}.`);
  assertGuard(report.keyMoments.length < report.timeline.length, "Full-match key moments must be selected, not copied from the timeline.");

  const eventIds = new Set(report.timeline.map((event) => event.eventId));

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `Key moment ${moment.title} references missing event ${moment.eventId}.`);
  }

  const uniqueTitles = new Set(report.keyMoments.map((moment) => moment.title));
  const titleCounts = new Map<string, number>();
  for (const moment of report.keyMoments) {
    titleCounts.set(moment.title, (titleCounts.get(moment.title) ?? 0) + 1);
  }
  if (report.keyMoments.length > 1) {
    assertGuard(uniqueTitles.size >= 2, "Full-match key moments should include at least two different titles when possible.");
  }
  assertGuard(
    [...titleCounts.values()].every((count) => count <= 2),
    "Full-match key moments should include no more than 2 moments with the same title when alternatives exist.",
  );

  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;
  const hasNonScoringCandidate = report.timeline.some((event) => event.eventType !== "kickoff" && event.eventType !== "scoring" && event.narrativeWeight >= 60);

  if (hasNonScoringCandidate) {
    assertGuard(scoringMoments <= 2, `Full-match key moments should include at most 2 scoring moments when alternatives exist, received ${scoringMoments}.`);
  }
}

function validateEvidenceReferences(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));

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
}

function validateHarnessSanityWarnings(report: MatchReport): void {
  const sanity = analyzeFullMatchHarnessSanity(report);
  const dominance = analyzeFullMatchScoringDominance(report);
  const forbiddenRecommendationFragments = [
    "reduce SHOT_GOAL",
    "reduce TRY_TOUCHDOWN",
    "cap score",
    "delete events",
    "recalibrate scoring from a single run",
    "global scoring incoherent",
  ];

  assertGuard(
    sanity.scope === "FULL_MATCH_HARNESS_SINGLE_RUN",
    `runFullMatch guard must label sanity scope as FULL_MATCH_HARNESS_SINGLE_RUN, received ${sanity.scope}.`,
  );
  assertGuard(
    sanity.mayInvalidateGlobalScoringEconomy === false,
    "runFullMatch harness sanity warnings must not invalidate global scoring economy.",
  );

  if (report.score.home + report.score.away > 35) {
    assertGuard(
      sanity.warnings.includes("INFLATED_SINGLE_RUN_SCORE"),
      "high single-run score must emit INFLATED_SINGLE_RUN_SCORE warning, not scoring failure.",
    );
  }

  if (Math.abs(report.score.home - report.score.away) >= 21) {
    assertGuard(
      dominance.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"),
      "lopsided single-run score must emit one-team scoring dominance diagnostics.",
    );
    assertGuard(
      sanity.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"),
      "lopsided single-run score must surface dominance warning through harness sanity.",
    );
    assertGuard(
      dominance.mayInvalidateGlobalScoringEconomy === false,
      "one-team scoring dominance must stay warning-only and cannot invalidate global economy.",
    );
  }

  if (dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM")) {
    assertGuard(
      sanity.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"),
      "zero scoring team must surface as warning-only through harness sanity.",
    );
  }

  if (report.keyMoments.filter((moment) => {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    return event?.eventType === "scoring";
  }).length >= 3) {
    assertGuard(
      sanity.warnings.includes("REPETITIVE_KEY_MOMENTS"),
      "repetitive scoring key moments must emit a harness warning.",
    );
  }

  if (report.fatigueReport.playerSummaries.every((summary) => summary.conditionStart === summary.conditionEnd)) {
    assertGuard(
      sanity.warnings.includes("FLAT_FATIGUE_SIGNAL"),
      "flat fatigue must emit a harness warning.",
    );
  }

  const recommendationText = sanity.recommendedNextActions.join(" | ");
  for (const fragment of forbiddenRecommendationFragments) {
    assertGuard(
      !recommendationText.includes(fragment),
      `runFullMatch harness sanity recommendations must not include forbidden scoring recommendation: ${fragment}.`,
    );
  }
}

function validateSegmentDiversityAndFatigue(report: MatchReport, input: MatchInput): void {
  const segmentReport = createSegmentDiversityReport(report);
  const homeFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.homeTeam.teamId);
  const awayFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.awayTeam.teamId);
  const homeStart = input.homeTeam.roster[0]?.currentCondition ?? 100;
  const awayStart = input.awayTeam.roster[0]?.currentCondition ?? 100;

  assertGuard(segmentReport.segmentCount >= 2, "Segment diversity report must exist and cover multiple segments.");
  assertGuard(segmentReport.segmentSummaries.length === segmentReport.segmentCount, "Segment diversity summaries must match segment count.");
  assertGuard(homeFatigue !== undefined && awayFatigue !== undefined, "Full-match fatigue propagation report must include both teams.");

  if (homeFatigue !== undefined && awayFatigue !== undefined) {
    assertGuard(
      homeFatigue.averageConditionEnd < homeStart || awayFatigue.averageConditionEnd < awayStart,
      "At least one team condition must decrease below starting condition in full-match harness.",
    );
    assertGuard(
      awayFatigue.highIntensityLoad >= homeFatigue.highIntensityLoad,
      "High pressing team should have greater or equal highIntensityLoad than balanced team.",
    );
    assertGuard(
      !(awayFatigue.highIntensityLoad === 100 && homeFatigue.highIntensityLoad === 100),
      "HighIntensityLoad should not saturate both teams to 100 unless explicitly justified by extreme load.",
    );
  }
}

function validateDominatedTeamEvidence(report: MatchReport): void {
  const dominance = analyzeFullMatchScoringDominance(report);

  if (dominance.dominatedTeamId === undefined || !dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM")) {
    return;
  }

  const hasDominatedDiagnosis = report.tacticalReport.diagnoses.some((diagnosis) =>
    diagnosis.summary.includes("domination scoring locale") &&
    diagnosis.summary.includes("économie du score") &&
    diagnosis.evidenceEventIds.length > 0,
  );
  const hasDominatedMoment = report.keyMoments.some((moment) => {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    return event !== undefined && event.teamId === dominance.dominatedTeamId && event.eventType !== "kickoff";
  });

  assertGuard(hasDominatedDiagnosis, "Dominance diagnosis must explain single-run scoring dominance without leaking raw scope enums.");
  assertGuard(hasDominatedMoment || dominance.dominatedTeamEvidenceEventIds.length === 0, "Key moments should include a dominated-team signal when evidence exists.");
}

export function validateRunFullMatchHarness(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const repeatedReport = runFullMatch(input);

  assertGuard(report.matchId === input.matchId, `runFullMatch report matchId ${report.matchId} did not preserve ${input.matchId}.`);
  assertGuard(report.timeline.length >= 30, `runFullMatch timeline must contain at least 30 events, received ${report.timeline.length}.`);
  validateChronology(report);
  validateUniqueEventIds(report);
  validateScoreFromConsequences(report, input);
  validateKeyMoments(report);
  validateEvidenceReferences(report);
  validateHarnessSanityWarnings(report);
  validateSegmentDiversityAndFatigue(report, input);
  validateDominatedTeamEvidence(report);
  assertGuard(
    createMatchReportSignature(report) === createMatchReportSignature(repeatedReport),
    "runFullMatch must be deterministic for the same MatchInput.",
  );

  return [
    "runFullMatch preserves MatchInput.matchId",
    "runFullMatch creates a full-match-shaped event volume",
    "full-match timeline is chronological",
    "full-match event IDs are unique",
    "full-match score equals score_change consequences",
    "full-match key moments remain selected and capped",
    "full-match key moments include diverse titles when possible",
    "full-match key moments cap repeated titles when alternatives exist",
    "full-match scoring key moments are capped by selection when alternatives exist",
    "full-match insights and diagnoses reference existing events",
    "segment diversity report exists",
    "fatigue propagation report exists",
    "at least one team condition decreases below starting condition",
    "high pressing team has greater or equal highIntensityLoad than balanced team",
    "full-match guard scope is FULL_MATCH_HARNESS_SINGLE_RUN",
    "high single-run score is a harness warning, not a scoring failure",
    "harness sanity warnings do not recommend scoring value changes",
    "dominance diagnostics exist for lopsided single-run score",
    "one-team scoring dominance remains warning-only",
    "zero scoring team remains warning-only",
    "dominated-team evidence appears when available",
    "highIntensityLoad avoids double saturation at 100",
    "runFullMatch is deterministic for the same input",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchHarness();

  console.log("runFullMatch harness guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
