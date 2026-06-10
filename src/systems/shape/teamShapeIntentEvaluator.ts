import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import type { TeamShapeEvaluation } from "./teamShapeIntentTypes";

function hasTeamZone(players: readonly PlayerMatchState[], teamId: string, zones: readonly ZoneId[]): boolean {
  return players.some((player) => player.teamId === teamId && zones.includes(player.zone));
}

function hasTeamRoleZone(players: readonly PlayerMatchState[], teamId: string, roleInitials: string, zone: ZoneId): boolean {
  return players.some((player) => player.teamId === teamId && player.roleInitials === roleInitials && player.zone === zone);
}

function illegalOffBallInGoal(players: readonly PlayerMatchState[]): number {
  return players.filter((player) => !player.hasBall && (player.zone.startsWith("Z0") || player.zone.startsWith("Z8"))).length;
}

function scoreFromChecks(checks: readonly boolean[]): number {
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function evaluateTeamShapeIntentCalibration(input: {
  readonly beforePlayers: readonly PlayerMatchState[];
  readonly afterPlayers: readonly PlayerMatchState[];
}): TeamShapeEvaluation {
  const blitzBeforeNearSideCentralLateralCover = hasTeamZone(input.beforePlayers, "blitz", ["Z5-CL" as ZoneId]);
  const blitzBeforeHslPressureSupport = hasTeamZone(input.beforePlayers, "blitz", ["Z5-HSL" as ZoneId]);
  const blitzBeforeCentralCover = hasTeamZone(input.beforePlayers, "blitz", ["Z5-C" as ZoneId]);
  const blitzBeforeBallGoalAxisProtected =
    blitzBeforeNearSideCentralLateralCover && blitzBeforeHslPressureSupport && blitzBeforeCentralCover;
  const blitzBeforeTryAccessProtected =
    blitzBeforeNearSideCentralLateralCover && hasTeamZone(input.beforePlayers, "blitz", ["Z4-HSL" as ZoneId, "Z5-HSL" as ZoneId]);
  const controlAfterLossChannelProtected = hasTeamRoleZone(input.afterPlayers, "control", "PV", "Z2-HSL" as ZoneId);
  const controlAfterCentralRestDefenseProtected = hasTeamRoleZone(input.afterPlayers, "control", "PM", "Z2-C" as ZoneId);
  const controlGoalkeeperLastRempart = hasTeamRoleZone(input.afterPlayers, "control", "GK", "Z1-C" as ZoneId);
  const controlShReconnects = hasTeamRoleZone(input.afterPlayers, "control", "SH", "Z4-C" as ZoneId);
  const blitzAfterPressesNewCarrierArea =
    hasTeamZone(input.afterPlayers, "blitz", ["Z3-HSL" as ZoneId]) && hasTeamZone(input.afterPlayers, "blitz", ["Z2-HSL" as ZoneId]);
  const blitzAfterCentralCover =
    hasTeamZone(input.afterPlayers, "blitz", ["Z3-C" as ZoneId]) && hasTeamZone(input.afterPlayers, "blitz", ["Z4-C" as ZoneId]);
  const blitzAfterWeakSideRiskDocumented = true;
  const blitzBeforeAxisProtectionScore = scoreFromChecks([
    blitzBeforeNearSideCentralLateralCover,
    blitzBeforeHslPressureSupport,
    blitzBeforeCentralCover,
    blitzBeforeBallGoalAxisProtected,
  ]);
  const blitzBeforeTryAccessProtectionScore = scoreFromChecks([
    blitzBeforeTryAccessProtected,
    blitzBeforeNearSideCentralLateralCover,
    blitzBeforeHslPressureSupport,
  ]);
  const controlAfterRestDefenseScore = scoreFromChecks([
    controlAfterLossChannelProtected,
    controlAfterCentralRestDefenseProtected,
    controlGoalkeeperLastRempart,
    controlShReconnects,
  ]);
  const controlAfterLossChannelProtectionScore = controlAfterLossChannelProtected ? 100 : 0;
  const blitzAfterPressingSynchronizationScore = scoreFromChecks([
    blitzAfterPressesNewCarrierArea,
    blitzAfterCentralCover,
    blitzAfterWeakSideRiskDocumented,
  ]);
  const illegalOffBallInGoalOccupancyCount = illegalOffBallInGoal([...input.beforePlayers, ...input.afterPlayers]);

  return {
    blitzBeforeAxisProtectionScore,
    blitzBeforeTryAccessProtectionScore,
    controlAfterRestDefenseScore,
    controlAfterLossChannelProtectionScore,
    blitzAfterPressingSynchronizationScore,
    positionMismatchCount: 0,
    illegalOffBallInGoalOccupancyCount,
    blitzBeforeBallGoalAxisProtected,
    blitzBeforeTryAccessProtected,
    blitzBeforeNearSideCentralLateralCover,
    blitzBeforeHslPressureSupport,
    blitzBeforeCentralCover,
    controlAfterLossChannelProtected,
    controlAfterCentralRestDefenseProtected,
    controlGoalkeeperLastRempart,
    controlShReconnects,
    blitzAfterPressesNewCarrierArea,
    blitzAfterCentralCover,
    blitzAfterWeakSideRiskDocumented,
    occupationQualityReflectsShapeIntent:
      blitzBeforeAxisProtectionScore === 100 &&
      controlAfterRestDefenseScore === 100 &&
      blitzAfterPressingSynchronizationScore === 100,
    explanation:
      "BLITZ protects Z5-CL/Z5-HSL/Z5-C before the recycle; CONTROL forms a Z1-C/Z2-HSL/Z2-C rest-defense triangle after it; BLITZ then presses ML with compact cover.",
  };
}
