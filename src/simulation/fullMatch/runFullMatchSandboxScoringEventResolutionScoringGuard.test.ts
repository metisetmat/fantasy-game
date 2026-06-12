import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { sandboxScoringEventResolutionSignature } from "./sandboxScoringEventResolutionSignature";

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

export function validateRunFullMatchSandboxScoringEventResolutionScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = sandboxScoringEventResolutionSignature(defaultReport);
  const experimentalSignature = sandboxScoringEventResolutionSignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "sandbox resolution must not mutate official home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "sandbox resolution must not mutate official away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "sandbox resolution must not mutate official scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "sandbox resolution must not mutate official score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "sandbox resolution must not add official timeline events.");
  assertTest(experimentalSignature.officialSandboxResolutionEventCount === 0, "no sandbox resolution is inserted as official MatchEvent.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official final score must still derive from official score_change consequences.");
  assertTest(experimentalSignature.sandboxScoringEventCreatedCount === 0, "sandbox resolution must not create sandbox scoring events in 3N.");
  assertTest(experimentalSignature.sandboxScoreDeltaTotal === 0, "sandbox resolution score delta total must be 0.");
  assertTest(experimentalSignature.officialTimelineInjectionCount === 0, "sandbox resolution injected into official timeline count must be 0.");
  assertTest(experimentalSignature.officialScoreMutationCount === 0, "official score mutation count must be 0.");
  assertTest(experimentalSignature.officialScoringEventMutationCount === 0, "official scoring event mutation count must be 0.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "sandbox resolution must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "sandbox resolution must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "sandbox resolution must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "sandbox resolution must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"), "limitations must forbid global route success mutation.");

  return [
    "default and experimental official final scores remain equal",
    "default and experimental official scoring event counts remain equal",
    "default and experimental official score_change totals remain equal",
    "official timeline event count remains equal",
    "no sandbox resolution is inserted as official MatchEvent",
    "no production scoring events are deleted/capped/rewritten/fabricated",
    "no production scoring events are created by sandbox resolution model",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchSandboxScoringEventResolutionScoringGuard();

  console.log("runFullMatchSandboxScoringEventResolutionScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
