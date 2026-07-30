import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewPreviewActivationGuard8W } from "./manualReviewPreviewActivationGuardsTypes8W";

function renderList(items: readonly string[]): string {
  return [
    "<ul>",
    ...items.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
  ].join("\n");
}

export function renderManualReviewPreviewActivationGuardsProduct8W(
  guard: ManualReviewPreviewActivationGuard8W,
): string {
  const summary = guard.activationReadinessSummary;
  return [
    '<section id="manual-review-preview-activation-guards-8w" class="premium-section manual-review-preview-activation-guards-8w" data-manual-review-preview-activation-guards-version="8W">',
    "<h2>Garde-fous d'activation preview</h2>",
    '<p class="eyebrow">preview documentee mais bloquee - aucun payload - aucune preview reelle</p>',
    "<p>Cette couche prepare les conditions qui devront etre vraies avant une future preview non persistante. Elle n'active pas la saisie, ne cree aucun payload, ne stocke rien et ne transforme jamais une revue coach en verite officielle.</p>",
    '<article class="product-card manual-review-preview-activation-summary-8w">',
    "<h3>Etat 8W</h3>",
    `<p><strong>Statut activation :</strong> ${escapeHtml(summary.previewActivationStatus)}.</p>`,
    `<p><strong>Readiness 8R :</strong> ready_for_non_persistent_preview; <strong>gate 8Q :</strong> needs_completion; <strong>visuel 8V :</strong> ready_for_static_visual_review.</p>`,
    `<p><strong>Conditions :</strong> ${summary.activationConditionCount}, dont ${summary.satisfiedActivationConditionCount} satisfaites comme garde-fous et ${summary.unsatisfiedActivationConditionCount} encore bloquees avant activation.</p>`,
    `<p><strong>Blockers :</strong> ${summary.blockingGuardCount}; <strong>refus :</strong> ${summary.refusalStateCount}.</p>`,
    `<p class="guard">${escapeHtml(summary.coachFacingReadout)}</p>`,
    "</article>",
    '<article class="product-card manual-review-preview-activation-distinction-8w">',
    "<h3>Distinction essentielle</h3>",
    "<p>La lisibilite 8V signifie: pret pour revue visuelle statique. L'activation preview 8W signifie seulement: preview documentee mais bloquee. La preview reelle reste bloquee.</p>",
    "</article>",
    '<article class="product-card manual-review-preview-activation-conditions-8w">',
    "<h3>Conditions avant activation future</h3>",
    "<div class=\"product-card-grid\">",
    ...guard.activationConditions.map((condition) => [
      '<article class="product-card manual-review-preview-activation-condition-8w">',
      `<h4>${escapeHtml(condition.label)}</h4>`,
      `<p>${escapeHtml(condition.description)}</p>`,
      `<p><strong>Etat 8W :</strong> ${condition.satisfiedIn8W ? "satisfait comme garde-fou" : "non satisfait avant activation"}.</p>`,
      `<p class="guard">${escapeHtml(condition.blockedReasonIn8W)}</p>`,
      "</article>",
    ].join("\n")),
    "</div>",
    "</article>",
    '<article class="product-card manual-review-preview-blocking-guards-8w">',
    "<h3>Blockers d'activation</h3>",
    "<ul>",
    ...guard.blockingGuards.map((blockingGuard) => `<li><strong>${escapeHtml(blockingGuard.blockingGuardId)} :</strong> ${escapeHtml(blockingGuard.coachFacingMessage)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-refusal-states-8w">',
    "<h3>Refusal states</h3>",
    "<ul>",
    ...guard.refusalStates.map((refusal) => `<li><strong>${escapeHtml(refusal.refusalStateId)} :</strong> ${escapeHtml(refusal.coachFacingMessage)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-readiness-8w">',
    "<h3>Ce qui est pret / bloque</h3>",
    "<h4>Pret</h4>",
    renderList(summary.whatIsReady),
    "<h4>Bloque</h4>",
    renderList(summary.whatIsBlocked),
    "<h4>Prochain sprint possible</h4>",
    renderList(summary.whatFutureSprintCanDo),
    "</article>",
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

export function insertManualReviewPreviewActivationGuardsProduct8W(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-activation-guards-8w"')) return productHtml;
  const visualIndex = productHtml.indexOf('id="manual-review-field-ux-visual-readiness-8v"');
  if (visualIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, visualIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
