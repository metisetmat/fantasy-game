import type {
  ManualReviewPreviewPayloadDryRunExportKeyMessage9G,
  ManualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";

export const EXPECTED_EXPORT_KEY_MESSAGES_9G: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[] = [
  "source_non_autorisee",
  "scope_incorrect",
  "official_truth_interdite",
  "stockage_api_interdit",
  "mutation_score_timeline_interdite",
  "automation_interdite",
  "engine_learning_interdit",
];

function decodeSimpleHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&eacute;/giu, "é")
    .replace(/&egrave;/giu, "è")
    .replace(/&ecirc;/giu, "ê")
    .replace(/&agrave;/giu, "à")
    .replace(/&ccedil;/giu, "ç")
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&quot;/giu, '"')
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">");
}

export function normalizeManualReviewExportKeyMessageText9G(html: string): string {
  return decodeSimpleHtmlEntities(html)
    .replace(/<[^>]*>/gu, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/\s*\/\s*/gu, "/")
    .replace(/[’`]/gu, "'")
    .replace(/[".,;:!?()[\]{}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function findElementRangeById(html: string, id: string): { readonly start: number; readonly end: number } | null {
  const idIndex = html.indexOf(`id="${id}"`);
  if (idIndex < 0) return null;
  const openStart = html.lastIndexOf("<section", idIndex);
  if (openStart < 0) return null;
  const tagPattern = /<\/?section\b[^>]*>/giu;
  tagPattern.lastIndex = openStart;
  let depth = 0;
  for (let match = tagPattern.exec(html); match !== null; match = tagPattern.exec(html)) {
    const tag = match[0] ?? "";
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) return { start: openStart, end: match.index + tag.length };
  }
  return null;
}

function sectionById(html: string, id: string): string {
  const range = findElementRangeById(html, id);
  return range === null ? "" : html.slice(range.start, range.end);
}

function exportKeyMessageSection(html: string): string {
  const section9F = sectionById(html, "manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f");
  if (section9F.length > 0) return section9F;
  const section9G = sectionById(html, "manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-export-9g");
  return section9G.length > 0 ? section9G : html;
}

function messageDetected(message: ManualReviewPreviewPayloadDryRunExportKeyMessage9G, normalized: string): boolean {
  switch (message) {
    case "source_non_autorisee":
      return normalized.includes("source non autorisee");
    case "scope_incorrect":
      return normalized.includes("scope incorrect");
    case "official_truth_interdite":
      return normalized.includes("official truth interdite");
    case "stockage_api_interdit":
      return normalized.includes("stockage/api interdit") || normalized.includes("stockage api interdit");
    case "mutation_score_timeline_interdite":
      return normalized.includes("mutation score/timeline interdite") || normalized.includes("mutation score timeline interdite");
    case "automation_interdite":
      return normalized.includes("automation interdite");
    case "engine_learning_interdit":
      return normalized.includes("engine learning interdit");
  }
}

export function auditManualReviewPreviewPayloadDryRunExportKeyMessages9G(exportHtml: string): ManualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G {
  const section = exportKeyMessageSection(exportHtml);
  const normalized = normalizeManualReviewExportKeyMessageText9G(section);
  const detected = EXPECTED_EXPORT_KEY_MESSAGES_9G.filter((message) => messageDetected(message, normalized));
  const missing = EXPECTED_EXPORT_KEY_MESSAGES_9G.filter((message) => !detected.includes(message));
  const preserved = detected.length === EXPECTED_EXPORT_KEY_MESSAGES_9G.length && missing.length === 0;
  const missingFlag = missing.length > 0;
  return {
    auditReady: section.length > 0,
    expected: EXPECTED_EXPORT_KEY_MESSAGES_9G,
    detected,
    missing,
    preserved,
    missingFlag,
    contradictionDetected: preserved && missingFlag,
  };
}
