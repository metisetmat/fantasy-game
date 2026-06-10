import { RecoveryStatus, SupportStatus, TacticalStatus, type PlayerMatchState } from "./types";

export function updatePlayerMatchState(
  player: PlayerMatchState,
  patch: Partial<Pick<PlayerMatchState, "zone" | "hasBall" | "tacticalStatus" | "supportStatus" | "recoveryStatus">>,
): PlayerMatchState {
  const recoveryStatus = patch.recoveryStatus ?? player.recoveryStatus;

  return {
    ...player,
    ...patch,
    recoveryStatus,
    isDelayed: recoveryStatus === RecoveryStatus.Delayed,
    isEliminated: recoveryStatus === RecoveryStatus.Eliminated,
    isRecovering: recoveryStatus === RecoveryStatus.Recovering,
    tacticalStatus: patch.tacticalStatus ?? player.tacticalStatus,
    supportStatus: patch.supportStatus ?? player.supportStatus,
  };
}

export function markContestedReceiver(player: PlayerMatchState): PlayerMatchState {
  return updatePlayerMatchState(player, {
    tacticalStatus: TacticalStatus.Contesting,
    supportStatus: player.supportStatus === SupportStatus.Connected ? SupportStatus.ThirdMan : player.supportStatus,
  });
}
