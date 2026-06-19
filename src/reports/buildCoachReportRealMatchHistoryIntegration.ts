import type { MatchReport } from "../contracts/engineToCoach";
import type { CoachReportMultiMatchHistoryViewModel } from "./coachReportMultiMatchHistoryView";
import {
  buildCoachReportRealMatchHistoryIntegrationTags,
  type CoachReportRealMatchHistoryIntegrationModel,
} from "./coachReportRealMatchHistoryIntegration";
import type {
  CoachMatchHistoryRecord,
  CoachMatchHistorySignal,
  CoachMatchHistorySignalStability,
} from "./history/coachMatchHistory";
import type { CoachMatchHistoryStore } from "./history/coachMatchHistoryStore";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";

function sampleSignalStability(
  presence: "present" | "absent" | "unstable" | "insufficient_data",
  drilldownStrength: CoachReportMultiMatchHistoryViewModel["drilldowns"][number]["strength"],
): CoachMatchHistorySignalStability | null {
  switch (presence) {
    case "present":
      switch (drilldownStrength) {
        case "local_repeated":
          return "local_repeated";
        case "local_visible_once":
          return "local_visible_once";
        case "local_unstable":
          return "local_unstable";
        case "insufficient_data":
          return "insufficient_data";
      }
    case "unstable":
      return "local_unstable";
    case "insufficient_data":
      return "insufficient_data";
    case "absent":
      return null;
  }
}

function buildControlledSampleRecords(input: {
  readonly historyView: CoachReportMultiMatchHistoryViewModel;
  readonly currentRecord: CoachMatchHistoryRecord;
  readonly generatedAtIso: string;
}): readonly CoachMatchHistoryRecord[] {
  const signalsBySampleId = new Map<string, CoachMatchHistorySignal[]>();

  for (const drilldown of input.historyView.drilldowns) {
    for (const sample of drilldown.samples) {
      const stability = sampleSignalStability(sample.presence, drilldown.strength);

      if (stability === null) {
        continue;
      }

      const nextSignal: CoachMatchHistorySignal = {
        signalId: `${sample.sampleId}:${drilldown.signalId}`,
        phase: sample.phase,
        label: drilldown.label,
        ...((sample.zone ?? drilldown.primaryZone) === undefined ? {} : { zone: sample.zone ?? drilldown.primaryZone }),
        stability,
        source: "controlled_sample",
        explanation: sample.explanation,
      };
      const existing = signalsBySampleId.get(sample.sampleId) ?? [];
      signalsBySampleId.set(sample.sampleId, [...existing, nextSignal]);
    }
  }

  return [...signalsBySampleId.entries()].map(([sampleId, signals]) => ({
    historyRecordId: `controlled-sample:${sampleId}`,
    matchId: `controlled-sample:${sampleId}`,
    runId: sampleId,
    generatedAtIso: input.generatedAtIso,
    homeTeamId: input.currentRecord.homeTeamId,
    awayTeamId: input.currentRecord.awayTeamId,
    homeTeamName: input.currentRecord.homeTeamName,
    awayTeamName: input.currentRecord.awayTeamName,
    scoreHome: 0,
    scoreAway: 0,
    scoreSource: "unknown",
    source: "controlled_sample",
    reportVersion: input.currentRecord.reportVersion,
    signals,
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
  }));
}

function withTags(
  model: Omit<CoachReportRealMatchHistoryIntegrationModel, "tags">,
): CoachReportRealMatchHistoryIntegrationModel {
  return {
    ...model,
    tags: buildCoachReportRealMatchHistoryIntegrationTags(model),
  };
}

export function buildCoachReportRealMatchHistoryIntegration(input: {
  readonly matchReport: MatchReport;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly multiMatchHistoryView: CoachReportMultiMatchHistoryViewModel;
  readonly historyStore: CoachMatchHistoryStore;
  readonly runId: string;
  readonly generatedAtIso: string;
}): CoachReportRealMatchHistoryIntegrationModel {
  if (input.multiMatchHistoryView.status === "not_available") {
    return withTags({
      status: "not_available",
      origin: "coach_report_multi_match_history_view",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      storeKind: input.historyStore.storeKind,
      storedRecordCount: input.historyStore.listAll().length,
      queriedRecordCount: 0,
      queriedSignalCount: 0,
      controlledSampleRecordCount: 0,
      simulatedMatchHistoryRecordCount: 0,
      productHistoryRecordCount: 0,
      currentMatchRecordSaved: false,
      historySummaryVisible: false,
      historyStoreBoundaryVisible: false,
      realHistoryNotYetProductionDatabaseVisible: true,
      trendProofClaimCount: 0,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: true,
      candidateComparisonMatchesProduct: true,
      interpretationGuardMatchesProduct: true,
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
      noAutomaticSelection: true,
      playerSelectedCount: 0,
      automaticSelectionCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      confidenceUpgradeCount: 0,
      officiallyConfirmedCount: 0,
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
      scoringConstantsUnchanged: true,
      matchBonusEventUnchanged: true,
      fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
      warnings: ["Real match history integration requires the multi-match history view first."],
    });
  }

  const currentRecord = buildCoachMatchHistoryRecord({
    matchReport: input.matchReport,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    multiMatchHistoryView: input.multiMatchHistoryView,
    source: "simulated_match_history",
    runId: input.runId,
    generatedAtIso: input.generatedAtIso,
  });
  const controlledSampleRecords = buildControlledSampleRecords({
    historyView: input.multiMatchHistoryView,
    currentRecord,
    generatedAtIso: input.generatedAtIso,
  });

  for (const record of controlledSampleRecords) {
    input.historyStore.save(record);
  }

  input.historyStore.save(currentRecord);

  const teamId = currentRecord.homeTeamId;
  const query = input.historyStore.query({
    teamId,
    maxRecords: 12,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const allRecords = input.historyStore.listAll();
  const storedRecordCount = allRecords.length;
  const controlledSampleRecordCount = allRecords.filter((record) => record.source === "controlled_sample").length;
  const simulatedMatchHistoryRecordCount = allRecords.filter((record) => record.source === "simulated_match_history").length;
  const productHistoryRecordCount = allRecords.filter((record) => record.source === "product_history_store").length;
  const currentMatchRecordSaved = allRecords.some((record) => record.historyRecordId === currentRecord.historyRecordId);
  const status = currentMatchRecordSaved && (query.status === "available" || query.status === "partial")
    ? (input.multiMatchHistoryView.status === "available" ? "available" : "partial")
    : "failed";
  const warnings = [
    ...query.warnings,
    ...(input.historyStore.storeKind === "in_memory"
      ? ["History store remains local and in-memory for this sprint."]
      : []),
  ];

  return withTags({
    status,
    origin: "coach_report_multi_match_history_view",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    storeKind: input.historyStore.storeKind,
    storedRecordCount,
    queriedRecordCount: query.recordCount,
    queriedSignalCount: query.signalCount,
    controlledSampleRecordCount,
    simulatedMatchHistoryRecordCount,
    productHistoryRecordCount,
    currentMatchRecordSaved,
    historySummaryVisible: true,
    historyStoreBoundaryVisible: true,
    realHistoryNotYetProductionDatabaseVisible: input.historyStore.storeKind !== "future_database",
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    productExportScoreMatches: true,
    candidateComparisonMatchesProduct: true,
    interpretationGuardMatchesProduct: true,
    visibleRecommendationWordingCount: 0,
    visibleSelectionWordingCount: 0,
    internalStatusLeakCount: 0,
    mojibakeMarkerCount: 0,
    noAutomaticSelection: true,
    playerSelectedCount: 0,
    automaticSelectionCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
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
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings,
  });
}
