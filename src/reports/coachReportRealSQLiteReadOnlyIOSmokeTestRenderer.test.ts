import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealSQLiteReadOnlyIOSmokeTestRenderer(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const exportHtml = context.exportHtml;

  assertTest(exportHtml.includes("Smoke test SQLite read-only"), "export must contain the 5H smoke test section.");
  assertTest(exportHtml.includes("real_sqlite_readonly_io_smoke_test"), "export must show the 5H mode name.");
  assertTest(exportHtml.includes("sqlite_local"), "export must show sqlite_local target.");
  assertTest(exportHtml.includes("coach_match_history_v1"), "export must show coach_match_history_v1 schema.");
  assertTest(exportHtml.includes("Vraie lecture SQLite contr&ocirc;l&eacute;e"), "export must state real controlled SQLite read.");
  assertTest(exportHtml.includes("Lecture DB r&eacute;elle mode d&eacute;faut"), "export must show default real DB read count.");
  assertTest(exportHtml.includes("Lecture DB r&eacute;elle mode contr&ocirc;l&eacute;"), "export must show controlled real DB read count.");
  assertTest(exportHtml.includes("&Eacute;criture DB"), "export must show DB write count.");
  assertTest(exportHtml.includes("Write rejected"), "export must show write rejection.");
  assertTest(exportHtml.includes("Query by team"), "export must show query by team.");
  assertTest(exportHtml.includes("Query by phase"), "export must show query by phase.");
  assertTest(exportHtml.includes("Details smoke test SQLite read-only") || exportHtml.includes("D&eacute;tails smoke test SQLite read-only"), "export must contain smoke test appendix.");

  return [
    "export contains real SQLite read-only smoke test section",
    "export contains mode, target, schema, real read, and write rejection",
    "export contains read-only smoke test appendix",
  ];
}

const checks = validateCoachReportRealSQLiteReadOnlyIOSmokeTestRenderer();

console.log("coachReportRealSQLiteReadOnlyIOSmokeTestRenderer tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
