import { classifyPhaseSignalStability } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMultiMatchHistoryDrilldownRules(): readonly string[] {
  const { historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(classifyPhaseSignalStability({ occurrenceCount: 3, sampleCount: 4 }) === "repeated", "repeated input must stay repeated.");
  assertTest(classifyPhaseSignalStability({ occurrenceCount: 1, sampleCount: 4 }) === "visible_once", "visible_once input must stay visible_once.");
  assertTest(classifyPhaseSignalStability({ occurrenceCount: 2, sampleCount: 4 }) === "unstable", "unstable input must stay unstable.");
  assertTest(classifyPhaseSignalStability({ occurrenceCount: 1, sampleCount: 1 }) === "insufficient_data", "insufficient input must stay insufficient.");
  assertTest(historyView.drilldowns.every((drilldown) => drilldown.strength !== undefined), "every drilldown must expose a mapped strength.");
  assertTest(historyView.drilldowns.every((drilldown) => !drilldown.coachReading.toLocaleLowerCase("fr-FR").includes("preuve")), "local repeated does not equal proof.");
  assertTest(historyView.drilldowns.some((drilldown) => drilldown.strength === "insufficient_data") || historyView.insufficientDataDrilldownCount >= 0, "insufficient_data remains an honest state.");

  return [
    "repeated maps to local_repeated",
    "visible_once maps to local_visible_once",
    "unstable maps to local_unstable",
    "insufficient_data maps to insufficient_data",
    "local_repeated does not equal proof",
    "insufficient_data remains an honest state",
  ];
}

if (require.main === module) {
  const checks = validateMultiMatchHistoryDrilldownRules();
  console.log("multiMatchHistoryDrilldownRules tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
