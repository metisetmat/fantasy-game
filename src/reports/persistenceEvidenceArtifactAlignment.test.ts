import { validatePersistenceEvidenceArtifactAlignment } from "./validation/persistenceEvidenceArtifactAlignment";
import { persistenceEvidenceSnapshot } from "./persistenceEvidenceTestFixtures";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function artifact(snapshot: ReturnType<typeof persistenceEvidenceSnapshot>): string {
  return [
    `snapshot id: ${snapshot.snapshotId}`,
    `scenario: ${snapshot.scenario}`,
    `save operation: ${snapshot.saveOperation}`,
    `idempotent save: ${snapshot.idempotentSave}`,
    `records before save count: ${snapshot.recordsBeforeSaveCount}`,
    `records after save count: ${snapshot.recordsAfterSaveCount}`,
    `loaded from disk count: ${snapshot.loadedFromDiskCount}`,
    `written to disk count: ${snapshot.writtenToDiskCount}`,
    `deduped record count: ${snapshot.dedupedRecordCount}`,
    `replaced record count: ${snapshot.replacedRecordCount}`,
    `ignored duplicate count: ${snapshot.ignoredDuplicateCount}`,
    `queried record count: ${snapshot.queriedRecordCount}`,
    `queried signal count: ${snapshot.queriedSignalCount}`,
  ].join("\n");
}

export function validatePersistenceEvidenceArtifactAlignmentTest(): readonly string[] {
  const snapshot = persistenceEvidenceSnapshot("inserted");
  const result = validatePersistenceEvidenceArtifactAlignment({
    snapshot,
    markdownReport: artifact(snapshot),
    validationReport: artifact(snapshot),
    exportHtml: artifact(snapshot),
  });

  assertTest(result.status === "pass", "artifact alignment must pass.");
  assertTest(result.markdownMatchesSnapshot, "markdown must match snapshot.");
  assertTest(result.validationMatchesSnapshot, "validation must match snapshot.");
  assertTest(result.exportMatchesSnapshot, "export must match snapshot.");
  assertTest(result.saveOperationAligned, "save operation must align.");
  assertTest(result.beforeAfterCountsAligned, "before/after counts must align.");
  assertTest(result.diskCountsAligned, "disk counts must align.");
  assertTest(result.dedupeCountsAligned, "dedupe counts must align.");
  assertTest(result.queryCountsAligned, "query counts must align.");
  assertTest(!result.scenarioMixingDetected, "scenario mixing must be false.");
  assertTest(!result.rendererRecalculationDetected, "renderer recalculation must be false.");
  assertTest(result.mismatchCount === 0, "mismatch count must be 0.");

  const missingLabelResult = validatePersistenceEvidenceArtifactAlignment({
    snapshot,
    markdownReport: artifact(snapshot).replace(`records before save count: ${snapshot.recordsBeforeSaveCount}`, `unrelated value: ${snapshot.recordsBeforeSaveCount}`),
    validationReport: artifact(snapshot),
    exportHtml: artifact(snapshot),
  });

  assertTest(missingLabelResult.status === "fail", "artifact alignment must fail when a labelled counter is missing.");
  assertTest(missingLabelResult.mismatchCount > 0, "missing labelled counter must increment mismatch count.");

  return [
    "markdown, validation, and export match snapshot",
    "all counter groups align",
    "scenario mixing and renderer recalculation are false",
    "missing labelled counters fail even when the value appears elsewhere",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceArtifactAlignmentTest();
  console.log("persistenceEvidenceArtifactAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
