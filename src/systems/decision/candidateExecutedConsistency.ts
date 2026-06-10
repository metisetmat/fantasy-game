import type {
  CandidateExecutedCandidate,
  CandidateExecutedConsistency,
  CandidateExecutedMismatchType,
} from "./candidateExecutedConsistencyTypes";

export function normalizeCandidateActionType(input: {
  readonly candidateActionType: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
}): string {
  const candidateAction = input.candidateActionType.toUpperCase();

  if (candidateAction === "UNKNOWN") {
    return input.selectedActionType;
  }

  if (
    candidateAction === "TRY_TOUCHDOWN_ATTEMPT" ||
    candidateAction === "TRY_TOUCHDOWN_SCORED" ||
    candidateAction === "TRY_LOST_FORWARD" ||
    candidateAction === "TRY_HELD_UP" ||
    candidateAction === "TRY_TACKLED_SHORT" ||
    candidateAction === "TRY_TOUCHDOWN_FINISH" ||
    candidateAction === "TRY_GROUNDING_ATTEMPT"
  ) {
    return "TRY_TOUCHDOWN_ATTEMPT";
  }

  if (input.selectedActionType === "CARRY_OR_HOLD") {
    return "CARRY_OR_HOLD";
  }

  switch (input.targetType) {
    case "CENTRAL_REBUILD_TARGET":
      return "CENTRAL_RECYCLE";
    case "REST_DEFENSE_RESET_TARGET":
      return "SAFE_RECYCLE";
    case "STRUCTURE_ADVANCEMENT_TARGET":
    case "FORWARD_PROGRESS_TARGET":
      return "FORWARD_PROGRESS";
    case "WEAK_SIDE_PREPARATION_TARGET":
      return "WEAK_SIDE_SUPPORT";
    case "WEAK_SIDE_EXPLOIT_TARGET":
      return "WEAK_SIDE_SWITCH";
    case "SHOT_TARGET":
      return "SHOT";
    case "CARRY_TARGET":
      return "CARRY_OR_HOLD";
    case "SUPPORT_CLUSTER":
    case "PRESSURE_ESCAPE_CLUSTER":
    case "PRESSURE_ESCAPE_ZONE":
      return input.selectedActionType === "PRESSURE_ESCAPE" ? "PRESSURE_ESCAPE" : "SUPPORT_CLUSTER_RECYCLE";
    case "PLAYER_TARGET":
    case "SPACE_TARGET":
      break;
  }

  if (candidateAction === "RECYCLE" || candidateAction === "BACKWARD_RECYCLE") {
    if (input.targetType === "CENTRAL_REBUILD_TARGET") {
      return "CENTRAL_RECYCLE";
    }

    if (input.targetType === "REST_DEFENSE_RESET_TARGET") {
      return "SAFE_RECYCLE";
    }

    return input.targetType === "SUPPORT_CLUSTER" || input.targetType === "PRESSURE_ESCAPE_CLUSTER"
      ? "SUPPORT_CLUSTER_RECYCLE"
      : "SAFE_RECYCLE";
  }

  if (candidateAction === "LATERAL") {
    if (input.targetType === "CENTRAL_REBUILD_TARGET") {
      return "CENTRAL_RECYCLE";
    }

    if (input.targetType === "WEAK_SIDE_PREPARATION_TARGET" || input.targetType === "WEAK_SIDE_EXPLOIT_TARGET") {
      return "WEAK_SIDE_SUPPORT";
    }

    return "SAFE_RECYCLE";
  }

  if (candidateAction === "PROGRESSION") {
    if (input.selectedActionType === "CENTRAL_RECYCLE" && input.targetType === "CENTRAL_REBUILD_TARGET") {
      return "CENTRAL_RECYCLE";
    }

    return "FORWARD_PROGRESS";
  }

  if (candidateAction === "WEAK_SIDE_SWITCH") {
    return input.selectedActionType === "WEAK_SIDE_SWITCH" ? "WEAK_SIDE_SWITCH" : "WEAK_SIDE_SUPPORT";
  }

  if (candidateAction === "SHOT" || candidateAction === "FINISHING") {
    return "SHOT";
  }

  if (candidateAction === "CARRY" || candidateAction === "HOLD") {
    return "CARRY_OR_HOLD";
  }

  return candidateAction;
}

export function displayCandidateAction(input: {
  readonly candidateActionType: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
}): string {
  const normalized = normalizeCandidateActionType(input);

  if (
    input.candidateActionType.toUpperCase() === "PROGRESSION" &&
    normalized === "CENTRAL_RECYCLE" &&
    input.selectedActionSubtype === "CENTRAL_REBUILD"
  ) {
    return "CENTRAL_REBUILD";
  }

  return input.candidateActionType;
}

function isCompatible(input: {
  readonly normalizedCandidateActionType: string;
  readonly selectedActionType: string;
  readonly overrideApplied: boolean;
}): boolean {
  if (input.normalizedCandidateActionType === input.selectedActionType) {
    return true;
  }

  if (input.overrideApplied) {
    return true;
  }

  return input.selectedActionType === "OFFENSIVE_CONSTRUCTION_PASS" && input.normalizedCandidateActionType === "FORWARD_PROGRESS";
}

function mismatchType(input: {
  readonly rawTopCandidate: CandidateExecutedCandidate | undefined;
  readonly selectedCandidate: CandidateExecutedCandidate | undefined;
  readonly normalizedSelectedCandidateActionType: string;
  readonly selectedActionType: string;
  readonly targetType: string;
  readonly overrideApplied: boolean;
  readonly tacticalTargetCluster: string;
  readonly actualReceptionZone: string;
}): CandidateExecutedMismatchType {
  if (
    input.selectedCandidate?.actionType.toUpperCase() === "PROGRESSION" &&
    input.normalizedSelectedCandidateActionType === "CENTRAL_RECYCLE" &&
    input.selectedActionType === "CENTRAL_RECYCLE" &&
    input.targetType === "CENTRAL_REBUILD_TARGET"
  ) {
    return "LEGACY_CANDIDATE_LABEL_WRONG";
  }

  if (
    !isCompatible({
      normalizedCandidateActionType: input.normalizedSelectedCandidateActionType,
      selectedActionType: input.selectedActionType,
      overrideApplied: input.overrideApplied,
    })
  ) {
    return "FINAL_TYPE_CONTRADICTS_SELECTED_CANDIDATE";
  }

  if (
    input.rawTopCandidate !== undefined &&
    input.selectedCandidate !== undefined &&
    input.rawTopCandidate.targetZone !== input.selectedCandidate.targetZone
  ) {
    return input.overrideApplied
      ? "RAW_TOP_DIFFERS_FROM_SELECTED_WITH_OVERRIDE"
      : "RAW_TOP_DIFFERS_FROM_SELECTED_WITHOUT_OVERRIDE";
  }

  if (input.selectedActionType === "SHOT") {
    return "NONE";
  }

  if (input.tacticalTargetCluster !== input.actualReceptionZone && input.targetType !== "PLAYER_TARGET") {
    return "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_EXPECTED";
  }

  if (input.tacticalTargetCluster !== input.actualReceptionZone) {
    return "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_UNEXPLAINED";
  }

  return "NONE";
}

function explanationFor(input: {
  readonly mismatchType: CandidateExecutedMismatchType;
  readonly selectedCandidate: CandidateExecutedCandidate | undefined;
  readonly normalizedSelectedCandidateActionType: string;
  readonly finalExecutedAction: string;
  readonly selectedActionType: string;
  readonly targetType: string;
  readonly tacticalTargetCluster: string;
  readonly selectedReceiver: string;
  readonly actualReceptionZone: string;
  readonly overrideApplied: boolean;
}): string {
  if (input.selectedActionType === "SHOT") {
    return `${input.selectedReceiver} attempts a legal shot from ${input.actualReceptionZone}; the action is evaluated through shot target and outcome semantics, not receiver/new-carrier semantics.`;
  }

  switch (input.mismatchType) {
    case "LEGACY_CANDIDATE_LABEL_WRONG":
      return `Candidate label normalized to CENTRAL_REBUILD; final action is ${input.selectedActionType}. ${input.tacticalTargetCluster} is the rebuild target cluster, while ${input.selectedReceiver} receives in ${input.actualReceptionZone}.`;
    case "RAW_TOP_DIFFERS_FROM_SELECTED_WITH_OVERRIDE":
      return "Raw top candidate differs from selected candidate, but the tactical override explains the handoff to the final executed action.";
    case "RAW_TOP_DIFFERS_FROM_SELECTED_WITHOUT_OVERRIDE":
      return "Raw top candidate differs from selected candidate without an explicit override; report should explain the ranking-to-execution handoff.";
    case "FINAL_TYPE_CONTRADICTS_SELECTED_CANDIDATE":
      return `${input.selectedCandidate?.actionType ?? "missing"} normalizes to ${input.normalizedSelectedCandidateActionType}, which does not match final selectedActionType ${input.selectedActionType}.`;
    case "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_EXPECTED":
      return `${input.tacticalTargetCluster} is the ${input.targetType} tactical cluster, while ${input.selectedReceiver} receives in ${input.actualReceptionZone}.`;
    case "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_UNEXPLAINED":
      return "Target cluster differs from actual reception zone without a non-player target type explanation.";
    case "SELECTED_CANDIDATE_ACTION_DIFFERS_FROM_FINAL_TYPE":
    case "REPORT_ONLY_LABEL_MISMATCH":
      return "Candidate display label differs from final action type but is treated as a report-only label mapping.";
    case "NONE":
      return `${input.finalExecutedAction} aligns with the selected candidate and final action contract.`;
  }
}

export function resolveCandidateExecutedConsistency(input: {
  readonly actionId: string;
  readonly rawTopCandidate: CandidateExecutedCandidate | undefined;
  readonly selectedCandidate: CandidateExecutedCandidate | undefined;
  readonly finalExecutedAction: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
  readonly tacticalTargetCluster: string;
  readonly selectedReceiver: string;
  readonly receiverResolvedZone: string;
  readonly actualReceptionZone: string;
  readonly overrideApplied: boolean;
}): CandidateExecutedConsistency {
  const fallbackCandidate: CandidateExecutedCandidate = {
    actionType: "UNKNOWN",
    targetZone: "none",
    rank: 0,
    score: "0",
  };
  const selectedCandidate = input.selectedCandidate ?? fallbackCandidate;
  const rawTopCandidate = input.rawTopCandidate ?? fallbackCandidate;
  const normalizedSelectedCandidateActionType = normalizeCandidateActionType({
    candidateActionType: selectedCandidate.actionType,
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
  });
  const normalizedSelectedCandidateDisplayAction = displayCandidateAction({
    candidateActionType: selectedCandidate.actionType,
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
  });
  const detectedMismatch = mismatchType({
    rawTopCandidate: input.rawTopCandidate,
    selectedCandidate: input.selectedCandidate,
    normalizedSelectedCandidateActionType,
    selectedActionType: input.selectedActionType,
    targetType: input.targetType,
    overrideApplied: input.overrideApplied,
    tacticalTargetCluster: input.tacticalTargetCluster,
    actualReceptionZone: input.actualReceptionZone,
  });
  const compatible = isCompatible({
    normalizedCandidateActionType: normalizedSelectedCandidateActionType,
    selectedActionType: input.selectedActionType,
    overrideApplied: input.overrideApplied,
  });
  const consistencyStatus =
    detectedMismatch === "RAW_TOP_DIFFERS_FROM_SELECTED_WITHOUT_OVERRIDE" ||
    detectedMismatch === "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_UNEXPLAINED"
      ? "WARNING"
      : compatible
        ? "PASS"
        : "FAIL";

  return {
    actionId: input.actionId,
    rawTopCandidateAction: rawTopCandidate.actionType,
    rawTopCandidateTargetZone: rawTopCandidate.targetZone,
    rawTopCandidateScore: rawTopCandidate.score,
    selectedCandidateAction: selectedCandidate.actionType,
    selectedCandidateTargetZone: selectedCandidate.targetZone,
    selectedCandidateRank: selectedCandidate.rank,
    selectedCandidateScore: selectedCandidate.score,
    normalizedSelectedCandidateActionType,
    normalizedSelectedCandidateDisplayAction,
    finalExecutedAction: input.finalExecutedAction,
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    selectedReceiver: input.selectedReceiver,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    overrideApplied: input.overrideApplied,
    semanticMismatch: detectedMismatch !== "NONE" && detectedMismatch !== "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_EXPECTED",
    mismatchType: detectedMismatch,
    explanation: explanationFor({
      mismatchType: detectedMismatch,
      selectedCandidate: input.selectedCandidate,
      normalizedSelectedCandidateActionType,
      finalExecutedAction: input.finalExecutedAction,
      selectedActionType: input.selectedActionType,
      targetType: input.targetType,
      tacticalTargetCluster: input.tacticalTargetCluster,
      selectedReceiver: input.selectedReceiver,
      actualReceptionZone: input.actualReceptionZone,
      overrideApplied: input.overrideApplied,
    }),
    consistencyStatus,
  };
}
