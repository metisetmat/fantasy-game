import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewComparison8P,
  ManualReviewPreviewComparisonBoundary8P,
  ManualReviewPreviewComparisonCard8P,
} from "./manualReviewPreviewComparisonTypes8P";

function badge(label: string): string {
  return `<span class="badge manual-preview-comparison-badge-8p">${escapeHtml(label)}</span>`;
}

function answerLabel(value: ManualReviewPreviewComparisonCard8P["answerStatus"]): string {
  if (value === "answers_question") return "repond a la question";
  if (value === "partially_answers_question") return "repond partiellement";
  return "insuffisant pour repondre";
}

function renderCard(card: ManualReviewPreviewComparisonCard8P): string {
  return [
    '<article class="product-card manual-review-preview-comparison-card-8p">',
    `<h3>${escapeHtml(card.observationTitle)}</h3>`,
    '<p class="eyebrow">Comparaison demo - non officielle</p>',
    `<p><strong>Question 8K/8L :</strong> ${escapeHtml(card.originalObservationQuestion)}</p>`,
    `<p><strong>Outcome preview 8O :</strong> ${escapeHtml(card.previewOutcome)} (${escapeHtml(card.previewCounts)}, contexte ${escapeHtml(card.previewContextComparable)})</p>`,
    `<p><strong>Statut de reponse :</strong> ${escapeHtml(answerLabel(card.answerStatus))}</p>`,
    `<p>${escapeHtml(card.comparisonReadout)}</p>`,
    `<p><strong>Ce qui correspond au plan :</strong> ${escapeHtml(card.whatMatchesThePlan)}</p>`,
    `<p><strong>Ce qui ne repond pas encore :</strong> ${escapeHtml(card.whatDoesNotAnswerYet)}</p>`,
    `<p><strong>Ecart a relire :</strong> ${escapeHtml(card.gapToReview)}</p>`,
    `<p><strong>Prochaine question coach :</strong> ${escapeHtml(card.nextCoachQuestion)}</p>`,
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

function renderBoundary(boundary: ManualReviewPreviewComparisonBoundary8P): string {
  return [
    '<article class="product-card manual-review-preview-comparison-boundary-8p">',
    `<h3>${escapeHtml(boundary.label)}</h3>`,
    `<p>${escapeHtml(boundary.text)}</p>`,
    `<p class="eyebrow">Previent: ${escapeHtml(boundary.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

export function renderManualReviewPreviewComparisonProduct8P(comparison: ManualReviewPreviewComparison8P): string {
  return [
    '<section id="manual-review-preview-comparison-8p" class="premium-section manual-review-preview-comparison-8p" data-manual-review-preview-comparison-version="8P">',
    "<h2>Comparaison preview vs plan d'observation</h2>",
    '<p class="eyebrow">Lecture de coherence - non officielle</p>',
    "<p>Cette section compare la preview manuelle 8O avec les questions d'observation definies en 8K/8L. Les donnees restent une fixture de demonstration : elles ne viennent pas d'un vrai prochain match, ne sont pas stockees, ne sont pas appliquees et ne modifient pas le rapport officiel.</p>",
    '<article class="product-card manual-review-preview-comparison-measure-8p">',
    "<h3>Ce que cette comparaison mesure</h3>",
    "<ul>",
    "<li>Est-ce que la reponse preview couvre la question initiale ?</li>",
    "<li>Est-ce que les compteurs sont suffisants ?</li>",
    "<li>Est-ce que le contexte est comparable ?</li>",
    "<li>Quel point reste a verifier ?</li>",
    "<li>Ce bloc ne decide rien.</li>",
    "</ul>",
    "</article>",
    '<div class="product-card-grid manual-review-preview-comparison-grid-8p">',
    ...comparison.comparisonCards.map(renderCard),
    "</div>",
    '<article class="product-card manual-review-preview-comparison-summary-8p">',
    "<h3>Synthese prudente</h3>",
    `<p>${escapeHtml(comparison.comparisonSummary.comparisonReadout)}</p>`,
    "<ul>",
    `<li>Repond a la question : ${comparison.comparisonSummary.answersQuestionCount}</li>`,
    `<li>Repond partiellement : ${comparison.comparisonSummary.partiallyAnswersQuestionCount}</li>`,
    `<li>Insuffisant pour repondre : ${comparison.comparisonSummary.insufficientToAnswerCount}</li>`,
    "</ul>",
    `<p>${escapeHtml(comparison.comparisonSummary.cautionReadout)}</p>`,
    `<p><strong>Prochaine question coach :</strong> ${escapeHtml(comparison.comparisonSummary.nextCoachQuestion)}</p>`,
    "</article>",
    "<h3>Frontieres</h3>",
    '<div class="product-card-grid manual-review-preview-comparison-boundaries-8p">',
    ...comparison.boundaryNotes.filter((boundary) => boundary.visibleInProduct).map(renderBoundary),
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

export function insertManualReviewPreviewComparisonProduct8P(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-comparison-8p"')) return productHtml;
  const previewIndex = productHtml.indexOf('id="manual-review-preview-renderer-8o"');
  if (previewIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, previewIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
