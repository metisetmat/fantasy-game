import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualReadabilityExportRenderer(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Avec ballon"), "export HTML must contain Avec ballon.");
  assertTest(html.includes("Sans ballon"), "export HTML must contain Sans ballon.");
  assertTest(html.includes("Dernier rempart"), "export HTML must contain Dernier rempart.");
  assertTest(html.includes("L&eacute;gende des cartes terrain"), "export HTML must contain the phase legend.");
  assertTest(html.includes("Les cartes terrain affichent uniquement les signaux stabilis") || html.includes("Les cartes terrain affichent uniquement les signaux"), "export HTML must contain the phase-specific guard.");
  assertTest(html.includes("La couleur et l'intensit&eacute; des zones servent"), "export HTML must contain the non-prescriptive color/intensity guard.");
  assertTest(html.includes("D&eacute;tails de lisibilit&eacute; des visualisations par phase"), "export HTML must contain the readability appendix.");

  return [
    "reports/coach-report.export.html exists",
    "export contains Avec ballon",
    "export contains Sans ballon",
    "export contains Dernier rempart",
    "export contains Legende des cartes terrain",
    "export contains phase-specific guard",
    "export contains color-intensity non-prescriptive guard",
    "export contains Details de lisibilite des visualisations par phase",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilityExportRenderer();

  console.log("coachReportPhaseVisualReadabilityExportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
