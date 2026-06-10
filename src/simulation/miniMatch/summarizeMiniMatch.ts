import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { generateCoachingFeedback } from "../../reports/coaching";
import type { MiniMatchState, MiniMatchSummary, MiniMatchTeamCount } from "./types";

function getTeamCount(counts: MiniMatchTeamCount, team: "teamA" | "teamB"): number {
  return team === "teamA" ? counts.teamA : counts.teamB;
}

function countPressingSequences(state: MiniMatchState, team: PrototypeTeamDefinition): number {
  return state.records.filter((record) => record.setup.pressingTeam.teamId === team.id).length;
}

function createTeamObservation(
  state: MiniMatchState,
  team: PrototypeTeamDefinition,
  slot: "teamA" | "teamB",
): string {
  const opportunities = getTeamCount(state.finishingOpportunities, slot);
  const turnovers = getTeamCount(state.turnovers, slot);
  const pressingSequences = countPressingSequences(state, team);
  const scoredPoints = slot === "teamA" ? state.score.teamA : state.score.teamB;

  if (scoredPoints > 0 && opportunities > 0) {
    return `${team.displayName} converted pressure into points while still showing its ${team.identity} identity.`;
  }

  if (opportunities > 0) {
    return `${team.displayName} reached finishing positions but did not fully convert the pressure.`;
  }

  if (turnovers > 0) {
    return `${team.displayName} found danger through pressure recoveries and unstable possessions.`;
  }

  if (pressingSequences > 0) {
    return `${team.displayName} influenced the match mostly through pressure and structural disruption.`;
  }

  return `${team.displayName} had readable spells, but the mini-match did not expose a decisive edge yet.`;
}

function createAdaptationNotes(state: MiniMatchState): readonly string[] {
  return state.tacticalMemory.teams.flatMap((teamMemory) => {
    const teamName =
      teamMemory.teamId === state.context.teamA.id
        ? state.context.teamA.displayName
        : state.context.teamB.displayName;
    const strongestSuccess = [...teamMemory.entries].sort(
      (left, right) => right.successes - left.successes || right.attackingModifier - left.attackingModifier,
    )[0];
    const strongestFailure = [...teamMemory.entries].sort(
      (left, right) => right.failures - left.failures || left.attackingModifier - right.attackingModifier,
    )[0];
    const notes: string[] = [];

    if (strongestSuccess !== undefined && strongestSuccess.successes > 0) {
      notes.push(
        `${teamName} repeated ${strongestSuccess.pattern.moveType} on ${strongestSuccess.pattern.sideType} with growing confidence.`,
      );
    }

    if (strongestFailure !== undefined && strongestFailure.failures > 0) {
      notes.push(
        `${teamName} became less attracted to ${strongestFailure.pattern.moveType} after recent failure.`,
      );
    }

    return notes.slice(0, 1);
  });
}

export function summarizeMiniMatch(state: MiniMatchState): MiniMatchSummary {
  return {
    finalScore: state.score,
    sequencesPlayed: state.records.length,
    scoringEvents: state.scoringEvents,
    liveTryEvents: state.liveTryEvents,
    finishingOpportunities: state.finishingOpportunities,
    secondChanceCount: state.secondChanceCount,
    turnovers: state.turnovers,
    tacticalAdaptations: createAdaptationNotes(state),
    coachingFeedback: generateCoachingFeedback(state),
    recoverySaturation: state.recoverySaturation,
    offensiveMomentum: state.offensiveMomentum,
    teamAObservation: createTeamObservation(state, state.context.teamA, "teamA"),
    teamBObservation: createTeamObservation(state, state.context.teamB, "teamB"),
  };
}
