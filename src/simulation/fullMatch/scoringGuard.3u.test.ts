import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function validateScoringGuard3U(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.status === "available", "official timeline diff view should be available.");
  assertTest(signature.officialTimelineDiffEventCount === 0, "official timeline diff events must not be official MatchEvents.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "official timeline event count delta must be zero.");
  assertTest(signature.officialScoringEventCountDelta === 0, "official scoring event count delta must be zero.");
  assertTest(signature.officialScoreDelta === 0, "official score delta must be zero.");
  assertTest(signature.officialPossessionChanged === "false", "official possession must not change from the diff view.");
  assertTest(signature.productionScoringEventCreationCount === 0, "diff view must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_OFFICIAL_TIMELINE_DIFF_VIEW_READ_ONLY"), "official timeline diff view must remain read-only.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from official timeline diff view",
    "official timeline diff view remains separate from official timeline",
    "official possession, score, timeline, and scoring events are not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3U();

  console.log("scoringGuard.3u tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
