import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachReportV1VisualizationModel } from "./buildCoachReportV1Visualization";

export type CoachReportV1HierarchyStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportV1HierarchySectionId =
  | "official_coach_reading"
  | "official_detailed_signals"
  | "experimental_hypotheses"
  | "technical_traceability";

export interface CoachReportV1HierarchySection {
  readonly sectionId: CoachReportV1HierarchySectionId;
  readonly title: string;
  readonly order: number;
  readonly defaultCollapsed: boolean;
  readonly sourceScope: "official" | "experimental" | "technical";
  readonly visibleCardCount: number;
  readonly officialCardCount: number;
  readonly diagnosticCardCount: number;
  readonly sandboxCardCount: number;
  readonly summary: string;
  readonly warnings: readonly string[];
}

export interface CoachReportV1InformationHierarchyModel {
  readonly status: CoachReportV1HierarchyStatus;
  readonly origin: "coach_report_v1_visualization";
  readonly sectionCount: number;
  readonly sections: readonly CoachReportV1HierarchySection[];
  readonly officialSectionAppearsBeforeExperimental: true;
  readonly v1AppearsBeforeSandbox: true;
  readonly technicalDetailsCollapsed: true;
  readonly experimentalSectionsGrouped: true;
  readonly repeatedGuardrailCopyReduced: true;
  readonly officialVisibleCardCount: number;
  readonly diagnosticVisibleCardCount: number;
  readonly sandboxVisibleCardCount: number;
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
}

function unavailableModel(): CoachReportV1InformationHierarchyModel {
  return {
    status: "not_available",
    origin: "coach_report_v1_visualization",
    sectionCount: 0,
    sections: [],
    officialSectionAppearsBeforeExperimental: true,
    v1AppearsBeforeSandbox: true,
    technicalDetailsCollapsed: true,
    experimentalSectionsGrouped: true,
    repeatedGuardrailCopyReduced: true,
    officialVisibleCardCount: 0,
    diagnosticVisibleCardCount: 0,
    sandboxVisibleCardCount: 0,
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
    tags: [
      "coach_report_v1_information_hierarchy",
      "coach_report_v1_information_hierarchy_status_not_available",
    ],
    warnings: ["COACH_REPORT_V1_VISUALIZATION_NOT_AVAILABLE"],
  };
}

function buildTags(model: Omit<CoachReportV1InformationHierarchyModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_information_hierarchy",
    `coach_report_v1_information_hierarchy_status_${model.status}`,
    `coach_report_v1_information_hierarchy_section_count_${model.sectionCount}`,
    "coach_report_v1_official_before_experimental_true",
    "coach_report_v1_v1_before_sandbox_true",
    "coach_report_v1_experimental_sections_grouped_true",
    "coach_report_v1_technical_details_collapsed_true",
    "coach_report_v1_repeated_guardrail_copy_reduced_true",
    `coach_report_v1_information_hierarchy_official_visible_card_count_${model.officialVisibleCardCount}`,
    `coach_report_v1_information_hierarchy_diagnostic_visible_card_count_${model.diagnosticVisibleCardCount}`,
    `coach_report_v1_information_hierarchy_sandbox_visible_card_count_${model.sandboxVisibleCardCount}`,
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    "coach_report_v1_information_hierarchy_score_mutation_count_0",
    "coach_report_v1_information_hierarchy_possession_mutation_count_0",
    "coach_report_v1_information_hierarchy_production_scoring_event_creation_count_0",
    "coach_report_v1_information_hierarchy_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1InformationHierarchy(input: {
  readonly v1: CoachReportV1VisualizationModel;
  readonly hasSandboxSections: boolean;
  readonly hasSelectionPreview: boolean;
  readonly hasTraceDiagnostics: boolean;
}): CoachReportV1InformationHierarchyModel {
  if (input.v1.status !== "available") {
    return unavailableModel();
  }

  const officialReadingCardCount = 1 + Math.min(3, input.v1.signalCards.length) + 1;
  const detailedOfficialCardCount = input.v1.zoneCards.length +
    (input.v1.playerCard === null ? 0 : 1) +
    (input.v1.causesImpactsCard === null ? 0 : 1);
  const sections: readonly CoachReportV1HierarchySection[] = [
    {
      sectionId: "official_coach_reading",
      title: "Ce que le match dit",
      order: 1,
      defaultCollapsed: false,
      sourceScope: "official",
      visibleCardCount: officialReadingCardCount,
      officialCardCount: officialReadingCardCount,
      diagnosticCardCount: 0,
      sandboxCardCount: 0,
      summary: "Lecture officielle compacte issue du Coach Report V1.",
      warnings: [],
    },
    {
      sectionId: "official_detailed_signals",
      title: "Signaux officiels détaillés",
      order: 2,
      defaultCollapsed: false,
      sourceScope: "official",
      visibleCardCount: detailedOfficialCardCount,
      officialCardCount: detailedOfficialCardCount,
      diagnosticCardCount: 0,
      sandboxCardCount: 0,
      summary: "Détails officiels par zones, joueurs, causes et impacts.",
      warnings: input.v1.emptyPressureLossZoneState ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    },
    {
      sectionId: "experimental_hypotheses",
      title: "Hypothèses expérimentales à tester",
      order: 3,
      defaultCollapsed: true,
      sourceScope: "experimental",
      visibleCardCount: input.hasSandboxSections || input.hasSelectionPreview ? 1 : 0,
      officialCardCount: 0,
      diagnosticCardCount: 0,
      sandboxCardCount: input.hasSandboxSections || input.hasSelectionPreview ? 1 : 0,
      summary: "Sandbox, plan de test coach et prévisualisation restent groupés et secondaires.",
      warnings: [],
    },
    {
      sectionId: "technical_traceability",
      title: "Détails techniques et traçabilité",
      order: 4,
      defaultCollapsed: true,
      sourceScope: "technical",
      visibleCardCount: input.hasTraceDiagnostics ? 1 : 0,
      officialCardCount: 0,
      diagnosticCardCount: input.hasTraceDiagnostics ? 1 : 0,
      sandboxCardCount: 0,
      summary: "Traces, agrégats, V0 et marqueurs internes restent repliés.",
      warnings: [],
    },
  ];
  const modelWithoutTags: Omit<CoachReportV1InformationHierarchyModel, "tags"> = {
    status: "available",
    origin: "coach_report_v1_visualization",
    sectionCount: sections.length,
    sections,
    officialSectionAppearsBeforeExperimental: true,
    v1AppearsBeforeSandbox: true,
    technicalDetailsCollapsed: true,
    experimentalSectionsGrouped: true,
    repeatedGuardrailCopyReduced: true,
    officialVisibleCardCount: officialReadingCardCount + detailedOfficialCardCount,
    diagnosticVisibleCardCount: 0,
    sandboxVisibleCardCount: 0,
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
    warnings: [],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function coachReportV1InformationHierarchyEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1InformationHierarchyModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-information-hierarchy`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [],
    summary:
      `Coach Report V1 information hierarchy ${input.model.status}: sections=${input.model.sectionCount}, ` +
      "officialBeforeExperimental=true, v1BeforeSandbox=true, experimentalGrouped=true, technicalCollapsed=true, " +
      `officialVisibleCards=${input.model.officialVisibleCardCount}, diagnosticVisibleCards=0, sandboxVisibleCards=0, ` +
      "selectionPreviewSandboxOnly=true, mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_information_hierarchy",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1InformationHierarchyLimitations(model: CoachReportV1InformationHierarchyModel): readonly string[] {
  return [
    `COACH_REPORT_V1_INFORMATION_HIERARCHY_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_REPORTING_ONLY",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_OFFICIAL_FIRST",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_EXPERIMENTAL_GROUPED",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_TECHNICAL_COLLAPSED",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}
