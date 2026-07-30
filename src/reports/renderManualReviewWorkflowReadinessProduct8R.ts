import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewWorkflowBoundary8R,
  ManualReviewWorkflowReadiness8R,
  ManualReviewWorkflowStage8R,
} from "./manualReviewWorkflowReadinessTypes8R";

function badge(label: string): string {
  return `<span class="badge manual-review-workflow-readiness-badge-8r">${escapeHtml(label)}</span>`;
}

function renderStage(stage: ManualReviewWorkflowStage8R): string {
  return [
    '<article class="product-card manual-review-workflow-stage-card-8r">',
    `<p class="eyebrow">${escapeHtml(stage.stageVersion)} - ${escapeHtml(stage.ready ? "ready" : "blocked")}</p>`,
    `<h3>${escapeHtml(stage.stageTitle)}</h3>`,
    `<p><strong>Role :</strong> ${escapeHtml(stage.stagePurpose)}</p>`,
    `<p><strong>Entree :</strong> ${escapeHtml(stage.input)}</p>`,
    `<p><strong>Sortie :</strong> ${escapeHtml(stage.output)}</p>`,
    "<ul>",
    ...stage.guardrails.map((guardrail) => `<li>${escapeHtml(guardrail)}</li>`),
    "</ul>",
    "</article>",
  ].join("\n");
}

function renderBoundary(boundary: ManualReviewWorkflowBoundary8R): string {
  return [
    '<article class="product-card manual-review-workflow-boundary-8r">',
    `<h3>${escapeHtml(boundary.label)}</h3>`,
    `<p>${escapeHtml(boundary.text)}</p>`,
    `<p class="eyebrow">Previent: ${escapeHtml(boundary.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

export function renderManualReviewWorkflowReadinessProduct8R(workflow: ManualReviewWorkflowReadiness8R): string {
  return [
    '<section id="manual-review-workflow-readiness-8r" class="premium-section manual-review-workflow-readiness-8r" data-manual-review-workflow-readiness-version="8R">',
    "<h2>Workflow de revue manuelle</h2>",
    '<p class="eyebrow">Pret pour preview non persistante</p>',
    "<p>Cette section relie le formulaire 8M, l'intake 8N, la preview 8O, la comparaison 8P et le gate 8Q. Le workflow est pret pour une demo non persistante, mais la revue de demonstration reste a completer avant tout usage reel.</p>",
    '<article class="product-card manual-review-workflow-status-8r">',
    "<h3>Statut global du workflow</h3>",
    "<p><strong>Workflow :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate de la revue actuelle :</strong> a completer.</p>",
    "<p><strong>Pourquoi :</strong> les 5 etapes existent et sont liees, mais le gate 8Q indique encore 1 lisible / 1 a completer / 1 insuffisant.</p>",
    "<p><strong>Utilisation :</strong> tester le parcours de lecture.</p>",
    "<p><strong>Limite :</strong> aucune decision automatique, aucun stockage, aucune verite officielle.</p>",
    '<div class="badge-row">',
    badge("Workflow demo 8R"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    badge("Pas de decision automatique"),
    "</div>",
    "</article>",
    '<div class="product-card-grid manual-review-workflow-stage-grid-8r">',
    ...workflow.stages.map(renderStage),
    "</div>",
    '<article class="product-card manual-review-workflow-ready-8r">',
    "<h3>Ce qui est pret</h3>",
    "<ul>",
    ...workflow.readinessSummary.whatIsReady.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-workflow-missing-8r">',
    "<h3>Ce qui manque avant usage reel</h3>",
    "<ul>",
    ...workflow.readinessSummary.whatStillNeedsWork.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
    "<h3>Frontieres</h3>",
    '<div class="product-card-grid manual-review-workflow-boundaries-8r">',
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

export function insertManualReviewWorkflowReadinessProduct8R(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-workflow-readiness-8r"')) return productHtml;
  const gateIndex = productHtml.indexOf('id="manual-review-preview-decision-gate-8q"');
  if (gateIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, gateIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
