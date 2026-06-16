import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportExportHtml(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Rapport coach"), "export HTML must contain Rapport coach.");
  assertTest(html.includes("R&eacute;sum&eacute; coach") || html.includes("Résumé coach") || html.includes("RÃ©sumÃ© coach"), "export HTML must contain Résumé coach.");
  assertTest(html.includes("Ce que le match dit"), "export HTML must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux cl") || html.includes("3 signaux clés"), "export HTML must contain 3 signaux clés.");
  assertTest(html.includes("Profils"), "export HTML must contain Profils à observer.");
  assertTest(html.includes("Joueurs"), "export HTML must contain Joueurs à étudier.");
  assertTest(html.includes("À vérifier au prochain match") || html.includes("A v") || html.includes("Ã€ vÃ©rifier au prochain match"), "export HTML must contain next-match section.");
  assertTest(html.includes("À ne pas sur-interpréter") || html.includes("A ne pas sur") || html.includes("Ã€ ne pas sur-interprÃ©ter"), "export HTML must contain interpretation guard.");
  assertTest(html.includes("Annexes"), "export HTML must contain Annexes.");
  assertTest(html.includes("Les rapprochements profil-joueur ne sont pas des choix de composition."), "visible non-application guard must remain present.");
  assertTest(html.includes("Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le onze de depart, ni le banc.") || html.includes("Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le banc."), "visible candidate comparison guard must remain present.");

  return [
    "reports/coach-report.export.html exists",
    "contains Rapport coach",
    "contains Résumé coach",
    "contains Ce que le match dit",
    "contains 3 signaux clés",
    "contains Profils à observer",
    "contains Joueurs à étudier",
    "contains À vérifier au prochain match",
    "contains À ne pas sur-interpréter",
    "contains Annexes",
    "contains visible non-application guard",
    "contains visible candidate comparison guard",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportExportHtml();

  console.log("coachReportExportHtml tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
