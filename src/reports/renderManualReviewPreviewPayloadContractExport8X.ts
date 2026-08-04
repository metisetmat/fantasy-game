import type { ManualReviewPreviewPayloadContract8X } from "./manualReviewPreviewPayloadContractTypes8X";

export function renderManualReviewPreviewPayloadContractExport8X(
  contract: ManualReviewPreviewPayloadContract8X,
): string {
  return [
    '<section id="manual-review-preview-payload-contract-export-8x" class="premium-section manual-review-preview-payload-contract-export-8x" data-manual-review-preview-payload-contract-version="8X">',
    "<h2>Contrat payload preview revue manuelle</h2>",
    '<p class="eyebrow">Contrat payload 8X - Export compact 8X</p>',
    `<p><strong>Statut :</strong> ${contract.payloadContractStatus}; source: ${contract.payloadSource}; scope: ${contract.payloadScope}; persistence: ${contract.payloadPersistence}; application: ${contract.payloadApplication}; official truth: false.</p>`,
    `<p><strong>Schema :</strong> ${contract.allowedTopLevelFields.length} champs autorises; ${contract.forbiddenTopLevelFields.length} champs interdits; ${contract.fieldGroups.length} groupes; ${contract.observationEntries.length} entrees exemple.</p>`,
    `<p><strong>Regles :</strong> ${contract.validationRules.length} regles futures inactives; ${contract.errorStates.length} error states inactifs; ${contract.refusalStates.length} refus; ${contract.boundaryGuards.length} boundary guards.</p>`,
    '<p class="guard">Contrat seulement: aucun payload reel, aucune validation runtime, aucune preview reelle, aucun submit, API, backend, stockage, draft, historique, memoire, official truth, decision automatique, selection, tactique, score ou timeline.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8w|8v|8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8X(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8X - contrat payload preview revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8x");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-payload-contract-version", "8X");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8W/gu, "Export compact 8X");
  return updated;
}

export function insertManualReviewPreviewPayloadContractExport8X(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8X(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-payload-contract-export-8x"')) return metadataHtml;
  const activationIndex = metadataHtml.indexOf('id="manual-review-preview-activation-guards-export-8w"');
  if (activationIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, activationIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
