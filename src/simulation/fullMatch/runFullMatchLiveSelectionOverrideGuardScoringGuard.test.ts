import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchLiveSelectionOverrideGuardSignature } from "./fullMatchLiveSelectionOverrideGuardSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchLiveSelectionOverrideGuardSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchLiveSelectionOverrideGuardScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const experimentalSignature = fullMatchLiveSelectionOverrideGuardSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "override guard must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "override guard must not mutate scoring events.");
  assertTest(experimentalSignature.scoringEventCreationCount === 0, "override guard must not create scoring events.");
  assertTest(experimentalSignature.routeSuccessRateMutationCount === 0, "override guard must not mutate route success rates.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "override guard must not mutate production route resolution.");
  assertTest(experimentalSignature.normalLiveMiniMatchResolutionMutationCount === 0, "override guard must not mutate normal live mini-match resolution.");
  assertTest(!experimentalSignature.overrideAppliedToLiveSelection, "override guard must remain unapplied.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_SCORE"), "override guard limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_SCORING_EVENTS"), "override guard limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_CREATE_SCORING_EVENTS"), "override guard limitation must forbid scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES"), "override guard limitation must forbid route success mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION"), "override guard limitation must forbid production route resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_NORMAL_LIVE_MINIMATCH_RESOLUTION"), "override guard limitation must forbid normal live mini-match resolution.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("live_selection_override_guard_score_mutation_forbidden") &&
    fact.internalTags.includes("live_selection_override_guard_scoring_events_mutation_forbidden") &&
    fact.internalTags.includes("live_selection_override_guard_scoring_event_creation_forbidden") &&
    fact.internalTags.includes("live_selection_override_guard_route_success_mutation_forbidden") &&
    fact.internalTags.includes("live_selection_override_guard_production_resolution_forbidden") &&
    fact.internalTags.includes("live_selection_override_guard_normal_live_resolution_forbidden"),
  ), "override guard evidence must forbid score, scoring-event, route-success, production-resolution, normal-live-resolution, and scoring-event-creation mutation.");

  return [
    "default and experimental final scores remain equal",
    "default and experimental scoring event counts remain equal",
    "default and experimental score_change totals remain equal",
    "timeline event count remains equal or only metadata differs",
    "no scoring events are deleted/capped/rewritten/fabricated",
    "no new scoring events are created by override guard",
    "route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchLiveSelectionOverrideGuardScoringGuard();

  console.log("runFullMatchLiveSelectionOverrideGuardScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
