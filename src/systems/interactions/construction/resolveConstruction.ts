import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { PressureLevel } from "../../../models/match";
import type { ShapeState } from "../../../models/tactics";
import type {
  CompactnessEvaluation,
  DensityEvaluation,
  OffensiveSpreadEvaluation,
  SpatialTeamContext,
  WeakSideEvaluation,
} from "../../spatial";
import {
  selectTargetZone,
  SpatialMoveType,
  ThreatLevel,
  createOffensiveUrgencyLogs,
  evaluateOffensiveUrgency,
  type BallContext,
  type TargetZoneSelection,
} from "../../spatial/intention";
import { classifySideContext, createSideContextLogs } from "../../spatial/sides";
import { createOffensivePhilosophyLogs } from "../../offense";
import { createOffensiveMomentumLogs } from "../../offense/momentum";
import { createPrincipleEvaluationLogs, evaluateTacticalPrinciples } from "../../principles";
import { ChaosOutcome, createChaosLogs, evaluateChaosOutcome } from "../../chaos";
import { UtilityActionType, createUtilityDebugLogs, selectUtilityActor } from "../../ai/utility";
import {
  TacticalMemoryInteraction,
  createTacticalMemoryLogs,
  createTargetSelectionMemoryModifiers,
  type TacticalMemoryState,
} from "../../tacticalMemory";
import { InteractionType } from "../types";
import { clampInteractionRating } from "../shared/ratings";
import { evaluateFinishingTrigger, FinishingDangerLevel } from "../finishing";
import { evaluateBlockManipulation } from "./evaluateBlockManipulation";
import { evaluateConstructionRisk } from "./evaluateConstructionRisk";
import { evaluateConstructionSupport } from "./evaluateConstructionSupport";
import { evaluateDefensiveBlockStability } from "./evaluateDefensiveBlockStability";
import { evaluateTerritorialProgression } from "./evaluateTerritorialProgression";
import { createConstructionLogs } from "./logging";
import {
  ConstructionContextUpdateType,
  ConstructionDangerLevel,
  ConstructionOutcome,
  type ConstructionInteractionEvent,
  type ConstructionInteractionResult,
  type UpdatedConstructionContext,
} from "./types";

export interface ResolveConstructionInput {
  readonly tick: TacticalTick;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly offensiveShape: ShapeState;
  readonly defensiveShape: ShapeState;
  readonly density: DensityEvaluation;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly baseTerritorialPressure: number;
  readonly ballContext: BallContext;
  readonly chaosLevel: number;
  readonly tacticalMemory: TacticalMemoryState;
}

function getDangerLevel(score: number): ConstructionDangerLevel {
  if (score >= 67) {
    return ConstructionDangerLevel.High;
  }

  if (score <= 33) {
    return ConstructionDangerLevel.Low;
  }

  return ConstructionDangerLevel.Medium;
}

function chooseConstructionOutcome(input: {
  readonly constructionScore: number;
  readonly blockStability: number;
  readonly weakSideOpportunity: number;
  readonly territorialPressure: number;
  readonly riskScore: number;
  readonly chaosOutcome: ChaosOutcome;
}): ConstructionOutcome {
  if (input.chaosOutcome === ChaosOutcome.ForcedTurnover || input.chaosOutcome === ChaosOutcome.TechnicalError) {
    return ConstructionOutcome.DangerousInterception;
  }

  if (input.chaosOutcome === ChaosOutcome.SupportFailure || input.chaosOutcome === ChaosOutcome.PoorDecision) {
    return ConstructionOutcome.ConstructionStalled;
  }

  if (input.riskScore >= 78 && input.blockStability > input.constructionScore) {
    return ConstructionOutcome.DangerousInterception;
  }

  if (input.constructionScore >= input.blockStability + 18 && input.weakSideOpportunity >= 65) {
    return ConstructionOutcome.WeakSideCreated;
  }

  if (input.constructionScore >= input.blockStability + 12) {
    return ConstructionOutcome.BlockStretched;
  }

  if (input.territorialPressure >= 62 && input.constructionScore >= input.blockStability) {
    return ConstructionOutcome.TerritorialProgression;
  }

  if (input.blockStability >= input.constructionScore + 16) {
    return ConstructionOutcome.ConstructionStalled;
  }

  if (input.riskScore >= 62) {
    return ConstructionOutcome.ForcedBackwardCirculation;
  }

  return ConstructionOutcome.PossessionRecycled;
}

function createUpdates(input: {
  readonly outcome: ConstructionOutcome;
  readonly finishingTriggered: boolean;
}): readonly ConstructionContextUpdateType[] {
  const dangerUpdate =
    input.finishingTriggered
      ? [ConstructionContextUpdateType.FinishingOpportunityPending]
      : [];

  switch (input.outcome) {
    case ConstructionOutcome.WeakSideCreated:
      return [ConstructionContextUpdateType.WeakSideOpened, ConstructionContextUpdateType.TerritoryGained, ...dangerUpdate];
    case ConstructionOutcome.BlockStretched:
      return [ConstructionContextUpdateType.BlockManipulated, ...dangerUpdate];
    case ConstructionOutcome.TerritorialProgression:
      return [ConstructionContextUpdateType.TerritoryGained, ...dangerUpdate];
    case ConstructionOutcome.PossessionRecycled:
      return [ConstructionContextUpdateType.RhythmControlled, ...dangerUpdate];
    case ConstructionOutcome.ConstructionStalled:
    case ConstructionOutcome.ForcedBackwardCirculation:
      return [ConstructionContextUpdateType.ConstructionSlowed, ...dangerUpdate];
    case ConstructionOutcome.DangerousInterception:
      return [ConstructionContextUpdateType.InterceptionThreat, ...dangerUpdate];
  }
}

function describeOutcome(outcome: ConstructionOutcome): string {
  switch (outcome) {
    case ConstructionOutcome.BlockStretched:
      return "The defensive block begins to stretch.";
    case ConstructionOutcome.TerritorialProgression:
      return "Territorial pressure increased.";
    case ConstructionOutcome.WeakSideCreated:
      return "Weak side created by sustained circulation.";
    case ConstructionOutcome.PossessionRecycled:
      return "Possession recycled with control.";
    case ConstructionOutcome.ConstructionStalled:
      return "Construction stalled by compact central resistance.";
    case ConstructionOutcome.ForcedBackwardCirculation:
      return "Forced backward circulation.";
    case ConstructionOutcome.DangerousInterception:
      return "Dangerous interception threat created by the block.";
  }
}

function mapConstructionDangerLevel(level: ConstructionDangerLevel): FinishingDangerLevel {
  switch (level) {
    case ConstructionDangerLevel.High:
      return FinishingDangerLevel.High;
    case ConstructionDangerLevel.Medium:
      return FinishingDangerLevel.Medium;
    case ConstructionDangerLevel.Low:
      return FinishingDangerLevel.Low;
  }
}

function scoringDangerRating(level: FinishingDangerLevel): number {
  switch (level) {
    case FinishingDangerLevel.High:
      return 82;
    case FinishingDangerLevel.Medium:
      return 54;
    case FinishingDangerLevel.Low:
      return 18;
  }
}

function toThreatLevel(level: FinishingDangerLevel): ThreatLevel {
  switch (level) {
    case FinishingDangerLevel.High:
      return ThreatLevel.High;
    case FinishingDangerLevel.Medium:
      return ThreatLevel.Medium;
    case FinishingDangerLevel.Low:
      return ThreatLevel.Low;
  }
}

export function resolveConstruction(input: ResolveConstructionInput): ConstructionInteractionResult {
  const support = evaluateConstructionSupport({
    offensiveTeam: input.offensiveTeam,
    offensiveSpread: input.offensiveSpread,
    weakSide: input.weakSide,
  });
  const manipulation = evaluateBlockManipulation({
    offensiveTeam: input.offensiveTeam,
    offensiveSpread: input.offensiveSpread,
    support,
    weakSide: input.weakSide,
  });
  const defensiveStability = evaluateDefensiveBlockStability({
    defensiveTeam: input.defensiveTeam,
    defensiveCompactness: input.defensiveCompactness,
    density: input.density,
    activeZone: input.activeZone,
    weakSide: input.weakSide,
  });
  const progression = evaluateTerritorialProgression({
    offensiveTeam: input.offensiveTeam,
    offensiveSpread: input.offensiveSpread,
    support,
    manipulation,
    weakSide: input.weakSide,
    activeZone: input.activeZone,
    baseTerritorialPressure: input.baseTerritorialPressure,
  });
  const risk = evaluateConstructionRisk({
    offensiveTeam: input.offensiveTeam,
    defensiveStability,
    support,
    manipulation,
    density: input.density,
  });
  const averageComposure = Math.round(
    input.offensiveTeam.players.reduce((sum, player) => sum + player.attributes.mental, 0) /
      Math.max(1, input.offensiveTeam.players.length),
  );
  const averageFreshness = Math.round(
    input.offensiveTeam.players.reduce((sum, player) => sum + player.fatigue.freshness, 0) /
      Math.max(1, input.offensiveTeam.players.length),
  );
  const chaos = evaluateChaosOutcome({
    chaosLevel: input.chaosLevel,
    pressureLevel: PressureLevel.Medium,
    riskLevel: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    tacticalDiscipline: input.offensiveTeam.collectiveProperties.tacticalDiscipline,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
    mental: averageComposure,
    freshness: averageFreshness,
    supportQuality: support.supportQuality,
  });
  const constructionScore = clampInteractionRating(
    manipulation.manipulationQuality * 0.32 +
      support.supportQuality * 0.22 +
      progression.progressionQuality * 0.24 +
      (100 - risk.riskScore) * 0.1 +
      input.offensiveShape.widthOccupation * 0.06 +
      input.defensiveShape.compactness * 0.06,
  );
  const pressureAfterConstruction = clampInteractionRating(
    progression.territorialPressure * 0.55 +
      progression.weakSideOpportunity * 0.25 +
      (100 - defensiveStability.blockStability) * 0.2,
  );
  const dangerLevel = getDangerLevel(pressureAfterConstruction);
  const outcome = chooseConstructionOutcome({
    constructionScore,
    blockStability: defensiveStability.blockStability,
    weakSideOpportunity: progression.weakSideOpportunity,
    territorialPressure: progression.territorialPressure,
    riskScore: risk.riskScore,
    chaosOutcome: chaos.outcome,
  });
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
    interaction: TacticalMemoryInteraction.Construction,
  });
  const principles = evaluateTacticalPrinciples({
    attackingTeam: input.offensiveTeam,
    defendingTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    sideContext,
    weakSide: input.weakSide,
    defensiveCompactness: input.defensiveCompactness,
    pressure: PressureLevel.Medium,
    territorialPressure: progression.territorialPressure,
    chaosLevel: input.chaosLevel,
  });
  const currentFinishingThreat = evaluateFinishingTrigger({
    teamName: input.offensiveTeam.teamName,
    activeZone: input.ballContext.ballLocation,
    attackingDirection: input.ballContext.attackingDirection,
    territorialPressure: progression.territorialPressure,
    tacticalDanger: mapConstructionDangerLevel(dangerLevel),
    offensiveInstructions: input.offensiveTeam.tacticalInstructions.offensive,
    weakSideExposure: input.weakSide.exposure,
  });
  const offensiveUrgency = evaluateOffensiveUrgency({
    team: input.offensiveTeam,
    opponentTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    currentPressure: PressureLevel.Medium,
    chaosLevel: input.chaosLevel,
    territorialPressure: progression.territorialPressure,
    weakSide: input.weakSide,
    defensiveCompactness: input.defensiveCompactness,
    interactionIntent: TacticalMemoryInteraction.Construction,
    sideContext,
    memoryBiases,
    tacticalDanger: mapConstructionDangerLevel(dangerLevel) === FinishingDangerLevel.High ? ThreatLevel.High : ThreatLevel.Medium,
    scoringThreat: toThreatLevel(currentFinishingThreat.scoringDanger),
    principles,
    ...(currentFinishingThreat.possibleScoringTypes[0] === undefined
      ? {}
      : { finishingOptionLabel: `${currentFinishingThreat.possibleScoringTypes[0].toUpperCase()}_ATTEMPT` }),
  });
  const targetSelection: TargetZoneSelection = selectTargetZone({
    context: {
      team: input.offensiveTeam,
      opponentTeam: input.defensiveTeam,
      ballContext: input.ballContext,
      currentPressure: PressureLevel.Medium,
      chaosLevel: input.chaosLevel,
      territorialPressure: progression.territorialPressure,
      weakSide: input.weakSide,
      defensiveCompactness: input.defensiveCompactness,
      interactionIntent: TacticalMemoryInteraction.Construction,
      sideContext,
      memoryBiases,
      tacticalDanger: mapConstructionDangerLevel(dangerLevel) === FinishingDangerLevel.High ? ThreatLevel.High : ThreatLevel.Medium,
      scoringThreat: toThreatLevel(currentFinishingThreat.scoringDanger),
      offensiveUrgency,
      principles,
      ...(currentFinishingThreat.possibleScoringTypes[0] === undefined
        ? {}
        : { finishingOptionLabel: `${currentFinishingThreat.possibleScoringTypes[0].toUpperCase()}_ATTEMPT` }),
    },
    allowedMoveTypes: [
      SpatialMoveType.LateralCirculation,
      SpatialMoveType.Progression,
      SpatialMoveType.WeakSideSwitch,
      ...(input.offensiveTeam.tacticalInstructions.offensive.riskLevel >= 65
        ? [SpatialMoveType.DirectVerticalAttack]
        : []),
      SpatialMoveType.Finishing,
    ],
  });
  const finishingTrigger =
    targetSelection.moveType === SpatialMoveType.Finishing
      ? currentFinishingThreat
      : evaluateFinishingTrigger({
          teamName: input.offensiveTeam.teamName,
          activeZone: targetSelection.selectedZone,
          attackingDirection: input.ballContext.attackingDirection,
          territorialPressure: progression.territorialPressure,
          tacticalDanger: mapConstructionDangerLevel(dangerLevel),
          offensiveInstructions: input.offensiveTeam.tacticalInstructions.offensive,
          weakSideExposure: input.weakSide.exposure,
        });
  const updates = createUpdates({
    outcome,
    finishingTriggered: finishingTrigger.triggered,
  });
  const updatedContext: UpdatedConstructionContext = {
    activeZone: targetSelection.selectedZone,
    targetZone: targetSelection.selectedZone,
    moveType: targetSelection.moveType,
    outcome,
    dangerLevel,
    territorialPressure: progression.territorialPressure,
    weakSideTarget: targetSelection.selectedZone,
    finishingTrigger,
    updates,
  };
  const eventSummary =
    targetSelection.moveType === SpatialMoveType.Finishing
      ? "Immediate finishing resolution triggered."
      : describeOutcome(outcome);
  const event: ConstructionInteractionEvent = {
    tick: input.tick,
    type: InteractionType.OffensiveConstruction,
    offensiveTeamId: input.offensiveTeam.teamId,
    defensiveTeamId: input.defensiveTeam.teamId,
    activeZone: input.activeZone,
    involvedRoles: [
      manipulation.keyOrganizerRole,
      support.supportRole,
      defensiveStability.keyDefenderRole,
    ],
    outcome,
    dangerLevel,
    tacticalConsequences: updates,
    summary: eventSummary,
  };
  const resultWithoutLogs = {
    outcome,
    dangerLevel,
    constructionScore,
    blockStability: defensiveStability.blockStability,
    territorialPressure: progression.territorialPressure,
    scoringDanger: scoringDangerRating(finishingTrigger.scoringDanger),
    manipulation,
    progression,
    defensiveStability,
    support,
    risk,
    finishingTrigger,
    updatedContext,
    event,
  };
  const utilitySelection = selectUtilityActor({
    players: input.offensiveTeam.players,
    actions: [UtilityActionType.Pass, UtilityActionType.Support, UtilityActionType.Carry, UtilityActionType.AttackSpace],
    tacticalStyle: input.offensiveTeam.tacticalStyle,
    spatialAffordance: progression.territorialPressure,
    tacticalIntent: input.offensiveTeam.tacticalInstructions.offensive.collectiveness,
    pressure: defensiveStability.blockStability,
    risk: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
  });

  return {
    ...resultWithoutLogs,
    logs: createConstructionLogs({
      result: resultWithoutLogs,
      offensiveTeamName: input.offensiveTeam.teamName,
      defensiveTeamName: input.defensiveTeam.teamName,
      ballContext: input.ballContext,
      targetSelection,
      contextLogs: [
        ...createOffensivePhilosophyLogs({
          teamName: input.offensiveTeam.teamName,
          tacticalStyle: input.offensiveTeam.tacticalStyle,
          philosophy: input.offensiveTeam.offensiveProgressionPhilosophy,
        }),
        ...createOffensiveMomentumLogs({
          teamName: input.offensiveTeam.teamName,
          momentum: input.offensiveTeam.offensiveMomentum,
        }),
        ...createSideContextLogs(sideContext),
        ...createTacticalMemoryLogs(memoryBiases),
        ...createPrincipleEvaluationLogs({
          principles,
          localAdvantage: targetSelection.evaluations[0]?.localAdvantage,
          attackingTeamName: input.offensiveTeam.teamName,
          defendingTeamName: input.defensiveTeam.teamName,
        }),
        ...createOffensiveUrgencyLogs(offensiveUrgency),
        ...createUtilityDebugLogs({
          label: `${input.offensiveTeam.teamName} construction actor`,
          selection: utilitySelection,
        }),
        ...createChaosLogs(chaos, {
          teamName: input.offensiveTeam.teamName,
          actor: utilitySelection.selected.player.roleInitials ?? utilitySelection.selected.player.role,
        }),
      ],
    }),
  };
}
