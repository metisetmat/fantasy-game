import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewRenderer8OModel,
  buildManualReviewPreviewPayloadFixture8O,
  resolveManualReviewPreviewRendererStatus8O,
} from "./buildManualReviewPreviewRenderer8O";
import { auditManualReviewPreviewNonPersistence8O } from "./manualReviewPreviewNonPersistenceAudit8O";
import { validateManualReviewResultIntakePayload8N } from "./validateManualReviewResultIntakePayload8N";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function validateManualReviewPreviewRenderer8O(): readonly string[] {
  const fixture = buildManualReviewPreviewPayloadFixture8O("test-match-8o");
  const beforeValidation = JSON.stringify(fixture);
  const validResult = validateManualReviewResultIntakePayload8N(fixture);
  const afterValidation = JSON.stringify(fixture);
  const invalidFixture = cloneRecord(fixture) as unknown as Record<string, unknown>;
  invalidFixture.sourceMatchId = "";
  const invalidResult = validateManualReviewResultIntakePayload8N(invalidFixture);
  const model = buildManualReviewPreviewRenderer8OModel();
  const persistenceLeakAudit = auditManualReviewPreviewNonPersistence8O({
    productHtml: '<section id="manual-review-preview-renderer-8o"><script>localStorage.setItem("review", "leak")</script></section>',
    exportHtml: "",
  });
  const derivedBlockingStatus = resolveManualReviewPreviewRendererStatus8O({
    failureWarnings: [],
    derivedFailureWarnings: ["SCORE_MANIPULATION_DETECTED"],
    exportUnder900Seconds: true,
    wordingReadabilityScore: 96,
  });

  assertTest(validResult.status === "accepted_for_preview", "valid 8N payload must render in preview.");
  assertTest(invalidResult.status === "rejected", "invalid 8N payload must be blocked before preview.");
  assertTest(beforeValidation === afterValidation, "8N validation before preview must not mutate input.");
  assertTest(model.previewAudit.validPayloadValidatedBeforeRender, "validator 8N must be called before render.");
  assertTest(model.previewCards.length === 3, "three preview cards must be created.");
  for (const card of model.previewCards) {
    assertTest(card.linked8NEntryId.length > 0, "preview card must link to 8N entry.");
    assertTest(card.linked8MReviewSectionId.length > 0, "preview card must link to 8M review section.");
    assertTest(card.linked8LObservationCardId.length > 0, "preview card must link to 8L observation card.");
    assertTest(card.linked8KDecisionCardId.length > 0, "preview card must link to 8K decision card.");
    assertTest(card.nonOfficialBadge, "preview card must be non-official.");
    assertTest(card.notPersistedBadge, "preview card must be not persisted.");
    assertTest(card.notAppliedBadge, "preview card must be not applied.");
    assertTest(!card.officialTruth, "preview card must not create official truth.");
    assertTest(!card.canDriveSelection, "preview card must not drive selection.");
    assertTest(!card.canDriveTacticalInstruction, "preview card must not drive tactical instruction.");
  }
  assertTest(model.nonPersistenceAudit.localStoragePersistenceCount === 0, "preview must not use localStorage.");
  assertTest(model.nonPersistenceAudit.databasePersistenceCount === 0, "preview must not use database persistence.");
  assertTest(model.nonPersistenceAudit.filePersistenceCount === 0, "preview must not use file persistence.");
  assertTest(model.nonPersistenceAudit.backendSubmitActionCount === 0, "preview must not create backend submit.");
  assertTest(!model.nonPersistenceAudit.previewPersistencePerformed, "preview persistence must be false.");
  assertTest(!model.nonPersistenceAudit.previewApplicationPerformed, "preview application must be false.");
  assertTest(persistenceLeakAudit.localStoragePersistenceCount === 1, "localStorage persistence leak must be counted.");
  assertTest(persistenceLeakAudit.previewPersistencePerformed, "detected persistence must set previewPersistencePerformed.");
  assertTest(model.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore, "preview must not mutate score.");
  assertTest(model.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline, "preview must not mutate timeline.");
  assertTest(model.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange, "preview must not create score_change.");
  assertTest(derivedBlockingStatus === "FAIL", "derived blocking warnings must fail the 8O status.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.exportHtmlAfter8O.includes("Preview revue manuelle"), "export must include preview section.");
  assertTest(model.exportHtmlAfter8O.includes("<title>Rapport coach export compact 8O"), "export title must mention 8O.");
  assertTest(model.exportBudgetAudit.exportVisibleBadgeMentions8O, "visible export badge must mention 8O.");
  assertTest(model.version === "MANUAL_REVIEW_PREVIEW_RENDERER_8O", "share pack sprint model must be 8O.");

  return [
    "valid 8N payload renders a non-persistent preview",
    "invalid payload is blocked before render",
    "three preview cards stay linked to 8N/8M/8L/8K",
    "preview cannot persist, apply, mutate score/timeline, or create official truth",
    "derived blocking warnings fail the model status",
    "scoring constants and MatchBonusEvent remain unchanged",
    "export metadata and visible preview section mention 8O",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewPreviewRenderer8O();
  console.log("manualReviewPreviewRenderer8O tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
