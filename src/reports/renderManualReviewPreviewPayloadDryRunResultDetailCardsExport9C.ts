import type { ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel } from "./manualReviewPreviewPayloadDryRunResultDetailCardsTypes9C";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

export function renderManualReviewPreviewPayloadDryRunResultDetailCardsExport9C(
  model: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
): string {
  const compactCards = model.detailCards
    .slice(0, 6)
    .map((card) => `<li><strong>${escapeHtml(card.source9ACaseId)}</strong>: ${escapeHtml(card.coachFacingStatusLabel)}; boundary ${escapeHtml(card.protectedBoundary)}</li>`)
    .join("");

  return [
    '<section id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c" class="premium-section manual-review-preview-payload-dry-run-result-detail-cards-export-9c" data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C">',
    '<p class="eyebrow">Cartes detail dry-run 9C</p>',
    "<h2>Cartes detail dry-run</h2>",
    `<p>${model.detailCardCount} cartes, ${model.detailCardGroupCount} groupes. Cas compatible accepte: ${model.dryRunAcceptedPayloadCount}. Preview reelle: ${model.previewActivationCount}.</p>`,
    `<p>Couverture: regles ${model.detailRuleCoverageCount}/${model.detailRuleCoverageExpected}, erreurs ${model.detailErrorCoverageCount}/${model.detailErrorCoverageExpected}, blockers ${model.detailBlockerCoverageCount}/${model.detailBlockerCoverageExpected}, refusals ${model.detailRefusalStateCoverageCount}/${model.detailRefusalStateCoverageExpected}.</p>`,
    `<ul>${compactCards}</ul>`,
    `<p>Wording score: ${model.wordingReadabilityScore}; statut wording: ${model.wordingThresholdStatus}. Cartes non-runtime, non-officielles, non persistees et non appliquees.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunResultDetailCardsExport9C(exportHtml: string, section: string): string {
  let nextHtml = exportHtml;

  if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"')) {
    const anchor = "</section>";
    const section9B = nextHtml.indexOf('id="manual-review-preview-payload-dry-run-result-renderer-export-9b"');
    if (section9B !== -1) {
      const end9B = nextHtml.indexOf(anchor, section9B);
      if (end9B !== -1) {
        const insertAt = end9B + anchor.length;
        nextHtml = `${nextHtml.slice(0, insertAt)}\n${section}\n${nextHtml.slice(insertAt)}`;
      }
    }

    if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"')) {
      nextHtml = nextHtml.includes("</main>")
        ? nextHtml.replace("</main>", `${section}\n</main>`)
        : `${nextHtml}\n${section}`;
    }
  }

  nextHtml = nextHtml.replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9C - cartes detail dry-run</title>");
  nextHtml = nextHtml.replace(/id="compressed-export-9b"/gu, 'id="compressed-export-9c"');
  nextHtml = nextHtml.replace(/id="compressed-export-[^"]+"/u, 'id="compressed-export-9c"');
  nextHtml = nextHtml.replace(/<span class="badge">Export compact 9B<\/span>/u, '<span class="badge">Export compact 9C</span>');
  nextHtml = nextHtml.replace(/<span class="badge">Export compact 9A<\/span>/u, '<span class="badge">Export compact 9C</span>');
  nextHtml = nextHtml.replace(/<span class="badge">Export compact 8Z<\/span>/u, '<span class="badge">Export compact 9C</span>');

  const mainTag = nextHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"')) {
    nextHtml = nextHtml.replace(
      /<main\b/u,
      '<main data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"',
    );
  }

  return nextHtml;
}
