import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole, type PlayerState } from "../../models/player";
import { TacticalStyle } from "../../models/tactics";
import { evaluateGoalkeeperGuardrail } from "../positioning";
import type { ReceptionQualityEvaluation } from "../spatial/receptionQuality";

export interface RecycleReceiverSelection {
  readonly receiverId: string | null;
  readonly receiverRole: PlayerRole | null;
  readonly receiverInitials: string | null;
  readonly score: number;
  readonly reason: string;
}

function roleSuitability(role: PlayerRole): number {
  switch (role) {
    case PlayerRole.MobileLock:
      return 30;
    case PlayerRole.Pivot:
      return 28;
    case PlayerRole.Playmaker:
      return 22;
    case PlayerRole.HookLink:
      return 18;
    case PlayerRole.RightPiston:
    case PlayerRole.LeftPiston:
      return 16;
    case PlayerRole.GoalkeeperFreeSafety:
      return -24;
    default:
      return 8;
  }
}

function initials(player: PlayerState): string {
  return player.roleInitials ?? player.role;
}

function receptionValue(input: {
  readonly player: PlayerState;
  readonly evaluations?: readonly ReceptionQualityEvaluation[];
}): number {
  const evaluation = input.evaluations?.find((candidate) => candidate.playerId === input.player.id);
  if (evaluation === undefined) {
    return 55;
  }

  return Math.round(evaluation.retentionValue * 0.34 + evaluation.nextActionValue * 0.4 + (100 - evaluation.turnoverRisk) * 0.26);
}

export function selectRecycleReceiver(input: {
  readonly players: readonly PlayerState[];
  readonly teamId: TeamId;
  readonly targetZone: ZoneId;
  readonly currentCarrierRole: PlayerRole;
  readonly tacticalStyle: TacticalStyle;
  readonly receptionEvaluations?: readonly ReceptionQualityEvaluation[];
}): RecycleReceiverSelection {
  const exactCandidates = input.players.filter(
    (player) => player.currentZone === input.targetZone && player.role !== input.currentCarrierRole,
  );
  const fallbackCandidates = input.players.filter((player) =>
    [PlayerRole.MobileLock, PlayerRole.Pivot, PlayerRole.Playmaker, PlayerRole.HookLink, PlayerRole.GoalkeeperFreeSafety].includes(
      player.role,
    ),
  );
  const candidates = exactCandidates.length > 0 ? exactCandidates : fallbackCandidates;

  const ranked = candidates
    .map((player) => {
      const guardrail =
        player.role === PlayerRole.GoalkeeperFreeSafety
          ? evaluateGoalkeeperGuardrail({
              teamId: input.teamId,
              actualZone: input.targetZone,
            })
          : null;
      const goalkeeperPenalty = guardrail?.status === "CORRECTED" ? 42 : 0;
      const nonExactPenalty = player.currentZone === input.targetZone ? 0 : 12;
      const styleBonus =
        input.tacticalStyle === TacticalStyle.Control &&
        (player.role === PlayerRole.MobileLock || player.role === PlayerRole.Pivot)
          ? 10
          : 0;

      return {
        player,
        score:
          receptionValue({
            player,
            ...(input.receptionEvaluations === undefined ? {} : { evaluations: input.receptionEvaluations }),
          }) +
          roleSuitability(player.role) +
          styleBonus -
          goalkeeperPenalty -
          nonExactPenalty,
        guardrail,
      };
    })
    .sort((left, right) => right.score - left.score || initials(left.player).localeCompare(initials(right.player)));
  const selected = ranked[0];

  if (selected === undefined) {
    return {
      receiverId: null,
      receiverRole: null,
      receiverInitials: null,
      score: 0,
      reason: "no recycle receiver available",
    };
  }

  const goalkeeperNote =
    selected.player.role === PlayerRole.GoalkeeperFreeSafety
      ? "goalkeeper selected because no safer field support receiver exists"
      : "field support receiver preferred over goalkeeper";

  return {
    receiverId: selected.player.id,
    receiverRole: selected.player.role,
    receiverInitials: initials(selected.player),
    score: Math.round(selected.score),
    reason: `${initials(selected.player)} selected for recycle: ${goalkeeperNote}; role fit and next-action value outrank alternatives`,
  };
}
