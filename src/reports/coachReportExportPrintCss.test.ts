import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportExportPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "export HTML must contain @media print.");
  assertTest(html.includes("@page"), "export HTML must contain @page.");
  assertTest(html.includes("break-inside: avoid"), "export HTML must contain break-inside: avoid.");
  assertTest(html.includes("page-break-inside: avoid"), "export HTML must contain page-break-inside: avoid.");
  assertTest(html.includes(".no-print"), "export HTML must contain .no-print.");
  assertTest(html.includes(".product-card") && html.includes(".comparison-card") && html.includes(".matchup-card"), "cards must be protected from splitting.");
  assertTest(html.includes(".appendix"), "appendices must be protected from splitting.");
  assertTest(!html.includes("overflow-x: auto"), "no horizontal overflow helper must be required.");

  return [
    "export HTML contains @media print",
    "contains @page",
    "contains break-inside: avoid",
    "contains page-break-inside: avoid",
    "contains .no-print",
    "cards are protected from splitting",
    "appendices are protected from splitting",
    "no horizontal overflow helper is required",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportExportPrintCss();

  console.log("coachReportExportPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
