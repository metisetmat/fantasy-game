import type { Rating } from "../../../core/ratings";
import type { PressureLevel } from "../../../models/match";
import type { PlayerRole } from "../../../models/player";
import type { TacticalStyle } from "../../../models/tactics";
import type { SpatialMoveType } from "../../spatial/intention/types";

export interface RoleBehaviorProfile {
  readonly role: PlayerRole;
  readonly source: "generic role" | "team override";
  readonly normalBehavior: string;
  readonly pressingBehavior: string;
  readonly transitionBehavior: string;
  readonly chaosBehavior: string;
  readonly finishingBehavior: string;
  readonly fatigueBehavior: string;
  readonly supportBehavior: string;
  readonly riskTolerance: Rating;
  readonly moveBiases: Readonly<Partial<Record<SpatialMoveType, number>>>;
  readonly chaosRiskResponse: number;
  readonly fatigueConservatism: number;
  readonly pressureConservatism: number;
}

export interface RoleBehaviorEvaluation {
  readonly role: PlayerRole;
  readonly source: "generic role" | "team override";
  readonly modifier: number;
  readonly riskTolerance: Rating;
  readonly reasons: readonly string[];
}

export interface RoleBehaviorContext {
  readonly role: PlayerRole;
  readonly tacticalStyle?: TacticalStyle;
  readonly moveType: SpatialMoveType;
  readonly pressure: PressureLevel;
  readonly chaosLevel: Rating;
  readonly fatigue: Rating;
  readonly momentum: Rating;
}
