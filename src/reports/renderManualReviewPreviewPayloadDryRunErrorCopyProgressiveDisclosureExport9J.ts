const EXPORT_9I_SECTION_ID = "manual-review-preview-payload-dry-run-export-budget-cushion-9i";

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

export function extractManualReviewPreviewPayloadDryRunExportBudgetCushionSection9I(html: string): string {
  const range = findElementRangeById(html, EXPORT_9I_SECTION_ID);
  return range === null ? "" : html.slice(range.start, range.end);
}

function replaceSectionById(html: string, id: string, replacement: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${replacement}` : `${html.slice(0, mainEnd)}${replacement}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.start)}${replacement}${html.slice(range.end)}`;
}

function normalizeManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportShell9J(exportHtml: string): string {
  let normalized = exportHtml
    .replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9J - progressive disclosure</title>")
    .replace(/\bid="compressed-export-[^"]+"/u, 'id="compressed-export-9j"')
    .replace(/Export compact 9I/gu, "Export compact 9J")
    .replace(/Export compact 9H/gu, "Export compact 9J");
  const currentAttribute =
    'data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J"';
  if (!normalized.match(/<main\b[^>]*>/u)?.[0]?.includes(currentAttribute)) {
    normalized = normalized.replace(/(<main\b[^>]*)(>)/u, `$1 ${currentAttribute}$2`);
  }
  return normalized;
}

export function renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J(input: {
  readonly exportReadTimeSecondsBefore9J: number;
}): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j" class="premium-section manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j" data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J" data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I">',
    '<p class="eyebrow">Disclosure erreurs dry-run</p>',
    "<h2>Disclosure erreurs dry-run</h2>",
    "<p>Synthese: 5 groupes UX; copies 19/12/8/1; coverage 19/12/14/8; messages 7/7; contradiction 0.</p>",
    "<p>Lecture: synthese visible, details coach disponibles dans le produit, references techniques repliees par details/summary.</p>",
    "<p>Budget 9I preserve: 778s avant 9J; section export ultra-compacte; pas de longue liste technique.</p>",
    '<p class="guard">read-only; runtime inactive; payload accepte 0; preview reelle false; sans submit/api/backend; aucune persistence; non official truth; aucune selection ni tactique; aucune mutation score ou timeline.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J(html: string): string {
  return normalizeManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportShell9J(
    replaceSectionById(
      html,
      EXPORT_9I_SECTION_ID,
      renderManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExport9J({ exportReadTimeSecondsBefore9J: 778 }),
    ),
  );
}
