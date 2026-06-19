import { exportCoachReportMainVisibleText } from "./coachReportExportSnapshot";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenTerms = [
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
] as const;

export function validateCoachReportRealMatchHistoryCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const visible = exportCoachReportMainVisibleText(exportHtml).toLocaleLowerCase("fr-FR");

  for (const term of forbiddenTerms) {
    assertTest(!visible.includes(term), `visible real-history copy must not contain ${term}.`);
  }

  return forbiddenTerms.map((term) => `visible copy does not contain ${term}`);
}

if (require.main === module) {
  const checks = validateCoachReportRealMatchHistoryCopy();
  console.log("coachReportRealMatchHistoryCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

