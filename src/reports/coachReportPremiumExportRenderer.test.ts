import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPremiumExportRenderer(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("report-cover"), "export HTML must contain report-cover.");
  assertTest(html.includes("report-scoreboard"), "export HTML must contain report-scoreboard.");
  assertTest(html.includes("report-section-divider"), "export HTML must contain report-section-divider.");
  assertTest(html.includes("report-kpi-grid"), "export HTML must contain report-kpi-grid.");
  assertTest(html.includes("Avec ballon"), "export HTML must contain Avec ballon.");
  assertTest(html.includes("Sans ballon"), "export HTML must contain Sans ballon.");
  assertTest(html.includes("Dernier rempart"), "export HTML must contain Dernier rempart.");
  assertTest(html.includes("Profils"), "export HTML must contain Profils a observer.");
  assertTest(html.includes("Joueurs"), "export HTML must contain Joueurs a etudier.");
  assertTest(html.includes("&Agrave; v&eacute;rifier au prochain match") || html.includes("prochain match"), "export HTML must contain next-match section.");
  assertTest(html.includes("D&eacute;tails du layout premium HTML"), "export HTML must contain premium layout appendix.");

  return [
    "reports/coach-report.export.html exists",
    "contains report-cover",
    "contains report-scoreboard",
    "contains report-section-divider",
    "contains report-kpi-grid",
    "contains Avec ballon",
    "contains Sans ballon",
    "contains Dernier rempart",
    "contains Profils a observer",
    "contains Joueurs a etudier",
    "contains A verifier au prochain match",
    "contains Details du layout premium HTML",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumExportRenderer();

  console.log("coachReportPremiumExportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
