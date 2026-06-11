import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext } from "../spatialContext";
import { guardAttributeDrivenSelection, type AttributeDrivenSelectionGuardResult } from "./attributeDrivenSelectionGuard";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";
import { createRouteRankingModeConfig, type RouteRankingAttributeMode, type RouteRankingModeConfig } from "./routeRankingMode";

export type AttributeAdjustedSelectionResult = {
  readonly mode: RouteRankingAttributeMode;
  readonly selectedCandidateId: string;
  readonly selectedBy: "base_score" | "attribute_adjusted_score";
  readonly baseSelectedCandidateId?: string;
  readonly selectionChanged: boolean;
  readonly selectedCandidateBaseScore: number;
  readonly selectedCandidateAdjustedScore: number;
  readonly guard: AttributeDrivenSelectionGuardResult;
  readonly explanation: string;
};

export type AttributeSelectionCandidate = RouteCandidateAttributeContext & {
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
};

function topByBaseScore(candidates: readonly AttributeSelectionCandidate[]): AttributeSelectionCandidate {
  const selected = [...candidates].sort((a, b) => b.baseScore - a.baseScore || a.candidateId.localeCompare(b.candidateId))[0];

  if (selected === undefined) {
    throw new Error("Attribute-adjusted selection requires at least one candidate.");
  }

  return selected;
}

function candidateById(
  candidates: readonly AttributeSelectionCandidate[],
  candidateId: string | undefined,
): AttributeSelectionCandidate | undefined {
  return candidateId === undefined ? undefined : candidates.find((candidate) => candidate.candidateId === candidateId);
}

function resultFromCandidate(input: {
  readonly mode: RouteRankingAttributeMode;
  readonly candidate: AttributeSelectionCandidate;
  readonly selectedBy: "base_score" | "attribute_adjusted_score";
  readonly baseSelectedCandidate: AttributeSelectionCandidate;
  readonly guard: AttributeDrivenSelectionGuardResult;
  readonly explanation: string;
}): AttributeAdjustedSelectionResult {
  return {
    mode: input.mode,
    selectedCandidateId: input.candidate.candidateId,
    selectedBy: input.selectedBy,
    baseSelectedCandidateId: input.baseSelectedCandidate.candidateId,
    selectionChanged: input.candidate.candidateId !== input.baseSelectedCandidate.candidateId,
    selectedCandidateBaseScore: input.candidate.baseScore,
    selectedCandidateAdjustedScore: input.candidate.attributeAdjustedScore,
    guard: input.guard,
    explanation: input.explanation,
  };
}

export function selectAttributeAdjustedCandidate(input: {
  readonly candidates: readonly AttributeSelectionCandidate[];
  readonly mode?: RouteRankingAttributeMode;
  readonly modeConfig?: RouteRankingModeConfig;
  readonly spatialContext?: SpatialMatchContext;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly baseSelectedCandidateId?: string;
}): AttributeAdjustedSelectionResult {
  const modeConfig = input.modeConfig ?? createRouteRankingModeConfig(input.mode);
  const mode = modeConfig.attributeMode;
  const baseSelectedCandidate = candidateById(input.candidates, input.baseSelectedCandidateId) ?? topByBaseScore(input.candidates);
  const baseGuard = guardAttributeDrivenSelection({
    candidate: baseSelectedCandidate,
    ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
    baseSelectedCandidateId: baseSelectedCandidate.candidateId,
    ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
    maxAttributeAdjustment: modeConfig.maxAttributeAdjustment,
    ...(baseSelectedCandidate.availability === undefined ? {} : { availability: baseSelectedCandidate.availability }),
  });

  if (mode === "off" || mode === "metadata_only" || input.spatialContext === undefined || !modeConfig.allowAttributeSelectionFlip) {
    return resultFromCandidate({
      mode,
      candidate: baseSelectedCandidate,
      selectedBy: "base_score",
      baseSelectedCandidate,
      guard: baseGuard,
      explanation:
        mode === "metadata_only"
          ? "metadata_only computes adjusted scores but keeps the base selected candidate."
          : "attribute ranking mode does not authorize selection changes.",
    });
  }

  const candidatesByAdjustedScore = [...input.candidates].sort((a, b) =>
    b.attributeAdjustedScore - a.attributeAdjustedScore ||
    b.baseScore - a.baseScore ||
    a.candidateId.localeCompare(b.candidateId),
  );
  const blockedReasons: string[] = [];

  for (const candidate of candidatesByAdjustedScore) {
    const guard = guardAttributeDrivenSelection({
      candidate,
      ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
      baseSelectedCandidateId: baseSelectedCandidate.candidateId,
      ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
      maxAttributeAdjustment: modeConfig.maxAttributeAdjustment,
      ...(candidate.availability === undefined ? {} : { availability: candidate.availability }),
    });

    if (!guard.valid) {
      blockedReasons.push(`${candidate.candidateId}:${guard.blockedReasons.join("/")}`);
      continue;
    }

    return resultFromCandidate({
      mode,
      candidate,
      selectedBy: candidate.candidateId === baseSelectedCandidate.candidateId ? "base_score" : "attribute_adjusted_score",
      baseSelectedCandidate,
      guard,
      explanation:
        candidate.candidateId === baseSelectedCandidate.candidateId
          ? "attribute-adjusted ranking kept the base selected candidate after guard checks."
          : "attribute-adjusted ranking selected a different legal candidate after guard checks.",
    });
  }

  return resultFromCandidate({
    mode,
    candidate: baseSelectedCandidate,
    selectedBy: "base_score",
    baseSelectedCandidate,
    guard: {
      valid: true,
      blockedReasons: [],
      warnings: [`attribute selection fell back to base candidate; blocked candidates: ${blockedReasons.join(", ")}`],
    },
    explanation: "attribute-adjusted candidates were blocked by guardrails, so selection fell back to the base candidate.",
  });
}
