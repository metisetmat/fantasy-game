import { escapeHtml } from "./htmlCoachReport";
import type {
  CoachDecisionCard8K,
  DecisionBoundaryNote8K,
  NextMatchObservationItem8K,
  NextMatchObservationPlan8K,
} from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";

export const coachDecisionCards8K: readonly CoachDecisionCard8K[] = [
  {
    decisionCardId: "decision-first-exit-after-recovery-8k",
    priorityLevel: "primary",
    title: "Securiser la premiere sortie apres recuperation",
    decisionQuestion: "La premiere sortie apres recuperation devient-elle plus propre ?",
    whyThisMatters: "Le recit montre que les recuperations n'ont de valeur coach que si le premier relais protege la possession et la rest-defense.",
    linkedStoryMomentIds: ["official-match-story-spine"],
    linkedReplayMomentIds: ["coach-replay-8e"],
    linkedActionPlanCardIds: ["coach-action-plan"],
    linkedTacticalMapCardIds: ["tactical-map-cards"],
    linkedTrendIds: ["multi-match-trend-signals"],
    observationFocus: "Observer les deux premieres secondes apres recuperation : soutien disponible, passe simple, orientation du porteur.",
    confirmationSignal: "Moins de pertes immediates apres recuperation et une possession qui reste controlee.",
    disconfirmationSignal: "Recuperation suivie d'une perte, d'un tir isole ou d'une sortie sous pression sans relais.",
    riskToWatch: "Soutien trop proche qui ralentit la projection ou expose la rest-defense.",
    doNotOverInterpret: "Une sortie propre isolee ne suffit pas a conclure que le probleme est resolu.",
    evidenceBoundary: "Piste issue du replay et des cartes tactiques ; elle n'impose ni joueur, ni composition, ni systeme.",
    confidence: "medium",
    sourceType: "official_with_limitation",
    imposesSelection: false,
    imposesTacticalPlan: false,
    scoreChangeBackedWhereRelevant: true,
  },
  {
    decisionCardId: "decision-danger-continuity-8k",
    priorityLevel: "secondary",
    title: "Transformer les zones de danger en continuite",
    decisionQuestion: "Les entrees en zone dangereuse produisent-elles une deuxieme action controlee ?",
    whyThisMatters: "Le match bascule quand la menace est suivie d'un soutien ou d'un second ballon, pas seulement par une entree isolee.",
    linkedStoryMomentIds: ["official-match-story-spine"],
    linkedReplayMomentIds: ["coach-replay-8e"],
    linkedActionPlanCardIds: ["coach-action-plan"],
    linkedTacticalMapCardIds: ["tactical-map-cards"],
    linkedTrendIds: ["multi-match-trend-signals"],
    observationFocus: "Verifier si une entree dangereuse cree progression, soutien, puis seconde action.",
    confirmationSignal: "Progression + soutien + seconde action controlee dans la meme phase.",
    disconfirmationSignal: "Action coupee, tir precipite ou recuperation adverse avant le relais.",
    riskToWatch: "Ralentir l'attaque ou perdre la profondeur en cherchant trop de securite.",
    doNotOverInterpret: "Une zone dangereuse ne prouve pas seule une domination durable.",
    evidenceBoundary: "Observation officielle limitee au match courant, completee par tendances prudentes non decisives.",
    confidence: "medium",
    sourceType: "trend_prudent",
    imposesSelection: false,
    imposesTacticalPlan: false,
    scoreChangeBackedWhereRelevant: true,
  },
  {
    decisionCardId: "decision-structure-after-pressure-8k",
    priorityLevel: "watch",
    title: "Garder une structure apres pression, tir ou arret",
    decisionQuestion: "L'equipe reste-t-elle organisee apres une action neutralisee ?",
    whyThisMatters: "Les phases neutralisees deviennent dangereuses si le bloc perd le second ballon ou s'ouvre dans l'axe.",
    linkedStoryMomentIds: ["official-match-story-spine"],
    linkedReplayMomentIds: ["coach-replay-8e"],
    linkedActionPlanCardIds: ["coach-action-plan"],
    linkedTacticalMapCardIds: ["tactical-map-cards"],
    linkedTrendIds: ["multi-match-trend-signals"],
    observationFocus: "Regarder la structure autour du second ballon apres pression, tir, arret ou rebond.",
    confirmationSignal: "Second ballon protege ou rest-defense stabilisee apres l'action neutralisee.",
    disconfirmationSignal: "Rebond central adverse, transition encaissee ou desorganisation visible.",
    riskToWatch: "Sur-engagement et fatigue si trop de joueurs chassent le meme ballon.",
    doNotOverInterpret: "Un seul rebond subi ne suffit pas a condamner la structure.",
    evidenceBoundary: "Signal d'observation ; le sandbox et les diagnostics restent exclus du recit officiel.",
    confidence: "medium",
    sourceType: "official_with_limitation",
    imposesSelection: false,
    imposesTacticalPlan: false,
    scoreChangeBackedWhereRelevant: true,
  },
];

export const nextMatchObservationItems8K: readonly NextMatchObservationItem8K[] = [
  {
    observationItemId: "observe-after-recovery-8k",
    title: "Apres recuperation",
    linkedDecisionCardId: "decision-first-exit-after-recovery-8k",
    whatToWatch: "Verifier si la premiere sortie reste propre.",
    whenToWatch: "after_recovery",
    whereToWatch: "Zone de recuperation et premier relais proche.",
    replayReference: "Replay coach : premiere bascule et sorties apres pression.",
    tacticalMapReference: "Carte tactique : zones de recuperation et soutien proche.",
    positiveSignal: "Recuperation suivie d'une passe simple ou d'un porteur stabilise.",
    negativeSignal: "Perte immediate, tir isole ou soutien en retard.",
    minimumEvidenceNeeded: "Au moins trois recuperations comparables dans le prochain match.",
    cautionNote: "Ne pas transformer un exemple en choix de composition.",
    confidence: "medium",
  },
  {
    observationItemId: "observe-after-danger-entry-8k",
    title: "Apres entree en zone dangereuse",
    linkedDecisionCardId: "decision-danger-continuity-8k",
    whatToWatch: "Verifier si une deuxieme action controlee apparait.",
    whenToWatch: "after_danger_entry",
    whereToWatch: "Couloir d'entree, axe central et soutien de second ballon.",
    replayReference: "Replay coach : sequences qui changent le score.",
    tacticalMapReference: "Carte tactique : danger et progression.",
    positiveSignal: "Progression, soutien, puis nouvelle action controlee.",
    negativeSignal: "Action coupee ou recuperation adverse avant le relais.",
    minimumEvidenceNeeded: "Plusieurs entrees dangereuses avec contexte de pression similaire.",
    cautionNote: "Ne pas confondre entree dangereuse et domination garantie.",
    confidence: "medium",
  },
  {
    observationItemId: "observe-after-neutralized-action-8k",
    title: "Apres pression, tir ou arret",
    linkedDecisionCardId: "decision-structure-after-pressure-8k",
    whatToWatch: "Verifier si la structure reste stable.",
    whenToWatch: "after_pressure",
    whereToWatch: "Autour du second ballon et de l'axe central.",
    replayReference: "Replay coach : moments de reponse et verrouillage.",
    tacticalMapReference: "Carte tactique : pression, rest-defense et second ballon.",
    positiveSignal: "Second ballon protege ou bloc reorganise.",
    negativeSignal: "Rebond central adverse ou transition encaissee.",
    minimumEvidenceNeeded: "Au moins deux actions neutralisees sous pression comparable.",
    cautionNote: "Ne pas conclure sur un rebond unique.",
    confidence: "medium",
  },
];

export const boundaryNotes8K: readonly DecisionBoundaryNote8K[] = [
  {
    boundaryId: "boundary-no-selection-8k",
    label: "Pas de selection imposee",
    text: "Cette couche sert de grille d'observation. Elle ne choisit aucun joueur et ne fixe aucune composition.",
    appliesToDecisionCardIds: coachDecisionCards8K.map((card) => card.decisionCardId),
    prevents: ["selection_imposition", "single_match_overfit"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "boundary-no-tactic-8k",
    label: "Pas de tactique imposee",
    text: "Les cartes nomment des hypotheses a verifier, pas un systeme a appliquer automatiquement.",
    appliesToDecisionCardIds: coachDecisionCards8K.map((card) => card.decisionCardId),
    prevents: ["tactic_imposition", "overclaiming"],
    visibleInProduct: true,
    visibleInExport: true,
  },
  {
    boundaryId: "boundary-truth-separation-8k",
    label: "Source officielle preservee",
    text: "Score et replay restent issus des score_change officiels ; sandbox, batch et diagnostics restent separes.",
    appliesToDecisionCardIds: coachDecisionCards8K.map((card) => card.decisionCardId),
    prevents: ["sandbox_promotion", "score_rewrite", "overclaiming"],
    visibleInProduct: true,
    visibleInExport: true,
  },
];

export function buildNextMatchObservationPlan8K(): NextMatchObservationPlan8K {
  return {
    observationPlanId: "next-match-observation-plan-8k",
    title: "Decider quoi observer au prochain match",
    planSummary: "Le rapport transforme le match en trois hypotheses d'observation a verifier sans imposer selection, composition ou plan tactique.",
    observationWindow: "next_match",
    observationItems: nextMatchObservationItems8K,
    priorityOrder: coachDecisionCards8K.map((card) => card.decisionCardId),
    linkedDecisionCards: coachDecisionCards8K.map((card) => card.decisionCardId),
    confirmationMatrix: coachDecisionCards8K.map((card) => `${card.title}: ${card.confirmationSignal}`),
    disconfirmationMatrix: coachDecisionCards8K.map((card) => `${card.title}: ${card.disconfirmationSignal}`),
    evidenceBoundaries: boundaryNotes8K.map((note) => note.text),
    coachUsageInstructions: [
      "A utiliser comme grille d'observation.",
      "Ne remplace pas une decision de selection.",
      "A confirmer sur plusieurs matchs.",
      "Un signal isole ne suffit pas.",
    ],
    notASelectionRecommendation: true,
    notATacticalInstruction: true,
    noSeasonMemoryRequired: true,
  };
}

function priorityLabel(value: CoachDecisionCard8K["priorityLevel"]): string {
  if (value === "primary") return "Priorite principale";
  if (value === "secondary") return "Priorite secondaire";
  return "A surveiller";
}

function decisionCardHtml(card: CoachDecisionCard8K): string {
  return [
    `<article class="product-card coach-decision-card-8k" data-decision-card-id="${escapeHtml(card.decisionCardId)}" data-priority="${card.priorityLevel}">`,
    `<p class="eyebrow">${escapeHtml(priorityLabel(card.priorityLevel))}</p>`,
    `<h3>${escapeHtml(card.title)}</h3>`,
    `<p><strong>Question coach :</strong> ${escapeHtml(card.decisionQuestion)}</p>`,
    `<p><strong>Pourquoi c'est prioritaire :</strong> ${escapeHtml(card.whyThisMatters)}</p>`,
    `<p><strong>A observer :</strong> ${escapeHtml(card.observationFocus)}</p>`,
    `<p><strong>Signal qui confirme :</strong> ${escapeHtml(card.confirmationSignal)}</p>`,
    `<p><strong>Signal qui infirme :</strong> ${escapeHtml(card.disconfirmationSignal)}</p>`,
    `<p><strong>Risque :</strong> ${escapeHtml(card.riskToWatch)}</p>`,
    `<p><strong>A ne pas surinterpreter :</strong> ${escapeHtml(card.doNotOverInterpret)}</p>`,
    `<p><strong>Replay a relire :</strong> ${escapeHtml(card.linkedReplayMomentIds.join(", "))}</p>`,
    `<p><strong>Carte tactique liee :</strong> ${escapeHtml(card.linkedTacticalMapCardIds.join(", "))}</p>`,
    `<p><strong>Confiance :</strong> ${escapeHtml(card.confidence)}</p>`,
    `<p class="guard">${escapeHtml(card.evidenceBoundary)}</p>`,
    "</article>",
  ].join("");
}

function observationItemHtml(item: NextMatchObservationItem8K): string {
  return [
    `<article class="product-card next-match-observation-item-8k" data-observation-item-id="${escapeHtml(item.observationItemId)}">`,
    `<h3>${escapeHtml(item.title)}</h3>`,
    `<p><strong>Quand :</strong> ${escapeHtml(item.whenToWatch)}</p>`,
    `<p><strong>Ou :</strong> ${escapeHtml(item.whereToWatch)}</p>`,
    `<p><strong>A regarder :</strong> ${escapeHtml(item.whatToWatch)}</p>`,
    `<p><strong>Signal positif :</strong> ${escapeHtml(item.positiveSignal)}</p>`,
    `<p><strong>Signal negatif :</strong> ${escapeHtml(item.negativeSignal)}</p>`,
    `<p><strong>Minimum de preuve :</strong> ${escapeHtml(item.minimumEvidenceNeeded)}</p>`,
    `<p><strong>Note prudence :</strong> ${escapeHtml(item.cautionNote)}</p>`,
    "</article>",
  ].join("");
}

export function renderCoachDecisionLayerProduct8K(): string {
  const plan = buildNextMatchObservationPlan8K();
  return [
    `<section id="coach-decision-layer-8k" class="premium-section coach-decision-layer-8k" data-decision-layer-version="8K">`,
    "<h2>Decider quoi observer au prochain match</h2>",
    "<p>Le rapport ne propose pas une composition automatique. Il transforme le match en trois hypotheses d'observation pour le prochain match.</p>",
    "<h3>Priorites d'observation</h3>",
    `<div class="product-card-grid">${coachDecisionCards8K.map(decisionCardHtml).join("")}</div>`,
    "<h3>Mode d'emploi coach</h3>",
    `<ul>${plan.coachUsageInstructions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
    "<h3>Plan d'observation prochain match</h3>",
    `<div class="product-card-grid">${plan.observationItems.map(observationItemHtml).join("")}</div>`,
    "<h3>Frontieres</h3>",
    `<div class="product-card-grid">${boundaryNotes8K.map((note) => `<article class="product-card decision-boundary-note-8k"><h3>${escapeHtml(note.label)}</h3><p>${escapeHtml(note.text)}</p></article>`).join("")}</div>`,
    "</section>",
  ].join("\n");
}

function findBalancedSectionEnd(html: string, markerIndex: number): number {
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return -1;
  const sectionPattern = /<\/?section\b[^>]*>/giu;
  sectionPattern.lastIndex = sectionStart;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(sectionPattern)) {
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

export function insertCoachDecisionLayerProduct8K(productHtml: string): string {
  if (productHtml.includes('id="coach-decision-layer-8k"')) {
    return productHtml;
  }
  const section = renderCoachDecisionLayerProduct8K();
  const actionPlanIndex = productHtml.indexOf('id="coach-action-plan"');
  if (actionPlanIndex < 0) {
    return productHtml.includes("</main>")
      ? productHtml.replace("</main>", `${section}\n</main>`)
      : `${productHtml}\n${section}`;
  }
  const insertAt = findBalancedSectionEnd(productHtml, actionPlanIndex);
  if (insertAt < 0) {
    return `${productHtml}\n${section}`;
  }
  return `${productHtml.slice(0, insertAt)}\n${section}${productHtml.slice(insertAt)}`;
}
