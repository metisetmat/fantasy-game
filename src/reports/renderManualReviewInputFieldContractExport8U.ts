import type { ManualReviewInputFieldContract8U } from "./manualReviewInputFieldContractTypes8U";

export function renderManualReviewInputFieldContractExport8U(contract: ManualReviewInputFieldContract8U): string {
  return [
    '<section id="manual-review-input-field-contract-export-8u" class="premium-section manual-review-input-field-contract-export-8u" data-manual-review-input-field-contract-version="8U">',
    "<h2>Contrat champs revue manuelle</h2>",
    '<p class="eyebrow">Contrat champs 8U - Export compact 8U</p>',
    "<p><strong>Mode :</strong> future_input_field_contract_only.</p>",
    `<p><strong>Sections :</strong> ${contract.fieldSections.length}; <strong>champs :</strong> ${contract.fields.length}, tous desactives.</p>`,
    `<p><strong>Regles futures :</strong> ${contract.validationRules.length} inactives; <strong>erreurs futures :</strong> ${contract.errorStates.length} inactives; <strong>refus :</strong> ${contract.refusalStates.length}.</p>`,
    "<p><strong>Workflow 8R :</strong> pret pour preview non persistante; <strong>Gate 8Q :</strong> a completer.</p>",
    "<p><strong>Activation :</strong> 14 prerequis documentes, aucun satisfait en 8U.</p>",
    '<p class="guard">Champs futurs non actifs, non officiels, non persistes et non appliques. Aucun input reel, payload, preview reelle, submit, API, backend, stockage, memoire, selection ou tactique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8U(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8U - contrat champs revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8u");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-input-field-contract-version", "8U");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8T/gu, "Export compact 8U");
  return updated;
}

export function insertManualReviewInputFieldContractExport8U(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8U(exportHtml);
  if (metadataHtml.includes('id="manual-review-input-field-contract-export-8u"')) return metadataHtml;
  const interactionIndex = metadataHtml.indexOf('id="manual-review-ux-interaction-contract-export-8t"');
  if (interactionIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, interactionIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  const mapIndex = metadataHtml.indexOf("Cartes tactiques essentielles");
  if (mapIndex >= 0) {
    const sectionStart = metadataHtml.lastIndexOf("<section", mapIndex);
    if (sectionStart >= 0) return `${metadataHtml.slice(0, sectionStart)}\n${section}\n${metadataHtml.slice(sectionStart)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
