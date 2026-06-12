import type { MatchInput, PlayerSnapshot, TeamSnapshot } from "../../contracts/engineToCoach";
import { BLITZ_ROSTER } from "../../data/teams/blitzRoster";
import { CONTROL_ROSTER } from "../../data/teams/controlRoster";
import { toLegacyPlayerAttributes } from "../../systems/players/visibleAttributes";

export type GoalkeeperResponseAttributes = {
  readonly goalkeeperId?: string;
  readonly role?: string;
  readonly positioningScore: number;
  readonly trajectoryReadingScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly warnings: readonly string[];
};

function bounded(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 50;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function playerFromTeam(team: TeamSnapshot, playerId: string | undefined): PlayerSnapshot | undefined {
  if (playerId === undefined) {
    return undefined;
  }

  return team.roster.find((player) => player.playerId === playerId);
}

function prototypePlayerFromId(playerId: string | undefined): PlayerSnapshot | undefined {
  const controlPlayer = CONTROL_ROSTER.find((player) => player.id === playerId);
  const blitzPlayer = BLITZ_ROSTER.find((player) => player.id === playerId);
  const player = controlPlayer ?? blitzPlayer;

  if (player === undefined) {
    return undefined;
  }

  return {
    playerId: player.id,
    name: player.displayName,
    role: player.role,
    attributes: toLegacyPlayerAttributes(player.visibleAttributes),
    traits: [],
    currentCondition: player.id.startsWith("control-") ? 88 : 82,
    mentalFreshness: player.id.startsWith("control-") ? 86 : 78,
  };
}

function playerFromMatch(input: MatchInput, playerId: string | undefined): PlayerSnapshot | undefined {
  return playerFromTeam(input.homeTeam, playerId) ?? playerFromTeam(input.awayTeam, playerId) ?? prototypePlayerFromId(playerId);
}

function neutralAttributes(goalkeeperId: string | undefined): GoalkeeperResponseAttributes {
  return {
    ...(goalkeeperId === undefined ? {} : { goalkeeperId }),
    positioningScore: 50,
    trajectoryReadingScore: 50,
    reactionScore: 50,
    handlingScore: 50,
    reboundControlScore: 50,
    concentrationScore: 50,
    mentalFatigueImpact: 15,
    warnings: ["GOALKEEPER_RESPONSE_ATTRIBUTE_FALLBACK_USED"],
  };
}

export function extractGoalkeeperResponseAttributes(input: {
  readonly goalkeeperId?: string;
  readonly matchInput: MatchInput;
}): GoalkeeperResponseAttributes {
  const player = playerFromMatch(input.matchInput, input.goalkeeperId);

  if (player === undefined) {
    return neutralAttributes(input.goalkeeperId);
  }

  const reactionScore = bounded(
    average([player.attributes.speed, player.attributes.agility, player.attributes.mental]),
    0,
    100,
  );
  const positioningScore = bounded(average([player.attributes.intelligence, player.attributes.mental]), 0, 100);
  const trajectoryReadingScore = bounded(
    average([player.attributes.intelligence, player.attributes.agility, player.attributes.mental]),
    0,
    100,
  );
  const handlingScore = bounded(player.attributes.handPlay, 0, 100);
  const reboundControlScore = bounded(average([player.attributes.handPlay, player.attributes.mental]), 0, 100);
  const concentrationScore = bounded(player.attributes.mental, 0, 100);
  const conditionFatigue = Math.max(0, 100 - player.currentCondition) * 0.08;
  const mentalFatigue = Math.max(0, 100 - player.mentalFreshness) * 0.28;

  return {
    goalkeeperId: player.playerId,
    role: player.role,
    positioningScore,
    trajectoryReadingScore,
    reactionScore,
    handlingScore,
    reboundControlScore,
    concentrationScore,
    mentalFatigueImpact: bounded(conditionFatigue + mentalFatigue, 0, 25),
    warnings: [],
  };
}
