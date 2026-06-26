import type {
  CoachReportPhaseVisualSeed,
  TacticalPitchSignalKind,
  TacticalPitchZoneSignal,
} from "./coachReportPhaseVisuals";
import type { CoachProductReportViewModel } from "./coachProductReportView";
import { escapeHtml } from "./htmlCoachReport";

export type CoachTacticalMapCardVisualType =
  | "zone_map"
  | "phase_map"
  | "pressure_map"
  | "recovery_map"
  | "danger_map"
  | "combined_map";

export type CoachTacticalMapCardSourceType = "official" | "diagnostic" | "sandbox" | "mixed";
export type CoachTacticalMapCardConfidence = "low" | "medium" | "high";
export type CoachTacticalMapCardPriority = "primary" | "secondary" | "support";
export type CoachTacticalMapCardSignalCategory =
  | "danger"
  | "recovery"
  | "pressure"
  | "continuity"
  | "goalkeeper"
  | "rest_defense";

export interface CoachTacticalMapCard {
  readonly cardId: string;
  readonly title: string;
  readonly visualType: CoachTacticalMapCardVisualType;
  readonly sourceType: CoachTacticalMapCardSourceType;
  readonly confidence: CoachTacticalMapCardConfidence;
  readonly priority: CoachTacticalMapCardPriority;
  readonly linkedActionPlanCardId: string;
  readonly linkedInsightIds: readonly string[];
  readonly observation: string;
  readonly tacticalMeaning: string;
  readonly affectedZones: readonly string[];
  readonly primaryZone?: string;
  readonly secondaryZones: readonly string[];
  readonly zoneIntensity: Readonly<Record<string, number>>;
  readonly phase: "possession" | "transition_offensive" | "transition_defensive" | "defensive_sequence" | "goalkeeper_sequence" | "second_ball";
  readonly signalCategory: CoachTacticalMapCardSignalCategory;
  readonly nextMatchCheck: string;
  readonly coachingUse: string;
  readonly limitationNote: string;
  readonly visualLegend: readonly string[];
  readonly estimatedReadTimeSeconds: number;
  readonly collapsedByDefault: boolean;
  readonly visibleInExpressRead: boolean;
  readonly insufficientDataState: boolean;
}

export interface CoachPhaseVisualModel {
  readonly phaseId: string;
  readonly title: string;
  readonly phaseType: "possession" | "transition_offensive" | "transition_defensive" | "defensive_sequence" | "goalkeeper_sequence" | "second_ball";
  readonly sourceType: CoachTacticalMapCardSourceType;
  readonly confidence: CoachTacticalMapCardConfidence;
  readonly dominantZones: readonly string[];
  readonly dangerZones: readonly string[];
  readonly recoveryZones: readonly string[];
  readonly pressureZones: readonly string[];
  readonly stableZones: readonly string[];
  readonly unstableZones: readonly string[];
  readonly teamInPossession: string;
  readonly observation: string;
  readonly tacticalMeaning: string;
  readonly actionPlanLink: string;
  readonly nextMatchCheck: string;
  readonly limitationNote: string;
}

function confidenceFromSignals(signals: readonly TacticalPitchZoneSignal[]): CoachTacticalMapCardConfidence {
  if (signals.some((signal) => signal.confidence === "high")) return "high";
  if (signals.some((signal) => signal.confidence === "medium")) return "medium";
  return signals.length > 0 ? "low" : "medium";
}

function maxSignals(
  seed: CoachReportPhaseVisualSeed | undefined,
  panel: "withBall" | "withoutBall" | "goalkeeper",
  kinds: readonly TacticalPitchSignalKind[],
): readonly TacticalPitchZoneSignal[] {
  return (seed?.[panel].signals ?? [])
    .filter((signal) => kinds.includes(signal.kind))
    .sort((a, b) =>
      b.value - a.value ||
      kinds.indexOf(a.kind) - kinds.indexOf(b.kind) ||
      a.zone.localeCompare(b.zone, "fr-FR")
    )
    .slice(0, 3);
}

function zoneIntensity(signals: readonly TacticalPitchZoneSignal[]): Readonly<Record<string, number>> {
  return Object.fromEntries(signals.map((signal) => [signal.zone, signal.value]));
}

function zoneList(signals: readonly TacticalPitchZoneSignal[]): readonly string[] {
  return signals.map((signal) => signal.zone);
}

function createCard(input: {
  readonly cardId: string;
  readonly title: string;
  readonly visualType: CoachTacticalMapCardVisualType;
  readonly priority: CoachTacticalMapCardPriority;
  readonly phase: CoachTacticalMapCard["phase"];
  readonly signalCategory: CoachTacticalMapCardSignalCategory;
  readonly signals: readonly TacticalPitchZoneSignal[];
  readonly emptyTitle: string;
  readonly observation: string;
  readonly tacticalMeaning: string;
  readonly nextMatchCheck: string;
  readonly coachingUse: string;
  readonly limitationNote: string;
  readonly legend: readonly string[];
  readonly linkedActionPlanCardId: string;
  readonly linkedInsightIds: readonly string[];
}): CoachTacticalMapCard {
  const affectedZones = zoneList(input.signals);
  const primaryZone = affectedZones[0];
  const insufficientDataState = input.signals.length === 0;

  return {
    cardId: input.cardId,
    title: insufficientDataState ? input.emptyTitle : input.title,
    visualType: input.visualType,
    sourceType: "official",
    confidence: insufficientDataState ? "low" : confidenceFromSignals(input.signals),
    priority: input.priority,
    linkedActionPlanCardId: input.linkedActionPlanCardId,
    linkedInsightIds: input.linkedInsightIds,
    observation: insufficientDataState
      ? "Signal detecte, cartographie non stabilisee dans ce run."
      : input.observation,
    tacticalMeaning: insufficientDataState
      ? "Le rapport reste prudent et n'invente pas de zone quand le signal officiel est trop faible."
      : input.tacticalMeaning,
    affectedZones,
    ...(primaryZone === undefined ? {} : { primaryZone }),
    secondaryZones: affectedZones.slice(1),
    zoneIntensity: zoneIntensity(input.signals),
    phase: input.phase,
    signalCategory: input.signalCategory,
    nextMatchCheck: input.nextMatchCheck,
    coachingUse: input.coachingUse,
    limitationNote: input.limitationNote,
    visualLegend: input.legend,
    estimatedReadTimeSeconds: 18,
    collapsedByDefault: false,
    visibleInExpressRead: input.priority === "primary",
    insufficientDataState,
  };
}

export function buildCoachTacticalMapCardsFromProductReport(
  model: CoachProductReportViewModel,
): readonly CoachTacticalMapCard[] {
  const dangerSignals = maxSignals(model.phaseVisualSeed, "withBall", ["danger_zone", "progression_zone"]);
  const recoverySignals = maxSignals(model.phaseVisualSeed, "withoutBall", ["recovery_zone"]);
  const pressureSignals = maxSignals(model.phaseVisualSeed, "withoutBall", ["pressure_instability_zone"]);
  const insightIdForSignal = (signalId: string): readonly string[] => {
    const index = model.keyCoachSignals.findIndex((signal) => signal.signalId === signalId);
    const signal = index < 0 ? undefined : model.keyCoachSignals[index];
    return signal === undefined ? [] : [`deep-insight-${index + 1}-${signal.signalId}`];
  };

  return [
    createCard({
      cardId: "tactical-map-danger-zones",
      title: "Zones de danger repetees",
      emptyTitle: "Danger detecte, cartographie non stabilisee",
      visualType: "danger_map",
      priority: "primary",
      phase: "possession",
      signalCategory: "danger",
      signals: dangerSignals,
      observation: "Le danger revient surtout dans ces zones officielles.",
      tacticalMeaning: "Le point coach est de verifier si ces entrees produisent une deuxieme action controlee.",
      nextMatchCheck: "La progression mene-t-elle a une deuxieme action controlee ?",
      coachingUse: "Transformer les zones de danger en continuite.",
      limitationNote: "Signal a confirmer sur plusieurs matchs.",
      legend: ["Plus fonce = signal plus visible", "Chiffre = occurrences officielles du run"],
      linkedActionPlanCardId: "action-card-danger-to-continuity",
      linkedInsightIds: insightIdForSignal("danger_progression_zones"),
    }),
    createCard({
      cardId: "tactical-map-useful-recoveries",
      title: "Recuperations utiles et premiere sortie",
      emptyTitle: "Recuperations detectees, carte prudente",
      visualType: "recovery_map",
      priority: "secondary",
      phase: "transition_defensive",
      signalCategory: "recovery",
      signals: recoverySignals,
      observation: "Les recuperations utiles apparaissent dans ces zones officielles.",
      tacticalMeaning: "La recuperation n'a de valeur que si la premiere sortie reste propre.",
      nextMatchCheck: "Moins de pertes immediates apres recuperation.",
      coachingUse: "Securiser la premiere sortie apres recuperation.",
      limitationNote: "Le rapport ne confond pas recuperation et sequence maitrisee.",
      legend: ["Vert = recuperation utile", "Chiffre = signal officiel observe"],
      linkedActionPlanCardId: "action-card-secure-first-exit",
      linkedInsightIds: insightIdForSignal("recovery_first_outlet"),
    }),
    createCard({
      cardId: "tactical-map-pressure-continuity",
      title: "Pression, rebond et continuite",
      emptyTitle: "Pression detectee, cartographie non stabilisee",
      visualType: "combined_map",
      priority: "support",
      phase: "second_ball",
      signalCategory: "pressure",
      signals: pressureSignals,
      observation: "La pression et les zones instables restent visibles mais doivent rester prudentes.",
      tacticalMeaning: "La structure apres pression ou action neutralisee est le point a confirmer.",
      nextMatchCheck: "L'equipe garde-t-elle sa structure apres action neutralisee ?",
      coachingUse: "Garder une structure apres pression ou arret du gardien.",
      limitationNote: "Carte volontairement prudente si les zones instables ne sont pas assez solides.",
      legend: ["Orange = instabilite", "Carte vide = signal insuffisant"],
      linkedActionPlanCardId: "action-card-structure-after-pressure",
      linkedInsightIds: insightIdForSignal("pressure_continuity_goalkeeper"),
    }),
  ];
}

export function buildCoachPhaseVisualModelsFromCards(
  cards: readonly CoachTacticalMapCard[],
): readonly CoachPhaseVisualModel[] {
  return cards.map((card) => ({
    phaseId: card.cardId,
    title: card.title,
    phaseType: card.phase,
    sourceType: card.sourceType,
    confidence: card.confidence,
    dominantZones: card.affectedZones,
    dangerZones: card.signalCategory === "danger" ? card.affectedZones : [],
    recoveryZones: card.signalCategory === "recovery" ? card.affectedZones : [],
    pressureZones: card.signalCategory === "pressure" ? card.affectedZones : [],
    stableZones: card.insufficientDataState ? [] : card.affectedZones.slice(0, 1),
    unstableZones: card.signalCategory === "pressure" ? card.affectedZones : [],
    teamInPossession: "CONTROL/BLITZ selon evenement officiel",
    observation: card.observation,
    tacticalMeaning: card.tacticalMeaning,
    actionPlanLink: card.coachingUse,
    nextMatchCheck: card.nextMatchCheck,
    limitationNote: card.limitationNote,
  }));
}

function zoneClass(card: CoachTacticalMapCard, zone: string): string {
  const intensity = card.zoneIntensity[zone] ?? 0;
  const bucket = intensity >= 5 ? "high" : intensity >= 2 ? "medium" : "low";
  return `tactical-map-zone tactical-map-zone--${card.signalCategory} tactical-map-zone--${bucket}`;
}

function renderZoneGrid(card: CoachTacticalMapCard): string {
  const zones = card.affectedZones.length === 0 ? ["signal", "non", "stable"] : card.affectedZones;

  return `
      <div class="tactical-map-grid" aria-label="${escapeHtml(card.title)}">
        ${zones.slice(0, 6).map((zone) => `
          <div class="${card.insufficientDataState ? "tactical-map-zone tactical-map-zone--empty" : zoneClass(card, zone)}">
            <strong>${escapeHtml(zone)}</strong>
            <span>${card.insufficientDataState ? "etat vide" : escapeHtml(String(card.zoneIntensity[zone] ?? 0))}</span>
          </div>
        `).join("")}
      </div>`;
}

function renderTacticalMapCard(card: CoachTacticalMapCard): string {
  return `
    <article class="tactical-map-card" data-card-id="${escapeHtml(card.cardId)}" data-source-type="${card.sourceType}" data-linked-action-plan-card-id="${escapeHtml(card.linkedActionPlanCardId)}" data-linked-insight-ids="${escapeHtml(card.linkedInsightIds.join(","))}">
      <div class="badge-row">
        <span class="badge">Source : ${card.sourceType === "official" ? "Officiel" : escapeHtml(card.sourceType)}</span>
        <span class="badge">Confiance ${card.confidence === "high" ? "haute" : card.confidence === "medium" ? "moyenne" : "faible"}</span>
      </div>
      <p class="card-kicker">Carte tactique</p>
      <h3>${escapeHtml(card.title)}</h3>
      ${renderZoneGrid(card)}
      <p><strong>Lecture :</strong> ${escapeHtml(card.tacticalMeaning)}</p>
      <p><strong>Lien plan d'action :</strong> ${escapeHtml(card.coachingUse)}</p>
      <p><strong>Signal prochain match :</strong> ${escapeHtml(card.nextMatchCheck)}</p>
      <p class="tactical-map-legend"><strong>Legende :</strong> ${card.visualLegend.map(escapeHtml).join(" ; ")}</p>
      <p class="guard">${escapeHtml(card.limitationNote)}</p>
    </article>`;
}

export function renderCoachTacticalMapCardsSection(cards: readonly CoachTacticalMapCard[]): string {
  if (cards.length === 0) {
    return "";
  }

  return `
  <section id="tactical-map-cards" class="product-section tactical-map-section">
    <h2>Ou le match s'est joue</h2>
    <p class="muted">Cartes sobres issues des signaux officiels disponibles. Elles visualisent une lecture coach, sans imposer de conclusion tactique.</p>
    <div class="tactical-map-card-grid">
      ${cards.slice(0, 3).map(renderTacticalMapCard).join("")}
    </div>
  </section>`;
}
