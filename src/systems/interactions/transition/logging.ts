import { PlayerRole } from "../../../models/player";
import {
  classifyWeakSideByDirection,
  createBallContextLogs,
  createTargetSelectionLogs,
  WeakSideSpatialRole,
  SpatialMoveType,
  type BallContext,
  type TargetZoneSelection,
} from "../../spatial/intention";
import { createDefensiveParticipationLogs, type DefensiveParticipationEvaluation, type OffensiveParticipationEvaluation } from "../../structure";
import { createNumericalPressureLogs, evaluateNumericalPressure } from "../../structure/numericalPressure";
import {
  compareNumericalPressureTruth,
  createTruthWarningLogs,
  explainabilityLogs,
  getTacticalReportMode,
  hasPlayerDerivedLineBypass,
  TacticalReportMode,
} from "../../explainability";
import { createTacticalEventChainLogs, resolveTacticalEventChain } from "../../events";
import {
  createPlayerDerivedDefensiveTraceLogs,
  createPlayerDerivedNumericalPressureLogs,
  createPlayerDerivedSupportLogs,
  type PlayerDerivedNumericalPressure,
} from "../../players";
import { createLogLine } from "../shared/logging";
import type { TacticalLogLine } from "../shared/types";
import { TransitionOutcome, TransitionTrigger } from "./types";
import type { TransitionInteractionResult } from "./types";

function formatRole(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.LeftAnchor:
      return "Left Piston";
    case PlayerRole.RightAnchor:
      return "Right Piston";
    case PlayerRole.HookLink:
      return "Hook Link";
    case PlayerRole.MobileLock:
      return "Mobile Lock";
    case PlayerRole.ForwardLeader:
      return "Forward Leader";
    case PlayerRole.TempoHalf:
      return "Tempo Half";
    case PlayerRole.Playmaker:
      return "Playmaker";
    case PlayerRole.PowerRunner:
      return "Forward Leader";
    case PlayerRole.SpaceHunter:
      return "Space Hunter";
    case PlayerRole.FreeSafety:
      return "Free Safety";
    case PlayerRole.GoalkeeperFreeSafety:
      return "Goalkeeper / Free Safety";
    case PlayerRole.Pivot:
      return "Pivot";
    case PlayerRole.LeftPiston:
      return "Left Piston";
    case PlayerRole.RightPiston:
      return "Right Piston";
  }
}

export interface TransitionLogInput {
  readonly result: Omit<TransitionInteractionResult, "logs">;
  readonly offensiveTeamName: string;
  readonly defensiveTeamName: string;
  readonly ballContext: BallContext;
  readonly targetSelection: TargetZoneSelection;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly offensiveParticipation: OffensiveParticipationEvaluation;
  readonly playerDerivedNumericalPressure?: PlayerDerivedNumericalPressure;
  readonly contextLogs?: readonly TacticalLogLine[];
}

function explainTransitionStabilization(input: TransitionLogInput): string {
  if (
    input.result.outcome === TransitionOutcome.ImmediateFinish ||
    input.result.outcome === TransitionOutcome.ChaoticFinish
  ) {
    const delayedDefenderReason =
      input.defensiveParticipation.delayedDefenders > 0
        ? `, ${input.defensiveParticipation.delayedDefenders} delayed defenders`
        : "";
    const scoringDangerReason =
      input.result.updatedContext.finishingTrigger === null
        ? ""
        : `, scoring danger ${input.result.updatedContext.finishingTrigger.scoringDanger}`;

    return `Transition explosion triggered: selected finishing action${scoringDangerReason}${delayedDefenderReason}, support quality ${input.result.support.supportAvailability}.`;
  }

  if (input.result.outcome === TransitionOutcome.LiveRebound) {
    return "Live rebound created near the scoring zone. Emergency scramble remains unresolved for future support.";
  }

  if (
    input.result.outcome === TransitionOutcome.LastDefenderRecovery ||
    input.result.outcome === TransitionOutcome.EmergencyBlock
  ) {
    return "Transition nearly explodes, but last-line coverage prevents the immediate finish.";
  }

  if (input.result.outcome === TransitionOutcome.OverextendedAttack) {
    return "Long-play risk outruns support and the attack overextends before a clean finish.";
  }

  if (
    input.result.outcome === TransitionOutcome.ControlledProgression ||
    input.result.outcome === TransitionOutcome.DelayedTransition ||
    input.result.outcome === TransitionOutcome.EmergencyDefensiveRecovery ||
    input.result.outcome === TransitionOutcome.StabilizedPossession
  ) {
    if (input.targetSelection.moveType === SpatialMoveType.LateralCirculation) {
      return "Transition slowed because the selected target stayed lateral rather than attacking depth.";
    }

    if (input.result.support.supportAvailability < 40) {
      return "Transition slowed because support quality was not high enough to punish the late defenders.";
    }

    if (input.defensiveParticipation.coveringDefenders > 0) {
      return "Transition slowed because covering defenders delayed the direct lane.";
    }

    if (input.offensiveParticipation.conservativeSupport) {
      return "Transition slowed because the ball carrier chose a conservative support structure.";
    }
  }

  return `Transition outcome follows structural state: ${input.result.defensiveRecovery.recoveryExplanation}.`;
}

export function createTransitionLogs(input: TransitionLogInput): readonly TacticalLogLine[] {
  const targetZone = input.result.updatedContext.targetZones[0] ?? input.result.updatedContext.activeZone;
  const weakSideClassification = classifyWeakSideByDirection({
    ballLocation: input.ballContext.ballLocation,
    weakSideZone: targetZone,
    attackingDirection: input.ballContext.attackingDirection,
  });
  const weakSideLine =
    weakSideClassification.role === WeakSideSpatialRole.DangerousWeakSide
      ? `Dangerous weak side exposed in ${targetZone}.`
      : `Weak-side recycle lane available in ${targetZone} (${weakSideClassification.description}).`;
  const openingLine =
    input.result.event.trigger === TransitionTrigger.BrokenPress
      ? `${input.offensiveTeamName} breaks the press in ${input.result.event.activeZone}.`
      : `${input.offensiveTeamName} recovers possession in ${input.result.event.activeZone}.`;
  const goalSideDefenders = Math.max(
    0,
    input.defensiveParticipation.counts.inStructure + input.defensiveParticipation.counts.covering,
  );
  const numericalPressure = evaluateNumericalPressure({
    offensiveParticipation: input.offensiveParticipation,
    defensiveParticipation: input.defensiveParticipation,
  });
  const numericalTruth =
    input.playerDerivedNumericalPressure === undefined
      ? null
      : compareNumericalPressureTruth({
          attackingTeamName: input.offensiveTeamName,
          estimated: numericalPressure,
          playerDerived: input.playerDerivedNumericalPressure,
        });
  const lineBypassed =
    input.playerDerivedNumericalPressure === undefined
      ? input.defensiveParticipation.delayedDefenders + input.defensiveParticipation.eliminatedDefenders > 0
      : hasPlayerDerivedLineBypass(input.playerDerivedNumericalPressure);
  const eventChain = resolveTacticalEventChain({
    attackingTeamName: input.offensiveTeamName,
    defendingTeamName: input.defensiveTeamName,
    actorRole: input.ballContext.ballCarrierRole,
    receiverRole: input.targetSelection.receiverRole ?? input.result.projection.primaryRunnerRole,
    supportRole: input.result.support.keySupportRole,
    defenderRole: input.result.defensiveRecovery.keyRecoveryRole,
    fromZone: input.ballContext.ballLocation,
    targetSelection: input.targetSelection,
    moveType: input.targetSelection.moveType,
    pressureLevel: input.result.updatedContext.pressureLevel,
    supportQuality: input.result.support.supportAvailability,
    chaosLevel: input.result.transitionWindow.chaos,
    outcomeLabel: input.result.outcome.toUpperCase(),
  });
  const longPlayCausality =
    input.targetSelection.moveType === SpatialMoveType.DirectVerticalAttack ||
    input.targetSelection.moveType === SpatialMoveType.Progression
      ? [
          createLogLine(
            `${input.offensiveTeamName} Tempo Half finds ${formatRole(input.result.projection.primaryRunnerRole)} moving into ${input.targetSelection.selectedZone}.`,
          ),
          createLogLine(
            lineBypassed
              ? `${input.defensiveTeamName} defensive line bypassed by player-derived state; ${goalSideDefenders} defenders remain structurally relevant.`
              : `${input.defensiveTeamName} defensive line bends without a player-derived line bypass; ${goalSideDefenders} defenders remain structurally relevant.`,
          ),
          createLogLine(
            input.result.support.supportAvailability >= 55
              ? `Support arrives cleanly through ${formatRole(input.result.support.keySupportRole)}.`
              : `Support is late; ${formatRole(input.result.projection.primaryRunnerRole)} carries the danger under pressure.`,
          ),
        ]
      : [];
  const longPlayExplainability =
    input.targetSelection.moveType === SpatialMoveType.DirectVerticalAttack ||
    input.targetSelection.moveType === SpatialMoveType.Progression
      ? explainabilityLogs([
          createLogLine("Long-play causality:"),
          createLogLine(
            `- runner: ${formatRole(input.result.projection.primaryRunnerRole)} into ${input.targetSelection.selectedZone}`,
          ),
          createLogLine(
            `- reception quality: ${input.result.support.supportAvailability >= 55 ? "CLEAN" : "PRESSURED"}`,
          ),
          createLogLine(
            `- defensive line bypassed: ${lineBypassed ? "YES" : "NO"}`,
          ),
          createLogLine(`- support followed: ${input.result.support.supportAvailability} / 100`),
          createLogLine(
            `- numerical pressure: ${numericalTruth?.authoritativeDescription ?? numericalPressure.description}`,
          ),
          ...(getTacticalReportMode() === TacticalReportMode.DeepDebug
            ? createTruthWarningLogs([numericalTruth?.warning ?? null])
            : []),
        ])
      : [];
  const weakSideEstimateLogs =
    input.playerDerivedNumericalPressure !== undefined && getTacticalReportMode() !== TacticalReportMode.DeepDebug
      ? []
      : [createLogLine(`[ESTIMATED] ${weakSideLine}`)];

  return [
    createLogLine(`[Tick ${input.result.event.tick}]`),
    createLogLine(""),
    ...createBallContextLogs({
      teamName: input.offensiveTeamName,
      defendingTeamName: input.defensiveTeamName,
      ballContext: input.ballContext,
    }),
    createLogLine(openingLine),
    createLogLine(`Transition window opened for ${input.result.transitionWindow.durationTicks} ticks.`),
    createLogLine(`${input.defensiveTeamName} defensive structure partially broken.`),
    ...weakSideEstimateLogs,
    createLogLine(`[NARRATIVE] ${formatRole(input.result.projection.primaryRunnerRole)} attacks the open corridor.`),
    ...(input.contextLogs ?? []),
    ...longPlayCausality,
    ...longPlayExplainability,
    ...createTacticalEventChainLogs(eventChain),
    ...createDefensiveParticipationLogs({
      teamName: input.defensiveTeamName,
      participation: input.defensiveParticipation,
      ...(input.playerDerivedNumericalPressure === undefined
        ? {}
        : { playerDerivedNumericalPressure: input.playerDerivedNumericalPressure }),
    }),
    ...(input.playerDerivedNumericalPressure === undefined
      ? []
      : [
          ...createPlayerDerivedNumericalPressureLogs({
            numerical: input.playerDerivedNumericalPressure,
            attackingTeamName: input.offensiveTeamName,
            defendingTeamName: input.defensiveTeamName,
          }),
          ...createPlayerDerivedDefensiveTraceLogs({
            numerical: input.playerDerivedNumericalPressure,
            defendingTeamName: input.defensiveTeamName,
            reason: `bypassed by ${input.ballContext.ballLocation} -> ${input.targetSelection.selectedZone} ${input.targetSelection.moveType}`,
          }),
          ...createPlayerDerivedSupportLogs({
            numerical: input.playerDerivedNumericalPressure,
            attackingTeamName: input.offensiveTeamName,
          }),
        ]),
    ...createNumericalPressureLogs({
      teamName: input.offensiveTeamName,
      defendingTeamName: input.defensiveTeamName,
      evaluation: numericalPressure,
      ...(input.playerDerivedNumericalPressure === undefined
        ? {}
        : { playerDerivedNumericalPressure: input.playerDerivedNumericalPressure }),
    }),
    ...createTargetSelectionLogs(input.targetSelection, input.offensiveTeamName),
    createLogLine(`${formatRole(input.result.defensiveRecovery.keyRecoveryRole)} leads emergency recovery.`),
    createLogLine(`Transition speed: ${input.result.projection.transitionSpeed} / 100.`),
    createLogLine(`Temporary chaos: ${input.result.transitionWindow.chaos} / 100.`),
    createLogLine(`Transition danger level: ${input.result.dangerLevel}.`),
    ...(input.result.outcome === TransitionOutcome.ImmediateFinish ||
    input.result.outcome === TransitionOutcome.ChaoticFinish
      ? [createLogLine("Immediate finishing resolution triggered by transition explosion.")]
      : []),
    createLogLine("### Comparative Resolution"),
    createLogLine(explainTransitionStabilization(input)),
    createLogLine(input.result.event.summary),
  ];
}
