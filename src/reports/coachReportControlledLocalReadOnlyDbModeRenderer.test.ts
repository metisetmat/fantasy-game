import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportControlledLocalReadOnlyDbModeRenderer(): readonly string[] {
  const { exportHtml, controlledLocalReadOnlyDbMode: model } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(model.status === "available", "controlled read-only DB model must be available.");
  assertTest(model.modeName === "controlled_local_readonly_db", "export evidence must show controlled mode name.");
  assertTest(model.storageTarget === "sqlite_local", "export evidence must show sqlite_local target.");
  assertTest(model.schemaVersion === "coach_match_history_v1", "export evidence must show schema version.");
  assertTest(model.writeRejectedPass, "export evidence must show write rejection.");
  assertTest(model.realDatabaseReadCount === 0, "export evidence must show default real DB reads.");
  assertTest(exportHtml.includes("controlled_local_readonly_db") || exportHtml.includes("read-only mode"), "export must retain controlled read-only evidence.");

  return [
    "export evidence contains controlled local read-only DB model",
    "export evidence contains mode, target, schema, and write rejection",
    "export evidence contains default real DB read count",
    "7F can move the visible DB section out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbModeRenderer();
  console.log("coachReportControlledLocalReadOnlyDbModeRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
