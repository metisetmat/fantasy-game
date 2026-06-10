import type { DecisionNarrative, DecisionNarrativeCandidate } from "./decisionNarrativeTypes";
import {
  displayCandidateAction,
  resolveCandidateExecutedConsistency,
} from "./candidateExecutedConsistency";

function candidateText(
  candidate: DecisionNarrativeCandidate | undefined,
  input?: {
    readonly selectedActionType: string;
    readonly selectedActionSubtype: string;
    readonly targetType: string;
  },
): string {
  if (candidate === undefined) {
    return "none";
  }

  const actionType =
    input === undefined
      ? candidate.actionType
      : displayCandidateAction({
          candidateActionType: candidate.actionType,
          selectedActionType: input.selectedActionType,
          selectedActionSubtype: input.selectedActionSubtype,
          targetType: input.targetType,
        });

  return `${candidate.fromZone} -> ${candidate.toZone} ${actionType}, rank ${candidate.rank}, score ${candidate.finalScore}`;
}

function selectedCandidate(input: {
  readonly candidates: readonly DecisionNarrativeCandidate[];
  readonly tacticalTargetCluster: string;
}): DecisionNarrativeCandidate | undefined {
  return (
    input.candidates.find((candidate) => candidate.selected) ??
    input.candidates.find((candidate) => candidate.toZone === input.tacticalTargetCluster)
  );
}

function overrideReason(input: {
  readonly overrideApplied: boolean;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly selectedCandidate: DecisionNarrativeCandidate | undefined;
}): string {
  if (!input.overrideApplied) {
    return "no tactical override required; raw ranking and execution are aligned enough for the final action.";
  }

  if (input.selectedActionType === "FORWARD_PROGRESS" || input.selectedActionSubtype === "STRUCTURE_ADVANCEMENT") {
    return "CONTROL had stabilized possession after the first pressure escape, so the structured progression rule promoted the forward structure-advancement lane over safe lateral circulation.";
  }

  return input.selectedCandidate?.overrideReason ?? "tactical selection rule promoted the chosen option after candidate scoring.";
}

function rawTopLostReason(input: {
  readonly rawTopCandidate: DecisionNarrativeCandidate | undefined;
  readonly selectedCandidate: DecisionNarrativeCandidate | undefined;
  readonly overrideApplied: boolean;
  readonly selectedActionType: string;
}): string {
  if (input.rawTopCandidate === undefined || input.selectedCandidate === undefined) {
    return "raw ranking data unavailable.";
  }

  if (input.rawTopCandidate.toZone === input.selectedCandidate.toZone) {
    return "raw top candidate remained the selected tactical target.";
  }

  if (input.overrideApplied && input.selectedActionType === "FORWARD_PROGRESS") {
    return `${candidateText(input.rawTopCandidate)} was safer in raw utility, but it stayed lateral; the final action advances the structure.`;
  }

  return `${candidateText(input.rawTopCandidate)} did not become the final action because selection-stage tactical rules favored ${input.selectedCandidate.toZone}.`;
}

function selectedWonReason(input: {
  readonly overrideApplied: boolean;
  readonly selectedActionType: string;
  readonly selectedReceiver: string;
  readonly tacticalTargetCluster: string;
  readonly actualReceptionZone: string;
}): string {
  if (input.overrideApplied && input.selectedActionType === "FORWARD_PROGRESS") {
    return `${input.selectedReceiver} is available as the next support line, so ${input.tacticalTargetCluster} becomes a structure-advancement target and the ball is received in ${input.actualReceptionZone}.`;
  }

  if (input.selectedActionType === "SUPPORT_CLUSTER_RECYCLE") {
    return `${input.selectedReceiver} gives the cleanest pressure-escape outlet, with reception in ${input.actualReceptionZone}.`;
  }

  return `${input.selectedReceiver} matches the final action contract and receives in ${input.actualReceptionZone}.`;
}

function coachSummary(input: {
  readonly overrideApplied: boolean;
  readonly selectedActionType: string;
  readonly decisionActor: string;
  readonly selectedReceiver: string;
}): string {
  if (!input.overrideApplied && input.selectedActionType === "SUPPORT_CLUSTER_RECYCLE") {
    return "CONTROL chooses the safest first pressure-escape recycle. No tactical override is required.";
  }

  if (input.overrideApplied && input.selectedActionType === "FORWARD_PROGRESS") {
    return "CONTROL's raw model still likes safe lateral circulation, but the tactical rule promotes forward structure advancement because possession has stabilized and the next support line is available.";
  }

  if (input.selectedActionType === "FORWARD_PROGRESS") {
    return `${input.decisionActor} advances the structure through ${input.selectedReceiver}; raw ranking and final execution point toward progression.`;
  }

  return `${input.decisionActor} chooses ${input.selectedReceiver} as the final executed action after candidate ranking and selection-stage checks.`;
}

export function buildDecisionNarrative(input: {
  readonly actionId: string;
  readonly decisionActor: string;
  readonly candidates: readonly DecisionNarrativeCandidate[];
  readonly finalExecutedAction: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
  readonly tacticalTargetCluster: string;
  readonly selectedReceiver: string;
  readonly receiverResolvedZone: string;
  readonly actualReceptionZone: string;
  readonly ballStateContractStatus: string;
  readonly actionSemanticStatus: string;
}): DecisionNarrative {
  const sortedCandidates = [...input.candidates].sort((left, right) => left.rank - right.rank);
  const rawTopCandidate = sortedCandidates[0];
  const chosenCandidate = selectedCandidate({
    candidates: sortedCandidates,
    tacticalTargetCluster: input.tacticalTargetCluster,
  });
  const overrideApplied = chosenCandidate?.preOverrideRank !== null && chosenCandidate?.preOverrideRank !== undefined;
  const candidateExecutedConsistency = resolveCandidateExecutedConsistency({
    actionId: input.actionId,
    rawTopCandidate:
      rawTopCandidate === undefined
        ? undefined
        : {
            actionType: rawTopCandidate.actionType,
            targetZone: rawTopCandidate.toZone,
            rank: rawTopCandidate.rank,
            score: rawTopCandidate.finalScore,
          },
    selectedCandidate:
      chosenCandidate === undefined
        ? undefined
        : {
            actionType: chosenCandidate.actionType,
            targetZone: chosenCandidate.toZone,
            rank: chosenCandidate.rank,
            score: chosenCandidate.finalScore,
          },
    finalExecutedAction: input.finalExecutedAction,
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    selectedReceiver: input.selectedReceiver,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    overrideApplied,
  });
  const contractAligned =
    input.ballStateContractStatus === "PASS" &&
    input.actionSemanticStatus === "PASS" &&
    input.selectedReceiver.length > 0 &&
    input.actualReceptionZone.length > 0 &&
    candidateExecutedConsistency.consistencyStatus !== "FAIL";
  const displayInput = {
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
  };

  return {
    actionId: input.actionId,
    decisionActor: input.decisionActor,
    rawTopCandidate: candidateText(rawTopCandidate, displayInput),
    selectedCandidate: candidateText(chosenCandidate, displayInput),
    finalExecutedAction: input.finalExecutedAction,
    overrideApplied,
    overrideReason: overrideReason({
      overrideApplied,
      selectedActionType: input.selectedActionType,
      selectedActionSubtype: input.selectedActionSubtype,
      selectedCandidate: chosenCandidate,
    }),
    selectedActionType: input.selectedActionType,
    selectedActionSubtype: input.selectedActionSubtype,
    targetType: input.targetType,
    tacticalTargetCluster: input.tacticalTargetCluster,
    selectedReceiver: input.selectedReceiver,
    receiverResolvedZone: input.receiverResolvedZone,
    actualReceptionZone: input.actualReceptionZone,
    normalizedCandidateActionType: candidateExecutedConsistency.normalizedSelectedCandidateActionType,
    candidateExecutedConsistencyStatus: candidateExecutedConsistency.consistencyStatus,
    candidateExecutedConsistencyExplanation: candidateExecutedConsistency.explanation,
    whyRawTopLost: rawTopLostReason({
      rawTopCandidate,
      selectedCandidate: chosenCandidate,
      overrideApplied,
      selectedActionType: input.selectedActionType,
    }),
    whySelectedWon: selectedWonReason({
      overrideApplied,
      selectedActionType: input.selectedActionType,
      selectedReceiver: input.selectedReceiver,
      tacticalTargetCluster: input.tacticalTargetCluster,
      actualReceptionZone: input.actualReceptionZone,
    }),
    coachSummary: coachSummary({
      overrideApplied,
      selectedActionType: input.selectedActionType,
      decisionActor: input.decisionActor,
      selectedReceiver: input.selectedReceiver,
    }),
    consistencyStatus: contractAligned ? "PASS" : "FAIL",
    compactCandidates: sortedCandidates.slice(0, 3).map((candidate) => candidateText(candidate, displayInput)),
  };
}
