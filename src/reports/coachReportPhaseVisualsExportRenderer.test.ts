import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualsExportRenderer(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("phase-pitch-grid"), "export HTML must contain a phase pitch grid.");
  assertTest(html.includes("report-phase-layout"), "export HTML must contain the phase layout.");
  assertTest(html.includes("phase-panel-reading"), "export HTML must contain phase readings.");
  assertTest(html.includes("Garde-fou visuel"), "export HTML must contain the visual guardrail card.");
  assertTest(html.includes("Les cartes terrain affichent uniquement les signaux stabilis") || html.includes("Les cartes terrain affichent uniquement les signaux"), "export HTML must contain the visible phase-visual guard.");

  return [
    "export HTML contains a phase pitch grid",
    "export HTML contains the phase layout",
    "export HTML contains phase readings",
    "export HTML contains the visual guardrail card",
    "export HTML contains the visible phase-visual guard",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualsExportRenderer();

  console.log("coachReportPhaseVisualsExportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
