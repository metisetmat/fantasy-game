export enum StoryboardRenderMode {
  DebugFull = "DEBUG_FULL",
  TacticalFocus = "TACTICAL_FOCUS",
  CoachReview = "COACH_REVIEW",
}

export enum StoryboardCameraMode {
  FullField = "FULL_FIELD",
  LocalAction = "LOCAL_ACTION",
  DangerZone = "DANGER_ZONE",
  TransitionWindow = "TRANSITION_WINDOW",
}

export interface TacticalStoryboardConfig {
  readonly renderMode: StoryboardRenderMode;
  readonly defaultCameraMode: StoryboardCameraMode;
  readonly maxBeforeBullets: number;
  readonly maxAfterBullets: number;
  readonly maxAnalysisBullets: number;
  readonly showDebugNumbers: boolean;
  readonly dimNonKeyPlayers: boolean;
  readonly maxMajorLabels: number;
  readonly storyboardSvgWidth: number;
  readonly storyboardSvgHeight: number;
  readonly fieldWidthRatio: number;
  readonly minPlayerLabelFontSize: number;
  readonly minZoneLabelFontSize: number;
  readonly minTitleFontSize: number;
  readonly renderLegendOutsideSvg: boolean;
  readonly maxOnFieldLabels: number;
}

export const TACTICAL_STORYBOARD_CONFIG: TacticalStoryboardConfig = {
  renderMode: StoryboardRenderMode.TacticalFocus,
  defaultCameraMode: StoryboardCameraMode.LocalAction,
  maxBeforeBullets: 7,
  maxAfterBullets: 7,
  maxAnalysisBullets: 7,
  showDebugNumbers: false,
  dimNonKeyPlayers: true,
  maxMajorLabels: 8,
  storyboardSvgWidth: 1600,
  storyboardSvgHeight: 950,
  fieldWidthRatio: 0.82,
  minPlayerLabelFontSize: 18,
  minZoneLabelFontSize: 14,
  minTitleFontSize: 24,
  renderLegendOutsideSvg: true,
  maxOnFieldLabels: 12,
};
