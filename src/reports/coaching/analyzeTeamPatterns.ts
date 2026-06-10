import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { FinishingOutcome, type FinishingInteractionResult } from "../../systems/interactions/finishing";
import { BuildUpPressingOutcome } from "../../systems/interactions/shared";
import type { IsolatedInteractionResult } from "../../systems/interactions/shared";
import { TransitionOutcome } from "../../systems/interactions/transition";
import type { TransitionInteractionResult } from "../../systems/interactions/transition";
import type { ConstructionInteractionResult } from "../../systems/interactions/construction";
import { SpatialMoveType } from "../../systems/spatial/intention/types";
import type { TacticalMemoryEntry } from "../../systems/tacticalMemory";
import type { MiniMatchState } from "../../simulation/miniMatch";
import { TacticalPhaseState } from "../../systems/tacticalState";
import type { MemoryPatternObservation, MovePatternCount, TeamPatternAnalysis } from "./types";

const MOVE_TYPES: readonly SpatialMoveType[] = [
  SpatialMoveType.Progression,
  SpatialMoveType.DirectVerticalAttack,
  SpatialMoveType.LateralCirculation,
  SpatialMoveType.WeakSideSwitch,
  SpatialMoveType.BackwardRecycle,
  SpatialMoveType.SafetyClearance,
];

function average(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countMovePatterns(moveTypes: readonly SpatialMoveType[]): readonly MovePatternCount[] {
  return MOVE_TYPES.map((moveType) => ({
    moveType,
    count: moveTypes.filter((candidate) => candidate === moveType).length,
  })).filter((entry) => entry.count > 0);
}

function toMemoryObservation(entry: TacticalMemoryEntry): MemoryPatternObservation {
  return {
    interaction: entry.pattern.interaction,
    moveType: entry.pattern.moveType,
    sideType: entry.pattern.sideType,
    successes: entry.successes,
    failures: entry.failures,
  };
}

function countChaosLog(input: {
  readonly state: MiniMatchState;
  readonly team: PrototypeTeamDefinition;
  readonly outcomeText: string;
}): number {
  return input.state.records.reduce((count: number, record) => {
    const lines = record.result.logs.map((line) => line.text);

    return (
      count +
      lines.filter((line, index) => {
        const nextLine = lines[index + 1] ?? "";

        return line.includes(`outcome: ${input.outcomeText}`) && nextLine.includes(`${input.team.displayName} `);
      }).length
    );
  }, 0);
}

function isBuildUpResult(result: IsolatedInteractionResult | null): result is IsolatedInteractionResult {
  return result !== null;
}

function isTeamTransitionResult(
  result: TransitionInteractionResult | null,
  team: PrototypeTeamDefinition,
): result is TransitionInteractionResult {
  return result !== null && result.event.offensiveTeamId === team.id;
}

function isTeamConstructionResult(
  result: ConstructionInteractionResult | null,
  team: PrototypeTeamDefinition,
): result is ConstructionInteractionResult {
  return result !== null && result.event.offensiveTeamId === team.id;
}

function isTeamFinishingResult(
  result: FinishingInteractionResult | null,
  team: PrototypeTeamDefinition,
): result is FinishingInteractionResult {
  return result !== null && result.event.offensiveTeamId === team.id;
}

function getTurnoversWon(state: MiniMatchState, team: PrototypeTeamDefinition): number {
  if (team.id === state.context.teamA.id) {
    return state.turnovers.teamA;
  }

  if (team.id === state.context.teamB.id) {
    return state.turnovers.teamB;
  }

  return 0;
}

function getTacticalDangerScore(label: string): number {
  switch (label) {
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}

function getRecoverySaturation(state: MiniMatchState, team: PrototypeTeamDefinition) {
  return team.id === state.context.teamA.id ? state.recoverySaturation.teamA : state.recoverySaturation.teamB;
}

export function analyzeTeamPatterns(
  state: MiniMatchState,
  team: PrototypeTeamDefinition,
): TeamPatternAnalysis {
  const possessionSequences = state.records.filter((record) => record.setup.possessionTeam.teamId === team.id);
  const pressingSequences = state.records.filter((record) => record.setup.pressingTeam.teamId === team.id);
  const buildUpResults = possessionSequences
    .map((record) => record.result.buildUpResult)
    .filter(isBuildUpResult);
  const transitionResults = state.records
    .map((record) => record.result.transitionResult)
    .filter((result): result is TransitionInteractionResult => isTeamTransitionResult(result, team));
  const constructionResults = state.records
    .map((record) => record.result.constructionResult)
    .filter((result): result is ConstructionInteractionResult => isTeamConstructionResult(result, team));
  const finishingResults = state.records
    .map((record) => record.result.finishingResult)
    .filter((result): result is FinishingInteractionResult => isTeamFinishingResult(result, team));
  const moveTypes = [
    ...buildUpResults.map((result) => result.updatedContext.moveType),
    ...transitionResults.map((result) => result.updatedContext.moveType),
    ...constructionResults.map((result) => result.updatedContext.moveType),
  ];
  const buildUpFailures = buildUpResults.filter(
    (result) =>
      result.outcome === BuildUpPressingOutcome.DangerousTurnover ||
      result.outcome === BuildUpPressingOutcome.ForcedClearance,
  ).length;
  const buildUpSuccesses = buildUpResults.length - buildUpFailures;
  const transitionSuccesses = transitionResults.filter(
    (result) =>
      result.outcome === TransitionOutcome.ExplosiveTransition ||
      result.outcome === TransitionOutcome.WeakSideAttack ||
      result.outcome === TransitionOutcome.ControlledProgression,
  ).length;
  const transitionFailures = transitionResults.length - transitionSuccesses;
  const highDangerLowScoringThreat = constructionResults.filter(
    (result) => result.dangerLevel === "HIGH" && result.finishingTrigger.scoringDanger === "LOW",
  ).length;
  const redZoneLateralDelays = constructionResults.filter(
    (result) =>
      result.finishingTrigger.triggered &&
      result.finishingTrigger.scoringDanger === "HIGH" &&
      result.updatedContext.moveType === SpatialMoveType.LateralCirculation,
  ).length;
  const legalFinishingOptionsIgnored =
    constructionResults.filter(
      (result) => result.finishingTrigger.triggered && result.updatedContext.moveType !== SpatialMoveType.Finishing,
    ).length +
    transitionResults.filter(
      (result) =>
        result.updatedContext.finishingTrigger?.triggered === true &&
        result.updatedContext.moveType !== SpatialMoveType.Finishing,
    ).length;
  const highTransitionDangerStabilized = transitionResults.filter(
    (result) =>
      result.dangerLevel === "HIGH" &&
      result.updatedContext.moveType === SpatialMoveType.LateralCirculation &&
      (result.outcome === TransitionOutcome.ControlledProgression ||
        result.outcome === TransitionOutcome.DelayedTransition ||
        result.outcome === TransitionOutcome.EmergencyDefensiveRecovery ||
        result.outcome === TransitionOutcome.StabilizedPossession),
  ).length;
  const memoryPatterns =
    state.tacticalMemory.teams
      .find((memory) => memory.teamId === team.id)
      ?.entries.map(toMemoryObservation)
      .filter((entry) => entry.successes > 0 || entry.failures > 0) ?? [];
  const recoverySaturation = getRecoverySaturation(state, team);
  const offensiveMomentum = team.id === state.context.teamA.id ? state.offensiveMomentum.teamA : state.offensiveMomentum.teamB;
  const secondChancePhases = state.records.filter(
    (record) => record.result.secondChanceResult?.event.offensiveTeamId === team.id,
  ).length;
  const teamSteps = state.records
    .filter(
      (record) =>
        record.setup.possessionTeam.teamId === team.id ||
        record.result.transitionResult?.event.offensiveTeamId === team.id ||
        record.result.constructionResult?.event.offensiveTeamId === team.id ||
        record.result.finishingResult?.event.offensiveTeamId === team.id,
    )
    .flatMap((record) => record.result.steps);
  const tacticalPhaseStates = teamSteps.map((step) => step.contextAfter.tacticalPhaseState);

  return {
    teamId: team.id,
    teamName: team.displayName,
    tacticalStyle: team.tacticalStyle,
    offensiveProgressionPhilosophy: team.offensiveProgressionPhilosophy,
    possessionSequences: possessionSequences.length,
    pressingSequences: pressingSequences.length,
    movePatterns: countMovePatterns(moveTypes),
    memoryPatterns,
    finishingOpportunities: finishingResults.length,
    scoringEvents: state.scoringEvents.filter((event) => event.teamId === team.id).length,
    finishingOutcomes: finishingResults.map((result) => result.outcome),
    finishingStyles: finishingResults.map((result) => result.finishingStyle.identity),
    finishingContexts: finishingResults.map((result) => result.conversionContext.contextQuality),
    scoringTypes: state.scoringEvents.filter((event) => event.teamId === team.id).map((event) => event.scoringType),
    turnoversWon: getTurnoversWon(state, team),
    buildUpFailures,
    buildUpSuccesses,
    transitionSuccesses,
    transitionFailures,
    highDangerLowScoringThreat,
    redZoneLateralDelays,
    legalFinishingOptionsIgnored,
    highTransitionDangerStabilized,
    poorDecisions: countChaosLog({ state, team, outcomeText: "POOR_DECISION" }),
    rushedClearances: countChaosLog({ state, team, outcomeText: "RUSHED_CLEARANCE" }),
    forcedTurnovers: countChaosLog({ state, team, outcomeText: "FORCED_TURNOVER" }),
    averageSupportQuality: average(buildUpResults.map((result) => result.supportQuality)),
    averageBuildUpResistance: average(buildUpResults.map((result) => result.buildUpCapability)),
    averagePressingCapability: average(
      pressingSequences
        .map((record) => record.result.buildUpResult)
        .filter(isBuildUpResult)
        .map((result) => result.pressingCapability),
    ),
    averageTerritorialPressure: average(
      state.records
        .flatMap((record) => record.result.steps)
        .filter((step) => step.contextAfter.currentInteraction !== undefined)
        .map((step) => step.contextAfter.territorialPressure),
    ),
    averageTacticalDangerScore: average(
      state.records
        .flatMap((record) => record.result.steps)
        .map((step) => getTacticalDangerScore(step.contextAfter.currentDanger)),
    ),
    averageConversionQuality: average(finishingResults.map((result) => result.conversionQuality.conversionQuality)),
    reboundOrScrambleOutcomes: finishingResults.filter(
      (result) =>
        result.outcome === FinishingOutcome.LiveRebound ||
        result.outcome === FinishingOutcome.SecondChance ||
        result.outcome === FinishingOutcome.ScrambleFinish,
    ).length,
    secondChancePhases,
    finalOffensiveMomentumLevel: offensiveMomentum.level,
    finalOffensiveMomentumScore: offensiveMomentum.score,
    finalRecoverySaturationLevel: recoverySaturation.level,
    finalRecoverySaturationScore: recoverySaturation.score,
    buildUpOutcomes: buildUpResults.map((result) => result.outcome),
    transitionOutcomes: transitionResults.map((result) => result.outcome),
    tacticalPhaseStates,
    chaoticAdvantagesCreated: tacticalPhaseStates.filter(
      (phase) => phase === TacticalPhaseState.ChaoticAttackingAdvantage,
    ).length,
    dangerPhasesResolved: tacticalPhaseStates.filter((phase) => phase === TacticalPhaseState.DangerPhase).length,
  };
}
