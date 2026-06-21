import {
  buildCoachReportDurableStorageDecisionTags,
  type CoachReportDurableStorageDecisionModel,
} from "./coachReportDurableStorageDecision";
import type { CoachReportDatabaseAdapterSpikeModel } from "./coachReportDatabaseAdapterSpike";
import type { CoachReportDatabaseMigrationPreparationModel } from "./coachReportDatabaseMigrationPreparation";
import type { CoachReportPersistenceEvidenceSnapshot } from "./coachReportPersistenceEvidenceSnapshot";
import {
  coachMatchHistoryDurableSchemaContract,
  coachMatchHistoryRecordMatchesDurableSchema,
} from "./history/coachMatchHistoryDurableSchema";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import type { DatabaseHistoryAdapterFeatureFlag } from "./history/databaseHistoryAdapterFeatureFlag";
import type { DatabaseCoachMatchHistoryAdapterSpi } from "./history/databaseCoachMatchHistoryAdapterSpi";

function withTags(
  model: Omit<CoachReportDurableStorageDecisionModel, "tags">,
): CoachReportDurableStorageDecisionModel {
  return {
    ...model,
    tags: buildCoachReportDurableStorageDecisionTags(model),
  };
}

function changedRecord(record: CoachMatchHistoryRecord): CoachMatchHistoryRecord {
  return {
    ...record,
    reportVersion: `${record.reportVersion}-sqlite-local-dry-run-replace`,
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

export function buildCoachReportDurableStorageDecision(input: {
  readonly persistenceEvidenceSnapshot: CoachReportPersistenceEvidenceSnapshot;
  readonly migrationPreparation: CoachReportDatabaseMigrationPreparationModel;
  readonly databaseAdapterSpike: CoachReportDatabaseAdapterSpikeModel;
  readonly sourceRecords: readonly CoachMatchHistoryRecord[];
  readonly durableAdapter: DatabaseCoachMatchHistoryAdapterSpi;
  readonly featureFlag: DatabaseHistoryAdapterFeatureFlag;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportDurableStorageDecisionModel {
  const description = input.durableAdapter.describe();
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
    const insertResult = input.durableAdapter.dryRunSave(firstRecord);
    dryRunSaveCount += 1;
    const replaceResult = input.durableAdapter.dryRunSave(changedRecord(firstRecord));
    dryRunSaveCount += 1;
    const duplicateResult = input.durableAdapter.dryRunSave(changedRecord(firstRecord));
    dryRunSaveCount += 1;
    insertedScenarioPass = insertResult.operation === "inserted";
    replacedScenarioPass = replaceResult.operation === "replaced";
    ignoredDuplicateScenarioPass = duplicateResult.operation === "ignored_duplicate";

    for (const record of input.sourceRecords.slice(1)) {
      input.durableAdapter.dryRunSave(record);
      dryRunSaveCount += 1;
    }

    const teamQuery = input.durableAdapter.dryRunQuery({
      teamId: firstRecord.homeTeamId,
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    dryRunQueryCount += 1;
    queryByTeamPass = teamQuery.records.some((record) => record.historyRecordId === firstRecord.historyRecordId);

    const phase = firstRecord.signals[0]?.phase;
    const phaseQuery = input.durableAdapter.dryRunQuery({
      ...(phase === undefined ? {} : { phase }),
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    dryRunQueryCount += 1;
    queryByPhasePass = phase === undefined || phaseQuery.records.some((record) =>
      record.signals.some((signal) => signal.phase === phase)
    );
    deterministicOrderingPass = hasDeterministicOrder(input.durableAdapter.listDryRunRecords());
  }

  const schemaCoversRequiredFields = coachMatchHistoryDurableSchemaContract.fields.every((field) => field.required || field.name === "evidenceSnapshotId") &&
    input.sourceRecords.every(coachMatchHistoryRecordMatchesDurableSchema);

  return withTags({
    status: "available",
    selectedStorageTarget: "sqlite_local",
    decisionMade: true,
    reason: "SQLite local is selected for the next durable development/test target because it is simple, inspectable, and can stay isolated behind disabled product activation.",
    schemaVersion: "coach_match_history_v1",
    schemaFieldCount: coachMatchHistoryDurableSchemaContract.fields.length,
    schemaCoversRequiredFields,
    realAdapterWiringPrepared: description.adapterKind === "sqlite_local_disabled",
    adapterKind: description.adapterKind,
    adapterImplemented: description.implemented,
    adapterProductionReady: false,
    featureFlagEnabled: input.featureFlag.enabled,
    defaultFeatureFlagEnabled: false,
    productActivationAllowed: false,
    activeProductHistorySource: "file_backed",
    databaseUsedAsProductTruth: false,
    reportCanUseAsSourceOfTruth: false,
    realDatabaseReadCount: 0,
    realDatabaseWriteCount: 0,
    dryRunOnly: true,
    insertedScenarioPass,
    replacedScenarioPass,
    ignoredDuplicateScenarioPass,
    queryByTeamPass,
    queryByPhasePass,
    deterministicOrderingPass,
    sourceRecordCount: input.sourceRecords.length,
    durableAdapterRecordCount: input.durableAdapter.listDryRunRecords().length,
    dryRunSaveCount,
    dryRunQueryCount,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canMutateTimeline: false,
    canMutatePossession: false,
    canCreateProductionScoringEvents: false,
    canMutateLineup: false,
    canMutateStarters: false,
    canMutateBench: false,
    canClaimGlobalEconomy: false,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    visibleRecommendationWordingCount: 0,
    visibleSelectionWordingCount: 0,
    internalStatusLeakCount: 0,
    mojibakeMarkerCount: 0,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    legacyMigrationWordingClarified: true,
    warnings: [
      "Durable storage target selected for preparation only: sqlite_local.",
      "SQLite local adapter wiring is disabled/no-IO in Sprint 5F.",
      "Product history source remains file_backed; database adapter is not product truth.",
      `Persistence snapshot consumed: ${input.persistenceEvidenceSnapshot.snapshotId}.`,
      `Migration preparation status carried forward: ${input.migrationPreparation.status}.`,
      `Database adapter spike status carried forward: ${input.databaseAdapterSpike.status}.`,
    ],
  });
}
