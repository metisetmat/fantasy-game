import type { ManualReviewPreviewNonPersistenceAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

export function auditManualReviewPreviewNonPersistence8O(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewNonPersistenceAudit8O {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const previewSliceStart = combined.indexOf("manual-review-preview");
  const previewSlice = previewSliceStart < 0 ? "" : combined.slice(previewSliceStart);
  const localStoragePersistenceCount = countMatches(previewSlice, /localStorage\s*\./giu);
  const databasePersistenceCount = countMatches(previewSlice, /database write|db write|sqlite write|insert into/giu);
  const filePersistenceCount = countMatches(previewSlice, /writeFile|file persistence|persisted file/giu);
  const backendSubmitActionCount = countMatches(previewSlice, /backend submit|submit backend|api\/manual-review|post manual review/giu);
  const formSubmitButtonCount = countMatches(previewSlice, /<button[^>]*submit|type="submit"|<form\b/giu);
  const apiCallCount = countMatches(previewSlice, /fetch\(|XMLHttpRequest|axios\./giu);
  const memoryCreationCount = countMatches(previewSlice, /memory created|memoire creee|creates? memory/giu);
  const seasonMemoryCreationCount = countMatches(previewSlice, /season memory created|memoire de saison creee/giu);
  const teamStyleMemoryCreationCount = countMatches(previewSlice, /team style memory created|memoire de style creee/giu);
  const previewPersistencePerformed = localStoragePersistenceCount > 0 ||
    databasePersistenceCount > 0 ||
    filePersistenceCount > 0 ||
    backendSubmitActionCount > 0 ||
    formSubmitButtonCount > 0 ||
    apiCallCount > 0 ||
    memoryCreationCount > 0 ||
    seasonMemoryCreationCount > 0 ||
    teamStyleMemoryCreationCount > 0;
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (backendSubmitActionCount > 0 || formSubmitButtonCount > 0 || apiCallCount > 0) warnings.push("BACKEND_SUBMIT_ACTION_DETECTED");
  if (memoryCreationCount > 0) warnings.push("PREVIEW_DOES_NOT_CREATE_MEMORY");
  if (seasonMemoryCreationCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");

  return {
    localStoragePersistenceCount,
    databasePersistenceCount,
    filePersistenceCount,
    backendSubmitActionCount,
    formSubmitButtonCount,
    apiCallCount,
    memoryCreationCount,
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    previewPersistencePerformed,
    previewApplicationPerformed: false,
    nonPersistenceWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_NON_PERSISTENT_PREVIEW" : "REPAIR_PREVIEW_PERSISTENCE_BOUNDARY",
  };
}
