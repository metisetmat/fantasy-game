import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparisonRenderer(): readonly string[] {
  writeLatestCoachReport();

  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");

  const html = readFileSync(reportPath, "utf8");

  assertTest(
    html.includes("Stabilit&eacute; des signaux de phase") || html.includes("Stabilité des signaux de phase"),
    "export must contain Stabilité des signaux de phase.",
  );
  assertTest(
    html.includes("Signal r&eacute;p&eacute;t&eacute") || html.includes("Signal répété"),
    "export must contain Signal répété.",
  );
  assertTest(html.includes("Visible dans ce run"), "export must contain Visible dans ce run.");
  assertTest(
    html.includes("Signal instable") || html.includes("Donn&eacute;e insuffisante") || html.includes("Donnée insuffisante"),
    "export must contain unstable or insufficient state.",
  );
  assertTest(
    html.includes("Cette comparaison reste locale aux runs disponibles."),
    "export must contain the local comparison guard.",
  );
  assertTest(
    html.includes("D&eacute;tails de comparaison multi-run des phases") || html.includes("Détails de comparaison multi-run des phases"),
    "export must contain the multi-run appendix.",
  );

  return [
    "reports/coach-report.export.html exists",
    "export contains Stabilite des signaux de phase",
    "export contains Signal repete",
    "export contains Visible dans ce run",
    "export contains unstable or insufficient label",
    "export contains local comparison guard",
    "export contains Details de comparaison multi-run des phases",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonRenderer();

  console.log("coachReportMultiMatchPhaseComparisonRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
