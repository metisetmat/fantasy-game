import type { TacticalLogLine } from "../../systems/interactions/shared";
import { TacticalStyle } from "../../models/tactics";
import { PlayerRole } from "../../models/player";
import { createCoachingFeedbackLogs } from "../../reports/coaching";
import {
  BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL,
  BLITZ_ROSTER,
  CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL,
  CONTROL_ROSTER,
} from "../../data/teams";
import { deriveTeamProfileTraceFromRoster } from "../../systems/teams";
import { createDerivedAttributeDebugLogs, createRoleBehaviorProfileLogs } from "../../systems/players";
import type {
  MiniMatchScore,
  MiniMatchSequenceSetup,
  MiniMatchState,
  MiniMatchSummary,
} from "./types";

function line(text: string): TacticalLogLine {
  return { text };
}

function formatScore(score: MiniMatchScore, state: MiniMatchState): string {
  return `${state.context.teamA.displayName} ${score.teamA} - ${score.teamB} ${state.context.teamB.displayName}`;
}

function describeDefensivePreparation(setup: MiniMatchSequenceSetup): string {
  switch (setup.pressingTeam.tacticalStyle) {
    case TacticalStyle.Blitz:
      return `${setup.pressingTeam.teamName} sets an aggressive press around ${setup.activeZone}.`;
    case TacticalStyle.Control:
      return `${setup.pressingTeam.teamName} compresses passing lanes around ${setup.activeZone}.`;
    case TacticalStyle.Fortress:
      return `${setup.pressingTeam.teamName} holds a compact block around ${setup.activeZone}.`;
    case TacticalStyle.ChaosHunters:
      return `${setup.pressingTeam.teamName} hunts for disruption around ${setup.activeZone}.`;
    case TacticalStyle.Custom:
      return `${setup.pressingTeam.teamName} prepares defensive pressure around ${setup.activeZone}.`;
  }
}

function createRosterSourceLogs(input: {
  readonly teamName: "CONTROL" | "BLITZ";
  readonly sourceName: string;
  readonly rawVisibleAttributeTotal: number;
  readonly roster: typeof CONTROL_ROSTER | typeof BLITZ_ROSTER;
  readonly state: MiniMatchState;
}): readonly TacticalLogLine[] {
  const team = input.state.context.teamA.displayName === input.teamName ? input.state.context.teamA : input.state.context.teamB;
  const profileTrace = deriveTeamProfileTraceFromRoster({
    roster: input.roster,
    instructions: team.tacticalInstructions,
    baseCollective: team.collectiveProperties,
    finishingIdentity: input.teamName === "BLITZ" ? "CHAOTIC_AGGRESSION" : "CONTROLLED_EXECUTION",
  });
  const profile = profileTrace.profile;
  const goalkeeper = input.roster.find((player) => player.isGoalkeeper);
  const tempoHalf = input.roster.find((player) => player.initials === "TH");
  const spaceHunter = input.roster.find((player) => player.initials === "SH");

  return [
    line(`${input.teamName} roster source:`),
    line(`- loaded from ${input.sourceName}`),
    line(`- raw visible attribute total: ${input.rawVisibleAttributeTotal}`),
    line(`- goalkeeper: ${goalkeeper?.initials ?? "none"} / ${goalkeeper?.displayName ?? "none"}`),
    line(`${input.teamName} derived team profile:`),
    line(`- collectiveness: ${profile.collectiveness}`),
    line(`- cohesion: ${profile.cohesion}`),
    line(`- tactical discipline: ${profile.tacticalDiscipline}`),
    line(`- support quality: ${profile.supportQuality}`),
    line(`- build-up resistance: ${profile.buildUpResistance}`),
    line(`- verticality: ${profile.verticality}`),
    line(`- risk: ${profile.riskProfile}`),
    line(`- chaos tolerance: ${profile.chaosTolerance}`),
    line(`- finishing identity: ${profile.finishingIdentity}`),
    line(`${input.teamName} team aggregate trace:`),
    ...profileTrace.traces.flatMap((trace) => [
      line(`- ${trace.label}: ${trace.value}`),
      line(`  - players: ${trace.playerContributions.join(" / ")}`),
      line(`  - formula: ${trace.formula}`),
    ]),
    ...(tempoHalf === undefined
      ? []
      : [
          line(`${input.teamName} key player derivations:`),
          ...createDerivedAttributeDebugLogs({
            playerLabel: "Tempo Half",
            entries: tempoHalf.derivedAttributeDebug,
            keys: ["supportTiming", "tacticalDiscipline", "longPlayQuality"],
          }),
        ]),
    ...(spaceHunter === undefined
      ? []
      : [
          ...createDerivedAttributeDebugLogs({
            playerLabel: "Space Hunter",
            entries: spaceHunter.derivedAttributeDebug,
            keys: ["chaosCreation", "longPlayQuality", "finishingComposure"],
          }),
        ]),
    ...createRoleBehaviorProfileLogs({
      title: `${input.teamName} role behavior profiles:`,
      roles: [PlayerRole.TempoHalf, PlayerRole.SpaceHunter, PlayerRole.GoalkeeperFreeSafety],
      tacticalStyle: team.tacticalStyle,
    }),
    ...(goalkeeper === undefined
      ? []
      : [
          ...createDerivedAttributeDebugLogs({
            playerLabel: "Goalkeeper / Free Safety",
            entries: goalkeeper.derivedAttributeDebug,
            keys: ["goalkeeperResponse", "restDefenseReliability", "longPlayQuality"],
          }),
        ]),
    line(""),
  ];
}

export function createMiniMatchHeaderLogs(state: MiniMatchState): readonly TacticalLogLine[] {
  return [
    line("=============================="),
    line(`MINI MATCH: ${state.context.teamA.displayName} vs ${state.context.teamB.displayName}`),
    line("=============================="),
    line(""),
    ...createRosterSourceLogs({
      teamName: "CONTROL",
      sourceName: "controlRoster",
      rawVisibleAttributeTotal: CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL,
      roster: CONTROL_ROSTER,
      state,
    }),
    ...createRosterSourceLogs({
      teamName: "BLITZ",
      sourceName: "blitzRoster",
      rawVisibleAttributeTotal: BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL,
      roster: BLITZ_ROSTER,
      state,
    }),
  ];
}

export function createSequenceHeaderLogs(setup: MiniMatchSequenceSetup): readonly TacticalLogLine[] {
  return [
    line(`Sequence ${setup.sequenceNumber}`),
    line(setup.possessionReason),
    line(setup.openingLine),
    line(describeDefensivePreparation(setup)),
    line(""),
  ];
}

export function createScoreLog(state: MiniMatchState): TacticalLogLine {
  return line(`Score: ${formatScore(state.score, state)}`);
}

export function createSequenceBoundaryLog(state: MiniMatchState): TacticalLogLine {
  const teamName =
    state.continuity.lastPossessionTeamId === state.context.teamA.id
      ? state.context.teamA.displayName
      : state.continuity.lastPossessionTeamId === state.context.teamB.id
        ? state.context.teamB.displayName
        : "Unknown team";

  const reason = state.continuity.lastPossessionReason;
  const endingReason =
    reason.includes("scoring")
      ? "finishing resolved and the scoring sequence reset possession"
      : reason.includes("failed finishing")
        ? "finishing resolved without a score and defensive possession was established"
      : reason.includes("turnover") || reason.includes("scramble")
        ? "turnover or scramble phase resolved completely"
        : reason.includes("retained")
          ? "possession stabilized with the danger window closed"
          : "the tactical phase reached a stable boundary";

  return line(`End of sequence: ${teamName} has possession because ${reason}. Sequence ended because ${endingReason}.`);
}

export function createFinalSummaryLogs(
  state: MiniMatchState,
  summary: MiniMatchSummary,
): readonly TacticalLogLine[] {
  const scoringLogs =
    summary.scoringEvents.length === 0
      ? [line("- no scoring events")]
      : summary.scoringEvents.map((event) =>
          line(`- Sequence ${event.sequenceNumber}: ${event.teamName} ${event.scoringType} +${event.points}`),
        );
  const adaptationLogs =
    summary.tacticalAdaptations.length === 0
      ? [line("- no clear repeated pattern yet")]
      : summary.tacticalAdaptations.map((note) => line(`- ${note}`));

  return [
    line(""),
    line("Final Summary"),
    line(`Sequences played: ${summary.sequencesPlayed}`),
    line("Scoring events:"),
    ...scoringLogs,
    line(
      `Finishing opportunities: ${state.context.teamA.displayName} ${summary.finishingOpportunities.teamA}, ${state.context.teamB.displayName} ${summary.finishingOpportunities.teamB}`,
    ),
    line(
      `Second chances: ${state.context.teamA.displayName} ${summary.secondChanceCount.teamA}, ${state.context.teamB.displayName} ${summary.secondChanceCount.teamB}`,
    ),
    line(
      `Pressure turnovers: ${state.context.teamA.displayName} ${summary.turnovers.teamA}, ${state.context.teamB.displayName} ${summary.turnovers.teamB}`,
    ),
    line("Recovery saturation:"),
    line(
      `- ${state.context.teamA.displayName} ended ${summary.recoverySaturation.teamA.level} (${summary.recoverySaturation.teamA.score}).`,
    ),
    line(
      `- ${state.context.teamB.displayName} ended ${summary.recoverySaturation.teamB.level} (${summary.recoverySaturation.teamB.score}).`,
    ),
    line("Offensive momentum:"),
    line(
      `- ${state.context.teamA.displayName} ended ${summary.offensiveMomentum.teamA.level} (${summary.offensiveMomentum.teamA.score}).`,
    ),
    line(
      `- ${state.context.teamB.displayName} ended ${summary.offensiveMomentum.teamB.level} (${summary.offensiveMomentum.teamB.score}).`,
    ),
    line("Tactical adaptations:"),
    ...adaptationLogs,
    line(""),
    line(`${state.context.teamA.displayName}:`),
    line(`- ${summary.teamAObservation}`),
    line(`${state.context.teamB.displayName}:`),
    line(`- ${summary.teamBObservation}`),
    ...createCoachingFeedbackLogs(summary.coachingFeedback),
    line(""),
    line("Final Score:"),
    line(formatScore(summary.finalScore, state)),
  ];
}
