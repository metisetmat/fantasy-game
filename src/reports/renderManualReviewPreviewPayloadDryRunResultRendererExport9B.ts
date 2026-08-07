import type { ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel } from "./manualReviewPreviewPayloadDryRunResultRendererTypes9B";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

export function renderManualReviewPreviewPayloadDryRunResultRendererExport9B(
  model: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
): string {
  const compactRows = model.renderedRows
    .slice(0, 5)
    .map((row) => `<li><strong>${escapeHtml(row.caseLabel)}</strong>: ${escapeHtml(row.coachFacingStatusLabel)}</li>`)
    .join("");

  return [
    '<section id="manual-review-preview-payload-dry-run-result-renderer-export-9b" class="premium-section manual-review-preview-payload-dry-run-result-renderer-export-9b" data-manual-review-preview-payload-dry-run-result-renderer-version="9B">',
    '<p class="eyebrow">Resultats dry-run 9B</p>',
    "<h2>Resultats dry-run payload</h2>",
    `<p>${model.renderedCaseCount} cas rendus en ${model.coachFacingResultGroupCount} groupes. Le cas compatible reste non accepte: ${model.dryRunAcceptedPayloadCount} payload accepte, ${model.previewActivationCount} preview activee.</p>`,
    `<p>Couverture: regles ${model.renderedRuleCoverageCount}/${model.renderedRuleCoverageExpected}, erreurs ${model.renderedErrorCoverageCount}/${model.renderedErrorCoverageExpected}, blockers ${model.renderedBlockerCoverageCount}/${model.renderedBlockerCoverageExpected}, refusals ${model.renderedRefusalStateCoverageCount}/${model.renderedRefusalStateCoverageExpected}.</p>`,
    `<ul>${compactRows}</ul>`,
    `<p>Wording score: ${model.wordingReadabilityScore}; statut wording: ${model.wordingThresholdStatus}. Renderer non-runtime, non-officiel, non persiste et non applique.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewPreviewPayloadDryRunResultRendererExport9B(exportHtml: string, section: string): string {
  let nextHtml = exportHtml;

  if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-result-renderer-export-9b"')) {
    const anchor = "</section>";
    const section9A = nextHtml.indexOf('id="manual-review-preview-payload-dry-run-validator-export-9a"');
    if (section9A !== -1) {
      const end9A = nextHtml.indexOf(anchor, section9A);
      if (end9A !== -1) {
        const insertAt = end9A + anchor.length;
        nextHtml = `${nextHtml.slice(0, insertAt)}\n${section}\n${nextHtml.slice(insertAt)}`;
      }
    }

    if (!nextHtml.includes('id="manual-review-preview-payload-dry-run-result-renderer-export-9b"')) {
      nextHtml = nextHtml.includes("</main>")
        ? nextHtml.replace("</main>", `${section}\n</main>`)
        : `${nextHtml}\n${section}`;
    }
  }

  nextHtml = nextHtml.replace(/<title>[^<]*<\/title>/u, "<title>Rapport coach export compact 9B - resultats dry-run payload</title>");
  nextHtml = nextHtml.replace(/id="compressed-export-9a"/gu, 'id="compressed-export-9b"');
  nextHtml = nextHtml.replace(/id="compressed-export-[^"]+"/u, 'id="compressed-export-9b"');
  nextHtml = nextHtml.replace(/Export compact 9A/gu, "Export compact 9B");
  nextHtml = nextHtml.replace(/Dry-run payload 9A/gu, "Resultats dry-run 9B");

  const mainTagMatch = nextHtml.match(/<main\b[^>]*>/u);
  const mainTag = mainTagMatch?.[0] ?? "";
  if (!mainTag.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"')) {
    nextHtml = nextHtml.replace(
      /<main\b/u,
      '<main data-manual-review-preview-payload-dry-run-result-renderer-version="9B"',
    );
  }

  return nextHtml;
}
