import { escapeHtml } from "./htmlCoachReport";
import { observationOutcomeCards8L } from "./renderSeasonlessLearningLoopProduct8L";

function compactCard(cardIndex: number): string {
  const card = observationOutcomeCards8L[cardIndex];
  if (card === undefined) return "";
  return [
    `<article class="card observation-outcome-export-card-8l" data-observation-card-id="${escapeHtml(card.observationCardId)}">`,
    `<h3>${escapeHtml(card.title)}</h3>`,
    "<p><strong>Statut :</strong> a observer</p>",
    `<p><strong>Confirme si :</strong> ${escapeHtml(card.confirmationCriteria)}</p>`,
    `<p><strong>Infirme si :</strong> ${escapeHtml(card.disconfirmationCriteria)}</p>`,
    `<p><strong>Insuffisant si :</strong> ${escapeHtml(card.insufficientEvidenceCriteria)}</p>`,
    "</article>",
  ].join("");
}

export function renderSeasonlessLearningLoopExport8L(): string {
  return [
    `<section id="seasonless-learning-loop-export-8l" class="premium-section seasonless-learning-loop-export-8l" data-learning-loop-version="8L">`,
    "<h2>Grille de suivi apres prochain match</h2>",
    "<div class=\"grid\">",
    compactCard(0),
    compactCard(1),
    compactCard(2),
    "</div>",
    "<p class=\"guard\">A renseigner apres le prochain match. Pas une memoire de saison, pas une consigne de selection.</p>",
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

export function insertSeasonlessLearningLoopExport8L(exportHtml: string): string {
  if (exportHtml.includes('id="seasonless-learning-loop-export-8l"')) return exportHtml;
  const section = renderSeasonlessLearningLoopExport8L();
  const observationIndex = exportHtml.indexOf('id="next-match-observation-export-8k"');
  if (observationIndex < 0) {
    return exportHtml.includes("</main>")
      ? exportHtml.replace("</main>", `${section}\n</main>`)
      : `${exportHtml}\n${section}`;
  }
  const insertAt = findBalancedSectionEnd(exportHtml, observationIndex);
  return insertAt < 0 ? `${exportHtml}\n${section}` : `${exportHtml.slice(0, insertAt)}\n${section}${exportHtml.slice(insertAt)}`;
}
