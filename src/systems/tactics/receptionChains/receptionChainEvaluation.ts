import { TacticalStyle } from "../../../models/tactics";
import type { PlayerMatchState } from "../../players";
import { AttackingDirection } from "../../spatial/intention";
import { ReceptionFollowUpRole, ReceptionQualityLevel, type ReceptionQualityEvaluation } from "../../spatial";
import { PatternType, validateStrictThirdManPattern } from "../thirdMan";
import { buildChainAction, calculateChainTiming, qualityValue } from "./receptionChainScoring";
import { summarizeReceptionChain } from "./receptionChainNarrative";
import type { ReceptionChain, ReceptionChainAction } from "./receptionChainTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function roleWeakSideValue(initials: string): number {
  switch (initials) {
    case "SH":
      return 86;
    case "RP":
    case "LP":
      return 74;
    case "PM":
      return 62;
    default:
      return 38;
  }
}

function roleFinishingPotential(initials: string): number {
  switch (initials) {
    case "SH":
    case "PM":
      return 72;
    case "FL":
      return 58;
    case "RP":
    case "LP":
      return 54;
    default:
      return 34;
  }
}

function roleSynergy(actions: readonly ReceptionChainAction[]): number {
  const path = actions.map((action) => action.toInitials).join("->");

  if (path === "FL->SH") {
    return 18;
  }

  if (path === "PM->RP") {
    return 16;
  }

  if (path === "FL->PM" || path === "RP->SH") {
    return 12;
  }

  if (path === "ML" || path === "PV") {
    return 8;
  }

  return actions.length > 1 ? 6 : 0;
}

function styleFit(input: {
  readonly actions: readonly ReceptionChainAction[];
  readonly teamStyle: TacticalStyle;
  readonly thirdManValue: number;
  readonly weakSideValue: number;
  readonly risk: number;
}): number {
  if (input.teamStyle === TacticalStyle.Blitz) {
    const finalAction = input.actions[input.actions.length - 1];
    const ruptureBonus =
      finalAction?.toInitials === "SH" || finalAction?.toInitials === "RP" || finalAction?.toInitials === "LP" ? 16 : 0;

    return clamp(
      input.weakSideValue * 0.34 +
        input.actions.reduce((sum, action) => sum + action.progressionGain, 0) * 0.18 +
        (100 - input.risk) * 0.08 +
        (input.actions.length > 1 ? 12 : 0) +
        ruptureBonus,
    );
  }

  return clamp(
    input.thirdManValue * 0.34 +
      input.actions.reduce((sum, action) => sum + action.retentionGain, 0) / Math.max(1, input.actions.length) * 0.34 +
      (100 - input.risk) * 0.16 +
      (input.actions.length > 1 ? 14 : 8),
  );
}

function pressureEscapeValue(actions: readonly ReceptionChainAction[]): number {
  const first = actions[0];
  if (first === undefined) {
    return 0;
  }

  return clamp(100 - first.pressure + (first.followUpRole === ReceptionFollowUpRole.SecureRecycle ? 22 : 8));
}

function chainConfidence(input: {
  readonly timingViability: number;
  readonly risk: number;
  readonly styleFit: number;
  readonly actionCount: number;
}): number {
  return clamp(input.timingViability * 0.42 + (100 - input.risk) * 0.34 + input.styleFit * 0.24 - Math.max(0, input.actionCount - 1) * 6);
}

function directValue(firstReceiver: ReceptionQualityEvaluation): number {
  return clamp(
    qualityValue(firstReceiver.quality) * 0.32 +
      firstReceiver.nextActionValue * 0.34 +
      firstReceiver.retentionValue * 0.18 +
      firstReceiver.progressionValue * 0.12 +
      (100 - firstReceiver.turnoverRisk) * 0.04,
  );
}

export function evaluateReceptionChainFromActions(input: {
  readonly actions: readonly ReceptionChainAction[];
  readonly firstReceiver: ReceptionQualityEvaluation;
  readonly teamStyle: TacticalStyle;
  readonly players: readonly PlayerMatchState[];
  readonly ballCarrier: PlayerMatchState;
  readonly attackingDirection: AttackingDirection;
}): ReceptionChain {
  const finalAction = input.actions[input.actions.length - 1] as ReceptionChainAction;
  const timing = calculateChainTiming(input.actions);
  const risk = clamp(input.actions.reduce((sum, action) => sum + action.risk, 0) / Math.max(1, input.actions.length));
  const progression = clamp(input.actions.reduce((sum, action) => sum + action.progressionGain, 0) / Math.max(1, input.actions.length) + roleFinishingPotential(finalAction.toInitials) * 0.2);
  const retention = clamp(input.actions.reduce((sum, action) => sum + action.retentionGain, 0) / Math.max(1, input.actions.length));
  const weakSide = roleWeakSideValue(finalAction.toInitials);
  const thirdMan =
    input.actions.length > 1
      ? clamp(input.firstReceiver.thirdManValue * 0.48 + finalAction.retentionGain * 0.26 + progression * 0.26 + roleSynergy(input.actions))
      : clamp(input.firstReceiver.thirdManValue * 0.5);
  const fit = styleFit({
    actions: input.actions,
    teamStyle: input.teamStyle,
    thirdManValue: thirdMan,
    weakSideValue: weakSide,
    risk,
  });
  const tempo = clamp(
    input.actions.reduce((sum, action) => sum + action.nextActionWindow.viability, 0) / Math.max(1, input.actions.length) +
      (input.actions.length === 1 ? 4 : -4),
  );
  const escape = pressureEscapeValue(input.actions);
  const finish = roleFinishingPotential(finalAction.toInitials);
  const chainValue = clamp(
    directValue(input.firstReceiver) * 0.22 +
      progression * 0.22 +
      retention * 0.18 +
      thirdMan * 0.2 +
      fit * 0.12 +
      finish * 0.08 +
      tempo * 0.08 -
      risk * 0.12,
  );
  const confidence = chainConfidence({
    timingViability: timing.viability,
    risk,
    styleFit: fit,
    actionCount: input.actions.length,
  });
  const effectiveQuality =
    input.actions.some((action) => action.effectiveChainQuality === ReceptionQualityLevel.Excellent)
      ? ReceptionQualityLevel.Excellent
      : input.actions.some((action) => action.effectiveChainQuality === ReceptionQualityLevel.Positive)
        ? ReceptionQualityLevel.Positive
        : input.actions.some((action) => action.effectiveChainQuality === ReceptionQualityLevel.Neutral)
          ? ReceptionQualityLevel.Neutral
          : ReceptionQualityLevel.Negative;
  const path = input.actions.map((action) => action.toInitials).join("-");
  const strictThirdManValidation = validateStrictThirdManPattern({
    actions: input.actions,
    players: input.players,
    firstManId: input.ballCarrier.playerId,
    attackingDirection: input.attackingDirection,
  });

  return {
    chainId: `${input.actions[0]?.fromInitials ?? "?"}-${path}`,
    actions: input.actions,
    firstReceiverId: input.firstReceiver.playerId,
    firstReceiverInitials: input.firstReceiver.roleInitials,
    finalReceiverId: finalAction.toPlayerId,
    finalReceiverInitials: finalAction.toInitials,
    directValue: directValue(input.firstReceiver),
    chainValue,
    totalProgressionValue: progression,
    totalRetentionValue: retention,
    totalRisk: risk,
    styleFit: fit,
    tempoValue: tempo,
    weakSideValue: weakSide,
    pressureEscapeValue: escape,
    thirdManValue: thirdMan,
    finishingPotential: finish,
    chainConfidence: confidence,
    chainTiming: timing,
    effectiveChainQuality: effectiveQuality,
    patternType: strictThirdManValidation.patternType,
    strictThirdManValidation,
    narrativeSummary: summarizeReceptionChain(input.actions),
    debugReasons: [
      `effectiveChainQuality ${effectiveQuality}`,
      `chain timing ${timing.openingTick}-${timing.closingTick} viability ${timing.viability}`,
      strictThirdManValidation.patternType === PatternType.ThirdManProgression
        ? "strict third-man progression included"
        : `${strictThirdManValidation.patternType}: ${strictThirdManValidation.reasons[0] ?? "not a strict third-man progression"}`,
      `style fit ${fit}`,
    ],
  };
}

export function createChainActions(input: {
  readonly ballCarrier: PlayerMatchState;
  readonly firstReceiver: ReceptionQualityEvaluation;
  readonly finalReceiver: ReceptionQualityEvaluation | null;
  readonly teamStyle: TacticalStyle;
}): readonly ReceptionChainAction[] {
  const firstAction = buildChainAction({
    fromPlayerId: input.ballCarrier.playerId,
    fromInitials: input.ballCarrier.roleInitials,
    fromZone: input.ballCarrier.zone,
    reception: input.firstReceiver,
    finalReceiver: input.finalReceiver,
    stepIndex: 0,
    teamStyle: input.teamStyle,
  });

  if (input.finalReceiver === null) {
    return [firstAction];
  }

  const secondAction = buildChainAction({
    fromPlayerId: input.firstReceiver.playerId,
    fromInitials: input.firstReceiver.roleInitials,
    fromZone: input.firstReceiver.zone,
    reception: input.finalReceiver,
    finalReceiver: null,
    stepIndex: 1,
    teamStyle: input.teamStyle,
  });

  return [firstAction, secondAction];
}
