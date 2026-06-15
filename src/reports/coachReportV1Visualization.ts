import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { MatchTraceAggregateModel } from "../simulation/tracing/matchTraceAggregateTypes";
import type { CoachReportTraceV0Card, CoachReportTraceV0Model } from "./coachReportFromTraceAggregates";

export type CoachReportV1VisualizationStatus =
  | "not_available"
  | "available";

export type CoachReportV1VisualizationOrigin =
  | "none"
  | "coach_report_trace_v0";

export type CoachReportV1VisualizationConfidence =
  | "low"
  | "medium"
  | "high";

export type CoachReportV1VisualizationCardKind =
  | "executive_summary"
  | "official_signal"
  | "zone_signal"
  | "player_involvement"
  | "causes_impacts"
  | "watchpoint";

export type CoachReportV1VisualizationCard = {
  readonly cardId: string;
  readonly kind: CoachReportV1VisualizationCardKind;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly sourceLabel: "Officiel";
  readonly sourceScope: "official";
  readonly confidence: CoachReportV1VisualizationConfidence;
  readonly confidenceReason: string;
  readonly traceCountUsed: number;
  readonly emptyState: boolean;
  readonly warnings: readonly string[];
};

export type CoachReportV1VisualizationModel = {
  readonly status: CoachReportV1VisualizationStatus;
  readonly origin: CoachReportV1VisualizationOrigin;
  readonly title: "Rapport coach V1 — lecture visuelle des agrégats officiels";
  readonly intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.";
  readonly finalScore: string;
  readonly executiveSummary: CoachReportV1VisualizationCard;
  readonly signalCards: readonly CoachReportV1VisualizationCard[];
  readonly zoneCards: readonly CoachReportV1VisualizationCard[];
  readonly playerCard: CoachReportV1VisualizationCard | null;
  readonly causesImpactsCard: CoachReportV1VisualizationCard | null;
  readonly watchpointCard: CoachReportV1VisualizationCard;
  readonly cardCount: number;
  readonly officialCardsCount: number;
  readonly diagnosticCardsCount: 0;
  readonly sandboxCardsCount: 0;
  readonly emptyPressureLossZoneState: boolean;
  readonly usesOfficialAggregates: true;
  readonly diagnosticKeptSeparate: true;
  readonly sandboxKeptSeparate: true;
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

function cardConfidenceReason(input: {
  readonly card: CoachReportTraceV0Card;
  readonly fallback?: string;
}): string {
  if (input.card.traceCountUsed >= 20 && input.card.confidence === "medium") {
    return "Signal répété dans les traces officielles, à confirmer sur plusieurs matchs.";
  }
  if (input.card.confidence === "low") {
    return input.fallback ?? "Signal officiel présent, mais encore trop peu dense pour conclure fortement.";
  }

  return input.fallback ?? "Signal officiel assez lisible pour une lecture coach prudente.";
}

function fromV0Card(input: {
  readonly card: CoachReportTraceV0Card;
  readonly kind: CoachReportV1VisualizationCardKind;
  readonly title?: string;
  readonly summary?: string;
  readonly bullets?: readonly string[];
  readonly emptyState?: boolean;
  readonly confidenceReason?: string;
  readonly warnings?: readonly string[];
}): CoachReportV1VisualizationCard {
  return {
    cardId: input.card.cardId,
    kind: input.kind,
    title: input.title ?? input.card.title,
    summary: input.summary ?? input.card.summary,
    bullets: input.bullets ?? input.card.bullets,
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: input.card.confidence,
    confidenceReason: input.confidenceReason ?? cardConfidenceReason({ card: input.card }),
    traceCountUsed: input.card.traceCountUsed,
    emptyState: input.emptyState ?? false,
    warnings: input.warnings ?? input.card.warnings,
  };
}

function fallbackV0Card(input: {
  readonly cardId: string;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly traceCount: number;
}): CoachReportTraceV0Card {
  return {
    cardId: input.cardId as CoachReportTraceV0Card["cardId"],
    title: input.title,
    summary: input.summary,
    bullets: input.bullets,
    sourceScope: "official",
    basedOnOfficialAggregates: true,
    usesDiagnosticAggregatesAsTruth: false,
    usesSandboxAggregatesAsTruth: false,
    confidence: "low",
    traceCountUsed: input.traceCount,
    warnings: [],
  };
}

function findV0Card(model: CoachReportTraceV0Model, cardId: CoachReportTraceV0Card["cardId"]): CoachReportTraceV0Card | undefined {
  return model.cards.find((card) => card.cardId === cardId);
}

function pressureLossIsEmpty(card: CoachReportTraceV0Card, aggregate: MatchTraceAggregateModel): boolean {
  const highPressureZoneCount = Object.values(aggregate.official.pressureLossByZone).filter((value) => value > 0).length;
  const possessionLossZoneCount = Object.values(aggregate.official.possessionLossByZone).filter((value) => value > 0).length;

  return highPressureZoneCount === 0 && possessionLossZoneCount === 0 && card.bullets.some((bullet) => bullet.startsWith("Aucune zone"));
}

function signalLine(card: CoachReportTraceV0Card): string {
  const firstBullet = card.bullets[0] ?? card.summary;

  return `${card.title} : ${firstBullet}`;
}

function buildExecutiveSummary(input: {
  readonly scoreText: string;
  readonly signalCards: readonly CoachReportV1VisualizationCard[];
  readonly watchpoint: CoachReportV1VisualizationCard;
  readonly traceCount: number;
}): CoachReportV1VisualizationCard {
  const officialSignals = input.signalCards
    .flatMap((card) => card.bullets.slice(0, 1).map((bullet) => `${card.title} — ${bullet}`))
    .slice(0, 3);

  return {
    cardId: "coach_report_v1_executive_summary",
    kind: "executive_summary",
    title: "Synthèse coach",
    summary: `Score final : ${input.scoreText}. Lecture officielle compacte des signaux les plus visibles.`,
    bullets: [
      ...officialSignals,
      `Point de vigilance : ${input.watchpoint.bullets[0] ?? input.watchpoint.summary}`,
    ],
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: input.traceCount >= 20 ? "medium" : "low",
    confidenceReason: input.traceCount >= 20
      ? "Lecture fondée sur un volume officiel suffisant pour une synthèse prudente."
      : "Lecture fondée sur des traces officielles encore limitées.",
    traceCountUsed: input.traceCount,
    emptyState: false,
    warnings: [],
  };
}

function buildTags(model: Omit<CoachReportV1VisualizationModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_visualization",
    `coach_report_v1_visualization_status_${model.status}`,
    "coach_report_v1_origin_coach_report_trace_v0",
    `coach_report_v1_card_count_${model.cardCount}`,
    `coach_report_v1_official_cards_count_${model.officialCardsCount}`,
    `coach_report_v1_diagnostic_cards_count_${model.diagnosticCardsCount}`,
    `coach_report_v1_sandbox_cards_count_${model.sandboxCardsCount}`,
    "coach_report_v1_uses_official_aggregates",
    "coach_report_v1_diagnostic_kept_separate",
    "coach_report_v1_sandbox_kept_separate",
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    `coach_report_v1_empty_pressure_loss_zone_state_${model.emptyPressureLossZoneState}`,
    "coach_report_v1_score_mutation_count_0",
    "coach_report_v1_possession_mutation_count_0",
    "coach_report_v1_production_scoring_event_creation_count_0",
    "coach_report_v1_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1Visualization(input: {
  readonly matchReport: MatchReport;
  readonly traceV0: CoachReportTraceV0Model;
  readonly aggregate: MatchTraceAggregateModel;
}): CoachReportV1VisualizationModel {
  const officialTraceCount = input.aggregate.official.deduplicatedTraceCount;
  const danger = findV0Card(input.traceV0, "official_danger_zones") ?? fallbackV0Card({
    cardId: "official_danger_zones",
    title: "Zones de danger",
    summary: "Aucune zone de danger officielle ne ressort nettement.",
    bullets: ["Aucune zone de danger officielle ne ressort nettement dans ce run."],
    traceCount: officialTraceCount,
  });
  const pressure = findV0Card(input.traceV0, "official_pressure_losses") ?? fallbackV0Card({
    cardId: "official_pressure_losses",
    title: "Pertes sous pression",
    summary: "Signal de pression encore insuffisant pour une cartographie stable.",
    bullets: ["Aucune zone de perte sous haute pression ne domine le signal officiel."],
    traceCount: officialTraceCount,
  });
  const recovery = findV0Card(input.traceV0, "official_recoveries") ?? fallbackV0Card({
    cardId: "official_recoveries",
    title: "Récupérations utiles",
    summary: "Aucune zone de récupération ne ressort fortement.",
    bullets: ["Aucune zone de récupération ne ressort fortement dans les traces officielles."],
    traceCount: officialTraceCount,
  });
  const player = findV0Card(input.traceV0, "official_player_involvement") ?? null;
  const causes = findV0Card(input.traceV0, "official_recurring_causes") ?? null;
  const watchpointV0 = findV0Card(input.traceV0, "official_coach_watchpoint") ?? fallbackV0Card({
    cardId: "official_coach_watchpoint",
    title: "Point de vigilance coach",
    summary: "Point de vigilance prudent issu des traces officielles.",
    bullets: ["Signal à confirmer : les agrégats officiels donnent une première lecture, mais elle doit rester prudente."],
    traceCount: officialTraceCount,
  });
  const emptyPressure = pressureLossIsEmpty(pressure, input.aggregate);
  const signalCards = [
    fromV0Card({ card: danger, kind: "official_signal", title: "Danger officiel", bullets: danger.bullets.slice(0, 3) }),
    fromV0Card({
      card: pressure,
      kind: "official_signal",
      title: "Pression et pertes",
      bullets: emptyPressure
        ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
        : pressure.bullets.slice(0, 3),
      emptyState: emptyPressure,
      confidenceReason: emptyPressure
        ? "Le signal de pression existe, mais il n'est pas encore assez localisé par zone."
        : cardConfidenceReason({ card: pressure }),
      warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    }),
    fromV0Card({ card: recovery, kind: "official_signal", title: "Récupérations", bullets: recovery.bullets.slice(0, 3) }),
    ...(player === null ? [] : [
      fromV0Card({
        card: player,
        kind: "official_signal",
        title: "Implication joueurs",
        bullets: player.bullets.slice(0, 3),
      }),
    ]),
    ...(causes === null ? [] : [
      fromV0Card({
        card: causes,
        kind: "official_signal",
        title: "Causes et impacts",
        bullets: causes.bullets.slice(0, 4),
      }),
    ]),
    fromV0Card({ card: watchpointV0, kind: "watchpoint", title: "Point de vigilance", bullets: watchpointV0.bullets.slice(0, 1) }),
  ].slice(0, 6);
  const zoneCards = [
    fromV0Card({ card: danger, kind: "zone_signal", title: "Zones de danger", bullets: danger.bullets.slice(0, 3) }),
    fromV0Card({
      card: pressure,
      kind: "zone_signal",
      title: "Zones de perte sous pression",
      bullets: emptyPressure
        ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
        : pressure.bullets.slice(0, 3),
      emptyState: emptyPressure,
      confidenceReason: emptyPressure
        ? "État vide volontaire : le rapport refuse de cartographier une zone instable."
        : cardConfidenceReason({ card: pressure }),
      warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    }),
    fromV0Card({ card: recovery, kind: "zone_signal", title: "Zones de récupération", bullets: recovery.bullets.slice(0, 3) }),
  ];
  const playerCard = player === null
    ? null
    : fromV0Card({
        card: player,
        kind: "player_involvement",
        title: "Implication dans les traces",
        summary: "Ce bloc mesure l’implication dans les traces officielles, pas une note individuelle complète.",
        bullets: player.bullets.slice(0, 4),
      });
  const causesImpactsCard = causes === null
    ? null
    : fromV0Card({
        card: causes,
        kind: "causes_impacts",
        title: "Causes et impacts récurrents",
        bullets: causes.bullets.slice(0, 6),
      });
  const watchpointCard = fromV0Card({
    card: watchpointV0,
    kind: "watchpoint",
    title: "Point de vigilance",
    bullets: watchpointV0.bullets.slice(0, 1),
  });
  const executiveSummary = buildExecutiveSummary({
    scoreText: `${input.matchReport.score.home} - ${input.matchReport.score.away}`,
    signalCards,
    watchpoint: watchpointCard,
    traceCount: officialTraceCount,
  });
  const allCards = [
    executiveSummary,
    ...signalCards,
    ...zoneCards,
    ...(playerCard === null ? [] : [playerCard]),
    ...(causesImpactsCard === null ? [] : [causesImpactsCard]),
    watchpointCard,
  ];
  const modelWithoutTags: Omit<CoachReportV1VisualizationModel, "tags"> = {
    status: "available",
    origin: "coach_report_trace_v0",
    title: "Rapport coach V1 — lecture visuelle des agrégats officiels",
    intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.",
    finalScore: `${input.matchReport.score.home} - ${input.matchReport.score.away}`,
    executiveSummary,
    signalCards,
    zoneCards,
    playerCard,
    causesImpactsCard,
    watchpointCard,
    cardCount: allCards.length,
    officialCardsCount: allCards.length,
    diagnosticCardsCount: 0,
    sandboxCardsCount: 0,
    emptyPressureLossZoneState: emptyPressure,
    usesOfficialAggregates: true,
    diagnosticKeptSeparate: true,
    sandboxKeptSeparate: true,
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
    warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
  };

  return {
    ...modelWithoutTags,
    tags: [
      ...buildTags(modelWithoutTags),
      `coach_report_v1_signal_lines_${signalCards.map((card) => signalLine({
        cardId: card.cardId as CoachReportTraceV0Card["cardId"],
        title: card.title,
        summary: card.summary,
        bullets: card.bullets,
        sourceScope: "official",
        basedOnOfficialAggregates: true,
        usesDiagnosticAggregatesAsTruth: false,
        usesSandboxAggregatesAsTruth: false,
        confidence: card.confidence,
        traceCountUsed: card.traceCountUsed,
        warnings: card.warnings,
      })).join(" | ")}`,
      `coach_report_v1_watchpoint_${watchpointCard.bullets[0] ?? "none"}`,
      `coach_report_v1_official_trace_count_${officialTraceCount}`,
    ],
  };
}

export function coachReportV1VisualizationEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1VisualizationModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-visualization`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.model.zoneCards
      .flatMap((card) => card.bullets.map((bullet) => bullet.split(":")[0]?.trim() ?? ""))
      .filter((zone) => zone.startsWith("Z"))
      .slice(0, 4),
    summary:
      `Coach Report V1 visualization ${input.model.status}: source=official aggregates via Coach Report V0, ` +
      `cardCount=${input.model.cardCount}, officialCards=${input.model.officialCardsCount}, diagnosticCards=0, sandboxCards=0, ` +
      `emptyPressureLossZoneState=${input.model.emptyPressureLossZoneState}, mutationCounts=0, ` +
      "productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 60,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_visualization",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1VisualizationLimitations(model: CoachReportV1VisualizationModel): readonly string[] {
  return [
    `COACH_REPORT_V1_VISUALIZATION_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_VISUALIZATION_REPORTING_ONLY",
    "COACH_REPORT_V1_VISUALIZATION_USES_OFFICIAL_AGGREGATES",
    "COACH_REPORT_V1_VISUALIZATION_DIAGNOSTIC_AND_SANDBOX_SEPARATE",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_MUTATE_POSSESSION",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}
