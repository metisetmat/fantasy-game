import type { ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel } from "./manualReviewPreviewPayloadDryRunResultRendererTypes9B";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function bool(value: boolean): string {
  return value ? "oui" : "non";
}

export function renderManualReviewPreviewPayloadDryRunResultRendererProduct9B(
  model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
): string {
  const groupItems = model.resultGroups
    .map((group) => `<li><strong>${escapeHtml(group.label)}</strong> (${group.rowCount}) - ${escapeHtml(group.coachFacingMeaning)}</li>`)
    .join("");
  const rowItems = model.renderedRows
    .slice(0, 6)
    .map((row) => `<li><strong>${escapeHtml(row.caseLabel)}</strong> - ${escapeHtml(row.coachFacingStatusLabel)}. ${escapeHtml(row.coachFacingSummary)}</li>`)
    .join("");

  return [
    '<section id="manual-review-preview-payload-dry-run-result-renderer-9b" class="premium-section manual-review-preview-payload-dry-run-result-renderer-9b" data-manual-review-preview-payload-dry-run-result-renderer-version="9B">',
    '<p class="eyebrow">Sprint 9B - renderer resultats dry-run, sans preview</p>',
    "<h2>Resultats du dry-run payload preview-only</h2>",
    `<p>Statut: <strong>${escapeHtml(model.status)}</strong>. Le renderer transforme les 16 cas 9A en lecture coach-facing sans accepter de payload, sans creer de preview reelle et sans stockage.</p>`,
    '<div class="kpi-grid">',
    `<article><span class="kpi-label">Cas rendus</span><strong>${model.renderedCaseCount}/${model.renderedCaseCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Groupes lisibles</span><strong>${model.coachFacingResultGroupCount}/${model.coachFacingResultGroupCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Cas positif accepte</span><strong>${model.dryRunAcceptedPayloadCount}</strong></article>`,
    `<article><span class="kpi-label">Preview reelle</span><strong>${model.previewActivationCount}</strong></article>`,
    `<article><span class="kpi-label">Wording score</span><strong>${model.wordingReadabilityScore}</strong></article>`,
    `<article><span class="kpi-label">Couverture</span><strong>${bool(model.coverageStillComplete)}</strong></article>`,
    "</div>",
    "<h3>Groupes de resultat</h3>",
    `<ul>${groupItems}</ul>`,
    "<h3>Lignes rendues principales</h3>",
    `<ul>${rowItems}</ul>`,
    '<p class="guardrail-note">Le cas compatible reste explicitement non accepte: aucune validation runtime, aucun payload reel, aucune preview, aucune officialisation et aucune decision automatique ne sont crees en 9B.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunResultRendererProduct9B(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-dry-run-result-renderer-9b"')) {
    return productHtml;
  }

  const anchor = "</section>";
  const section9A = productHtml.indexOf('id="manual-review-preview-payload-dry-run-validator-9a"');
  if (section9A !== -1) {
    const end9A = productHtml.indexOf(anchor, section9A);
    if (end9A !== -1) {
      const insertAt = end9A + anchor.length;
      return `${productHtml.slice(0, insertAt)}\n${section}\n${productHtml.slice(insertAt)}`;
    }
  }

  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
