import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { exportCoachReportMainVisibleText } from "./coachReportExportSnapshot";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenTerms = [
  "meilleur choix",
  "joueur recommandé",
  "recommandé",
  "à sélectionner",
  "titulaire conseillé",
  "remplacement conseillé",
  "composition recommandée",
  "sélection automatique",
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

export function validateCoachReportExportCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });
  const visible = exportCoachReportMainVisibleText(exportHtml).toLocaleLowerCase("fr-FR");

  for (const term of forbiddenTerms) {
    assertTest(!visible.includes(term.toLocaleLowerCase("fr-FR")), `visible export copy must not contain ${term}.`);
  }

  return [
    "visible copy does not contain meilleur choix",
    "visible copy does not contain joueur recommandé",
    "visible copy does not contain recommandé",
    "visible copy does not contain à sélectionner",
    "visible copy does not contain titulaire conseillé",
    "visible copy does not contain remplacement conseillé",
    "visible copy does not contain composition recommandée",
    "visible copy does not contain sélection automatique",
    "visible copy does not contain officially_confirmed",
    "visible copy does not contain trace_supported",
    "visible copy does not contain sandbox_only",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportExportCopy();

  console.log("coachReportExportCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
