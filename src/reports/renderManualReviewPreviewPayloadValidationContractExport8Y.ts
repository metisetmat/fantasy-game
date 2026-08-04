import type { ManualReviewPreviewPayloadValidationContract8Y } from "./manualReviewPreviewPayloadValidationContractTypes8Y";

export function renderManualReviewPreviewPayloadValidationContractExport8Y(
  contract: ManualReviewPreviewPayloadValidationContract8Y,
): string {
  const summary = contract.validationReadinessSummary;
  return [
    '<section id="manual-review-preview-payload-validation-contract-export-8y" class="premium-section manual-review-preview-payload-validation-contract-export-8y" data-manual-review-preview-payload-validation-contract-version="8Y">',
    "<h2>Validation payload preview revue manuelle</h2>",
    '<p class="eyebrow">Validation payload 8Y - Export compact 8Y</p>',
    `<p><strong>Contrat validation :</strong> ${summary.validationContractStatus}, non execute. <strong>Validation runtime :</strong> inactive.</p>`,
    `<p><strong>Couverture :</strong> ${contract.orderedValidationSteps.length} steps; ${contract.validationGroups.length} groupes; ${contract.ruleMappings.length} rule mappings; ${contract.errorMessages.length} error messages; ${contract.validationBlockers.length} blockers; ${contract.refusalStates.length} refusal states; ${contract.boundaryGuards.length} boundary guards; ${contract.observationEntryContracts.length} entry contracts.</p>`,
    "<p><strong>Effets reels :</strong> payload reel lu 0; payload reel cree 0; preview reelle 0.</p>",
    "<p><strong>Sources conservees :</strong> payload 8X documented_but_not_instantiated; activation 8W documented_but_blocked; readiness 8R ready_for_non_persistent_preview; gate 8Q needs_completion.</p>",
    '<p class="guard">Contrat de validation uniquement. Aucune validation runtime, aucun payload reel, aucune preview reelle, aucun input reel, submit, API, backend, stockage, memoire, official truth, decision automatique, selection ou tactique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8x|8w|8v|8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8Y(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8Y - validation payload preview revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8y");
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
  updated = updated.replace(/Export compact 8X/gu, "Export compact 8Y");
  return updated;
}

export function insertManualReviewPreviewPayloadValidationContractExport8Y(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8Y(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-payload-validation-contract-export-8y"')) return metadataHtml;
  const payloadContractIndex = metadataHtml.indexOf('id="manual-review-preview-payload-contract-export-8x"');
  if (payloadContractIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, payloadContractIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
