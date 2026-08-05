import type { ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel } from "./manualReviewPreviewPayloadDryRunValidatorTypes9A";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

export function renderManualReviewPreviewPayloadDryRunValidatorExport9A(
  model: ManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
): string {
  return [
    '<section id="manual-review-preview-payload-dry-run-validator-export-9a" class="premium-section manual-review-preview-payload-dry-run-validator-export-9a" data-manual-review-preview-payload-dry-run-validator-version="9A">',
    "<h2>Dry-run payload preview-only</h2>",
    '<p class="eyebrow">Dry-run payload 9A - Export compact 9A</p>',
    `<p><strong>Status :</strong> ${model.status}. <strong>Dry-run :</strong> ${model.dryRunStatus}. <strong>Cas :</strong> ${model.dryRunCaseCount}. <strong>Resultats :</strong> ${model.dryRunResultCount}.</p>`,
    `<p><strong>Coverage :</strong> rules ${model.dryRunRuleCoverageCount}/${model.dryRunRuleCoverageExpected}; errors ${model.dryRunErrorCoverageCount}/${model.dryRunErrorCoverageExpected}; blockers ${model.dryRunBlockerCoverageCount}/${model.dryRunBlockerCoverageExpected}; boundary ${model.dryRunBoundaryGuardCoverageCount}/${model.dryRunBoundaryGuardCoverageExpected}; refusals ${model.dryRunRefusalStateCoverageCount}/${model.dryRunRefusalStateCoverageExpected}.</p>`,
    `<p><strong>No-runtime :</strong> validation ${bool(model.validationRuntimeActive)}; payload lu ${model.realPayloadReadCount}; payload cree ${bool(model.payloadCreated)}; accepted ${model.dryRunAcceptedPayloadCount}; preview reelle ${bool(model.realPreviewGenerated)}; storage ${bool(model.storageCreated)}.</p>`,
    `<p><strong>Baselines :</strong> 8Z ${model.auditConsistencyStatusFrom8Z}; 8Y ${model.validationContractStatusFrom8Y}; 8X ${model.payloadContractStatusFrom8X}; 8W ${model.previewActivationStatusFrom8W}; 8R ${model.workflowReadinessStatusFrom8R}; 8Q ${model.reviewGateStatusFrom8Q}.</p>`,
    '<p class="guard">Dry-run contractuel seulement : le cas valide reste would_pass_future_validation_but_not_accepted, sans payload accepte, sans preview reelle, sans persistance, sans officialisation, sans decision, sans selection, sans tactique, sans mutation match.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8z|8y|8x|8w|8v|8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata9A(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 9A - dry-run payload preview-only</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-9a");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-payload-dry-run-validator-version", "9A");
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
  updated = updated.replace(/Export compact 8Z/gu, "Export compact 9A");
  return updated;
}

export function insertManualReviewPreviewPayloadDryRunValidatorExport9A(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata9A(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-payload-dry-run-validator-export-9a"')) {
    return metadataHtml;
  }
  const auditRepairIndex = metadataHtml.indexOf('id="manual-review-validation-contract-audit-consistency-repair-export-8z"');
  if (auditRepairIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, auditRepairIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
