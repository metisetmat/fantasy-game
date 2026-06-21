import {
  buildCoachReportControlledLocalReadOnlyDbModeTags,
  type CoachReportControlledLocalReadOnlyDbModeModel,
} from "./coachReportControlledLocalReadOnlyDbMode";
import type { CoachReportDurableStorageDecisionModel } from "./coachReportDurableStorageDecision";
import { COACH_MATCH_HISTORY_SCHEMA_VERSION, coachMatchHistoryRecordMatchesDurableSchema } from "./history/coachMatchHistoryDurableSchema";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import type { SqliteLocalReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteLocalReadOnlyCoachMatchHistoryAdapter";

function withTags(
  model: Omit<CoachReportControlledLocalReadOnlyDbModeModel, "tags">,
): CoachReportControlledLocalReadOnlyDbModeModel {
  return {
    ...model,
    tags: buildCoachReportControlledLocalReadOnlyDbModeTags(model),
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

export function buildCoachReportControlledLocalReadOnlyDbMode(input: {
  readonly durableStorageDecision: CoachReportDurableStorageDecisionModel;
  readonly sourceRecords: readonly CoachMatchHistoryRecord[];
  readonly readOnlyAdapter: SqliteLocalReadOnlyCoachMatchHistoryAdapter;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportControlledLocalReadOnlyDbModeModel {
  const firstRecord = input.sourceRecords[0];
  const readOnlyRecords = input.readOnlyAdapter.listReadOnlyRecords();
  const descriptionBeforeQueries = input.readOnlyAdapter.describe();
  let readOnlyQueryByTeamPass = false;
  let readOnlyQueryByPhasePass = false;
  let writeRejectedPass = false;
  let readOnlyQueryCount = 0;

  if (firstRecord !== undefined) {
    const teamQuery = input.readOnlyAdapter.readOnlyQuery({
      teamId: firstRecord.homeTeamId,
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    readOnlyQueryCount += 1;
    readOnlyQueryByTeamPass = teamQuery.records.some((record) => record.historyRecordId === firstRecord.historyRecordId);

    const phase = firstRecord.signals[0]?.phase;
    const phaseQuery = input.readOnlyAdapter.readOnlyQuery({
      ...(phase === undefined ? {} : { phase }),
      maxRecords: 10,
      includeControlledSamples: true,
      includeProductHistory: true,
    });
    readOnlyQueryCount += 1;
    readOnlyQueryByPhasePass = phase === undefined || phaseQuery.records.some((record) =>
      record.signals.some((signal) => signal.phase === phase)
    );

    const rejectedWrite = input.readOnlyAdapter.rejectWrite(firstRecord);
    writeRejectedPass = rejectedWrite.recordsAfterSaveCount === rejectedWrite.recordsBeforeSaveCount &&
      rejectedWrite.writtenToDiskCount === 0 &&
      rejectedWrite.replacedRecordCount === 0 &&
      rejectedWrite.warnings.some((warning) => warning.includes("Write rejected"));
  }

  const descriptionAfterQueries = input.readOnlyAdapter.describe();
  const schemaCompatibilityPass = descriptionAfterQueries.schemaVersion === COACH_MATCH_HISTORY_SCHEMA_VERSION &&
    input.sourceRecords.every(coachMatchHistoryRecordMatchesDurableSchema) &&
    descriptionAfterQueries.schemaIncompatibleRecordCount === 0;
  const deterministicOrderingPass = hasDeterministicOrder(readOnlyRecords);

  return withTags({
    status: "available",
    modeName: "controlled_local_readonly_db",
    storageTarget: "sqlite_local",
    schemaVersion: "coach_match_history_v1",
    readOnlyMode: true,
    writeModeAllowed: false,
    writeRejectedPass,
    productActivationAllowed: false,
    defaultEnabled: false,
    featureFlagEnabled: false,
    activeProductHistorySource: "file_backed",
    databaseUsedAsProductTruth: false,
    reportCanUseAsSourceOfTruth: false,
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
    realDatabaseReadCount: 0,
    realDatabaseWriteCount: 0,
    controlledReadAttemptCount: descriptionAfterQueries.controlledReadAttemptCount,
    dryRunFallbackAvailable: true,
    sourceRecordCount: input.sourceRecords.length,
    readOnlyRecordCount: readOnlyRecords.length,
    readOnlyQueryCount,
    readOnlyQueryByTeamPass,
    readOnlyQueryByPhasePass,
    deterministicOrderingPass,
    schemaCompatibilityPass,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    visibleRecommendationWordingCount: 0,
    visibleSelectionWordingCount: 0,
    adapterImplemented: descriptionBeforeQueries.implemented,
    adapterProductionReady: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    explicitControlledModeOnly: true,
    trueSqliteIoDeferred: true,
    nextStep: "Product History Source Switch Trial in non-prod only",
    warnings: [
      "controlled_local_readonly_db is available only as an explicit test/dev mode.",
      "Product history source remains file_backed; SQLite local is not product truth.",
      "No real SQLite IO occurs in Sprint 5G; true SQLite read wiring is deferred to a later non-prod trial.",
      `Sprint 5F durable decision carried forward: ${input.durableStorageDecision.selectedStorageTarget}/${input.durableStorageDecision.schemaVersion}.`,
    ],
  });
}
