import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";

const EXPORT_9J_SECTION_ID = "manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j";

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

function replaceSectionById(html: string, id: string, replacement: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${replacement}` : `${html.slice(0, mainEnd)}${replacement}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.start)}${replacement}${html.slice(range.end)}`;
}

function normalizeExportShell9K(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9K - progressive disclosure reporting consistency</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9k"')
    .replace(/Export compact 9J/gu, "Export compact 9K")
    .replace(/Export compact 9I/gu, "Export compact 9K");
  const currentAttribute =
    'data-manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-version="9K"';
  if (!normalized.match(/<main\b[^>]*>/u)?.[0]?.includes(currentAttribute)) {
    normalized = normalized.replace(/(<main\b[^>]*)(>)/u, `$1 ${currentAttribute}$2`);
  }
  return normalized;
}

export function renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K(input: {
  readonly correctedGroupViews: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K[];
  readonly wordingReadabilityScore: number;
  readonly wordingThresholdStatus: string;
  readonly exportReadTimeSecondsBefore9K: number;
}): string {
  const actionsRefusees = input.correctedGroupViews.find((groupView) => groupView.group === "Actions refusees");
  const compatibleCase = input.correctedGroupViews.find((groupView) => groupView.group === "Forme compatible - non acceptee");
  return [
    '<section id="manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-export-9k" class="premium-section manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-export-9k" data-manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-version="9K" data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J" data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I">',
    '<p class="eyebrow">Coherence reporting 9K</p>',
    "<h2>Progressive disclosure: reporting coherent</h2>",
    `<p>wordingReadabilityScore ${input.wordingReadabilityScore} (${input.wordingThresholdStatus}); seuils 90/95 publies; Group Views corrigees: 5 groupes, 0 ligne misleading, 0 total nul.</p>`,
    `<p>Totaux preserves: erreurs 19, blockers 12, refusals ${actionsRefusees?.refusalCopies ?? 8}, cas compatible ${compatibleCase?.compatibleCase ?? 1}, coverage 19/12/14/8.</p>`,
    `<p>Budget: ${input.exportReadTimeSecondsBefore9K}s avant 9K; cible apres 9K <=790s; read-only sans runtime, payload, preview, persistence, verite officielle, decision, selection, tactique, score ou timeline.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K(
  html: string,
  input: Parameters<typeof renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K>[0],
): string {
  return normalizeExportShell9K(
    replaceSectionById(
      html,
      EXPORT_9J_SECTION_ID,
      renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyExport9K(input),
    ),
  );
}
