export const ROLE_FIT_CAP_IDS = {
  tempoHalfLowVisionCap59: "tempo_half_low_vision_cap_59",
  pivotLowComposureCap59: "pivot_low_composure_cap_59",
  enduranceContextLateDrop: "endurance_context_late_drop",
  mentalFatigueWarningRisk: "mental_fatigue_warning_risk",
  gkLowHandPlayReboundCap59: "gk_low_hand_play_rebound_cap_59",
  spaceHunterLowBallCarryingCap74: "space_hunter_low_ball_carrying_cap_74",
  playmakerLowComposureCap59: "playmaker_low_composure_cap_59",
  forwardLeaderLowPowerCap59: "forward_leader_low_power_cap_59",
  rosterDefensiveCoverTransitionRisk: "roster_defensive_cover_transition_risk",
  mobileLockLowSpeedCap59: "mobile_lock_low_speed_cap_59",
} as const;

export type RoleFitCapId = (typeof ROLE_FIT_CAP_IDS)[keyof typeof ROLE_FIT_CAP_IDS];

export const ALL_ROLE_FIT_CAP_IDS: readonly RoleFitCapId[] = Object.values(ROLE_FIT_CAP_IDS);
