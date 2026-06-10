import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import { TacticalStyle } from "../../models/tactics";
import type { PlayerMatchState } from "../players";
import type { ReceptionFollowUpRole, ReceptionQualityLevel } from "../spatial/receptionQuality";

export enum BallTransferType {
  HandPass = "HAND_PASS",
  FootPass = "FOOT_PASS",
  KickPass = "KICK_PASS",
  Carry = "CARRY",
  LooseBall = "LOOSE_BALL",
}

export enum BallControlResult {
  CleanControl = "CLEAN_CONTROL",
  ControlUnderPressure = "CONTROL_UNDER_PRESSURE",
  BobbledControl = "BOBBLED_CONTROL",
  Loose = "LOOSE",
  Turnover = "TURNOVER",
}

export interface BallTransferResult {
  readonly previousCarrierId: string;
  readonly newCarrierId: string | null;
  readonly ballFromZone: ZoneId;
  readonly ballToZone: ZoneId;
  readonly transferType: BallTransferType;
  readonly receptionQuality: ReceptionQualityLevel | null;
  readonly followUpRole: ReceptionFollowUpRole | null;
  readonly controlResult: BallControlResult;
  readonly nextActionWindowTicks: number;
  readonly explanation: string;
}

function chooseClusterReceiver(input: {
  readonly candidates: readonly PlayerMatchState[];
  readonly targetZone: ZoneId;
  readonly teamStyle: TacticalStyle;
}): PlayerMatchState | null {
  const targetCandidates = input.candidates.filter((player) => player.zone === input.targetZone);
  const available = targetCandidates.length > 0 ? targetCandidates : input.candidates;

  return (
    available
      .map((player) => {
        const roleScore =
          player.role === PlayerRole.MobileLock
            ? 36
            : player.role === PlayerRole.Pivot
              ? 34
              : player.role === PlayerRole.Playmaker
                ? 26
                : player.role === PlayerRole.GoalkeeperFreeSafety
                  ? -30
                  : 14;
        const styleScore =
          input.teamStyle === TacticalStyle.Control && (player.role === PlayerRole.MobileLock || player.role === PlayerRole.Pivot)
            ? 10
            : 0;

        return {
          player,
          score: roleScore + styleScore + Math.round((player.visibleAttributes?.composure ?? 60) * 0.12),
        };
      })
      .sort((left, right) => right.score - left.score || left.player.roleInitials.localeCompare(right.player.roleInitials))[0]?.player ?? null
  );
}

export function resolveBallTransfer(input: {
  readonly players: readonly PlayerMatchState[];
  readonly previousCarrier: PlayerMatchState;
  readonly targetZone: ZoneId;
  readonly transferType: BallTransferType;
  readonly teamStyle: TacticalStyle;
  readonly receptionQuality: ReceptionQualityLevel | null;
  readonly followUpRole: ReceptionFollowUpRole | null;
  readonly turnoverRisk: number;
}): BallTransferResult {
  if (input.transferType === BallTransferType.Carry) {
    return {
      previousCarrierId: input.previousCarrier.playerId,
      newCarrierId: input.previousCarrier.playerId,
      ballFromZone: input.previousCarrier.zone,
      ballToZone: input.targetZone,
      transferType: input.transferType,
      receptionQuality: input.receptionQuality,
      followUpRole: input.followUpRole,
      controlResult: BallControlResult.CleanControl,
      nextActionWindowTicks: 2,
      explanation: "carry keeps the same ball carrier",
    };
  }

  const receiver = chooseClusterReceiver({
    candidates: input.players.filter((player) => player.teamId === input.previousCarrier.teamId && player.playerId !== input.previousCarrier.playerId),
    targetZone: input.targetZone,
    teamStyle: input.teamStyle,
  });
  const controlResult =
    input.turnoverRisk >= 76
      ? BallControlResult.Loose
      : input.turnoverRisk >= 58
        ? BallControlResult.BobbledControl
        : input.turnoverRisk >= 38
          ? BallControlResult.ControlUnderPressure
          : BallControlResult.CleanControl;

  return {
    previousCarrierId: input.previousCarrier.playerId,
    newCarrierId: controlResult === BallControlResult.Loose ? null : receiver?.playerId ?? null,
    ballFromZone: input.previousCarrier.zone,
    ballToZone: input.targetZone,
    transferType: input.transferType,
    receptionQuality: input.receptionQuality,
    followUpRole: input.followUpRole,
    controlResult,
    nextActionWindowTicks: controlResult === BallControlResult.CleanControl ? 3 : 1,
    explanation:
      receiver === null
        ? "no receiver controls the transfer"
        : `${receiver.roleInitials} becomes the ball carrier after the recycle; ${input.previousCarrier.roleInitials} becomes support`,
  };
}
