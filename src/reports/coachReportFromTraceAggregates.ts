import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type {
  MatchTraceAggregateModel,
} from "../simulation/tracing/matchTraceAggregateTypes";
import type { MatchTraceCauseTag, MatchTraceImpactTag } from "../simulation/tracing/matchTraceEvent";
import { traceCauseLabelFr, traceImpactLabelFr } from "./traceAggregateCoachLabels";

export type CoachReportTraceV0Status =
  | "not_available"
  | "available"
  | "partial"
  | "blocked"
  | "failed";

export type CoachReportTraceV0Origin =
  | "none"
  | "match_trace_aggregator";

export type CoachReportTraceV0CardId =
  | "official_danger_zones"
  | "official_pressure_losses"
  | "official_recoveries"
  | "official_player_involvement"
  | "official_recurring_causes"
  | "official_coach_watchpoint";

export type CoachReportTraceV0Confidence =
  | "low"
  | "medium"
  | "high";

export type CoachReportTraceV0Card = {
  readonly cardId: CoachReportTraceV0CardId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly sourceScope: "official";
  readonly basedOnOfficialAggregates: true;
  readonly usesDiagnosticAggregatesAsTruth: false;
  readonly usesSandboxAggregatesAsTruth: false;
  readonly confidence: CoachReportTraceV0Confidence;
  readonly traceCountUsed: number;
  readonly warnings: readonly string[];
};

export type CoachReportTraceV0Model = {
  readonly status: CoachReportTraceV0Status;
  readonly origin: CoachReportTraceV0Origin;
  readonly title: "Rapport coach depuis les agrÃ©gats officiels";
  readonly summary: string;
  readonly cardCount: number;
  readonly cards: readonly CoachReportTraceV0Card[];
  readonly officialAggregateTraceCount: number;
  readonly diagnosticAggregateTraceCount: number;
  readonly sandboxAggregateTraceCount: number;
  readonly officialDangerZoneCount: number;
  readonly officialPressureLossZoneCount: number;
  readonly officialRecoveryZoneCount: number;
  readonly officialPlayerInvolvementCount: number;
  readonly officialCauseTagCount: number;
  readonly officialImpactTagCount: number;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

type Entry = {
  readonly key: string;
  readonly value: number;
};

function topEntries(record: Readonly<Record<string, number>>, limit: number): readonly Entry[] {
  return Object.entries(record)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function typedTopEntries<T extends string>(record: Partial<Record<T, number>>, limit: number): readonly { readonly key: T; readonly value: number }[] {
  return Object.entries(record)
    .filter(([, value]) => Number(value) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => ({ key: key as T, value: Number(value) }));
}

function confidenceForSignal(traceCount: number, strongestSignal: number): CoachReportTraceV0Confidence {
  if (traceCount >= 20 && strongestSignal >= 5) {
    return "medium";
  }
  if (strongestSignal >= 3) {
    return "medium";
  }
  return "low";
}

function formatEntry(entry: Entry): string {
  return `${entry.key} : ${entry.value} trace(s) officielle(s)`;
}

function formatEntriesForTag(entries: readonly Entry[]): string {
  return entries.length === 0 ? "none" : entries.map((entry) => `${entry.key}:${entry.value}`).join("|");
}

function baseCard(input: {
  readonly cardId: CoachReportTraceV0CardId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: CoachReportTraceV0Confidence;
  readonly traceCountUsed: number;
  readonly warnings?: readonly string[];
}): CoachReportTraceV0Card {
  return {
    cardId: input.cardId,
    title: input.title,
    summary: input.summary,
    bullets: input.bullets,
    sourceScope: "official",
    basedOnOfficialAggregates: true,
    usesDiagnosticAggregatesAsTruth: false,
    usesSandboxAggregatesAsTruth: false,
    confidence: input.confidence,
    traceCountUsed: input.traceCountUsed,
    warnings: input.warnings ?? [],
  };
}

function inferRecoveryBand(zones: readonly Entry[]): string {
  if (zones.some((entry) => entry.key.includes("Z1") || entry.key.includes("Z2"))) {
    return "rÃ©cupÃ©rations plutÃ´t basses";
  }
  if (zones.some((entry) => entry.key.includes("Z5") || entry.key.includes("Z6"))) {
    return "rÃ©cupÃ©rations plutÃ´t hautes";
  }
  return "rÃ©cupÃ©rations surtout intermÃ©diaires";
}

function watchpoint(input: {
  readonly dangerZones: readonly Entry[];
  readonly pressureLossZones: readonly Entry[];
  readonly recoveryZones: readonly Entry[];
  readonly playerEntries: readonly Entry[];
  readonly causeEntries: readonly { readonly key: MatchTraceCauseTag; readonly value: number }[];
  readonly fatigueImpactTotal: number;
}): string {
  const topDanger = input.dangerZones[0];
  const topPlayer = input.playerEntries[0];
  const topCause = input.causeEntries[0]?.key;

  if (input.fatigueImpactTotal >= 360 || (topCause === "fatigue_drop" && input.fatigueImpactTotal >= 300)) {
    return "A surveiller : la fatigue et la lucidite tardive pesent sur la qualite des sequences officielles.";
  }
  if (topCause === "goalkeeper_quality" || input.causeEntries.some((entry) => entry.key === "goalkeeper_quality")) {
    return "A verifier : l'influence gardien ressort, notamment sur la gestion du second ballon et des tirs subis.";
  }
  if (topCause === "defensive_recovery" || input.causeEntries.some((entry) => entry.key === "defensive_recovery")) {
    return "A travailler : les recuperations existent, mais il faut securiser la premiere sortie apres recuperation.";
  }
  if (topCause === "speed_advantage" || input.causeEntries.some((entry) => entry.key === "speed_advantage")) {
    return "A verifier : les transitions rapides demandent plus de soutien autour du porteur pour rester controlables.";
  }
  if (topCause === "power_advantage" || input.causeEntries.some((entry) => entry.key === "power_advantage")) {
    return "A surveiller : le jeu de contact cree du gain, mais peut isoler le porteur si le soutien arrive tard.";
  }
  if (input.fatigueImpactTotal >= 280 || topCause === "fatigue_drop") {
    return "A surveiller : la fatigue et la lucidite tardive pesent sur la qualite des sequences officielles.";
  }
  if (input.pressureLossZones.length > 0) {
    return "Ã€ surveiller : les sorties sous pression restent un signal officiel Ã  confirmer sur plusieurs matchs.";
  }
  if (topDanger !== undefined && topDanger.value >= 3) {
    return `Ã€ vÃ©rifier : la menace semble concentrÃ©e autour de ${topDanger.key} dans ce run.`;
  }
  if (input.recoveryZones.length === 0) {
    return "Ã€ travailler : la rÃ©cupÃ©ration aprÃ¨s perte reste peu visible dans les traces officielles de ce run.";
  }
  if (topPlayer !== undefined && topPlayer.value >= 5) {
    return `Signal Ã  confirmer : la crÃ©ation semble beaucoup passer par ${topPlayer.key}.`;
  }
  if (input.fatigueImpactTotal > 0) {
    return "Ã€ surveiller : une baisse de luciditÃ© apparaÃ®t dans certaines sÃ©quences officielles.";
  }

  return "Signal Ã  confirmer : les agrÃ©gats officiels donnent une premiÃ¨re lecture, mais elle doit rester prudente.";
}

function buildCards(aggregate: MatchTraceAggregateModel): readonly CoachReportTraceV0Card[] {
  const official = aggregate.official;
  const dangerZones = topEntries(official.dangerByZone, 3);
  const pressureLossZones = topEntries(official.pressureLossByZone, 3);
  const possessionLossZones = topEntries(official.possessionLossByZone, 3);
  const recoveryZones = topEntries(official.recoveryByZone, 3);
  const playerEntries = topEntries(official.playerInvolvement, 4);
  const causeEntries = typedTopEntries<MatchTraceCauseTag>(official.causeTagCounts, 4);
  const impactEntries = typedTopEntries<MatchTraceImpactTag>(official.impactTagCounts, 4);
  const strongestDangerSignal = dangerZones[0]?.value ?? 0;
  const strongestPressureLossSignal = Math.max(pressureLossZones[0]?.value ?? 0, possessionLossZones[0]?.value ?? 0);
  const strongestRecoverySignal = recoveryZones[0]?.value ?? 0;
  const strongestPlayerSignal = playerEntries[0]?.value ?? 0;
  const strongestCauseSignal = Math.max(causeEntries[0]?.value ?? 0, impactEntries[0]?.value ?? 0);

  return [
    baseCard({
      cardId: "official_danger_zones",
      title: "Zones de danger",
      summary:
        "Les zones de danger ressortent des traces officielles. Elles indiquent oÃ¹ l'Ã©quipe a le plus souvent crÃ©Ã© une progression dangereuse, une ligne cassÃ©e ou une situation favorable.",
      bullets: dangerZones.length === 0
        ? ["Aucune zone de danger officielle ne ressort nettement dans ce run."]
        : [
            ...dangerZones.map(formatEntry),
            "Signal officiel dans ce run, Ã  confirmer sur plusieurs matchs.",
          ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestDangerSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_pressure_losses",
      title: "Pertes sous pression",
      summary:
        "Les pertes sous pression montrent oÃ¹ l'Ã©quipe a le plus souvent perdu la continuitÃ© quand la pression adverse Ã©tait forte.",
      bullets: [
        ...(pressureLossZones.length === 0 ? ["Aucune zone de perte sous haute pression ne domine le signal officiel."] : pressureLossZones.map((entry) => `Sous haute pression - ${formatEntry(entry)}`)),
        ...(possessionLossZones.length === 0 ? ["Les pertes de possession restent dispersÃ©es dans ce run."] : possessionLossZones.map((entry) => `Perte de possession - ${formatEntry(entry)}`)),
        `Traces haute pression utilisÃ©es : ${official.highPressureTraceCount}.`,
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestPressureLossSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_recoveries",
      title: "RÃ©cupÃ©rations utiles",
      summary:
        "Les rÃ©cupÃ©rations utiles indiquent les zones oÃ¹ l'Ã©quipe a interrompu ou sÃ©curisÃ© une sÃ©quence.",
      bullets: [
        ...(recoveryZones.length === 0 ? ["Aucune zone de rÃ©cupÃ©ration ne ressort fortement dans les traces officielles."] : recoveryZones.map(formatEntry)),
        `${inferRecoveryBand(recoveryZones)} dans ce run.`,
        `Actions RECOVERY : ${official.actionTypeCounts.RECOVERY ?? 0}; INTERCEPTION : ${official.actionTypeCounts.INTERCEPTION ?? 0}.`,
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestRecoverySignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_player_involvement",
      title: "Joueurs impliquÃ©s",
      summary:
        "Les joueurs les plus impliquÃ©s sont ceux qui apparaissent le plus souvent dans les traces officielles significatives. Ce n'est pas encore une note de performance individuelle.",
      bullets: playerEntries.length === 0
        ? ["Aucun joueur ne concentre encore clairement les traces officielles significatives."]
        : playerEntries.map((entry) =>
            `${entry.key} : ${entry.value} implication(s), impact positif ${official.playerPositiveImpact[entry.key] ?? 0}, impact nÃ©gatif ${official.playerNegativeImpact[entry.key] ?? 0}.`
          ).concat("Lecture prudente : ce n'est pas une note individuelle ni une dÃ©cision de sÃ©lection."),
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestPlayerSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_recurring_causes",
      title: "Causes rÃ©currentes",
      summary:
        "Les causes rÃ©currentes regroupent les signaux qui reviennent dans les traces officielles : soutien, pression, fatigue, dÃ©cision, rÃ©cupÃ©ration ou qualitÃ© gardien.",
      bullets: [
        ...(causeEntries.length === 0 ? ["Aucune cause officielle ne revient assez souvent pour ressortir clairement."] : causeEntries.map((entry) => `${traceCauseLabelFr(entry.key)} : ${entry.value}`)),
        ...(impactEntries.length === 0 ? ["Aucun impact officiel ne domine nettement."] : impactEntries.map((entry) => `${traceImpactLabelFr(entry.key)} : ${entry.value}`)),
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestCauseSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_coach_watchpoint",
      title: "Point de vigilance coach",
      summary:
        "Ce point de vigilance reste une piste prudente issue des agrÃ©gats officiels du run, pas une conclusion generale.",
      bullets: [
        watchpoint({
          dangerZones,
          pressureLossZones,
          recoveryZones,
          playerEntries,
          causeEntries,
          fatigueImpactTotal: official.fatigueImpactTotal,
        }),
      ],
      confidence: "low",
      traceCountUsed: official.deduplicatedTraceCount,
    }),
  ];
}

function entriesTag(record: Readonly<Record<string, number>>, limit: number): string {
  return formatEntriesForTag(topEntries(record, limit));
}

function tagSafeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96) || "none";
}

function notAvailableModel(): CoachReportTraceV0Model {
  const modelWithoutTags: Omit<CoachReportTraceV0Model, "tags"> = {
    status: "not_available",
    origin: "none",
    title: "Rapport coach depuis les agrÃ©gats officiels",
    summary: "Rapport coach depuis agrÃ©gats non disponible.",
    cardCount: 0,
    cards: [],
    officialAggregateTraceCount: 0,
    diagnosticAggregateTraceCount: 0,
    sandboxAggregateTraceCount: 0,
    officialDangerZoneCount: 0,
    officialPressureLossZoneCount: 0,
    officialRecoveryZoneCount: 0,
    officialPlayerInvolvementCount: 0,
    officialCauseTagCount: 0,
    officialImpactTagCount: 0,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: ["COACH_REPORT_TRACE_V0_NOT_AVAILABLE"],
  };

  return {
    ...modelWithoutTags,
    tags: coachReportTraceTags(modelWithoutTags),
  };
}

function coachReportTraceTags(model: Omit<CoachReportTraceV0Model, "tags">): readonly string[] {
  return [
    "coach_report_trace_aggregates_v0",
    `coach_report_trace_aggregates_status_${model.status}`,
    `coach_report_trace_aggregates_origin_${model.origin}`,
    `coach_report_trace_aggregates_card_count_${model.cardCount}`,
    "coach_report_trace_aggregates_uses_official_scope",
    "coach_report_trace_aggregates_diagnostic_kept_separate",
    "coach_report_trace_aggregates_sandbox_kept_separate",
    "coach_report_trace_aggregates_selection_preview_still_sandbox_only",
    "coach_report_trace_aggregates_selection_preview_confidence_not_upgraded",
    "coach_report_trace_aggregates_score_mutation_count_0",
    "coach_report_trace_aggregates_possession_mutation_count_0",
    "coach_report_trace_aggregates_production_scoring_event_creation_count_0",
    "coach_report_trace_aggregates_live_selection_driver_count_0",
    "coach_report_trace_aggregates_production_route_resolution_driver_count_0",
    "coach_report_trace_aggregates_global_economy_claim_forbidden",
    `coach_report_trace_aggregates_official_trace_count_${model.officialAggregateTraceCount}`,
    `coach_report_trace_aggregates_diagnostic_trace_count_${model.diagnosticAggregateTraceCount}`,
    `coach_report_trace_aggregates_sandbox_trace_count_${model.sandboxAggregateTraceCount}`,
    `coach_report_trace_aggregates_official_danger_zone_count_${model.officialDangerZoneCount}`,
    `coach_report_trace_aggregates_official_pressure_loss_zone_count_${model.officialPressureLossZoneCount}`,
    `coach_report_trace_aggregates_official_recovery_zone_count_${model.officialRecoveryZoneCount}`,
    `coach_report_trace_aggregates_official_player_involvement_count_${model.officialPlayerInvolvementCount}`,
    `coach_report_trace_aggregates_official_cause_tag_count_${model.officialCauseTagCount}`,
    `coach_report_trace_aggregates_official_impact_tag_count_${model.officialImpactTagCount}`,
    `coach_report_trace_aggregates_card_ids_${model.cards.map((card) => card.cardId).join("|")}`,
    ...model.cards.map((card) => `coach_report_trace_aggregates_card_${card.cardId}_confidence_${card.confidence}`),
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportFromTraceAggregates(input: {
  readonly aggregate: MatchTraceAggregateModel;
}): CoachReportTraceV0Model {
  if (input.aggregate.status === "not_available") {
    return notAvailableModel();
  }

  const cards = buildCards(input.aggregate);
  const modelWithoutTags: Omit<CoachReportTraceV0Model, "tags"> = {
    status: "available",
    origin: "match_trace_aggregator",
    title: "Rapport coach depuis les agrÃ©gats officiels",
    summary:
      "Cette lecture s'appuie d'abord sur les agrÃ©gats officiels du match. Les diagnostics et le sandbox restent sÃ©parÃ©s et ne sont pas utilisÃ©s comme vÃ©ritÃ© officielle.",
    cardCount: cards.length,
    cards,
    officialAggregateTraceCount: input.aggregate.official.deduplicatedTraceCount,
    diagnosticAggregateTraceCount: input.aggregate.diagnostic.deduplicatedTraceCount,
    sandboxAggregateTraceCount: input.aggregate.sandbox.deduplicatedTraceCount,
    officialDangerZoneCount: Object.keys(input.aggregate.official.dangerByZone).length,
    officialPressureLossZoneCount: Object.keys(input.aggregate.official.pressureLossByZone).length,
    officialRecoveryZoneCount: Object.keys(input.aggregate.official.recoveryByZone).length,
    officialPlayerInvolvementCount: Object.keys(input.aggregate.official.playerInvolvement).length,
    officialCauseTagCount: Object.keys(input.aggregate.official.causeTagCounts).length,
    officialImpactTagCount: Object.keys(input.aggregate.official.impactTagCounts).length,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: [
      ...(input.aggregate.official.deduplicatedTraceCount < 3 ? ["COACH_REPORT_TRACE_V0_LOW_OFFICIAL_TRACE_COUNT"] : []),
    ],
  };

  return {
    ...modelWithoutTags,
    tags: [
      ...coachReportTraceTags(modelWithoutTags),
      `coach_report_trace_aggregates_danger_zone_items_${entriesTag(input.aggregate.official.dangerByZone, 3)}`,
      `coach_report_trace_aggregates_pressure_loss_zone_items_${entriesTag(input.aggregate.official.pressureLossByZone, 3)}`,
      `coach_report_trace_aggregates_possession_loss_zone_items_${entriesTag(input.aggregate.official.possessionLossByZone, 3)}`,
      `coach_report_trace_aggregates_recovery_zone_items_${entriesTag(input.aggregate.official.recoveryByZone, 3)}`,
      `coach_report_trace_aggregates_player_involvement_items_${entriesTag(input.aggregate.official.playerInvolvement, 4)}`,
      `coach_report_trace_aggregates_cause_items_${typedTopEntries<MatchTraceCauseTag>(input.aggregate.official.causeTagCounts, 4).map((entry) => `${traceCauseLabelFr(entry.key)}:${entry.value}`).join("|") || "none"}`,
      `coach_report_trace_aggregates_impact_items_${typedTopEntries<MatchTraceImpactTag>(input.aggregate.official.impactTagCounts, 4).map((entry) => `${traceImpactLabelFr(entry.key)}:${entry.value}`).join("|") || "none"}`,
      `coach_report_trace_aggregates_high_pressure_trace_count_${input.aggregate.official.highPressureTraceCount}`,
      `coach_report_trace_aggregates_fatigue_impact_total_${Math.round(input.aggregate.official.fatigueImpactTotal)}`,
      `coach_report_trace_aggregates_watchpoint_${tagSafeValue(cards.find((card) => card.cardId === "official_coach_watchpoint")?.bullets[0] ?? "none")}`,
    ],
  };
}

export function coachReportTraceV0EvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportTraceV0Model;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-from-trace-aggregates`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.model.tags
      .find((tag) => tag.startsWith("coach_report_trace_aggregates_danger_zone_items_"))
      ?.slice("coach_report_trace_aggregates_danger_zone_items_".length)
      .split("|")
      .filter((item) => item !== "none")
      .map((item) => item.split(":")[0] ?? "")
      .filter((item) => item.length > 0)
      .slice(0, 4) ?? [],
    summary:
      `Coach Report Trace V0 ${input.model.status}: origin=${input.model.origin}, cardCount=${input.model.cardCount}, ` +
      `officialAggregateTraceCount=${input.model.officialAggregateTraceCount}, diagnosticAggregateTraceCount=${input.model.diagnosticAggregateTraceCount}, ` +
      `sandboxAggregateTraceCount=${input.model.sandboxAggregateTraceCount}, cardsUseOfficialAggregateOnly=true, ` +
      `diagnosticAggregatesKeptSeparate=${input.model.diagnosticAggregatesKeptSeparate}, sandboxAggregatesKeptSeparate=${input.model.sandboxAggregatesKeptSeparate}, ` +
      `selectionPreviewStillSandboxOnly=${input.model.selectionPreviewStillSandboxOnly}, selectionPreviewConfidenceUpgraded=${input.model.selectionPreviewConfidenceUpgraded}, ` +
      "mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 58,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_from_trace_aggregates",
      ...input.model.tags,
    ],
  };
}

export function coachReportTraceV0Limitations(model: CoachReportTraceV0Model): readonly string[] {
  if (model.status === "not_available") {
    return ["COACH_REPORT_TRACE_V0_NOT_AVAILABLE"];
  }

  return [
    "COACH_REPORT_TRACE_V0_EXPERIMENTAL_ONLY",
    "COACH_REPORT_TRACE_V0_OFFICIAL_AGGREGATES_ONLY_FOR_VISIBLE_CARDS",
    "COACH_REPORT_TRACE_V0_DIAGNOSTIC_AGGREGATES_KEPT_SEPARATE",
    "COACH_REPORT_TRACE_V0_SANDBOX_AGGREGATES_KEPT_SEPARATE",
    "COACH_REPORT_TRACE_V0_SELECTION_PREVIEW_NOT_UPGRADED",
    "COACH_REPORT_TRACE_V0_CANNOT_MUTATE_OFFICIAL_STATE",
    "COACH_REPORT_TRACE_V0_CANNOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "COACH_REPORT_TRACE_V0_CANNOT_DRIVE_LIVE_SELECTION",
    "COACH_REPORT_TRACE_V0_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "COACH_REPORT_TRACE_V0_CANNOT_CLAIM_GLOBAL_ECONOMY",
  ];
}
