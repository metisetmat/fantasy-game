import type { Rating } from "../../../core/ratings";
import { PlayerRole, type PlayerState } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import { IntentType } from "../../intent";
import { clampInteractionRating } from "../../interactions/shared/ratings";
import { UtilityActionType } from "./actionTypes";

export interface UtilityScoringContext {
  readonly action: UtilityActionType;
  readonly tacticalStyle: TacticalStyle;
  readonly spatialAffordance: Rating;
  readonly dynamicInfluenceScore?: Rating;
  readonly dynamicInfluenceBreakdown?: string;
  readonly tacticalIntent: Rating;
  readonly pressure: Rating;
  readonly perceptionConfidence?: Rating;
  readonly scanFreshnessTicks?: number;
  readonly awarenessPressureRecognition?: Rating;
  readonly risk: Rating;
  readonly cohesion: Rating;
}

export interface UtilityScoreBreakdown {
  readonly playerAbility: Rating;
  readonly spatialContext: Rating;
  readonly dynamicInfluenceScore: Rating;
  readonly dynamicInfluenceBreakdown: string;
  readonly tacticalIntent: Rating;
  readonly fatigue: Rating;
  readonly pressure: Rating;
  readonly perceptionConfidence: Rating;
  readonly perceptionModifier: Rating;
  readonly perceptionBreakdown: string;
  readonly risk: Rating;
  readonly roleResponsibility: Rating;
  readonly teamStyle: Rating;
  readonly cohesion: Rating;
  readonly activeIntentMultiplier: Rating;
  readonly intentPriorityBonus: Rating;
  readonly intentTargetAlignment: Rating;
  readonly finalScore: Rating;
}

function getVisibleAbility(player: PlayerState, action: UtilityActionType): Rating {
  const visible = player.visibleAttributes;

  if (visible !== undefined) {
    switch (action) {
      case UtilityActionType.Carry:
      case UtilityActionType.AttackSpace:
        return clampInteractionRating(visible.ballCarrying * 0.45 + visible.speed * 0.35 + visible.creativity * 0.2);
      case UtilityActionType.Pass:
      case UtilityActionType.Support:
        return clampInteractionRating(visible.handPlay * 0.38 + visible.vision * 0.34 + visible.composure * 0.28);
      case UtilityActionType.Kick:
      case UtilityActionType.GoalAttempt:
      case UtilityActionType.DropAttempt:
        return clampInteractionRating(visible.footPlay * 0.46 + visible.composure * 0.28 + visible.vision * 0.18 + visible.power * 0.08);
      case UtilityActionType.Press:
      case UtilityActionType.Cover:
      case UtilityActionType.ProtectZone:
      case UtilityActionType.ContestLooseBall:
        return clampInteractionRating(visible.speed * 0.25 + visible.power * 0.24 + visible.endurance * 0.2 + visible.vision * 0.18 + visible.composure * 0.13);
    }
  }

  switch (action) {
    case UtilityActionType.Carry:
    case UtilityActionType.AttackSpace:
      return clampInteractionRating(player.attributes.footPlayDribble * 0.45 + player.attributes.speed * 0.35 + player.attributes.agility * 0.2);
    case UtilityActionType.Pass:
    case UtilityActionType.Support:
      return clampInteractionRating(player.attributes.handPlay * 0.38 + player.attributes.intelligence * 0.34 + player.attributes.mental * 0.28);
    case UtilityActionType.Kick:
    case UtilityActionType.GoalAttempt:
    case UtilityActionType.DropAttempt:
      return clampInteractionRating(player.attributes.footPlayPassingShooting * 0.46 + player.attributes.mental * 0.28 + player.attributes.intelligence * 0.18 + player.attributes.power * 0.08);
    case UtilityActionType.Press:
    case UtilityActionType.Cover:
    case UtilityActionType.ProtectZone:
    case UtilityActionType.ContestLooseBall:
      return clampInteractionRating(player.attributes.speed * 0.25 + player.attributes.power * 0.24 + player.attributes.endurance * 0.2 + player.attributes.intelligence * 0.18 + player.attributes.mental * 0.13);
  }
}

function roleResponsibility(role: PlayerRole, action: UtilityActionType): Rating {
  const high = 88;
  const good = 74;
  const medium = 58;
  const low = 42;

  switch (action) {
    case UtilityActionType.Pass:
      return role === PlayerRole.TempoHalf || role === PlayerRole.Playmaker || role === PlayerRole.HookLink ? high : medium;
    case UtilityActionType.Carry:
      return role === PlayerRole.SpaceHunter || role === PlayerRole.Playmaker || role === PlayerRole.LeftPiston || role === PlayerRole.RightPiston ? high : medium;
    case UtilityActionType.Kick:
    case UtilityActionType.DropAttempt:
    case UtilityActionType.GoalAttempt:
      return role === PlayerRole.Playmaker || role === PlayerRole.TempoHalf || role === PlayerRole.GoalkeeperFreeSafety ? high : low;
    case UtilityActionType.Press:
      return role === PlayerRole.MobileLock || role === PlayerRole.ForwardLeader || role === PlayerRole.LeftPiston || role === PlayerRole.RightPiston ? high : medium;
    case UtilityActionType.Cover:
    case UtilityActionType.ProtectZone:
      return role === PlayerRole.MobileLock || role === PlayerRole.GoalkeeperFreeSafety || role === PlayerRole.Pivot ? high : medium;
    case UtilityActionType.Support:
      return role === PlayerRole.HookLink || role === PlayerRole.ForwardLeader || role === PlayerRole.Pivot ? high : good;
    case UtilityActionType.AttackSpace:
      return role === PlayerRole.SpaceHunter || role === PlayerRole.LeftPiston || role === PlayerRole.RightPiston || role === PlayerRole.Playmaker ? high : medium;
    case UtilityActionType.ContestLooseBall:
      return role === PlayerRole.HookLink || role === PlayerRole.MobileLock || role === PlayerRole.ForwardLeader || role === PlayerRole.SpaceHunter ? high : good;
  }
}

function teamStyleFit(style: TacticalStyle, action: UtilityActionType): Rating {
  if (style === TacticalStyle.Blitz) {
    return action === UtilityActionType.AttackSpace ||
      action === UtilityActionType.Kick ||
      action === UtilityActionType.Press ||
      action === UtilityActionType.ContestLooseBall
      ? 88
      : action === UtilityActionType.Support
        ? 56
        : 68;
  }

  if (style === TacticalStyle.Control) {
    return action === UtilityActionType.Pass ||
      action === UtilityActionType.Support ||
      action === UtilityActionType.Cover ||
      action === UtilityActionType.ProtectZone
      ? 88
      : action === UtilityActionType.AttackSpace
        ? 58
        : 70;
  }

  return 68;
}

function pressureFit(action: UtilityActionType, pressure: Rating): Rating {
  if (action === UtilityActionType.Press || action === UtilityActionType.Cover || action === UtilityActionType.ContestLooseBall) {
    return pressure;
  }

  return clampInteractionRating(100 - pressure * 0.45);
}

function riskFit(action: UtilityActionType, risk: Rating): Rating {
  const risky =
    action === UtilityActionType.AttackSpace ||
    action === UtilityActionType.Kick ||
    action === UtilityActionType.GoalAttempt ||
    action === UtilityActionType.DropAttempt;

  return risky ? risk : clampInteractionRating(100 - risk * 0.35);
}

function intentActionAlignment(intent: IntentType | undefined, action: UtilityActionType): Rating {
  if (intent === undefined) {
    return 50;
  }

  if (
    (intent === IntentType.AttackDepth && (action === UtilityActionType.AttackSpace || action === UtilityActionType.Carry)) ||
    (intent === IntentType.AttackWeakSide && action === UtilityActionType.AttackSpace) ||
    (intent === IntentType.SupportBall && (action === UtilityActionType.Support || action === UtilityActionType.Pass)) ||
    (intent === IntentType.OrganizeTempo && (action === UtilityActionType.Pass || action === UtilityActionType.Support)) ||
    (intent === IntentType.PrepareFinish && (action === UtilityActionType.GoalAttempt || action === UtilityActionType.DropAttempt || action === UtilityActionType.AttackSpace)) ||
    (intent === IntentType.AnticipateRebound && action === UtilityActionType.ContestLooseBall) ||
    (intent === IntentType.ContestLooseBall && action === UtilityActionType.ContestLooseBall) ||
    (intent === IntentType.PressBall && action === UtilityActionType.Press) ||
    (intent === IntentType.ProtectRestDefense && (action === UtilityActionType.Cover || action === UtilityActionType.ProtectZone)) ||
    (intent === IntentType.RecoverStructure && (action === UtilityActionType.Cover || action === UtilityActionType.ProtectZone)) ||
    (intent === IntentType.ProtectFrame && action === UtilityActionType.ProtectZone) ||
    (intent === IntentType.OccupyWidth && action === UtilityActionType.AttackSpace)
  ) {
    return 82;
  }

  if (
    (intent === IntentType.ProtectRestDefense && (action === UtilityActionType.AttackSpace || action === UtilityActionType.GoalAttempt || action === UtilityActionType.DropAttempt)) ||
    (intent === IntentType.ResetShape && (action === UtilityActionType.AttackSpace || action === UtilityActionType.Kick))
  ) {
    return 24;
  }

  return 50;
}

export function scorePlayerUtility(player: PlayerState, context: UtilityScoringContext): UtilityScoreBreakdown {
  const playerAbility = getVisibleAbility(player, context.action);
  const spatialContext = context.dynamicInfluenceScore ?? context.spatialAffordance;
  const tacticalIntent = context.tacticalIntent;
  const fatigue = player.fatigue.freshness;
  const pressure = pressureFit(context.action, context.pressure);
  const perceptionConfidence = context.perceptionConfidence ?? 72;
  const scanFreshnessTicks = context.scanFreshnessTicks ?? 1;
  const pressureRecognition = context.awarenessPressureRecognition ?? perceptionConfidence;
  const perceptionModifier = clampInteractionRating(
    perceptionConfidence * 0.52 + pressureRecognition * 0.24 + Math.max(0, 100 - scanFreshnessTicks * 12) * 0.24,
  );
  const risk = riskFit(context.action, context.risk);
  const responsibility = roleResponsibility(player.role, context.action);
  const style = teamStyleFit(context.tacticalStyle, context.action);
  const cohesion = context.cohesion;
  const primaryIntent = player.primaryIntent?.type;
  const activeIntentMultiplier = intentActionAlignment(primaryIntent, context.action);
  const intentPriorityBonus = clampInteractionRating((player.primaryIntent?.priority ?? 0) * (activeIntentMultiplier >= 70 ? 0.22 : activeIntentMultiplier <= 30 ? -0.18 : 0.05));
  const intentTargetAlignment = player.intentTargetZone === undefined || player.intentTargetZone === null ? 50 : 68;
  const product =
    (playerAbility / 100) *
    (spatialContext / 100) *
    (tacticalIntent / 100) *
    (fatigue / 100) *
    (pressure / 100) *
    (risk / 100) *
    (responsibility / 100) *
    (style / 100) *
    (cohesion / 100) *
    (activeIntentMultiplier / 100) *
    (perceptionModifier / 100);

  return {
    playerAbility,
    spatialContext,
    dynamicInfluenceScore: spatialContext,
    dynamicInfluenceBreakdown: context.dynamicInfluenceBreakdown ?? "legacy spatial affordance; dynamic influence unavailable for this resolver path",
    tacticalIntent,
    fatigue,
    pressure,
    perceptionConfidence,
    perceptionModifier,
    perceptionBreakdown: `perception confidence ${perceptionConfidence}/100, scan freshness ${scanFreshnessTicks} tick(s), pressure recognition ${pressureRecognition}/100`,
    risk,
    roleResponsibility: responsibility,
    teamStyle: style,
    cohesion,
    activeIntentMultiplier,
    intentPriorityBonus,
    intentTargetAlignment,
    finalScore: clampInteractionRating(product * 100 + intentPriorityBonus + (intentTargetAlignment - 50) * 0.08),
  };
}
