import { escapeHtml } from "./htmlCoachReport";

function boundaryCard(title: string, items: readonly string[]): string {
  return [
    '<article class="product-card manual-intake-boundary-card-8n">',
    `<h3>${escapeHtml(title)}</h3>`,
    "<ul>",
    ...items.map((item) => `<li>${escapeHtml(item)}</li>`),
    "</ul>",
    "</article>",
  ].join("");
}

export function renderManualReviewResultIntakeBoundaryProduct8N(): string {
  return [
    '<section id="manual-review-result-intake-boundary-8n" class="premium-section manual-review-result-intake-boundary-8n" data-manual-review-intake-boundary-version="8N">',
    "<h2>Frontiere d'entree des resultats manuels</h2>",
    '<p class="eyebrow">Contrat de saisie, pas verite officielle</p>',
    "<p>Cette section definit comment un formulaire 8M rempli plus tard pourra etre lu en mode validation/preview. Elle ne stocke rien et ne transforme pas la revue coach en verite officielle.</p>",
    '<div class="product-card-grid">',
    boundaryCard("Ce qui sera accepte", [
      "3 entrees liees aux 3 observations 8M/8L/8K.",
      "Une option manuelle par observation.",
      "Des compteurs manuels, des notes coach et un contexte comparable.",
      "Acknowledgement explicite des limites.",
    ]),
    boundaryCard("Ce qui sera rejete", [
      "Resultat automatique ou outcome inconnu.",
      "Section non liee a une observation connue.",
      "Demande de stockage, submit ou backend.",
      "Mutation score/timeline, promotion officielle, selection ou tactique automatique.",
    ]),
    boundaryCard("Statut de la donnee", [
      "Donnee coach manuelle.",
      "Non officielle.",
      "Validate/preview only.",
      "Non persistee et sans modification du match.",
    ]),
    boundaryCard("Frontieres", [
      "Pas de memoire de saison ni team style memory.",
      "Pas de localStorage, base de donnees ou fichier de persistance.",
      "Pas de score/timeline mutation.",
      "Pas de selection automatique ni consigne tactique.",
    ]),
    "</div>",
    '<p class="guard manual-intake-boundary-note-8n"><strong>Intake contract only :</strong> le contrat accepte ou rejette une saisie future, mais ne l applique pas au rapport officiel.</p>',
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

export function insertManualReviewResultIntakeBoundaryProduct8N(productHtml: string): string {
  if (productHtml.includes('id="manual-review-result-intake-boundary-8n"')) return productHtml;
  const section = renderManualReviewResultIntakeBoundaryProduct8N();
  const manualFormIndex = productHtml.indexOf('id="manual-post-match-review-form-8m"');
  if (manualFormIndex >= 0) {
    const insertAt = findBalancedSectionEnd(productHtml, manualFormIndex);
    if (insertAt >= 0) {
      return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
    }
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
