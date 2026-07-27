import { escapeHtml } from "./htmlCoachReport";
import { buildManualPostMatchObservationReviewForm8M } from "./renderManualPostMatchObservationReviewFormProduct8M";

function compactOptions(sectionId: string): string {
  const options = [
    ["confirmed", "Confirme"],
    ["contradicted", "Infirme"],
    ["inconclusive", "Inconclusif"],
    ["insufficient_sample", "Echantillon insuffisant"],
  ] as const;
  return options
    .map(([value, label]) => `<label><input type="checkbox" name="${escapeHtml(sectionId)}-export-outcome" value="${value}" /> ${escapeHtml(label)}</label>`)
    .join("");
}

export function renderManualPostMatchObservationReviewFormExport8M(): string {
  const form = buildManualPostMatchObservationReviewForm8M({
    source8LTrackerId: "seasonless-observation-outcome-tracker-8l",
  });
  return [
    `<section id="manual-post-match-review-form-export-8m" class="premium-section manual-post-match-review-form-export-8m" data-manual-review-form-version="8M">`,
    "<h2>Formulaire post-match a remplir</h2>",
    "<p class=\"guard\">A completer a la main apres le prochain match. Aucun resultat n'est pre-rempli.</p>",
    "<div class=\"grid\">",
    ...form.sections.map((section) => [
      `<article class="card manual-review-export-card-8m" data-linked-8l-card-id="${escapeHtml(section.linked8LObservationCardId)}">`,
      `<h3>${escapeHtml(section.title)}</h3>`,
      "<p><strong>Statut :</strong> pending / blank / not_evaluated</p>",
      `<p><strong>Observation 8L :</strong> ${escapeHtml(section.sourceObservation)}</p>`,
      `<div class="manual-export-options">${compactOptions(section.sectionId)}</div>`,
      "<p><strong>Preuves comptees :</strong> ____</p>",
      "<p><strong>Contexte comparable :</strong> ____</p>",
      "<p><strong>Notes :</strong> ____</p>",
      "</article>",
    ].join("")),
    "</div>",
    "<p class=\"guard\">Note finale : ce bloc reste une feuille de revue coach, pas une memoire d'equipe ni une consigne automatique.</p>",
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

function updateExportMetadata8M(exportHtml: string): string {
  const withTitle = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8M - formulaire post-match manuel</title>",
  );
  if (withTitle.includes('data-manual-review-form-version="8M"')) {
    return withTitle;
  }
  if (/<main\b/iu.test(withTitle)) {
    return withTitle.replace(/<main\b/iu, '<main data-manual-review-form-version="8M"');
  }
  return withTitle;
}

export function insertManualPostMatchObservationReviewFormExport8M(exportHtml: string): string {
  const metadataHtml = updateExportMetadata8M(exportHtml);
  if (metadataHtml.includes('id="manual-post-match-review-form-export-8m"')) return metadataHtml;
  const section = renderManualPostMatchObservationReviewFormExport8M();
  const learningLoopIndex = metadataHtml.indexOf('id="seasonless-learning-loop-export-8l"');
  if (learningLoopIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, learningLoopIndex);
    if (insertAt >= 0) {
      return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
    }
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
