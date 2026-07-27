import { escapeHtml } from "./htmlCoachReport";
import { coachDecisionCards8K } from "./renderCoachDecisionLayerProduct8K";

function compactItem(cardIndex: number): string {
  const card = coachDecisionCards8K[cardIndex];
  if (card === undefined) return "";
  return [
    `<article class="card observation-export-card-8k" data-decision-card-id="${escapeHtml(card.decisionCardId)}">`,
    `<h3>${escapeHtml(card.title)}</h3>`,
    `<p>${escapeHtml(card.observationFocus)}</p>`,
    `<p><strong>Confirme si :</strong> ${escapeHtml(card.confirmationSignal)}</p>`,
    `<p><strong>Infirme si :</strong> ${escapeHtml(card.disconfirmationSignal)}</p>`,
    `<p><strong>Risque :</strong> ${escapeHtml(card.riskToWatch)}</p>`,
    "</article>",
  ].join("");
}

export function renderCoachDecisionLayerExport8K(): string {
  return [
    `<section id="next-match-observation-export-8k" class="premium-section coach-decision-layer-export-8k" data-decision-layer-version="8K">`,
    "<h2>A observer au prochain match</h2>",
    "<div class=\"grid\">",
    compactItem(0),
    compactItem(1),
    compactItem(2),
    "</div>",
    "<p class=\"guard\">Grille d'observation, pas consigne de selection. Score et replay restent issus des score_change officiels.</p>",
    "</section>",
  ].join("\n");
}

export function insertCoachDecisionLayerExport8K(exportHtml: string): string {
  if (exportHtml.includes('id="next-match-observation-export-8k"')) {
    return exportHtml;
  }
  const section = renderCoachDecisionLayerExport8K();
  const marker = "</section>";
  const actionPlanIndex = exportHtml.indexOf('id="coach-action-plan"');
  if (actionPlanIndex < 0) {
    return exportHtml.includes("</main>")
      ? exportHtml.replace("</main>", `${section}\n</main>`)
      : `${exportHtml}\n${section}`;
  }
  const end = exportHtml.indexOf(marker, actionPlanIndex);
  if (end < 0) {
    return `${exportHtml}\n${section}`;
  }
  const insertAt = end + marker.length;
  return `${exportHtml.slice(0, insertAt)}\n${section}${exportHtml.slice(insertAt)}`;
}
