import { traceCauseLabelFr, traceImpactLabelFr } from "./traceAggregateCoachLabels";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateTraceAggregateCoachLabels(): readonly string[] {
  assertTest(traceCauseLabelFr("pressure_forced_error") === "erreurs provoquÃ©es par la pression", "pressure cause label must be readable.");
  assertTest(traceCauseLabelFr("lack_of_support") === "manque de soutien", "support cause label must be readable.");
  assertTest(traceCauseLabelFr("goalkeeper_quality") === "qualitÃ© du gardien", "goalkeeper cause label must be readable.");
  assertTest(traceImpactLabelFr("danger_created") === "danger crÃ©Ã©", "danger impact label must be readable.");
  assertTest(traceImpactLabelFr("possession_lost") === "possession perdue", "possession impact label must be readable.");
  assertTest(traceImpactLabelFr("unknown_custom_tag") === "unknown custom tag", "unknown labels must fall back safely.");
  assertTest(!traceCauseLabelFr("pressure_forced_error").includes("_"), "visible cause labels should avoid internal underscores.");
  assertTest(!traceImpactLabelFr("danger_created").includes("_"), "visible impact labels should avoid internal underscores.");

  return [
    "cause tags map to French readable labels",
    "impact tags map to French readable labels",
    "unknown tags fall back safely",
    "visible labels avoid internal jargon where possible",
  ];
}

if (require.main === module) {
  const checks = validateTraceAggregateCoachLabels();

  console.log("traceAggregateCoachLabels tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

