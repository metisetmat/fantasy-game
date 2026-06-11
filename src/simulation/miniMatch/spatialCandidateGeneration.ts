import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext, SpatialPlayerContext } from "../spatialContext";

export type SpatialRouteCandidate = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly laneState: "OPEN" | "CONTESTED" | "CLOSED";
  readonly availability: "AVAILABLE" | "NOT_AVAILABLE_NOW";
  readonly baseScore: number;
  readonly source: "workbench_ranked_option" | "spatial_player_option" | "prototype_mapped_option";
  readonly reason: string;
};

function possessionPlayers(context: SpatialMatchContext): readonly SpatialPlayerContext[] {
  return context.possessionTeamId === context.home.teamId ? context.home.players : context.away.players;
}

function laneStateFromOption(laneState: string | undefined): "OPEN" | "CONTESTED" | "CLOSED" {
  if (laneState === "OPEN" || laneState === "CONTESTED" || laneState === "CLOSED") {
    return laneState;
  }

  return "CONTESTED";
}

function candidateScoreForPlayer(player: SpatialPlayerContext, index: number): number {
  const handPlay = player.attributes.handPlay ?? 60;
  const intelligence = player.attributes.intelligence ?? 60;
  const condition = player.currentCondition;

  return Math.max(20, Math.min(92, Math.round((handPlay + intelligence + condition) / 3) - index * 3));
}

export function generateSpatialRouteCandidates(input: {
  readonly spatialContext: SpatialMatchContext;
  readonly possessionTeamId: TeamId;
  readonly ballCarrierId: PlayerId;
  readonly ballZone: ZoneId;
  readonly pressureLevel: string;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly prototypeCandidates?: readonly SpatialRouteCandidate[];
}): readonly SpatialRouteCandidate[] {
  const workbench = input.workbench;

  if (workbench !== undefined && workbench.rankedOptions.length > 0) {
    return workbench.rankedOptions.map((option) => ({
      candidateId: `workbench-rank-${option.rank}`,
      actionType: option.actionType,
      actorId: workbench.selectedAction.actorId as PlayerId,
      ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
      teamId: workbench.possessionTeamId as TeamId,
      fromZone: workbench.selectedAction.fromZone as ZoneId,
      targetZone: option.targetZone as ZoneId,
      laneState: laneStateFromOption(option.laneState),
      availability: "AVAILABLE",
      baseScore: option.finalSelectionScore ?? option.score ?? 50,
      source: "workbench_ranked_option",
      reason: `Mapped from workbench ranked option ${option.rank}.`,
    }));
  }

  const players = possessionPlayers(input.spatialContext);
  const actor = players.find((player) => player.playerId === input.ballCarrierId);
  const receivers = players
    .filter((player) => player.playerId !== input.ballCarrierId && !player.isGoalkeeper)
    .slice(0, 4);

  if (actor === undefined || receivers.length === 0) {
    return input.prototypeCandidates ?? [];
  }

  const candidates = receivers.map((receiver, index): SpatialRouteCandidate => {
    const actionType = index === 0
      ? "SUPPORT_CLUSTER_RECYCLE"
      : receiver.tacticalFunctions.includes("weak_side_runner")
        ? "WEAK_SIDE_SWITCH"
        : index === 1
          ? "FORWARD_PROGRESS"
          : "SAFE_RECYCLE";

    return {
      candidateId: `spatial-${actionType.toLowerCase()}-${receiver.playerId}`,
      actionType,
      actorId: actor.playerId,
      receiverId: receiver.playerId,
      teamId: actor.teamId,
      fromZone: input.ballZone,
      targetZone: receiver.zone,
      laneState: input.pressureLevel === "HIGH" && index > 2 ? "CONTESTED" : "OPEN",
      availability: "AVAILABLE",
      baseScore: candidateScoreForPlayer(receiver, index),
      source: "spatial_player_option",
      reason: `Generated from ${receiver.displayRole} support option in ${receiver.zone}.`,
    };
  });

  return [
    ...candidates,
    ...(input.prototypeCandidates ?? []),
  ];
}
