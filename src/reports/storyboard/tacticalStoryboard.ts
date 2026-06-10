import type { SnapshotReference } from "../visualization";
import type { PlayerMatchState } from "../../systems/players";
import type { StoryboardCameraMode } from "./storyboardConfig";
import type { FocusVisualPlan, TacticalFocus } from "../focus";

export interface StoryboardCamera {
  readonly mode: StoryboardCameraMode;
  readonly viewBox: string;
  readonly focusZone: string;
  readonly includedZones: readonly string[];
  readonly cameraKey: string;
}

export interface StoryboardKeyActor {
  readonly playerId: string;
  readonly teamId: string;
  readonly initials: string;
  readonly zone: string;
  readonly reason: string;
  readonly priority: "PRIMARY" | "SECONDARY";
}

export interface StoryboardTacticalFacts {
  readonly ballCarrier: PlayerMatchState | null;
  readonly receiver: PlayerMatchState | null;
  readonly primaryActor: PlayerMatchState | null;
  readonly keySupport: readonly PlayerMatchState[];
  readonly keyDefenders: readonly PlayerMatchState[];
  readonly keyRecovering: readonly PlayerMatchState[];
  readonly keyRunner: PlayerMatchState | null;
  readonly selectedTargetZone: string | null;
  readonly passingLaneState: string | null;
  readonly dangerZone: string | null;
  readonly overloadZone: string | null;
  readonly pressureSummary: string;
  readonly tacticalCause: string;
}

export interface StoryboardRankedOption {
  readonly rank: number;
  readonly fromZone: string;
  readonly toZone: string;
  readonly actionType: string;
  readonly legal: "YES" | "NO";
  readonly lane: string;
  readonly receiver: string;
  readonly score: string;
  readonly why: string;
  readonly selected: boolean;
  readonly preOverrideRank: number | null;
  readonly postOverrideRank: number | null;
  readonly overrideReason: string | null;
}

export interface StoryboardAnalysisBoard {
  readonly actionContext: readonly string[];
  readonly attackingSpatialReading: readonly string[];
  readonly rankedOptions: readonly StoryboardRankedOption[];
  readonly tacticalReading: readonly string[];
}

export interface StoryboardFrame {
  readonly snapshotKind: "before" | "after";
  readonly svgFileName: string;
  readonly camera: StoryboardCamera;
  readonly facts: StoryboardTacticalFacts;
  readonly focus: TacticalFocus;
  readonly visualPlan: FocusVisualPlan;
}

export interface TacticalStoryboardPage {
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly title: string;
  readonly pageFileName: string;
  readonly beforeFrame: StoryboardFrame;
  readonly afterFrame: StoryboardFrame;
  readonly beforeNarrative: readonly string[];
  readonly afterNarrative: readonly string[];
  readonly aiTacticalAnalysis: readonly string[];
  readonly analysisBoard: StoryboardAnalysisBoard;
  readonly visualLegend: readonly string[];
  readonly focus: TacticalFocus;
  readonly sourceSnapshot: SnapshotReference;
}

export interface TacticalStoryboardReference {
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly focusCategory: string;
  readonly pagePath: string;
  readonly beforeSvgPath: string;
  readonly afterSvgPath: string;
  readonly validationStatus: "PASS" | "FAIL";
  readonly warnings: readonly string[];
}
