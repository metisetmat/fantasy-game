import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { SpatialMatchContext } from "../spatialContext";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

export type PrototypeRouteCandidateContext = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly baseScore: number;
  readonly targetZone?: ZoneId;
  readonly receiverId?: PlayerId;
};

export type PrototypeToSpatialCandidateMappingResult = {
  readonly candidates: readonly SpatialRouteCandidate[];
  readonly lossyMappings: readonly string[];
};

function possessionPlayers(context: SpatialMatchContext) {
  return context.possessionTeamId === context.home.teamId ? context.home.players : context.away.players;
}

export function mapPrototypeToSpatialCandidates(input: {
  readonly spatialContext?: SpatialMatchContext;
  readonly currentBallCarrierId: PlayerId;
  readonly currentBallZone: ZoneId;
  readonly currentPossessionTeamId: TeamId;
  readonly prototypeCandidates?: readonly PrototypeRouteCandidateContext[];
}): PrototypeToSpatialCandidateMappingResult {
  const prototypeCandidates = input.prototypeCandidates ?? [
    {
      candidateId: "prototype-current-route",
      actionType: "SUPPORT_CLUSTER_RECYCLE",
      baseScore: 55,
      targetZone: input.currentBallZone,
    },
  ];

  if (input.spatialContext === undefined) {
    return {
      candidates: prototypeCandidates.map((candidate): SpatialRouteCandidate => ({
        candidateId: candidate.candidateId,
        actionType: candidate.actionType,
        actorId: input.currentBallCarrierId,
        ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
        teamId: input.currentPossessionTeamId,
        fromZone: input.currentBallZone,
        targetZone: candidate.targetZone ?? input.currentBallZone,
        laneState: "CONTESTED",
        availability: "AVAILABLE",
        baseScore: candidate.baseScore,
        source: "prototype_mapped_option",
        reason: "Mapped from current prototype route context without trusted spatial possession context.",
      })),
      lossyMappings: ["No SpatialMatchContext available; prototype route remains fallback only."],
    };
  }

  const players = possessionPlayers(input.spatialContext);
  const actor = players.find((player) => player.playerId === input.currentBallCarrierId);
  const fallbackReceiver = players.find((player) => player.playerId !== input.currentBallCarrierId && !player.isGoalkeeper);
  const lossyMappings: string[] = [];

  if (actor === undefined) {
    return {
      candidates: [],
      lossyMappings: ["Prototype route actor could not be resolved in SpatialMatchContext."],
    };
  }

  const candidates = prototypeCandidates.map((candidate): SpatialRouteCandidate => {
    if (candidate.receiverId === undefined && fallbackReceiver === undefined) {
      lossyMappings.push(`${candidate.candidateId} has no receiver and no spatial fallback receiver.`);
    }

    return {
      candidateId: candidate.candidateId,
      actionType: candidate.actionType,
      actorId: actor.playerId,
      ...(candidate.receiverId === undefined && fallbackReceiver === undefined
        ? {}
        : { receiverId: (candidate.receiverId ?? fallbackReceiver?.playerId) as PlayerId }),
      teamId: actor.teamId,
      fromZone: input.currentBallZone,
      targetZone: candidate.targetZone ?? fallbackReceiver?.zone ?? input.currentBallZone,
      laneState: "CONTESTED",
      availability: "AVAILABLE",
      baseScore: candidate.baseScore,
      source: "prototype_mapped_option",
      reason: "Mapped from current prototype route context for guarded spatial comparison.",
    };
  });

  return {
    candidates,
    lossyMappings,
  };
}
