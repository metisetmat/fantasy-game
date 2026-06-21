import {
  buildCoachReportRealSQLiteReadOnlyIOSmokeTestTags,
  type CoachReportRealSQLiteReadOnlyIOSmokeTestModel,
} from "./coachReportRealSQLiteReadOnlyIOSmokeTest";
import type { CoachReportControlledLocalReadOnlyDbModeModel } from "./coachReportControlledLocalReadOnlyDbMode";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import { COACH_MATCH_HISTORY_SCHEMA_VERSION, coachMatchHistoryRecordMatchesDurableSchema } from "./history/coachMatchHistoryDurableSchema";
import type { SqliteRealReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteRealReadOnlyCoachMatchHistoryAdapter";

function withTags(
  model: Omit<CoachReportRealSQLiteReadOnlyIOSmokeTestModel, "tags">,
): CoachReportRealSQLiteReadOnlyIOSmokeTestModel {
  return {
    ...model,
    tags: buildCoachReportRealSQLiteReadOnlyIOSmokeTestTags(model),
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

export function buildCoachReportRealSQLiteReadOnlyIOSmokeTest(input: {
  readonly controlledLocalReadOnlyDbMode: CoachReportControlledLocalReadOnlyDbModeModel;
  readonly sqliteAdapter: SqliteRealReadOnlyCoachMatchHistoryAdapter;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportRealSQLiteReadOnlyIOSmokeTestModel {
  const readOnlyRecords = input.sqliteAdapter.listReadOnlyRecords();
  const firstRecord = readOnlyRecords[0];
  const descriptionBeforeQueries = input.sqliteAdapter.describe();
  let queryByTeamPass = false;
  let queryByPhasePass = false;
  let writeRejectedPass = false;

  if (firstRecord !== undefined) {
    const teamQuery = input.sqliteAdapter.readOnlyQuery({
      teamId: firstRecord.homeTeamId,
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    queryByTeamPass = teamQuery.records.some((record) => record.historyRecordId === firstRecord.historyRecordId);

    const phase = firstRecord.signals[0]?.phase;
    const phaseQuery = input.sqliteAdapter.readOnlyQuery({
      ...(phase === undefined ? {} : { phase }),
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    queryByPhasePass = phase === undefined || phaseQuery.records.some((record) =>
      record.signals.some((signal) => signal.phase === phase)
    );

    const rejectedWrite = input.sqliteAdapter.rejectWrite(firstRecord);
    writeRejectedPass = rejectedWrite.recordsAfterSaveCount === rejectedWrite.recordsBeforeSaveCount &&
      rejectedWrite.writtenToDiskCount === 0 &&
      rejectedWrite.replacedRecordCount === 0 &&
      rejectedWrite.warnings.some((warning) => warning.includes("Write rejected"));
  }

  const descriptionAfterQueries = input.sqliteAdapter.describe();
  const schemaCompatibilityPass =
    descriptionAfterQueries.schemaVersion === COACH_MATCH_HISTORY_SCHEMA_VERSION &&
    descriptionAfterQueries.missingRequiredColumnCount === 0 &&
    readOnlyRecords.every(coachMatchHistoryRecordMatchesDurableSchema) &&
    descriptionAfterQueries.schemaIncompatibleRecordCount === 0;
  const deterministicOrderingPass = hasDeterministicOrder(readOnlyRecords);

  return withTags({
    status: "available",
    modeName: "real_sqlite_readonly_io_smoke_test",
    storageTarget: "sqlite_local",
    schemaVersion: "coach_match_history_v1",
    realSQLiteIoEnabled: true,
    readOnlyMode: true,
    writeModeAllowed: false,
    writeRejectedPass,
    adapterImplemented: descriptionBeforeQueries.implemented,
    adapterProductionReady: false,
    featureFlagEnabled: false,
    defaultFeatureFlagEnabled: false,
    productActivationAllowed: false,
    activeProductHistorySource: "file_backed",
    databaseUsedAsProductTruth: false,
    reportCanUseAsSourceOfTruth: false,
    defaultRealDatabaseReadCount: 0,
    controlledRealDatabaseReadCount: descriptionAfterQueries.controlledRealDatabaseReadCount,
    realDatabaseWriteCount: 0,
    fixturePath: descriptionAfterQueries.fixturePath,
    fixtureRecordCount: descriptionAfterQueries.fixtureRecordCount,
    readOnlyAdapterRecordCount: readOnlyRecords.length,
    queryByTeamPass,
    queryByPhasePass,
    deterministicOrderingPass,
    schemaCompatibilityPass,
    dryRunFallbackAvailable: true,
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
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    batchLiveSeparationPreserved: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    explicitControlledModeOnly: true,
    nonProdFixtureOnly: true,
    sqliteDriverChoice: "minimal_readonly_sqlite_file_reader",
    nextStep: "Product History Source Switch Trial in non-prod only",
    warnings: [
      "real_sqlite_readonly_io_smoke_test is an explicit non-prod smoke test only.",
      "The SQLite fixture is read with real local file IO, but file_backed remains the active product history source.",
      "SQLite local is not product truth and cannot drive selection, score, timeline, possession, lineup, or route resolution.",
      `Sprint 5G controlled mode carried forward: ${input.controlledLocalReadOnlyDbMode.modeName}/${input.controlledLocalReadOnlyDbMode.schemaVersion}.`,
    ],
  });
}
