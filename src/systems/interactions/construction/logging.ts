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
import { PressureLevel } from "../../../models/match";
import { createTacticalEventChainLogs, resolveTacticalEventChain } from "../../events";
import { createLogLine } from "../shared/logging";
import type { TacticalLogLine } from "../shared";
import { ConstructionContextUpdateType, type ConstructionInteractionResult } from "./types";

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

export interface ConstructionLogInput {
  readonly result: Omit<ConstructionInteractionResult, "logs">;
  readonly offensiveTeamName: string;
  readonly defensiveTeamName: string;
  readonly ballContext: BallContext;
  readonly targetSelection: TargetZoneSelection;
  readonly contextLogs?: readonly TacticalLogLine[];
}

export function createConstructionLogs(input: ConstructionLogInput): readonly TacticalLogLine[] {
  const finishingPending = input.result.updatedContext.updates.includes(
    ConstructionContextUpdateType.FinishingOpportunityPending,
  );
  const immediateFinishing = input.targetSelection.moveType === SpatialMoveType.Finishing;
  const dangerText = immediateFinishing
    ? "Immediate finishing resolution triggered."
    : input.result.updatedContext.finishingTrigger.triggered
      ? "Finishing opportunity pending."
      : "No finishing trigger yet.";
  const weakSideClassification = classifyWeakSideByDirection({
    ballLocation: input.ballContext.ballLocation,
    weakSideZone: input.result.updatedContext.weakSideTarget,
    attackingDirection: input.ballContext.attackingDirection,
  });
  const weakSideLine =
    weakSideClassification.role === WeakSideSpatialRole.DangerousWeakSide
      ? `Dangerous weak side detected in ${input.result.updatedContext.weakSideTarget}; spatial support is calculated in the influence map snapshot block.`
      : `Weak-side recycle option detected in ${input.result.updatedContext.weakSideTarget} (${weakSideClassification.description}); spatial support is calculated in the influence map snapshot block.`;
  const eventChain = resolveTacticalEventChain({
    attackingTeamName: input.offensiveTeamName,
    defendingTeamName: input.defensiveTeamName,
    actorRole: input.ballContext.ballCarrierRole,
    receiverRole: input.targetSelection.receiverRole ?? input.result.support.supportRole,
    supportRole: input.result.support.supportRole,
    defenderRole: input.result.defensiveStability.keyDefenderRole,
    fromZone: input.ballContext.ballLocation,
    targetSelection: input.targetSelection,
    moveType: input.targetSelection.moveType,
    pressureLevel: PressureLevel.Medium,
    supportQuality: input.result.support.supportQuality,
    chaosLevel: input.result.risk.riskScore,
    outcomeLabel: input.result.outcome.toUpperCase(),
  });

  return [
    createLogLine(`[Tick ${input.result.event.tick}]`),
    createLogLine(""),
    ...createBallContextLogs({
      teamName: input.offensiveTeamName,
      defendingTeamName: input.defensiveTeamName,
      ballContext: input.ballContext,
    }),
    createLogLine(`${input.offensiveTeamName} enters offensive construction.`),
    createLogLine(`${formatRole(input.result.manipulation.keyOrganizerRole)} slows the rhythm and organizes support.`),
    createLogLine(`${input.offensiveTeamName} uses width to move the defensive block.`),
    ...(input.contextLogs ?? []),
    ...createTargetSelectionLogs(input.targetSelection, input.offensiveTeamName),
    ...createTacticalEventChainLogs(eventChain),
    createLogLine(`${input.defensiveTeamName} block stability: ${input.result.defensiveStability.blockStability} / 100.`),
    createLogLine(weakSideLine),
    createLogLine(`Territorial pressure: ${input.result.territorialPressure} / 100.`),
    createLogLine(`Tactical danger: ${input.result.dangerLevel}.`),
    createLogLine(`Scoring danger: ${input.result.finishingTrigger.scoringDanger}.`),
    createLogLine(input.result.finishingTrigger.reason),
    ...(immediateFinishing
      ? [createLogLine("Selected finishing action resolves immediately.")]
      : [
          createLogLine(input.result.event.summary),
          createLogLine(finishingPending ? dangerText : "Construction remains below finishing danger."),
        ]),
  ];
}
