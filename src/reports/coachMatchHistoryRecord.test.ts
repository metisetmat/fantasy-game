import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachMatchHistoryRecord(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const timelineBefore = JSON.stringify(report.timeline);
  const scoreBefore = `${report.score.home}-${report.score.away}`;
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "simulated_match_history",
    runId: "record-test",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });

  assertTest(record.matchId === report.matchId, "history record preserves match id.");
  assertTest(record.homeTeamId === report.teamStats[0]?.teamId, "history record preserves home team.");
  assertTest(record.awayTeamId === report.teamStats[1]?.teamId, "history record preserves away team.");
  assertTest(record.scoreHome === report.score.home && record.scoreAway === report.score.away, "history record preserves score.");
  assertTest(record.signals.length > 0, "history record contains phase signals when available.");
  assertTest(JSON.stringify(report.timeline) === timelineBefore, "history record build does not mutate official timeline.");
  assertTest(`${report.score.home}-${report.score.away}` === scoreBefore, "history record build does not mutate official score.");
  assertTest(!record.canCreateScoringEvent, "history record cannot create scoring events.");
  assertTest(!record.canDriveLiveSelection && !record.canDriveProductionRouteResolution, "history record cannot drive selection or route resolution.");

  return [
    "history record builds from a match report",
    "record preserves match id",
    "record preserves teams",
    "record preserves score",
    "record contains phase signals when available",
    "record does not mutate official timeline",
    "record does not mutate official score",
    "record does not create scoring events",
    "record cannot drive selection or route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachMatchHistoryRecord();
  console.log("coachMatchHistoryRecord tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

