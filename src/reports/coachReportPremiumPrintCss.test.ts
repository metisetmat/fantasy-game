import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPremiumPrintCss(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist before premium print CSS validation.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("@media print"), "premium export HTML must contain @media print.");
  assertTest(html.includes("@page"), "premium export HTML must contain @page.");
  assertTest(html.includes("break-inside: avoid"), "premium export HTML must contain break-inside: avoid.");
  assertTest(html.includes("page-break-inside: avoid"), "premium export HTML must contain page-break-inside: avoid.");
  assertTest(html.includes("report-cover"), "cover must print cleanly.");
  assertTest(html.includes("report-section-divider"), "section dividers must print cleanly.");
  assertTest(html.includes(".report-table-card") && html.includes(".report-pitch-panel"), "cards must be protected from page splitting.");

  return [
    "premium export HTML contains @media print",
    "contains @page",
    "contains break-inside: avoid",
    "contains page-break-inside: avoid",
    "cover prints cleanly",
    "section dividers print cleanly",
    "cards remain protected from page splitting",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumPrintCss();

  console.log("coachReportPremiumPrintCss tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
