import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Coh&eacute;rence du stockage"), "visible copy names storage consistency.");
  assertTest(exportHtml.includes("aucune mutation du score"), "visible copy says score cannot mutate.");
  assertTest(exportHtml.includes("implemented=false"), "visible copy marks database adapter unimplemented.");
  assertTest(!exportHtml.includes("officially_confirmed"), "visible copy does not promote official confirmation.");

  return [
    "visible copy names storage consistency",
    "visible copy says score cannot mutate",
    "visible copy marks database adapter unimplemented",
    "visible copy does not promote official confirmation",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyCopy();
  console.log("coachReportHistoryStoreConsistencyCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
