import { buildCoachReportPersistenceEvidenceSnapshot } from "./buildCoachReportPersistenceEvidenceSnapshot";
import {
  persistenceEvidenceConsistency,
  persistenceEvidenceSaveResult,
} from "./persistenceEvidenceTestFixtures";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceSnapshot(): readonly string[] {
  const saveResult = persistenceEvidenceSaveResult("inserted");
  const consistency = persistenceEvidenceConsistency("inserted");
  const snapshot = buildCoachReportPersistenceEvidenceSnapshot({
    consistency,
    saveResult,
    queriedRecordCount: consistency.queriedRecordCount,
    queriedSignalCount: consistency.queriedSignalCount,
    productReportHtml: "<main>product</main>",
    exportReportHtml: "<main>export</main>",
  });

  assertTest(snapshot.source === "coach_match_history_save_result", "snapshot source must be CoachMatchHistorySaveResult.");
  assertTest(snapshot.scenario === saveResult.operation, "snapshot scenario must be explicit.");
  assertTest(snapshot.saveOperation === saveResult.operation, "save operation must come from save result.");
  assertTest(snapshot.recordsBeforeSaveCount === saveResult.recordsBeforeSaveCount, "before count must come from save result.");
  assertTest(snapshot.recordsAfterSaveCount === saveResult.recordsAfterSaveCount, "after count must come from save result.");
  assertTest(snapshot.loadedFromDiskCount === saveResult.loadedFromDiskCount, "loaded count must come from save result.");
  assertTest(snapshot.writtenToDiskCount === saveResult.writtenToDiskCount, "written count must come from save result.");
  assertTest(snapshot.dedupedRecordCount === saveResult.dedupedRecordCount, "dedupe count must come from save result.");
  assertTest(snapshot.replacedRecordCount === saveResult.replacedRecordCount, "replaced count must come from save result.");
  assertTest(snapshot.ignoredDuplicateCount === saveResult.ignoredDuplicateCount, "ignored duplicate count must come from save result.");
  assertTest(snapshot.queriedRecordCount === consistency.queriedRecordCount, "queried record count must come from post-save query.");
  assertTest(snapshot.queriedSignalCount === consistency.queriedSignalCount, "queried signal count must come from post-save query.");
  assertTest(snapshot.scoreMutationCount === 0 && snapshot.productionScoringEventCreationCount === 0, "snapshot must have no mutation permissions.");
  assertTest(snapshot.globalProofClaimCount === 0, "snapshot must not claim global proof.");

  return [
    "snapshot source is CoachMatchHistorySaveResult",
    "snapshot scenario is explicit",
    "snapshot counters come from save result and post-save query",
    "snapshot has no mutation permissions or global proof claim",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceSnapshot();
  console.log("persistenceEvidenceSnapshot tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
