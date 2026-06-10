import { LateralCorridor } from "../../core/zones";
import { ReceiverStatus, RecoveryStatus, SupportStatus, type PlayerDerivedNumericalPressure, type PlayerDerivedTeamState, type PlayerMatchState } from "./types";

function clampRating(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function deriveTeamStateFromPlayers(players: readonly PlayerMatchState[]): PlayerDerivedTeamState {
  const relevantPlayers = players.filter((player) => player.isRelevantToBall);
  const availableReceivers = players.filter((player) => player.isAvailableReceiver);
  const delayedPlayers = players.filter((player) => player.recoveryStatus === RecoveryStatus.Delayed);
  const recoveringPlayers = players.filter((player) => player.recoveryStatus === RecoveryStatus.Recovering);
  const eliminatedPlayers = players.filter((player) => player.recoveryStatus === RecoveryStatus.Eliminated);
  const occupiedCorridors = new Set(players.map((player) => player.lane)).size;
  const centralPlayers = players.filter((player) => player.lane === LateralCorridor.CentralAxis).length;
  const connectedSupport = players.filter((player) =>
    player.supportStatus === SupportStatus.Connected ||
    player.supportStatus === SupportStatus.ThirdMan ||
    player.supportStatus === SupportStatus.PodSupport,
  ).length;

  return {
    compactness: clampRating(centralPlayers * 8 + (5 - occupiedCorridors) * 12 + relevantPlayers.length * 3),
    supportQuality: clampRating(availableReceivers.length * 14 + connectedSupport * 8),
    recoveryLoad: clampRating(delayedPlayers.length * 18 + recoveringPlayers.length * 10 + eliminatedPlayers.length * 24),
    restDefenseCount: players.filter((player) => player.isGoalSide).length,
    corridorOccupation: occupiedCorridors,
    relevantPlayers,
    availableReceivers,
    delayedPlayers,
    recoveringPlayers,
    eliminatedPlayers,
  };
}

export function deriveNumericalPressureFromPlayers(input: {
  readonly attackingPlayers: readonly PlayerMatchState[];
  readonly defendingPlayers: readonly PlayerMatchState[];
}): PlayerDerivedNumericalPressure {
  const attackersNearBall = input.attackingPlayers.filter((player) => player.isRelevantToBall);
  const defendersGoalSide = input.defendingPlayers.filter((player) => player.isGoalSide && !player.isEliminated);
  const delayedDefenders = input.defendingPlayers.filter((player) => player.isDelayed || player.isEliminated);
  const bypassedDefenders = input.defendingPlayers.filter((player) => player.isEliminated);
  const supportPlayers = input.attackingPlayers.filter((player) =>
    player.supportStatus === SupportStatus.Connected ||
    player.supportStatus === SupportStatus.ThirdMan ||
    player.supportStatus === SupportStatus.PodSupport,
  );
  const margin = attackersNearBall.length - defendersGoalSide.length;

  return {
    attackersNearBall,
    defendersGoalSide,
    delayedDefenders,
    bypassedDefenders,
    supportPlayers,
    description:
      margin > 0
        ? `${attackersNearBall.length}v${defendersGoalSide.length} attacking advantage`
        : margin < 0
          ? `${attackersNearBall.length}v${defendersGoalSide.length} defensive numerical hold`
          : `${attackersNearBall.length}v${defendersGoalSide.length} balanced numerical pressure`,
  };
}
