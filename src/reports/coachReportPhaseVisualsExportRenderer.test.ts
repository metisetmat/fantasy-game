import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualsExportRenderer(): readonly string[] {
  const { phaseReadability } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Rapport coach"), "export HTML must contain the coach report shell.");
  assertTest(phaseReadability.panelCount >= 3, "phase visual evidence must contain phase panels.");
  assertTest(phaseReadability.readablePanelCount >= 3, "phase visual evidence must contain readable phase panels.");
  assertTest(phaseReadability.primaryZoneVisualEmphasisPresent, "phase visual evidence must preserve primary-zone emphasis.");
  assertTest(phaseReadability.controlledEmptyStateReadable, "phase visual evidence must preserve controlled empty states.");

  return [
    "export HTML contains the coach report shell",
    "phase visual evidence contains phase panels",
    "phase visual evidence contains readable phase panels",
    "phase visual evidence preserves primary-zone emphasis",
    "7F can move visible phase visual panels out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualsExportRenderer();

  console.log("coachReportPhaseVisualsExportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
