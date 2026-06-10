export const ROLE_FIT_REASON_IDS = {
  visionSupportsTempoControl: "vision_supports_tempo_control",
  composureSupportsPressureEscape: "composure_supports_pressure_escape",
  handPlaySupportsPhaseStability: "hand_play_supports_phase_stability",
  footPlaySupportsRelease: "foot_play_supports_release",
  creativitySupportsVariation: "creativity_supports_variation",
  speedSupportsRecovery: "speed_supports_recovery",
  creativitySupportsEscape: "creativity_supports_escape",
  handPlaySupportsLinking: "hand_play_supports_linking",
  powerSupportsContactSurvival: "power_supports_contact_survival",
  speedSupportsWidth: "speed_supports_width",
  handPlaySupportsContinuity: "hand_play_supports_continuity",
  composureSupportsGkReadiness: "composure_supports_gk_readiness",
  reboundControlStrength: "rebound_control_strength",
  footPlaySupportsSweeperRelease: "foot_play_supports_sweeper_release",
  speedSupportsDepthThreat: "speed_supports_depth_threat",
  ballCarryingSupportsRupture: "ball_carrying_supports_rupture",
  pressingEffortSupportsFrontPressure: "pressing_effort_supports_front_pressure",
  enduranceSupportsRepetition: "endurance_supports_repetition",
  creativitySupportsRouteCreation: "creativity_supports_route_creation",
  visionSupportsOptionSelection: "vision_supports_option_selection",
  visionSupportsLineCommand: "vision_supports_line_command",
  handPlaySupportsContactLink: "hand_play_supports_contact_link",
  speedSupportsFlankProjection: "speed_supports_flank_projection",
  handPlaySupportsWideSupport: "hand_play_supports_wide_support",
  composureSupportsRepairDecisions: "composure_supports_repair_decisions",
  visionSupportsTransitionReading: "vision_supports_transition_reading",
} as const;

export type RoleFitReasonId = (typeof ROLE_FIT_REASON_IDS)[keyof typeof ROLE_FIT_REASON_IDS];

export const ALL_ROLE_FIT_REASON_IDS: readonly RoleFitReasonId[] = Object.values(ROLE_FIT_REASON_IDS);
