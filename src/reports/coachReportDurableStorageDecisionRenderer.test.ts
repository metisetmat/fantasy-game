import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDurableStorageDecisionRenderer(): readonly string[] {
  const { exportHtml, durableStorageDecision } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(durableStorageDecision.status === "available", "export evidence contains durable storage decision model.");
  assertTest(durableStorageDecision.selectedStorageTarget === "sqlite_local", "export evidence contains sqlite_local target.");
  assertTest(durableStorageDecision.schemaVersion === "coach_match_history_v1", "export evidence contains schema version.");
  assertTest(durableStorageDecision.realAdapterWiringPrepared, "export evidence contains adapter wiring prepared.");
  assertTest(durableStorageDecision.legacyMigrationWordingClarified, "export evidence clarifies legacy migration SPI wording.");
  assertTest(exportHtml.includes("coach_report_durable_storage_decision") || exportHtml.includes("sqlite_local"), "export retains durable storage evidence.");

  return [
    "export evidence contains durable storage decision model",
    "export evidence contains sqlite_local and schema version",
    "7F can move the visible durable storage section out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDurableStorageDecisionRenderer();
  console.log("coachReportDurableStorageDecisionRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
