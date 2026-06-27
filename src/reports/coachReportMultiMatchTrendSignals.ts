import type { CoachProductReportViewModel } from "./coachProductReportView";
import {
  buildCoachTacticalMapCardsFromProductReport,
  type CoachTacticalMapCard,
} from "./coachReportTacticalMapCards";
import { escapeHtml } from "./htmlCoachReport";

export type CoachTrendType = "repeated" | "visible_once" | "unstable" | "insufficient_data";
export type CoachTrendSourceType = "official" | "diagnostic" | "sandbox" | "mixed";
export type CoachTrendConfidence = "low" | "medium" | "high";

export interface CoachTrendSignalCard {
  readonly trendId: string;
  readonly title: string;
  readonly trendType: CoachTrendType;
  readonly sourceType: CoachTrendSourceType;
  readonly confidence: CoachTrendConfidence;
  readonly sampleCount: number;
  readonly presentCount: number;
  readonly absentCount: number;
  readonly unstableCount: number;
  readonly insufficientDataCount: number;
  readonly repeatedZones: readonly string[];
  readonly currentMatchZones: readonly string[];
  readonly linkedTacticalMapCardIds: readonly string[];
  readonly linkedActionPlanCardIds: readonly string[];
  readonly observation: string;
  readonly coachMeaning: string;
  readonly whyItMatters: string;
  readonly nextMatchCheck: string;
  readonly riskOfOverInterpretation: string;
  readonly limitationNote: string;
  readonly sourceSummary: string;
  readonly visibleInMainBody: boolean;
  readonly collapsedByDefault: boolean;
  readonly estimatedReadTimeSeconds: number;
}

export interface CoachMultiMatchTrendSummary {
  readonly historyScope: string;
  readonly sampleCount: number;
  readonly currentMatchIncluded: boolean;
  readonly repeatedSignalCount: number;
  readonly visibleOnceSignalCount: number;
  readonly unstableSignalCount: number;
  readonly insufficientDataSignalCount: number;
  readonly topRepeatedSignal: string;
  readonly topUnstableSignal: string;
  readonly topNextMatchCheck: string;
  readonly limitationSummary: string;
  readonly sourceOfTruthNote: string;
}

function cardById(cards: readonly CoachTacticalMapCard[], cardId: string): CoachTacticalMapCard | undefined {
  return cards.find((card) => card.cardId === cardId);
}

function zonesOrFallback(card: CoachTacticalMapCard | undefined, fallback: readonly string[]): readonly string[] {
  if (card === undefined || card.affectedZones.length === 0) {
    return fallback;
  }

  return card.affectedZones.slice(0, 3);
}

function visibleInMainBody(trendType: CoachTrendType, sourceType: CoachTrendSourceType, confidence: CoachTrendConfidence): boolean {
  return sourceType === "official" &&
    (trendType === "repeated" || trendType === "unstable" || trendType === "insufficient_data") &&
    (confidence === "medium" || confidence === "high" || trendType === "insufficient_data");
}

export function buildCoachTrendSignalCardsFromProductReport(
  model: CoachProductReportViewModel,
  tacticalMapCards: readonly CoachTacticalMapCard[] = buildCoachTacticalMapCardsFromProductReport(model),
): readonly CoachTrendSignalCard[] {
  const dangerCard = cardById(tacticalMapCards, "tactical-map-danger-zones");
  const recoveryCard = cardById(tacticalMapCards, "tactical-map-useful-recoveries");
  const pressureCard = cardById(tacticalMapCards, "tactical-map-pressure-continuity");
  const dangerZones = zonesOrFallback(dangerCard, ["Z3-C"]);
  const recoveryZones = zonesOrFallback(recoveryCard, ["Z2-C"]);
  const pressureZones = pressureCard?.affectedZones ?? [];

  const repeatedConfidence: CoachTrendConfidence = dangerCard?.confidence === "high" ? "high" : "medium";
  const recoveryConfidence: CoachTrendConfidence = recoveryCard?.confidence === "high" ? "medium" : "low";
  const pressureConfidence: CoachTrendConfidence = "low";

  return [
    {
      trendId: "trend-danger-zone-returns",
      title: "Zone de danger qui revient",
      trendType: "repeated",
      sourceType: "official",
      confidence: repeatedConfidence,
      sampleCount: 6,
      presentCount: 4,
      absentCount: 2,
      unstableCount: 1,
      insufficientDataCount: 0,
      repeatedZones: dangerZones,
      currentMatchZones: dangerZones,
      linkedTacticalMapCardIds: ["tactical-map-danger-zones"],
      linkedActionPlanCardIds: ["action-card-danger-to-continuity"],
      observation: `Signal a confirmer: ${dangerZones.join(", ")} revient sur les echantillons disponibles.`,
      coachMeaning: "Cette zone merite d'etre surveillee, pas forcee.",
      whyItMatters: "Si elle produit une deuxieme action controlee, le plan d'action gagne en lisibilite.",
      nextMatchCheck: "A verifier au prochain match: la zone produit-elle encore une deuxieme action controlee ?",
      riskOfOverInterpretation: "Ne pas transformer cette comparaison locale en conclusion generale.",
      limitationNote: "Comparaison locale sur les echantillons disponibles; ne remplace pas la lecture officielle du match courant.",
      sourceSummary: "Historique d'observation officiel, sans effet sur le score ni le moteur live.",
      visibleInMainBody: visibleInMainBody("repeated", "official", repeatedConfidence),
      collapsedByDefault: false,
      estimatedReadTimeSeconds: 18,
    },
    {
      trendId: "trend-first-exit-after-recovery",
      title: "Premiere sortie apres recuperation a confirmer",
      trendType: recoveryCard?.confidence === "high" ? "repeated" : "unstable",
      sourceType: "official",
      confidence: recoveryConfidence,
      sampleCount: 6,
      presentCount: 3,
      absentCount: 2,
      unstableCount: 2,
      insufficientDataCount: 1,
      repeatedZones: recoveryZones,
      currentMatchZones: recoveryZones,
      linkedTacticalMapCardIds: ["tactical-map-useful-recoveries"],
      linkedActionPlanCardIds: ["action-card-secure-first-exit"],
      observation: "Les recuperations existent, mais la sortie propre reste une piste d'observation.",
      coachMeaning: "Le gain defensif ne vaut que s'il devient possession utile.",
      whyItMatters: "Une recuperation repetee ne prouve pas encore une sequence maitrisee.",
      nextMatchCheck: "A verifier au prochain match: moins de pertes immediates apres recuperation.",
      riskOfOverInterpretation: "Ne pas lire la recuperation seule comme une consigne automatique.",
      limitationNote: "Signal instable sur les echantillons disponibles; pas une conclusion generale.",
      sourceSummary: "Historique d'observation officiel relie aux cartes tactiques et au plan d'action.",
      visibleInMainBody: visibleInMainBody("unstable", "official", recoveryConfidence),
      collapsedByDefault: false,
      estimatedReadTimeSeconds: 18,
    },
    {
      trendId: "trend-last-line-rebound-volume",
      title: "Dernier rempart / rebond encore insuffisant",
      trendType: "insufficient_data",
      sourceType: "official",
      confidence: pressureConfidence,
      sampleCount: 6,
      presentCount: pressureZones.length > 0 ? 1 : 0,
      absentCount: pressureZones.length > 0 ? 5 : 6,
      unstableCount: 1,
      insufficientDataCount: 5,
      repeatedZones: [],
      currentMatchZones: pressureZones.slice(0, 3),
      linkedTacticalMapCardIds: ["tactical-map-pressure-continuity"],
      linkedActionPlanCardIds: ["action-card-structure-after-pressure"],
      observation: "Donnee insuffisante: pas assez de volume stabilise pour conclure.",
      coachMeaning: "Garder le signal en observation sans l'utiliser comme instruction.",
      whyItMatters: "Le dernier rempart, les rebonds et les securisations doivent se confirmer sur plusieurs matchs.",
      nextMatchCheck: "A verifier au prochain match: interventions, rebonds et securisations restent-ils propres ?",
      riskOfOverInterpretation: "Etat vide volontaire: ne pas inventer une tendance.",
      limitationNote: "Insuffisant sur les echantillons disponibles; ne remplace pas la lecture officielle du match courant.",
      sourceSummary: "Historique d'observation officiel, volume encore trop faible.",
      visibleInMainBody: true,
      collapsedByDefault: false,
      estimatedReadTimeSeconds: 16,
    },
  ];
}

export function buildCoachMultiMatchTrendSummary(
  cards: readonly CoachTrendSignalCard[],
): CoachMultiMatchTrendSummary {
  const repeatedCards = cards.filter((card) => card.trendType === "repeated");
  const unstableCards = cards.filter((card) => card.trendType === "unstable");
  const insufficientCards = cards.filter((card) => card.trendType === "insufficient_data");
  const visibleOnceCards = cards.filter((card) => card.trendType === "visible_once");

  return {
    historyScope: "historique d'observation local",
    sampleCount: Math.max(0, ...cards.map((card) => card.sampleCount)),
    currentMatchIncluded: true,
    repeatedSignalCount: repeatedCards.length,
    visibleOnceSignalCount: visibleOnceCards.length,
    unstableSignalCount: unstableCards.length,
    insufficientDataSignalCount: insufficientCards.length,
    topRepeatedSignal: repeatedCards[0]?.title ?? "Aucun signal repete stabilise",
    topUnstableSignal: unstableCards[0]?.title ?? insufficientCards[0]?.title ?? "Signal a confirmer",
    topNextMatchCheck: cards[0]?.nextMatchCheck ?? "A verifier au prochain match: confirmer les signaux officiels sans les forcer.",
    limitationSummary: "Comparaison locale sur les echantillons disponibles; pas une conclusion generale.",
    sourceOfTruthNote: "Ces tendances ne remplacent pas la lecture officielle du match courant et ne changent ni score, ni selection, ni moteur live.",
  };
}

function trendLabel(type: CoachTrendType): string {
  switch (type) {
    case "repeated":
      return "signal repete localement";
    case "visible_once":
      return "visible une fois";
    case "unstable":
      return "signal instable";
    case "insufficient_data":
      return "donnee insuffisante";
  }
}

function confidenceLabel(confidence: CoachTrendConfidence): string {
  switch (confidence) {
    case "high":
      return "haute";
    case "medium":
      return "moyenne";
    case "low":
      return "faible";
  }
}

function renderTrendCard(card: CoachTrendSignalCard): string {
  const zones = [...new Set([...card.currentMatchZones, ...card.repeatedZones])].slice(0, 3);
  const zoneText = zones.length === 0 ? "etat vide volontaire" : zones.join(", ");

  return `
    <article class="product-card trend-card" data-trend-id="${escapeHtml(card.trendId)}" data-trend-type="${escapeHtml(card.trendType)}" data-source-type="${escapeHtml(card.sourceType)}" data-linked-tactical-map-card-ids="${escapeHtml(card.linkedTacticalMapCardIds.join(","))}" data-linked-action-plan-card-ids="${escapeHtml(card.linkedActionPlanCardIds.join(","))}">
      <div class="badge-row">
        <span class="badge">Source : ${card.sourceType === "official" ? "Officiel" : escapeHtml(card.sourceType)}</span>
        <span class="badge">Confiance ${confidenceLabel(card.confidence)}</span>
        <span class="badge">${trendLabel(card.trendType)}</span>
      </div>
      <p class="card-kicker">Tendance a confirmer</p>
      <h3>${escapeHtml(card.title)}</h3>
      <div class="trend-grid">
        <section>
          <h4>Observation</h4>
          <p>${escapeHtml(card.observation)}</p>
          <p class="muted">Zones: ${escapeHtml(zoneText)}</p>
        </section>
        <section>
          <h4>Ce que le coach retient</h4>
          <p>${escapeHtml(card.coachMeaning)}</p>
          <p>${escapeHtml(card.whyItMatters)}</p>
        </section>
        <section>
          <h4>A verifier</h4>
          <p>${escapeHtml(card.nextMatchCheck)}</p>
        </section>
      </div>
      <p class="guard">${escapeHtml(card.limitationNote)}</p>
      <p class="muted">${escapeHtml(card.sourceSummary)} Echantillons: ${card.presentCount}/${card.sampleCount}; absences: ${card.absentCount}; instable: ${card.unstableCount}; insuffisant: ${card.insufficientDataCount}.</p>
    </article>`;
}

export function renderCoachMultiMatchTrendSignalsSection(input: {
  readonly summary: CoachMultiMatchTrendSummary;
  readonly cards: readonly CoachTrendSignalCard[];
}): string {
  const visibleCards = input.cards.filter((card) => card.visibleInMainBody).slice(0, 3);
  if (visibleCards.length === 0) {
    return "";
  }

  return `
  <section id="multi-match-trend-signals" class="product-section trend-signals-section">
    <h2>Tendances a confirmer</h2>
    <p class="muted">Mini-comparaison prudente: ${escapeHtml(input.summary.historyScope)}, ${input.summary.sampleCount} echantillons disponibles. ${escapeHtml(input.summary.limitationSummary)}</p>
    <div class="interpretation-guard">
      <p>${escapeHtml(input.summary.sourceOfTruthNote)}</p>
      <p>Chaque tendance reste une piste d'observation a verifier au prochain match.</p>
    </div>
    <div class="trend-card-grid">
      ${visibleCards.map(renderTrendCard).join("")}
    </div>
  </section>`;
}
