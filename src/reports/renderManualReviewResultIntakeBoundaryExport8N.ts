export function renderManualReviewResultIntakeBoundaryExport8N(): string {
  return [
    '<section id="manual-review-result-intake-boundary-export-8n" class="premium-section manual-review-result-intake-boundary-export-8n" data-manual-review-intake-boundary-version="8N">',
    "<h2>Frontiere de saisie manuelle</h2>",
    '<ul class="compact-list">',
    "<li>Accepte uniquement 3 entrees liees aux 3 observations.</li>",
    "<li>Accepte seulement Confirme / Infirme / Inconclusif / Echantillon insuffisant.</li>",
    "<li>Valide en preview uniquement : aucune persistance, aucune mutation officielle.</li>",
    "<li>Rejette toute classification automatique, stockage, selection ou consigne tactique.</li>",
    "</ul>",
    '<p class="guard">Une saisie coach reste une revue manuelle non officielle.</p>',
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

function updateExportMetadata8N(exportHtml: string): string {
  let updated = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8N - frontiere saisie manuelle</title>",
  );
  updated = updated.replace(
    /<main\b([^>]*)\bid="compressed-export-8i"([^>]*)>/iu,
    '<main$1id="compressed-export-8n"$2>',
  );
  updated = updated.replace(
    /<main\b(?![^>]*\bdata-manual-review-intake-boundary-version=)/iu,
    '<main data-manual-review-intake-boundary-version="8N"',
  );
  updated = updated.replace(
    /Export story-first 8I/gu,
    "Export compact 8N",
  );
  return updated;
}

export function insertManualReviewResultIntakeBoundaryExport8N(exportHtml: string): string {
  const metadataHtml = updateExportMetadata8N(exportHtml);
  if (metadataHtml.includes('id="manual-review-result-intake-boundary-export-8n"')) return metadataHtml;
  const section = renderManualReviewResultIntakeBoundaryExport8N();
  const manualFormIndex = metadataHtml.indexOf('id="manual-post-match-review-form-export-8m"');
  if (manualFormIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, manualFormIndex);
    if (insertAt >= 0) {
      return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
    }
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
