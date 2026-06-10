import { classifyInGoalAccessRoute, isInsideTryZone } from "../rules";
import { TRY_TOUCHDOWN_POINT_VALUE } from "../scoring";
import type { TryTouchdownAttemptContext, TryTouchdownAttemptResult } from "./tryTouchdownAttemptTypes";

function scoreAfterTry(scoreBefore: string, points: number): string {
  const match = /CONTROL\s+(\d+)\s+-\s+(\d+)\s+BLITZ/.exec(scoreBefore);

  if (match === null) {
    return scoreBefore;
  }

  const controlPoints = Number.parseInt(match[1] ?? "0", 10);
  const blitzPoints = Number.parseInt(match[2] ?? "0", 10);

  return `CONTROL ${controlPoints + points} - ${blitzPoints} BLITZ`;
}

export function resolveTryTouchdownAttempt(context: TryTouchdownAttemptContext): TryTouchdownAttemptResult {
  if (!isInsideTryZone(context.currentZone, context.attackingTeamId)) {
    return {
      resolved: true,
      outcome: "TACKLED_SHORT",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: context.attackingTeamId,
      restartType: "PLAY_CONTINUES",
      accessRouteCategory: "INVALID_ACCESS",
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: `${context.carrierRole} does not reach the opponent try zone, so the grounding attempt is not available.`,
    };
  }

  const accessRoute = classifyInGoalAccessRoute(context.previousZone, context.currentZone, context.attackingTeamId);

  if (!accessRoute.legal) {
    return {
      resolved: true,
      outcome: "INVALID_ACCESS_ROUTE",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: context.defendingTeamId,
      restartType: "DEFENSIVE_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: accessRoute.reason,
    };
  }

  const looseGroundingLegal =
    context.groundingType === "HELD_BALL" || (context.downwardPressureApplied && context.frontBodyWaistToNeckPressure);

  if (!context.legalGroundingAvailable || !looseGroundingLegal) {
    return {
      resolved: true,
      outcome: "INVALID_GROUNDING",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: context.defendingTeamId,
      restartType: "DEFENSIVE_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason:
        context.groundingType === "HELD_BALL"
          ? `${context.carrierRole} reaches the in-goal zone, but ball control is not available for held-ball grounding.`
          : `${context.carrierRole} reaches the in-goal zone, but loose-ball grounding needs downward pressure by the front body from waist to neck.`,
    };
  }

  const controlScore =
    context.ballControlScore * 0.28 +
    context.groundingScore * 0.23 +
    context.bodyControlScore * 0.14 +
    context.carrierMomentumScore * 0.14 +
    context.supportArrivingScore * 0.1 +
    context.legalAccessQuality * 0.08 +
    context.teamStyleModifier -
    context.fatiguePenalty * 0.12 -
    context.handlingRisk * 0.1;
  const pressureScore =
    context.contactPressure * 0.22 +
    context.tacklePressure * 0.26 +
    context.defenderGoalLinePressure * 0.26 +
    context.fatiguePenalty * 0.08;
  const groundingMargin = controlScore - pressureScore;
  const lossControlRisk = context.handlingRisk + context.contactPressure * 0.28 + context.fatiguePenalty * 0.35 - context.ballControlScore * 0.38;
  const credibleGroundingSupport =
    context.ballControlScore >= 74 &&
    context.groundingScore >= 80 &&
    context.bodyControlScore >= 70 &&
    context.supportArrivingScore >= 62;
  const highQualityLegalAccess =
    context.legalAccessQuality >= 76 &&
    context.ballControlScore >= 78 &&
    context.groundingScore >= 82 &&
    context.bodyControlScore >= 74 &&
    context.carrierMomentumScore >= 72 &&
    context.supportArrivingScore >= 58 &&
    context.fatiguePenalty <= 14;
  const extremeGoalLinePressure =
    context.defenderGoalLinePressure >= 76 || context.tacklePressure >= 80 || context.contactPressure >= 82;
  const heldUpRisk =
    context.contactPressure * 0.34 +
    context.tacklePressure * 0.28 +
    context.defenderGoalLinePressure * 0.22 -
    context.groundingScore * 0.2 -
    context.carrierMomentumScore * 0.1;

  if (lossControlRisk >= 42 && groundingMargin < 18 && !credibleGroundingSupport) {
    return {
      resolved: true,
      outcome: "LOST_FORWARD",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: context.defendingTeamId,
      restartType: "SCRUM_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: `${context.carrierRole} reaches the grounding window but loses control under contact.`,
    };
  }

  if (heldUpRisk >= 30 && context.ballControlScore >= 62 && context.groundingScore >= 68) {
    return {
      resolved: true,
      outcome: "HELD_UP",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: "CONTESTED",
      restartType: "SCRUM_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: `${context.carrierRole} is held up by goal-line contact before clear downward grounding is established.`,
    };
  }

  const calibratedLegalAccessGroundingWindow =
    (highQualityLegalAccess &&
      groundingMargin >= 20 &&
      context.supportArrivingScore >= 64 &&
      context.carrierMomentumScore >= 74 &&
      !extremeGoalLinePressure &&
      heldUpRisk < 28) ||
    (context.legalAccessQuality >= 76 &&
      context.ballControlScore >= 74 &&
      context.groundingScore >= 76 &&
      context.bodyControlScore >= 84 &&
      context.carrierMomentumScore >= 73 &&
      context.supportArrivingScore >= 70 &&
      context.contactPressure <= 55 &&
      context.tacklePressure <= 55 &&
      context.defenderGoalLinePressure <= 56 &&
      context.fatiguePenalty <= 9 &&
      groundingMargin >= 32) ||
    (context.legalAccessQuality >= 82 &&
      context.ballControlScore >= 88 &&
      context.groundingScore >= 90 &&
      context.bodyControlScore >= 93 &&
      context.carrierMomentumScore >= 90 &&
      context.supportArrivingScore >= 63 &&
      context.contactPressure <= 50 &&
      context.tacklePressure <= 50 &&
      context.defenderGoalLinePressure <= 56 &&
      context.fatiguePenalty <= 2 &&
      groundingMargin >= 42);

  if (calibratedLegalAccessGroundingWindow) {
    return {
      resolved: true,
      outcome: "TRY_SCORED",
      scoringAction: "TRY_TOUCHDOWN",
      pointValue: TRY_TOUCHDOWN_POINT_VALUE,
      scoreBefore: context.scoreBefore,
      scoreAfter: scoreAfterTry(context.scoreBefore, TRY_TOUCHDOWN_POINT_VALUE),
      possessionAfter: "OUT_OF_PLAY",
      restartType: "TRY_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: context.groundingZone !== undefined,
      reason: `${context.carrierRole} uses ${accessRoute.category} with high-quality legal access, ball control, support, and momentum; the calibrated attrition check rewards the grounding window without changing try value.`,
    };
  }

  if (highQualityLegalAccess && groundingMargin >= 12 && context.defenderGoalLinePressure >= 68 && context.ballControlScore >= 78) {
    return {
      resolved: true,
      outcome: "HELD_UP",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: "CONTESTED",
      restartType: "SCRUM_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: `${context.carrierRole} has legal access and control, but goal-line pressure keeps the grounding contest held up rather than becoming a cheap try or an over-punished lost forward.`,
    };
  }

  if (highQualityLegalAccess && groundingMargin >= 10 && context.supportArrivingScore < 66) {
    return {
      resolved: true,
      outcome: "TACKLED_SHORT",
      scoringAction: "NONE",
      pointValue: 0,
      scoreBefore: context.scoreBefore,
      scoreAfter: context.scoreBefore,
      possessionAfter: context.attackingTeamId,
      restartType: "PLAY_CONTINUES",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: false,
      reason: `${context.carrierRole} has legal access, but support is not strong enough to finish the grounding action; the defense stops the carrier short without forcing a lost-forward default.`,
    };
  }

  const supportDrivenGroundingWindow =
    credibleGroundingSupport &&
    groundingMargin >= 29 &&
    context.supportArrivingScore >= 70 &&
    context.carrierMomentumScore >= 70 &&
    context.fatiguePenalty <= 12 &&
    !extremeGoalLinePressure;
  const elitePowerGroundingWindow =
    groundingMargin >= 38 &&
    context.ballControlScore >= 90 &&
    context.groundingScore >= 92 &&
    context.bodyControlScore >= 94 &&
    context.carrierMomentumScore >= 90 &&
    context.supportArrivingScore >= 63 &&
    context.fatiguePenalty <= 8 &&
    !extremeGoalLinePressure;

  if (elitePowerGroundingWindow || supportDrivenGroundingWindow) {
    return {
      resolved: true,
      outcome: "TRY_SCORED",
      scoringAction: "TRY_TOUCHDOWN",
      pointValue: TRY_TOUCHDOWN_POINT_VALUE,
      scoreBefore: context.scoreBefore,
      scoreAfter: scoreAfterTry(context.scoreBefore, TRY_TOUCHDOWN_POINT_VALUE),
      possessionAfter: "OUT_OF_PLAY",
      restartType: "TRY_RESTART",
      accessRouteCategory: accessRoute.category,
      groundingZone: context.groundingZone,
      groundingType: context.groundingType,
      conversionGeometryStored: context.groundingZone !== undefined,
      reason: `${context.carrierRole} uses ${accessRoute.category} and grounds in the opponent in-goal zone; held-ball grounding does not require downward pressure.`,
    };
  }

  const combinedLinePressure = context.contactPressure + context.tacklePressure + context.defenderGoalLinePressure;
  const outcome = context.tacklePressure >= 70 || context.defenderGoalLinePressure >= 70 || combinedLinePressure >= 178 ? "TACKLED_SHORT" : "LOST_FORWARD";

  return {
    resolved: true,
    outcome,
    scoringAction: "NONE",
    pointValue: 0,
    scoreBefore: context.scoreBefore,
    scoreAfter: context.scoreBefore,
    possessionAfter: outcome === "LOST_FORWARD" ? context.defendingTeamId : context.attackingTeamId,
    restartType: outcome === "LOST_FORWARD" ? "SCRUM_RESTART" : "PLAY_CONTINUES",
    accessRouteCategory: accessRoute.category,
    groundingZone: context.groundingZone,
    groundingType: context.groundingType,
    conversionGeometryStored: false,
    reason:
      outcome === "TACKLED_SHORT"
        ? `${context.carrierRole} reaches pressure near the try line, but the defense stops the carrier before legal grounding resolves.`
        : `${context.carrierRole} reaches the grounding contest but loses ball control before legal grounding is established.`,
  };
}
