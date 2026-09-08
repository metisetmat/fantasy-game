import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";

const PRODUCT_9J_SECTION_ID = "manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
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

function insertAfterSectionById(html: string, id: string, addition: string): string {
  const range = findElementRangeById(html, id);
  if (range === null) {
    const mainEnd = html.lastIndexOf("</main>");
    return mainEnd < 0 ? `${html}\n${addition}` : `${html.slice(0, mainEnd)}${addition}\n${html.slice(mainEnd)}`;
  }
  return `${html.slice(0, range.end)}\n${addition}${html.slice(range.end)}`;
}

export function renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K(input: {
  readonly correctedGroupViews: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K[];
  readonly wordingReadabilityScore: number;
  readonly wordingPassThreshold: number;
  readonly wordingPassStrongThreshold: number;
  readonly wordingThresholdStatus: string;
  readonly exportReadTimeSecondsBefore9K: number;
  readonly exportReadTimeSecondsAfter9K: number;
  readonly misleadingGroupViewRowsBefore9K: number;
  readonly misleadingGroupViewRowsAfter9K: number;
}): string {
  const rows = input.correctedGroupViews
    .map(
      (groupView) =>
        `<tr><td>${escapeHtml(groupView.group)}</td><td>${groupView.totalCopies}</td><td>${groupView.errorCopies}</td><td>${groupView.blockerCopies}</td><td>${groupView.refusalCopies}</td><td>${groupView.compatibleCase}</td><td>${groupView.boundary}</td><td>${groupView.technicalRefsCollapsed ? "oui" : "non"}</td></tr>`,
    )
    .join("\n");
  return [
    '<section id="manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-9k" class="product-section manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-9k" data-manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-version="9K">',
    '<p class="eyebrow">Manual review 9K</p>',
    "<h2>Progressive disclosure: coherence reporting</h2>",
    `<p class="guard">wordingReadabilityScore publie: ${input.wordingReadabilityScore}; seuil PASS ${input.wordingPassThreshold}; seuil PASS fort ${input.wordingPassStrongThreshold}; statut ${escapeHtml(input.wordingThresholdStatus)}.</p>`,
    '<section class="detail-card">',
    "<h3>Group Views corrigees</h3>",
    "<table><thead><tr><th>Group</th><th>Total copies</th><th>Error copies</th><th>Blocker copies</th><th>Refusal copies</th><th>Compatible case</th><th>Boundary</th><th>Technical refs collapsed</th></tr></thead><tbody>",
    rows,
    "</tbody></table>",
    "</section>",
    `<p class="microcopy">Lignes misleading Group Views: ${input.misleadingGroupViewRowsBefore9K} avant 9K, ${input.misleadingGroupViewRowsAfter9K} apres 9K. Les totaux 9H restent 19/12/8/1 avec coverage 19/12/14/8.</p>`,
    `<p class="microcopy">Budget export: ${input.exportReadTimeSecondsBefore9K}s avant 9K, ${input.exportReadTimeSecondsAfter9K}s apres 9K. Section read-only uniquement.</p>`,
    '<p class="guard">Aucun runtime, payload accepte, preview, persistence, verite officielle, decision, selection, tactique, score ou timeline n est active par cette reparation.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K(
  html: string,
  input: Parameters<typeof renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K>[0],
): string {
  return insertAfterSectionById(
    html,
    PRODUCT_9J_SECTION_ID,
    renderManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyProduct9K(input),
  );
}
