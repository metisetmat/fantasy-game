import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const FORBIDDEN_COPY: readonly string[] = [
  "preuve statistique",
  "preuve globale",
  "certitude",
  "dÃ©montrÃ©",
  "validÃ© dÃ©finitivement",
  "officiellement confirmÃ©",
  "joueur recommandÃ©",
  "Ã  sÃ©lectionner",
  "titulaire conseillÃ©",
  "remplacement conseillÃ©",
  "composition recommandÃ©e",
  "sÃ©lection automatique",
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
];

function visibleDatabaseMigrationCopy(exportHtml: string): string {
  const start = exportHtml.indexOf("Pr&eacute;paration migration historique");
  const end = exportHtml.indexOf("D&eacute;tails de pr&eacute;paration migration database");
  return start === -1 ? "" : exportHtml.slice(start, end === -1 ? undefined : end);
}

export function validateCoachReportDatabaseMigrationCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const visibleCopy = visibleDatabaseMigrationCopy(exportHtml).toLowerCase();

  for (const forbidden of FORBIDDEN_COPY) {
    assertTest(!visibleCopy.includes(forbidden.toLowerCase()), `visible copy does not contain ${forbidden}.`);
  }

  return FORBIDDEN_COPY.map((fragment) => `visible copy does not contain ${fragment}`);
}

if (require.main === module) {
  const checks = validateCoachReportDatabaseMigrationCopy();
  console.log("coachReportDatabaseMigrationCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
