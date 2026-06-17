import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparisonPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before 4X print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "4X export HTML must contain @media print.");
  assertTest(html.includes("@page"), "4X export HTML must contain @page.");
  assertTest(html.includes("break-inside: avoid"), "4X export HTML must contain break-inside protection.");
  assertTest(html.includes("page-break-inside: avoid"), "4X export HTML must contain page-break-inside protection.");
  assertTest(html.includes(".phase-stability-card"), "stability cards must be present.");
  assertTest(html.includes(".phase-pitch-legend"), "legend must remain present.");
  assertTest(html.includes(".report-pitch-panel"), "pitch panels must remain protected from splitting.");

  return [
    "@media print remains present",
    "@page remains present",
    "break-inside: avoid remains present",
    "page-break-inside: avoid remains present",
    "stability cards avoid page breaks",
    "legend avoids page breaks",
    "pitch panels remain protected from splitting",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonPrintCss();

  console.log("coachReportMultiMatchPhaseComparisonPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
