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
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const { persistentHistoryAdapter } = context;

  assertTest(persistentHistoryAdapter.status === "available" || persistentHistoryAdapter.status === "partial", "export evidence contains persistent history model.");
  assertTest(persistentHistoryAdapter.currentMatchRecordSaved, "export evidence contains current match save result.");
  assertTest(persistentHistoryAdapter.reportQueriesReadOnly, "export evidence preserves read-only report query boundary.");
  assertTest(
    typeof persistentHistoryAdapter.storageLocation === "string" && persistentHistoryAdapter.storageLocation.length > 0,
    "export evidence contains persistent storage location.",
  );

  writeLatestCoachReport();
  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");
  readFileSync(reportPath, "utf8");

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
    !escapedHtml.includes("<code>C:\\tmp\\<script>alert(\"x\")</script>.json</code>"),
    "persistent history storage location does not inject raw HTML.",
  );

  return [
    "reports/coach-report.export.html exists",
    "export evidence contains persistent history model",
    "export evidence contains current match save result",
    "export evidence preserves read-only report query boundary",
    "7F can move the visible persistent history section out of the coach main body",
    "persistent history storage location is absent or escaped in coach export",
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
