import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewDecisionGateWithoutPersistence8QModel,
  renderManualReviewPreviewDecisionGateWithoutPersistence8QValidation,
} from "./buildManualReviewPreviewDecisionGateWithoutPersistence8Q";
import { auditManualReviewPreviewDecisionGateNonPersistence8Q } from "./manualReviewPreviewDecisionGateAudit8Q";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateManualReviewPreviewDecisionGate8Q(): readonly string[] {
  const model = buildManualReviewPreviewDecisionGateWithoutPersistence8QModel();
  const validation = renderManualReviewPreviewDecisionGateWithoutPersistence8QValidation(model);
  const invalidBaseline = {
    ...model.baseline8P,
    status: "FAIL" as const,
  };
  const persistenceLeakAudit = auditManualReviewPreviewDecisionGateNonPersistence8Q({
    productHtml: '<section id="manual-review-preview-decision-gate-8q"><script>localStorage.setItem("gate", "leak")</script></section>',
    exportHtml: "",
  });

  assertTest(model.status === "PASS", "8Q model must pass.");
  assertTest(validation.includes("Status: PASS"), "8Q validation must pass.");
  assertTest(model.decisionGateReady, "8Q must render a decision gate from a valid 8P comparison.");
  assertTest(model.gateUses8PComparisonOnly, "8Q gate must read only the 8P comparison.");
  assertTest(model.invalidComparisonGateBlocked, "8Q gate must block invalid 8P comparisons.");
  assertTest(model.gateCardCount === 3, "8Q must create exactly three gate cards.");
  assertTest(model.gateCardsLinkedTo8PCount === 3, "all gate cards must link to 8P.");
  assertTest(model.gateCardsLinkedTo8OCount === 3, "all gate cards must link to 8O.");
  assertTest(model.gateCardsLinkedTo8NCount === 3, "all gate cards must link to 8N.");
  assertTest(model.gateCardsLinkedTo8MCount === 3, "all gate cards must link to 8M.");
  assertTest(model.gateCardsLinkedTo8LCount === 3, "all gate cards must link to 8L.");
  assertTest(model.gateCardsLinkedTo8KCount === 3, "all gate cards must link to 8K.");
  assertTest(model.decisionGate.gateCards[0]?.answerStatusFrom8P === "answers_question", "first 8P status must answer question.");
  assertTest(model.decisionGate.gateCards[0]?.gateStatus === "readable", "answers_question must become readable.");
  assertTest(model.decisionGate.gateCards[1]?.answerStatusFrom8P === "partially_answers_question", "second 8P status must be partial.");
  assertTest(model.decisionGate.gateCards[1]?.gateStatus === "needs_completion", "partially_answers_question must become needs_completion.");
  assertTest(model.decisionGate.gateCards[2]?.answerStatusFrom8P === "insufficient_to_answer", "third 8P status must be insufficient.");
  assertTest(model.decisionGate.gateCards[2]?.gateStatus === "insufficient", "insufficient_to_answer must become insufficient.");
  assertTest(model.globalGateStatus === "needs_completion", "fixture global gate must be needs_completion.");
  assertTest(model.logicAudit.globalGateStatusCorrect, "fixture global gate status must be correct.");
  assertTest(model.globalGateStatus !== "readable", "global gate must not be readable when one card is insufficient.");
  assertTest(model.gateMarkedDemoOnly, "8Q gate must be marked demo-only.");
  assertTest(model.gateMarkedNonOfficial, "8Q gate must be marked non-official.");
  assertTest(model.gateMarkedNotPersisted, "8Q gate must be marked not-persisted.");
  assertTest(model.gateMarkedNotApplied, "8Q gate must be marked not-applied.");
  assertTest(!model.decisionGate.officialTruth, "8Q gate must not create official truth.");
  assertTest(model.gateDoesNotDriveSelection, "8Q gate must not drive selection.");
  assertTest(model.gateDoesNotDriveTacticalInstruction, "8Q gate must not drive tactical instruction.");
  assertTest(!model.nonPersistenceAudit.gatePersistencePerformed, "8Q gate must perform no persistence.");
  assertTest(model.warningCodes.length === 0, `8Q warning codes must be empty: ${model.warningCodes.join(", ")}`);
  assertTest(model.gateDoesNotMutateScore, "8Q gate must not mutate score.");
  assertTest(model.gateDoesNotMutateTimeline, "8Q gate must not mutate timeline.");
  assertTest(model.gateDoesNotCreateScoreChange, "8Q gate must not create score_change.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.exportDecisionGateVisible, "export must contain the 8Q gate section.");
  assertTest(model.exportMetadataAudit.exportTitleMentions8Q, "export title must mention 8Q.");
  assertTest(model.exportMetadataAudit.exportVisibleBadgeMentions8Q, "export visible badge must mention 8Q.");
  assertTest(!model.exportMetadataAudit.exportMainIdStillCompressedExport8P, "export main id must no longer be compressed-export-8p.");
  assertTest(model.exportUnder900Seconds, "export must remain under 900 seconds.");
  assertTest(model.exportUnder800Seconds, "export should remain under 800 seconds.");
  assertTest(persistenceLeakAudit.localStoragePersistenceCount === 1, "localStorage gate leak must be counted.");
  assertTest(persistenceLeakAudit.gatePersistencePerformed, "detected persistence must set gatePersistencePerformed.");
  assertTest(
    (() => {
      try {
        buildManualReviewPreviewDecisionGateWithoutPersistence8QModel({ baseline8P: invalidBaseline });
        return false;
      } catch {
        return true;
      }
    })(),
    "invalid 8P comparison must be blocked.",
  );

  return [
    "8Q maps answers_question / partially_answers_question / insufficient_to_answer to readable / needs_completion / insufficient",
    "fixture global gate is needs_completion and not readable",
    "gate remains demo-only, non-official, non-persistent, and non-applied",
    "export metadata and main id are current for 8Q",
    "scoring constants, PENALTY_SHOT, MatchBonusEvent, score, and timeline remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewPreviewDecisionGate8Q();
  console.log("manualReviewPreviewDecisionGate8Q tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
