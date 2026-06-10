export const ROLE_FIT_RISK_IDS = {
  lowLateMentalLoad: "low_late_mental_load",
  lowVisionBreaksTempoControl: "low_vision_breaks_tempo_control",
  poorCentralDiscipline: "poor_central_discipline",
  restDefenseRisk: "rest_defense_risk",
  tempoHalfPrimaryControlRisk: "tempo_half_primary_control_risk",
  repeatedSprintFatigue: "repeated_sprint_fatigue",
  lateRecoveryDropoff: "late_recovery_dropoff",
  gkMentalFatigue: "gk_mental_fatigue",
  reboundControlUnderLoad: "rebound_control_under_load",
  weakReboundControl: "weak_rebound_control",
  isolationIfSupportLate: "isolation_if_support_late",
  lowBallCarryingLimitsRupture: "low_ball_carrying_limits_rupture",
  forcedImaginationErrors: "forced_imagination_errors",
  pressureDecisionInstability: "pressure_decision_instability",
  weakContactAuthority: "weak_contact_authority",
  centralCollisionFailure: "central_collision_failure",
  transitionRecoveryRisk: "transition_recovery_risk",
  emergencyRepairSpeedRisk: "emergency_repair_speed_risk",
  repeatedRecoveryRisk: "repeated_recovery_risk",
  centralDuelRisk: "central_duel_risk",
} as const;

export type RoleFitRiskId = (typeof ROLE_FIT_RISK_IDS)[keyof typeof ROLE_FIT_RISK_IDS];

export const ALL_ROLE_FIT_RISK_IDS: readonly RoleFitRiskId[] = Object.values(ROLE_FIT_RISK_IDS);
