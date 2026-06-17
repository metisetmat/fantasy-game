import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePhaseVisualLegendRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });

  assertTest(exportHtml.includes("L&eacute;gende des cartes terrain"), "export must contain the phase legend title.");
  assertTest(exportHtml.includes("Danger"), "export must contain the danger legend item.");
  assertTest(exportHtml.includes("R&eacute;cup&eacute;ration"), "export must contain the recovery legend item.");
  assertTest(exportHtml.includes("Pression / instabilit&eacute;"), "export must contain the pressure legend item.");
  assertTest(exportHtml.includes("Dernier rempart"), "export must contain the goalkeeper legend item.");
  assertTest(exportHtml.includes("Donn&eacute;e insuffisante"), "export must contain the insufficient-data legend item.");
  assertTest(exportHtml.includes("phase-legend-swatch"), "each legend item must expose a swatch.");
  assertTest(exportHtml.includes("Zone o&ugrave; le run a produit un signal offensif stabilis&eacute;."), "legend items must expose explanations.");

  return [
    "export contains Legende des cartes terrain",
    "danger legend is present",
    "recovery legend is present",
    "pressure and instability legend is present",
    "goalkeeper legend is present",
    "insufficient-data legend is present",
    "legend items include swatches",
    "legend items include explanations",
  ];
}

if (require.main === module) {
  const checks = validatePhaseVisualLegendRenderer();

  console.log("phaseVisualLegendRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
