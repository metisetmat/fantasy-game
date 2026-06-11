import type { PlayerId, TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import type { SpatialMatchContext, SpatialPlayerContext } from "../../spatialContext";
import type { RouteCandidateInput } from "../applySpatialAttributeInfluenceToCandidates";

function player(input: {
  readonly playerId: PlayerId;
  readonly speed: number;
  readonly handPlay: number;
  readonly intelligence: number;
  readonly mental: number;
  readonly condition: number;
  readonly freshness: number;
}): SpatialPlayerContext {
  return {
    playerId: input.playerId,
    teamId: "control",
    role: "contrast_role",
    displayRole: "Contrast Role",
    zone: "Z4-HSL",
    isStarter: true,
    isGoalkeeper: false,
    isBallCarrier: input.playerId === "contrast-actor",
    currentCondition: input.condition,
    mentalFreshness: input.freshness,
    attributes: {
      speed: input.speed,
      power: 74,
      endurance: 78,
      handPlay: input.handPlay,
      footPlayDribble: input.speed,
      footPlayPassingShooting: 72,
      intelligence: input.intelligence,
      mental: input.mental,
    },
    tacticalFunctions: input.playerId === "elite-runner" ? ["weak_side_runner"] : ["support_balance"],
  };
}

export const attributeRankingContrastSpatialContext: SpatialMatchContext = {
  matchId: "attribute-ranking-contrast",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "contrast-actor",
  ballZone: "Z4-HSL",
  attackingDirection: "LEFT_TO_RIGHT",
  sourceWorkbenchFrameId: "attribute-ranking-contrast",
  home: {
    teamId: "control",
    name: "CONTROL",
    goalkeeperId: "contrast-gk",
    starters: ["contrast-actor", "safe-receiver", "elite-runner", "contrast-gk"],
    activePlayerIds: ["contrast-actor", "safe-receiver", "elite-runner", "contrast-gk"],
    shapeSource: "team_snapshot_default",
    tacticalPlanSummary: "contrast fixture",
    knownLimitations: [],
    players: [
      player({
        playerId: "contrast-actor",
        speed: 72,
        handPlay: 84,
        intelligence: 86,
        mental: 84,
        condition: 90,
        freshness: 90,
      }),
      player({
        playerId: "safe-receiver",
        speed: 54,
        handPlay: 54,
        intelligence: 55,
        mental: 55,
        condition: 72,
        freshness: 70,
      }),
      player({
        playerId: "elite-runner",
        speed: 96,
        handPlay: 82,
        intelligence: 90,
        mental: 88,
        condition: 94,
        freshness: 94,
      }),
      {
        ...player({
          playerId: "contrast-gk",
          speed: 50,
          handPlay: 88,
          intelligence: 80,
          mental: 84,
          condition: 92,
          freshness: 92,
        }),
        isGoalkeeper: true,
      },
    ],
  },
  away: {
    teamId: "blitz",
    name: "BLITZ",
    goalkeeperId: "blitz-gk",
    starters: ["blitz-gk"],
    activePlayerIds: ["blitz-gk"],
    shapeSource: "team_snapshot_default",
    tacticalPlanSummary: "contrast fixture",
    knownLimitations: [],
    players: [],
  },
};

export function legalContrastCandidates(): readonly RouteCandidateInput[] {
  return [
    {
      candidateId: "safe-recycle",
      actorId: "contrast-actor",
      receiverId: "safe-receiver",
      teamId: "control" as TeamId,
      fromZone: "Z4-HSL" as ZoneId,
      targetZone: "Z3-C" as ZoneId,
      actionType: "SUPPORT_CLUSTER_RECYCLE",
      laneState: "CONTESTED",
      baseScore: 80,
      baseRisk: 25,
    },
    {
      candidateId: "elite-weak-side",
      actorId: "contrast-actor",
      receiverId: "elite-runner",
      teamId: "control" as TeamId,
      fromZone: "Z4-HSL" as ZoneId,
      targetZone: "Z5-HSR" as ZoneId,
      actionType: "WEAK_SIDE_SWITCH",
      laneState: "OPEN",
      baseScore: 77,
      baseRisk: 35,
    },
  ];
}

export function closedLaneContrastCandidates(): readonly RouteCandidateInput[] {
  return legalContrastCandidates().map((candidate) =>
    candidate.candidateId === "elite-weak-side"
      ? { ...candidate, laneState: "CLOSED" }
      : candidate,
  );
}

export function unavailableContrastCandidates(): readonly (RouteCandidateInput & { readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW" })[] {
  return legalContrastCandidates().map((candidate) =>
    candidate.candidateId === "elite-weak-side"
      ? { ...candidate, availability: "NOT_AVAILABLE_NOW" }
      : candidate,
  );
}
