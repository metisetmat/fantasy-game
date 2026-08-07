import type { ManualReviewExportMetadataBadgeCleanup9DModel } from "./manualReviewExportMetadataBadgeCleanupTypes9D";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function replaceHeaderCoverBadge(exportHtml: string): string {
  const headerMatch = exportHtml.match(/<header\b[\s\S]*?<\/header>/u);
  if (headerMatch === null || headerMatch.index === undefined) {
    const header = [
      "<header>",
      "<h1>Rapport coach - export compact</h1>",
      '<div class="badge-row report-scoreboard report-kpi-grid">',
      '<span class="badge">Export compact 9D</span>',
      "</div>",
      "</header>",
    ].join("\n");
    return exportHtml.includes("<main")
      ? exportHtml.replace("<main", `${header}\n<main`)
      : `${header}\n${exportHtml}`;
  }
  const header = headerMatch[0];
  const updatedHeader = header.replace(
    /(<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>)Export compact [^<]*(<\/[^>]+>)/u,
    "$1Export compact 9D$2",
  );
  return `${exportHtml.slice(0, headerMatch.index)}${updatedHeader}${exportHtml.slice(headerMatch.index + header.length)}`;
}

export function normalizeManualReviewExportMetadataBadgeCleanupShell9D(exportHtml: string): string {
  let nextHtml = exportHtml;
  nextHtml = nextHtml.replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9D - metadata badge cleanup</title>");
  nextHtml = nextHtml.replace(/id="compressed-export-[^"]+"/u, 'id="compressed-export-9d"');
  const mainTag = nextHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-export-metadata-badge-cleanup-version="9D"')) {
    nextHtml = nextHtml.replace(/<main\b/u, '<main data-export-metadata-badge-cleanup-version="9D"');
  }
  return replaceHeaderCoverBadge(nextHtml);
}

export function renderManualReviewExportMetadataBadgeCleanupExport9D(
  model: ManualReviewExportMetadataBadgeCleanup9DModel,
): string {
  return [
    '<section id="manual-review-export-metadata-badge-cleanup-export-9d" class="premium-section manual-review-export-metadata-badge-cleanup-export-9d" data-export-metadata-badge-cleanup-version="9D">',
    '<p class="eyebrow">Export compact 9D</p>',
    "<h2>Correction metadata export</h2>",
    `<p>Badge couverture: ${escapeHtml(model.exportCoverBadgeText)}. Title: 9D. Main id: compressed-export-9d. Data current: 9D.</p>`,
    `<p>Faux positif badge: ${model.metadataFalsePositiveCountAfter9D}. Fallback body pour badge: interdit.</p>`,
    `<p>9C preserve: detail cards ${model.detailCardCountFrom9C}, wording ${model.wordingReadabilityScoreFrom9C}, coverage complete ${model.detailCoverageStillCompleteFrom9C}.</p>`,
    `<p>No-runtime: validation ${model.validationRuntimeActive}, payload lu ${model.realPayloadReadCount}, payload accepte ${model.dryRunAcceptedPayloadCount}, preview ${model.realPreviewGenerated}, storage ${model.storageCreated}.</p>`,
    "<p>Correction metadata uniquement. Aucun runtime, aucun payload reel, aucune acceptation de payload, aucune preview reelle, aucun submit, API, backend, stockage, memoire, official truth, decision automatique, selection ou tactique.</p>",
    "</section>",
  ].join("\n");
}

export function insertManualReviewExportMetadataBadgeCleanupExport9D(exportHtml: string, section: string): string {
  let nextHtml = normalizeManualReviewExportMetadataBadgeCleanupShell9D(exportHtml);
  if (!nextHtml.includes('id="manual-review-export-metadata-badge-cleanup-export-9d"')) {
    const anchor = 'id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"';
    const sectionEnd = "</section>";
    const index = nextHtml.indexOf(anchor);
    if (index !== -1) {
      const end = nextHtml.indexOf(sectionEnd, index);
      if (end !== -1) {
        const insertAt = end + sectionEnd.length;
        nextHtml = `${nextHtml.slice(0, insertAt)}\n${section}\n${nextHtml.slice(insertAt)}`;
      }
    }
    if (!nextHtml.includes('id="manual-review-export-metadata-badge-cleanup-export-9d"')) {
      nextHtml = nextHtml.includes("</main>")
        ? nextHtml.replace("</main>", `${section}\n</main>`)
        : `${nextHtml}\n${section}`;
    }
  }
  return normalizeManualReviewExportMetadataBadgeCleanupShell9D(nextHtml);
}
