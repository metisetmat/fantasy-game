import type { MatchInput, PlayerSnapshot, TeamSnapshot } from "../../contracts/engineToCoach";
import { BLITZ_ROSTER } from "../../data/teams/blitzRoster";
import { CONTROL_ROSTER } from "../../data/teams/controlRoster";
import { toLegacyPlayerAttributes } from "../../systems/players/visibleAttributes";
import type {
  AttributeDrivenGoalkeeperSnapshot,
  AttributeDrivenShotPlayerSnapshot,
} from "./attributeDrivenShotResolutionSandbox";

function playerFromTeam(team: TeamSnapshot, playerId: string | undefined): PlayerSnapshot | undefined {
  if (playerId === undefined) {
    return undefined;
  }

  return team.roster.find((player) => player.playerId === playerId);
}

function playerFromMatch(input: MatchInput, playerId: string | undefined): PlayerSnapshot | undefined {
  return playerFromTeam(input.homeTeam, playerId) ?? playerFromTeam(input.awayTeam, playerId) ?? prototypePlayerFromId(playerId);
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

function prototypeTeamIdFromPlayerId(playerId: string | undefined): "control" | "blitz" | undefined {
  if (playerId?.startsWith("control-") === true) {
    return "control";
  }

  if (playerId?.startsWith("blitz-") === true) {
    return "blitz";
  }

  return undefined;
}

function prototypeGoalkeeperForTeam(teamId: "control" | "blitz"): PlayerSnapshot | undefined {
  return prototypePlayerFromId(`${teamId}-goalkeeper-free-safety`);
}

function teamForPlayer(input: MatchInput, playerId: string | undefined): TeamSnapshot | undefined {
  if (playerId === undefined) {
    return undefined;
  }

  if (input.homeTeam.roster.some((player) => player.playerId === playerId)) {
    return input.homeTeam;
  }

  if (input.awayTeam.roster.some((player) => player.playerId === playerId)) {
    return input.awayTeam;
  }

  return undefined;
}

function opponentTeam(input: MatchInput, team: TeamSnapshot | undefined): TeamSnapshot {
  if (team?.teamId === input.awayTeam.teamId) {
    return input.homeTeam;
  }

  return input.awayTeam;
}

function neutralShooterSnapshot(player: PlayerSnapshot | undefined): AttributeDrivenShotPlayerSnapshot {
  if (player === undefined) {
    return {
      shooting: 50,
      finishing: 50,
      decision: 50,
      composure: 50,
      currentCondition: 50,
      mentalFreshness: 50,
    };
  }

  return {
    playerId: player.playerId,
    role: player.role,
    shooting: player.attributes.footPlayPassingShooting,
    finishing: Math.round((player.attributes.footPlayPassingShooting + player.attributes.power) / 2),
    decision: player.attributes.intelligence,
    composure: player.attributes.mental,
    currentCondition: player.currentCondition,
    mentalFreshness: player.mentalFreshness,
  };
}

function neutralGoalkeeperSnapshot(player: PlayerSnapshot | undefined): AttributeDrivenGoalkeeperSnapshot {
  if (player === undefined) {
    return {
      reaction: 50,
      positioning: 50,
      handling: 50,
      concentration: 50,
      currentCondition: 50,
      mentalFreshness: 50,
      goalkeeperMentalFatigue: 50,
    };
  }

  return {
    playerId: player.playerId,
    role: player.role,
    reaction: Math.round((player.attributes.speed + player.attributes.agility + player.attributes.mental) / 3),
    positioning: Math.round((player.attributes.intelligence + player.attributes.mental) / 2),
    handling: player.attributes.handPlay,
    concentration: player.attributes.mental,
    currentCondition: player.currentCondition,
    mentalFreshness: player.mentalFreshness,
    goalkeeperMentalFatigue: Math.max(0, 100 - player.mentalFreshness),
  };
}

export function extractShotResolutionActors(input: {
  readonly matchInput: MatchInput;
  readonly receiverId?: string;
}): {
  readonly shooter: AttributeDrivenShotPlayerSnapshot;
  readonly goalkeeper: AttributeDrivenGoalkeeperSnapshot;
  readonly warnings: readonly string[];
} {
  const shooterPlayer = playerFromMatch(input.matchInput, input.receiverId);
  const shooterTeam = teamForPlayer(input.matchInput, input.receiverId);
  const prototypeShooterTeamId = prototypeTeamIdFromPlayerId(input.receiverId);
  const prototypeGoalkeeperTeamId = prototypeShooterTeamId === "control"
    ? "blitz"
    : prototypeShooterTeamId === "blitz"
      ? "control"
      : undefined;
  const goalkeeperTeam = opponentTeam(input.matchInput, shooterTeam);
  const goalkeeperPlayer =
    (prototypeGoalkeeperTeamId === undefined ? undefined : prototypeGoalkeeperForTeam(prototypeGoalkeeperTeamId)) ??
    playerFromTeam(goalkeeperTeam, goalkeeperTeam.goalkeeperId);
  const warnings = [
    ...(shooterPlayer === undefined ? ["ATTRIBUTE_DRIVEN_SHOT_SHOOTER_FALLBACK_USED"] : []),
    ...(goalkeeperPlayer === undefined ? ["ATTRIBUTE_DRIVEN_SHOT_GOALKEEPER_FALLBACK_USED"] : []),
  ];

  return {
    shooter: neutralShooterSnapshot(shooterPlayer),
    goalkeeper: neutralGoalkeeperSnapshot(goalkeeperPlayer),
    warnings,
  };
}
