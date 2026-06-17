import { exportCoachReportMainVisibleText } from "./coachReportExportSnapshot";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenTerms = [
  "preuve globale",
  "certitude",
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

export function validateCoachReportMultiMatchPhaseComparisonCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const visible = exportCoachReportMainVisibleText(exportHtml).toLocaleLowerCase("fr-FR");

  for (const term of forbiddenTerms) {
    assertTest(!visible.includes(term), `visible comparison copy must not contain ${term}.`);
  }

  return forbiddenTerms.map((term) => `visible copy does not contain ${term}`);
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonCopy();

  console.log("coachReportMultiMatchPhaseComparisonCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
