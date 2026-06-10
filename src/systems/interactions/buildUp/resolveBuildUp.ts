import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { PressureLevel } from "../../../models/match";
import { PlayerRole } from "../../../models/player";
import { TacticalStyle, type ShapeState } from "../../../models/tactics";
import type {
  CompactnessEvaluation,
  DensityEvaluation,
  OffensiveSpreadEvaluation,
  SpatialTeamContext,
  WeakSideEvaluation,
} from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import {
  createBallContextLogs,
  createTargetSelectionLogs,
  selectTargetZone,
  SpatialMoveType,
  ThreatLevel,
  type BallContext,
  type TargetZoneSelection,
} from "../../spatial/intention";
import { classifySideContext, createSideContextLogs } from "../../spatial/sides";
import { createOffensivePhilosophyLogs } from "../../offense";
import { createOffensiveMomentumLogs } from "../../offense/momentum";
import { createPrincipleEvaluationLogs, evaluateTacticalPrinciples } from "../../principles";
import { createRecoverySaturationLogs } from "../../structure";
import { createBreakdownLogs, createShapeExplainabilityLogs, explainabilityLogs } from "../../explainability";
import { ChaosOutcome, createChaosLogs, evaluateChaosOutcome } from "../../chaos";
import { createTacticalEventChainLogs, resolveCanonicalEventActors, resolveTacticalEventChain } from "../../events";
import { UtilityActionType, createUtilityDebugLogs, selectUtilityActor } from "../../ai/utility";
import {
  TacticalMemoryInteraction,
  createTargetSelectionMemoryModifiers,
  createTacticalMemoryLogs,
  type TacticalMemoryState,
} from "../../tacticalMemory";
import { evaluateTrap } from "../pressing/evaluateTrap";
import { evaluatePressure } from "../pressing/evaluatePressure";
import { evaluatePressing } from "../pressing/evaluatePressing";
import { InteractionType } from "../types";
import { createTacticalInteractionEvent } from "../shared/events";
import { createLogLine } from "../shared/logging";
import {
  BuildUpPressingOutcome,
  IsolatedInteractionResult,
  TacticalContextUpdateType,
} from "../shared/types";
import type { UpdatedTacticalContext } from "../shared/types";
import { evaluateBuildUpCapability } from "./evaluateBuildUpCapability";
import { evaluateSupport } from "./evaluateSupport";

export interface ResolveBuildUpUnderPressureInput {
  readonly tick: TacticalTick;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly offensiveShape: ShapeState;
  readonly defensiveShape: ShapeState;
  readonly density: DensityEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly contextualPressure: PressureLevel;
  readonly ballContext: BallContext;
  readonly chaosLevel: number;
  readonly territorialPressure: number;
  readonly tacticalMemory: TacticalMemoryState;
}

function chooseOutcome(
  buildUpCapability: number,
  pressingCapability: number,
  pressureLevel: PressureLevel,
  weakSide: WeakSideEvaluation,
): BuildUpPressingOutcome {
  const margin = buildUpCapability - pressingCapability;

  if (margin >= 12 && weakSide.switchPlayOpportunity === LaneAvailability.Open) {
    return BuildUpPressingOutcome.PressBroken;
  }

  if (margin >= 14 && weakSide.exposure >= 60) {
    return BuildUpPressingOutcome.WeakSideExposed;
  }

  if (margin >= 10) {
    return BuildUpPressingOutcome.CleanExit;
  }

  if (margin >= 2) {
    return BuildUpPressingOutcome.ControlledRecycle;
  }

  if (margin > -8) {
    return pressureLevel === PressureLevel.High
      ? BuildUpPressingOutcome.ForcedBackwardPlay
      : BuildUpPressingOutcome.ControlledRecycle;
  }

  if (margin > -18) {
    return BuildUpPressingOutcome.ForcedClearance;
  }

  return BuildUpPressingOutcome.DangerousTurnover;
}

function createContextUpdates(outcome: BuildUpPressingOutcome): readonly TacticalContextUpdateType[] {
  switch (outcome) {
    case BuildUpPressingOutcome.PressBroken:
      return [TacticalContextUpdateType.StructureAdvantage, TacticalContextUpdateType.WeakSideOpened];
    case BuildUpPressingOutcome.CleanExit:
      return [TacticalContextUpdateType.StructureAdvantage];
    case BuildUpPressingOutcome.ControlledRecycle:
      return [TacticalContextUpdateType.TempoStabilized];
    case BuildUpPressingOutcome.ForcedBackwardPlay:
      return [TacticalContextUpdateType.PressureContinues];
    case BuildUpPressingOutcome.ForcedClearance:
      return [TacticalContextUpdateType.TerritorialLoss];
    case BuildUpPressingOutcome.DangerousTurnover:
      return [TacticalContextUpdateType.HighTurnoverDanger];
    case BuildUpPressingOutcome.WeakSideExposed:
      return [TacticalContextUpdateType.WeakSideOpened];
  }
}

function describeOutcome(outcome: BuildUpPressingOutcome): string {
  switch (outcome) {
    case BuildUpPressingOutcome.PressBroken:
      return "Press broken.";
    case BuildUpPressingOutcome.CleanExit:
      return "Clean exit.";
    case BuildUpPressingOutcome.ControlledRecycle:
      return "Controlled recycle.";
    case BuildUpPressingOutcome.ForcedBackwardPlay:
      return "Forced backward play.";
    case BuildUpPressingOutcome.ForcedClearance:
      return "Forced clearance.";
    case BuildUpPressingOutcome.DangerousTurnover:
      return "Dangerous turnover.";
    case BuildUpPressingOutcome.WeakSideExposed:
      return "Weak side exposed.";
  }
}

function describeProgression(outcome: BuildUpPressingOutcome): string {
  switch (outcome) {
    case BuildUpPressingOutcome.PressBroken:
      return "Ball progression successful.";
    case BuildUpPressingOutcome.CleanExit:
      return "Pressure escaped without major progression.";
    case BuildUpPressingOutcome.ControlledRecycle:
      return "Possession stabilized without progression.";
    case BuildUpPressingOutcome.ForcedBackwardPlay:
      return "Pressure remains active.";
    case BuildUpPressingOutcome.ForcedClearance:
      return "Territory conceded to survive pressure.";
    case BuildUpPressingOutcome.DangerousTurnover:
      return "High recovery chance created by the press.";
    case BuildUpPressingOutcome.WeakSideExposed:
      return "Weak side opened for the next phase.";
  }
}

function refineOutcomeByMove(input: {
  readonly rawOutcome: BuildUpPressingOutcome;
  readonly moveType: SpatialMoveType;
  readonly tacticalStyle: TacticalStyle;
}): BuildUpPressingOutcome {
  const riskyIdentity =
    input.tacticalStyle === TacticalStyle.Blitz || input.tacticalStyle === TacticalStyle.ChaosHunters;

  if (riskyIdentity && input.rawOutcome === BuildUpPressingOutcome.ControlledRecycle) {
    if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
      return BuildUpPressingOutcome.PressBroken;
    }

    if (input.moveType === SpatialMoveType.Progression || input.moveType === SpatialMoveType.WeakSideSwitch) {
      return BuildUpPressingOutcome.CleanExit;
    }
  }

  if (
    input.rawOutcome === BuildUpPressingOutcome.PressBroken ||
    input.rawOutcome === BuildUpPressingOutcome.WeakSideExposed
  ) {
    if (
      input.moveType === SpatialMoveType.LateralCirculation ||
      input.moveType === SpatialMoveType.BackwardRecycle ||
      input.moveType === SpatialMoveType.SafetyClearance
    ) {
      return BuildUpPressingOutcome.CleanExit;
    }
  }

  return input.rawOutcome;
}

function refineOutcomeByChaos(input: {
  readonly outcome: BuildUpPressingOutcome;
  readonly chaosOutcome: ChaosOutcome;
  readonly moveType: SpatialMoveType;
}): BuildUpPressingOutcome {
  switch (input.chaosOutcome) {
    case ChaosOutcome.ForcedTurnover:
    case ChaosOutcome.TechnicalError:
      return BuildUpPressingOutcome.DangerousTurnover;
    case ChaosOutcome.RushedClearance:
      return BuildUpPressingOutcome.ForcedClearance;
    case ChaosOutcome.SupportFailure:
      return input.outcome === BuildUpPressingOutcome.PressBroken
        ? BuildUpPressingOutcome.CleanExit
        : input.outcome;
    case ChaosOutcome.PoorDecision:
      if (
        input.moveType === SpatialMoveType.DirectVerticalAttack ||
        input.moveType === SpatialMoveType.Progression
      ) {
        return BuildUpPressingOutcome.DangerousTurnover;
      }

      return input.outcome === BuildUpPressingOutcome.PressBroken
        ? BuildUpPressingOutcome.ControlledRecycle
        : input.outcome;
    case ChaosOutcome.TransitionReversal:
    case ChaosOutcome.None:
      return input.outcome;
  }
}

function getAverageComposure(team: SpatialTeamContext): number {
  const divisor = Math.max(1, team.players.length);

  return Math.round(team.players.reduce((sum, player) => sum + player.attributes.mental, 0) / divisor);
}

function getAverageFreshness(team: SpatialTeamContext): number {
  const divisor = Math.max(1, team.players.length);

  return Math.round(team.players.reduce((sum, player) => sum + player.fatigue.freshness, 0) / divisor);
}

function describeTacticalPressResult(input: {
  readonly outcome: BuildUpPressingOutcome;
  readonly moveType: SpatialMoveType;
  readonly targetZone: ZoneId;
  readonly ballLocation: ZoneId;
  readonly pressureLevel: PressureLevel;
}): string {
  if (input.outcome === BuildUpPressingOutcome.DangerousTurnover) {
    return "PRESS_FORCED_TURNOVER";
  }

  if (input.outcome === BuildUpPressingOutcome.ForcedClearance) {
    return "PRESS_FORCED_CLEARANCE";
  }

  if (
    input.outcome === BuildUpPressingOutcome.CleanExit &&
    (input.moveType === SpatialMoveType.Progression ||
      input.moveType === SpatialMoveType.DirectVerticalAttack ||
      input.moveType === SpatialMoveType.WeakSideSwitch)
  ) {
    return "PRESS_ESCAPED";
  }

  if (input.outcome === BuildUpPressingOutcome.ForcedBackwardPlay) {
    return "PRESS_ABSORBED";
  }

  if (input.outcome === BuildUpPressingOutcome.ControlledRecycle) {
    return "PRESS_ABSORBED";
  }

  if (
    input.moveType === SpatialMoveType.LateralCirculation &&
    (input.outcome === BuildUpPressingOutcome.CleanExit ||
      input.outcome === BuildUpPressingOutcome.PressBroken)
  ) {
    return input.pressureLevel === PressureLevel.High ? "PRESS_AVOIDED" : "PRESS_ESCAPED";
  }

  if (
    input.moveType === SpatialMoveType.DirectVerticalAttack &&
    input.outcome === BuildUpPressingOutcome.PressBroken
  ) {
    return "PRESS_PUNISHED";
  }

  if (
    input.moveType === SpatialMoveType.Progression ||
    input.moveType === SpatialMoveType.DirectVerticalAttack ||
    input.moveType === SpatialMoveType.WeakSideSwitch
  ) {
    return "PRESS_BROKEN";
  }

  return "PRESS_ESCAPED";
}

function getAllowedMoveTypes(input: {
  readonly outcome: BuildUpPressingOutcome;
  readonly tacticalStyle: TacticalStyle;
}): readonly SpatialMoveType[] {
  const riskyIdentity =
    input.tacticalStyle === TacticalStyle.Blitz || input.tacticalStyle === TacticalStyle.ChaosHunters;

  switch (input.outcome) {
    case BuildUpPressingOutcome.PressBroken:
      return [
        SpatialMoveType.Progression,
        SpatialMoveType.DirectVerticalAttack,
        SpatialMoveType.WeakSideSwitch,
      ];
    case BuildUpPressingOutcome.CleanExit:
      return riskyIdentity
        ? [SpatialMoveType.Progression, SpatialMoveType.DirectVerticalAttack, SpatialMoveType.LateralCirculation]
        : [SpatialMoveType.LateralCirculation, SpatialMoveType.Progression];
    case BuildUpPressingOutcome.WeakSideExposed:
      return [
        SpatialMoveType.Progression,
        SpatialMoveType.DirectVerticalAttack,
        SpatialMoveType.WeakSideSwitch,
      ];
    case BuildUpPressingOutcome.ControlledRecycle:
      return riskyIdentity
        ? [
            SpatialMoveType.Progression,
            SpatialMoveType.DirectVerticalAttack,
            SpatialMoveType.LateralCirculation,
            SpatialMoveType.BackwardRecycle,
          ]
        : [SpatialMoveType.LateralCirculation, SpatialMoveType.BackwardRecycle];
    case BuildUpPressingOutcome.ForcedBackwardPlay:
      return [SpatialMoveType.BackwardRecycle, SpatialMoveType.SafetyClearance];
    case BuildUpPressingOutcome.ForcedClearance:
      return [SpatialMoveType.SafetyClearance, SpatialMoveType.BackwardRecycle];
    case BuildUpPressingOutcome.DangerousTurnover:
      return [SpatialMoveType.LateralCirculation, SpatialMoveType.BackwardRecycle];
  }
}

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

function describeSupportType(moveType: SpatialMoveType): string {
  switch (moveType) {
    case SpatialMoveType.Progression:
      return "FORWARD_OUTLET";
    case SpatialMoveType.DirectVerticalAttack:
      return "DEPTH_SUPPORT";
    case SpatialMoveType.WeakSideSwitch:
      return "WEAK_SIDE_SWITCH_SUPPORT";
    case SpatialMoveType.BackwardRecycle:
      return "SAFE_RECYCLE";
    case SpatialMoveType.SafetyClearance:
      return "EMERGENCY_RELEASE";
    case SpatialMoveType.LateralCirculation:
      return "INSIDE_SUPPORT";
    case SpatialMoveType.Finishing:
      return "FINISHING_SUPPORT";
  }
}

function describeSupportPurpose(moveType: SpatialMoveType): string {
  switch (moveType) {
    case SpatialMoveType.Progression:
      return "forward inside outlet";
    case SpatialMoveType.DirectVerticalAttack:
      return "depth runner for a vertical escape";
    case SpatialMoveType.WeakSideSwitch:
      return "weak-side switch support";
    case SpatialMoveType.BackwardRecycle:
      return "recycle outlet under pressure";
    case SpatialMoveType.SafetyClearance:
      return "emergency release away from the trap";
    case SpatialMoveType.LateralCirculation:
      return "inside support to escape the pressure lane";
    case SpatialMoveType.Finishing:
      return "finishing support near the scoring window";
  }
}

function createUpdatedContext(
  input: ResolveBuildUpUnderPressureInput,
  outcome: BuildUpPressingOutcome,
  pressureLevel: PressureLevel,
  targetSelection: TargetZoneSelection,
): UpdatedTacticalContext {
  return {
    activeZone: targetSelection.selectedZone,
    targetZone: targetSelection.selectedZone,
    moveType: targetSelection.moveType,
    pressureLevel,
    outcome,
    updates: createContextUpdates(outcome),
    exposedZones: input.weakSide.switchTargetZones,
  };
}

export function resolveBuildUpUnderPressure(
  input: ResolveBuildUpUnderPressureInput,
): IsolatedInteractionResult {
  const support = evaluateSupport({
    offensiveTeam: input.offensiveTeam,
    offensiveSpread: input.offensiveSpread,
    weakSide: input.weakSide,
  });
  const buildUp = evaluateBuildUpCapability({
    offensiveTeam: input.offensiveTeam,
    support,
    weakSide: input.weakSide,
  });
  const trap = evaluateTrap({
    defensiveTeam: input.defensiveTeam,
    activeZone: input.activeZone,
    weakSide: input.weakSide,
  });
  const pressure = evaluatePressure({
    activeZone: input.activeZone,
    density: input.density,
    defensiveCompactness: input.defensiveCompactness,
    contextualPressure: input.contextualPressure,
  });
  const pressing = evaluatePressing({
    defensiveTeam: input.defensiveTeam,
    defensiveCompactness: input.defensiveCompactness,
    pressure,
    trap,
  });
  const rawOutcome = chooseOutcome(
    buildUp.buildUpCapability,
    pressing.pressingCapability,
    pressure.pressureLevel,
    input.weakSide,
  );
  const sideContext = classifySideContext({
    density: input.density,
    pressingLocation: input.ballContext.ballLocation,
    weakSide: input.weakSide,
  });
  const memoryBiases = createTargetSelectionMemoryModifiers({
    memory: input.tacticalMemory,
    attackingTeamId: input.offensiveTeam.teamId,
    defendingTeamId: input.defensiveTeam.teamId,
    attackingTeamName: input.offensiveTeam.teamName,
    defendingTeamName: input.defensiveTeam.teamName,
    interaction: TacticalMemoryInteraction.BuildUp,
  });
  const principles = evaluateTacticalPrinciples({
    attackingTeam: input.offensiveTeam,
    defendingTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    sideContext,
    weakSide: input.weakSide,
    defensiveCompactness: input.defensiveCompactness,
    pressure: pressure.pressureLevel,
    territorialPressure: input.territorialPressure,
    chaosLevel: input.chaosLevel,
  });
  const targetSelection = selectTargetZone({
    context: {
      team: input.offensiveTeam,
      opponentTeam: input.defensiveTeam,
      ballContext: input.ballContext,
      currentPressure: pressure.pressureLevel,
      chaosLevel: input.chaosLevel,
      territorialPressure: input.territorialPressure,
      weakSide: input.weakSide,
      defensiveCompactness: input.defensiveCompactness,
      interactionIntent: TacticalMemoryInteraction.BuildUp,
      sideContext,
      memoryBiases,
      tacticalDanger: input.weakSide.exposure >= 67 ? ThreatLevel.High : ThreatLevel.Medium,
      scoringThreat: ThreatLevel.Low,
      principles,
    },
    allowedMoveTypes: getAllowedMoveTypes({
      outcome: rawOutcome,
      tacticalStyle: input.offensiveTeam.tacticalStyle,
    }),
  });
  const chaos = evaluateChaosOutcome({
    chaosLevel: input.chaosLevel,
    pressureLevel: pressure.pressureLevel,
    riskLevel: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    tacticalDiscipline: input.offensiveTeam.collectiveProperties.tacticalDiscipline,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
    mental: getAverageComposure(input.offensiveTeam),
    freshness: getAverageFreshness(input.offensiveTeam),
    supportQuality: support.supportQuality,
  });
  const movementOutcome = refineOutcomeByMove({
    rawOutcome,
    moveType: targetSelection.moveType,
    tacticalStyle: input.offensiveTeam.tacticalStyle,
  });
  const outcome = refineOutcomeByChaos({
    outcome: movementOutcome,
    chaosOutcome: chaos.outcome,
    moveType: targetSelection.moveType,
  });
  const updatedContext = createUpdatedContext(input, outcome, pressure.pressureLevel, targetSelection);
  const involvedRoles = [buildUp.keyBallCarrierRole, support.keySupportRole];
  const tacticalPressResult = describeTacticalPressResult({
    outcome,
    moveType: targetSelection.moveType,
    targetZone: targetSelection.selectedZone,
    ballLocation: input.ballContext.ballLocation,
    pressureLevel: pressure.pressureLevel,
  });
  const outcomeDescription = describeOutcome(outcome);
  const progressionDescription = describeProgression(outcome);
  const actorModel = resolveCanonicalEventActors({
    eventId: `build-up-${input.tick}`,
    tick: input.tick,
    offensiveTeam: input.offensiveTeam,
    defensiveTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    targetSelection,
  });
  const receiverRole = actorModel.receiverRole ?? targetSelection.receiverRole ?? support.keySupportRole;
  const eventChain = resolveTacticalEventChain({
    attackingTeamName: input.offensiveTeam.teamName,
    defendingTeamName: input.defensiveTeam.teamName,
    actorRole: actorModel.primaryActorRole,
    receiverRole,
    supportRole: support.keySupportRole,
    defenderRole: PlayerRole.HookLink,
    fromZone: input.ballContext.ballLocation,
    targetSelection,
    moveType: targetSelection.moveType,
    pressureLevel: pressure.pressureLevel,
    supportQuality: support.supportQuality,
    chaosLevel: input.chaosLevel,
    outcomeLabel: tacticalPressResult,
    actorModel,
  });
  const utilitySelection = selectUtilityActor({
    players: input.offensiveTeam.players,
    actions: [UtilityActionType.Pass, UtilityActionType.Carry, UtilityActionType.Support, UtilityActionType.Kick],
    tacticalStyle: input.offensiveTeam.tacticalStyle,
    spatialAffordance: buildUp.weakSideOpportunity,
    tacticalIntent: support.supportQuality,
    pressure: pressure.activeZoneDensity,
    risk: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
  });
  const logs = [
    createLogLine(`[Tick ${input.tick}]`),
    createLogLine(""),
    ...createBallContextLogs({
      teamName: input.offensiveTeam.teamName,
      defendingTeamName: input.defensiveTeam.teamName,
      ballContext: input.ballContext,
    }),
    createLogLine(`${input.defensiveTeam.teamName} initiates coordinated press around ${input.ballContext.ballLocation}.`),
    createLogLine(`Pressure level: ${pressure.pressureLevel.toUpperCase()}.`),
    ...explainabilityLogs([
      createLogLine(`${input.defensiveTeam.teamName} pressing decision:`),
      createLogLine(`- ball zone: ${input.ballContext.ballLocation}`),
      createLogLine(`- pressing philosophy: ${input.defensiveTeam.tacticalStyle}`),
      createLogLine(`- compactness target: ${input.defensiveCompactness.overallCompactness} / 100`),
      createLogLine(`- pressing intensity target: ${input.defensiveTeam.tacticalInstructions.defensive.pressingIntensity} / 100`),
      createLogLine(`- defensive line height: ${input.defensiveTeam.tacticalInstructions.defensive.blockHeight} / 100`),
      createLogLine(`- territorial trigger: ${input.activeZone} pressure zone`),
      createLogLine(`- active-zone density: ${pressure.activeZoneDensity} / 100`),
      createLogLine(`- risk tolerance: ${100 - input.defensiveTeam.tacticalInstructions.offensive.riskLevel} / 100`),
      createLogLine(`- collective discipline: ${input.defensiveTeam.collectiveProperties.tacticalDiscipline} / 100`),
      createLogLine(`Result: ${pressure.pressureLevel.toUpperCase()} coordinated press triggered around ${input.ballContext.ballLocation}.`),
    ]),
    createLogLine(
      `Shape context: ${input.offensiveTeam.teamName} width ${input.offensiveShape.widthOccupation}, ${input.defensiveTeam.teamName} compactness ${input.defensiveShape.compactness}.`,
    ),
    ...createShapeExplainabilityLogs({
      offensiveTeam: input.offensiveTeam,
      defensiveTeam: input.defensiveTeam,
      offensiveShape: input.offensiveShape,
      defensiveShape: input.defensiveShape,
    }),
    createLogLine(
      `${input.offensiveTeam.teamName} ${formatRole(buildUp.keyBallCarrierRole)} identifies ${describeSupportPurpose(targetSelection.moveType)} in ${targetSelection.selectedZone}.`,
    ),
    ...createUtilityDebugLogs({
      label: `${input.offensiveTeam.teamName} build-up actor`,
      selection: utilitySelection,
    }),
    createLogLine(`Support type: ${describeSupportType(targetSelection.moveType)}.`),
    createLogLine(`${input.offensiveTeam.teamName} support quality: ${support.supportQuality}.`),
    createLogLine(`${input.defensiveTeam.teamName} pressing capability: ${pressing.pressingCapability}.`),
    createLogLine(`${input.offensiveTeam.teamName} build-up resistance: ${buildUp.buildUpCapability}.`),
    ...createBreakdownLogs({
      title: `${input.defensiveTeam.teamName} pressing capability explainability: ${pressing.pressingCapability} / 100`,
      breakdown: pressing.breakdown,
    }),
    ...createBreakdownLogs({
      title: `${input.offensiveTeam.teamName} build-up resistance explainability: ${buildUp.buildUpCapability} / 100`,
      breakdown: [...support.breakdown, ...buildUp.breakdown],
    }),
    ...createRecoverySaturationLogs({
      teamName: input.defensiveTeam.teamName,
      saturation: input.defensiveTeam.recoverySaturation,
    }),
    ...createOffensiveMomentumLogs({
      teamName: input.offensiveTeam.teamName,
      momentum: input.offensiveTeam.offensiveMomentum,
    }),
    ...createOffensivePhilosophyLogs({
      teamName: input.offensiveTeam.teamName,
      tacticalStyle: input.offensiveTeam.tacticalStyle,
      philosophy: input.offensiveTeam.offensiveProgressionPhilosophy,
    }),
    ...createSideContextLogs(sideContext),
    ...createTacticalMemoryLogs(memoryBiases),
    ...createPrincipleEvaluationLogs({
      principles,
      localAdvantage: targetSelection.evaluations[0]?.localAdvantage,
      attackingTeamName: input.offensiveTeam.teamName,
      defendingTeamName: input.defensiveTeam.teamName,
    }),
    ...createTargetSelectionLogs(targetSelection, input.offensiveTeam.teamName),
    ...createTacticalEventChainLogs(eventChain),
    ...createChaosLogs(chaos, {
      teamName: input.offensiveTeam.teamName,
      actor: formatRole(buildUp.keyBallCarrierRole),
    }),
    createLogLine("### Comparative Resolution"),
    createLogLine(`Tactical result: ${tacticalPressResult}.`),
    createLogLine(
      `${progressionDescription} Ball movement: ${input.ballContext.ballLocation} -> ${targetSelection.selectedZone}.`,
    ),
  ];
  const event = createTacticalInteractionEvent({
    tick: input.tick,
    type: InteractionType.BuildUpUnderPressure,
    offensiveTeamId: input.offensiveTeam.teamId,
    defensiveTeamId: input.defensiveTeam.teamId,
    activeZone: input.activeZone,
    pressureLevel: pressure.pressureLevel,
    involvedRoles,
    outcome,
    summary: `${input.offensiveTeam.teamName} vs ${input.defensiveTeam.teamName}: ${outcomeDescription}`,
    tacticalConsequences: updatedContext.updates,
  });

  return {
    outcome,
    pressureLevel: pressure.pressureLevel,
    buildUpCapability: buildUp.buildUpCapability,
    pressingCapability: pressing.pressingCapability,
    supportQuality: support.supportQuality,
    trapQuality: trap.trapQuality,
    weakSideOpportunity: buildUp.weakSideOpportunity,
    updatedContext,
    event,
    logs,
    buildUpBreakdown: [...support.breakdown, ...buildUp.breakdown],
    pressingBreakdown: pressing.breakdown,
  };
}
