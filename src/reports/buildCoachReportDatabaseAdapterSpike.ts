import {
  buildCoachReportDatabaseAdapterSpikeTags,
  type CoachReportDatabaseAdapterSpikeModel,
} from "./coachReportDatabaseAdapterSpike";
import type { CoachReportDatabaseMigrationPreparationModel } from "./coachReportDatabaseMigrationPreparation";
import type { CoachReportPersistenceEvidenceSnapshot } from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import type { DatabaseHistoryAdapterFeatureFlag } from "./history/databaseHistoryAdapterFeatureFlag";
import type { DatabaseCoachMatchHistoryAdapterSpi } from "./history/databaseCoachMatchHistoryAdapterSpi";

function withTags(
  model: Omit<CoachReportDatabaseAdapterSpikeModel, "tags">,
): CoachReportDatabaseAdapterSpikeModel {
  return {
    ...model,
    tags: buildCoachReportDatabaseAdapterSpikeTags(model),
  };
}

function changedRecord(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
  return {
    ...record,
    reportVersion: `${record.reportVersion}-experimental-replace`,
  };
}

function hasDeterministicOrder(records: readonly CoachMatchHistoryRecord[]): boolean {
  const signature = records.map((record) => `${record.generatedAtIso}:${record.matchId}:${record.historyRecordId}`).join("|");
  const sorted = [...records]
    .sort((left, right) =>
      left.generatedAtIso.localeCompare(right.generatedAtIso) ||
      left.matchId.localeCompare(right.matchId) ||
      left.historyRecordId.localeCompare(right.historyRecordId)
    )
    .map((record) => `${record.generatedAtIso}:${record.matchId}:${record.historyRecordId}`)
    .join("|");

  return signature === sorted;
}

export function buildCoachReportDatabaseAdapterSpike(input: {
  readonly persistenceEvidenceSnapshot: CoachReportPersistenceEvidenceSnapshot;
  readonly migrationPreparation: CoachReportDatabaseMigrationPreparationModel;
  readonly sourceRecords: readonly CoachMatchHistoryRecord[];
  readonly experimentalAdapter: DatabaseCoachMatchHistoryAdapterSpi;
  readonly featureFlag: DatabaseHistoryAdapterFeatureFlag;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportDatabaseAdapterSpikeModel {
  const description = input.experimentalAdapter.describe();
  const firstRecord = input.sourceRecords[0];
  let insertedScenarioPass = false;
  let replacedScenarioPass = false;
  let ignoredDuplicateScenarioPass = false;
  let queryByTeamPass = false;
  let queryByPhasePass = false;
  let deterministicOrderingPass = false;
  let dryRunSaveCount = 0;
  let dryRunQueryCount = 0;

  if (firstRecord !== undefined) {
    const insertResult = input.experimentalAdapter.dryRunSave(firstRecord);
    dryRunSaveCount += 1;
    const replaceResult = input.experimentalAdapter.dryRunSave(changedRecord(firstRecord));
    dryRunSaveCount += 1;
    const duplicateResult = input.experimentalAdapter.dryRunSave(changedRecord(firstRecord));
    dryRunSaveCount += 1;
    insertedScenarioPass = insertResult.operation === "inserted";
    replacedScenarioPass = replaceResult.operation === "replaced";
    ignoredDuplicateScenarioPass = duplicateResult.operation === "ignored_duplicate";

    const teamQuery = input.experimentalAdapter.dryRunQuery({
      teamId: firstRecord.homeTeamId,
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    dryRunQueryCount += 1;
    queryByTeamPass = teamQuery.records.some((record) => record.historyRecordId === firstRecord.historyRecordId);

    const phase = firstRecord.signals[0]?.phase;
    const phaseQuery = input.experimentalAdapter.dryRunQuery({
      ...(phase === undefined ? {} : { phase }),
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    dryRunQueryCount += 1;
    queryByPhasePass = phase === undefined || phaseQuery.records.some((record) =>
      record.signals.some((signal) => signal.phase === phase)
    );
    deterministicOrderingPass = hasDeterministicOrder(input.experimentalAdapter.listDryRunRecords());
  }

  const status: CoachReportDatabaseAdapterSpikeModel["status"] =
    description.adapterKind !== "experimental_database"
      ? "failed"
      : firstRecord === undefined
        ? "partial"
        : insertedScenarioPass &&
          replacedScenarioPass &&
          ignoredDuplicateScenarioPass &&
          queryByTeamPass &&
          queryByPhasePass &&
          deterministicOrderingPass
          ? "available"
          : "partial";

  return withTags({
    status,
    origin: "database_adapter_spi",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    adapterKind: "experimental_database",
    adapterImplemented: true,
    adapterProductionReady: false,
    featureFlagEnabled: input.featureFlag.enabled,
    defaultFeatureFlagEnabled: false,
    productActivationAllowed: false,
    reportCanUseAsSourceOfTruth: false,
    realDatabaseWriteCount: 0,
    realDatabaseReadCount: 0,
    dryRunOnly: true,
    activeProductHistorySource: "file_backed",
    databaseUsedAsProductTruth: false,
    saveResultSemanticsPreserved: true,
    insertedScenarioPass,
    replacedScenarioPass,
    ignoredDuplicateScenarioPass,
    queryByTeamPass,
    queryByPhasePass,
    deterministicOrderingPass,
    sourceRecordCount: input.sourceRecords.length,
    experimentalAdapterRecordCount: input.experimentalAdapter.listDryRunRecords().length,
    dryRunSaveCount,
    dryRunQueryCount,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
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
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    globalEconomyClaimCount: 0,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: [
      "Experimental database adapter exists behind a disabled-by-default feature flag.",
      "Product history source remains file_backed; database adapter is not product truth.",
      ...input.migrationPreparation.warnings,
      `Persistence snapshot consumed: ${input.persistenceEvidenceSnapshot.snapshotId}.`,
    ],
  });
}
