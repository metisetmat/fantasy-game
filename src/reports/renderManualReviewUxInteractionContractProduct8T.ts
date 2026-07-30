import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewUxActivationRequirement8T,
  ManualReviewUxFutureInteraction8T,
  ManualReviewUxInteractionContract8T,
  ManualReviewUxInteractionStep8T,
  ManualReviewUxRefusalState8T,
} from "./manualReviewUxInteractionContractTypes8T";

function list(items: readonly string[]): string {
  return ["<ul>", ...items.map((item) => `<li>${escapeHtml(item)}</li>`), "</ul>"].join("\n");
}

function badge(label: string): string {
  return `<span class="badge manual-review-ux-interaction-contract-badge-8t">${escapeHtml(label)}</span>`;
}

function renderStep(step: ManualReviewUxInteractionStep8T): string {
  return [
    '<tr class="manual-review-ux-interaction-step-row-8t">',
    `<td>${escapeHtml(step.sourceVersion)}</td>`,
    `<td>${escapeHtml(step.coachFacingLabel)}</td>`,
    `<td>documented_but_blocked</td>`,
    `<td>${escapeHtml(step.blockedReason)}</td>`,
    `<td>${escapeHtml(step.activationRequires.join("; "))}</td>`,
    `<td>${escapeHtml(step.refusalStateId)}</td>`,
    "</tr>",
  ].join("");
}

function renderFutureInteraction(interaction: ManualReviewUxFutureInteraction8T): string {
  return [
    '<article class="product-card manual-review-ux-future-interaction-card-8t" aria-disabled="true">',
    `<p class="eyebrow">${escapeHtml(interaction.sourceStepVersion)} - ${escapeHtml(interaction.statusIn8T)}</p>`,
    `<h3>${escapeHtml(interaction.label)}</h3>`,
    `<p><strong>Intention future :</strong> ${escapeHtml(interaction.futureIntent)}</p>`,
    `<p><strong>Traitement 8T :</strong> ${escapeHtml(interaction.currentUiTreatment)}</p>`,
    `<p><strong>Raison de blocage :</strong> ${escapeHtml(interaction.blockedReason)}</p>`,
    "<p><strong>Avant activation :</strong></p>",
    list(interaction.requiredBeforeActivation),
    "<p><strong>Doit toujours eviter :</strong></p>",
    list(interaction.mustNeverDo),
    `<p class="guard">Refus affiche: ${escapeHtml(interaction.refusalStateId)}. Interaction future documentee mais bloquee.</p>`,
    "</article>",
  ].join("\n");
}

function renderRefusalState(refusal: ManualReviewUxRefusalState8T): string {
  return [
    '<article class="product-card manual-review-ux-refusal-state-card-8t">',
    `<p class="eyebrow">${escapeHtml(refusal.severity)} - action future desactivee en 8T</p>`,
    `<h3>${escapeHtml(refusal.title)}</h3>`,
    `<p>${escapeHtml(refusal.coachFacingMessage)}</p>`,
    `<p><strong>Raison technique :</strong> ${escapeHtml(refusal.technicalReason)}</p>`,
    `<p><strong>Decision future requise :</strong> ${escapeHtml(refusal.requiredFutureDecision)}</p>`,
    `<p class="guard">Previent: ${escapeHtml(refusal.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

function renderRequirement(requirement: ManualReviewUxActivationRequirement8T): string {
  return [
    "<tr>",
    `<td>${escapeHtml(requirement.requirementId)}</td>`,
    `<td>${escapeHtml(requirement.label)}</td>`,
    `<td>false</td>`,
    `<td>${escapeHtml(requirement.futureSprintCandidate)}</td>`,
    `<td>${escapeHtml(requirement.boundaryProtected)}</td>`,
    "</tr>",
  ].join("");
}

export function renderManualReviewUxInteractionContractProduct8T(contract: ManualReviewUxInteractionContract8T): string {
  return [
    '<section id="manual-review-ux-interaction-contract-8t" class="premium-section manual-review-ux-interaction-contract-8t" data-manual-review-ux-interaction-contract-version="8T">',
    "<h2>Contrat d'interaction UX</h2>",
    "<p class=\"eyebrow\">Interactions futures documentees - toujours desactivees</p>",
    "<p>Cette section decrit ce que les interactions du futur parcours pourront faire, mais aucune interaction reelle n'est activee en 8T. Le parcours reste non interactif, non officiel, non persiste et sans submit/API/backend.</p>",
    '<article class="product-card manual-review-ux-interaction-status-8t">',
    "<h3>Statut du contrat</h3>",
    "<p><strong>Contrat UX :</strong> pret en lecture.</p>",
    "<p><strong>Interactions futures :</strong> documentees mais bloquees.</p>",
    "<p><strong>Workflow 8R :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate 8Q :</strong> a completer.</p>",
    "<p><strong>Actions activees :</strong> 0.</p>",
    "<p><strong>Limite :</strong> pas de stockage, pas de submit, pas d'API, pas de decision automatique.</p>",
    '<div class="badge-row">',
    badge("Contrat UX 8T"),
    badge("Future only"),
    badge("Non interactif"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    "</div>",
    "</article>",
    '<article class="product-card manual-review-ux-interaction-matrix-8t">',
    "<h3>Matrice des interactions futures</h3>",
    '<table class="coach-table manual-review-ux-interaction-table-8t">',
    "<thead><tr><th>Etape</th><th>Interaction future</th><th>Statut 8T</th><th>Raison de blocage</th><th>Prerequis avant activation</th><th>Refus affiche</th></tr></thead>",
    `<tbody>${contract.interactionSteps.map(renderStep).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    "<h3>Refusal states</h3>",
    '<div class="product-card-grid manual-review-ux-refusal-state-grid-8t">',
    ...contract.refusalStates.map(renderRefusalState),
    "</div>",
    '<article class="product-card manual-review-ux-deferred-decisions-8t">',
    "<h3>Decisions differees</h3>",
    list(contract.deferredDecisions),
    "</article>",
    '<article class="product-card manual-review-ux-activation-requirements-8t">',
    "<h3>Activation requirements</h3>",
    '<table class="coach-table manual-review-ux-requirement-table-8t">',
    "<thead><tr><th>Requirement</th><th>Label</th><th>Satisfait en 8T</th><th>Future sprint</th><th>Frontiere protegee</th></tr></thead>",
    `<tbody>${contract.activationRequirements.map(renderRequirement).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    "<h3>Interactions futures documentees</h3>",
    '<div class="product-card-grid manual-review-ux-future-interaction-grid-8t">',
    ...contract.futureInteractions.map(renderFutureInteraction),
    "</div>",
    '<article class="product-card manual-review-ux-forbidden-8t">',
    "<h3>Ce qui reste interdit</h3>",
    list([
      "vrai submit",
      "API/backend",
      "localStorage",
      "DB",
      "fichier",
      "memoire",
      "official truth",
      "decision automatique",
      "selection",
      "tactique",
      "mutation score/timeline",
    ]),
    "</article>",
    '<article class="product-card manual-review-ux-ready-8t">',
    "<h3>Ce qui est pret</h3>",
    list([
      "le parcours UX est lisible",
      "les interactions futures sont nommees",
      "les refus sont definis",
      "les preconditions sont listees",
      "les frontieres source-of-truth sont maintenues",
    ]),
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

export function insertManualReviewUxInteractionContractProduct8T(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-ux-interaction-contract-8t"')) return productHtml;
  const skeletonIndex = productHtml.indexOf('id="manual-review-workflow-ux-skeleton-8s"');
  if (skeletonIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, skeletonIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
