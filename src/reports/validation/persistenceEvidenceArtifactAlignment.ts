import type { CoachReportPersistenceEvidenceSnapshot } from "../coachReportPersistenceEvidenceSnapshot";

export interface PersistenceEvidenceArtifactAlignmentResult {
  readonly status: "pass" | "partial" | "fail";
  readonly snapshotId: string;
  readonly scenario: CoachReportPersistenceEvidenceSnapshot["scenario"];
  readonly markdownMatchesSnapshot: boolean;
  readonly validationMatchesSnapshot: boolean;
  readonly exportMatchesSnapshot: boolean;
  readonly saveOperationAligned: boolean;
  readonly beforeAfterCountsAligned: boolean;
  readonly diskCountsAligned: boolean;
  readonly dedupeCountsAligned: boolean;
  readonly queryCountsAligned: boolean;
  readonly scenarioMixingDetected: boolean;
  readonly rendererRecalculationDetected: boolean;
  readonly mismatchCount: number;
  readonly mismatches: readonly string[];
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly scoreMutationCount: 0;
  readonly possessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly globalEconomyClaimCount: 0;
}

function normalized(text: string): string {
  return text
    .replace(/&eacute;/gu, "e")
    .replace(/&Eacute;/gu, "E")
    .replace(/&egrave;/gu, "e")
    .replace(/&agrave;/gu, "a")
    .replace(/&ocirc;/gu, "o")
    .replace(/&rsquo;/gu, "'")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .toLowerCase();
}

function containsValue(text: string, label: string, value: string | number | boolean): boolean {
  const haystack = normalized(text);
  const expected = String(value).toLowerCase();
  const labelText = normalized(label);
  const escapedLabel = labelText.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const escapedValue = expected.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const labelledValue = new RegExp(`${escapedLabel}\\s*:?\\s*${escapedValue}(\\b|\\s|\\.|,|;|$)`, "u");

  return labelledValue.test(haystack);
}

function artifactMatchesSnapshot(
  artifactName: string,
  artifact: string,
  snapshot: CoachReportPersistenceEvidenceSnapshot,
): readonly string[] {
  const mismatches: string[] = [];
  const checks: ReadonlyArray<readonly [string, string | number | boolean]> = [
    ["snapshot id", snapshot.snapshotId],
    ["scenario", snapshot.scenario],
    ["save operation", snapshot.saveOperation],
    ["idempotent save", snapshot.idempotentSave],
    ["records before save count", snapshot.recordsBeforeSaveCount],
    ["records after save count", snapshot.recordsAfterSaveCount],
    ["loaded from disk count", snapshot.loadedFromDiskCount],
    ["written to disk count", snapshot.writtenToDiskCount],
    ["deduped record count", snapshot.dedupedRecordCount],
    ["replaced record count", snapshot.replacedRecordCount],
    ["ignored duplicate count", snapshot.ignoredDuplicateCount],
    ["queried record count", snapshot.queriedRecordCount],
    ["queried signal count", snapshot.queriedSignalCount],
  ];

  for (const [label, value] of checks) {
    if (!containsValue(artifact, label, value)) {
      mismatches.push(`${artifactName} missing ${label}=${String(value)}`);
    }
  }

  return mismatches;
}

export function validatePersistenceEvidenceArtifactAlignment(input: {
  readonly snapshot: CoachReportPersistenceEvidenceSnapshot;
  readonly markdownReport: string;
  readonly validationReport: string;
  readonly exportHtml: string;
}): PersistenceEvidenceArtifactAlignmentResult {
  const markdownMismatches = artifactMatchesSnapshot("markdown", input.markdownReport, input.snapshot);
  const validationMismatches = artifactMatchesSnapshot("validation", input.validationReport, input.snapshot);
  const exportMismatches = artifactMatchesSnapshot("export", input.exportHtml, input.snapshot);
  const mismatches = [
    ...markdownMismatches,
    ...validationMismatches,
    ...exportMismatches,
  ];
  const joined = `${input.markdownReport}\n${input.validationReport}\n${input.exportHtml}`;
  const scenarioMixingDetected = (["inserted", "replaced", "ignored_duplicate"] as const)
    .filter((scenario) =>
      normalized(joined).includes(`scenario: ${scenario}`) ||
      normalized(joined).includes(`save operation: ${scenario}`)
    )
    .filter((scenario) => scenario !== input.snapshot.scenario).length > 0;
  const rendererRecalculationDetected = normalized(input.exportHtml).includes("renderer recalculated persistence evidence");
  const saveOperationAligned = markdownMismatches.every((mismatch) => !mismatch.includes("save operation")) &&
    validationMismatches.every((mismatch) => !mismatch.includes("save operation")) &&
    exportMismatches.every((mismatch) => !mismatch.includes("save operation"));
  const beforeAfterCountsAligned = mismatches.every((mismatch) => !mismatch.includes("records before save count") && !mismatch.includes("records after save count"));
  const diskCountsAligned = mismatches.every((mismatch) => !mismatch.includes("loaded from disk count") && !mismatch.includes("written to disk count"));
  const dedupeCountsAligned = mismatches.every((mismatch) => !mismatch.includes("deduped record count") && !mismatch.includes("replaced record count") && !mismatch.includes("ignored duplicate count"));
  const queryCountsAligned = mismatches.every((mismatch) => !mismatch.includes("queried record count") && !mismatch.includes("queried signal count"));
  const mismatchCount = mismatches.length + (scenarioMixingDetected ? 1 : 0) + (rendererRecalculationDetected ? 1 : 0);

  return {
    status: mismatchCount === 0 ? "pass" : "fail",
    snapshotId: input.snapshot.snapshotId,
    scenario: input.snapshot.scenario,
    markdownMatchesSnapshot: markdownMismatches.length === 0,
    validationMatchesSnapshot: validationMismatches.length === 0,
    exportMatchesSnapshot: exportMismatches.length === 0,
    saveOperationAligned,
    beforeAfterCountsAligned,
    diskCountsAligned,
    dedupeCountsAligned,
    queryCountsAligned,
    scenarioMixingDetected,
    rendererRecalculationDetected,
    mismatchCount,
    mismatches,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    globalEconomyClaimCount: 0,
  };
}
