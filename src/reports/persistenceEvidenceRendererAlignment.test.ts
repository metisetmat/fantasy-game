import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceRendererAlignment(): readonly string[] {
  const { exportHtml, persistenceEvidenceSnapshot: snapshot } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(exportHtml.includes(`save operation: ${snapshot.saveOperation}`), "export HTML must contain same save operation as snapshot.");
  assertTest(exportHtml.includes(`records before save count: ${snapshot.recordsBeforeSaveCount}`), "export HTML must contain same before count as snapshot.");
  assertTest(exportHtml.includes(`records after save count: ${snapshot.recordsAfterSaveCount}`), "export HTML must contain same after count as snapshot.");
  assertTest(exportHtml.includes(`loaded from disk count: ${snapshot.loadedFromDiskCount}`), "export HTML must contain same loaded count as snapshot.");
  assertTest(exportHtml.includes(`written to disk count: ${snapshot.writtenToDiskCount}`), "export HTML must contain same written count as snapshot.");
  assertTest(exportHtml.includes(`deduped record count: ${snapshot.dedupedRecordCount}`), "export HTML must contain same dedupe count as snapshot.");
  assertTest(exportHtml.includes(`replaced record count: ${snapshot.replacedRecordCount}`), "export HTML must contain same replaced count as snapshot.");
  assertTest(exportHtml.includes(`ignored duplicate count: ${snapshot.ignoredDuplicateCount}`), "export HTML must contain same ignored count as snapshot.");
  assertTest(exportHtml.includes(`queried record count: ${snapshot.queriedRecordCount}`), "export HTML must contain same queried record count as snapshot.");
  assertTest(exportHtml.includes(`queried signal count: ${snapshot.queriedSignalCount}`), "export HTML must contain same queried signal count as snapshot.");
  assertTest(exportHtml.includes("instantan&eacute; unique de sauvegarde"), "export HTML must contain single-snapshot guard.");

  return [
    "export HTML contains snapshot save operation",
    "export HTML contains snapshot counters",
    "export HTML contains single-snapshot guard",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceRendererAlignment();
  console.log("persistenceEvidenceRendererAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
