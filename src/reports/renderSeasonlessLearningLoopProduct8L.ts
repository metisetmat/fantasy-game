import { escapeHtml } from "./htmlCoachReport";
import type {
  ObservationOutcomeCard8L,
  ObservationOutcomeTracker8L,
  PostMatchOutcomeOption8L,
  SeasonlessLearningBoundary8L,
} from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";

export const postMatchOutcomeOptions8L: readonly PostMatchOutcomeOption8L[] = [
  {
    outcomeId: "confirmed",
    label: "Confirme",
    meaning: "Le signal attendu est observe apres le prochain match avec un echantillon suffisant.",
    whenToUse: "Seulement apres revision manuelle du prochain match.",
    forbiddenUse: "Ne jamais l'utiliser avant que le prochain match soit joue.",
    nextCoachQuestion: "Le signal est-il reproductible sans creer de consigne automatique ?",
  },
  {
    outcomeId: "contradicted",
    label: "Infirme",
    meaning: "Le prochain match montre surtout le signal inverse.",
    whenToUse: "Seulement apres revision manuelle et contexte comparable.",
    forbiddenUse: "Ne pas l'utiliser sur une seule action isolee.",
    nextCoachQuestion: "Le contexte etait-il comparable a l'observation 8K ?",
  },
  {
    outcomeId: "inconclusive",
    label: "Inconclusif",
    meaning: "Des signaux mixtes apparaissent sans conclusion claire.",
    whenToUse: "Quand confirmation et contradiction coexistent.",
    forbiddenUse: "Ne pas le transformer en regle durable.",
    nextCoachQuestion: "Quels signaux doivent etre revus au match suivant ?",
  },
  {
    outcomeId: "insufficient_sample",
    label: "Echantillon insuffisant",
    meaning: "Le prochain match ne fournit pas assez de situations comparables.",
    whenToUse: "Quand le minimum de preuves n'est pas atteint.",
    forbiddenUse: "Ne pas combler le manque par prediction.",
    nextCoachQuestion: "Quelle situation comparable faut-il surveiller ensuite ?",
  },
];

export const observationOutcomeCards8L: readonly ObservationOutcomeCard8L[] = [
  {
    observationCardId: "outcome-first-exit-after-recovery-8l",
    linked8KDecisionCardId: "decision-first-exit-after-recovery-8k",
    title: "Premiere sortie apres recuperation",
    currentStatus: "pending",
    whatToCheckNextMatch: "Observer les 2 premieres secondes apres recuperation.",
    confirmationCriteria: "Recuperation suivie d'un relais simple, d'un porteur oriente ou d'une possession stabilisee.",
    disconfirmationCriteria: "Recuperation suivie d'une perte immediate, d'un tir isole ou d'un porteur enferme.",
    insufficientEvidenceCriteria: "Moins de 3 recuperations comparables.",
    minimumEvidenceNeeded: "Au moins 3 recuperations comparables.",
    observationWindow: "next_match_manual_review",
    manualReviewQuestion: "La premiere sortie protege-t-elle mieux le ballon apres recuperation ?",
    postMatchOutcomeOptions: postMatchOutcomeOptions8L,
    cautionNote: "Un seul exemple propre ne suffit pas.",
    sourceBoundary: "Carte derivee de l'observation 8K, a renseigner apres le prochain match.",
    visibleInProduct: true,
    visibleInExport: true,
    noSelectionRecommendation: true,
    noTacticalInstruction: true,
  },
  {
    observationCardId: "outcome-danger-continuity-8l",
    linked8KDecisionCardId: "decision-danger-continuity-8k",
    title: "Continuite apres entree en zone dangereuse",
    currentStatus: "pending",
    whatToCheckNextMatch: "Verifier si l'entree en zone dangereuse produit une deuxieme action controlee.",
    confirmationCriteria: "Progression + soutien + seconde action controlee.",
    disconfirmationCriteria: "Action coupee, tir precipite, recuperation adverse ou isolement.",
    insufficientEvidenceCriteria: "Trop peu d'entrees dangereuses comparables.",
    minimumEvidenceNeeded: "Plusieurs entrees dangereuses avec contexte de pression comparable.",
    observationWindow: "next_match_manual_review",
    manualReviewQuestion: "Le danger devient-il une phase controlee plutot qu'une action isolee ?",
    postMatchOutcomeOptions: postMatchOutcomeOptions8L,
    cautionNote: "Ne pas confondre danger isole et continuite maitrisee.",
    sourceBoundary: "Carte derivee de l'observation 8K, sans prediction du prochain match.",
    visibleInProduct: true,
    visibleInExport: true,
    noSelectionRecommendation: true,
    noTacticalInstruction: true,
  },
  {
    observationCardId: "outcome-structure-after-neutralized-action-8l",
    linked8KDecisionCardId: "decision-structure-after-pressure-8k",
    title: "Structure apres action neutralisee",
    currentStatus: "pending",
    whatToCheckNextMatch: "Regarder la structure autour du second ballon apres pression, tir, arret ou rebond.",
    confirmationCriteria: "Second ballon protege, rest-defense stabilisee ou bloc reorganise.",
    disconfirmationCriteria: "Rebond central adverse, transition concedee, desorganisation ou sur-engagement.",
    insufficientEvidenceCriteria: "Moins de 2 actions neutralisees comparables.",
    minimumEvidenceNeeded: "Au moins 2 actions neutralisees comparables.",
    observationWindow: "next_match_manual_review",
    manualReviewQuestion: "L'equipe reste-t-elle stable apres une action neutralisee ?",
    postMatchOutcomeOptions: postMatchOutcomeOptions8L,
    cautionNote: "Une sequence spectaculaire ne prouve pas une structure stable.",
    sourceBoundary: "Carte derivee de l'observation 8K, a remplir uniquement apres revision.",
    visibleInProduct: true,
    visibleInExport: true,
    noSelectionRecommendation: true,
    noTacticalInstruction: true,
  },
];

export const seasonlessLearningBoundaries8L: readonly SeasonlessLearningBoundary8L[] = [
  {
    boundaryId: "boundary-no-season-memory-8l",
    label: "Pas de memoire de saison",
    text: "Cette grille prepare une revision manuelle du prochain match; elle ne cree ni memoire de saison, ni team style memory, ni stockage.",
    prevents: ["season_memory_creation", "team_style_memory_creation", "database_persistence", "future_result_claim"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "boundary-no-automatic-decision-8l",
    label: "Pas de decision automatique",
    text: "La grille ne selectionne aucun joueur, ne fixe aucune composition et n'impose aucun systeme.",
    prevents: ["automatic_selection", "tactical_instruction", "overclaiming"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "boundary-no-future-result-8l",
    label: "Pas de resultat futur",
    text: "Aucun prochain match n'est encore observe; chaque carte reste pending jusqu'a revision manuelle.",
    prevents: ["future_result_claim", "sandbox_promotion", "overclaiming"],
    visibleInProduct: true,
    visibleInExport: true,
  },
];

export function buildObservationOutcomeTracker8L(input: {
  readonly sourceMatchId: string;
}): ObservationOutcomeTracker8L {
  return {
    trackerId: "seasonless-observation-outcome-tracker-8l",
    sourceMatchId: input.sourceMatchId,
    sourceSprint: "8K",
    targetScope: "next_match_manual_review",
    trackerState: "pending",
    observationCards: observationOutcomeCards8L,
    outcomeMatrix: postMatchOutcomeOptions8L,
    minimumEvidenceRules: observationOutcomeCards8L.map((card) => card.minimumEvidenceNeeded),
    cautionRules: observationOutcomeCards8L.map((card) => card.cautionNote),
    notPersisted: true,
    noSeasonMemory: true,
    noTeamStyleMemory: true,
    noDatabaseStorage: true,
    noAutomaticDecision: true,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function trackerCardHtml(card: ObservationOutcomeCard8L): string {
  return [
    `<article class="product-card observation-outcome-card-8l" data-observation-card-id="${escapeHtml(card.observationCardId)}" data-linked-8k-card-id="${escapeHtml(card.linked8KDecisionCardId)}">`,
    `<p class="eyebrow">Statut actuel : a observer / non evalue</p>`,
    `<h3>${escapeHtml(card.title)}</h3>`,
    `<p><strong>Question de suivi :</strong> ${escapeHtml(card.manualReviewQuestion)}</p>`,
    `<p><strong>A verifier :</strong> ${escapeHtml(card.whatToCheckNextMatch)}</p>`,
    `<p><strong>Confirme si :</strong> ${escapeHtml(card.confirmationCriteria)}</p>`,
    `<p><strong>Infirme si :</strong> ${escapeHtml(card.disconfirmationCriteria)}</p>`,
    `<p><strong>Echantillon insuffisant si :</strong> ${escapeHtml(card.insufficientEvidenceCriteria)}</p>`,
    `<p><strong>Minimum de preuves :</strong> ${escapeHtml(card.minimumEvidenceNeeded)}</p>`,
    `<p><strong>Prudence :</strong> ${escapeHtml(card.cautionNote)}</p>`,
    `<p><strong>Lien 8K :</strong> ${escapeHtml(card.linked8KDecisionCardId)}</p>`,
    `<p class="guard">${escapeHtml(card.sourceBoundary)}</p>`,
    "</article>",
  ].join("");
}

export function renderSeasonlessLearningLoopProduct8L(input: {
  readonly sourceMatchId: string;
}): string {
  const tracker = buildObservationOutcomeTracker8L(input);
  return [
    `<section id="seasonless-learning-loop-8l" class="premium-section seasonless-learning-loop-8l" data-learning-loop-version="8L">`,
    "<h2>Boucle d'apprentissage sans memoire de saison</h2>",
    "<p class=\"eyebrow\">A remplir apres le prochain match</p>",
    "<p>Cette section ne pretend pas connaitre le prochain match. Elle transforme les trois observations 8K en grille de suivi a renseigner apres le prochain match.</p>",
    "<h3>Cartes de suivi</h3>",
    `<div class="product-card-grid">${tracker.observationCards.map(trackerCardHtml).join("")}</div>`,
    "<h3>Comment utiliser cette grille</h3>",
    "<ul><li>Pendant le prochain match, noter uniquement les signaux comparables.</li><li>Apres le match, choisir Confirme / Infirme / Inconclusif / Echantillon insuffisant.</li><li>Ne pas transformer une seule action en regle.</li><li>Ne pas transformer cette grille en consigne de composition.</li></ul>",
    "<h3>Options post-match</h3>",
    `<ul>${tracker.outcomeMatrix.map((option) => `<li><strong>${escapeHtml(option.label)} :</strong> ${escapeHtml(option.meaning)}</li>`).join("")}</ul>`,
    "<h3>Frontieres</h3>",
    `<div class="product-card-grid">${seasonlessLearningBoundaries8L.map((boundary) => `<article class="product-card seasonless-boundary-note-8l"><h3>${escapeHtml(boundary.label)}</h3><p>${escapeHtml(boundary.text)}</p></article>`).join("")}</div>`,
    "</section>",
  ].join("\n");
}

function findBalancedSectionEnd(html: string, markerIndex: number): number {
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return -1;
  return findBalancedSectionEndFromStart(html, sectionStart);
}

function findBalancedSectionEndFromStart(html: string, sectionStart: number): number {
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

function findContainingProductSectionEnd(html: string, markerIndex: number): number {
  const pattern = /<\/?section\b[^>]*>/giu;
  const stack: { readonly start: number; readonly tag: string }[] = [];

  for (const match of html.matchAll(pattern)) {
    const tag = match[0];
    const index = match.index ?? 0;
    if (index > markerIndex) break;
    if (tag.startsWith("</")) {
      stack.pop();
    } else {
      stack.push({ start: index, tag });
    }
  }

  const productSection = [...stack]
    .reverse()
    .find((entry) => /\bproduct-section\b/iu.test(entry.tag));
  return productSection === undefined ? -1 : findBalancedSectionEndFromStart(html, productSection.start);
}

export function insertSeasonlessLearningLoopProduct8L(productHtml: string, sourceMatchId: string): string {
  if (productHtml.includes('id="seasonless-learning-loop-8l"')) return productHtml;
  const section = renderSeasonlessLearningLoopProduct8L({ sourceMatchId });
  const decisionIndex = productHtml.indexOf('id="coach-decision-layer-8k"');
  if (decisionIndex < 0) {
    return productHtml.includes("</main>")
      ? productHtml.replace("</main>", `${section}\n</main>`)
      : `${productHtml}\n${section}`;
  }
  const insertAt = findContainingProductSectionEnd(productHtml, decisionIndex);
  if (insertAt >= 0) {
    return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
  }
  const nestedInsertAt = findBalancedSectionEnd(productHtml, decisionIndex);
  return nestedInsertAt < 0 ? `${productHtml}\n${section}` : `${productHtml.slice(0, nestedInsertAt)}\n${section}${productHtml.slice(nestedInsertAt)}`;
}
