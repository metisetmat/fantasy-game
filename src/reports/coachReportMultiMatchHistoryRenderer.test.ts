import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistoryRenderer(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Historique des signaux compar") || html.includes("Historique des signaux compar&eacute;s"), "export must contain history section.");
  assertTest(html.includes("Cet historique d") || html.includes("Cet historique d&eacute;crit uniquement les &eacute;chantillons disponibles."), "export must contain local history guard.");
  assertTest(html.includes("Ce que l&rsquo;historique montre") || html.includes("Ce que l’historique montre"), "export must contain history reading.");
  assertTest(html.includes("Pourquoi on reste prudent"), "export must contain cautious copy.");
  assertTest(html.includes("&Agrave; v&eacute;rifier ensuite") || html.includes("À vérifier ensuite"), "export must contain next check.");
  assertTest(html.includes("D&eacute;tails de l&rsquo;historique multi-run") || html.includes("Détails de l’historique multi-run"), "export must contain history appendix.");

  return [
    "reports/coach-report.export.html exists",
    "export contains Historique des signaux compares",
    "export contains local history guard",
    "export contains Ce que l'historique montre",
    "export contains Pourquoi on reste prudent",
    "export contains A verifier ensuite",
    "export contains Details de l'historique multi-run",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistoryRenderer();
  console.log("coachReportMultiMatchHistoryRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
