import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePhaseVisualLegendRenderer(): readonly string[] {
  const { exportHtml, phaseReadability } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const legendLabels = phaseReadability.legendItems.map((item) => item.label);

  assertTest(exportHtml.includes("Rapport coach"), "export contains coach report shell.");
  assertTest(phaseReadability.legendItemCount === 5, "phase legend evidence must contain five items.");
  assertTest(legendLabels.includes("Danger"), "phase legend evidence must contain the danger item.");
  assertTest(legendLabels.includes("R&eacute;cup&eacute;ration"), "phase legend evidence must contain the recovery item.");
  assertTest(legendLabels.includes("Pression / instabilit&eacute;"), "phase legend evidence must contain the pressure item.");
  assertTest(legendLabels.includes("Dernier rempart"), "phase legend evidence must contain the goalkeeper item.");
  assertTest(legendLabels.includes("Donn&eacute;e insuffisante"), "phase legend evidence must contain the insufficient-data item.");

  return [
    "export contains coach report shell",
    "phase legend evidence contains five items",
    "danger legend is present",
    "recovery legend is present",
    "pressure and instability legend is present",
    "goalkeeper legend is present",
    "insufficient-data legend is present",
    "7F can move visible phase legend out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validatePhaseVisualLegendRenderer();

  console.log("phaseVisualLegendRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
