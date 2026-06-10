import { evaluateZoneAttractiveness } from "./evaluateZoneAttractiveness";
import { resolveLongPlayJump } from "../../offense/longPlay/resolveLongPlayJump";
import { applyOffensiveMomentumBias } from "../../offense/momentum";
import { evaluateRoleBehavior } from "../../players/behavior";
import { TacticalStyle } from "../../../models/tactics";
import { ReceiverAvailabilityLevel } from "../localAdvantage";
import { selectRecycleReceiver } from "../../actions";
import {
  OffensiveOptionType,
  OffensiveUrgencyLevel,
  SpatialMoveType,
  ThreatLevel,
  type OffensiveOptionEvaluation,
  type SpatialIntentionContext,
  type TargetZoneSelection,
  type ZoneAttractivenessEvaluation,
} from "./types";

function findBestByMove(
  evaluations: readonly ZoneAttractivenessEvaluation[],
  moveTypes: readonly SpatialMoveType[],
): ZoneAttractivenessEvaluation | null {
  return evaluations.find((evaluation) => moveTypes.includes(evaluation.moveType)) ?? null;
}

function createOptionEvaluation(
  optionType: OffensiveOptionType,
  evaluation: ZoneAttractivenessEvaluation | null,
  fallbackLabel: string,
): OffensiveOptionEvaluation | null {
  if (evaluation === null) {
    return null;
  }

  return {
    optionType,
    label: `${evaluation.zone}`,
    score: evaluation.score,
    reasons: evaluation.reasons.length === 0 ? [fallbackLabel] : evaluation.reasons,
  };
}

function createFinishingOption(context: SpatialIntentionContext): OffensiveOptionEvaluation | null {
  if (context.scoringThreat === undefined || context.scoringThreat === ThreatLevel.Low) {
    return null;
  }

  const urgency = context.offensiveUrgency;
  const urgencyBoost =
    urgency?.level === OffensiveUrgencyLevel.Critical
      ? 28
      : urgency?.level === OffensiveUrgencyLevel.High
        ? 20
        : urgency?.level === OffensiveUrgencyLevel.Medium
          ? 8
          : 0;
  const momentumBias = applyOffensiveMomentumBias(context.team.offensiveMomentum);
  const ballCarrier = context.team.players.find((player) => player.role === context.ballContext.ballCarrierRole);
  const roleBehavior = evaluateRoleBehavior({
    role: context.ballContext.ballCarrierRole,
    tacticalStyle: context.team.tacticalStyle,
    moveType: SpatialMoveType.Finishing,
    pressure: context.currentPressure,
    chaosLevel: context.chaosLevel,
    fatigue: ballCarrier?.fatigue.accumulatedFatigue ?? 0,
    momentum: ballCarrier?.momentum ?? context.team.offensiveMomentum.score,
  });

  const baseScore = context.scoringThreat === ThreatLevel.High ? 68 : 52;
  const tryZoneProgressionAvailable =
    context.scoringThreat === ThreatLevel.High &&
    context.finishingOptionLabel === "DROP_ATTEMPT" &&
    context.weakSide.exposure >= 65 &&
    context.team.tacticalInstructions.offensive.collectiveness >= 55;
  const dropContextPenalty = tryZoneProgressionAvailable ? 24 : 0;

  return {
    optionType: OffensiveOptionType.Finishing,
    label: context.finishingOptionLabel ?? "FINISHING_OPTION",
    score: Math.min(
      100,
      Math.max(0, baseScore + urgencyBoost + momentumBias.finishing + roleBehavior.modifier - dropContextPenalty),
    ),
    reasons: [
      `scoring threat ${context.scoringThreat}`,
      "legal finishing context",
      ...(urgencyBoost > 0 ? [`urgency boost +${urgencyBoost}`] : []),
      ...(momentumBias.finishing > 0 ? [`offensive momentum +${momentumBias.finishing}`] : []),
      ...(roleBehavior.modifier !== 0 ? [`role behavior ${roleBehavior.modifier >= 0 ? "+" : ""}${roleBehavior.modifier}`] : []),
      `role behavior source: ${roleBehavior.source}`,
      ...roleBehavior.reasons.slice(1, 2),
      ...(dropContextPenalty > 0 ? [`try progression remains available -${dropContextPenalty}`] : []),
    ],
  };
}

function createOptionEvaluations(
  context: SpatialIntentionContext,
  evaluations: readonly ZoneAttractivenessEvaluation[],
): readonly OffensiveOptionEvaluation[] {
  const options = [
    createOptionEvaluation(
      OffensiveOptionType.RecycleSafety,
      findBestByMove(evaluations, [SpatialMoveType.BackwardRecycle, SpatialMoveType.SafetyClearance]),
      "safety outlet",
    ),
    createOptionEvaluation(
      OffensiveOptionType.LateralCirculation,
      findBestByMove(evaluations, [SpatialMoveType.LateralCirculation, SpatialMoveType.WeakSideSwitch]),
      "circulation outlet",
    ),
    createOptionEvaluation(
      OffensiveOptionType.Progression,
      findBestByMove(evaluations, [SpatialMoveType.Progression]),
      "forward option",
    ),
    createOptionEvaluation(
      OffensiveOptionType.DirectAttack,
      findBestByMove(evaluations, [SpatialMoveType.DirectVerticalAttack]),
      "direct attack option",
    ),
    createFinishingOption(context),
  ];

  return options.filter((option): option is OffensiveOptionEvaluation => option !== null);
}

function createRankedEvaluations(
  evaluations: readonly ZoneAttractivenessEvaluation[],
  selected: ZoneAttractivenessEvaluation,
): readonly ZoneAttractivenessEvaluation[] {
  const remaining = evaluations.filter((evaluation) => evaluation.zone !== selected.zone);
  return [selected, ...remaining].slice(0, 5);
}

function receiverFields(
  context: SpatialIntentionContext,
  evaluation: ZoneAttractivenessEvaluation | null | undefined,
): Pick<
  TargetZoneSelection,
  "receiverId" | "receiverRole" | "receiverInitials" | "receiverZone"
> {
  if (
    evaluation !== null &&
    evaluation !== undefined &&
    (evaluation.moveType === SpatialMoveType.BackwardRecycle || evaluation.moveType === SpatialMoveType.LateralCirculation)
  ) {
    const recycleReceiver = selectRecycleReceiver({
      players: context.team.players,
      teamId: context.team.teamId,
      targetZone: evaluation.zone,
      currentCarrierRole: context.ballContext.ballCarrierRole,
      tacticalStyle: context.team.tacticalStyle,
    });

    if (recycleReceiver.receiverId !== null) {
      return {
        receiverId: recycleReceiver.receiverId,
        receiverRole: recycleReceiver.receiverRole,
        receiverInitials: recycleReceiver.receiverInitials,
        receiverZone: evaluation.zone,
      };
    }
  }

  const receiver = evaluation?.localAdvantage?.receiver;

  return {
    receiverId: receiver?.receiverId ?? null,
    receiverRole: receiver?.receiverRole ?? null,
    receiverInitials: receiver?.receiverInitials ?? null,
    receiverZone: receiver?.receiverZone ?? null,
  };
}

export function selectTargetZone(input: {
  readonly context: SpatialIntentionContext;
  readonly allowedMoveTypes?: readonly SpatialMoveType[];
}): TargetZoneSelection {
  const context = input.context;
  const evaluations = evaluateZoneAttractiveness(context);
  const allowedEvaluations =
    input.allowedMoveTypes === undefined
      ? evaluations
      : evaluations.filter((evaluation) => input.allowedMoveTypes?.includes(evaluation.moveType) ?? false);
  const initialSelected = allowedEvaluations[0] ?? evaluations[0];
  const longPlayJump = resolveLongPlayJump({
    context,
    evaluations: allowedEvaluations.length > 0 ? allowedEvaluations : evaluations,
    currentSelected: initialSelected,
  });
  const selected = longPlayJump.selected ?? initialSelected;
  const optionEvaluations = createOptionEvaluations(context, evaluations);
  const finishingOption = optionEvaluations.find((option) => option.optionType === OffensiveOptionType.Finishing);
  const finishingAllowed =
    input.allowedMoveTypes === undefined || input.allowedMoveTypes.includes(SpatialMoveType.Finishing);
  const finishingSelection =
    finishingAllowed && finishingOption !== undefined && (selected === undefined || finishingOption.score >= selected.score)
      ? finishingOption
      : null;
  const progressionOption = optionEvaluations.find((option) => option.optionType === OffensiveOptionType.Progression);
  const lateralOption = optionEvaluations.find((option) => option.optionType === OffensiveOptionType.LateralCirculation);
  const bestProgression = findBestByMove(allowedEvaluations, [SpatialMoveType.Progression]);
  const structuredProgressionOverride =
    context.team.tacticalStyle === TacticalStyle.Control &&
    selected?.moveType === SpatialMoveType.LateralCirculation &&
    bestProgression !== null &&
    selected.score - bestProgression.score <= 18 &&
    bestProgression.localAdvantage !== undefined &&
    (bestProgression.localAdvantage.receiver.level === ReceiverAvailabilityLevel.Free ||
      bestProgression.localAdvantage.numerical.attackersInTarget > bestProgression.localAdvantage.numerical.defendersInTarget);
  const momentumBreaksTie =
    context.team.offensiveMomentum.level !== "LOW" &&
    context.tacticalDanger === ThreatLevel.High &&
    context.weakSide.exposure >= 65 &&
    selected?.moveType === SpatialMoveType.LateralCirculation &&
    progressionOption !== undefined &&
    lateralOption !== undefined &&
    lateralOption.score - progressionOption.score <= 4;
  const momentumProgression = momentumBreaksTie
    ? allowedEvaluations.find(
        (evaluation) =>
          evaluation.moveType === SpatialMoveType.Progression &&
          evaluation.zone === progressionOption.label,
      ) ?? findBestByMove(allowedEvaluations, [SpatialMoveType.Progression])
    : null;

  if (finishingSelection !== null) {
    return {
      fromZone: context.ballContext.ballLocation,
      selectedZone: context.ballContext.ballLocation,
      selectedLabel: finishingSelection.label,
      moveType: SpatialMoveType.Finishing,
      ...receiverFields(context, null),
      reason: finishingSelection.reasons.join(", "),
      evaluations: (allowedEvaluations.length > 0 ? allowedEvaluations : evaluations).slice(0, 5),
      optionEvaluations,
    };
  }

  if (selected === undefined) {
    return {
      fromZone: context.ballContext.ballLocation,
      selectedZone: context.ballContext.ballLocation,
      moveType: SpatialMoveType.LateralCirculation,
      ...receiverFields(context, null),
      reason: "no better target available",
      evaluations,
      optionEvaluations,
    };
  }

  if (structuredProgressionOverride) {
    return {
      fromZone: context.ballContext.ballLocation,
      selectedZone: bestProgression.zone,
      moveType: SpatialMoveType.Progression,
      ...receiverFields(context, bestProgression),
      reason: `${bestProgression.reasons.join(", ")}, structured principle override: forward receiver/local overload outranks safe lateral circulation`,
      evaluations: createRankedEvaluations(
        allowedEvaluations.length > 0 ? allowedEvaluations : evaluations,
        bestProgression,
      ),
      optionEvaluations,
    };
  }

  if (momentumProgression !== null) {
    return {
      fromZone: context.ballContext.ballLocation,
      selectedZone: momentumProgression.zone,
      moveType: SpatialMoveType.Progression,
      ...receiverFields(context, momentumProgression),
      reason: `${momentumProgression.reasons.join(", ")}, offensive momentum breaks near-tie toward structured progression`,
      evaluations: createRankedEvaluations(
        allowedEvaluations.length > 0 ? allowedEvaluations : evaluations,
        momentumProgression,
      ),
      optionEvaluations,
    };
  }

  const longPlayScoreBonus =
    longPlayJump.selected === null ? 0 : Math.max(0, longPlayJump.window.score - selected.score);
  const selectedForRanking =
    longPlayJump.selected === null
      ? selected
      : {
          ...selected,
          score: Math.max(selected.score, longPlayJump.window.score),
          reasons:
            longPlayScoreBonus > 0
              ? [`long-play window +${longPlayScoreBonus}`, ...selected.reasons]
              : selected.reasons,
          modifiers:
            longPlayScoreBonus > 0
              ? [{ label: "long-play window", value: longPlayScoreBonus }, ...selected.modifiers]
              : selected.modifiers,
        };
  const rankedEvaluations = createRankedEvaluations(
    allowedEvaluations.length > 0 ? allowedEvaluations : evaluations,
    selectedForRanking,
  );

  return {
    fromZone: context.ballContext.ballLocation,
    selectedZone: selected.zone,
    moveType: selected.moveType,
    ...receiverFields(context, selected),
    reason:
      longPlayJump.selected === null
        ? selected.reasons.join(", ")
        : `${selected.reasons.join(", ")}, long-play jump: ${longPlayJump.window.reasons.join(", ")}`,
    evaluations: rankedEvaluations,
    optionEvaluations,
  };
}
