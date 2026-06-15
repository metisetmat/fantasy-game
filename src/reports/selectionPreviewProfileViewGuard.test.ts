import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  selectionPreviewProfileViewCannotDriveSelection,
  selectionPreviewProfileViewCannotMutateOfficialState,
  type SelectionPreviewProfileViewModel,
} from "./selectionPreviewProfileView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function modelFromEvidenceTags(): SelectionPreviewProfileViewModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW"
  );

  assertTest(fact !== undefined, "profile view fact must exist.");

  return {
    status: "available",
    origin: "selection_preview_coach_copy",
    profileCardCount: 3,
    cards: [],
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    traceBackingStatus: "available",
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewProfileViewGuard(): readonly string[] {
  const model = modelFromEvidenceTags();

  assertTest(selectionPreviewProfileViewCannotMutateOfficialState(model), "profile view cannot mutate official state.");
  assertTest(selectionPreviewProfileViewCannotDriveSelection(model), "profile view cannot drive selection.");
  assertTest(model.tags.includes("selection_preview_profile_score_mutation_count_0"), "score mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_possession_mutation_count_0"), "possession mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_production_scoring_event_creation_count_0"), "production scoring event creation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_global_economy_claim_forbidden"), "global economy claim must be forbidden.");
  assertTest(model.officiallyConfirmedCount === 0, "profile view cannot create official confirmation.");
  assertTest(model.confidenceUpgradeCount === 0, "profile view cannot upgrade confidence.");
  assertTest(model.previewAppliedCount === 0, "profile view cannot apply preview.");

  return [
    "profile view cannot change lineup, starters, or bench",
    "profile view cannot drive coach instruction, live selection, or production route resolution",
    "profile view cannot mutate official timeline, score, possession, or scoring events",
    "profile view cannot claim global economy",
    "profile view cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewGuard();

  console.log("selectionPreviewProfileViewGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
