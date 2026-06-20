import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseAdapterSpikeRenderer(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Adapter database exp&eacute;rimental"), "export contains experimental database adapter section.");
  assertTest(exportHtml.includes("Ce que le spike valide"), "export contains what the spike validates.");
  assertTest(exportHtml.includes("Ce qui reste d&eacute;sactiv&eacute;"), "export contains what remains disabled.");
  assertTest(exportHtml.includes("Prochaine &eacute;tape produit"), "export contains next product step.");
  assertTest(exportHtml.includes("D&eacute;tails adapter database exp&eacute;rimental"), "export contains experimental database adapter appendix.");

  return [
    "export contains experimental database adapter section",
    "export contains spike validation, disabled-state, next-step, and appendix sections",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseAdapterSpikeRenderer();
  console.log("coachReportDatabaseAdapterSpikeRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
