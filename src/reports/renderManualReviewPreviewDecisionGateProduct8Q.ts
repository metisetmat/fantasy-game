import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewDecisionGate8Q,
  ManualReviewPreviewDecisionGateBoundary8Q,
  ManualReviewPreviewDecisionGateCard8Q,
} from "./manualReviewPreviewDecisionGateTypes8Q";

function badge(label: string): string {
  return `<span class="badge manual-preview-decision-gate-badge-8q">${escapeHtml(label)}</span>`;
}

function renderCard(card: ManualReviewPreviewDecisionGateCard8Q): string {
  return [
    '<article class="product-card manual-review-preview-decision-gate-card-8q">',
    `<h3>${escapeHtml(card.observationTitle)}</h3>`,
    '<p class="eyebrow">Gate de lecture 8Q - preview demo</p>',
    `<p><strong>Statut 8P source :</strong> ${escapeHtml(card.answerStatusFrom8P)}</p>`,
    `<p><strong>Gate 8Q :</strong> ${escapeHtml(card.gateLabel)}</p>`,
    `<p><strong>Pourquoi :</strong> ${escapeHtml(card.gateReason)}</p>`,
    `<p><strong>A completer avant usage reel :</strong> ${escapeHtml(card.requiredBeforeRealUse)}</p>`,
    `<p><strong>Question coach suivante :</strong> ${escapeHtml(card.coachReviewQuestion)}</p>`,
    `<p class="guard">${escapeHtml(card.cautionNote)}</p>`,
    '<div class="badge-row">',
    badge("Preview demo"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    badge("Pas de decision automatique"),
    "</div>",
    "</article>",
  ].join("\n");
}

function renderBoundary(boundary: ManualReviewPreviewDecisionGateBoundary8Q): string {
  return [
    '<article class="product-card manual-review-preview-decision-gate-boundary-8q">',
    `<h3>${escapeHtml(boundary.label)}</h3>`,
    `<p>${escapeHtml(boundary.text)}</p>`,
    `<p class="eyebrow">Previent: ${escapeHtml(boundary.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

export function renderManualReviewPreviewDecisionGateProduct8Q(gate: ManualReviewPreviewDecisionGate8Q): string {
  return [
    '<section id="manual-review-preview-decision-gate-8q" class="premium-section manual-review-preview-decision-gate-8q" data-manual-review-preview-decision-gate-version="8Q">',
    "<h2>Porte de decision preview</h2>",
    '<p class="eyebrow">Statut de lisibilite - non officiel</p>',
    "<p>Cette section qualifie la lisibilite de la comparaison 8P. Elle ne decide rien pour le coach, ne stocke rien, ne modifie pas le rapport officiel et ne transforme pas la preview en verite de match.</p>",
    '<article class="product-card manual-review-preview-decision-gate-global-8q">',
    "<h3>Gate global</h3>",
    `<p><strong>Statut :</strong> ${escapeHtml(gate.globalGate.gateLabel)}.</p>`,
    `<p><strong>Pourquoi :</strong> ${escapeHtml(gate.globalGate.globalGateReason)}</p>`,
    `<p><strong>Utilisation :</strong> ${escapeHtml(gate.globalGate.coachFacingReadout)}</p>`,
    "<p><strong>Limite :</strong> aucune decision automatique.</p>",
    "</article>",
    '<div class="product-card-grid manual-review-preview-decision-gate-grid-8q">',
    ...gate.gateCards.map(renderCard),
    "</div>",
    '<article class="product-card manual-review-preview-decision-gate-can-8q">',
    "<h3>Ce qu'on peut faire</h3>",
    "<ul>",
    ...gate.globalGate.whatCanBeDiscussed.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-decision-gate-cannot-8q">',
    "<h3>Ce qu'on ne peut pas conclure</h3>",
    "<ul>",
    ...gate.globalGate.whatCannotBeConcluded.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-decision-gate-missing-8q">',
    "<h3>Informations a completer</h3>",
    "<ul>",
    ...gate.missingInformation.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
    "<h3>Frontieres du gate</h3>",
    '<div class="product-card-grid manual-review-preview-decision-gate-boundaries-8q">',
    ...gate.boundaryNotes.filter((boundary) => boundary.visibleInProduct).map(renderBoundary),
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

export function insertManualReviewPreviewDecisionGateProduct8Q(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-decision-gate-8q"')) return productHtml;
  const comparisonIndex = productHtml.indexOf('id="manual-review-preview-comparison-8p"');
  if (comparisonIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, comparisonIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
