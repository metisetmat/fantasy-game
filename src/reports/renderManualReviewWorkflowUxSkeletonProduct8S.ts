import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewWorkflowUxDisabledAction8S,
  ManualReviewWorkflowUxSkeleton8S,
  ManualReviewWorkflowUxSkeletonBoundary8S,
  ManualReviewWorkflowUxStep8S,
} from "./manualReviewWorkflowUxSkeletonTypes8S";

function badge(label: string): string {
  return `<span class="badge manual-review-workflow-ux-skeleton-badge-8s">${escapeHtml(label)}</span>`;
}

function renderStep(step: ManualReviewWorkflowUxStep8S): string {
  return [
    '<article class="product-card manual-review-workflow-ux-step-card-8s" data-ux-step-version="' + escapeHtml(step.sourceVersion) + '">',
    `<p class="eyebrow">${escapeHtml(step.sourceVersion)} - ${escapeHtml(step.uxComponentKind)}</p>`,
    `<h3>${escapeHtml(step.coachFacingLabel)}</h3>`,
    `<p><strong>Etat affiche :</strong> ${escapeHtml(step.displayedState)}</p>`,
    `<p><strong>Entree :</strong> ${escapeHtml(step.inputLabel)}</p>`,
    `<p><strong>Sortie :</strong> ${escapeHtml(step.outputLabel)}</p>`,
    `<p><strong>Utile parce que :</strong> ${escapeHtml(step.usefulBecause)}</p>`,
    `<p><strong>Desactive dans 8S :</strong> ${escapeHtml(step.disabledBecause)}</p>`,
    "<ul>",
    ...step.guardrails.map((guardrail) => `<li>${escapeHtml(guardrail)}</li>`),
    "</ul>",
    '<p class="guard">Non interactif: aucune saisie, aucun submit, aucun stockage, aucune application.</p>',
    "</article>",
  ].join("\n");
}

function renderDisabledAction(action: ManualReviewWorkflowUxDisabledAction8S): string {
  return [
    '<article class="product-card manual-review-workflow-disabled-action-8s" aria-disabled="true">',
    `<p class="eyebrow">Action future desactivee</p>`,
    `<h3>${escapeHtml(action.label)}</h3>`,
    `<p><strong>Capacite future :</strong> ${escapeHtml(action.targetFutureCapability)}</p>`,
    `<p><strong>Raison :</strong> ${escapeHtml(action.disabledReason)}</p>`,
    `<p class="guard">Doit rester desactive en 8S: ${escapeHtml(action.forbiddenIfEnabled.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

function renderBoundary(boundary: ManualReviewWorkflowUxSkeletonBoundary8S): string {
  return [
    '<article class="product-card manual-review-workflow-ux-boundary-8s">',
    `<h3>${escapeHtml(boundary.label)}</h3>`,
    `<p>${escapeHtml(boundary.text)}</p>`,
    `<p class="eyebrow">Previent: ${escapeHtml(boundary.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

export function renderManualReviewWorkflowUxSkeletonProduct8S(workflow: ManualReviewWorkflowUxSkeleton8S): string {
  return [
    '<section id="manual-review-workflow-ux-skeleton-8s" class="premium-section manual-review-workflow-ux-skeleton-8s" data-manual-review-workflow-ux-skeleton-version="8S">',
    "<h2>Squelette UX de revue manuelle</h2>",
    '<p class="eyebrow">Parcours visible - aucune action activee</p>',
    "<p>Cette section montre le squelette UX du parcours de revue manuelle. Le workflow est pret pour une preview non persistante, mais la revue de demonstration reste a completer. Aucun bouton n'envoie, ne stocke, n'applique ou n'officialise quoi que ce soit.</p>",
    '<article class="product-card manual-review-workflow-ux-status-8s">',
    "<h3>Statut du parcours</h3>",
    "<p><strong>Parcours UX :</strong> pret en squelette.</p>",
    "<p><strong>Workflow 8R :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate 8Q :</strong> a completer.</p>",
    "<p><strong>Actions :</strong> toutes desactivees.</p>",
    "<p><strong>Limite :</strong> pas de stockage, pas de submit, pas de decision automatique.</p>",
    '<div class="badge-row">',
    badge("Squelette UX 8S"),
    badge("Demo only"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    "</div>",
    "</article>",
    '<div class="product-card-grid manual-review-workflow-ux-step-grid-8s">',
    ...workflow.steps.map(renderStep),
    "</div>",
    '<article class="product-card manual-review-workflow-ux-ready-8s">',
    "<h3>Ce qui est pret</h3>",
    "<ul>",
    "<li>Le parcours est comprehensible.</li>",
    "<li>Les etapes sont ordonnees.</li>",
    "<li>Les statuts sont lisibles.</li>",
    "<li>Les limites sont visibles.</li>",
    "<li>L'export compact sait resumer le parcours.</li>",
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-workflow-ux-not-ready-8s">',
    "<h3>Ce qui n'est pas encore pret</h3>",
    "<ul>",
    "<li>Saisie reelle.</li>",
    "<li>Validation reelle de payload.</li>",
    "<li>Persistance.</li>",
    "<li>Permissions.</li>",
    "<li>Historique.</li>",
    "<li>Promotion eventuelle vers memoire ou historique.</li>",
    "<li>Decision produit sur stockage.</li>",
    "</ul>",
    "</article>",
    "<h3>Actions futures desactivees</h3>",
    '<div class="product-card-grid manual-review-workflow-disabled-actions-8s">',
    ...workflow.disabledActions.map(renderDisabledAction),
    "</div>",
    "<h3>Frontieres</h3>",
    '<div class="product-card-grid manual-review-workflow-ux-boundaries-8s">',
    ...workflow.boundaries.filter((boundary) => boundary.visibleInProduct).map(renderBoundary),
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

export function insertManualReviewWorkflowUxSkeletonProduct8S(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-workflow-ux-skeleton-8s"')) return productHtml;
  const readinessIndex = productHtml.indexOf('id="manual-review-workflow-readiness-8r"');
  if (readinessIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, readinessIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
