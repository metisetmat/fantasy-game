import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDurableStorageDecisionRenderer(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("D&eacute;cision stockage durable"), "export contains durable storage decision section.");
  assertTest(exportHtml.includes("Storage target selected") && exportHtml.includes("sqlite_local"), "export contains sqlite_local target.");
  assertTest(exportHtml.includes("Schema version") && exportHtml.includes("coach_match_history_v1"), "export contains schema version.");
  assertTest(exportHtml.includes("Real adapter wiring prepared"), "export contains adapter wiring prepared.");
  assertTest(exportHtml.includes("D&eacute;tails d&eacute;cision stockage durable"), "export contains durable storage appendix.");
  assertTest(exportHtml.includes("previous migration SPI"), "export clarifies legacy migration SPI wording.");

  return [
    "export contains durable storage section",
    "export contains sqlite_local and schema version",
    "export contains appendix and legacy wording clarification",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDurableStorageDecisionRenderer();
  console.log("coachReportDurableStorageDecisionRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
