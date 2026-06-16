import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualsPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before phase visual print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "phase-visual export HTML must contain @media print.");
  assertTest(html.includes(".report-pitch-panel") && html.includes(".report-phase-section"), "phase visual cards must remain print-protected.");
  assertTest(html.includes(".phase-zone--danger"), "phase visual CSS must contain danger styling.");
  assertTest(html.includes(".phase-zone--goalkeeper"), "phase visual CSS must contain goalkeeper styling.");
  assertTest(html.includes("page-break-inside: avoid"), "phase visual export HTML must contain page-break protection.");

  return [
    "phase-visual export HTML contains @media print",
    "phase visual cards remain print-protected",
    "danger styling is present",
    "goalkeeper styling is present",
    "page-break protection is present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualsPrintCss();

  console.log("coachReportPhaseVisualsPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
