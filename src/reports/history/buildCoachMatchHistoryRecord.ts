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

function normalizeHtmlForScoreCheck(html: string): string {
  return html
    .replace(/&nbsp;|&#160;/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function extractDisplayedScoreLabel(html: string): string | null {
  const scoreMatch = html.match(/<span class="score">([\s\S]*?)<\/span>/u);

  if (scoreMatch === null) {
    return null;
  }

  const displayedScore = scoreMatch[1];

  if (displayedScore === undefined) {
    return null;
  }

  return normalizeHtmlForScoreCheck(displayedScore.replace(/<[^>]+>/gu, ""));
}

function hasOfficialScoreLabel(html: string, scoreHome: number, scoreAway: number): boolean {
  const displayedScore = extractDisplayedScoreLabel(html);

  if (displayedScore === null) {
    return false;
  }

  return displayedScore === `${scoreHome} - ${scoreAway}` || displayedScore === `${scoreHome}-${scoreAway}`;
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
    hasOfficialScoreLabel(input.productReportHtml, input.matchReport.score.home, input.matchReport.score.away) &&
    hasOfficialScoreLabel(input.exportReportHtml, input.matchReport.score.home, input.matchReport.score.away);

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
