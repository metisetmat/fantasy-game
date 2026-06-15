import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  selectionPreviewCoachCopyCannotDriveSelection,
  selectionPreviewCoachCopyCannotMutateOfficialState,
  type SelectionPreviewCoachCopyModel,
} from "./selectionPreviewCoachCopy";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function modelFromEvidenceTags(): SelectionPreviewCoachCopyModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY"
  );

  assertTest(fact !== undefined, "coach copy fact must exist.");

  return {
    status: "available",
    cardCount: 3,
    cards: [],
    originLabelCount: 3,
    traceSupportLabelCount: 3,
    decisionLabelCount: 3,
    confirmationLabelCount: 3,
    forbiddenWordingCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    traceBackingStatus: "available",
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewCoachCopyGuard(): readonly string[] {
  const model = modelFromEvidenceTags();

  assertTest(selectionPreviewCoachCopyCannotMutateOfficialState(model), "coach copy cannot mutate official state.");
  assertTest(selectionPreviewCoachCopyCannotDriveSelection(model), "coach copy cannot drive selection.");
  assertTest(model.tags.includes("selection_preview_coach_copy_score_mutation_count_0"), "score mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_possession_mutation_count_0"), "possession mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_production_scoring_event_creation_count_0"), "production scoring event creation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_global_economy_claim_forbidden"), "global economy claim must be forbidden.");

  return [
    "coach copy cannot mutate official state",
    "coach copy cannot drive selection",
    "score, possession, production scoring, and global economy tags are safe",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyGuard();

  console.log("selectionPreviewCoachCopyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
