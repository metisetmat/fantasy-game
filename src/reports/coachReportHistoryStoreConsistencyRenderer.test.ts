import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyRenderer(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Coh&eacute;rence du stockage"), "export renders history-store consistency section.");
  assertTest(exportHtml.includes("history-consistency-section"), "export renders consistency CSS hook.");
  assertTest(exportHtml.includes("Database adapter contract visible"), "export renders database contract note.");
  assertTest(exportHtml.includes("D&eacute;tails de coh&eacute;rence du stockage historique"), "export renders consistency appendix.");

  return [
    "export renders history-store consistency section",
    "export renders consistency CSS hook",
    "export renders database contract note",
    "export renders consistency appendix",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyRenderer();
  console.log("coachReportHistoryStoreConsistencyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
