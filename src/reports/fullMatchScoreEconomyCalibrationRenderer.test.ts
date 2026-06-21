import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

export function validateFullMatchScoreEconomyCalibrationRenderer(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;
  const sectionHtml = html.slice(
    html.indexOf("Calibration &eacute;conomie du score"),
    html.indexOf("Profils a observer") > 0 ? html.indexOf("Profils a observer") : html.length,
  );
  const text = visibleText(sectionHtml);

  assertTest(html.includes("Calibration &eacute;conomie du score"), "export must contain score economy calibration section.");
  assertTest(html.includes("Score full-match avant calibration"), "export must show score before calibration.");
  assertTest(html.includes("Projection apr&egrave;s calibration"), "export must show projected score after calibration.");
  assertTest(text.includes("signal single-run"), "visible copy must frame the signal as single-run.");
  assertTest(text.includes("constantes inchang"), "visible copy must say scoring constants are unchanged.");
  assertTest(text.includes("aucun cap de score"), "visible copy must say no score cap.");
  assertTest(text.includes("score reste issu des"), "visible copy must say score comes from official events.");
  assertTest(!text.includes("preuve globale"), "visible copy must not claim global proof.");
  assertTest(!text.includes("tendance prouv"), "visible copy must not claim proved trend.");
  assertTest(!text.includes("score corrig"), "visible copy must not claim corrected score.");
  assertTest(!text.includes("score ajust"), "visible copy must not claim manually adjusted score.");
  assertTest(!text.includes("recommandation automatique de s"), "visible copy must not contain automatic selection recommendation.");

  return [
    "export contains full-match score economy calibration section",
    "visible copy states single-run, unchanged constants, no score cap, and official-event score source",
    "visible copy avoids global proof, proved trend, manual correction, and automatic selection wording",
  ];
}

const checks = validateFullMatchScoreEconomyCalibrationRenderer();

console.log("fullMatchScoreEconomyCalibrationRenderer tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
