import type { PlayerId } from "../../core/ids";
import { applySpatialAttributeInfluenceToCandidates, selectAttributeAdjustedCandidate } from "../routeRanking";
import type { RouteRankingAttributeMode, RouteRankingAttributeUsage } from "../routeRanking";
import type { SpatialMatchContext } from "../spatialContext";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import { createMiniMatchRouteSelectionMode, type MiniMatchRouteSelectionSource } from "./miniMatchRouteSelectionMode";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

export type MiniMatchRouteSelectionResult = {
  readonly selectionSource: MiniMatchRouteSelectionSource;
  readonly selectedCandidateId: string;
  readonly selectedActionType: string;
  readonly selectedActorId?: PlayerId;
  readonly selectedReceiverId?: PlayerId;
  readonly selectedBy: "prototype" | "base_score" | "attribute_adjusted_score" | "fallback";
  readonly selectionChangedFromPrototype: boolean;
  readonly guardValid: boolean;
  readonly blockedReasons: readonly string[];
  readonly baseScore?: number;
  readonly attributeAdjustedScore?: number;
  readonly routeRankingUsesRealAttributes: RouteRankingAttributeUsage;
  readonly notes: readonly string[];
};

function prototypeResult(input: {
  readonly source: MiniMatchRouteSelectionSource;
  readonly prototypeCandidate: SpatialRouteCandidate;
  readonly selectedBy: "prototype" | "fallback";
  readonly notes: readonly string[];
}): MiniMatchRouteSelectionResult {
  return {
    selectionSource: input.source,
    selectedCandidateId: input.prototypeCandidate.candidateId,
    selectedActionType: input.prototypeCandidate.actionType,
    selectedActorId: input.prototypeCandidate.actorId,
    ...(input.prototypeCandidate.receiverId === undefined ? {} : { selectedReceiverId: input.prototypeCandidate.receiverId }),
    selectedBy: input.selectedBy,
    selectionChangedFromPrototype: false,
    guardValid: true,
    blockedReasons: [],
    baseScore: input.prototypeCandidate.baseScore,
    attributeAdjustedScore: input.prototypeCandidate.baseScore,
    routeRankingUsesRealAttributes: "NO",
    notes: input.notes,
  };
}

export function selectMiniMatchRoute(input: {
  readonly selectionSource?: MiniMatchRouteSelectionSource;
  readonly spatialContext?: SpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
  readonly candidates: readonly SpatialRouteCandidate[];
  readonly prototypeCandidateId: string;
  readonly pressureLevel?: string;
  readonly workbench?: TacticalWorkbenchFrame;
}): MiniMatchRouteSelectionResult {
  const mode = createMiniMatchRouteSelectionMode(input.selectionSource);
  const prototypeCandidate = input.candidates.find((candidate) => candidate.candidateId === input.prototypeCandidateId) ?? input.candidates[0];

  if (prototypeCandidate === undefined) {
    return {
      selectionSource: mode.source,
      selectedCandidateId: "prototype-missing",
      selectedActionType: "SUPPORT_CLUSTER_RECYCLE",
      selectedBy: "fallback",
      selectionChangedFromPrototype: false,
      guardValid: false,
      blockedReasons: ["NO_CANDIDATES_AVAILABLE"],
      routeRankingUsesRealAttributes: "NO",
      notes: ["No route candidates were available; prototype fallback remains required."],
    };
  }

  if (mode.source === "prototype" || input.spatialContext === undefined || !mode.allowSelectionChange) {
    return prototypeResult({
      source: mode.source,
      prototypeCandidate,
      selectedBy: "prototype",
      notes: input.spatialContext === undefined
        ? ["No SpatialMatchContext available; preserving prototype route selection."]
        : ["Route selection mode preserves prototype behavior."],
    });
  }

  const adjustedCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: input.spatialContext,
    candidates: input.candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      laneState: candidate.laneState,
      availability: candidate.availability,
      baseScore: candidate.baseScore,
      baseRisk: candidate.laneState === "CLOSED" ? 90 : candidate.laneState === "CONTESTED" ? 45 : 20,
    })),
    ...(input.pressureLevel === undefined ? {} : { pressureLevel: input.pressureLevel }),
  });
  const selected = selectAttributeAdjustedCandidate({
    candidates: adjustedCandidates,
    mode: input.routeRankingAttributeMode ?? "candidate_modifier",
    spatialContext: input.spatialContext,
    ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
    baseSelectedCandidateId: prototypeCandidate.candidateId,
  });
  const selectedCandidate = adjustedCandidates.find((candidate) => candidate.candidateId === selected.selectedCandidateId) ?? adjustedCandidates[0];
  const attributeSelectorUsedFallback = selected.guard.warnings.some((warning) =>
    warning.includes("fell back to base candidate"),
  );

  if (selectedCandidate === undefined || !selected.guard.valid || attributeSelectorUsedFallback) {
    return prototypeResult({
      source: mode.source,
      prototypeCandidate,
      selectedBy: "fallback",
      notes: [
        "Attribute-adjusted route selection failed guard checks; prototype fallback preserved.",
        ...selected.guard.blockedReasons,
      ],
    });
  }

  return {
    selectionSource: mode.source,
    selectedCandidateId: selectedCandidate.candidateId,
    selectedActionType: selectedCandidate.actionType,
    selectedActorId: selectedCandidate.actorId,
    ...(selectedCandidate.receiverId === undefined ? {} : { selectedReceiverId: selectedCandidate.receiverId }),
    selectedBy: selected.selectedBy,
    selectionChangedFromPrototype: selectedCandidate.candidateId !== prototypeCandidate.candidateId,
    guardValid: selected.guard.valid,
    blockedReasons: selected.guard.blockedReasons,
    baseScore: selected.selectedCandidateBaseScore,
    attributeAdjustedScore: selected.selectedCandidateAdjustedScore,
    routeRankingUsesRealAttributes: "PARTIAL",
    notes: [
      selected.explanation,
      "Prototype fallback remains enabled for blocked or lossy mappings.",
    ],
  };
}
