import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyPrintCss(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes(".history-consistency-section"), "consistency section CSS exists.");
  assertTest(exportHtml.includes(".history-consistency-grid"), "consistency grid CSS exists.");
  assertTest(exportHtml.includes(".history-consistency-card"), "consistency card CSS exists.");
  assertTest(exportHtml.includes("page-break-inside: avoid"), "print CSS avoids splitting consistency cards.");

  return [
    "consistency section CSS exists",
    "consistency grid CSS exists",
    "consistency card CSS exists",
    "print CSS avoids splitting consistency cards",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyPrintCss();
  console.log("coachReportHistoryStoreConsistencyPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
