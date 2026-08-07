import type { ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./manualReviewPreviewPayloadDryRunResultDetailCardsTypes9C";

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

export function renderManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C(
  model: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
): string {
  const groupItems = model.detailCardGroups
    .map((group) => `<li><strong>${escapeHtml(group.label)}</strong> (${group.cardCount}) - ${escapeHtml(group.coachFacingMeaning)}</li>`)
    .join("");
  const cardItems = model.detailCards
    .map((card) => `<li><strong>${escapeHtml(card.title)}</strong> - ${escapeHtml(card.coachFacingStatusLabel)}. ${escapeHtml(card.coachFacingSummary)} <em>Frontiere:</em> ${escapeHtml(card.protectedBoundary)}</li>`)
    .join("");

  return [
    '<section id="manual-review-preview-payload-dry-run-result-detail-cards-9c" class="premium-section manual-review-preview-payload-dry-run-result-detail-cards-9c" data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C">',
    '<p class="eyebrow">Sprint 9C - cartes detail dry-run, sans preview</p>',
    "<h2>Cartes de detail dry-run payload</h2>",
    `<p>Statut: <strong>${escapeHtml(model.status)}</strong>. Les 16 resultats dry-run 9B deviennent 16 cartes lisibles sans accepter de payload, sans validation runtime, sans preview reelle et sans stockage.</p>`,
    '<div class="kpi-grid">',
    `<article><span class="kpi-label">Cartes</span><strong>${model.detailCardCount}/${model.detailCardCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Groupes</span><strong>${model.detailCardGroupCount}/${model.detailCardGroupCountExpected}</strong></article>`,
    `<article><span class="kpi-label">Cas compatible accepte</span><strong>${model.dryRunAcceptedPayloadCount}</strong></article>`,
    `<article><span class="kpi-label">Preview reelle</span><strong>${model.previewActivationCount}</strong></article>`,
    `<article><span class="kpi-label">Wording score</span><strong>${model.wordingReadabilityScore}</strong></article>`,
    `<article><span class="kpi-label">Couverture</span><strong>${bool(model.detailCoverageStillComplete)}</strong></article>`,
    "</div>",
    "<h3>Groupes de cartes</h3>",
    `<ul>${groupItems}</ul>`,
    "<h3>Cartes detail</h3>",
    `<ul>${cardItems}</ul>`,
    '<p class="guardrail-note">Ces cartes expliquent les erreurs, blockers et frontieres futures; elles ne valident rien en production et ne creent aucune decision automatique.</p>',
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-9c"')) {
    return productHtml;
  }

  const anchor = "</section>";
  const section9B = productHtml.indexOf('id="manual-review-preview-payload-dry-run-result-renderer-9b"');
  if (section9B !== -1) {
    const end9B = productHtml.indexOf(anchor, section9B);
    if (end9B !== -1) {
      const insertAt = end9B + anchor.length;
      return `${productHtml.slice(0, insertAt)}\n${section}\n${productHtml.slice(insertAt)}`;
    }
  }

  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
