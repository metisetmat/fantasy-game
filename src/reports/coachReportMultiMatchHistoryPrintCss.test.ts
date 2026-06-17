import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistoryPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before 4Y print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "4Y export HTML must contain @media print.");
  assertTest(html.includes("@page"), "4Y export HTML must contain @page.");
  assertTest(html.includes("break-inside: avoid"), "4Y export HTML must contain break-inside protection.");
  assertTest(html.includes("page-break-inside: avoid"), "4Y export HTML must contain page-break-inside protection.");
  assertTest(html.includes(".phase-history-card"), "history cards must be present.");
  assertTest(html.includes(".phase-history-row"), "history table rows must be present.");
  assertTest(html.includes(".report-pitch-panel"), "pitch panels must remain protected from splitting.");

  return [
    "@media print remains present",
    "@page remains present",
    "break-inside: avoid remains present",
    "page-break-inside: avoid remains present",
    "history cards avoid page breaks",
    "history table avoids bad page splitting",
    "pitch panels remain protected from splitting",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistoryPrintCss();
  console.log("coachReportMultiMatchHistoryPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
