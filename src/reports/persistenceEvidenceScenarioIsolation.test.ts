import { persistenceEvidenceSnapshot } from "./persistenceEvidenceTestFixtures";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceScenarioIsolation(): readonly string[] {
  const inserted = persistenceEvidenceSnapshot("inserted");
  const replaced = persistenceEvidenceSnapshot("replaced");
  const ignored = persistenceEvidenceSnapshot("ignored_duplicate");

  assertTest(inserted.scenario === "inserted" && inserted.saveOperation === "inserted", "inserted scenario must be isolated.");
  assertTest(replaced.scenario === "replaced" && replaced.replacedRecordCount === 1, "replaced scenario must be isolated.");
  assertTest(ignored.scenario === "ignored_duplicate" && ignored.ignoredDuplicateCount === 1, "ignored duplicate scenario must be isolated.");
  assertTest(inserted.replacedRecordCount === 0 && inserted.ignoredDuplicateCount === 0, "default inserted scenario must not mix replaced or ignored counters.");
  assertTest(inserted.snapshotId !== replaced.snapshotId && inserted.snapshotId !== ignored.snapshotId, "scenario snapshots must remain distinct.");

  return [
    "inserted scenario is isolated",
    "replaced scenario is isolated",
    "ignored duplicate scenario is isolated",
    "default report generation does not mix replacement counters",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceScenarioIsolation();
  console.log("persistenceEvidenceScenarioIsolation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
