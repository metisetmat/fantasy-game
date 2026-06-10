import type { Rating } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PlayerId } from "../../../core/ids";
import type { PlayerRole } from "../../../models/player";

export enum PassingLaneDifficulty {
  Open = "OPEN",
  Contested = "CONTESTED",
  Closed = "CLOSED",
}

export enum ReceiverAvailabilityLevel {
  Free = "FREE",
  Supported = "SUPPORTED",
  Isolated = "ISOLATED",
  Unavailable = "UNAVAILABLE",
}

export interface LocalNumericalAdvantageEvaluation {
  readonly targetZone: ZoneId;
  readonly attackersInTarget: number;
  readonly defendersInTarget: number;
  readonly nearbySupport: number;
  readonly goalSideDefenders: number;
  readonly numericalScore: Rating;
  readonly description: string;
}

export interface PassingLaneEvaluation {
  readonly targetZone: ZoneId;
  readonly difficulty: PassingLaneDifficulty;
  readonly openness: Rating;
  readonly reason: string;
}

export interface ReceiverAvailabilityEvaluation {
  readonly targetZone: ZoneId;
  readonly level: ReceiverAvailabilityLevel;
  readonly receiverId: PlayerId | null;
  readonly receiverRole: PlayerRole | null;
  readonly receiverInitials: string | null;
  readonly receiverZone: ZoneId | null;
  readonly score: Rating;
  readonly reason: string;
}

export interface LocalAdvantageEvaluation {
  readonly numerical: LocalNumericalAdvantageEvaluation;
  readonly passingLane: PassingLaneEvaluation;
  readonly receiver: ReceiverAvailabilityEvaluation;
}
