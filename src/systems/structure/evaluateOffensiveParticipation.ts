import { PlayerRole } from "../../models/player";
import type { SpatialTeamContext } from "../spatial";
import type { OffensiveParticipationEvaluation } from "./types";

export function evaluateOffensiveParticipation(team: SpatialTeamContext): OffensiveParticipationEvaluation {
  const projectingPlayers = team.players.filter((player) =>
    [PlayerRole.SpaceHunter, PlayerRole.PowerRunner, PlayerRole.ForwardLeader].includes(player.role),
  ).length;
  const supportingPlayers = team.players.filter((player) =>
    [PlayerRole.HookLink, PlayerRole.TempoHalf, PlayerRole.Playmaker].includes(player.role),
  ).length;
  const conservativeSupport = team.tacticalInstructions.offensive.collectiveness >= 70 &&
    team.tacticalInstructions.offensive.riskLevel <= 45;

  return {
    projectingPlayers,
    supportingPlayers,
    conservativeSupport,
    explanation: conservativeSupport
      ? "support structure favors control over immediate vertical attack"
      : "support structure can sustain a transition wave",
  };
}
