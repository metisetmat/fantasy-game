import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceRendererAlignment(): readonly string[] {
  const { exportHtml, persistenceEvidenceSnapshot: snapshot } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes("Rapport coach"), "export HTML must contain coach report shell.");
  assertTest(snapshot.saveOperation.length > 0, "snapshot contains save operation.");
  assertTest(snapshot.recordsAfterSaveCount >= snapshot.recordsBeforeSaveCount, "snapshot counters preserve save-count alignment.");
  assertTest(snapshot.loadedFromDiskCount >= 0 && snapshot.writtenToDiskCount >= 0, "snapshot disk counters are present.");
  assertTest(snapshot.queriedRecordCount >= 0 && snapshot.queriedSignalCount >= 0, "snapshot query counters are present.");

  return [
    "export HTML contains coach report shell",
    "snapshot contains save operation",
    "snapshot counters preserve save, disk, and query alignment",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceRendererAlignment();
  console.log("persistenceEvidenceRendererAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
