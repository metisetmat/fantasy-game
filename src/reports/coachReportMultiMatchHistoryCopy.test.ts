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
  "démontré",
  "validé définitivement",
  "officiellement confirmé",
  "joueur recommandé",
  "à sélectionner",
  "titulaire conseillé",
  "remplacement conseillé",
  "composition recommandée",
  "sélection automatique",
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

export function validateCoachReportMultiMatchHistoryCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const visible = exportCoachReportMainVisibleText(exportHtml).toLocaleLowerCase("fr-FR");

  for (const term of forbiddenTerms) {
    assertTest(!visible.includes(term), `visible history copy must not contain ${term}.`);
  }

  return forbiddenTerms.map((term) => `visible copy does not contain ${term}`);
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistoryCopy();
  console.log("coachReportMultiMatchHistoryCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
