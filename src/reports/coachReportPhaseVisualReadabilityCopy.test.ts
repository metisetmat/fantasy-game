import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { exportCoachReportMainVisibleText } from "./coachReportExportSnapshot";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenTerms = [
  "meilleur choix",
  "joueur recommande",
  "a selectionner",
  "titulaire conseille",
  "remplacement conseille",
  "composition recommandee",
  "selection automatique",
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

export function validateCoachReportPhaseVisualReadabilityCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });
  const visible = exportCoachReportMainVisibleText(exportHtml).toLocaleLowerCase("fr-FR");

  for (const term of forbiddenTerms) {
    assertTest(!visible.includes(term), `visible readability copy must not contain ${term}.`);
  }

  return forbiddenTerms.map((term) => `visible copy does not contain ${term}`);
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilityCopy();

  console.log("coachReportPhaseVisualReadabilityCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
