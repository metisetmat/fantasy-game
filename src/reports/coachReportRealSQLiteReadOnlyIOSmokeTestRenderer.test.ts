import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealSQLiteReadOnlyIOSmokeTestRenderer(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const exportHtml = context.exportHtml;
  const model = context.realSQLiteReadOnlyIOSmokeTest;

  assertTest(model.status === "available", "export evidence must contain the 5H smoke test model.");
  assertTest(model.modeName === "real_sqlite_readonly_io_smoke_test", "export evidence must show the 5H mode name.");
  assertTest(model.storageTarget === "sqlite_local", "export evidence must show sqlite_local target.");
  assertTest(model.schemaVersion === "coach_match_history_v1", "export evidence must show coach_match_history_v1 schema.");
  assertTest(model.controlledRealDatabaseReadCount > 0, "export evidence must state real controlled SQLite read.");
  assertTest(model.defaultRealDatabaseReadCount === 0, "export evidence must show default real DB read count.");
  assertTest(model.realDatabaseWriteCount === 0, "export evidence must show DB write count.");
  assertTest(model.writeRejectedPass, "export evidence must show write rejection.");
  assertTest(model.queryByTeamPass, "export evidence must show query by team.");
  assertTest(model.queryByPhasePass, "export evidence must show query by phase.");
  assertTest(exportHtml.includes("real_sqlite_readonly_io_smoke_test") || exportHtml.includes("read-only mode"), "export must retain smoke test evidence.");

  return [
    "export evidence contains real SQLite read-only smoke test model",
    "export contains mode, target, schema, real read, and write rejection",
    "7F can move the visible smoke test section out of the coach main body",
  ];
}

const checks = validateCoachReportRealSQLiteReadOnlyIOSmokeTestRenderer();

console.log("coachReportRealSQLiteReadOnlyIOSmokeTestRenderer tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
