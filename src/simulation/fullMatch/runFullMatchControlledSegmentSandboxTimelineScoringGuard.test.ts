import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { controlledSegmentSandboxTimelineSignature } from "./controlledSegmentSandboxTimelineSignature";

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

export function validateRunFullMatchControlledSegmentSandboxTimelineScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = controlledSegmentSandboxTimelineSignature(defaultReport);
  const experimentalSignature = controlledSegmentSandboxTimelineSignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "controlled segment sandbox timeline must not mutate official home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "controlled segment sandbox timeline must not mutate official away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "controlled segment sandbox timeline must not mutate official scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "controlled segment sandbox timeline must not mutate official score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "controlled segment sandbox timeline must not add official timeline events.");
  assertTest(experimentalSignature.officialSandboxTimelineEventCount === 0, "no sandbox timeline event is inserted as official MatchEvent.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official final score must still derive from official score_change consequences.");
  assertTest(experimentalSignature.officialTimelineEventCreatedCount === 0, "sandbox timeline must not create official timeline events.");
  assertTest(experimentalSignature.officialTimelineMutationCount === 0, "official timeline mutation count must be 0.");
  assertTest(experimentalSignature.officialPossessionMutationCount === 0, "official possession mutation count must be 0.");
  assertTest(experimentalSignature.officialScoreMutationCount === 0, "official score mutation count must be 0.");
  assertTest(experimentalSignature.officialScoringEventMutationCount === 0, "official scoring event mutation count must be 0.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "sandbox timeline must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "sandbox timeline must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "sandbox timeline must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "sandbox timeline must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_DID_NOT_MUTATE_OFFICIAL_POSSESSION"), "limitations must forbid official possession mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_DID_NOT_MUTATE_OFFICIAL_TIMELINE"), "limitations must forbid official timeline mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");

  return [
    "default and experimental official final scores remain equal",
    "default and experimental official scoring event counts remain equal",
    "default and experimental official score_change totals remain equal",
    "official timeline event count remains equal",
    "no controlled segment sandbox timeline event is inserted as official MatchEvent",
    "no official possession, timeline, score, or scoring event is changed",
    "no production scoring events are created by controlled segment sandbox timeline",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchControlledSegmentSandboxTimelineScoringGuard();

  console.log("runFullMatchControlledSegmentSandboxTimelineScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
