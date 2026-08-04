import type { ManualReviewValidationContractAuditConsistencyRepair8ZModel } from "./manualReviewValidationContractAuditConsistencyRepairTypes8Z";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

export function renderManualReviewValidationContractAuditConsistencyRepairExport8Z(
  model: ManualReviewValidationContractAuditConsistencyRepair8ZModel,
): string {
  return [
    '<section id="manual-review-validation-contract-audit-consistency-repair-export-8z" class="premium-section manual-review-validation-contract-audit-consistency-repair-export-8z" data-manual-review-validation-contract-audit-consistency-repair-version="8Z">',
    "<h2>Cohérence audits validation</h2>",
    '<p class="eyebrow">Audit consistency 8Z - Export compact 8Z</p>',
    `<p><strong>Status :</strong> ${model.status}. <strong>Wording :</strong> ${model.wordingScoreBefore8Z} -> ${model.wordingScoreAfter8Z}. <strong>Seuil :</strong> PASS ${model.wordingPassThreshold}, PASS fort ${model.wordingPassStrongThreshold}.</p>`,
    `<p><strong>Sélecteurs réparés :</strong> product action plan ${bool(model.productActionPlanVisibleAfter8Z)}; export action plan ${bool(model.exportActionPlanVisibleAfter8Z)}; tactical maps ${bool(model.tacticalMapCardsVisibleAfter8Z)}; faux négatifs ${model.integrationAuditFalseNegativeCountAfter8Z}.</p>`,
    `<p><strong>Status/warnings :</strong> missing warnings ${model.missingWarningCountAfterRepair}; contradictions ${model.statusWarningContradictionCount}; PASS avec seuil échoué ${model.passWithFailedThresholdCount}; PASS fort avec seuil fort échoué ${model.passStrongWithFailedStrongThresholdCount}.</p>`,
    `<p><strong>No-runtime :</strong> validation runtime ${bool(model.validationRuntimeActive)}; payload lu ${model.realPayloadReadCount}; payload créé ${bool(model.payloadCreated)}; preview réelle ${bool(model.realPreviewGenerated)}; submit/API/backend ${bool(model.submitCreated)}/${bool(model.apiCreated)}/${bool(model.backendCreated)}; storage ${bool(model.storageCreated)}.</p>`,
    `<p><strong>Baselines :</strong> 8Y ${model.validationContractStatusFrom8Y}; 8X ${model.payloadContractStatusFrom8X}; 8W ${model.previewActivationStatusFrom8W}; 8R ${model.workflowReadinessStatusFrom8R}; 8Q ${model.reviewGateStatusFrom8Q}.</p>`,
    '<p class="guard">Réparation audit-only : aucune validation runtime, aucun payload réel, aucune preview réelle, aucune persistance, aucune officialisation, aucune décision automatique, aucune sélection, aucune tactique, aucune mutation score/timeline/score_change/event.</p>',
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

function cleanMainIds(attrs: string): string {
  return attrs.replace(/\s+id="compressed-export-(?:8y|8x|8w|8v|8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8Z(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8Z - coherence audits validation</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8z");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-validation-contract-audit-consistency-repair-version", "8Z");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-payload-validation-contract-version", "8Y");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-payload-contract-version", "8X");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-activation-guards-version", "8W");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-field-ux-visual-readiness-version", "8V");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-input-field-contract-version", "8U");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-ux-interaction-contract-version", "8T");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-workflow-ux-skeleton-version", "8S");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-workflow-readiness-version", "8R");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-decision-gate-version", "8Q");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-comparison-version", "8P");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-renderer-version", "8O");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-intake-boundary-version", "8N");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-form-version", "8M");
    nextAttrs = ensureAttribute(nextAttrs, "data-learning-loop-version", "8L");
    nextAttrs = ensureAttribute(nextAttrs, "data-story-first-export-version", "8I");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8Y/gu, "Export compact 8Z");
  return updated;
}

export function insertManualReviewValidationContractAuditConsistencyRepairExport8Z(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8Z(exportHtml);
  if (metadataHtml.includes('id="manual-review-validation-contract-audit-consistency-repair-export-8z"')) {
    return metadataHtml;
  }
  const validationContractIndex = metadataHtml.indexOf('id="manual-review-preview-payload-validation-contract-export-8y"');
  if (validationContractIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, validationContractIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
