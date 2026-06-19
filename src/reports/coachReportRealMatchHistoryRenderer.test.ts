import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealMatchHistoryRenderer(): readonly string[] {
  writeLatestCoachReport();
  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");
  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Historique produit des matchs"), "export must contain real match history section.");
  assertTest(html.includes("Cet historique pr") || html.includes("reste local et en lecture seule"), "export must contain history boundary guard.");
  assertTest(html.includes("Ce que l&rsquo;historique ajoute") || html.includes("Ce que l'historique ajoute"), "export must contain added value copy.");
  assertTest(html.includes("Ce qui reste limit"), "export must contain limits copy.");
  assertTest(html.includes("&Agrave; pr&eacute;parer c&ocirc;t&eacute; produit") || html.includes("A preparer cote produit"), "export must contain product preparation copy.");
  assertTest(html.includes("D&eacute;tails du stockage d&rsquo;historique des matchs") || html.includes("Details du stockage d"), "export must contain history store appendix.");

  return [
    "reports/coach-report.export.html exists",
    "export contains Historique produit des matchs",
    "export contains history boundary guard",
    "export contains Ce que l'historique ajoute",
    "export contains Ce qui reste limite",
    "export contains A preparer cote produit",
    "export contains Details du stockage d'historique des matchs",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportRealMatchHistoryRenderer();
  console.log("coachReportRealMatchHistoryRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

