import { LATERAL_CORRIDORS, LONGITUDINAL_ZONES, createZoneId, type ZoneId } from "../../../core/zones";
import { PressureLevel } from "../../../models/match";
import { PlayerRole } from "../../../models/player";
import { BallUsageStyle, TacticalStyle } from "../../../models/tactics";
import { evaluateProgressionPhilosophy } from "../../offense";
import { applyOffensiveMomentumBias } from "../../offense/momentum";
import { evaluateRoleBehavior } from "../../players/behavior";
import { evaluatePrincipleModifiers } from "../../principles";
import {
  evaluateLocalNumericalAdvantage,
  evaluatePassingLane,
  evaluateReceiverAvailability,
  type LocalAdvantageEvaluation,
} from "../localAdvantage";
import { SideType, getPitchSideForZone } from "../sides";
import { clampRating, getLateralIndex, getLongitudinalIndex, getZoneParts } from "../utils";
import { getDirectionalDistance, getDirectionalStep } from "./attackingDirection";
import { classifySpatialMove } from "./classifySpatialMove";
import { evaluateProgressionRisk } from "./evaluateProgressionRisk";
import { evaluateVerticalityCost } from "./evaluateVerticalityCost";
import {
  SpatialMoveType,
  OffensiveUrgencyLevel,
  ThreatLevel,
  type SpatialIntentionContext,
  type TargetSelectionBias,
  type ZoneAttractivenessEvaluation,
  type ZoneAttractivenessModifier,
} from "./types";

function getCandidateZones(from: ZoneId, directionStep: number): readonly ZoneId[] {
  const parts = getZoneParts(from);
  const longitudinalIndex = getLongitudinalIndex(parts.longitudinalZone);
  const lateralIndex = getLateralIndex(parts.lateralCorridor);
  const candidates: ZoneId[] = [];

  for (const longitudinalOffset of [-1, 0, 1, 2]) {
    for (const lateralOffset of [-2, -1, 0, 1, 2]) {
      const nextLongitudinalIndex = longitudinalIndex + longitudinalOffset * directionStep;
      const nextLateralIndex = lateralIndex + lateralOffset;
      const longitudinalZone = LONGITUDINAL_ZONES[nextLongitudinalIndex];
      const lateralCorridor = LATERAL_CORRIDORS[nextLateralIndex];

      if (longitudinalZone !== undefined && lateralCorridor !== undefined) {
        candidates.push(createZoneId(longitudinalZone, lateralCorridor));
      }
    }
  }

  return [...new Set(candidates)].filter((zone) => zone !== from);
}

function getRoleVerticalBias(role: PlayerRole): number {
  switch (role) {
    case PlayerRole.SpaceHunter:
    case PlayerRole.PowerRunner:
    case PlayerRole.ForwardLeader:
      return 10;
    case PlayerRole.Playmaker:
    case PlayerRole.LeftPiston:
    case PlayerRole.RightPiston:
      return 4;
    case PlayerRole.Pivot:
      return -2;
    case PlayerRole.TempoHalf:
    case PlayerRole.HookLink:
      return -4;
    case PlayerRole.FreeSafety:
    case PlayerRole.GoalkeeperFreeSafety:
    case PlayerRole.LeftAnchor:
    case PlayerRole.RightAnchor:
    case PlayerRole.MobileLock:
      return -8;
  }
}

function describeReasons(input: {
  readonly moveType: SpatialMoveType;
  readonly weakSideTarget: boolean;
  readonly pressure: PressureLevel;
  readonly forwardDistance: number;
  readonly lateralDistance: number;
  readonly riskLevel: number;
  readonly costReasons: readonly string[];
}): readonly string[] {
  const reasons: string[] = [];

  if (input.moveType === SpatialMoveType.Progression) {
    reasons.push("forward progression");
  }

  if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
    reasons.push("direct vertical threat");
  }

  if (input.moveType === SpatialMoveType.LateralCirculation) {
    reasons.push("lateral circulation");
  }

  if (input.moveType === SpatialMoveType.BackwardRecycle) {
    reasons.push("safe recycle");
  }

  if (input.moveType === SpatialMoveType.WeakSideSwitch || input.weakSideTarget) {
    reasons.push("weak side access");
  }

  if (input.pressure === PressureLevel.High && input.lateralDistance > 0) {
    reasons.push("escapes pressure lane");
  }

  if (input.forwardDistance > 0 && input.riskLevel >= 65) {
    reasons.push("risk accepted");
  }

  reasons.push(...input.costReasons);

  if (reasons.length === 0) {
    reasons.push("keeps structure");
  }

  return reasons;
}

function getSupportScore(context: SpatialIntentionContext): number {
  const collective = context.team.collectiveProperties;
  const instructions = context.team.tacticalInstructions.offensive;

  return clampRating(
    instructions.collectiveness * 0.38 +
      collective.cohesion * 0.28 +
      collective.collectiveMobility * 0.18 +
      collective.collectiveReading * 0.16,
  );
}

function createModifier(label: string, value: number): ZoneAttractivenessModifier {
  return {
    label,
    value: Math.round(value),
  };
}

function getTeamIdentityModifier(input: {
  readonly style: TacticalStyle;
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
  readonly lateralDistance: number;
  readonly territorialPressure: number;
}): ZoneAttractivenessModifier {
  switch (input.style) {
    case TacticalStyle.Control:
      if (input.moveType === SpatialMoveType.LateralCirculation) {
        return createModifier("CONTROL stabilization bias", 4);
      }

      if (input.moveType === SpatialMoveType.Progression && input.territorialPressure >= 62) {
        return createModifier("CONTROL progresses after pressure is established", 14);
      }

      if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
        return createModifier("against CONTROL patience", -18);
      }

      return createModifier("CONTROL recycle only under pressure", input.forwardDistance < 0 ? -8 : 0);
    case TacticalStyle.Blitz:
      if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
        return createModifier("BLITZ verticality bias", 24);
      }

      if (input.moveType === SpatialMoveType.Progression) {
        return createModifier("BLITZ progression bias", 18);
      }

      if (input.moveType === SpatialMoveType.WeakSideSwitch) {
        return createModifier("BLITZ weak-side attack bias", 16);
      }

      if (input.moveType === SpatialMoveType.LateralCirculation) {
        return createModifier("against BLITZ identity", -12);
      }

      return createModifier("against BLITZ identity", input.forwardDistance < 0 ? -22 : 0);
    case TacticalStyle.Fortress:
      if (input.moveType === SpatialMoveType.BackwardRecycle) {
        return createModifier("FORTRESS safety bias", 16);
      }

      if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
        return createModifier("against FORTRESS safety", -20);
      }

      return createModifier("FORTRESS structure bias", input.lateralDistance > 0 ? 8 : 0);
    case TacticalStyle.ChaosHunters:
      if (
        input.moveType === SpatialMoveType.DirectVerticalAttack ||
        input.moveType === SpatialMoveType.WeakSideSwitch
      ) {
        return createModifier("CHAOS unstable-space bias", 18);
      }

      return createModifier("against CHAOS instinct", input.forwardDistance < 0 ? -15 : 0);
    case TacticalStyle.Custom:
      return createModifier("custom identity neutral", 0);
  }
}

function getSideModifier(
  context: SpatialIntentionContext,
  zone: ZoneId,
): ZoneAttractivenessModifier | null {
  const sideType = context.sideContext?.sideTypesByZone[zone];

  if (sideType === undefined) {
    return null;
  }

  switch (sideType) {
    case SideType.OpenSide:
      return createModifier("open side", 10);
    case SideType.WeakSide:
      return createModifier("weak side", 12);
    case SideType.ClosedSide:
      return createModifier("closed side", -8);
    case SideType.OverloadedSide:
      return createModifier("overloaded side", -3);
    case SideType.BalancedSide:
      return createModifier("balanced side", 0);
  }
}

function biasMatches(input: {
  readonly bias: TargetSelectionBias;
  readonly moveType: SpatialMoveType;
  readonly sideType: SideType | undefined;
  readonly zoneBand: string;
}): boolean {
  const moveMatches = input.bias.moveType === undefined || input.bias.moveType === input.moveType;
  const sideMatches = input.bias.sideType === undefined || input.bias.sideType === input.sideType;
  const zoneMatches = input.bias.zoneBand === undefined || input.bias.zoneBand === input.zoneBand;

  return moveMatches && sideMatches && zoneMatches;
}

function getMemoryModifiers(input: {
  readonly context: SpatialIntentionContext;
  readonly moveType: SpatialMoveType;
  readonly zone: ZoneId;
}): readonly ZoneAttractivenessModifier[] {
  const sideType = input.context.sideContext?.sideTypesByZone[input.zone];
  const zoneBand = getZoneParts(input.zone).longitudinalZone;

  return (input.context.memoryBiases ?? [])
    .filter((bias) =>
      biasMatches({
        bias,
        moveType: input.moveType,
        sideType,
        zoneBand,
      }),
    )
    .map((bias) => createModifier(bias.reason, bias.value));
}

function getUrgencyModifier(input: {
  readonly context: SpatialIntentionContext;
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
}): ZoneAttractivenessModifier | null {
  const urgency = input.context.offensiveUrgency;

  if (urgency === undefined || urgency.level === OffensiveUrgencyLevel.Low) {
    return null;
  }

  const highUrgency = urgency.level === OffensiveUrgencyLevel.High || urgency.level === OffensiveUrgencyLevel.Critical;
  const criticalExtra = urgency.level === OffensiveUrgencyLevel.Critical ? 6 : 0;

  if (input.moveType === SpatialMoveType.LateralCirculation && highUrgency) {
    return createModifier("red-zone delay penalty", -15 - criticalExtra);
  }

  if (input.moveType === SpatialMoveType.Progression && input.forwardDistance > 0) {
    return createModifier("urgency progression boost", highUrgency ? 12 + criticalExtra : 6);
  }

  if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
    return createModifier("urgency direct attack boost", highUrgency ? 10 + criticalExtra : 5);
  }

  if (input.moveType === SpatialMoveType.WeakSideSwitch && input.context.weakSide.exposure >= 65) {
    return createModifier("urgency weak-side boost", highUrgency ? 10 : 5);
  }

  return null;
}

function getMomentumModifier(input: {
  readonly context: SpatialIntentionContext;
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
}): ZoneAttractivenessModifier | null {
  const bias = applyOffensiveMomentumBias(input.context.team.offensiveMomentum);
  let value = 0;

  if (input.moveType === SpatialMoveType.Progression && input.forwardDistance > 0) {
    value = bias.progression;
  } else if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
    value = bias.directAttack;
  } else if (input.moveType === SpatialMoveType.LateralCirculation) {
    value = bias.lateralCirculation;
  } else if (input.moveType === SpatialMoveType.BackwardRecycle || input.moveType === SpatialMoveType.SafetyClearance) {
    value = bias.recycle;
  }

  if (value === 0) {
    return null;
  }

  return createModifier(`offensive momentum ${input.context.team.offensiveMomentum.level}`, value);
}

function getRoleContextValue(context: SpatialIntentionContext, key: "fatigue" | "momentum"): number {
  const player = context.team.players.find((candidate) => candidate.role === context.ballContext.ballCarrierRole);

  if (key === "fatigue") {
    return player?.fatigue.accumulatedFatigue ?? 0;
  }

  return player?.momentum ?? context.team.offensiveMomentum.score;
}

function evaluateLocalAdvantageForZone(
  context: SpatialIntentionContext,
  zone: ZoneId,
): LocalAdvantageEvaluation {
  const numerical = evaluateLocalNumericalAdvantage({
    attackingTeam: context.team,
    defendingTeam: context.opponentTeam,
    targetZone: zone,
    attackingDirection: context.ballContext.attackingDirection,
  });
  const coverShadowQuality =
    context.principles?.defensive.coverShadow === "GOOD"
      ? 72
      : context.principles?.defensive.coverShadow === "POOR"
        ? 28
        : 50;
  const passingLane = evaluatePassingLane({
    targetZone: zone,
    defensiveCompactness: context.defensiveCompactness,
    currentPressure: context.currentPressure,
    defendersInTarget: numerical.defendersInTarget,
    coverShadowQuality,
  });
  const receiver = evaluateReceiverAvailability({
    team: context.team,
    targetZone: zone,
    defendersInTarget: numerical.defendersInTarget,
  });

  return {
    numerical,
    passingLane,
    receiver,
  };
}

function describeReceptionTargetGeometry(level: string): string {
  switch (level) {
    case "FREE":
      return "reception geometry suggests a positive target, pending reception quality and follow-up context";
    case "SUPPORTED":
      return "reception geometry suggests supported target access, pending reception quality and follow-up context";
    case "ISOLATED":
      return "reception geometry suggests isolation risk";
    case "UNAVAILABLE":
      return "reception geometry has no viable target";
    default:
      return "reception geometry checked";
  }
}

function scoreCandidate(
  context: SpatialIntentionContext,
  zone: ZoneId,
): ZoneAttractivenessEvaluation {
  const fromParts = getZoneParts(context.ballContext.ballLocation);
  const toParts = getZoneParts(zone);
  const forwardDistance = getDirectionalDistance(
    fromParts.longitudinalZone,
    toParts.longitudinalZone,
    context.ballContext.attackingDirection,
  );
  const lateralDistance = Math.abs(
    getLateralIndex(toParts.lateralCorridor) - getLateralIndex(fromParts.lateralCorridor),
  );
  const moveType = classifySpatialMove({
    from: context.ballContext.ballLocation,
    to: zone,
    attackingDirection: context.ballContext.attackingDirection,
    weakSideZones: context.weakSide.switchTargetZones,
    teamStyle: context.team.tacticalStyle,
  });
  const instructions = context.team.tacticalInstructions.offensive;
  const weakSideTarget = context.weakSide.switchTargetZones.includes(zone);
  const riskTolerance = instructions.riskLevel;
  const verticality = instructions.verticality;
  const collectiveness = instructions.collectiveness;
  const footBias = instructions.ballUsage === BallUsageStyle.FootOriented ? 8 : 0;
  const handBias = instructions.ballUsage === BallUsageStyle.HandOriented ? 6 : 0;
  const styleVerticalBonus = context.team.tacticalStyle === TacticalStyle.Blitz ? 12 : 0;
  const styleControlBonus = context.team.tacticalStyle === TacticalStyle.Control ? 10 : 0;
  const pressureSafetyBonus = context.currentPressure === PressureLevel.High ? 10 : 0;
  const compactBlockBonus = context.defensiveCompactness.overallCompactness >= 65 ? 6 : 0;
  const roleVerticalBias = getRoleVerticalBias(context.ballContext.ballCarrierRole);
  const directVerticalPenalty = forwardDistance >= 2 && riskTolerance < 50 ? -18 : 0;
  const backwardIntentBonus =
    forwardDistance < 0 && context.currentPressure === PressureLevel.High && collectiveness >= 70 ? 10 : 0;
  const lateralControlBonus =
    forwardDistance === 0 && lateralDistance > 0 ? collectiveness * 0.14 + styleControlBonus : 0;
  const verticalScore = Math.max(0, forwardDistance) * (verticality * 0.2 + riskTolerance * 0.1 + styleVerticalBonus);
  const weakSideScore = weakSideTarget ? context.weakSide.exposure * 0.32 + compactBlockBonus : 0;
  const recyclePenalty = forwardDistance < 0 && context.territorialPressure >= 70 ? -10 : 0;
  const safetyScore =
    moveType === SpatialMoveType.BackwardRecycle || moveType === SpatialMoveType.LateralCirculation
      ? (moveType === SpatialMoveType.BackwardRecycle ? pressureSafetyBonus * 0.6 : pressureSafetyBonus) +
        (moveType === SpatialMoveType.BackwardRecycle ? collectiveness * 0.02 : collectiveness * 0.08) +
        handBias
      : 0;
  const identityModifier = getTeamIdentityModifier({
    style: context.team.tacticalStyle,
    moveType,
    forwardDistance,
    lateralDistance,
    territorialPressure: context.territorialPressure,
  });
  const supportScore = getSupportScore(context);
  const philosophy = evaluateProgressionPhilosophy({
    tacticalStyle: context.team.tacticalStyle,
    offensivePhilosophy: context.team.offensiveProgressionPhilosophy,
    offensiveInstructions: instructions,
    collectiveProperties: context.team.collectiveProperties,
    moveType,
    forwardDistance,
    lateralDistance,
    pressure: context.currentPressure,
    chaosLevel: context.chaosLevel,
    supportScore,
    territorialPressure: context.territorialPressure,
    tacticalDanger: context.tacticalDanger,
    scoringThreat: context.scoringThreat,
    ballCarrierRole: context.ballContext.ballCarrierRole,
    targetZone: zone,
  });
  const sideModifier = getSideModifier(context, zone);
  const memoryModifiers = getMemoryModifiers({
    context,
    moveType,
    zone,
  });
  const urgencyModifier = getUrgencyModifier({
    context,
    moveType,
    forwardDistance,
  });
  const momentumModifier = getMomentumModifier({
    context,
    moveType,
    forwardDistance,
  });
  const roleBehavior = evaluateRoleBehavior({
    role: context.ballContext.ballCarrierRole,
    tacticalStyle: context.team.tacticalStyle,
    moveType,
    pressure: context.currentPressure,
    chaosLevel: context.chaosLevel,
    fatigue: getRoleContextValue(context, "fatigue"),
    momentum: getRoleContextValue(context, "momentum"),
  });
  const localAdvantage = evaluateLocalAdvantageForZone(context, zone);
  const principleModifiers =
    context.principles === undefined
      ? []
      : evaluatePrincipleModifiers({
          principles: context.principles,
          targetZone: zone,
          localAdvantage,
        }).map((item) => createModifier(item.label, item.value));
  const modifiers = [
    identityModifier,
    createModifier(philosophy.mechanism, philosophy.modifier),
    ...(sideModifier === null ? [] : [sideModifier]),
    ...(urgencyModifier === null ? [] : [urgencyModifier]),
    ...(momentumModifier === null ? [] : [momentumModifier]),
    createModifier("role behavior", roleBehavior.modifier),
    ...memoryModifiers,
    ...principleModifiers,
  ].filter((modifier) => modifier.value !== 0);
  const modifierScore = modifiers.reduce((sum, modifier) => sum + modifier.value, 0);
  const score = clampRating(
    42 +
      verticalScore +
      weakSideScore +
      lateralControlBonus +
      safetyScore +
      backwardIntentBonus +
      roleVerticalBias +
      footBias +
      context.chaosLevel * 0.04 -
      context.defensiveCompactness.overallCompactness * 0.06 +
      directVerticalPenalty +
      recyclePenalty +
      modifierScore,
  );
  const side = getPitchSideForZone(zone);
  const verticalityCost = evaluateVerticalityCost({
    moveType,
    forwardDistance,
    lateralDistance,
    pressure: context.currentPressure,
    chaosLevel: context.chaosLevel,
    supportScore,
    tacticalDiscipline: context.team.collectiveProperties.tacticalDiscipline,
  });
  const progressionRisk = evaluateProgressionRisk({
    moveType,
    forwardDistance,
    riskLevel: riskTolerance,
    defensiveCompactness: context.defensiveCompactness.overallCompactness,
    supportScore,
  });
  const scoringThreatBonus =
    context.scoringThreat === ThreatLevel.High &&
    (moveType === SpatialMoveType.Progression ||
      moveType === SpatialMoveType.DirectVerticalAttack ||
      moveType === SpatialMoveType.WeakSideSwitch)
      ? 10
      : context.scoringThreat === ThreatLevel.Medium && moveType !== SpatialMoveType.BackwardRecycle
        ? 4
        : 0;
  const tacticalDangerBonus =
    context.tacticalDanger === ThreatLevel.High &&
    (moveType === SpatialMoveType.DirectVerticalAttack || moveType === SpatialMoveType.Progression)
      ? 6
      : 0;
  const normalizedScore = clampRating(
    score + scoringThreatBonus + tacticalDangerBonus - verticalityCost - progressionRisk,
  );
  const costReasons = [
    ...(verticalityCost >= 12 ? [`vertical cost -${verticalityCost}`] : []),
    ...(progressionRisk >= 8 ? [`progression risk -${progressionRisk}`] : []),
    ...(scoringThreatBonus > 0 ? [`scoring threat +${scoringThreatBonus}`] : []),
  ];

  return {
    zone,
    score: normalizedScore,
    moveType,
    reasons: [
      ...describeReasons({
        moveType,
        weakSideTarget,
        pressure: context.currentPressure,
        forwardDistance,
        lateralDistance,
        riskLevel: riskTolerance,
        costReasons,
      }),
      ...philosophy.reasons,
      ...(roleBehavior.modifier === 0
        ? []
        : [`role behavior ${roleBehavior.modifier >= 0 ? "+" : ""}${roleBehavior.modifier}`]),
      ...roleBehavior.reasons.slice(0, 3),
      localAdvantage.numerical.description,
      describeReceptionTargetGeometry(localAdvantage.receiver.level),
      localAdvantage.passingLane.reason,
      `${side} side`,
    ],
    modifiers: [
      ...modifiers,
      ...(verticalityCost > 0 ? [createModifier("verticality cost", -verticalityCost)] : []),
      ...(progressionRisk > 0 ? [createModifier("progression risk", -progressionRisk)] : []),
      ...(scoringThreatBonus > 0 ? [createModifier("scoring threat", scoringThreatBonus)] : []),
      ...(tacticalDangerBonus > 0 ? [createModifier("tactical danger", tacticalDangerBonus)] : []),
    ],
    localAdvantage,
  };
}

export function evaluateZoneAttractiveness(
  context: SpatialIntentionContext,
): readonly ZoneAttractivenessEvaluation[] {
  return getCandidateZones(
    context.ballContext.ballLocation,
    getDirectionalStep(context.ballContext.attackingDirection),
  )
    .map((zone) => scoreCandidate(context, zone))
    .sort((left, right) => right.score - left.score);
}
