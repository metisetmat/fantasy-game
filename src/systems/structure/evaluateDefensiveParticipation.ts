import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import { PlayerRole, type PlayerState } from "../../models/player";
import type { CompactnessEvaluation, SpatialTeamContext } from "../spatial";
import { AttackingDirection, type SpatialMoveType } from "../spatial/intention";
import { clampRating, getZoneParts } from "../spatial/utils";
import { getDirectionalDistance } from "../spatial/intention";
import {
  PlayerStructuralState,
  type DefensiveParticipationEvaluation,
  type PlayerStructuralParticipation,
} from "./types";
import { formatStructuralRole } from "./playerStructuralState";

export interface DefensiveParticipationInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly ballLocation: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly moveType: SpatialMoveType;
}

function getAverageFreshness(players: readonly PlayerState[]): number {
  if (players.length === 0) {
    return 0;
  }

  return players.reduce((sum, player) => sum + player.fatigue.freshness, 0) / players.length;
}

function isPressingRole(role: PlayerRole): boolean {
  return (
    role === PlayerRole.MobileLock ||
    role === PlayerRole.SpaceHunter ||
    role === PlayerRole.PowerRunner ||
    role === PlayerRole.ForwardLeader
  );
}

function isStructureRole(role: PlayerRole): boolean {
  return (
    role === PlayerRole.LeftAnchor ||
    role === PlayerRole.RightAnchor ||
    role === PlayerRole.FreeSafety ||
    role === PlayerRole.MobileLock
  );
}

function getCentralCoverZone(targetZone: ZoneId): ZoneId {
  const target = getZoneParts(targetZone);

  return createZoneId(target.longitudinalZone, LateralCorridor.CentralAxis);
}

function getDepthCoverZone(direction: AttackingDirection): ZoneId {
  return direction === AttackingDirection.Z1ToZ7
    ? createZoneId(LongitudinalZone.FinishingZone, LateralCorridor.CentralAxis)
    : createZoneId(LongitudinalZone.DeepDefense, LateralCorridor.CentralAxis);
}

function classifyPlayer(input: {
  readonly player: PlayerState;
  readonly overcommitRisk: number;
  readonly bypassDistance: number;
  readonly centralCoverZone: ZoneId;
  readonly depthCoverZone: ZoneId;
}): PlayerStructuralParticipation {
  if (input.player.role === PlayerRole.MobileLock) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.Covering,
      zone: input.centralCoverZone,
      reason: "covering central lane to slow the transition",
    };
  }

  if (input.player.role === PlayerRole.FreeSafety) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.Covering,
      zone: input.depthCoverZone,
      reason: "protecting depth behind the block",
    };
  }

  if (input.bypassDistance >= 2 && isPressingRole(input.player.role)) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.Eliminated,
      zone: input.player.currentZone,
      reason: "bypassed by the target beyond the pressing line",
    };
  }

  if (input.overcommitRisk >= 62 && isPressingRole(input.player.role)) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.Delayed,
      zone: input.player.currentZone,
      reason: "delayed after overcommitting to the press",
    };
  }

  if (input.player.fatigue.freshness < 62 && !isStructureRole(input.player.role)) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.Recovering,
      zone: input.player.currentZone,
      reason: "recovering with reduced freshness",
    };
  }

  if (isStructureRole(input.player.role)) {
    return {
      role: input.player.role,
      state: PlayerStructuralState.InStructure,
      zone: input.player.currentZone,
      reason: "still connected to the defensive block",
    };
  }

  return {
    role: input.player.role,
    state: PlayerStructuralState.Recovering,
    zone: input.player.currentZone,
    reason: "tracking back into the block",
  };
}

function countState(
  players: readonly PlayerStructuralParticipation[],
  state: PlayerStructuralState,
): number {
  return players.filter((player) => player.state === state).length;
}

export function evaluateDefensiveParticipation(
  input: DefensiveParticipationInput,
): DefensiveParticipationEvaluation {
  const active = getZoneParts(input.ballLocation);
  const target = getZoneParts(input.targetZone);
  const bypassDistance = Math.max(
    0,
    getDirectionalDistance(active.longitudinalZone, target.longitudinalZone, input.attackingDirection),
  );
  const pressingIntensity = input.defensiveTeam.tacticalInstructions.defensive.pressingIntensity;
  const averageFreshness = getAverageFreshness(input.defensiveTeam.players);
  const overcommitRisk = clampRating(
    pressingIntensity * 0.38 +
      (100 - input.defensiveCompactness.overallCompactness) * 0.24 +
      (100 - input.defensiveTeam.collectiveProperties.tacticalDiscipline) * 0.18 +
      bypassDistance * 12 +
      (100 - averageFreshness) * 0.1,
  );
  const centralCoverZone = getCentralCoverZone(input.targetZone);
  const depthCoverZone = getDepthCoverZone(input.attackingDirection);
  const players = input.defensiveTeam.players.map((player) =>
    classifyPlayer({
      player,
      overcommitRisk,
      bypassDistance,
      centralCoverZone,
      depthCoverZone,
    }),
  );
  const delayed = countState(players, PlayerStructuralState.Delayed);
  const eliminated = countState(players, PlayerStructuralState.Eliminated);
  const recovering = countState(players, PlayerStructuralState.Recovering);
  const covering = countState(players, PlayerStructuralState.Covering);
  const inStructure = countState(players, PlayerStructuralState.InStructure);
  const centralCover = players.find(
    (player) => player.state === PlayerStructuralState.Covering && player.zone === centralCoverZone,
  );
  const depthCover = players.find(
    (player) => player.state === PlayerStructuralState.Covering && player.zone === depthCoverZone,
  );
  const delayedDefenders = delayed + eliminated;
  const structuralRecoveryScore = clampRating(
    input.defensiveTeam.collectiveProperties.defensiveTransition * 0.24 +
      input.defensiveTeam.collectiveProperties.collectiveMobility * 0.18 +
      input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.18 +
      input.defensiveCompactness.overallCompactness * 0.16 +
      covering * 8 +
      inStructure * 3 -
      delayed * 8 -
      eliminated * 12,
  );

  return {
    counts: {
      inStructure,
      recovering,
      delayed,
      eliminated,
      covering,
    },
    players,
    delayedDefenders,
    coveringDefenders: covering,
    eliminatedDefenders: eliminated,
    structuralRecoveryScore,
    centralCoverRole: centralCover?.role ?? null,
    depthCoverRole: depthCover?.role ?? null,
    explanation:
      delayedDefenders > 0
        ? `${delayedDefenders} defenders are late after pressure around ${input.activeZone}`
        : "defensive block remains mostly connected",
    coveringZones: players
      .filter((player) => player.state === PlayerStructuralState.Covering)
      .map((player) => player.zone),
  };
}
