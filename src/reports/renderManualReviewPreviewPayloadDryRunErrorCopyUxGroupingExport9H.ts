const EXPORT_9G_SECTION_ID = "manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-export-9g";

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

export function renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H(): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-error-copy-ux-grouping-export-9h" class="premium-section manual-review-preview-payload-dry-run-error-copy-ux-grouping-export-9h" data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H">',
    '<p class="eyebrow">UX 9H</p>',
    "<h2>Groupes erreurs dry-run</h2>",
    "<p>5 familles : forme-compatible/structure-payload/valeurs-observation/frontieres-interdites/actions-refusees.</p>",
    "<p>19 erreurs, 12 blockers, 8 refus, 1 cas compatible non accepte; coverage 19/12/14/8.</p>",
    "<p>messages clés 7/7, missing 0, contradiction 0.</p>",
    '<p class="guard">Regroupement UX uniquement : aucun runtime/payload reel/preview reelle/submit/API/backend/stockage/memoire/official truth/decision/selection/tactique/score/timeline/mutation-match.</p>',
    "</section>",
  ].join("\n");
}

export function normalizeManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExportShell9H(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9H - error copy UX grouping</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9h"')
    .replace(/Export compact 9G/gu, "Export compact 9H");
  const mainTag = normalized.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"')) {
    normalized = normalized.replace(
      /(<main\b[^>]*)(>)/u,
      '$1 data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"$2',
    );
  }
  return normalized;
}

export function insertManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H(html: string): string {
  return normalizeManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExportShell9H(
    replaceSectionById(html, EXPORT_9G_SECTION_ID, renderManualReviewPreviewPayloadDryRunErrorCopyUxGroupingExport9H()),
  );
}
