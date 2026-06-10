import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { LateralCorridor, ZoneId } from "../../../core/zones";
import type { MovementPosition } from "../../movement";

export interface TeamInfluenceValue {
  readonly teamId: TeamId;
  readonly value: Rating;
}

export interface ProjectedArrival {
  readonly teamId: TeamId;
  readonly playerId: string;
  readonly playerInitials: string;
  readonly zone: ZoneId;
  readonly arrivalTick: TacticalTick;
  readonly arrivalDeltaTicks: number;
  readonly influenceValue: Rating;
  readonly movementType: string;
  readonly sprinting: boolean;
}

export interface InfluenceSourcePlayer {
  readonly playerId: string;
  readonly teamId: TeamId;
  readonly initials: string;
  readonly currentZone: ZoneId;
  readonly targetZone: ZoneId | null;
  readonly intent: string;
  readonly movementType: string | null;
  readonly arrivalTick: TacticalTick | null;
  readonly currentInfluence: Rating;
  readonly projectedInfluence: Rating;
  readonly perceptionConfidence: Rating;
  readonly pressureRecognition: Rating;
  readonly blindSideExposure: Rating;
  readonly reactionDelayTicks: number;
}

export interface InfluenceCell {
  readonly zone: ZoneId;
  readonly lane: LateralCorridor;
  readonly centerPosition: MovementPosition;
  readonly controlTeamId: TeamId | null;
  readonly controlValueByTeam: readonly TeamInfluenceValue[];
  readonly pressureByTeam: readonly TeamInfluenceValue[];
  readonly dangerByTeam: readonly TeamInfluenceValue[];
  readonly attackingDensityByTeam: readonly TeamInfluenceValue[];
  readonly defensiveDensityByTeam: readonly TeamInfluenceValue[];
  readonly projectedArrivalsByTeam: readonly ProjectedArrival[];
  readonly earliestArrivalByTeam: readonly {
    readonly teamId: TeamId;
    readonly tick: TacticalTick | null;
  }[];
  readonly contestedness: Rating;
  readonly openness: Rating;
  readonly coverShadowValue: Rating;
  readonly weakSideValue: Rating;
  readonly overloadValue: Rating;
  readonly recoveryPressure: Rating;
  readonly sourcePlayers: readonly InfluenceSourcePlayer[];
}
