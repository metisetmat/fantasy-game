import type { ManualReviewPreviewActivationGuard8W } from "./manualReviewPreviewActivationGuardsTypes8W";

export function renderManualReviewPreviewActivationGuardsExport8W(
  guard: ManualReviewPreviewActivationGuard8W,
): string {
  const summary = guard.activationReadinessSummary;
  return [
    '<section id="manual-review-preview-activation-guards-export-8w" class="premium-section manual-review-preview-activation-guards-export-8w" data-manual-review-preview-activation-guards-version="8W">',
    "<h2>Garde-fous preview revue manuelle</h2>",
    '<p class="eyebrow">Garde-fous preview 8W - Export compact 8W</p>',
    `<p><strong>Statut :</strong> ${summary.previewActivationStatus}; preview reelle: false; payload: false; stockage: false; official truth: false.</p>`,
    `<p><strong>Conditions :</strong> ${summary.activationConditionCount}; satisfaites comme garde-fous: ${summary.satisfiedActivationConditionCount}; bloquees avant activation: ${summary.unsatisfiedActivationConditionCount}.</p>`,
    `<p><strong>Blockers :</strong> ${summary.blockingGuardCount}; <strong>refus :</strong> ${summary.refusalStateCount}.</p>`,
    "<p><strong>Readiness 8R :</strong> ready_for_non_persistent_preview; <strong>gate 8Q :</strong> needs_completion; <strong>Squelette UX 8S :</strong> statique; <strong>visuel 8V :</strong> ready_for_static_visual_review.</p>",
    '<p class="guard">Activation guard: preview documentee mais bloquee. Aucun input reel, submit, API, backend, localStorage, DB, fichier, draft, historique, memoire, payload, preview reelle, official truth, decision automatique, selection ou tactique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8v|8u|8t|8s|8r|8q|8p|8n|8i)"/giu, "");
}

function ensureAttribute(attrs: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}=`, "iu").test(attrs)) {
    return attrs.replace(new RegExp(`\\s${name}="[^"]*"`, "iu"), ` ${name}="${value}"`);
  }
  return ` ${name}="${value}"${attrs}`;
}

function setMainMetadata8W(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8W - garde-fous preview revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (_match: string, attrs: string) => {
    let nextAttrs = cleanMainIds(attrs);
    nextAttrs = ensureAttribute(nextAttrs, "id", "compressed-export-8w");
    nextAttrs = ensureAttribute(nextAttrs, "data-manual-review-preview-activation-guards-version", "8W");
    return `<main${nextAttrs}>`;
  });
  updated = updated.replace(/Export compact 8V/gu, "Export compact 8W");
  updated = updated.replace(/Workflow 8S :<\/strong> ready_for_non_persistent_preview/gu, "Readiness 8R :</strong> ready_for_non_persistent_preview");
  return updated;
}

export function insertManualReviewPreviewActivationGuardsExport8W(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8W(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-activation-guards-export-8w"')) return metadataHtml;
  const visualIndex = metadataHtml.indexOf('id="manual-review-field-ux-visual-readiness-export-8v"');
  if (visualIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, visualIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
