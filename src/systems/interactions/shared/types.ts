import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PressureLevel } from "../../../models/match";
import type { PlayerRole } from "../../../models/player";
import type { SpatialMoveType } from "../../spatial/intention";
import type { InteractionType } from "../types";

export enum BuildUpPressingOutcome {
  CleanExit = "clean_exit",
  ControlledRecycle = "controlled_recycle",
  ForcedBackwardPlay = "forced_backward_play",
  ForcedClearance = "forced_clearance",
  DangerousTurnover = "dangerous_turnover",
  PressBroken = "press_broken",
  WeakSideExposed = "weak_side_exposed",
}

export enum TacticalContextUpdateType {
  StructureAdvantage = "structure_advantage",
  TempoStabilized = "tempo_stabilized",
  PressureContinues = "pressure_continues",
  TerritorialLoss = "territorial_loss",
  HighTurnoverDanger = "high_turnover_danger",
  WeakSideOpened = "weak_side_opened",
}

export interface InteractionScoreBreakdown {
  readonly label: string;
  readonly value: Rating;
}

export interface TacticalLogLine {
  readonly text: string;
}

export interface UpdatedTacticalContext {
  readonly activeZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly moveType: SpatialMoveType;
  readonly pressureLevel: PressureLevel;
  readonly outcome: BuildUpPressingOutcome;
  readonly updates: readonly TacticalContextUpdateType[];
  readonly exposedZones: readonly ZoneId[];
}

export interface TacticalInteractionEvent {
  readonly tick: TacticalTick;
  readonly type: InteractionType;
  readonly offensiveTeamId: TeamId;
  readonly defensiveTeamId: TeamId;
  readonly activeZone: ZoneId;
  readonly pressureLevel: PressureLevel;
  readonly involvedRoles: readonly PlayerRole[];
  readonly outcome: BuildUpPressingOutcome;
  readonly summary: string;
  readonly tacticalConsequences: readonly string[];
}

export interface IsolatedInteractionResult {
  readonly outcome: BuildUpPressingOutcome;
  readonly pressureLevel: PressureLevel;
  readonly buildUpCapability: Rating;
  readonly pressingCapability: Rating;
  readonly supportQuality: Rating;
  readonly trapQuality: Rating;
  readonly weakSideOpportunity: Rating;
  readonly updatedContext: UpdatedTacticalContext;
  readonly event: TacticalInteractionEvent;
  readonly logs: readonly TacticalLogLine[];
  readonly buildUpBreakdown: readonly InteractionScoreBreakdown[];
  readonly pressingBreakdown: readonly InteractionScoreBreakdown[];
}
