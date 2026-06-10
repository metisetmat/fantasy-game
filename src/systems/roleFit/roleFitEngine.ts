import { ROLE_FIT_CAP_IDS } from "./roleFitCapIds";
import { ROLE_FIT_REASON_IDS } from "./roleFitReasonIds";
import { ROLE_FIT_RISK_IDS } from "./roleFitRiskIds";
import type {
  FitBoost,
  FitPenalty,
  FitReason,
  FitRisk,
  FitSignalType,
  RoleComparisonResult,
  RoleFitInput,
  RoleFitLabel,
  RoleFitResult,
  TrueRole,
} from "./roleFitTypes";

type VisibleAttributeKey = keyof RoleFitInput["visibleAttributes"];
type FitSeverity = FitRisk["severity"];
type RiskPhase = FitRisk["affectedPhase"];
type BoostSource = FitBoost["source"];
type PenaltySource = FitPenalty["source"];
type SignalSource = FitSignalType | BoostSource | PenaltySource;

interface RoleProfile {
  readonly coreAttributes: readonly VisibleAttributeKey[];
  readonly secondaryAttributes: readonly VisibleAttributeKey[];
  readonly skillKeys: readonly string[];
  readonly derivedKeys: readonly string[];
  readonly bestStyles: readonly string[];
  readonly riskyStyles: readonly string[];
  readonly bestPairings: readonly TrueRole[];
}

const ROLE_PROFILES: Readonly<Record<TrueRole, RoleProfile>> = {
  "Tempo Half": {
    coreAttributes: ["vision", "composure", "handPlay"],
    secondaryAttributes: ["creativity", "footPlay", "endurance"],
    skillKeys: ["tempoControl", "pressureEscape", "phaseStability"],
    derivedKeys: ["pressureReading", "supportAngle", "tacticalDiscipline"],
    bestStyles: ["CONTROL_PATIENT", "CONTROL_BALANCED", "METHODICAL"],
    riskyStyles: ["BLITZ_RISKY", "POWER_DIRECT"],
    bestPairings: ["Pivot", "Hook Link", "Left Piston"],
  },
  "Hook Link": {
    coreAttributes: ["handPlay", "composure", "ballCarrying"],
    secondaryAttributes: ["power", "vision", "endurance"],
    skillKeys: ["contactSurvival", "supportTiming", "outletSecurity"],
    derivedKeys: ["supportAngle", "pressureReading", "contactBalance"],
    bestStyles: ["CONTROL_BALANCED", "MOBILE_WIDE", "METHODICAL"],
    riskyStyles: ["BLITZ_RISKY"],
    bestPairings: ["Tempo Half", "Forward Leader", "Space Hunter"],
  },
  "Forward Leader": {
    coreAttributes: ["power", "composure", "endurance"],
    secondaryAttributes: ["handPlay", "vision", "ballCarrying"],
    skillKeys: ["contactAuthority", "centralCommand", "collisionLoad"],
    derivedKeys: ["lineLeadership", "defensiveOrganization", "contactBalance"],
    bestStyles: ["POWER_DIRECT", "BLITZ_BALANCED", "CONTROL_DIRECT"],
    riskyStyles: ["CONTROL_PATIENT"],
    bestPairings: ["Mobile Lock", "Pivot", "Goalkeeper / Free Safety"],
  },
  "Goalkeeper / Free Safety": {
    coreAttributes: ["composure", "handPlay", "vision"],
    secondaryAttributes: ["footPlay", "power", "endurance"],
    skillKeys: ["reboundControl", "positioning", "communication"],
    derivedKeys: ["goalkeeperResponse", "secondSaveRecovery", "defensiveOrganization"],
    bestStyles: ["CONTROL_BALANCED", "BLITZ_BALANCED", "METHODICAL"],
    riskyStyles: ["BLITZ_RISKY"],
    bestPairings: ["Mobile Lock", "Forward Leader", "Pivot"],
  },
  "Mobile Lock": {
    coreAttributes: ["speed", "endurance", "power"],
    secondaryAttributes: ["composure", "vision", "ballCarrying"],
    skillKeys: ["recoveryRun", "transitionStop", "centralDuel"],
    derivedKeys: ["defensiveCoverQuality", "restDefenseTiming", "contactBalance"],
    bestStyles: ["BLITZ_AGGRESSIVE", "CONTROL_BALANCED", "MOBILE_WIDE"],
    riskyStyles: ["CONTROL_PATIENT"],
    bestPairings: ["Goalkeeper / Free Safety", "Forward Leader", "Pivot"],
  },
  "Space Hunter": {
    coreAttributes: ["speed", "ballCarrying", "composure"],
    secondaryAttributes: ["creativity", "endurance", "footPlay"],
    skillKeys: ["depthThreat", "ruptureCarry", "pressingEffort"],
    derivedKeys: ["supportAngle", "weakSideTiming", "frontPressure"],
    bestStyles: ["MOBILE_WIDE", "CONTROL_DIRECT", "BLITZ_RISKY"],
    riskyStyles: ["CONTROL_PATIENT"],
    bestPairings: ["Hook Link", "Playmaker", "Right Piston"],
  },
  Playmaker: {
    coreAttributes: ["creativity", "vision", "composure"],
    secondaryAttributes: ["footPlay", "handPlay", "ballCarrying"],
    skillKeys: ["routeCreation", "riskManagement", "tempoControl"],
    derivedKeys: ["pressureReading", "supportAngle", "nextActionPotential"],
    bestStyles: ["CONTROL_PATIENT", "CONTROL_BALANCED", "MOBILE_WIDE"],
    riskyStyles: ["POWER_DIRECT", "BLITZ_RISKY"],
    bestPairings: ["Tempo Half", "Space Hunter", "Pivot"],
  },
  Pivot: {
    coreAttributes: ["vision", "composure", "handPlay"],
    secondaryAttributes: ["power", "endurance", "ballCarrying"],
    skillKeys: ["centralBalance", "restDefenseTiming", "rebuildTiming"],
    derivedKeys: ["tacticalDiscipline", "restDefenseTiming", "defensiveCoverQuality"],
    bestStyles: ["CONTROL_PATIENT", "CONTROL_BALANCED", "METHODICAL"],
    riskyStyles: ["BLITZ_RISKY"],
    bestPairings: ["Tempo Half", "Mobile Lock", "Playmaker"],
  },
  "Left Piston": {
    coreAttributes: ["speed", "endurance", "handPlay"],
    secondaryAttributes: ["ballCarrying", "power", "composure"],
    skillKeys: ["widthSupport", "recoveryRun", "flankConnection"],
    derivedKeys: ["defensiveCoverQuality", "supportAngle", "weakSideTiming"],
    bestStyles: ["MOBILE_WIDE", "BLITZ_AGGRESSIVE", "CONTROL_BALANCED"],
    riskyStyles: ["CONTROL_PATIENT"],
    bestPairings: ["Tempo Half", "Pivot", "Space Hunter"],
  },
  "Right Piston": {
    coreAttributes: ["speed", "endurance", "handPlay"],
    secondaryAttributes: ["ballCarrying", "power", "composure"],
    skillKeys: ["widthSupport", "recoveryRun", "flankConnection"],
    derivedKeys: ["defensiveCoverQuality", "supportAngle", "weakSideTiming"],
    bestStyles: ["MOBILE_WIDE", "BLITZ_AGGRESSIVE", "CONTROL_BALANCED"],
    riskyStyles: ["CONTROL_PATIENT"],
    bestPairings: ["Tempo Half", "Pivot", "Space Hunter"],
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rounded(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 62 : values.reduce((total, value) => total + value, 0) / values.length;
}

function attribute(input: RoleFitInput, key: VisibleAttributeKey): number {
  return clamp(input.visibleAttributes[key] ?? 55, 0, 100);
}

function signalValue(source: Readonly<Record<string, number>> | undefined, key: string): number {
  return clamp(source?.[key] ?? 62, 0, 100);
}

function averageAttributes(input: RoleFitInput, keys: readonly VisibleAttributeKey[]): number {
  return average(keys.map((key) => attribute(input, key)));
}

function averageSignals(source: Readonly<Record<string, number>> | undefined, keys: readonly string[]): number {
  return average(keys.map((key) => signalValue(source, key)));
}

function labelForScore(score: number): RoleFitLabel {
  if (score >= 90) return "Natural Fit";
  if (score >= 75) return "Strong Fit";
  if (score >= 60) return "Usable Fit";
  if (score >= 45) return "Risky Fit";
  return "Poor Fit";
}

function styleScore(input: RoleFitInput, profile: RoleProfile): number {
  if (!input.teamStyle) return 62;
  if (profile.bestStyles.includes(input.teamStyle)) return 82;
  if (profile.riskyStyles.includes(input.teamStyle)) return 48;
  return 58;
}

function fatigueAdjustment(input: RoleFitInput): number {
  const fatigue = input.fatigueState;
  if (!fatigue) return 0;

  if (input.testedRole === "Goalkeeper / Free Safety") {
    const mentalLoad = fatigue.mentalFatigue ?? 0;
    return -Math.round(mentalLoad * 0.16 + fatigue.currentFatigue * 0.04);
  }

  const load = fatigue.currentFatigue;
  const lateReliabilityCredit = Math.max(0, (fatigue.lateMatchReliability ?? 55) - 55) * 0.04;
  return -Math.round(load * 0.15 - lateReliabilityCredit);
}

function rosterContextAdjustment(input: RoleFitInput): number {
  const context = input.rosterContext;
  if (!context) return 0;
  const missingBoost = context.missingRoles.includes(input.testedRole) ? 4 : 0;
  const overloadPenalty = context.overloadedRoles.includes(input.testedRole) ? -4 : 0;
  const supportAdjustment = Math.round((context.supportQuality - 60) * 0.05);
  const coverAdjustment = input.testedRole === "Pivot" || input.testedRole.includes("Piston") || input.testedRole === "Mobile Lock"
    ? Math.round((context.defensiveCoverQuality - 60) * 0.05)
    : 0;
  return missingBoost + overloadPenalty + supportAdjustment + coverAdjustment;
}

function reason(id: string, type: FitSignalType, label: string, impact = 6, evidence: readonly string[] = [label]): FitReason {
  return { id, type, label, explanation: label, impact, evidence: [...evidence] };
}

function riskPhaseFromSignal(source: string): RiskPhase {
  if (source === "GOALKEEPER_SPECIFIC_SIGNAL") return "goalkeeper";
  if (source === "FATIGUE_RISK" || source === "fatigue") return "late_match";
  if (source === "ROSTER_CONTEXT_RISK" || source === "DERIVED_RISK") return "transition_defense";
  if (source === "ATTRIBUTE_WEAKNESS" || source === "SKILL_GAP") return "in_possession";
  return "chaos";
}

function isSeverity(value: string | undefined): value is FitSeverity {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "CRITICAL";
}

function risk(
  id: string,
  signalOrSeverity: FitSignalType | FitSeverity,
  label: string,
  severityOrPhase: FitSeverity | RiskPhase = "HIGH",
  mitigation?: string,
): FitRisk {
  const severity = isSeverity(severityOrPhase) ? severityOrPhase : isSeverity(signalOrSeverity) ? signalOrSeverity : "HIGH";
  const affectedPhase = isSeverity(severityOrPhase) ? riskPhaseFromSignal(signalOrSeverity) : severityOrPhase;
  return mitigation === undefined
    ? { id, severity, label, explanation: label, affectedPhase }
    : { id, severity, label, explanation: label, affectedPhase, mitigation };
}

function boostSourceFromSignal(source: SignalSource): BoostSource {
  if (source === "SKILL_STRENGTH" || source === "skill") return "skill";
  if (source === "DERIVED_STRENGTH" || source === "derived_attribute") return "derived_attribute";
  if (source === "STYLE_BOOST" || source === "style") return "style";
  if (source === "ROSTER_CONTEXT_BOOST" || source === "roster_context") return "roster_context";
  if (source === "team_identity") return "team_identity";
  return "attribute";
}

function penaltySourceFromSignal(source: SignalSource): PenaltySource {
  if (source === "SKILL_GAP" || source === "skill") return "skill";
  if (source === "DERIVED_RISK" || source === "derived_attribute") return "derived_attribute";
  if (source === "FATIGUE_RISK" || source === "fatigue") return "fatigue";
  if (source === "STYLE_PENALTY" || source === "style") return "style";
  if (source === "ROSTER_CONTEXT_RISK" || source === "roster_context") return "roster_context";
  if (source === "team_identity") return "team_identity";
  return "attribute";
}

function boost(id: string, source: SignalSource, label: string, impact: number): FitBoost {
  return { id, source: boostSourceFromSignal(source), label, impact, explanation: label };
}

function penalty(id: string, source: SignalSource, label: string, impact: number, canBeMitigated: boolean | number = true): FitPenalty {
  return { id, source: penaltySourceFromSignal(source), label, impact, explanation: label, canBeMitigated: canBeMitigated !== false };
}

function severityWeight(severity: FitSeverity): number {
  switch (severity) {
    case "LOW":
      return 1;
    case "MEDIUM":
      return 2;
    case "HIGH":
      return 3;
    case "CRITICAL":
      return 4;
  }
}

interface RoleSignals {
  readonly reasons: readonly FitReason[];
  readonly risks: readonly FitRisk[];
  readonly boosts: readonly FitBoost[];
  readonly penalties: readonly FitPenalty[];
  readonly cap: number;
  readonly appliedCaps: readonly string[];
  readonly fatigueWarning?: RoleFitResult["fatigueWarning"];
}

function buildRoleSignals(input: RoleFitInput): RoleSignals {
  const reasons: FitReason[] = [];
  const risks: FitRisk[] = [];
  const boosts: FitBoost[] = [];
  const penalties: FitPenalty[] = [];
  const appliedCaps: string[] = [];
  let cap = 100;
  let fatigueWarning: RoleFitResult["fatigueWarning"];

  const applyCap = (id: string, description: string, maxScore: number): void => {
    cap = Math.min(cap, maxScore);
    appliedCaps.push(id);
    penalties.push(penalty(id, "ATTRIBUTE_WEAKNESS", description, Math.max(0, 100 - maxScore), maxScore));
  };

  const vision = attribute(input, "vision");
  const composure = attribute(input, "composure");
  const handPlay = attribute(input, "handPlay");
  const power = attribute(input, "power");
  const endurance = attribute(input, "endurance");
  const speed = attribute(input, "speed");
  const ballCarrying = attribute(input, "ballCarrying");
  const creativity = attribute(input, "creativity");
  const footPlay = attribute(input, "footPlay");
  const discipline = signalValue(input.derivedAttributes, "tacticalDiscipline");
  const defensiveCover = Math.min(signalValue(input.derivedAttributes, "defensiveCoverQuality"), input.rosterContext?.defensiveCoverQuality ?? 100);
  const goalkeeperResponse = signalValue(input.derivedAttributes, "goalkeeperResponse");
  const secondSaveRecovery = signalValue(input.derivedAttributes, "secondSaveRecovery");
  const reboundControl = signalValue(input.inferredSkills, "reboundControl");
  const pressingEffort = signalValue(input.inferredSkills, "pressingEffort");

  switch (input.testedRole) {
    case "Tempo Half":
      if (vision >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.visionSupportsTempoControl, "ATTRIBUTE_STRENGTH", "Vision supports tempo control and pressure-side scanning."));
      if (composure >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.composureSupportsPressureEscape, "ATTRIBUTE_STRENGTH", "Composure supports pressure escape decisions."));
      if (handPlay >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.handPlaySupportsPhaseStability, "ATTRIBUTE_STRENGTH", "Hand Play supports phase stability under circulation pressure."));
      if (footPlay >= 72) reasons.push(reason(ROLE_FIT_REASON_IDS.footPlaySupportsRelease, "ATTRIBUTE_STRENGTH", "Foot Play supports release choices."));
      if (creativity >= 72) reasons.push(reason(ROLE_FIT_REASON_IDS.creativitySupportsVariation, "ATTRIBUTE_STRENGTH", "Creativity supports variation without becoming the primary role driver."));
      if (vision < 45) {
        applyCap(ROLE_FIT_CAP_IDS.tempoHalfLowVisionCap59, "Vision below 45 caps Tempo Half fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.lowVisionBreaksTempoControl, "ATTRIBUTE_WEAKNESS", "Low Vision breaks tempo-control reliability."));
      }
      break;
    case "Hook Link":
      if (handPlay >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.handPlaySupportsLinking, "ATTRIBUTE_STRENGTH", "Hand Play supports secure linking through contact."));
      if (power >= 60) reasons.push(reason(ROLE_FIT_REASON_IDS.powerSupportsContactSurvival, "ATTRIBUTE_STRENGTH", "Power supports contact survival."));
      if (handPlay < 45) {
        applyCap("hook_link_low_hand_play_cap_59", "Hand Play below 45 caps Hook Link fit at 59.", 59);
        risks.push(risk("low_hand_play_breaks_secure_link", "ATTRIBUTE_WEAKNESS", "Low Hand Play breaks secure connection value."));
      }
      if (power < 35) risks.push(risk("contact_survival_risk", "ATTRIBUTE_WEAKNESS", "Low Power creates contact-survival risk."));
      break;
    case "Forward Leader":
      if (vision >= 65) reasons.push(reason(ROLE_FIT_REASON_IDS.visionSupportsLineCommand, "ATTRIBUTE_STRENGTH", "Vision supports line command and central reading."));
      if (handPlay >= 65) reasons.push(reason(ROLE_FIT_REASON_IDS.handPlaySupportsContactLink, "ATTRIBUTE_STRENGTH", "Hand Play supports contact-link security."));
      if (power < 50) {
        applyCap(ROLE_FIT_CAP_IDS.forwardLeaderLowPowerCap59, "Power below 50 caps Forward Leader fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.weakContactAuthority, "ATTRIBUTE_WEAKNESS", "Low Power weakens contact authority."));
        risks.push(risk(ROLE_FIT_RISK_IDS.centralCollisionFailure, "ATTRIBUTE_WEAKNESS", "Low Power creates central collision failure risk."));
      }
      break;
    case "Goalkeeper / Free Safety":
      if (composure >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.composureSupportsGkReadiness, "GOALKEEPER_SPECIFIC_SIGNAL", "Composure supports goalkeeper readiness and communication."));
      if (reboundControl >= 70) reasons.push(reason(ROLE_FIT_REASON_IDS.reboundControlStrength, "GOALKEEPER_SPECIFIC_SIGNAL", "Rebound-control skill supports catch/parry choice."));
      if (footPlay >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.footPlaySupportsSweeperRelease, "ATTRIBUTE_STRENGTH", "Foot Play supports sweeper release but does not replace handling."));
      if (composure < 50) {
        applyCap("gk_low_composure_cap_59", "Composure below 50 caps Goalkeeper / Free Safety fit at 59.", 59);
        risks.push(risk("gk_low_composure_positioning_risk", "GOALKEEPER_SPECIFIC_SIGNAL", "Low Composure harms positioning reliability."));
      }
      if (handPlay < 45) {
        applyCap(ROLE_FIT_CAP_IDS.gkLowHandPlayReboundCap59, "Hand Play below 45 caps goalkeeper rebound-control fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.reboundControlUnderLoad, "GOALKEEPER_SPECIFIC_SIGNAL", "Weak Hand Play harms rebound control under load."));
      }
      if (goalkeeperResponse < 45) {
        applyCap("gk_low_response_cap_64", "Low goalkeeper response caps goalkeeper fit at 64.", 64);
        risks.push(risk("low_goalkeeper_response", "GOALKEEPER_SPECIFIC_SIGNAL", "Low goalkeeper response lowers reaction reliability."));
      }
      if ((input.fatigueState?.mentalFatigue ?? 0) > 70) {
        risks.push(risk(ROLE_FIT_RISK_IDS.gkMentalFatigue, "FATIGUE_RISK", "Mental fatigue increases concentration and spill risk."));
        risks.push(risk(ROLE_FIT_RISK_IDS.reboundControlUnderLoad, "GOALKEEPER_SPECIFIC_SIGNAL", "High load raises parry and rebound-control risk."));
        penalties.push(penalty(ROLE_FIT_CAP_IDS.mentalFatigueWarningRisk, "FATIGUE_RISK", "Mental fatigue warning affects goalkeeper reliability.", 8));
        fatigueWarning = {
          level: "RISK",
          explanation: "Goalkeeper mental fatigue affects concentration, positioning, catch/parry choice, rebound direction, and second-save recovery.",
        };
      }
      if (reboundControl < 45) risks.push(risk(ROLE_FIT_RISK_IDS.weakReboundControl, "GOALKEEPER_SPECIFIC_SIGNAL", "Weak rebound-control skill cannot be offset by Foot Play alone."));
      if (secondSaveRecovery < 45) risks.push(risk("second_save_recovery_risk", "GOALKEEPER_SPECIFIC_SIGNAL", "Low second-save recovery lowers follow-up reliability."));
      break;
    case "Mobile Lock":
      if (composure >= 70) reasons.push(reason(ROLE_FIT_REASON_IDS.composureSupportsRepairDecisions, "ATTRIBUTE_STRENGTH", "Composure supports emergency repair decisions."));
      if (vision >= 70) reasons.push(reason(ROLE_FIT_REASON_IDS.visionSupportsTransitionReading, "ATTRIBUTE_STRENGTH", "Vision supports transition reading."));
      if (speed < 45) {
        applyCap(ROLE_FIT_CAP_IDS.mobileLockLowSpeedCap59, "Speed below 45 caps Mobile Lock fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.emergencyRepairSpeedRisk, "ATTRIBUTE_WEAKNESS", "Low Speed limits emergency repair value."));
      }
      if (endurance < 45) risks.push(risk(ROLE_FIT_RISK_IDS.repeatedRecoveryRisk, "ATTRIBUTE_WEAKNESS", "Low Endurance creates repeated recovery risk."));
      if (power < 40) risks.push(risk(ROLE_FIT_RISK_IDS.centralDuelRisk, "ATTRIBUTE_WEAKNESS", "Low Power creates central duel risk."));
      break;
    case "Space Hunter":
      if (speed >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.speedSupportsDepthThreat, "ATTRIBUTE_STRENGTH", "Speed supports depth threat and weak-side rupture."));
      if (ballCarrying >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.ballCarryingSupportsRupture, "ATTRIBUTE_STRENGTH", "Ball Carrying supports rupture once the lane opens."));
      if (pressingEffort >= 70 || signalValue(input.derivedAttributes, "frontPressure") >= 70) {
        reasons.push(reason(ROLE_FIT_REASON_IDS.pressingEffortSupportsFrontPressure, "SKILL_STRENGTH", "Pressing effort supports harassment, counter-pressure, and front-line lane closure."));
      }
      if (endurance >= 70) reasons.push(reason(ROLE_FIT_REASON_IDS.enduranceSupportsRepetition, "ATTRIBUTE_STRENGTH", "Endurance supports repeated rupture and front pressure."));
      if (speed < 50) {
        applyCap("space_hunter_low_speed_cap_64", "Speed below 50 caps Space Hunter fit at 64.", 64);
        risks.push(risk("low_speed_limits_depth_threat", "ATTRIBUTE_WEAKNESS", "Low Speed limits depth threat."));
      }
      if (ballCarrying < 45) {
        applyCap(ROLE_FIT_CAP_IDS.spaceHunterLowBallCarryingCap74, "Ball Carrying below 45 prevents Strong Fit for Space Hunter.", 74);
        risks.push(risk(ROLE_FIT_RISK_IDS.lowBallCarryingLimitsRupture, "ATTRIBUTE_WEAKNESS", "Low Ball Carrying limits rupture even with elite speed."));
      }
      if ((input.rosterContext?.supportQuality ?? 65) < 45) risks.push(risk(ROLE_FIT_RISK_IDS.isolationIfSupportLate, "ROSTER_CONTEXT_RISK", "Low support quality can isolate the rupture runner."));
      break;
    case "Playmaker":
      if (creativity >= 75) reasons.push(reason(ROLE_FIT_REASON_IDS.creativitySupportsRouteCreation, "ATTRIBUTE_STRENGTH", "Creativity supports route creation and controlled imagination."));
      if (vision >= 70) reasons.push(reason(ROLE_FIT_REASON_IDS.visionSupportsOptionSelection, "ATTRIBUTE_STRENGTH", "Vision supports option selection before pressure arrives."));
      if (composure < 45) {
        applyCap(ROLE_FIT_CAP_IDS.playmakerLowComposureCap59, "Composure below 45 caps Playmaker fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.forcedImaginationErrors, "ATTRIBUTE_WEAKNESS", "Low Composure turns creativity into forced imagination errors."));
        risks.push(risk(ROLE_FIT_RISK_IDS.pressureDecisionInstability, "ATTRIBUTE_WEAKNESS", "Low Composure creates pressure-decision instability."));
      }
      break;
    case "Pivot":
      if (vision >= 72) reasons.push(reason("vision_supports_central_balance", "ATTRIBUTE_STRENGTH", "Vision supports central balance and rebuild timing."));
      if (composure < 45) {
        applyCap(ROLE_FIT_CAP_IDS.pivotLowComposureCap59, "Composure below 45 caps Pivot fit at 59.", 59);
        risks.push(risk(ROLE_FIT_RISK_IDS.poorCentralDiscipline, "ATTRIBUTE_WEAKNESS", "Low Composure harms central discipline."));
      }
      if (discipline < 45 || defensiveCover < 45) risks.push(risk(ROLE_FIT_RISK_IDS.restDefenseRisk, "DERIVED_RISK", "Low discipline or cover quality creates rest-defense risk."));
      break;
    case "Left Piston":
    case "Right Piston":
      if (speed >= 72) reasons.push(reason(ROLE_FIT_REASON_IDS.speedSupportsFlankProjection, "ATTRIBUTE_STRENGTH", "Speed supports flank projection."));
      if (handPlay >= 65) reasons.push(reason(ROLE_FIT_REASON_IDS.handPlaySupportsWideSupport, "ATTRIBUTE_STRENGTH", "Hand Play supports wide support and recycle security."));
      if (speed >= 72) reasons.push(reason(ROLE_FIT_REASON_IDS.speedSupportsWidth, "ATTRIBUTE_STRENGTH", "Speed supports width occupation."));
      if (handPlay >= 65) reasons.push(reason(ROLE_FIT_REASON_IDS.handPlaySupportsContinuity, "ATTRIBUTE_STRENGTH", "Hand Play supports continuity after wide support."));
      if (endurance < 50) {
        applyCap("piston_low_endurance_cap_64", "Endurance below 50 caps Piston fit at 64.", 64);
        risks.push(risk(ROLE_FIT_RISK_IDS.lateRecoveryDropoff, "ATTRIBUTE_WEAKNESS", "Low Endurance creates late recovery dropoff."));
      }
      if (defensiveCover < 45 && input.teamStyle === "BLITZ_AGGRESSIVE") {
        penalties.push(penalty(ROLE_FIT_CAP_IDS.rosterDefensiveCoverTransitionRisk, "ROSTER_CONTEXT_RISK", "Low defensive cover in high pressing chaos creates transition recovery risk.", 8));
        risks.push(risk(ROLE_FIT_RISK_IDS.transitionRecoveryRisk, "ROSTER_CONTEXT_RISK", "Low defensive cover in high pressing chaos creates transition recovery risk."));
      }
      if ((input.fatigueState?.currentFatigue ?? 0) > 70 || (input.fatigueState?.lateMatchReliability ?? 100) < 50) {
        penalties.push(penalty(ROLE_FIT_CAP_IDS.enduranceContextLateDrop, "FATIGUE_RISK", "Late sprint load creates fatigue-sensitive Piston fit risk.", 7));
        risks.push(risk(ROLE_FIT_RISK_IDS.repeatedSprintFatigue, "FATIGUE_RISK", "Repeated sprint load threatens two-way recovery."));
        risks.push(risk(ROLE_FIT_RISK_IDS.lateRecoveryDropoff, "FATIGUE_RISK", "Late-match load lowers flank recovery reliability."));
        fatigueWarning = {
          level: "RISK",
          explanation: "Piston role fit is sensitive to repeated sprint load and late recovery dropoff.",
        };
      }
      break;
  }

  const profile = ROLE_PROFILES[input.testedRole];
  if (profile.bestStyles.includes(input.teamStyle ?? "")) {
    boosts.push(boost("team_style_supports_role_identity", "STYLE_BOOST", "Team style supports this role identity.", 2));
  }
  if (input.rosterContext?.missingRoles.includes(input.testedRole)) {
    boosts.push(boost("roster_need_increases_role_value", "ROSTER_CONTEXT_BOOST", "Roster context increases practical role value.", 2));
  }

  return { reasons, risks, boosts, penalties, cap, appliedCaps, fatigueWarning };
}

function adviceFor(input: RoleFitInput, label: RoleFitLabel, risks: readonly FitRisk[]): {
  readonly developmentAdvice: readonly string[];
  readonly coachUsageAdvice: readonly string[];
} {
  if (input.testedRole === "Goalkeeper / Free Safety") {
    return {
      developmentAdvice: risks.length > 0
        ? ["Train mental reset, rebound control, catch/parry choice, and second-save recovery."]
        : ["Preserve readiness, communication, and rebound-control habits."],
      coachUsageAdvice: ["Use as a free-safety goalkeeper when the defensive line can protect central rebounds and keep communication clear."],
    };
  }
  if (input.testedRole === "Space Hunter") {
    return {
      developmentAdvice: risks.some((item) => item.id === ROLE_FIT_RISK_IDS.lowBallCarryingLimitsRupture)
        ? ["Develop Ball Carrying so speed becomes real rupture value instead of empty depth threat."]
        : ["Maintain rupture timing, front pressure, and support-link decisions."],
      coachUsageAdvice: ["Use as an offensive rupture and pressing-from-front role; do not treat the fit as a defensive-midfield requirement."],
    };
  }
  if (input.testedRole === "Left Piston" || input.testedRole === "Right Piston") {
    return {
      developmentAdvice: ["Build repeated-sprint durability, recovery angles, and wide support security."],
      coachUsageAdvice: ["Use as a two-way width and recovery role, not as a pure winger."],
    };
  }
  if (label === "Risky Fit" || label === "Poor Fit") {
    return {
      developmentAdvice: ["Prioritize the capped weakness before increasing role exposure."],
      coachUsageAdvice: ["Use situationally with structural protection until the primary risk improves."],
    };
  }
  return {
    developmentAdvice: ["Keep strengthening the role's core attributes while preserving tactical discipline."],
    coachUsageAdvice: ["Use confidently when the surrounding structure matches the role's tactical identity."],
  };
}

function summaryFor(input: RoleFitInput, score: number, label: RoleFitLabel, risks: readonly FitRisk[]): string {
  const riskText = risks.length === 0 ? "with no major fixture risk" : `with ${risks[0]?.id ?? "role risk"} to manage`;
  return `${input.playerName} is a ${score} ${label} for ${input.testedRole}, ${riskText}.`;
}

export function computeRoleFit(input: RoleFitInput): RoleFitResult {
  const profile = ROLE_PROFILES[input.testedRole];
  const coreAttributeScore = averageAttributes(input, profile.coreAttributes);
  const secondaryAttributeScore = averageAttributes(input, profile.secondaryAttributes);
  const attributeContribution = coreAttributeScore * 0.5 + secondaryAttributeScore * 0.2;
  const skillContributionRaw = averageSignals(input.inferredSkills, profile.skillKeys);
  const derivedContributionRaw = averageSignals(input.derivedAttributes, profile.derivedKeys);
  const styleAdjustmentScore = styleScore(input, profile);
  const fatiguePenalty = fatigueAdjustment(input);
  const rosterAdjustment = rosterContextAdjustment(input);
  const rawScoreBeforeCaps =
    attributeContribution +
    skillContributionRaw * 0.15 +
    derivedContributionRaw * 0.1 +
    styleAdjustmentScore * 0.05 +
    fatiguePenalty +
    rosterAdjustment;
  const signals = buildRoleSignals(input);
  const cappedScore = Math.min(rawScoreBeforeCaps, signals.cap);
  const score = rounded(cappedScore);
  const label = labelForScore(score);
  const advice = adviceFor(input, label, signals.risks);
  const resultBase = {
    playerId: input.playerId,
    playerName: input.playerName,
    testedRole: input.testedRole,
    score,
    label,
    summary: summaryFor(input, score, label, signals.risks),
    topReasons: signals.reasons.slice(0, 4),
    topRisks: signals.risks.slice(0, 4),
    boosts: [...signals.boosts],
    penalties: [...signals.penalties],
    bestPairings: [...profile.bestPairings],
    styleFit: {
      bestStyles: [...profile.bestStyles],
      riskyStyles: [...profile.riskyStyles],
      explanation: input.teamStyle && profile.bestStyles.includes(input.teamStyle)
        ? `${input.teamStyle} supports ${input.testedRole}.`
        : `${input.testedRole} is best protected in ${profile.bestStyles.join(", ")} contexts.`,
    },
    developmentAdvice: [...advice.developmentAdvice],
    coachUsageAdvice: [...advice.coachUsageAdvice],
    debug: {
      baseRoleScore: rounded(rawScoreBeforeCaps),
      attributeContribution: rounded(attributeContribution),
      skillContribution: rounded(skillContributionRaw * 0.15),
      derivedContribution: rounded(derivedContributionRaw * 0.1),
      styleAdjustment: rounded(styleAdjustmentScore * 0.05),
      fatigueAdjustment: fatiguePenalty,
      rosterContextAdjustment: rosterAdjustment,
    },
  };

  return signals.fatigueWarning === undefined
    ? resultBase
    : {
        ...resultBase,
        fatigueWarning: signals.fatigueWarning,
      };
}

function riskLoad(result: RoleFitResult): number {
  return result.topRisks.reduce((total, item) => total + severityWeight(item.severity), 0);
}

function roleSorter<T>(items: readonly T[], score: (item: T) => number): T {
  const [first] = items;
  if (!first) {
    throw new Error("compareRoleFits requires at least one role fit input");
  }
  return items.reduce((best, item) => (score(item) > score(best) ? item : best), first);
}

export function compareRoleFits(inputs: readonly RoleFitInput[]): RoleComparisonResult {
  const testedRoles = inputs.map(computeRoleFit);
  const best = roleSorter(testedRoles, (item) => item.score - riskLoad(item) * 2);
  const safest = roleSorter(testedRoles, (item) => item.score - riskLoad(item) * 5 + item.topReasons.length);
  const upside = roleSorter(testedRoles, (item) => item.score + item.topReasons.length * 2 + item.boosts.length - riskLoad(item));
  const riskiest = roleSorter(testedRoles, (item) => riskLoad(item) * 10 - item.score * 0.2);

  return {
    playerId: testedRoles[0]?.playerId ?? "",
    playerName: testedRoles[0]?.playerName ?? "",
    testedRoles,
    bestRole: best.testedRole,
    safestRole: safest.testedRole,
    highestUpsideRole: upside.testedRole,
    riskiestRole: riskiest.testedRole,
    summary: `${best.playerName} profiles best as ${best.testedRole}; comparison uses score, role risk, upside signals, and tactical safety rather than raw averaging.`,
    coachRecommendation: `Primary use: ${best.testedRole}. Safest use: ${safest.testedRole}. Highest upside: ${upside.testedRole}.`,
  };
}
