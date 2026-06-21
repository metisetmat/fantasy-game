import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportControlledLocalReadOnlyDbModeRenderer(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Lecture SQLite locale contr&ocirc;l&eacute;e"), "export must render controlled read-only DB section.");
  assertTest(exportHtml.includes("controlled-local-readonly-db-section"), "export must render controlled read-only CSS hook.");
  assertTest(exportHtml.includes("controlled_local_readonly_db"), "export must show controlled mode name.");
  assertTest(exportHtml.includes("sqlite_local"), "export must show sqlite_local target.");
  assertTest(exportHtml.includes("coach_match_history_v1"), "export must show schema version.");
  assertTest(exportHtml.includes("Write rejected pass"), "export must show write rejection.");
  assertTest(exportHtml.includes("Lectures DB r&eacute;elles mode d&eacute;faut"), "export must show default real DB reads.");
  assertTest(exportHtml.includes("D&eacute;tails lecture SQLite locale contr&ocirc;l&eacute;e"), "export must render appendix.");

  return [
    "export contains controlled local read-only DB section",
    "export contains mode, target, schema, and write rejection",
    "export contains default real DB read count",
    "export contains controlled read-only appendix",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbModeRenderer();
  console.log("coachReportControlledLocalReadOnlyDbModeRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
