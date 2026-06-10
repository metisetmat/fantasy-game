import { LateralCorridor, type ZoneId } from "../../core/zones";
import { getZoneParts } from "../spatial/utils";
import { OccupationFunction, MicroPosition } from "./occupationTypes";
import type { OccupationQualityGrade, OccupationQualityScoringInput } from "./occupationQualityTypes";

interface ScoreParts {
  readonly score: number;
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly penalties: readonly string[];
  readonly bonuses: readonly string[];
  readonly suggestedAdjustment: string | null;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function column(zone: ZoneId): number {
  return Number.parseInt(getZoneParts(zone).longitudinalZone.slice(1), 10);
}

function lane(zone: ZoneId): LateralCorridor {
  return getZoneParts(zone).lateralCorridor;
}

function laneIndex(zone: ZoneId): number {
  const lanes = [LateralCorridor.LeftCorridor, LateralCorridor.LeftHalfSpace, LateralCorridor.CentralAxis, LateralCorridor.RightHalfSpace, LateralCorridor.RightCorridor];

  return lanes.indexOf(lane(zone));
}

function distance(a: ZoneId, b: ZoneId): number {
  return Math.abs(column(a) - column(b)) + Math.abs(laneIndex(a) - laneIndex(b));
}

function isBehind(input: OccupationQualityScoringInput): boolean {
  const playerColumn = column(input.target.selectedZone);
  const ballColumn = column(input.input.ballZone);

  return input.input.attackingDirection === "LEFT_TO_RIGHT" ? playerColumn < ballColumn : playerColumn > ballColumn;
}

function isAhead(input: OccupationQualityScoringInput): boolean {
  const playerColumn = column(input.target.selectedZone);
  const ballColumn = column(input.input.ballZone);

  return input.input.attackingDirection === "LEFT_TO_RIGHT" ? playerColumn > ballColumn : playerColumn < ballColumn;
}

function isOuterOrHalfSpace(zone: ZoneId): boolean {
  return lane(zone) !== LateralCorridor.CentralAxis;
}

function nearbySameTeam(input: OccupationQualityScoringInput, maxDistance: number): number {
  return input.input.players.filter((player) => player.teamId === input.player.teamId && player.playerId !== input.player.playerId && distance(player.zone, input.target.selectedZone) <= maxDistance).length;
}

function directSupport(input: OccupationQualityScoringInput): ScoreParts {
  const supportDistance = distance(input.input.ballZone, input.target.selectedZone);
  const sameOrAdjacentLane = Math.abs(laneIndex(input.input.ballZone) - laneIndex(input.target.selectedZone)) <= 1;
  const penalties: string[] = [];
  const weaknesses: string[] = [];
  let score = 84;

  if (supportDistance > 1 || input.target.microPosition !== MicroPosition.LowSupport) {
    score -= 14;
    penalties.push("DIRECT_SUPPORT_TOO_FAR");
    weaknesses.push("support is available but not close enough for elite short-support CONTROL behavior");
  }

  if (!sameOrAdjacentLane) {
    score -= 12;
    penalties.push("DIRECT_SUPPORT_BAD_ANGLE");
    weaknesses.push("support angle is not cleanly adjacent to the carrier lane");
  }

  return {
    score,
    strengths: sameOrAdjacentLane ? ["keeps a playable pressure escape near the carrier"] : [],
    weaknesses,
    penalties,
    bonuses: supportDistance <= 1 ? ["near-carrier support relation"] : [],
    suggestedAdjustment: penalties.includes("DIRECT_SUPPORT_TOO_FAR") ? `${input.player.roleInitials} -> ${input.input.ballZone} ${MicroPosition.RightSupportAngle} or Z4-C ${MicroPosition.LowSupport}` : null,
  };
}

function widthFixer(input: OccupationQualityScoringInput): ScoreParts {
  const wide = isOuterOrHalfSpace(input.target.selectedZone);
  const ahead = isAhead(input);
  const score = 58 + (wide ? 22 : -22) + (ahead ? 10 : -4);

  return {
    score,
    strengths: wide ? ["uses the outside or half-space corridor to pin pressure"] : [],
    weaknesses: wide ? [] : ["central lane does not stretch the block"],
    penalties: wide ? [] : ["WIDTH_FIXER_CENTRAL"],
    bonuses: wide && ahead ? ["pins/dissuades nearest defender while remaining a reachable option"] : [],
    suggestedAdjustment: wide ? null : `${input.player.roleInitials} -> Z5-HSL or Z5-CL`,
  };
}

function restDefenseAnchor(input: OccupationQualityScoringInput): ScoreParts {
  const behind = isBehind(input);
  const central = lane(input.target.selectedZone) === LateralCorridor.CentralAxis || lane(input.target.selectedZone) === LateralCorridor.LeftHalfSpace || lane(input.target.selectedZone) === LateralCorridor.RightHalfSpace;
  const duplicateAnchors = input.input.resolution.targets.filter((target) => target.playerId !== input.player.playerId && target.primaryFunction === OccupationFunction.RestDefenseAnchor && target.selectedZone === input.target.selectedZone).length;
  const score = 64 + (behind ? 16 : -14) + (central ? 12 : -8) - duplicateAnchors * 12;

  return {
    score,
    strengths: ["protects the transition lane behind the ball"],
    weaknesses: duplicateAnchors > 0 ? ["another anchor occupies the same lane"] : [],
    penalties: duplicateAnchors > 0 ? ["REST_DEFENSE_DUPLICATION"] : [],
    bonuses: behind && central ? ["goal-side central protection"] : [],
    suggestedAdjustment: duplicateAnchors > 0 ? `${input.player.roleInitials} should separate from the duplicate anchor into a half-space base` : null,
  };
}

function halfSpaceRecycle(input: OccupationQualityScoringInput): ScoreParts {
  const behind = isBehind(input);
  const halfSpace = lane(input.target.selectedZone) === LateralCorridor.LeftHalfSpace || lane(input.target.selectedZone) === LateralCorridor.RightHalfSpace;
  const score = 60 + (behind ? 18 : -8) + (halfSpace ? 16 : -6) - Math.round(input.player.pressure * 0.08);

  return {
    score,
    strengths: halfSpace ? ["creates a diagonal reset rather than duplicating the anchor"] : [],
    weaknesses: behind ? [] : ["recycle option is not clearly behind the ball"],
    penalties: behind ? [] : ["RECYCLE_TOO_HIGH"],
    bonuses: behind && halfSpace ? ["safe access into the next phase"] : [],
    suggestedAdjustment: behind && halfSpace ? null : `${input.player.roleInitials} -> Z3-HSL`,
  };
}

function thirdManConnector(input: OccupationQualityScoringInput): ScoreParts {
  const supportDistance = nearbySameTeam(input, 2);
  const score = 56 + supportDistance * 8 + (input.target.microPosition === MicroPosition.RightSupportAngle || input.target.microPosition === MicroPosition.LeftSupportAngle ? 10 : 0);

  return {
    score,
    strengths: supportDistance >= 2 ? ["connects carrier, wall receiver, and next runner"] : [],
    weaknesses: supportDistance < 2 ? ["third-man relation needs a clearer next receiver"] : [],
    penalties: supportDistance < 2 ? ["THIRD_MAN_LINK_WEAK"] : [],
    bonuses: supportDistance >= 2 ? ["hidden continuation value"] : [],
    suggestedAdjustment: supportDistance < 2 ? `${input.player.roleInitials} should sit between carrier and weak-side continuation` : null,
  };
}

function weakSideConnector(input: OccupationQualityScoringInput): ScoreParts {
  const farFromBallLane = Math.abs(laneIndex(input.input.ballZone) - laneIndex(input.target.selectedZone)) >= 2;
  const chainAccessible = input.input.receptionChainPaths.some((path) => path.includes(input.player.roleInitials));
  const score = 54 + (farFromBallLane ? 16 : 2) + (chainAccessible ? 14 : -8);

  return {
    score,
    strengths: farFromBallLane ? ["prepares the far-side lane"] : [],
    weaknesses: chainAccessible ? [] : ["not clearly reachable through the current chain set"],
    penalties: chainAccessible ? [] : ["WEAK_SIDE_CHAIN_DISCONNECTED"],
    bonuses: chainAccessible ? ["reachable through one or two passes"] : [],
    suggestedAdjustment: chainAccessible ? null : `${input.player.roleInitials} needs a clearer one-pass bridge or third-man link`,
  };
}

function contactPlatform(input: OccupationQualityScoringInput): ScoreParts {
  const ahead = isAhead(input);
  const chainContinuation = input.input.receptionChainPaths.some((path) => path.includes(`${input.player.roleInitials} ->`));
  const score = 58 + (ahead ? 12 : -8) + (chainContinuation ? 16 : -6);

  return {
    score,
    strengths: chainContinuation ? ["can act as point d'appui before a third-man continuation"] : [],
    weaknesses: chainContinuation ? [] : ["platform touch lacks a visible next receiver"],
    penalties: chainContinuation ? [] : ["CONTACT_PLATFORM_NO_LAYOFF"],
    bonuses: ahead && chainContinuation ? ["neutral reception still carries follow-up value"] : [],
    suggestedAdjustment: chainContinuation ? null : `${input.player.roleInitials} needs a clearer layoff lane`,
  };
}

function pressingTrap(input: OccupationQualityScoringInput): ScoreParts {
  const closeToCarrier = distance(input.input.ballZone, input.target.selectedZone) <= 1;
  const pressureSupport = nearbySameTeam(input, 1);
  const score = 52 + (closeToCarrier ? 18 : -10) + pressureSupport * 7;

  return {
    score,
    strengths: closeToCarrier ? ["compresses the carrier lane"] : [],
    weaknesses: pressureSupport < 1 ? ["trap lacks a nearby second defender"] : [],
    penalties: pressureSupport < 1 ? ["PRESSING_TRAP_UNSUPPORTED"] : [],
    bonuses: pressureSupport >= 1 ? ["nearby support can block the invited escape"] : [],
    suggestedAdjustment: pressureSupport < 1 ? `${input.player.roleInitials} needs a cover-shadow partner` : null,
  };
}

function transitionHunter(input: OccupationQualityScoringInput): ScoreParts {
  const ahead = isAhead(input);
  const sameTeamBehind = input.input.players.filter((player) => player.teamId === input.player.teamId && player.playerId !== input.player.playerId && distance(player.zone, input.input.ballZone) <= 2).length;
  const score = 54 + (ahead ? 18 : -6) + (sameTeamBehind >= 2 ? 8 : -10);

  return {
    score,
    strengths: ahead ? ["projects a first outlet after recovery"] : [],
    weaknesses: sameTeamBehind < 2 ? ["forward outlet risks leaving balance short"] : [],
    penalties: sameTeamBehind < 2 ? ["TRANSITION_HUNTER_BALANCE_RISK"] : [],
    bonuses: sameTeamBehind >= 2 ? ["transition outlet without full defensive abandonment"] : [],
    suggestedAdjustment: sameTeamBehind < 2 ? `${input.player.roleInitials} can hold one lane deeper until pressure support arrives` : null,
  };
}

function generic(input: OccupationQualityScoringInput): ScoreParts {
  return {
    score: Math.max(52, input.target.targetScore - 10),
    strengths: ["function and resolved zone are broadly compatible"],
    weaknesses: [],
    penalties: [],
    bonuses: [],
    suggestedAdjustment: null,
  };
}

export function gradeFromScore(score: number): OccupationQualityGrade {
  if (score >= 88) {
    return "EXCELLENT";
  }

  if (score >= 76) {
    return "GOOD";
  }

  if (score >= 62) {
    return "ACCEPTABLE";
  }

  if (score >= 44) {
    return "WEAK";
  }

  return "BROKEN";
}

export function scoreOccupationQuality(input: OccupationQualityScoringInput): ScoreParts {
  switch (input.target.primaryFunction) {
    case OccupationFunction.DirectSupport:
      return directSupport(input);
    case OccupationFunction.WidthFixer:
      return widthFixer(input);
    case OccupationFunction.RestDefenseAnchor:
      return restDefenseAnchor(input);
    case OccupationFunction.HalfSpaceRecycle:
      return halfSpaceRecycle(input);
    case OccupationFunction.ThirdManConnector:
      return thirdManConnector(input);
    case OccupationFunction.WeakSideConnector:
    case OccupationFunction.SwitchReceiver:
      return weakSideConnector(input);
    case OccupationFunction.ContactPlatform:
      return contactPlatform(input);
    case OccupationFunction.PressingTrap:
    case OccupationFunction.PressTrigger:
    case OccupationFunction.CoverShadowBlocker:
      return pressingTrap(input);
    case OccupationFunction.TransitionHunter:
    case OccupationFunction.TempoAccelerator:
      return transitionHunter(input);
    default:
      return generic(input);
  }
}

export function scoreAlternativeZone(input: OccupationQualityScoringInput & { readonly alternativeZone: ZoneId }): number {
  return clamp(scoreOccupationQuality({
    ...input,
    target: {
      ...input.target,
      selectedZone: input.alternativeZone,
    },
  }).score);
}

export function normalizeQualityScore(score: number): number {
  return clamp(score);
}
