import type { PlayerId } from "../../../core/ids";
import type { ReceptionFollowUpRole, ReceptionQualityLevel } from "../../spatial";
import type { PatternType, StrictThirdManValidation } from "../thirdMan";

export enum ReceptionChainActionType {
  DirectReception = "DIRECT_RECEPTION",
  SecureRecycle = "SECURE_RECYCLE",
  WallPass = "WALL_PASS",
  ThirdManSet = "THIRD_MAN_SET",
  ContactPlatform = "CONTACT_PLATFORM",
  FastRelease = "FAST_RELEASE",
  RuptureContinuation = "RUPTURE_CONTINUATION",
}

export interface ChainTimingWindow {
  readonly openingTick: number;
  readonly closingTick: number;
  readonly viability: number;
  readonly defensiveRecoveryRisk: number;
}

export interface BodyShapePreparation {
  readonly bodyOpenToGoal: boolean;
  readonly bodyOpenToSupport: boolean;
  readonly backToPressure: boolean;
  readonly halfTurned: boolean;
  readonly insideShoulderOpen: boolean;
}

export interface ReceptionChainAction {
  readonly fromPlayerId: PlayerId;
  readonly fromInitials: string;
  readonly fromZone: string;
  readonly toPlayerId: PlayerId;
  readonly toInitials: string;
  readonly toZone: string;
  readonly actionType: ReceptionChainActionType;
  readonly receptionQuality: ReceptionQualityLevel;
  readonly effectiveChainQuality: ReceptionQualityLevel;
  readonly followUpRole: ReceptionFollowUpRole;
  readonly nextActionWindow: ChainTimingWindow;
  readonly laneState: "OPEN" | "CONTESTED" | "CLOSED" | "TEMPORARY_WINDOW";
  readonly pressure: number;
  readonly progressionGain: number;
  readonly retentionGain: number;
  readonly risk: number;
  readonly bodyShape: BodyShapePreparation;
}

export interface ReceptionChain {
  readonly chainId: string;
  readonly actions: readonly ReceptionChainAction[];
  readonly firstReceiverId: PlayerId;
  readonly firstReceiverInitials: string;
  readonly finalReceiverId: PlayerId;
  readonly finalReceiverInitials: string;
  readonly directValue: number;
  readonly chainValue: number;
  readonly totalProgressionValue: number;
  readonly totalRetentionValue: number;
  readonly totalRisk: number;
  readonly styleFit: number;
  readonly tempoValue: number;
  readonly weakSideValue: number;
  readonly pressureEscapeValue: number;
  readonly thirdManValue: number;
  readonly finishingPotential: number;
  readonly chainConfidence: number;
  readonly chainTiming: ChainTimingWindow;
  readonly effectiveChainQuality: ReceptionQualityLevel;
  readonly patternType: PatternType;
  readonly strictThirdManValidation: StrictThirdManValidation;
  readonly narrativeSummary: string;
  readonly debugReasons: readonly string[];
}
