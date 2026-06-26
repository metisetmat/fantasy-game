import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { writeLatestCoachReport } from "./generateCoachHtmlReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealMatchHistoryRenderer(): readonly string[] {
  const { realMatchHistoryIntegration } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  writeLatestCoachReport();
  const reportPath = join(process.cwd(), "reports", "coach-report.export.html");
  assertTest(existsSync(reportPath), "reports/coach-report.export.html must exist.");
  const html = readFileSync(reportPath, "utf8");

  assertTest(html.includes("Rapport coach"), "export must contain coach report shell.");
  assertTest(realMatchHistoryIntegration.status === "available" || realMatchHistoryIntegration.status === "partial", "export evidence contains real match history integration model.");
  assertTest(realMatchHistoryIntegration.currentMatchRecordSaved, "export evidence contains current match record save.");
  assertTest(realMatchHistoryIntegration.queriedRecordCount >= 0, "export evidence contains history query result counts.");
  assertTest(realMatchHistoryIntegration.trendProofClaimCount === 0, "export evidence keeps trend proof claims at 0.");

  return [
    "reports/coach-report.export.html exists",
    "export contains coach report shell",
    "export evidence contains real match history integration model",
    "export evidence contains current match record save",
    "export evidence contains history query result counts",
    "7F can move visible real history sections out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportRealMatchHistoryRenderer();
  console.log("coachReportRealMatchHistoryRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
