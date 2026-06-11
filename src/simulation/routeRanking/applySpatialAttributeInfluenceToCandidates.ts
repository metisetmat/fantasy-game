import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { SpatialMatchContext, SpatialPlayerContext } from "../spatialContext";
import { applyRouteAttributeInfluence, buildRouteAttributeInfluences } from "./routeAttributeInfluence";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";

export type RouteCandidateInput = {
  readonly candidateId: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly actionType: string;
  readonly laneState?: string;
  readonly baseScore: number;
  readonly baseRisk?: number;
};

function spatialPlayers(context: SpatialMatchContext): readonly SpatialPlayerContext[] {
  return [...context.home.players, ...context.away.players];
}

function findPlayer(
  players: readonly SpatialPlayerContext[],
  playerId: PlayerId | undefined,
): SpatialPlayerContext | undefined {
  return playerId === undefined ? undefined : players.find((player) => player.playerId === playerId);
}

export function applySpatialAttributeInfluenceToCandidates(input: {
  readonly spatialContext?: SpatialMatchContext;
  readonly candidates: readonly RouteCandidateInput[];
  readonly pressureLevel?: string;
}): readonly RouteCandidateAttributeContext[] {
  if (input.spatialContext === undefined) {
    return input.candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      baseScore: candidate.baseScore,
      attributeInfluences: [],
      attributeAdjustedScore: candidate.baseScore,
    }));
  }

  const players = spatialPlayers(input.spatialContext);

  return input.candidates.map((candidate) => {
    const actor = findPlayer(players, candidate.actorId);
    const receiver = findPlayer(players, candidate.receiverId);

    if (actor === undefined) {
      return {
        candidateId: candidate.candidateId,
        actorId: candidate.actorId,
        ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
        teamId: candidate.teamId,
        fromZone: candidate.fromZone,
        targetZone: candidate.targetZone,
        actionType: candidate.actionType,
        ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
        baseScore: candidate.baseScore,
        attributeInfluences: [],
        attributeAdjustedScore: candidate.baseScore,
      };
    }

    const influences = buildRouteAttributeInfluences({
      actor,
      ...(receiver === undefined ? {} : { receiver }),
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      ...(input.pressureLevel === undefined ? {} : { pressureLevel: input.pressureLevel }),
      ...(candidate.baseRisk === undefined ? {} : { baseRisk: candidate.baseRisk }),
    });

    return {
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      baseScore: candidate.baseScore,
      attributeInfluences: influences,
      attributeAdjustedScore: applyRouteAttributeInfluence({
        baseScore: candidate.baseScore,
        influences,
      }),
    };
  });
}
