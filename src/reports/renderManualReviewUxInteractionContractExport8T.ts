import type { ManualReviewUxInteractionContract8T } from "./manualReviewUxInteractionContractTypes8T";

export function renderManualReviewUxInteractionContractExport8T(contract: ManualReviewUxInteractionContract8T): string {
  return [
    '<section id="manual-review-ux-interaction-contract-export-8t" class="premium-section manual-review-ux-interaction-contract-export-8t" data-manual-review-ux-interaction-contract-version="8T">',
    "<h2>Contrat UX revue manuelle</h2>",
    '<p class="eyebrow">Contrat UX 8T</p>',
    "<p><strong>Contrat UX :</strong> interactions futures documentees.</p>",
    "<p><strong>Interactions activees en 8T :</strong> 0.</p>",
    `<p><strong>Futures interactions :</strong> ${contract.futureInteractions.length} bloquees.</p>`,
    `<p><strong>Refusal states :</strong> ${contract.refusalStates.length}.</p>`,
    "<p><strong>Workflow 8R :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate 8Q :</strong> a completer.</p>",
    "<p><strong>Decisions differees :</strong> stockage, permissions, historique, officialisation.</p>",
    '<p class="guard">Contrat UX non interactif. Non persiste, non applique, sans submit, sans API, sans decision automatique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8T(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8T - contrat UX revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8t");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-ux-interaction-contract-version", "8T");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8S/gu, "Export compact 8T");
  updated = updated.replace(/Squelette UX 8S/gu, "Squelette UX 8S");
  return updated;
}

export function insertManualReviewUxInteractionContractExport8T(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8T(exportHtml);
  if (metadataHtml.includes('id="manual-review-ux-interaction-contract-export-8t"')) return metadataHtml;
  const skeletonIndex = metadataHtml.indexOf('id="manual-review-workflow-ux-skeleton-export-8s"');
  if (skeletonIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, skeletonIndex);
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
