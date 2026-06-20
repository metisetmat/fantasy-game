import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDatabaseMigrationRenderer(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Pr&eacute;paration migration historique"), "coach-report.export.html contains preparation migration historique.");
  assertTest(exportHtml.includes("Cette migration est un dry run"), "export contains migration dry-run guard.");
  assertTest(exportHtml.includes("Ce que la migration pr&eacute;pare"), "export contains Ce que la migration prepare.");
  assertTest(exportHtml.includes("Ce qui reste volontairement limit&eacute;"), "export contains Ce qui reste volontairement limite.");
  assertTest(exportHtml.includes("Prochaine &eacute;tape produit"), "export contains Prochaine etape produit.");
  assertTest(exportHtml.includes("D&eacute;tails de pr&eacute;paration migration database"), "export contains database migration appendix.");

  return [
    "coach-report.export.html contains Preparation migration historique",
    "export contains migration dry-run guard",
    "export contains Ce que la migration prepare",
    "export contains Ce qui reste volontairement limite",
    "export contains Prochaine etape produit",
    "export contains Details de preparation migration database",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationRenderer();
  console.log("coachReportDatabaseMigrationRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
