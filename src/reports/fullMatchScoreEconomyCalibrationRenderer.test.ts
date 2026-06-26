import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchScoreEconomyCalibrationRenderer(): readonly string[] {
  const { exportHtml, fullMatchScoreEconomyCalibration } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Rapport coach"), "export contains coach report shell.");
  assertTest(fullMatchScoreEconomyCalibration.singleRunOnly, "score economy evidence frames the signal as single-run.");
  assertTest(!fullMatchScoreEconomyCalibration.scoringConstantsChanged, "score economy evidence keeps scoring constants unchanged.");
  assertTest(!fullMatchScoreEconomyCalibration.scoreCapApplied, "score economy evidence applies no score ceiling.");
  assertTest(!fullMatchScoreEconomyCalibration.postHocScoreRewriteApplied, "score economy evidence applies no manual score rewrite.");
  assertTest(fullMatchScoreEconomyCalibration.globalEconomyClaimCount === 0, "score economy evidence avoids global proof claims.");
  assertTest(fullMatchScoreEconomyCalibration.trendProofClaimCount === 0, "score economy evidence avoids proved-trend claims.");

  return [
    "export contains coach report shell",
    "score economy evidence states single-run, unchanged constants, no score ceiling, and no manual rewrite",
    "score economy evidence avoids global proof and proved-trend claims",
  ];
}

const checks = validateFullMatchScoreEconomyCalibrationRenderer();

console.log("fullMatchScoreEconomyCalibrationRenderer tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
