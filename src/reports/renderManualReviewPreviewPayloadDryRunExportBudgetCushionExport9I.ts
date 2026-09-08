const EXPORT_9H_SECTION_ID = "manual-review-preview-payload-dry-run-error-copy-ux-grouping-export-9h";

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

function removeSectionById(html: string, id: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) return html;
  return `${html.slice(0, range.start)}${html.slice(range.end)}`;
}

function normalizeManualReviewPreviewPayloadDryRunExportBudgetCushionExportShell9I(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9I - budget cushion</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9i"')
    .replace(/Export compact 9H/gu, "Export compact 9I");
  const mainTag = normalized.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"')) {
    normalized = normalized.replace(
      /(<main\b[^>]*)(>)/u,
      '$1 data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"$2',
    );
  }
  return normalized;
}

export function renderManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I(): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-error-copy-ux-grouping-export-9h" class="premium-section manual-review-preview-payload-dry-run-error-copy-ux-grouping-export-9h" data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H">',
    '<p class="eyebrow">UX 9H</p>',
    "<h2>Groupes erreurs dry-run</h2>",
    "<p>5 groupes; copies 19/12/8/1; coverage 19/12/14/8; messages 7/7; contradiction 0.</p>",
    "</section>",
    '<section id="manual-review-preview-payload-dry-run-export-budget-cushion-9i" class="premium-section manual-review-preview-payload-dry-run-export-budget-cushion-9i" data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I">',
    '<p class="eyebrow">Budget export 9I</p>',
    "<h2>Marge export avant progressive disclosure</h2>",
    "<p><strong>Objectif :</strong> export 9H 799s; cible 760-780s.</p>",
    "<p><strong>Preserve :</strong> 9H 5/5; copies 19/12/8/1; messages 7/7; contradiction 0.</p>",
    '<p class="guard">Compaction export uniquement : produit conserve; aucun runtime, payload reel, preview, stockage, official truth, decision, selection, tactique ou mutation match.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I(html: string): string {
  const compactedHistoricalHtml = removeSectionById(
    removeSectionById(html, "manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-export-9g"),
    "manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f",
  );
  return normalizeManualReviewPreviewPayloadDryRunExportBudgetCushionExportShell9I(
    replaceSectionById(compactedHistoricalHtml, EXPORT_9H_SECTION_ID, renderManualReviewPreviewPayloadDryRunExportBudgetCushionExport9I()),
  );
}
