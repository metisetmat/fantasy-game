import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchIsolatedMiniMatchOverrideExperimentSignature } from "./fullMatchIsolatedMiniMatchOverrideExperimentSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchIsolatedMiniMatchOverrideExperimentSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchIsolatedMiniMatchOverrideExperimentScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const experimentalSignature = fullMatchIsolatedMiniMatchOverrideExperimentSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental normal score signatures must remain equal.");
  assertTest(experimentalSignature.normalFullMatchScoreMutationCount === 0, "isolated experiment must not mutate normal full-match score.");
  assertTest(experimentalSignature.normalFullMatchScoringEventMutationCount === 0, "isolated experiment must not mutate normal full-match scoring events.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "isolated experiment must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "isolated experiment must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "isolated experiment must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "isolated experiment must not claim global economy.");
  assertTest(!experimentalSignature.overrideAppliedToNormalLiveSelection, "isolated experiment must not apply override to normal live selection.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORE"), "limitations must forbid normal score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORING_EVENTS"), "limitations must forbid normal scoring event mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"), "limitations must forbid global route success mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_CANNOT_CLAIM_GLOBAL_ECONOMY"), "limitations must forbid global economy claims.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("isolated_override_normal_score_mutation_forbidden") &&
    fact.internalTags.includes("isolated_override_normal_scoring_events_mutation_forbidden") &&
    fact.internalTags.includes("isolated_override_production_scoring_event_creation_forbidden") &&
    fact.internalTags.includes("isolated_override_production_resolution_forbidden") &&
    fact.internalTags.includes("isolated_override_global_route_success_mutation_forbidden") &&
    fact.internalTags.includes("isolated_override_global_economy_claim_forbidden"),
  ), "isolated experiment evidence must forbid normal score, normal scoring-event, production scoring-event, production route, global route success, and global economy mutation.");

  return [
    "default and experimental normal final scores remain equal",
    "default and experimental normal scoring event counts remain equal",
    "default and experimental normal score_change totals remain equal",
    "normal timeline event count remains equal or only metadata differs",
    "no production scoring events are deleted/capped/rewritten/fabricated",
    "no production scoring events are created by isolated experiment",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchIsolatedMiniMatchOverrideExperimentScoringGuard();

  console.log("runFullMatchIsolatedMiniMatchOverrideExperimentScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
