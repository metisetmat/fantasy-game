import { escapeHtml } from "./htmlCoachReport";
import type { ManualReviewWorkflowReadiness8R } from "./manualReviewWorkflowReadinessTypes8R";

export function renderManualReviewWorkflowReadinessExport8R(workflow: ManualReviewWorkflowReadiness8R): string {
  return [
    '<section id="manual-review-workflow-readiness-export-8r" class="premium-section manual-review-workflow-readiness-export-8r" data-manual-review-workflow-readiness-version="8R">',
    "<h2>Workflow revue manuelle</h2>",
    '<p class="eyebrow">Workflow revue manuelle 8R</p>',
    "<p><strong>Workflow :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate actuel :</strong> a completer.</p>",
    "<p><strong>Chaine :</strong> 8M formulaire -> 8N intake -> 8O preview -> 8P comparaison -> 8Q gate.</p>",
    `<p><strong>Ce qui manque :</strong> ${escapeHtml(workflow.readinessSummary.whatStillNeedsWork[0] ?? "vraie saisie coach + decision de stockage future separee.")}</p>`,
    '<p class="guard">Workflow de demonstration non officiel. Non persiste, non applique, sans decision automatique.</p>',
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

function setMainId(html: string): string {
  return html.replace(/<main\b([^>]*)>/iu, (match: string, attrs: string) => {
    const cleaned = attrs.replace(/\s+id="compressed-export-(?:8q|8p|8n|8i)"/giu, "");
    if (/\sid=/iu.test(cleaned)) return `<main${cleaned}>`;
    return `<main id="compressed-export-8r"${cleaned}>`;
  });
}

function ensureMainAttribute(html: string, attribute: string): string {
  const [name] = attribute.split("=");
  if (name !== undefined && html.includes(name)) return html;
  return html.replace(/<main\b([^>]*)>/iu, `<main ${attribute}$1>`);
}

function correct8PEyebrow(html: string): string {
  return html.replace(
    /(<section\b[^>]*id="manual-review-preview-comparison-export-8p"[\s\S]*?<p class="eyebrow">)[^<]*(<\/p>)/iu,
    "$1Comparaison preview 8P$2",
  );
}

function preserve8QEyebrow(html: string): string {
  return html.replace(
    /(<section\b[^>]*id="manual-review-preview-decision-gate-export-8q"[\s\S]*?<p class="eyebrow">)[^<]*(<\/p>)/iu,
    "$1Gate preview 8Q$2",
  );
}

function updateExportMetadata8R(exportHtml: string): string {
  let updated = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8R - workflow revue manuelle non persistant</title>",
  );
  updated = setMainId(updated);
  updated = ensureMainAttribute(updated, 'data-manual-review-workflow-readiness-version="8R"');
  updated = correct8PEyebrow(updated);
  updated = preserve8QEyebrow(updated);
  updated = updated.replace(/Export compact 8Q/gu, "Export compact 8R");
  updated = updated.replace(/Export compact 8P/gu, "Export compact 8R");
  return updated;
}

export function insertManualReviewWorkflowReadinessExport8R(exportHtml: string, section: string): string {
  const metadataHtml = updateExportMetadata8R(exportHtml);
  if (metadataHtml.includes('id="manual-review-workflow-readiness-export-8r"')) return metadataHtml;
  const gateIndex = metadataHtml.indexOf('id="manual-review-preview-decision-gate-export-8q"');
  if (gateIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, gateIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  const tacticalMapIndex = metadataHtml.indexOf("Cartes tactiques essentielles");
  if (tacticalMapIndex >= 0) {
    const sectionStart = metadataHtml.lastIndexOf("<section", tacticalMapIndex);
    if (sectionStart >= 0) return `${metadataHtml.slice(0, sectionStart)}\n${section}\n${metadataHtml.slice(sectionStart)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
