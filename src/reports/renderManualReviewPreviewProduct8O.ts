import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewBoundary8O,
  ManualReviewPreviewCard8O,
  ManualReviewPreviewSummary8O,
} from "./manualReviewPreviewRendererTypes8O";

function badge(label: string): string {
  return `<span class="badge manual-preview-badge-8o">${escapeHtml(label)}</span>`;
}

function renderCard(card: ManualReviewPreviewCard8O): string {
  return [
    '<article class="product-card manual-review-preview-card-8o">',
    `<h3>${escapeHtml(card.observationTitle)}</h3>`,
    '<p class="eyebrow">Exemple de preview - non officiel</p>',
    `<p><strong>Outcome manuel affiche :</strong> ${escapeHtml(card.outcomeLabel)}</p>`,
    `<p>${escapeHtml(card.previewInterpretation)}</p>`,
    '<dl class="compact-definition-list">',
    `<div><dt>Situations comparables</dt><dd>${card.comparableSituationCount}</dd></div>`,
    `<div><dt>Signaux + / -</dt><dd>${card.positiveSignalCount} / ${card.negativeSignalCount}</dd></div>`,
    `<div><dt>Contexte comparable</dt><dd>${escapeHtml(card.contextComparable)}</dd></div>`,
    "</dl>",
    `<p><strong>Notes coach de preview :</strong> ${escapeHtml(card.coachNotesPreview)}</p>`,
    `<p><strong>Exemple a relire :</strong> ${escapeHtml(card.exampleToReviewPreview)}</p>`,
    `<p class="guard">${escapeHtml(card.cautionReminder)}</p>`,
    `<p><strong>Prochaine question coach :</strong> ${escapeHtml(card.nextQuestion)}</p>`,
    '<div class="badge-row">',
    badge("Preview non officielle"),
    badge("Non persistee"),
    badge("Non appliquee"),
    badge("Pas d'auto-classification"),
    "</div>",
    "</article>",
  ].join("\n");
}

function renderBoundary(boundary: ManualReviewPreviewBoundary8O): string {
  return [
    '<article class="product-card manual-review-preview-boundary-card-8o">',
    `<h3>${escapeHtml(boundary.label)}</h3>`,
    `<p>${escapeHtml(boundary.text)}</p>`,
    `<p class="eyebrow">Previent: ${escapeHtml(boundary.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

export function renderManualReviewPreviewProduct8O(input: {
  readonly cards: readonly ManualReviewPreviewCard8O[];
  readonly summary: ManualReviewPreviewSummary8O;
  readonly boundaries: readonly ManualReviewPreviewBoundary8O[];
}): string {
  return [
    '<section id="manual-review-preview-renderer-8o" class="premium-section manual-review-preview-renderer-8o" data-manual-review-preview-renderer-version="8O">',
    "<h2>Previsualisation non persistee d'une revue manuelle</h2>",
    '<p class="eyebrow">Exemple de preview - non officiel</p>',
    "<p>Cette section montre comment un payload manuel valide pourrait etre relu en preview. Les donnees affichees ici sont une fixture de demonstration : elles ne viennent pas d'un vrai prochain match, ne sont pas stockees et ne modifient pas le rapport officiel.</p>",
    '<div class="product-card manual-review-preview-status-8o">',
    "<h3>Statut de la preview</h3>",
    "<ul>",
    "<li>Payload valide par le contrat 8N avant rendu.</li>",
    "<li>Mode preview uniquement.</li>",
    "<li>Non officiel, non persiste, non applique au moteur.</li>",
    "<li>Aucun score, timeline ou evenement modifie.</li>",
    "</ul>",
    "</div>",
    '<div class="product-card-grid manual-review-preview-grid-8o">',
    ...input.cards.map(renderCard),
    "</div>",
    '<article class="product-card manual-review-preview-summary-8o">',
    "<h3>Synthese prudente</h3>",
    `<p>${escapeHtml(input.summary.previewReadout)}</p>`,
    "<ul>",
    `<li>confirmed: ${input.summary.confirmedCount}</li>`,
    `<li>contradicted: ${input.summary.contradictedCount}</li>`,
    `<li>inconclusive: ${input.summary.inconclusiveCount}</li>`,
    `<li>insufficient_sample: ${input.summary.insufficientSampleCount}</li>`,
    "</ul>",
    `<p>${escapeHtml(input.summary.cautionReadout)}</p>`,
    `<p><strong>Prochaine question coach :</strong> ${escapeHtml(input.summary.nextCoachQuestion)}</p>`,
    "</article>",
    '<div class="product-card-grid manual-review-preview-boundaries-8o">',
    ...input.boundaries.filter((boundary) => boundary.visibleInProduct).map(renderBoundary),
    "</div>",
    "</section>",
  ].join("\n");
}

function findBalancedSectionEnd(html: string, markerIndex: number): number {
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return -1;
  const pattern = /<\/?section\b[^>]*>/giu;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(pattern)) {
    const tag = match[0];
    const absoluteEnd = sectionStart + (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return absoluteEnd;
    } else {
      depth += 1;
    }
  }
  return -1;
}

export function insertManualReviewPreviewProduct8O(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-renderer-8o"')) return productHtml;
  const intakeBoundaryIndex = productHtml.indexOf('id="manual-review-result-intake-boundary-8n"');
  if (intakeBoundaryIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, intakeBoundaryIndex);
    if (insertAt >= 0) {
      return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
    }
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
