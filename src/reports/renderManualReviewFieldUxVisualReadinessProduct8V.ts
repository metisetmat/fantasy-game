import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewFieldUxVisualCard8V,
  ManualReviewFieldUxVisualGroup8V,
  ManualReviewFieldUxVisualReadiness8V,
  ManualReviewFieldUxVisualSection8V,
} from "./manualReviewFieldUxVisualReadinessTypes8V";

function badge(label: string): string {
  return `<span class="badge manual-review-field-ux-badge-8v">${escapeHtml(label)}</span>`;
}

function renderCard(card: ManualReviewFieldUxVisualCard8V): string {
  return [
    '<article class="product-card manual-review-field-ux-card-8v" aria-disabled="true" data-field-ux-visual-state="future-disabled-static">',
    `<p class="eyebrow">${escapeHtml(card.visualComponentPreview.replace(/_/gu, " "))}</p>`,
    `<h4>${escapeHtml(card.coachFacingLabel)}</h4>`,
    `<p>${escapeHtml(card.fieldPurpose)}</p>`,
    `<p><strong>Contrainte :</strong> ${escapeHtml(card.constraintSummary)}</p>`,
    `<p><strong>Validation future :</strong> ${escapeHtml(card.futureValidationSummary)}</p>`,
    `<p><strong>Erreur future :</strong> ${escapeHtml(card.futureErrorSummary)}</p>`,
    `<p><strong>Etat 8V :</strong> ${escapeHtml(card.disabledReason)}</p>`,
    `<p class="manual-review-field-ux-mock-8v">${escapeHtml(card.placeholder)}</p>`,
    `<p class="muted">${escapeHtml(card.helpText)}</p>`,
    '<div class="badge-row">',
    ...card.badges.map(badge),
    "</div>",
    "</article>",
  ].join("\n");
}

function renderGroup(
  group: ManualReviewFieldUxVisualGroup8V,
  cards: readonly ManualReviewFieldUxVisualCard8V[],
): string {
  return [
    '<article class="product-card manual-review-field-ux-group-8v">',
    `<h3>${escapeHtml(group.groupTitle)}</h3>`,
    `<p>${escapeHtml(group.coachFacingExplanation)}</p>`,
    `<p class="guard">${escapeHtml(group.groupPurpose)}</p>`,
    '<div class="product-card-grid manual-review-field-ux-card-grid-8v">',
    ...cards.map(renderCard),
    "</div>",
    "</article>",
  ].join("\n");
}

function renderSection(
  section: ManualReviewFieldUxVisualSection8V,
  groups: readonly ManualReviewFieldUxVisualGroup8V[],
  cards: readonly ManualReviewFieldUxVisualCard8V[],
): string {
  return [
    '<article class="product-card manual-review-field-ux-section-8v" data-field-ux-visual-section="true">',
    `<h3>${section.sectionOrder}. ${escapeHtml(section.sectionTitle)}</h3>`,
    `<p>${escapeHtml(section.coachFacingQuestion)}</p>`,
    `<p>${escapeHtml(section.visualSummary)}</p>`,
    ...groups.map((group) => renderGroup(group, cards.filter((card) => card.groupId === group.visualGroupId))),
    "</article>",
  ].join("\n");
}

export function renderManualReviewFieldUxVisualReadinessProduct8V(
  visualReadiness: ManualReviewFieldUxVisualReadiness8V,
): string {
  return [
    '<section id="manual-review-field-ux-visual-readiness-8v" class="premium-section manual-review-field-ux-visual-readiness-8v" data-manual-review-field-ux-visual-readiness-version="8V">',
    "<h2>Lisibilite visuelle des champs</h2>",
    '<p class="eyebrow">future_field_visual_readiness_only - aucun champ actif</p>',
    "<p>Cette couche rend le contrat 8U plus lisible pour un coach: sections, groupes, contraintes, etats futurs et badges sont visibles, mais rien n'est saisissable, envoye, stocke, applique ou officialise.</p>",
    '<article class="product-card manual-review-field-ux-summary-8v">',
    "<h3>Etat visuel 8V</h3>",
    `<p><strong>Sections :</strong> ${visualReadiness.visualSections.length}; <strong>groupes :</strong> ${visualReadiness.visualFieldGroups.length}; <strong>cartes champs :</strong> ${visualReadiness.visualFieldCards.length}.</p>`,
    `<p><strong>Score lisibilite coach :</strong> ${visualReadiness.visualReadinessSummary.coachReadabilityScore}/100.</p>`,
    `<p><strong>Workflow 8S :</strong> ${escapeHtml(visualReadiness.visualReadinessSummary.workflowReadinessStatusFrom8S)}; <strong>gate 8Q :</strong> ${escapeHtml(visualReadiness.visualReadinessSummary.reviewGateStatusFrom8Q)}.</p>`,
    '<div class="badge-row">',
    badge("Futur"),
    badge("Desactive"),
    badge("Read-only"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    "</div>",
    "</article>",
    ...visualReadiness.visualSections.map((section) =>
      renderSection(
        section,
        visualReadiness.visualFieldGroups.filter((group) => group.sectionId === section.visualSectionId),
        visualReadiness.visualFieldCards.filter((card) => card.sectionId === section.visualSectionId),
      )
    ),
    '<article class="product-card manual-review-field-ux-validation-8v">',
    "<h3>Contraintes et erreurs futures</h3>",
    `<p><strong>Regles visibles :</strong> ${visualReadiness.visualValidationSummary.validationRuleCount}, toutes inactives en 8V.</p>`,
    `<p><strong>Erreurs futures visibles :</strong> ${visualReadiness.visualErrorSummary.errorStateCount}, toutes inactives en 8V.</p>`,
    `<p><strong>Refus visibles :</strong> ${visualReadiness.visualRefusalSummary.length}.</p>`,
    `<p>${escapeHtml(visualReadiness.visualValidationSummary.coachFacingSummary)}</p>`,
    `<p>${escapeHtml(visualReadiness.visualErrorSummary.coachFacingSummary)}</p>`,
    "</article>",
    '<article class="product-card manual-review-field-ux-boundaries-8v">',
    "<h3>Frontieres protegees</h3>",
    "<ul>",
    ...visualReadiness.boundaries.map((boundary) => `<li><strong>${escapeHtml(boundary.label)} :</strong> ${escapeHtml(boundary.text)}</li>`),
    "</ul>",
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

export function insertManualReviewFieldUxVisualReadinessProduct8V(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-field-ux-visual-readiness-8v"')) return productHtml;
  const inputFieldIndex = productHtml.indexOf('id="manual-review-input-field-contract-8u"');
  if (inputFieldIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, inputFieldIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
