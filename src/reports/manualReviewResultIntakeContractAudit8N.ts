import {
  MANUAL_REVIEW_ACCEPTED_OUTCOMES_8N,
  MANUAL_REVIEW_KNOWN_LINKS_8N,
  validateManualReviewResultIntakePayload8N,
} from "./validateManualReviewResultIntakePayload8N";
import type {
  ManualReviewIntakeValidationResult8N,
  ManualReviewResultIntakeContractAudit8N,
  ManualReviewResultIntakePayload8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export function buildValidManualReviewIntakePayloadFixture8N(sourceMatchId: string): ManualReviewResultIntakePayload8N {
  return {
    intakeId: "manual-intake-preview-fixture-8n",
    sourceFormVersion: "8M",
    sourceTrackerVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    sourceMatchId,
    reviewedMatchId: "future-reviewed-match-placeholder",
    reviewDate: "2026-07-28",
    coachReviewerLabel: "coach manual reviewer",
    entries: MANUAL_REVIEW_KNOWN_LINKS_8N.map((link, index) => ({
      entryId: `manual-review-entry-${index + 1}-8n`,
      linked8MReviewSectionId: link.linked8MReviewSectionId,
      linked8LObservationCardId: link.linked8LObservationCardId,
      linked8KDecisionCardId: link.linked8KDecisionCardId,
      observationTitle: link.observationTitle,
      selectedOutcome: index === 2 ? "inconclusive" : "confirmed",
      comparableSituationCount: index + 3,
      positiveSignalCount: index + 1,
      negativeSignalCount: index,
      contextComparable: index === 2 ? "uncertain" : "yes",
      coachNotes: "Manual fixture note for validation only.",
      exampleToReview: "Manual fixture example, not applied.",
      cautionAcknowledged: true,
      manualOnly: true,
      autoClassified: false,
      officialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      canCreateMemory: false,
    })),
    boundaryAcknowledgement: {
      noAutomaticClassificationAcknowledged: true,
      noPersistenceAcknowledged: true,
      noOfficialTruthAcknowledged: true,
      noSelectionInstructionAcknowledged: true,
      noTacticalInstructionAcknowledged: true,
      noFutureEvidenceAcknowledged: true,
      noScoreMutationAcknowledged: true,
      noTimelineMutationAcknowledged: true,
    },
    createdBy: "manual_coach_input",
    persistenceIntent: "none",
    applicationMode: "preview_only",
    officialTruthStatus: "non_official_coach_review",
    shouldMutateOfficialReport: false,
    shouldMutateScore: false,
    shouldMutateTimeline: false,
    shouldCreateScoringEvent: false,
    shouldCreateSeasonMemory: false,
    shouldCreateTeamStyleMemory: false,
  };
}

function clonePayload(payload: ManualReviewResultIntakePayload8N): ManualReviewResultIntakePayload8N {
  return JSON.parse(JSON.stringify(payload)) as ManualReviewResultIntakePayload8N;
}

export function buildInvalidManualReviewIntakePayloadFixtures8N(
  validPayload: ManualReviewResultIntakePayload8N,
): readonly { readonly fixtureId: string; readonly result: ManualReviewIntakeValidationResult8N }[] {
  const mutate = (
    fixtureId: string,
    change: (payload: Record<string, unknown>) => void,
  ): { readonly fixtureId: string; readonly result: ManualReviewIntakeValidationResult8N } => {
    const payload = clonePayload(validPayload) as unknown as Record<string, unknown>;
    change(payload);
    return { fixtureId, result: validateManualReviewResultIntakePayload8N(payload) };
  };

  return [
    mutate("unknown-outcome", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], selectedOutcome: "automatic_confirmed" };
    }),
    mutate("invalid-entry-count", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      payload.entries = entries.slice(0, 2);
    }),
    mutate("unknown-linked-section", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], linked8MReviewSectionId: "unknown-section" };
    }),
    mutate("auto-classified", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], autoClassified: true };
    }),
    mutate("official-truth", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], officialTruth: true };
    }),
    mutate("persistence-intent", (payload) => {
      payload.persistenceIntent = "database";
    }),
    mutate("score-mutation", (payload) => {
      payload.shouldMutateScore = true;
    }),
    mutate("timeline-mutation", (payload) => {
      payload.shouldMutateTimeline = true;
    }),
    mutate("scoring-event-mutation", (payload) => {
      payload.shouldCreateScoringEvent = true;
    }),
    mutate("season-memory", (payload) => {
      payload.shouldCreateSeasonMemory = true;
    }),
    mutate("team-style-memory", (payload) => {
      payload.shouldCreateTeamStyleMemory = true;
    }),
    mutate("selection-automation", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], canDriveSelection: true };
    }),
    mutate("tactical-instruction", (payload) => {
      const entries = payload.entries as Record<string, unknown>[];
      entries[0] = { ...entries[0], canDriveTacticalInstruction: true };
    }),
    mutate("missing-acknowledgement", (payload) => {
      payload.boundaryAcknowledgement = { noPersistenceAcknowledged: true };
    }),
  ];
}

function resultHasError(result: ManualReviewIntakeValidationResult8N, errorCode: string): boolean {
  return result.status === "rejected" && result.errors.some((error) => error.errorCode === errorCode);
}

export function auditManualReviewResultIntakeContract8N(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly validPayload: ManualReviewResultIntakePayload8N;
  readonly invalidResults: readonly { readonly fixtureId: string; readonly result: ManualReviewIntakeValidationResult8N }[];
  readonly validatorInputSnapshot: string;
  readonly validatorInputAfter: string;
}): ManualReviewResultIntakeContractAudit8N {
  const validResult = validateManualReviewResultIntakePayload8N(input.validPayload);
  const fixtureResult = (fixtureId: string): ManualReviewIntakeValidationResult8N =>
    input.invalidResults.find((fixture) => fixture.fixtureId === fixtureId)?.result ?? validResult;
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];
  const manualIntakeContractVisible = input.productHtml.includes("Frontiere d'entree des resultats manuels") &&
    input.exportHtml.includes("Frontiere de saisie manuelle");
  const productManualIntakeBoundaryVisible = input.productHtml.includes('id="manual-review-result-intake-boundary-8n"');
  const exportManualIntakeBoundaryVisible = input.exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"');
  const payloadContractDefined = input.validPayload.sourceFormVersion === "8M" &&
    input.validPayload.sourceTrackerVersion === "8L" &&
    input.validPayload.sourceDecisionLayerVersion === "8K";
  const entryContractDefined = input.validPayload.entries.length === 3;
  const boundaryAcknowledgementDefined = Object.values(input.validPayload.boundaryAcknowledgement).every((value) => value === true);
  const validationResultDefined = validResult.officialTruthStatus === "non_official_coach_review";
  const unknownOutcomeRejected = resultHasError(fixtureResult("unknown-outcome"), "INVALID_OUTCOME");
  const invalidEntryCountRejected = resultHasError(fixtureResult("invalid-entry-count"), "INVALID_ENTRY_COUNT");
  const unknownLinkedSectionRejected = resultHasError(fixtureResult("unknown-linked-section"), "UNKNOWN_LINKED_SECTION");
  const autoClassifiedRejected = resultHasError(fixtureResult("auto-classified"), "AUTO_CLASSIFIED_TRUE");
  const officialTruthRejected = resultHasError(fixtureResult("official-truth"), "OFFICIAL_TRUTH_TRUE");
  const persistenceIntentRejected = resultHasError(fixtureResult("persistence-intent"), "INVALID_PERSISTENCE_INTENT");
  const scoreMutationRejected = resultHasError(fixtureResult("score-mutation"), "SCORE_MUTATION_REQUESTED");
  const timelineMutationRejected = resultHasError(fixtureResult("timeline-mutation"), "TIMELINE_MUTATION_REQUESTED");
  const scoringEventMutationRejected = resultHasError(fixtureResult("scoring-event-mutation"), "SCORING_EVENT_CREATION_REQUESTED");
  const seasonMemoryRejected = resultHasError(fixtureResult("season-memory"), "SEASON_MEMORY_REQUESTED");
  const teamStyleMemoryRejected = resultHasError(fixtureResult("team-style-memory"), "TEAM_STYLE_MEMORY_REQUESTED");
  const selectionAutomationRejected = resultHasError(fixtureResult("selection-automation"), "CAN_DRIVE_SELECTION_TRUE");
  const tacticalInstructionRejected = resultHasError(fixtureResult("tactical-instruction"), "CAN_DRIVE_TACTICAL_INSTRUCTION_TRUE");
  const missingAcknowledgementRejected = resultHasError(fixtureResult("missing-acknowledgement"), "MISSING_BOUNDARY_ACKNOWLEDGEMENT");
  const linked8MIdsRequired = input.validPayload.entries.every((entry) => MANUAL_REVIEW_KNOWN_LINKS_8N.some((link) => link.linked8MReviewSectionId === entry.linked8MReviewSectionId));
  const linked8LIdsRequired = input.validPayload.entries.every((entry) => MANUAL_REVIEW_KNOWN_LINKS_8N.some((link) => link.linked8LObservationCardId === entry.linked8LObservationCardId));
  const linked8KIdsRequired = input.validPayload.entries.every((entry) => MANUAL_REVIEW_KNOWN_LINKS_8N.some((link) => link.linked8KDecisionCardId === entry.linked8KDecisionCardId));
  const noMutation = input.validatorInputSnapshot === input.validatorInputAfter;

  if (!manualIntakeContractVisible || !payloadContractDefined || !entryContractDefined || !boundaryAcknowledgementDefined) warnings.push("MANUAL_INTAKE_CONTRACT_MISSING");
  if (MANUAL_REVIEW_ACCEPTED_OUTCOMES_8N.length !== 4) warnings.push("ACCEPTED_OUTCOME_VALUES_INVALID");
  if (input.invalidResults.length < 8) warnings.push("REJECTED_OUTCOME_FIXTURES_INSUFFICIENT");
  if (validResult.status !== "accepted_for_preview") warnings.push("VALID_PAYLOAD_REJECTED");
  if (!unknownOutcomeRejected) warnings.push("INVALID_OUTCOME_ACCEPTED");
  if (!invalidEntryCountRejected) warnings.push("INVALID_ENTRY_COUNT_ACCEPTED");
  if (!unknownLinkedSectionRejected) warnings.push("UNKNOWN_LINKED_SECTION_ACCEPTED");
  if (!autoClassifiedRejected) warnings.push("AUTO_CLASSIFIED_ACCEPTED");
  if (!officialTruthRejected) warnings.push("OFFICIAL_TRUTH_ACCEPTED");
  if (!persistenceIntentRejected) warnings.push("PERSISTENCE_INTENT_ACCEPTED");
  if (!scoreMutationRejected) warnings.push("SCORE_MUTATION_ACCEPTED");
  if (!timelineMutationRejected) warnings.push("TIMELINE_MUTATION_ACCEPTED");
  if (!scoringEventMutationRejected) warnings.push("SCORING_EVENT_MUTATION_ACCEPTED");
  if (!seasonMemoryRejected) warnings.push("SEASON_MEMORY_ACCEPTED");
  if (!teamStyleMemoryRejected) warnings.push("TEAM_STYLE_MEMORY_ACCEPTED");
  if (!selectionAutomationRejected) warnings.push("SELECTION_AUTOMATION_ACCEPTED");
  if (!tacticalInstructionRejected) warnings.push("TACTICAL_INSTRUCTION_ACCEPTED");
  if (!missingAcknowledgementRejected) warnings.push("MISSING_ACKNOWLEDGEMENT_ACCEPTED");
  if (!noMutation) warnings.push("VALIDATOR_MUTATES_INPUT");

  return {
    manualIntakeContractVisible,
    productManualIntakeBoundaryVisible,
    exportManualIntakeBoundaryVisible,
    payloadContractDefined,
    entryContractDefined,
    boundaryAcknowledgementDefined,
    validationResultDefined,
    acceptedOutcomeValuesCount: MANUAL_REVIEW_ACCEPTED_OUTCOMES_8N.length,
    rejectedOutcomeFixturesCount: input.invalidResults.length,
    validPayloadAcceptedCount: validResult.status === "accepted_for_preview" ? 1 : 0,
    invalidRejectionCount: input.invalidResults.filter((fixture) => fixture.result.status === "rejected").length,
    unknownOutcomeRejected,
    invalidEntryCountRejected,
    unknownLinkedSectionRejected,
    autoClassifiedRejected,
    officialTruthRejected,
    persistenceIntentRejected,
    scoreMutationRejected,
    timelineMutationRejected,
    scoringEventMutationRejected,
    seasonMemoryRejected,
    teamStyleMemoryRejected,
    selectionAutomationRejected,
    tacticalInstructionRejected,
    missingAcknowledgementRejected,
    linked8MIdsRequired,
    linked8LIdsRequired,
    linked8KIdsRequired,
    manualOnlyRequired: input.validPayload.entries.every((entry) => entry.manualOnly),
    officialTruthFalseRequired: input.validPayload.entries.every((entry) => !entry.officialTruth),
    autoClassifiedFalseRequired: input.validPayload.entries.every((entry) => !entry.autoClassified),
    noPersistenceRequired: input.validPayload.persistenceIntent === "none",
    noMutationRequired: !input.validPayload.shouldMutateScore && !input.validPayload.shouldMutateTimeline && !input.validPayload.shouldCreateScoringEvent,
    validatorPureFunction: true,
    validatorMutationCount: noMutation ? 0 : 1,
    validatorPersistenceCount: 0,
    manualIntakeContractWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_INTAKE_CONTRACT" : "REPAIR_MANUAL_INTAKE_CONTRACT",
  };
}
