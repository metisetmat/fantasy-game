import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReportHistoryScopeAudit {
  readonly historyMainBodySectionCount: number;
  readonly historyTechnicalMainBodySectionCount: number;
  readonly persistenceMainBodySectionCount: number;
  readonly databaseMainBodySectionCount: number;
  readonly calibrationMainBodySectionCount: number;
  readonly historyAppendixSectionCount: number;
  readonly multiMatchCoachSectionCount: number;
  readonly historyDumpVisibleCount: number;
  readonly recordDumpVisibleCount: number;
  readonly databaseDetailVisibleCount: number;
  readonly sqliteDetailVisibleCount: number;
  readonly historyScopeClean: boolean;
  readonly historyScopeWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_HISTORY_SCOPE_CLEAN" | "MOVE_HISTORY_DETAILS_TO_APPENDIX";
}

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function mainBody(html: string): string {
  return stripDetails(html)
    .replace(/<head[\s\S]*?<\/head>/giu, "")
    .replace(/<script[\s\S]*?<\/script>/giu, "")
    .replace(/<style[\s\S]*?<\/style>/giu, "")
    .replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "")
    .replace(/<section\s+id="technical-appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function stripAllowedTrendSection(html: string): string {
  return html.replace(/<section\s+id="multi-match-trend-signals"[\s\S]*?<\/section>/giu, "");
}

function count(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReportHistoryScope(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportHistoryScopeAudit {
  const main = `${mainBody(input.productReportHtml)}\n${mainBody(input.exportReportHtml)}`;
  const technicalMain = stripAllowedTrendSection(main);
  const full = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const multiMatchCoachSectionCount = (main.match(/id="multi-match-trend-signals"/giu) ?? []).length;
  const historyMainBodySectionCount = multiMatchCoachSectionCount;
  const persistenceMainBodySectionCount = count(technicalMain, /<section[^>]*>[\s\S]*?(persistence|persistent|storage|history store|match history)[\s\S]*?<\/section>/giu);
  const databaseMainBodySectionCount = count(technicalMain, /<section[^>]*>[\s\S]*?(database|sqlite|adapter|migration)[\s\S]*?<\/section>/giu);
  const calibrationMainBodySectionCount = count(technicalMain, /<section[^>]*id="[^"]*(?:calibration|score-economy|scoring-family)[^"]*"[\s\S]*?<\/section>/giu);
  const historyTechnicalMainBodySectionCount = persistenceMainBodySectionCount + databaseMainBodySectionCount + calibrationMainBodySectionCount;
  const historyAppendixSectionCount = count(full.replace(main, ""), /history store|historique technique|match history/giu);
  const historyDumpVisibleCount = count(technicalMain, /history store|historique technique|match history record|record dump/giu);
  const recordDumpVisibleCount = count(technicalMain, /\{\s*"matchId"|"records"\s*:/giu);
  const databaseDetailVisibleCount = count(technicalMain, /database|adapter spike|migration/giu);
  const sqliteDetailVisibleCount = count(technicalMain, /sqlite/giu);
  const historyScopeClean = multiMatchCoachSectionCount >= 1 &&
    persistenceMainBodySectionCount === 0 &&
    databaseMainBodySectionCount === 0 &&
    calibrationMainBodySectionCount === 0 &&
    historyDumpVisibleCount === 0 &&
    recordDumpVisibleCount === 0 &&
    databaseDetailVisibleCount === 0 &&
    sqliteDetailVisibleCount === 0;

  return {
    historyMainBodySectionCount,
    historyTechnicalMainBodySectionCount,
    persistenceMainBodySectionCount,
    databaseMainBodySectionCount,
    calibrationMainBodySectionCount,
    historyAppendixSectionCount,
    multiMatchCoachSectionCount,
    historyDumpVisibleCount,
    recordDumpVisibleCount,
    databaseDetailVisibleCount,
    sqliteDetailVisibleCount,
    historyScopeClean,
    historyScopeWarningCodes: [
      ...(historyScopeClean ? ["HISTORY_SCOPE_CLEAN" as const] : ["COACH_REPORT_MULTI_MATCH_TRENDS_PARTIAL" as const]),
      ...(persistenceMainBodySectionCount === 0 ? [] : ["PERSISTENCE_SECTIONS_IN_MAIN_BODY" as const]),
      ...(databaseMainBodySectionCount === 0 ? [] : ["DATABASE_SECTIONS_IN_MAIN_BODY" as const]),
      ...(calibrationMainBodySectionCount === 0 ? [] : ["CALIBRATION_HISTORY_IN_MAIN_BODY" as const]),
      ...(recordDumpVisibleCount === 0 && historyDumpVisibleCount === 0 ? [] : ["RECORD_DUMP_VISIBLE" as const]),
    ],
    recommendation: historyScopeClean ? "KEEP_HISTORY_SCOPE_CLEAN" : "MOVE_HISTORY_DETAILS_TO_APPENDIX",
  };
}
