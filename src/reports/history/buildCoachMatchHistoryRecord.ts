import type { MatchReport } from "../../contracts/engineToCoach";
import type { CoachReportMultiMatchHistoryViewModel } from "../coachReportMultiMatchHistoryView";
import type {
  CoachMatchHistoryRecord,
  CoachMatchHistorySignal,
  CoachMatchHistorySignalStability,
  CoachMatchHistorySource,
} from "./coachMatchHistory";

function deriveTeamIds(report: MatchReport): { readonly homeTeamId: string; readonly awayTeamId: string } {
  return {
    homeTeamId: report.teamStats[0]?.teamId ?? "HOME",
    awayTeamId: report.teamStats[1]?.teamId ?? "AWAY",
  };
}

function stabilityFromHistoryViewStrength(
  strength: CoachReportMultiMatchHistoryViewModel["drilldowns"][number]["strength"],
): CoachMatchHistorySignalStability {
  switch (strength) {
    case "local_repeated":
      return "local_repeated";
    case "local_visible_once":
      return "local_visible_once";
    case "local_unstable":
      return "local_unstable";
    case "insufficient_data":
      return "insufficient_data";
  }
}

function buildSignals(input: {
  readonly historyView?: CoachReportMultiMatchHistoryViewModel;
  readonly source: CoachMatchHistorySource;
}): readonly CoachMatchHistorySignal[] {
  if (input.historyView === undefined || input.historyView.status === "not_available") {
    return [];
  }

  return input.historyView.drilldowns.map((drilldown, index) => ({
    signalId: `${drilldown.signalId}-${index + 1}`,
    phase: drilldown.phase,
    label: drilldown.label,
    ...(drilldown.primaryZone === undefined ? {} : { zone: drilldown.primaryZone }),
    stability: stabilityFromHistoryViewStrength(drilldown.strength),
    source: input.source,
    explanation: drilldown.coachReading,
  }));
}

export function buildCoachMatchHistoryRecord(input: {
  readonly matchReport: MatchReport;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly multiMatchHistoryView?: CoachReportMultiMatchHistoryViewModel;
  readonly source: CoachMatchHistorySource;
  readonly runId: string;
  readonly generatedAtIso: string;
}): CoachMatchHistoryRecord {
  const { homeTeamId, awayTeamId } = deriveTeamIds(input.matchReport);
  const scoreLooksOfficial =
    input.productReportHtml.includes(`${input.matchReport.score.home}`) &&
    input.exportReportHtml.includes(`${input.matchReport.score.home}`);

  return {
    historyRecordId: `${input.matchReport.matchId}:${input.runId}:${input.source}`,
    matchId: input.matchReport.matchId,
    runId: input.runId,
    generatedAtIso: input.generatedAtIso,
    homeTeamId,
    awayTeamId,
    homeTeamName: homeTeamId,
    awayTeamName: awayTeamId,
    scoreHome: input.matchReport.score.home,
    scoreAway: input.matchReport.score.away,
    scoreSource: scoreLooksOfficial ? "official_report_score" : "unknown",
    source: input.source,
    reportVersion: input.matchReport.reportMeta.generatorVersion,
    signals: input.multiMatchHistoryView === undefined
      ? []
      : buildSignals({
          historyView: input.multiMatchHistoryView,
          source: input.source,
        }),
    officialTimelineSourcePreserved: true,
    officialScorePreserved: true,
    officialPossessionPreserved: true,
    officialScoringEventsPreserved: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
  };
}
