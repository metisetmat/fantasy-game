import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchRealIsolatedSegmentReplaySignature } from "./fullMatchRealIsolatedSegmentReplaySignature";

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

export function validateRunFullMatchRealIsolatedSegmentReplayScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchRealIsolatedSegmentReplaySignature(defaultReport);
  const experimentalSignature = fullMatchRealIsolatedSegmentReplaySignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "real isolated replay must not mutate official home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "real isolated replay must not mutate official away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "real isolated replay must not mutate official scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "real isolated replay must not mutate official score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "real isolated replay must not add official timeline events.");
  assertTest(experimentalSignature.officialIsolatedReplayEventCount === 0, "no isolated replay event is inserted as official MatchEvent.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official final score must still derive from official score_change consequences.");
  assertTest(experimentalSignature.officialTimelineInjectionCount === 0, "isolated events injected into official timeline count must be 0.");
  assertTest(experimentalSignature.officialScoreMutationCount === 0, "official score mutation count must be 0.");
  assertTest(experimentalSignature.officialScoringEventMutationCount === 0, "official scoring event mutation count must be 0.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "real isolated replay must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "real isolated replay must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "real isolated replay must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "real isolated replay must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"), "limitations must forbid global route success mutation.");

  return [
    "default and experimental official final scores remain equal",
    "default and experimental official scoring event counts remain equal",
    "default and experimental official score_change totals remain equal",
    "official timeline event count remains equal",
    "no isolated replay event is inserted as official MatchEvent",
    "no production scoring events are deleted/capped/rewritten/fabricated",
    "no production scoring events are created by real isolated replay",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchRealIsolatedSegmentReplayScoringGuard();

  console.log("runFullMatchRealIsolatedSegmentReplayScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
