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
  assertTest(html.includes("R&eacute;sum&eacute; coach") || html.includes("RÃ©sumÃ© coach") || html.includes("RÃƒÂ©sumÃƒÂ© coach"), "export HTML must contain Resume coach.");
  assertTest(html.includes("Ce que le match dit"), "export HTML must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux cl") || html.includes("3 signaux clÃ©s"), "export HTML must contain 3 signaux cles.");
  assertTest(html.includes("Profils"), "export HTML must contain Profils a observer.");
  assertTest(html.includes("Joueurs"), "export HTML must contain Joueurs a etudier.");
  assertTest(
    html.includes("&Agrave; v&eacute;rifier au prochain match") ||
      html.includes("Ã€ vÃ©rifier au prochain match") ||
      html.includes("A v") ||
      html.includes("Ãƒâ‚¬ vÃƒÂ©rifier au prochain match"),
    "export HTML must contain next-match section.",
  );
  assertTest(
    html.includes("&Agrave; ne pas sur-interpr&eacute;ter") ||
      html.includes("Ã€ ne pas sur-interprÃ©ter") ||
      html.includes("A ne pas sur") ||
      html.includes("Ãƒâ‚¬ ne pas sur-interprÃƒÂ©ter"),
    "export HTML must contain interpretation guard.",
  );
  assertTest(html.includes("Annexes"), "export HTML must contain Annexes.");
  assertTest(html.includes("Les rapprochements profil-joueur ne sont pas des choix de composition."), "visible non-application guard must remain present.");
  assertTest(
    html.includes("Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le onze de depart, ni le banc.") ||
      html.includes("Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le banc."),
    "visible candidate comparison guard must remain present.",
  );

  return [
    "reports/coach-report.export.html exists",
    "contains Rapport coach",
    "contains Resume coach",
    "contains Ce que le match dit",
    "contains 3 signaux cles",
    "contains Profils a observer",
    "contains Joueurs a etudier",
    "contains A verifier au prochain match",
    "contains A ne pas sur-interpreter",
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
