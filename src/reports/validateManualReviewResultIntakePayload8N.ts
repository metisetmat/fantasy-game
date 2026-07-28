import type {
  ManualReviewBoundaryAcknowledgement8N,
  ManualReviewContextComparable8N,
  ManualReviewIntakeError8N,
  ManualReviewIntakeValidationResult8N,
  ManualReviewOutcomeValue8N,
  ManualReviewResultEntry8N,
  ManualReviewResultIntakePayload8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export const MANUAL_REVIEW_ACCEPTED_OUTCOMES_8N: readonly ManualReviewOutcomeValue8N[] = [
  "confirmed",
  "contradicted",
  "inconclusive",
  "insufficient_sample",
];

export const MANUAL_REVIEW_CONTEXT_COMPARABLE_VALUES_8N: readonly ManualReviewContextComparable8N[] = [
  "yes",
  "no",
  "uncertain",
];

export const MANUAL_REVIEW_KNOWN_LINKS_8N: readonly {
  readonly linked8MReviewSectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly observationTitle: string;
}[] = [
  {
    linked8MReviewSectionId: "manual-review-first-exit-after-recovery-8l",
    linked8LObservationCardId: "outcome-first-exit-after-recovery-8l",
    linked8KDecisionCardId: "decision-first-exit-after-recovery-8k",
    observationTitle: "Premiere sortie apres recuperation",
  },
  {
    linked8MReviewSectionId: "manual-review-danger-continuity-8l",
    linked8LObservationCardId: "outcome-danger-continuity-8l",
    linked8KDecisionCardId: "decision-danger-continuity-8k",
    observationTitle: "Continuite apres entree en zone dangereuse",
  },
  {
    linked8MReviewSectionId: "manual-review-structure-after-neutralized-action-8l",
    linked8LObservationCardId: "outcome-structure-after-neutralized-action-8l",
    linked8KDecisionCardId: "decision-structure-after-pressure-8k",
    observationTitle: "Structure apres action neutralisee",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function numberValue(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanValue(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function addError(
  errors: ManualReviewIntakeError8N[],
  errorCode: string,
  fieldPath: string,
  message: string,
  prevents: readonly ManualReviewIntakeError8N["prevents"][number][],
): void {
  errors.push({
    errorCode,
    fieldPath,
    message,
    severity: "blocking",
    prevents,
  });
}

function boundaryAcknowledgementComplete(value: unknown, errors: ManualReviewIntakeError8N[]): value is ManualReviewBoundaryAcknowledgement8N {
  if (!isRecord(value)) {
    addError(errors, "MISSING_BOUNDARY_ACKNOWLEDGEMENT", "boundaryAcknowledgement", "Boundary acknowledgement is required.", ["intake_acceptance"]);
    return false;
  }

  const keys: readonly (keyof ManualReviewBoundaryAcknowledgement8N)[] = [
    "noAutomaticClassificationAcknowledged",
    "noPersistenceAcknowledged",
    "noOfficialTruthAcknowledged",
    "noSelectionInstructionAcknowledged",
    "noTacticalInstructionAcknowledged",
    "noFutureEvidenceAcknowledged",
    "noScoreMutationAcknowledged",
    "noTimelineMutationAcknowledged",
  ];
  let complete = true;
  for (const key of keys) {
    if (value[key] !== true) {
      addError(errors, "MISSING_BOUNDARY_ACKNOWLEDGEMENT", `boundaryAcknowledgement.${key}`, `${key} must be true.`, ["intake_acceptance"]);
      complete = false;
    }
  }

  return complete;
}

function knownLinkFor(sectionId: string | null): (typeof MANUAL_REVIEW_KNOWN_LINKS_8N)[number] | null {
  return MANUAL_REVIEW_KNOWN_LINKS_8N.find((item) => item.linked8MReviewSectionId === sectionId) ?? null;
}

function validateEntry(value: unknown, index: number, errors: ManualReviewIntakeError8N[]): ManualReviewResultEntry8N | null {
  const path = `entries.${index}`;
  if (!isRecord(value)) {
    addError(errors, "ENTRY_NOT_OBJECT", path, "Entry must be an object.", ["intake_acceptance"]);
    return null;
  }

  const linked8MReviewSectionId = stringValue(value, "linked8MReviewSectionId");
  const known = knownLinkFor(linked8MReviewSectionId);
  if (known === null) {
    addError(errors, "UNKNOWN_LINKED_SECTION", `${path}.linked8MReviewSectionId`, "Linked 8M section is unknown.", ["intake_acceptance"]);
  }
  if (known !== null && value.linked8LObservationCardId !== known.linked8LObservationCardId) {
    addError(errors, "UNKNOWN_LINKED_8L_OBSERVATION", `${path}.linked8LObservationCardId`, "Linked 8L observation does not match the 8M section.", ["intake_acceptance"]);
  }
  if (known !== null && value.linked8KDecisionCardId !== known.linked8KDecisionCardId) {
    addError(errors, "UNKNOWN_LINKED_8K_DECISION", `${path}.linked8KDecisionCardId`, "Linked 8K decision does not match the 8M section.", ["intake_acceptance"]);
  }

  const selectedOutcome = stringValue(value, "selectedOutcome");
  if (!MANUAL_REVIEW_ACCEPTED_OUTCOMES_8N.includes(selectedOutcome as ManualReviewOutcomeValue8N)) {
    addError(errors, "INVALID_OUTCOME", `${path}.selectedOutcome`, "Selected outcome is not accepted by the 8N contract.", ["intake_acceptance"]);
  }

  const comparableSituationCount = numberValue(value, "comparableSituationCount");
  const positiveSignalCount = numberValue(value, "positiveSignalCount");
  const negativeSignalCount = numberValue(value, "negativeSignalCount");
  if (comparableSituationCount === null || comparableSituationCount < 0) {
    addError(errors, "INVALID_MANUAL_COUNT", `${path}.comparableSituationCount`, "Comparable situation count must be >= 0.", ["intake_acceptance"]);
  }
  if (positiveSignalCount === null || positiveSignalCount < 0) {
    addError(errors, "INVALID_MANUAL_COUNT", `${path}.positiveSignalCount`, "Positive signal count must be >= 0.", ["intake_acceptance"]);
  }
  if (negativeSignalCount === null || negativeSignalCount < 0) {
    addError(errors, "INVALID_MANUAL_COUNT", `${path}.negativeSignalCount`, "Negative signal count must be >= 0.", ["intake_acceptance"]);
  }

  const contextComparable = stringValue(value, "contextComparable");
  if (!MANUAL_REVIEW_CONTEXT_COMPARABLE_VALUES_8N.includes(contextComparable as ManualReviewContextComparable8N)) {
    addError(errors, "INVALID_CONTEXT_COMPARABLE", `${path}.contextComparable`, "Context comparable must be yes, no, or uncertain.", ["intake_acceptance"]);
  }

  const coachNotes = stringValue(value, "coachNotes") ?? "";
  const exampleToReview = stringValue(value, "exampleToReview") ?? "";
  if (selectedOutcome !== "insufficient_sample" && contextComparable === "no" && coachNotes.trim().length === 0 && exampleToReview.trim().length === 0) {
    addError(errors, "MISSING_MANUAL_CONTEXT", path, "Outcome needs comparable context or coach notes unless sample is insufficient.", ["intake_acceptance"]);
  }

  if (booleanValue(value, "cautionAcknowledged") !== true) {
    addError(errors, "CAUTION_NOT_ACKNOWLEDGED", `${path}.cautionAcknowledged`, "Caution must be acknowledged.", ["intake_acceptance"]);
  }
  if (booleanValue(value, "manualOnly") !== true) {
    addError(errors, "MANUAL_ONLY_NOT_TRUE", `${path}.manualOnly`, "Entry must remain manual only.", ["intake_acceptance"]);
  }
  if (booleanValue(value, "autoClassified") !== false) {
    addError(errors, "AUTO_CLASSIFIED_TRUE", `${path}.autoClassified`, "Manual input cannot be auto classified.", ["intake_acceptance", "auto_classification"]);
  }
  if (booleanValue(value, "officialTruth") !== false) {
    addError(errors, "OFFICIAL_TRUTH_TRUE", `${path}.officialTruth`, "Manual input cannot become official truth.", ["intake_acceptance", "official_truth_promotion"]);
  }
  if (booleanValue(value, "canDriveSelection") !== false) {
    addError(errors, "CAN_DRIVE_SELECTION_TRUE", `${path}.canDriveSelection`, "Manual input cannot drive selection.", ["intake_acceptance"]);
  }
  if (booleanValue(value, "canDriveTacticalInstruction") !== false) {
    addError(errors, "CAN_DRIVE_TACTICAL_INSTRUCTION_TRUE", `${path}.canDriveTacticalInstruction`, "Manual input cannot drive tactical instruction.", ["intake_acceptance"]);
  }
  if (booleanValue(value, "canCreateMemory") !== false) {
    addError(errors, "CAN_CREATE_MEMORY_TRUE", `${path}.canCreateMemory`, "Manual input cannot create memory.", ["intake_acceptance", "persistence"]);
  }

  if (errors.some((error) => error.fieldPath.startsWith(path))) {
    return null;
  }

  return {
    entryId: stringValue(value, "entryId") ?? `entry-${index + 1}`,
    linked8MReviewSectionId: known?.linked8MReviewSectionId ?? "",
    linked8LObservationCardId: known?.linked8LObservationCardId ?? "",
    linked8KDecisionCardId: known?.linked8KDecisionCardId ?? "",
    observationTitle: stringValue(value, "observationTitle") ?? known?.observationTitle ?? "",
    selectedOutcome: selectedOutcome as ManualReviewOutcomeValue8N,
    comparableSituationCount: comparableSituationCount ?? 0,
    positiveSignalCount: positiveSignalCount ?? 0,
    negativeSignalCount: negativeSignalCount ?? 0,
    contextComparable: contextComparable as ManualReviewContextComparable8N,
    coachNotes,
    exampleToReview,
    cautionAcknowledged: true,
    manualOnly: true,
    autoClassified: false,
    officialTruth: false,
    canDriveSelection: false,
    canDriveTacticalInstruction: false,
    canCreateMemory: false,
  };
}

function warningsForErrors(errors: readonly ManualReviewIntakeError8N[]): readonly ManualReviewResultIntakeBoundaryWarningCode8N[] {
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];
  const has = (code: string): boolean => errors.some((error) => error.errorCode === code);

  if (has("INVALID_OUTCOME")) warnings.push("INVALID_OUTCOME_ACCEPTED");
  if (has("INVALID_ENTRY_COUNT")) warnings.push("INVALID_ENTRY_COUNT_ACCEPTED");
  if (has("UNKNOWN_LINKED_SECTION")) warnings.push("UNKNOWN_LINKED_SECTION_ACCEPTED");
  if (has("AUTO_CLASSIFIED_TRUE")) warnings.push("AUTO_CLASSIFIED_ACCEPTED");
  if (has("OFFICIAL_TRUTH_TRUE")) warnings.push("OFFICIAL_TRUTH_ACCEPTED");
  if (has("INVALID_PERSISTENCE_INTENT")) warnings.push("PERSISTENCE_INTENT_ACCEPTED");
  if (has("SCORE_MUTATION_REQUESTED")) warnings.push("SCORE_MUTATION_ACCEPTED");
  if (has("TIMELINE_MUTATION_REQUESTED")) warnings.push("TIMELINE_MUTATION_ACCEPTED");
  if (has("SCORING_EVENT_CREATION_REQUESTED")) warnings.push("SCORING_EVENT_MUTATION_ACCEPTED");
  if (has("SEASON_MEMORY_REQUESTED")) warnings.push("SEASON_MEMORY_ACCEPTED");
  if (has("TEAM_STYLE_MEMORY_REQUESTED")) warnings.push("TEAM_STYLE_MEMORY_ACCEPTED");
  if (has("CAN_DRIVE_SELECTION_TRUE")) warnings.push("SELECTION_AUTOMATION_ACCEPTED");
  if (has("CAN_DRIVE_TACTICAL_INSTRUCTION_TRUE")) warnings.push("TACTICAL_INSTRUCTION_ACCEPTED");
  if (has("MISSING_BOUNDARY_ACKNOWLEDGEMENT")) warnings.push("MISSING_ACKNOWLEDGEMENT_ACCEPTED");

  return [...new Set(warnings)];
}

export function validateManualReviewResultIntakePayload8N(payload: unknown): ManualReviewIntakeValidationResult8N {
  const errors: ManualReviewIntakeError8N[] = [];
  const sourceBoundaryNotes = [
    "intake contract only",
    "validate/preview only, no persistence",
    "non-official coach review",
    "no selection/tactic automation",
  ];

  if (!isRecord(payload)) {
    addError(errors, "PAYLOAD_NOT_OBJECT", "payload", "Payload must be an object.", ["intake_acceptance"]);
  }

  const record = isRecord(payload) ? payload : {};
  if (record.sourceFormVersion !== "8M") addError(errors, "INVALID_SOURCE_FORM_VERSION", "sourceFormVersion", "sourceFormVersion must be 8M.", ["intake_acceptance"]);
  if (record.sourceTrackerVersion !== "8L") addError(errors, "INVALID_SOURCE_TRACKER_VERSION", "sourceTrackerVersion", "sourceTrackerVersion must be 8L.", ["intake_acceptance"]);
  if (record.sourceDecisionLayerVersion !== "8K") addError(errors, "INVALID_SOURCE_DECISION_LAYER_VERSION", "sourceDecisionLayerVersion", "sourceDecisionLayerVersion must be 8K.", ["intake_acceptance"]);
  if (record.createdBy !== "manual_coach_input") addError(errors, "INVALID_CREATED_BY", "createdBy", "createdBy must be manual_coach_input.", ["intake_acceptance"]);
  if (record.persistenceIntent !== "none") addError(errors, "INVALID_PERSISTENCE_INTENT", "persistenceIntent", "persistenceIntent must be none.", ["intake_acceptance", "persistence"]);
  if (record.applicationMode !== "validate_only" && record.applicationMode !== "preview_only") {
    addError(errors, "INVALID_APPLICATION_MODE", "applicationMode", "applicationMode must be validate_only or preview_only.", ["intake_acceptance"]);
  }
  if (record.officialTruthStatus !== "non_official_coach_review") {
    addError(errors, "INVALID_OFFICIAL_TRUTH_STATUS", "officialTruthStatus", "officialTruthStatus must remain non_official_coach_review.", ["intake_acceptance", "official_truth_promotion"]);
  }
  if (record.shouldMutateOfficialReport !== false) addError(errors, "OFFICIAL_REPORT_MUTATION_REQUESTED", "shouldMutateOfficialReport", "Official report mutation must be false.", ["intake_acceptance", "official_truth_promotion"]);
  if (record.shouldMutateScore !== false) addError(errors, "SCORE_MUTATION_REQUESTED", "shouldMutateScore", "Score mutation must be false.", ["intake_acceptance"]);
  if (record.shouldMutateTimeline !== false) addError(errors, "TIMELINE_MUTATION_REQUESTED", "shouldMutateTimeline", "Timeline mutation must be false.", ["intake_acceptance"]);
  if (record.shouldCreateScoringEvent !== false) addError(errors, "SCORING_EVENT_CREATION_REQUESTED", "shouldCreateScoringEvent", "Scoring event creation must be false.", ["intake_acceptance"]);
  if (record.shouldCreateSeasonMemory !== false) addError(errors, "SEASON_MEMORY_REQUESTED", "shouldCreateSeasonMemory", "Season memory creation must be false.", ["intake_acceptance", "persistence"]);
  if (record.shouldCreateTeamStyleMemory !== false) addError(errors, "TEAM_STYLE_MEMORY_REQUESTED", "shouldCreateTeamStyleMemory", "Team style memory creation must be false.", ["intake_acceptance", "persistence"]);

  const entries = Array.isArray(record.entries) ? record.entries : [];
  if (entries.length !== 3) {
    addError(errors, "INVALID_ENTRY_COUNT", "entries", "Exactly three manual review entries are required.", ["intake_acceptance"]);
  }

  const normalizedEntries = entries
    .map((entry, index) => validateEntry(entry, index, errors))
    .filter((entry): entry is ManualReviewResultEntry8N => entry !== null);
  const boundaryAcknowledgement = boundaryAcknowledgementComplete(record.boundaryAcknowledgement, errors)
    ? record.boundaryAcknowledgement
    : null;

  const status = errors.some((error) => error.severity === "blocking") ? "rejected" : "accepted_for_preview";
  const reviewedMatchId = stringValue(record, "reviewedMatchId");
  const reviewDate = stringValue(record, "reviewDate");
  const coachReviewerLabel = stringValue(record, "coachReviewerLabel");
  const normalizedPayloadBase = status === "accepted_for_preview" && boundaryAcknowledgement !== null
    ? {
      intakeId: stringValue(record, "intakeId") ?? "manual-intake-preview-8n",
      sourceFormVersion: "8M",
      sourceTrackerVersion: "8L",
      sourceDecisionLayerVersion: "8K",
      sourceMatchId: stringValue(record, "sourceMatchId") ?? "unknown",
      entries: normalizedEntries,
      boundaryAcknowledgement,
      createdBy: "manual_coach_input",
      persistenceIntent: "none",
      applicationMode: record.applicationMode as "validate_only" | "preview_only",
      officialTruthStatus: "non_official_coach_review",
      shouldMutateOfficialReport: false,
      shouldMutateScore: false,
      shouldMutateTimeline: false,
      shouldCreateScoringEvent: false,
      shouldCreateSeasonMemory: false,
      shouldCreateTeamStyleMemory: false,
    } satisfies Omit<ManualReviewResultIntakePayload8N, "reviewedMatchId" | "reviewDate" | "coachReviewerLabel">
    : undefined;
  const normalizedPayload = normalizedPayloadBase === undefined
    ? undefined
    : {
      ...normalizedPayloadBase,
      ...(reviewedMatchId === null ? {} : { reviewedMatchId }),
      ...(reviewDate === null ? {} : { reviewDate }),
      ...(coachReviewerLabel === null ? {} : { coachReviewerLabel }),
    } satisfies ManualReviewResultIntakePayload8N;

  const resultBase = {
    status,
    acceptedEntryCount: status === "accepted_for_preview" ? normalizedEntries.length : 0,
    rejectedEntryCount: status === "accepted_for_preview" ? 0 : Math.max(1, entries.length - normalizedEntries.length),
    warningCodes: warningsForErrors(errors),
    errors,
    rejectionReasons: errors.map((error) => `${error.errorCode}: ${error.message}`),
    sourceBoundaryNotes,
    officialTruthStatus: "non_official_coach_review",
    persistencePerformed: false,
    officialMutationPerformed: false,
    scoreMutationPerformed: false,
    timelineMutationPerformed: false,
    automaticClassificationPerformed: false,
  } satisfies Omit<ManualReviewIntakeValidationResult8N, "normalizedPayload">;

  return normalizedPayload === undefined
    ? resultBase
    : { ...resultBase, normalizedPayload };
}
