import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel } from "./manualReviewPreviewPayloadDryRunValidatorTypes9A";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function renderList(items: readonly string[]): string {
  return ["<ul>", ...items.map((item) => `<li>${escapeHtml(item)}</li>`), "</ul>"].join("\n");
}

export function renderManualReviewPreviewPayloadDryRunValidatorProduct9A(
  model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-validator-9a" class="premium-section manual-review-preview-payload-dry-run-validator-9a" data-manual-review-preview-payload-dry-run-validator-version="9A">',
    "<h2>Dry-run validator payload preview-only</h2>",
    '<p class="eyebrow">Sprint 9A - dry-run contractuel, sans runtime</p>',
    "<p>Cette couche simule l'ordre de validation du futur payload preview-only. Elle decrit les cas, erreurs, blockers et refusal states attendus sans lire, accepter, creer ou persister un vrai payload.</p>",
    '<article class="product-card manual-review-dry-run-summary-9a">',
    "<h3>Resume dry-run</h3>",
    `<p><strong>Status :</strong> ${escapeHtml(model.status)}. <strong>Dry-run :</strong> ${escapeHtml(model.dryRunStatus)}. <strong>Recommendation :</strong> ${escapeHtml(model.recommendation)}.</p>`,
    `<p><strong>Cas :</strong> ${model.dryRunCaseCount}/${model.dryRunCaseCountExpected}. <strong>Resultats :</strong> ${model.dryRunResultCount}/${model.dryRunResultCountExpected}. <strong>Cas valide accepte :</strong> ${model.dryRunAcceptedPayloadCount}.</p>`,
    `<p><strong>Coverage :</strong> rules ${model.dryRunRuleCoverageCount}/${model.dryRunRuleCoverageExpected}; errors ${model.dryRunErrorCoverageCount}/${model.dryRunErrorCoverageExpected}; blockers ${model.dryRunBlockerCoverageCount}/${model.dryRunBlockerCoverageExpected}; boundary guards ${model.dryRunBoundaryGuardCoverageCount}/${model.dryRunBoundaryGuardCoverageExpected}; refusals ${model.dryRunRefusalStateCoverageCount}/${model.dryRunRefusalStateCoverageExpected}.</p>`,
    "</article>",
    '<article class="product-card manual-review-dry-run-cases-9a">',
    "<h3>Cas de dry-run</h3>",
    '<table class="stat-table"><thead><tr><th>Case</th><th>Resultat attendu</th><th>Severity</th><th>Errors</th><th>Blockers</th></tr></thead><tbody>',
    ...model.dryRunCases.map((dryRunCase) =>
      `<tr><td>${escapeHtml(dryRunCase.dryRunCaseId)}</td><td>${escapeHtml(dryRunCase.expectedResult)}</td><td>${escapeHtml(dryRunCase.severity)}</td><td>${escapeHtml(dryRunCase.expectedErrorStateIds.join(", ") || "none")}</td><td>${escapeHtml(dryRunCase.expectedBlockerIds.join(", ") || "none")}</td></tr>`
    ),
    "</tbody></table>",
    "</article>",
    '<article class="product-card manual-review-dry-run-boundary-9a">',
    "<h3>Frontieres no-runtime</h3>",
    renderList([
      `runtimeValidation=${model.dryRunRuntimeValidationCount}`,
      `realPayloadRead=${model.dryRunRealPayloadReadCount}`,
      `payloadCreated=${model.dryRunPayloadCreatedCount}`,
      `payloadAccepted=${model.dryRunAcceptedPayloadCount}`,
      `previewGenerated=${model.dryRunPreviewGeneratedCount}`,
      `persistence=${model.dryRunPersistenceCount}`,
      `officialTruthPromotion=${model.dryRunOfficialTruthPromotionCount}`,
      `automation=${model.dryRunAutomationCount}`,
      `selectionOrTactic=${model.dryRunSelectionOrTacticCount}`,
      `score/timeline/score_change/event mutation=${model.dryRunScoreMutationCount}/${model.dryRunTimelineMutationCount}/${model.dryRunScoreChangeCreationCount}/${model.dryRunEventMutationCount}`,
    ]),
    "</article>",
    '<article class="product-card manual-review-dry-run-readiness-9a">',
    "<h3>Readiness</h3>",
    `<p><strong>Ce qui est pret :</strong></p>${renderList(model.dryRunReadinessSummary.whatIsReady)}`,
    `<p><strong>Ce qui reste bloque :</strong></p>${renderList(model.dryRunReadinessSummary.whatIsBlocked)}`,
    '<p class="guard">Le cas valide signifie uniquement would pass future validation, jamais accepted payload.</p>',
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

export function insertManualReviewPreviewPayloadDryRunValidatorProduct9A(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-preview-payload-dry-run-validator-9a"')) return productHtml;
  const auditRepairIndex = productHtml.indexOf('id="manual-review-validation-contract-audit-consistency-repair-8z"');
  if (auditRepairIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, auditRepairIndex);
    if (insertAt >= 0) return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
