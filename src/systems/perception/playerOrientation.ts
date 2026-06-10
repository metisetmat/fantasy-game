import type { PlayerId } from "../../core/ids";
import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { FacingDirection } from "./facingDirection";

export enum ScanningState {
  LockedOnBall = "LOCKED_ON_BALL",
  ScanningWeakSide = "SCANNING_WEAK_SIDE",
  ScanningSupport = "SCANNING_SUPPORT",
  ScanningDepth = "SCANNING_DEPTH",
  ScanningRebound = "SCANNING_REBOUND",
  Overloaded = "OVERLOADED",
}

export interface AwarenessMemory {
  readonly knownThreatZones: readonly ZoneId[];
  readonly knownRunnerIds: readonly PlayerId[];
  readonly lastKnownBallZone: ZoneId;
  readonly lastKnownOverloadZone: ZoneId | null;
  readonly certainty: Rating;
  readonly updatedTick: TacticalTick;
}

export interface PlayerOrientation {
  readonly playerId: PlayerId;
  readonly facingDirection: FacingDirection;
  readonly facingAngle: number;
  readonly bodyTurnSpeed: Rating;
  readonly currentFocus: ZoneId;
  readonly scanningState: ScanningState;
  readonly awarenessRadius: number;
  readonly blindSideZones: readonly ZoneId[];
  readonly recentSeenPlayers: readonly PlayerId[];
  readonly recentSeenBallState: ZoneId;
  readonly orientationConfidence: Rating;
  readonly lastScanTick: TacticalTick;
  readonly awarenessDecay: Rating;
  readonly memory: AwarenessMemory;
}

export interface PerceptionState {
  readonly orientation: PlayerOrientation;
  readonly scanFreshnessTicks: number;
  readonly perceptionConfidence: Rating;
  readonly weakSideAwareness: Rating;
  readonly pressureRecognition: Rating;
  readonly blindSideExposure: Rating;
  readonly reactionDelayTicks: number;
  readonly missedRunnerIds: readonly PlayerId[];
  readonly scanEvents: readonly string[];
}
