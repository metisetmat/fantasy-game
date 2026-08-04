import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewPreviewPayloadValidationContract8Y } from "./manualReviewPreviewPayloadValidationContractTypes8Y";

function renderList(items: readonly string[]): string {
  return [
    "<ul>",
    ...items.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
  ].join("\n");
}

function renderRuleMatrix(contract: ManualReviewPreviewPayloadValidationContract8Y): string {
  return [
    '<table class="stat-table manual-review-validation-matrix-8y">',
    "<thead><tr><th>Regle</th><th>Champ</th><th>Erreur</th><th>Message coach</th><th>Blocker</th></tr></thead>",
    "<tbody>",
    ...contract.ruleMappings.slice(0, 12).map((mapping) => {
      const message = contract.errorMessages.find((item) => item.messageId === mapping.coachFacingErrorMessageId);
      return [
        "<tr>",
        `<td>${escapeHtml(mapping.ruleId)}</td>`,
        `<td>${escapeHtml(mapping.appliesToPayloadField)}${mapping.appliesToEntryField === undefined ? "" : ` / ${escapeHtml(mapping.appliesToEntryField)}`}</td>`,
        `<td>${escapeHtml(mapping.errorStateId)}</td>`,
        `<td>${escapeHtml(message?.coachFacingMessage ?? mapping.validationIntent)}</td>`,
        `<td>${escapeHtml(mapping.blockerId)}</td>`,
        "</tr>",
      ].join("");
    }),
    "</tbody>",
    "</table>",
  ].join("\n");
}

export function renderManualReviewPreviewPayloadValidationContractProduct8Y(
  contract: ManualReviewPreviewPayloadValidationContract8Y,
): string {
  const summary = contract.validationReadinessSummary;
  return [
    '<section id="manual-review-preview-payload-validation-contract-8y" class="premium-section manual-review-preview-payload-validation-contract-8y" data-manual-review-preview-payload-validation-contract-version="8Y">',
    "<h2>Contrat de validation du payload</h2>",
    '<p class="eyebrow">Validation future documentee - aucune execution</p>',
    "<p>Cette section definit les validations futures du payload preview-only. Aucune validation runtime n'est active en 8Y : aucun payload reel n'est lu, accepte, instancie, valide, envoye, stocke, applique ou officialise.</p>",
    '<article class="product-card manual-review-preview-payload-validation-status-8y">',
    "<h3>Statut validation</h3>",
    `<p><strong>Contrat validation :</strong> ${escapeHtml(summary.validationContractStatus)}. <strong>Validation runtime :</strong> inactive. <strong>Payload reel lu :</strong> ${summary.realPayloadReadCount}. <strong>Payload reel cree :</strong> 0. <strong>Preview reelle :</strong> 0.</p>`,
    "<p><strong>Source attendue :</strong> manual_non_official. <strong>Scope attendu :</strong> preview_only.</p>",
    "<p><strong>Payload contract 8X :</strong> documented_but_not_instantiated. <strong>Activation 8W :</strong> documented_but_blocked. <strong>Workflow 8R :</strong> ready_for_non_persistent_preview. <strong>Gate 8Q :</strong> needs_completion.</p>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-validation-steps-8y">',
    "<h3>Ordre de validation futur</h3>",
    renderList(contract.orderedValidationSteps.map((step) => `${step.order}. ${step.label} - documente, futur runtime only, actif 8Y=false`)),
    "</article>",
    '<article class="product-card manual-review-preview-payload-validation-groups-8y">',
    "<h3>Groupes de validation</h3>",
    "<div class=\"product-card-grid\">",
    ...contract.validationGroups.map((group) => [
      '<article class="product-card manual-review-preview-payload-validation-group-8y">',
      `<h4>${escapeHtml(group.label)}</h4>`,
      `<p>${escapeHtml(group.purpose)}</p>`,
      `<p><strong>Regles :</strong> ${escapeHtml(group.ruleIds.join(", "))}.</p>`,
      "</article>",
    ].join("\n")),
    "</div>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-validation-matrix-8y">',
    "<h3>Rule -> field -> error -> blocker</h3>",
    "<p>Matrice compacte des validations futures : chaque regle pointe vers un champ, une erreur, un message coach et un blocker. Les regles restent inactives en 8Y.</p>",
    renderRuleMatrix(contract),
    "</article>",
    '<article class="product-card manual-review-preview-payload-entry-contracts-8y">',
    "<h3>Contrats d'entrees d'observation</h3>",
    '<p class="guard">Contrats de forme uniquement : aucune instance reelle, aucun payload cree.</p>',
    "<ul>",
    ...contract.observationEntryContracts.map((entry) => `<li><strong>${escapeHtml(entry.label)} :</strong> contract shape only, runtime instance=false, active 8Y=false.</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-error-messages-8y">',
    "<h3>Messages d'erreur coach</h3>",
    "<ul>",
    ...contract.errorMessages.slice(0, 10).map((message) => `<li><strong>${escapeHtml(message.coachFacingTitle)} :</strong> ${escapeHtml(message.coachFacingMessage)}</li>`),
    "</ul>",
    "</article>",
    '<article class="product-card manual-review-preview-payload-blockers-8y">',
    "<h3>Blockers</h3>",
    renderList(contract.validationBlockers.map((blocker) => `${blocker.blockerId}: ${blocker.coachFacingMessage}`)),
    "</article>",
    '<article class="product-card manual-review-preview-payload-refusals-8y">',
    "<h3>Refusal states</h3>",
    renderList(contract.refusalStates.map((refusal) => `${refusal.refusalStateId}: ${refusal.coachFacingMessage}`)),
    "</article>",
    '<article class="product-card manual-review-preview-payload-readiness-8y">',
    "<h3>Ce qui est pret</h3>",
    renderList(summary.whatIsReady),
    "<h3>Ce qui reste bloque</h3>",
    renderList(summary.whatIsBlocked),
    '<p class="guard">Distinction maintenue : contrat de validation documente, validation runtime inactive, payload reel absent, preview reelle non generee.</p>',
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

export function insertManualReviewPreviewPayloadValidationContractProduct8Y(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-validation-contract-8y"')) return productHtml;
  const payloadContractIndex = productHtml.indexOf('id="manual-review-preview-payload-contract-8x"');
  if (payloadContractIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, payloadContractIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
