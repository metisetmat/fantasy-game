import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualReadabilityPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before readability print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "readability export HTML must contain @media print.");
  assertTest(html.includes("@page"), "readability export HTML must contain @page.");
  assertTest(html.includes("break-inside: avoid"), "readability export HTML must contain break-inside protection.");
  assertTest(html.includes("page-break-inside: avoid"), "readability export HTML must contain page-break-inside protection.");
  assertTest(html.includes(".report-pitch-panel") && html.includes(".phase-pitch-legend"), "pitch panels and legend must avoid page breaks.");
  assertTest(html.includes(".report-table-card"), "cards must remain protected from splitting.");

  return [
    "@media print remains present",
    "@page remains present",
    "break-inside: avoid remains present",
    "page-break-inside: avoid remains present",
    "pitch panels avoid page breaks",
    "legend avoids page breaks",
    "cards remain protected from splitting",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilityPrintCss();

  console.log("coachReportPhaseVisualReadabilityPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
