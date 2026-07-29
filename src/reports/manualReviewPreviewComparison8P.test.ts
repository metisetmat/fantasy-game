import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel,
  renderManualReviewPreviewComparisonWithPreviousObservationPlan8PValidation,
} from "./buildManualReviewPreviewComparisonWithPreviousObservationPlan8P";
import { auditManualReviewPreviewComparisonNonPersistence8P } from "./manualReviewPreviewComparisonAudit8P";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewPreviewComparison8P(): readonly string[] {
  const model = buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel();
  const validation = renderManualReviewPreviewComparisonWithPreviousObservationPlan8PValidation(model);
  const persistenceLeakAudit = auditManualReviewPreviewComparisonNonPersistence8P({
    productHtml: '<section id="manual-review-preview-comparison-8p"><script>localStorage.setItem("comparison", "leak")</script></section>',
    exportHtml: "",
  });

  assertTest(
    model.status === "PASS",
    [
      "8P model must pass.",
      `status=${model.status}`,
      `warnings=${model.warningCodes.join(",") || "none"}`,
      `baseline8OStatus=${model.baseline8O.status}`,
      `exportReadTimeSecondsAfter8P=${model.exportBudgetAudit.exportReadTimeSecondsAfter8P}`,
      `exportUnder900=${model.exportUnder900Seconds}`,
      `exportUnder800=${model.exportUnder800Seconds}`,
      `wordingReadabilityScore=${model.wordingAudit.wordingReadabilityScore}`,
    ].join(" "),
  );
  assertTest(validation.includes("Status: PASS"), "8P validation must pass.");
  assertTest(model.comparisonCardCount === 3, "8P must render exactly three comparison cards.");
  assertTest(model.comparisonAnswersObservationQuestionCount === 1, "first card must answer one observation question.");
  assertTest(model.comparisonPartialAnswerCount === 1, "second card must partially answer one observation question.");
  assertTest(model.comparisonInsufficientAnswerCount === 1, "third card must remain insufficient.");
  assertTest(model.planCoverageAudit.firstExitAnswerStatus === "answers_question", "first exit status must answer question.");
  assertTest(model.planCoverageAudit.dangerContinuityAnswerStatus === "partially_answers_question", "danger continuity status must be partial.");
  assertTest(model.planCoverageAudit.structureAfterNeutralizedActionAnswerStatus === "insufficient_to_answer", "structure status must be insufficient.");
  assertTest(model.comparisonCardsLinkedTo8OCount === 3, "all comparison cards must link to 8O.");
  assertTest(model.comparisonCardsLinkedTo8NCount === 3, "all comparison cards must link to 8N.");
  assertTest(model.comparisonCardsLinkedTo8MCount === 3, "all comparison cards must link to 8M.");
  assertTest(model.comparisonCardsLinkedTo8LCount === 3, "all comparison cards must link to 8L.");
  assertTest(model.comparisonCardsLinkedTo8KCount === 3, "all comparison cards must link to 8K.");
  for (const card of model.comparison.comparisonCards) {
    assertTest(card.nextCoachQuestion.trim().endsWith("?"), "next coach prompt must be rendered as an actual question.");
  }
  assertTest(model.baseline8OPreserved, "8O preview renderer must remain visible.");
  assertTest(model.baseline8NPreserved, "8N intake boundary must remain visible.");
  assertTest(model.baseline8MPreserved, "8M manual form must remain visible.");
  assertTest(model.baseline8LPreserved, "8L learning loop must remain visible.");
  assertTest(model.baseline8KPreserved, "8K decision layer must remain visible.");
  assertTest(model.comparisonMarkedDemoOnly, "8P comparison must be marked demo only.");
  assertTest(model.comparisonMarkedNonOfficial, "8P comparison must be marked non-official.");
  assertTest(model.comparisonMarkedNotPersisted, "8P comparison must be marked not persisted.");
  assertTest(model.comparisonMarkedNotApplied, "8P comparison must be marked not applied.");
  assertTest(model.comparisonDoesNotAutoClassify, "8P comparison must not auto-classify.");
  assertTest(model.comparisonDoesNotDriveSelection, "8P comparison must not drive selection.");
  assertTest(model.comparisonDoesNotDriveTacticalInstruction, "8P comparison must not drive tactical instruction.");
  assertTest(model.comparisonDoesNotCreateMemory, "8P comparison must not create memory.");
  assertTest(model.comparisonDoesNotPromoteOfficialTruth, "8P comparison must not promote official truth.");
  assertTest(model.comparisonDoesNotMutateScore, "8P comparison must not mutate score.");
  assertTest(model.comparisonDoesNotMutateTimeline, "8P comparison must not mutate timeline.");
  assertTest(model.comparisonDoesNotCreateScoreChange, "8P comparison must not create score_change.");
  assertTest(model.exportMetadataAudit.exportTitleMentions8P, "export title must mention 8P.");
  assertTest(model.exportMetadataAudit.exportVisibleBadgeMentions8P, "export visible badge must mention 8P.");
  assertTest(model.exportMetadataAudit.exportMainComparisonVersionVisible, "export main must expose 8P comparison version.");
  assertTest(model.exportMetadataAudit.exportMainIdNoLonger8NOnly, "export main id must no longer be compressed-export-8n.");
  assertTest(model.exportMetadataAudit.exportMainIdNoLonger8IOnly, "export main id must no longer be compressed-export-8i.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.exportBudgetAudit.exportUnder800BooleanCorrect, "export under-800 budget flag must be computed honestly.");
  assertTest(model.numericThresholdGuardPreserved, "numeric threshold guard must remain honest.");
  assertTest(model.warningCodes.length === 0, `8P warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(persistenceLeakAudit.localStoragePersistenceCount === 1, "localStorage comparison leak must be counted.");
  assertTest(persistenceLeakAudit.comparisonPersistencePerformed, "detected persistence must set comparisonPersistencePerformed.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(model.baseline8O.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");

  return [
    "8P compares three 8O preview cards with the 8K/8L observation plan",
    "answer statuses are answers_question / partially_answers_question / insufficient_to_answer",
    "comparison remains demo-only, non-official, non-persistent, and non-applied",
    "export metadata and main id are current for 8P",
    "scoring constants, PENALTY_SHOT, MatchBonusEvent, score, and timeline remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewPreviewComparison8P();
  console.log("manualReviewPreviewComparison8P tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
