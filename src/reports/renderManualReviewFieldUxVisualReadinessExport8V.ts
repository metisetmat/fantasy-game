import type { ManualReviewFieldUxVisualReadiness8V } from "./manualReviewFieldUxVisualReadinessTypes8V";

export function renderManualReviewFieldUxVisualReadinessExport8V(
  visualReadiness: ManualReviewFieldUxVisualReadiness8V,
): string {
  return [
    '<section id="manual-review-field-ux-visual-readiness-export-8v" class="premium-section manual-review-field-ux-visual-readiness-export-8v" data-manual-review-field-ux-visual-readiness-version="8V">',
    "<h2>Lisibilite champs revue manuelle</h2>",
    '<p class="eyebrow">Lisibilite champs 8V - Export compact 8V</p>',
    `<p><strong>Mode :</strong> ${visualReadiness.visualMode}.</p>`,
    `<p><strong>Sections :</strong> ${visualReadiness.visualSections.length}; <strong>groupes :</strong> ${visualReadiness.visualFieldGroups.length}; <strong>cartes champs :</strong> ${visualReadiness.visualFieldCards.length}.</p>`,
    `<p><strong>Regles futures :</strong> ${visualReadiness.visualValidationSummary.validationRuleCount} inactives; <strong>erreurs futures :</strong> ${visualReadiness.visualErrorSummary.errorStateCount} inactives; <strong>refus :</strong> ${visualReadiness.visualRefusalSummary.length}.</p>`,
    `<p><strong>Readiness 8R :</strong> ${visualReadiness.visualReadinessSummary.workflowReadinessStatusFrom8S}; <strong>gate 8Q :</strong> ${visualReadiness.visualReadinessSummary.reviewGateStatusFrom8Q}. <strong>Squelette UX 8S :</strong> couche statique conservee.</p>`,
    `<p><strong>Lisibilite coach :</strong> ${visualReadiness.visualReadinessSummary.coachReadabilityScore}/100; densite acceptable: ${visualReadiness.visualReadinessSummary.visualDensityAcceptable}.</p>`,
    '<p class="guard">Badges 8V visibles: futur, desactive, read-only, non officiel, non persiste, non applique. Aucun input reel, submit, API, backend, stockage, memoire, payload, preview reelle, official truth, selection ou tactique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8V(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8V - lisibilite champs revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8v");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-field-ux-visual-readiness-version", "8V");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8U/gu, "Export compact 8V");
  return updated;
}

export function insertManualReviewFieldUxVisualReadinessExport8V(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8V(exportHtml);
  if (metadataHtml.includes('id="manual-review-field-ux-visual-readiness-export-8v"')) return metadataHtml;
  const inputFieldIndex = metadataHtml.indexOf('id="manual-review-input-field-contract-export-8u"');
  if (inputFieldIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, inputFieldIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
