import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPersistentHistoryRenderer(): readonly string[] {
  writeLatestCoachReport();
  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");
  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Persistance de l&rsquo;historique") || html.includes("Persistance de l'historique"), "export must contain Persistance de l'historique.");
  assertTest(html.includes("L&rsquo;historique persistant sert") || html.includes("historique persistant sert"), "export must contain persistent history boundary guard.");
  assertTest(html.includes("Ce que la persistance ajoute"), "export must contain Ce que la persistance ajoute.");
  assertTest(html.includes("Ce qui reste volontairement limit"), "export must contain Ce qui reste volontairement limite.");
  assertTest(html.includes("Prochaine &eacute;tape produit") || html.includes("Prochaine etape produit"), "export must contain Prochaine etape produit.");
  assertTest(html.includes("D&eacute;tails de persistance de l&rsquo;historique") || html.includes("Details de persistance"), "export must contain persistent history appendix.");

  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const escapedHtml = renderCoachReportExportHtml({
    productReportHtml: context.productHtml,
    phaseReadability: context.phaseReadability,
    multiMatchPhaseComparison: context.comparison,
    multiMatchHistoryView: context.historyView,
    realMatchHistoryIntegration: context.realMatchHistoryIntegration,
    persistentHistoryAdapter: {
      ...context.persistentHistoryAdapter,
      storageLocation: `C:\\tmp\\<script>alert("x")</script>.json`,
      storageLocationVisible: true,
    },
  });
  assertTest(
    escapedHtml.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;.json"),
    "persistent history storage location is HTML-escaped.",
  );
  assertTest(
    !escapedHtml.includes("<code>C:\\tmp\\<script>alert(\"x\")</script>.json</code>"),
    "persistent history storage location does not inject raw HTML.",
  );

  return [
    "reports/coach-report.export.html exists",
    "export contains Persistance de l'historique",
    "export contains persistent history boundary guard",
    "export contains Ce que la persistance ajoute",
    "export contains Ce qui reste volontairement limite",
    "export contains Prochaine etape produit",
    "export contains Details de persistance de l'historique",
    "persistent history storage location is HTML-escaped",
    "persistent history storage location does not inject raw HTML",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPersistentHistoryRenderer();
  console.log("coachReportPersistentHistoryRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
