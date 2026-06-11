import type { FullMatchShadowRouteSelectionResult } from "./fullMatchShadowRouteSelection";
import {
  emptyControlledSegmentSelection,
  type FullMatchControlledSegmentSelectionResult,
} from "./fullMatchControlledSegmentSelection";

export function controlledSegmentSelectionCannotMutateScore(
  selection: FullMatchControlledSegmentSelectionResult,
): boolean {
  return !selection.canMutateScore && !selection.canMutateScoringEvents && !selection.canMutateRouteSuccessRates;
}

export function controlledSegmentSelectionCannotDriveProduction(
  selection: FullMatchControlledSegmentSelectionResult,
): boolean {
  return !selection.canDriveProductionFullMatchSelection;
}

export function validateControlledSegmentSelection(
  selection: FullMatchControlledSegmentSelectionResult,
): readonly string[] {
  const warnings = [
    ...(selection.status === "available" && selection.selectedCandidateId === undefined ? ["CONTROLLED_SELECTION_MISSING_CANDIDATE"] : []),
    ...(selection.status === "available" && !selection.selectedCandidateLegal ? ["CONTROLLED_SELECTION_ILLEGAL_CANDIDATE"] : []),
    ...(selection.status === "available" && !selection.selectedCandidateAvailable ? ["CONTROLLED_SELECTION_UNAVAILABLE_CANDIDATE"] : []),
    ...(!controlledSegmentSelectionCannotMutateScore(selection) ? ["CONTROLLED_SELECTION_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!controlledSegmentSelectionCannotDriveProduction(selection) ? ["CONTROLLED_SELECTION_PRODUCTION_FORBIDDEN_BREACH"] : []),
  ];

  return warnings;
}

function availableControlledSelectionFromShadow(
  shadowSelection: FullMatchShadowRouteSelectionResult,
): FullMatchControlledSegmentSelectionResult {
  const selectedCandidateLegal = shadowSelection.selectedCandidateLegal;
  const selectedCandidateAvailable = shadowSelection.selectedCandidateAvailable;

  if (
    shadowSelection.shadowSelectionCandidateId === undefined ||
    shadowSelection.shadowSelectionActionType === undefined ||
    shadowSelection.shadowSelectionReceiverId === undefined ||
    shadowSelection.shadowSelectionTargetZone === undefined ||
    !selectedCandidateLegal ||
    !selectedCandidateAvailable
  ) {
    return {
      status: "failed",
      scope: "production_fullmatch_selection_forbidden",
      source: "shadow_route_selection",
      ...(shadowSelection.segmentLabel === undefined ? {} : { segmentLabel: shadowSelection.segmentLabel }),
      ...(shadowSelection.chainId === undefined ? {} : { chainId: shadowSelection.chainId }),
      selectedCandidateLegal,
      selectedCandidateAvailable,
      rejectedClosedCandidateCount: shadowSelection.closedCandidateRejectedCount,
      rejectedUnavailableCandidateCount: shadowSelection.unavailableCandidateRejectedCount,
      diagnosticOnly: true,
      experimentalControlledSelection: true,
      canMutateScore: false,
      canMutateScoringEvents: false,
      canMutateRouteSuccessRates: false,
      canDriveProductionFullMatchSelection: false,
      tags: [],
      warnings: [...shadowSelection.warnings, "CONTROLLED_SEGMENT_SELECTION_FAILED_GUARD"],
    };
  }

  return {
    status: shadowSelection.status,
    scope: "experimental_controlled_segment_selection",
    source: "shadow_route_selection",
    ...(shadowSelection.segmentLabel === undefined ? {} : { segmentLabel: shadowSelection.segmentLabel }),
    ...(shadowSelection.chainId === undefined ? {} : { chainId: shadowSelection.chainId }),
    selectedCandidateId: shadowSelection.shadowSelectionCandidateId,
    selectedActionType: shadowSelection.shadowSelectionActionType,
    selectedReceiverId: shadowSelection.shadowSelectionReceiverId,
    selectedTargetZone: shadowSelection.shadowSelectionTargetZone,
    ...(shadowSelection.shadowSelectionBaseScore === undefined ? {} : { selectedBaseScore: shadowSelection.shadowSelectionBaseScore }),
    ...(shadowSelection.shadowSelectionInfluenceDelta === undefined ? {} : { selectedInfluenceDelta: shadowSelection.shadowSelectionInfluenceDelta }),
    ...(shadowSelection.shadowSelectionInfluencedScore === undefined ? {} : { selectedInfluencedScore: shadowSelection.shadowSelectionInfluencedScore }),
    selectedCandidateLegal,
    selectedCandidateAvailable,
    rejectedClosedCandidateCount: shadowSelection.closedCandidateRejectedCount,
    rejectedUnavailableCandidateCount: shadowSelection.unavailableCandidateRejectedCount,
    diagnosticOnly: true,
    experimentalControlledSelection: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    tags: [
      "workbench_chain_controlled_segment_selection",
      "controlled_segment_selection_experimental",
      "controlled_segment_selection_diagnostic_only",
      `controlled_segment_selection_candidate_${shadowSelection.shadowSelectionCandidateId}`,
      `controlled_segment_selection_action_${shadowSelection.shadowSelectionActionType}`,
      `controlled_segment_selection_receiver_${shadowSelection.shadowSelectionReceiverId}`,
      `controlled_segment_selection_zone_${shadowSelection.shadowSelectionTargetZone}`,
      "controlled_segment_selection_score_mutation_forbidden",
      "controlled_segment_selection_scoring_events_mutation_forbidden",
      "controlled_segment_selection_route_success_mutation_forbidden",
      "controlled_segment_selection_production_fullmatch_forbidden",
      "controlled_segment_selection_closed_candidates_rejected",
      "controlled_segment_selection_unavailable_candidates_rejected",
      ...(shadowSelection.chainId === undefined ? [] : [`controlled_segment_selection_chain_id_${shadowSelection.chainId}`]),
    ],
    warnings: shadowSelection.warnings,
  };
}

export function controlledSegmentSelectionFromShadow(input: {
  readonly shadowSelection: FullMatchShadowRouteSelectionResult;
}): FullMatchControlledSegmentSelectionResult {
  if (input.shadowSelection.status === "not_available") {
    return emptyControlledSegmentSelection({
      ...(input.shadowSelection.segmentLabel === undefined ? {} : { segmentLabel: input.shadowSelection.segmentLabel }),
      ...(input.shadowSelection.chainId === undefined ? {} : { chainId: input.shadowSelection.chainId }),
      warnings: input.shadowSelection.warnings,
    });
  }

  const selection = availableControlledSelectionFromShadow(input.shadowSelection);
  const validationWarnings = validateControlledSegmentSelection(selection);

  if (validationWarnings.length === 0) {
    return selection;
  }

  return {
    ...selection,
    status: selection.status === "available" ? "failed" : selection.status,
    warnings: [...selection.warnings, ...validationWarnings],
  };
}
