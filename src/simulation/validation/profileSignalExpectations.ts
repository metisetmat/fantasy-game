import type { FullMatchTraceValidationProfileId } from "./fullMatchTraceValidationProfiles";

export interface FullMatchTraceProfileExpectedSignal {
  readonly tag: string;
  readonly label: string;
  readonly required: boolean;
  readonly fallbackTags: readonly string[];
}

export interface FullMatchTraceProfileSignalExpectation {
  readonly profileId: FullMatchTraceValidationProfileId;
  readonly expectedSignals: readonly FullMatchTraceProfileExpectedSignal[];
  readonly minimumExpectedSignalCount: number;
  readonly tacticalMeaning: string;
}

export const FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS: readonly FullMatchTraceProfileSignalExpectation[] = [
  {
    profileId: "high_press_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le profil pressing haut fait ressortir davantage de pression et de récupérations liées à l'intensité.",
    expectedSignals: [
      {
        tag: "pressure_forced_error",
        label: "pression forcée",
        required: true,
        fallbackTags: ["high_pressure_trace_count", "official_pressure_losses", "pressing_high", "counterpress"],
      },
      {
        tag: "fatigue_drop",
        label: "fatigue liée à l'intensité",
        required: false,
        fallbackTags: ["fatigue_impact_total", "fatigue visible", "pressing_high"],
      },
    ],
  },
  {
    profileId: "low_block_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le bloc bas déplace les récupérations et les vigilances vers une défense plus basse ou plus prudente.",
    expectedSignals: [
      {
        tag: "defensive_recovery",
        label: "récupération défensive",
        required: true,
        fallbackTags: ["recovery_zones_changed", "watchpoint_changed", "pressure_loss_profile_changed", "low_block", "rest_defense_high"],
      },
    ],
  },
  {
    profileId: "fast_transition_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le profil transition rapide fait ressortir davantage de progression, de rupture de ligne ou d'implication des porteurs.",
    expectedSignals: [
      {
        tag: "speed_advantage",
        label: "avantage de vitesse",
        required: true,
        fallbackTags: ["danger_zones_changed", "player_involvement_changed", "transition_fast_break", "tempo_fast"],
      },
      {
        tag: "line_broken",
        label: "ligne cassée",
        required: false,
        fallbackTags: ["official_danger_zones", "progression", "carry"],
      },
    ],
  },
  {
    profileId: "power_contact_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le profil puissance/contact fait ressortir davantage de duels, d'avantage physique ou de progression directe.",
    expectedSignals: [
      {
        tag: "power_advantage",
        label: "avantage physique",
        required: true,
        fallbackTags: ["attacking_direct_pressure", "risk_high", "duel", "direct_pressure"],
      },
      {
        tag: "fatigue_drop",
        label: "fatigue de contact",
        required: false,
        fallbackTags: ["fatigue_impact_total", "fatigue visible"],
      },
    ],
  },
  {
    profileId: "strong_goalkeeper_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le profil gardien fort fait ressortir la qualité du gardien ou la nécessité de mieux préparer le second ballon.",
    expectedSignals: [
      {
        tag: "goalkeeper_quality",
        label: "qualité du gardien",
        required: true,
        fallbackTags: ["goalkeeper_profile_strong", "goalkeeper_action", "shot_prevented", "second_ball", "rebound"],
      },
    ],
  },
  {
    profileId: "late_fatigue_profile",
    minimumExpectedSignalCount: 1,
    tacticalMeaning: "Le profil fatigue tardive fait ressortir une baisse de lucidité ou un risque de pertes en fin de séquence.",
    expectedSignals: [
      {
        tag: "fatigue_drop",
        label: "fatigue visible",
        required: true,
        fallbackTags: ["fatigue_impact_total", "late_fatigue_risk", "lucidity", "late_control"],
      },
      {
        tag: "fatigue_generated",
        label: "fatigue provoquée",
        required: false,
        fallbackTags: ["fatigue_impact_total", "condition", "mental_freshness"],
      },
    ],
  },
];

export function getFullMatchTraceProfileSignalExpectation(
  profileId: FullMatchTraceValidationProfileId,
): FullMatchTraceProfileSignalExpectation {
  const expectation = FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.find((candidate) => candidate.profileId === profileId);
  if (expectation === undefined) {
    throw new Error(`Missing signal expectation for profile: ${profileId}`);
  }

  return expectation;
}
