import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualReadabilityExportRenderer(): readonly string[] {
  const { phaseReadability } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Rapport coach"), "export HTML must contain the coach report shell.");
  assertTest(phaseReadability.status === "available" || phaseReadability.status === "partial", "phase readability evidence must be available or partial.");
  assertTest(phaseReadability.panelCount >= 3, "phase readability evidence must contain phase panels.");
  assertTest(phaseReadability.legendItemCount === 5, "phase readability evidence must contain the phase legend.");
  assertTest(phaseReadability.controlledEmptyStateReadable, "phase readability evidence must keep controlled empty states readable.");

  return [
    "reports/coach-report.export.html exists",
    "export contains the coach report shell",
    "phase readability evidence is available or partial",
    "phase readability evidence contains phase panels",
    "phase readability evidence contains the phase legend",
    "7F can move visible phase readability details out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilityExportRenderer();

  console.log("coachReportPhaseVisualReadabilityExportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
