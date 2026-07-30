import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewInputActivationRequirement8U,
  ManualReviewInputErrorState8U,
  ManualReviewInputField8U,
  ManualReviewInputFieldContract8U,
  ManualReviewInputFieldSection8U,
  ManualReviewInputRefusalState8U,
  ManualReviewInputValidationRule8U,
} from "./manualReviewInputFieldContractTypes8U";

function list(items: readonly string[]): string {
  return ["<ul>", ...items.map((item) => `<li>${escapeHtml(item)}</li>`), "</ul>"].join("\n");
}

function badge(label: string): string {
  return `<span class="badge manual-review-input-field-contract-badge-8u">${escapeHtml(label)}</span>`;
}

function renderSection(section: ManualReviewInputFieldSection8U): string {
  return [
    '<tr class="manual-review-input-section-row-8u">',
    `<td>${section.sectionOrder}</td>`,
    `<td>${escapeHtml(section.sectionTitle)}</td>`,
    `<td>${escapeHtml(section.sectionQuestion)}</td>`,
    `<td>${escapeHtml(section.linked8MReviewSectionId)}</td>`,
    `<td>${escapeHtml(section.linked8LObservationCardId)}</td>`,
    `<td>${escapeHtml(section.linked8KDecisionCardId)}</td>`,
    `<td>${section.fieldIds.length}</td>`,
    "<td>disabled</td>",
    "</tr>",
  ].join("");
}

function renderField(field: ManualReviewInputField8U): string {
  return [
    '<tr class="manual-review-input-field-row-8u" aria-disabled="true">',
    `<td>${escapeHtml(field.sectionId)}</td>`,
    `<td>${field.fieldOrder}</td>`,
    `<td>${escapeHtml(field.coachFacingLabel)}</td>`,
    `<td>${escapeHtml(field.fieldKind)}</td>`,
    `<td>${escapeHtml(field.expectedValueType)}</td>`,
    `<td>${field.allowedValues === undefined ? "-" : escapeHtml(field.allowedValues.join(" / "))}</td>`,
    `<td>${field.minValue ?? "-"}</td>`,
    `<td>${field.maxValue ?? field.maxLength ?? "-"}</td>`,
    `<td>${field.requiredLater ? "required later" : "optional later"}</td>`,
    "<td>disabledIn8U=true; activeIn8U=false; readOnlyIn8U=true</td>",
    `<td>${escapeHtml(field.placeholder)}</td>`,
    "</tr>",
  ].join("");
}

function renderRule(rule: ManualReviewInputValidationRule8U): string {
  return [
    "<tr>",
    `<td>${escapeHtml(rule.ruleId)}</td>`,
    `<td>${escapeHtml(rule.label)}</td>`,
    "<td>false</td>",
    `<td>${escapeHtml(rule.futureFailureCode)}</td>`,
    `<td>${escapeHtml(rule.ruleText)}</td>`,
    "</tr>",
  ].join("");
}

function renderError(error: ManualReviewInputErrorState8U): string {
  return [
    "<tr>",
    `<td>${escapeHtml(error.errorStateId)}</td>`,
    `<td>${escapeHtml(error.label)}</td>`,
    "<td>false</td>",
    `<td>${escapeHtml(error.coachFacingMessage)}</td>`,
    `<td>${error.blocksFuturePreview}</td>`,
    "</tr>",
  ].join("");
}

function renderRefusal(refusal: ManualReviewInputRefusalState8U): string {
  return [
    '<article class="product-card manual-review-input-refusal-card-8u">',
    `<h3>${escapeHtml(refusal.refusalStateId)}</h3>`,
    `<p>${escapeHtml(refusal.coachFacingMessage)}</p>`,
    `<p><strong>Raison technique :</strong> ${escapeHtml(refusal.technicalReason)}</p>`,
    `<p class="guard">Previent: ${escapeHtml(refusal.prevents.join(", "))}</p>`,
    "</article>",
  ].join("\n");
}

function renderRequirement(requirement: ManualReviewInputActivationRequirement8U): string {
  return [
    "<tr>",
    `<td>${escapeHtml(requirement.requirementId)}</td>`,
    `<td>${escapeHtml(requirement.label)}</td>`,
    "<td>false</td>",
    `<td>${escapeHtml(requirement.boundaryProtected)}</td>`,
    `<td>${escapeHtml(requirement.rationale)}</td>`,
    "</tr>",
  ].join("");
}

export function renderManualReviewInputFieldContractProduct8U(contract: ManualReviewInputFieldContract8U): string {
  return [
    '<section id="manual-review-input-field-contract-8u" class="premium-section manual-review-input-field-contract-8u" data-manual-review-input-field-contract-version="8U">',
    "<h2>Contrat des champs de saisie</h2>",
    '<p class="eyebrow">future_input_field_contract_only - champs statiques desactives</p>',
    "<p>Cette section definit les futurs champs de revue coach. Aucun champ reel n'est actif en 8U: pas de saisie traitee, pas de payload, pas de preview reelle, pas de submit, pas d'API, pas de stockage, pas de memoire, pas d'official truth, pas de selection et aucune consigne tactique.</p>",
    '<article class="product-card manual-review-input-summary-8u">',
    "<h3>Statut du contrat champs</h3>",
    `<p><strong>Sections :</strong> ${contract.fieldSections.length}.</p>`,
    `<p><strong>Champs futurs :</strong> ${contract.fields.length}, tous desactives et read-only.</p>`,
    `<p><strong>Regles futures :</strong> ${contract.validationRules.length}, toutes inactives en 8U.</p>`,
    `<p><strong>Etats d'erreur futurs :</strong> ${contract.errorStates.length}, tous inactifs en 8U.</p>`,
    `<p><strong>Etats de refus :</strong> ${contract.refusalStates.length}.</p>`,
    `<p><strong>Prerequis activation :</strong> ${contract.activationRequirements.length}, aucun satisfait en 8U.</p>`,
    '<div class="badge-row">',
    badge("Contrat champs 8U"),
    badge("Future uniquement"),
    badge("Champs desactives"),
    badge("Non officiel"),
    badge("Non persiste"),
    badge("Non applique"),
    "</div>",
    "</article>",
    '<article class="product-card manual-review-input-sections-8u">',
    "<h3>Sections de champs</h3>",
    '<table class="coach-table manual-review-input-section-table-8u">',
    "<thead><tr><th>Ordre</th><th>Section</th><th>Question</th><th>Lien 8M</th><th>Lien 8L</th><th>Lien 8K</th><th>Champs</th><th>Etat 8U</th></tr></thead>",
    `<tbody>${contract.fieldSections.map(renderSection).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    '<article class="product-card manual-review-input-fields-8u">',
    "<h3>Matrice des champs futurs</h3>",
    '<table class="coach-table manual-review-input-field-table-8u">',
    "<thead><tr><th>Section</th><th>Ordre</th><th>Label</th><th>Type</th><th>Valeur attendue</th><th>Valeurs</th><th>Min</th><th>Max</th><th>Obligation future</th><th>Etat 8U</th><th>Placeholder</th></tr></thead>",
    `<tbody>${contract.fields.map(renderField).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    '<article class="product-card manual-review-input-rules-8u">',
    "<h3>Regles de validation futures</h3>",
    '<table class="coach-table manual-review-input-rule-table-8u">',
    "<thead><tr><th>Regle</th><th>Label</th><th>Active 8U</th><th>Erreur future</th><th>Definition</th></tr></thead>",
    `<tbody>${contract.validationRules.map(renderRule).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    '<article class="product-card manual-review-input-errors-8u">',
    "<h3>Etats d'erreur futurs</h3>",
    '<table class="coach-table manual-review-input-error-table-8u">',
    "<thead><tr><th>Erreur</th><th>Label</th><th>Active 8U</th><th>Message coach futur</th><th>Bloque preview future</th></tr></thead>",
    `<tbody>${contract.errorStates.map(renderError).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    "<h3>Refusal states</h3>",
    '<div class="product-card-grid manual-review-input-refusal-grid-8u">',
    ...contract.refusalStates.map(renderRefusal),
    "</div>",
    '<article class="product-card manual-review-input-activation-8u">',
    "<h3>Prerequis avant activation</h3>",
    '<table class="coach-table manual-review-input-activation-table-8u">',
    "<thead><tr><th>Requirement</th><th>Label</th><th>Satisfait 8U</th><th>Frontiere protegee</th><th>Raison</th></tr></thead>",
    `<tbody>${contract.activationRequirements.map(renderRequirement).join("\n")}</tbody>`,
    "</table>",
    "</article>",
    '<article class="product-card manual-review-input-deferred-8u">',
    "<h3>Decisions differees</h3>",
    list(contract.deferredDecisions),
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

export function insertManualReviewInputFieldContractProduct8U(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-input-field-contract-8u"')) return productHtml;
  const interactionIndex = productHtml.indexOf('id="manual-review-ux-interaction-contract-8t"');
  if (interactionIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, interactionIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
