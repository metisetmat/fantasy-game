import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewValidationContractAuditConsistencyRepair8ZModel } from "./manualReviewValidationContractAuditConsistencyRepairTypes8Z";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function renderList(items: readonly string[]): string {
  return ["<ul>", ...items.map((item) => `<li>${escapeHtml(item)}</li>`), "</ul>"].join("\n");
}

export function renderManualReviewValidationContractAuditConsistencyRepairProduct8Z(
  model: ManualReviewValidationContractAuditConsistencyRepair8ZModel,
): string {
  return [
    '<section id="manual-review-validation-contract-audit-consistency-repair-8z" class="premium-section manual-review-validation-contract-audit-consistency-repair-8z" data-manual-review-validation-contract-audit-consistency-repair-version="8Z">',
    "<h2>Cohérence des audits de validation</h2>",
    '<p class="eyebrow">Sprint 8Z - réparation audit-only, sans runtime</p>',
    "<p>Cette section répare la cohérence des audits 8Y : les seuils de wording deviennent honnêtes, les sélecteurs d'intégration retrouvent les sections présentes, et le statut ne peut plus masquer un audit critique échoué.</p>",
    '<article class="product-card manual-review-audit-consistency-summary-8z">',
    "<h3>Statut réparation</h3>",
    `<p><strong>Status :</strong> ${escapeHtml(model.status)}. <strong>Recommendation :</strong> ${escapeHtml(model.recommendation)}.</p>`,
    `<p><strong>Validation runtime :</strong> ${bool(model.validationRuntimeActive)}. <strong>Payload lu :</strong> ${model.realPayloadReadCount}. <strong>Payload créé :</strong> ${bool(model.payloadCreated)}. <strong>Preview réelle :</strong> ${bool(model.realPreviewGenerated)}.</p>`,
    `<p><strong>Baseline :</strong> 8Y ${escapeHtml(model.validationContractStatusFrom8Y)}, 8X ${escapeHtml(model.payloadContractStatusFrom8X)}, 8W ${escapeHtml(model.previewActivationStatusFrom8W)}, 8Q ${escapeHtml(model.reviewGateStatusFrom8Q)}.</p>`,
    "</article>",
    '<article class="product-card manual-review-wording-threshold-guard-8z">',
    "<h3>Wording threshold guard</h3>",
    `<p><strong>Avant 8Z :</strong> ${model.wordingScoreBefore8Z}/100. <strong>Après 8Z :</strong> ${model.wordingScoreAfter8Z}/100. <strong>Seuil PASS :</strong> ${model.wordingPassThreshold}. <strong>Seuil PASS fort :</strong> ${model.wordingPassStrongThreshold}.</p>`,
    `<p><strong>Status seuil :</strong> ${escapeHtml(model.wordingThresholdStatus)}. <strong>Warnings cohérents :</strong> ${bool(model.wordingWarningCodesCorrect)}.</p>`,
    '<p class="guard">Règle 8Z : aucun PASS si le score wording est sous 90 ; aucun PASS fort si le score wording est sous 95.</p>',
    "</article>",
    '<article class="product-card manual-review-integration-selector-repair-8z">',
    "<h3>Integration selector repair</h3>",
    '<table class="stat-table"><thead><tr><th>Métrique</th><th>Avant</th><th>Après</th><th>Sélecteur</th></tr></thead><tbody>',
    `<tr><td>productActionPlanVisible</td><td>${bool(model.productActionPlanVisibleBefore8Z)}</td><td>${bool(model.productActionPlanVisibleAfter8Z)}</td><td>${escapeHtml(model.productActionPlanSelectorUsed)}</td></tr>`,
    `<tr><td>exportActionPlanVisible</td><td>${bool(model.exportActionPlanVisibleBefore8Z)}</td><td>${bool(model.exportActionPlanVisibleAfter8Z)}</td><td>${escapeHtml(model.exportActionPlanSelectorUsed)}</td></tr>`,
    `<tr><td>tacticalMapCardsStillVisible</td><td>${bool(model.tacticalMapCardsVisibleBefore8Z)}</td><td>${bool(model.tacticalMapCardsVisibleAfter8Z)}</td><td>${escapeHtml(model.tacticalMapCardsSelectorUsed)}</td></tr>`,
    "</tbody></table>",
    `<p><strong>Faux négatifs intégration :</strong> ${model.integrationAuditFalseNegativeCountBefore8Z} -> ${model.integrationAuditFalseNegativeCountAfter8Z}.</p>`,
    "</article>",
    '<article class="product-card manual-review-status-warning-consistency-guard-8z">',
    "<h3>Status / warnings consistency guard</h3>",
    `<p><strong>Status avant attendu :</strong> ${escapeHtml(model.expectedStatusBeforeRepair)}. <strong>Status après :</strong> ${escapeHtml(model.statusAfterConsistencyRepair)}. <strong>Contradictions :</strong> ${model.statusWarningContradictionCount}.</p>`,
    `<p><strong>Warnings après :</strong> ${model.warningCountAfterRepair}. <strong>Missing warnings :</strong> ${model.missingWarningCountAfterRepair}. <strong>PASS avec seuil échoué :</strong> ${model.passWithFailedThresholdCount}. <strong>PASS fort avec seuil fort échoué :</strong> ${model.passStrongWithFailedStrongThresholdCount}.</p>`,
    '<p class="guard">Warnings none est autorisé seulement si aucun audit critique ni seuil requis n\'échoue.</p>',
    "</article>",
    '<article class="product-card manual-review-no-runtime-preservation-8z">',
    "<h3>No-runtime preservation</h3>",
    renderList([
      `validationRuntimeActive=${bool(model.validationRuntimeActive)}`,
      `payloadValidationRuntimeDetected=${bool(model.payloadValidationRuntimeDetected)}`,
      `validationExecutionCount=${model.validationExecutionCount}`,
      `realPayloadReadCount=${model.realPayloadReadCount}`,
      `payloadCreated=${bool(model.payloadCreated)}`,
      `realPreviewGenerated=${bool(model.realPreviewGenerated)}`,
      `submit/API/backend=${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}`,
      `storage/memory/history=${bool(model.storageCreated)}/${bool(model.memoryCreated)}/${bool(model.historyCreated)}`,
      `officialTruth/automaticDecision/selection/tactic=${bool(model.officialTruthPromoted)}/${bool(model.automaticDecisionCreated)}/${bool(model.selectionDriven)}/${bool(model.tacticalInstructionDriven)}`,
      `score/timeline/score_change/event mutation=${model.scoreMutationCount}/${model.timelineMutationCount}/${model.scoreChangeCreationCount}/${model.eventMutationCount}`,
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

export function insertManualReviewValidationContractAuditConsistencyRepairProduct8Z(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-validation-contract-audit-consistency-repair-8z"')) return productHtml;
  const validationContractIndex = productHtml.indexOf('id="manual-review-preview-payload-validation-contract-8y"');
  if (validationContractIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, validationContractIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
