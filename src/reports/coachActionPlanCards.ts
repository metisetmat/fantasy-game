import type { CoachDeepInsight, CoachDeepInsightConfidence, CoachDeepInsightSourceType } from "./coachDeepInsights";
import { escapeHtml } from "./htmlCoachReport";

export type CoachActionPlanCardPriority = "primary" | "secondary" | "watch";

export interface CoachActionPlanCard {
  readonly cardId: string;
  readonly title: string;
  readonly priority: CoachActionPlanCardPriority;
  readonly sourceType: CoachDeepInsightSourceType;
  readonly confidence: CoachDeepInsightConfidence;
  readonly linkedInsightIds: readonly string[];
  readonly observation: string;
  readonly coachingProblem: string;
  readonly trainingFocus: string;
  readonly coachAction: string;
  readonly nextMatchObservableSignal: string;
  readonly successIndicator: string;
  readonly riskOrTradeoff: string;
  readonly evidenceSummary: readonly string[];
  readonly affectedZones: readonly string[];
  readonly affectedPlayersOrProfiles: readonly string[];
  readonly nonAppliedPreviewNote?: string;
  readonly limitationNote?: string;
  readonly estimatedReadTimeSeconds: number;
}

export interface TrainingFocusPackage {
  readonly focusId: string;
  readonly priority: "primary" | "secondary";
  readonly title: string;
  readonly why: string;
  readonly coachCue: string;
  readonly observableSignal: string;
  readonly riskToWatch: string;
  readonly evidenceSummary: readonly string[];
  readonly linkedCardIds: readonly string[];
}

function sourceLabel(sourceType: CoachDeepInsightSourceType): string {
  if (sourceType === "official") return "Source officielle";
  if (sourceType === "diagnostic") return "Source diagnostic separee";
  if (sourceType === "sandbox") return "Hypothese sandbox non appliquee";
  return "Source mixte";
}

function confidenceLabel(confidence: CoachDeepInsightConfidence): string {
  if (confidence === "high") return "Confiance haute";
  if (confidence === "medium") return "Confiance moyenne";
  return "Confiance faible";
}

function readTimeSeconds(card: Omit<CoachActionPlanCard, "estimatedReadTimeSeconds">): number {
  const words = [
    card.title,
    card.observation,
    card.coachingProblem,
    card.trainingFocus,
    card.coachAction,
    card.nextMatchObservableSignal,
    card.successIndicator,
    card.riskOrTradeoff,
  ].join(" ").split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.max(8, Math.ceil(words / 3.8));
}

function withReadTime(card: Omit<CoachActionPlanCard, "estimatedReadTimeSeconds">): CoachActionPlanCard {
  return {
    ...card,
    estimatedReadTimeSeconds: readTimeSeconds(card),
  };
}

export function buildCoachActionPlanCards(insights: readonly CoachDeepInsight[]): readonly CoachActionPlanCard[] {
  const first = insights[0];
  const second = insights[1];
  const third = insights[2];
  const fallbackEvidence = ["Signal issu du rapport coach produit."];

  return [
    withReadTime({
      cardId: "action-card-secure-first-exit",
      title: "Securiser la premiere sortie apres recuperation",
      priority: "primary",
      sourceType: "official",
      confidence: "medium",
      linkedInsightIds: first === undefined ? [] : [first.insightId],
      observation: "Les recuperations existent, mais leur valeur depend de la premiere passe ou du premier relais.",
      coachingProblem: "La premiere sortie doit rester propre quand la pression revient vite.",
      trainingFocus: "Offrir une solution proche au porteur apres recuperation.",
      coachAction: "Observer la qualite du premier relais avant d'en faire une consigne collective.",
      nextMatchObservableSignal: "La premiere sortie reste propre sous pression.",
      successIndicator: "Moins de pertes immediates apres recuperation.",
      riskOrTradeoff: "Trop de soutien proche peut ralentir la projection ou exposer la rest-defense.",
      evidenceSummary: first?.evidenceSummary.slice(0, 2) ?? fallbackEvidence,
      affectedZones: first?.affectedZones ?? [],
      affectedPlayersOrProfiles: first?.affectedPlayersOrProfiles ?? ["porteur", "soutien proche"],
      limitationNote: "A confirmer sur plusieurs matchs avant d'en faire une regle stable.",
    }),
    withReadTime({
      cardId: "action-card-danger-to-continuity",
      title: "Transformer les zones de danger en continuite",
      priority: "secondary",
      sourceType: "official",
      confidence: "medium",
      linkedInsightIds: second === undefined ? [] : [second.insightId],
      observation: "Certaines zones de danger se repetent et demandent une deuxieme action controlee.",
      coachingProblem: "Le danger doit devenir une sequence, pas seulement une entree isolee.",
      trainingFocus: "Enchainer apres l'entree en zone dangereuse plutot que finir trop vite.",
      coachAction: "Verifier si la progression cree un soutien actif apres le premier gain.",
      nextMatchObservableSignal: "La progression mene a une deuxieme action controlee.",
      successIndicator: "Plus de situations avec soutien actif apres progression.",
      riskOrTradeoff: "Chercher la continuite peut ralentir l'action ou perdre la profondeur.",
      evidenceSummary: second?.evidenceSummary.slice(0, 2) ?? fallbackEvidence,
      affectedZones: second?.affectedZones ?? [],
      affectedPlayersOrProfiles: second?.affectedPlayersOrProfiles ?? ["soutien", "relayeur"],
      limitationNote: "Le signal reste une priorite d'observation, pas une obligation tactique.",
    }),
    withReadTime({
      cardId: "action-card-structure-after-pressure",
      title: "Garder une structure apres pression ou arret du gardien",
      priority: "watch",
      sourceType: third?.sourceType === "official" ? "official" : "mixed",
      confidence: "low",
      linkedInsightIds: third === undefined ? [] : [third.insightId],
      observation: "La fin de sequence doit rester organisee apres pression, tir, arret ou rebond.",
      coachingProblem: "Une action neutralisee ne doit pas ouvrir une recuperation adverse propre.",
      trainingFocus: "Surveiller le second ballon, le rebond et la rest-defense.",
      coachAction: "Regarder si l'equipe reste placee quand la premiere action est neutralisee.",
      nextMatchObservableSignal: "L'equipe garde une structure lisible apres pression ou arret.",
      successIndicator: "Moins de recuperations adverses propres apres action dangereuse.",
      riskOrTradeoff: "Sur-engagement, fatigue et rebonds centraux peuvent fragiliser le bloc.",
      evidenceSummary: third?.evidenceSummary.slice(0, 2) ?? fallbackEvidence,
      affectedZones: third?.affectedZones ?? [],
      affectedPlayersOrProfiles: third?.affectedPlayersOrProfiles ?? ["gardien", "rest-defense"],
      nonAppliedPreviewNote: "Carte de surveillance: elle n'impose ni selection, ni plan tactique.",
      limitationNote: "Confiance volontairement faible tant que le signal n'est pas repete.",
    }),
  ];
}

export function buildTrainingFocusPackages(cards: readonly CoachActionPlanCard[]): readonly TrainingFocusPackage[] {
  return cards.slice(0, 2).map((card, index) => ({
    focusId: `training-focus-${index + 1}-${card.cardId}`,
    priority: index === 0 ? "primary" : "secondary",
    title: card.trainingFocus,
    why: card.coachingProblem,
    coachCue: card.coachAction,
    observableSignal: card.nextMatchObservableSignal,
    riskToWatch: card.riskOrTradeoff,
    evidenceSummary: card.evidenceSummary,
    linkedCardIds: [card.cardId],
  }));
}

function priorityLabel(priority: CoachActionPlanCardPriority): string {
  if (priority === "primary") return "Priorite principale";
  if (priority === "secondary") return "Priorite secondaire";
  return "A surveiller";
}

function renderEvidenceList(evidence: readonly string[]): string {
  return evidence.length === 0
    ? "<li>Signal a confirmer au prochain match.</li>"
    : evidence.slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function renderCoachActionPlanCards(cards: readonly CoachActionPlanCard[]): string {
  return `
  <section id="coach-action-plan" class="product-section">
    <h2>Plan d'action coach</h2>
    <p class="guard">Cartes d'observation et de travail: elles n'imposent ni composition, ni plan tactique automatique.</p>
    <div class="cards action-plan-card-grid">
      ${cards.slice(0, 3).map((card) => `
        <article class="product-card action-plan-card" data-source-type="${escapeHtml(card.sourceType)}">
          <div class="badge-row">
            <span class="badge">${priorityLabel(card.priority)}</span>
            <span class="badge">${sourceLabel(card.sourceType)}</span>
            <span class="badge">${confidenceLabel(card.confidence)}</span>
            <span class="badge">${card.estimatedReadTimeSeconds}s lecture</span>
          </div>
          <h3>${escapeHtml(card.title)}</h3>
          <div class="signal-grid">
            <section><h4>Observation</h4><p>${escapeHtml(card.observation)}</p></section>
            <section><h4>A travailler</h4><p>${escapeHtml(card.trainingFocus)}</p></section>
            <section><h4>Consigne coach</h4><p>${escapeHtml(card.coachAction)}</p></section>
            <section><h4>Signal a verifier</h4><p>${escapeHtml(card.nextMatchObservableSignal)}</p></section>
            <section><h4>Critere de reussite</h4><p>${escapeHtml(card.successIndicator)}</p></section>
            <section><h4>Risque a surveiller</h4><p>${escapeHtml(card.riskOrTradeoff)}</p></section>
          </div>
          <details class="card-evidence">
            <summary>Source et limite</summary>
            <ul>${renderEvidenceList(card.evidenceSummary)}</ul>
            <p>${escapeHtml(card.limitationNote ?? "A confirmer au prochain match.")}</p>
            ${card.nonAppliedPreviewNote === undefined ? "" : `<p>${escapeHtml(card.nonAppliedPreviewNote)}</p>`}
          </details>
        </article>`).join("")}
    </div>
  </section>`;
}

export function renderTrainingFocusPackage(focuses: readonly TrainingFocusPackage[]): string {
  return `
  <section id="training-focus-package" class="product-section">
    <h2>Focus entrainement</h2>
    <div class="cards">
      ${focuses.map((focus) => `
        <article class="product-card training-focus-card">
          <div class="badge-row">
            <span class="badge">${focus.priority === "primary" ? "Focus prioritaire" : "Focus secondaire"}</span>
          </div>
          <h3>${escapeHtml(focus.title)}</h3>
          <div class="signal-grid">
            <section><h4>Pourquoi</h4><p>${escapeHtml(focus.why)}</p></section>
            <section><h4>Consigne coach</h4><p>${escapeHtml(focus.coachCue)}</p></section>
            <section><h4>Signal attendu</h4><p>${escapeHtml(focus.observableSignal)}</p></section>
            <section><h4>Risque a surveiller</h4><p>${escapeHtml(focus.riskToWatch)}</p></section>
          </div>
        </article>`).join("")}
    </div>
  </section>`;
}
