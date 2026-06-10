export enum SnapshotRenderMode {
  DebugFull = "DEBUG_FULL",
  TacticalFocus = "TACTICAL_FOCUS",
  CoachReview = "COACH_REVIEW",
}

export enum SnapshotOverlayDensity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export interface SnapshotTruthConfig {
  readonly snapshotTruthMode: boolean;
  readonly showPlayerIds: boolean;
  readonly showRoleInitials: boolean;
  readonly showActionVector: boolean;
  readonly showPassingLane: boolean;
  readonly showRecoveryVectors: boolean;
  readonly showVisionCones: boolean;
  readonly showInfluenceBadges: boolean;
  readonly showOverloadCounts: boolean;
  readonly showGoalFrame: boolean;
  readonly showValidationBadges: boolean;
  readonly maxOverlayDensity: SnapshotOverlayDensity;
  readonly renderMode: SnapshotRenderMode;
}

export const SNAPSHOT_TRUTH_CONFIG: SnapshotTruthConfig = {
  snapshotTruthMode: true,
  showPlayerIds: false,
  showRoleInitials: true,
  showActionVector: true,
  showPassingLane: true,
  showRecoveryVectors: true,
  showVisionCones: true,
  showInfluenceBadges: true,
  showOverloadCounts: true,
  showGoalFrame: true,
  showValidationBadges: true,
  maxOverlayDensity: SnapshotOverlayDensity.Medium,
  renderMode: SnapshotRenderMode.TacticalFocus,
};
