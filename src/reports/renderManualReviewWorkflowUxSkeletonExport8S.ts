import type { ManualReviewWorkflowUxSkeleton8S } from "./manualReviewWorkflowUxSkeletonTypes8S";

export function renderManualReviewWorkflowUxSkeletonExport8S(workflow: ManualReviewWorkflowUxSkeleton8S): string {
  return [
    '<section id="manual-review-workflow-ux-skeleton-export-8s" class="premium-section manual-review-workflow-ux-skeleton-export-8s" data-manual-review-workflow-ux-skeleton-version="8S">',
    "<h2>Squelette UX revue manuelle</h2>",
    '<p class="eyebrow">Squelette UX 8S</p>',
    "<p><strong>Parcours UX :</strong> pret en squelette.</p>",
    "<p><strong>Workflow 8R :</strong> pret pour preview non persistante.</p>",
    "<p><strong>Gate 8Q :</strong> a completer.</p>",
    "<p><strong>Chaine :</strong> 8M formulaire -> 8N intake -> 8O preview -> 8P comparaison -> 8Q gate -> 8R readiness.</p>",
    `<p><strong>Actions futures :</strong> ${workflow.disabledActions.length} actions desactivees.</p>`,
    '<p class="guard">Squelette UX non officiel. Non persiste, non applique, sans submit, sans API, sans decision automatique.</p>',
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
  return attrs.replace(/\s+id="compressed-export-(?:8r|8q|8p|8n|8i)"/giu, "");
}

function setMainMetadata8S(html: string): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8S - squelette UX revue manuelle</title>",
  );
  updated = updated.replace(/<main\b([^>]*)>/iu, (match: string, attrs: string) => {
    const cleaned = cleanMainIds(attrs);
    const withId = /\sid=/iu.test(cleaned) ? cleaned : ` id="compressed-export-8s"${cleaned}`;
    const withVersion = withId.includes("data-manual-review-workflow-ux-skeleton-version")
      ? withId
      : ` data-manual-review-workflow-ux-skeleton-version="8S"${withId}`;
    return `<main${withVersion}>`;
  });
  updated = updated.replace(/Export compact 8R/gu, "Export compact 8S");
  updated = updated.replace(/Export compact 8Q/gu, "Export compact 8S");
  return updated;
}

export function insertManualReviewWorkflowUxSkeletonExport8S(exportHtml: string, section: string): string {
  const metadataHtml = setMainMetadata8S(exportHtml);
  if (metadataHtml.includes('id="manual-review-workflow-ux-skeleton-export-8s"')) return metadataHtml;
  const readinessIndex = metadataHtml.indexOf('id="manual-review-workflow-readiness-export-8r"');
  if (readinessIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, readinessIndex);
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
