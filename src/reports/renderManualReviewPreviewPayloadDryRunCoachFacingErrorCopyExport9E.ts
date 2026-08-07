import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function replaceHeaderCoverBadge(exportHtml: string): string {
  const headerMatch = exportHtml.match(/<header\b[\s\S]*?<\/header>/u);
  if (headerMatch === null || headerMatch.index === undefined) return exportHtml;
  const header = headerMatch[0];
  const updatedHeader = header.replace(
    /(<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>)Export compact [^<]*(<\/[^>]+>)/u,
    "$1Export compact 9E$2",
  );
  return `${exportHtml.slice(0, headerMatch.index)}${updatedHeader}${exportHtml.slice(headerMatch.index + header.length)}`;
}

export function normalizeManualReviewPreviewPayloadDryRunCoachFacingErrorCopyShell9E(exportHtml: string): string {
  let nextHtml = exportHtml;
  nextHtml = nextHtml.replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9E - coach-facing error copy</title>");
  nextHtml = nextHtml.replace(/id="compressed-export-[^"]+"/u, 'id="compressed-export-9e"');
  const mainTag = nextHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"')) {
    nextHtml = nextHtml.replace(/<main\b/u, '<main data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"');
  }
  return replaceHeaderCoverBadge(nextHtml);
}

export function renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E(
  model: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
): string {
  const rows = model.errorCopies
    .map((copy) => `<li><strong>${escapeHtml(copy.title)}</strong>: ${escapeHtml(copy.shortMessage)} Frontiere: ${escapeHtml(copy.protectedBoundary)}</li>`)
    .join("");
  return [
    '<section id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e" class="premium-section manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e" data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E">',
    '<p class="eyebrow">Export compact 9E</p>',
    "<h2>Messages erreur dry-run</h2>",
    `<p>${model.coachFacingErrorCopyCount} erreurs, ${model.coachFacingBlockerCopyCount} blockers, ${model.coachFacingRefusalCopyCount} refusals. Cas compatible: non accepte.</p>`,
    `<ul>${rows}</ul>`,
    `<p>No-runtime: validation ${model.validationRuntimeActive}, payload lu ${model.realPayloadReadCount}, payload accepte ${model.dryRunAcceptedPayloadCount}, preview ${model.realPreviewGenerated}, storage ${model.storageCreated}, official truth ${model.officialTruthPromoted}.</p>`,
    `<p>Badge: ${escapeHtml(model.exportCoverBadgeText)}. Main id: compressed-export-9e. Data current: 9E. Historique preserve: 9D/9C/9B/9A/8Z/8Y/8X/8W.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExport9E(exportHtml: string, section: string): string {
  let nextHtml = normalizeManualReviewPreviewPayloadDryRunCoachFacingErrorCopyShell9E(exportHtml);
  if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e"')) {
    const anchor = 'id="manual-review-export-metadata-badge-cleanup-export-9d"';
    const sectionEnd = "</section>";
    const index = nextHtml.indexOf(anchor);
    if (index !== -1) {
      const end = nextHtml.indexOf(sectionEnd, index);
      if (end !== -1) {
        const insertAt = end + sectionEnd.length;
        nextHtml = `${nextHtml.slice(0, insertAt)}\n${section}\n${nextHtml.slice(insertAt)}`;
      }
    }
    if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e"')) {
      nextHtml = nextHtml.includes("</main>")
        ? nextHtml.replace("</main>", `${section}\n</main>`)
        : `${nextHtml}\n${section}`;
    }
  }
  return normalizeManualReviewPreviewPayloadDryRunCoachFacingErrorCopyShell9E(nextHtml);
}
