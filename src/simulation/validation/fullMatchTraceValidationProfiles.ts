import type {
  MatchInput,
  PlayerSnapshot,
  TacticalPlan,
  TeamSnapshot,
} from "../../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import type { ZoneId } from "../../core/zones";

export type FullMatchTraceValidationProfileId =
  | "high_press_profile"
  | "low_block_profile"
  | "fast_transition_profile"
  | "power_contact_profile"
  | "strong_goalkeeper_profile"
  | "late_fatigue_profile";

export type FullMatchTraceValidationStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchTraceValidationCardId =
  | "official_danger_zones"
  | "official_pressure_losses"
  | "official_recoveries"
  | "official_player_involvement"
  | "official_recurring_causes"
  | "official_coach_watchpoint";

export type FullMatchTraceValidationProfileResult = {
  readonly profileId: FullMatchTraceValidationProfileId;
  readonly status: FullMatchTraceValidationStatus;
  readonly traceSpineStatus: string;
  readonly aggregatorStatus: string;
  readonly coachReportV0Status: string;
  readonly officialTraceCount: number;
  readonly officialAggregateTraceCount: number;
  readonly cardCount: number;
  readonly topDangerZones: readonly string[];
  readonly topPressureLossZones: readonly string[];
  readonly topRecoveryZones: readonly string[];
  readonly topPlayerInvolvement: readonly string[];
  readonly topCauseTags: readonly string[];
  readonly topImpactTags: readonly string[];
  readonly highPressureTraceCount: number;
  readonly fatigueImpactTotal: number;
  readonly expectedSignalsPresent: boolean;
  readonly expectedSignalsMissing: readonly string[];
  readonly reportChangedFromBaseline: boolean;
  readonly changedCards: readonly FullMatchTraceValidationCardId[];
  readonly cardSignatureByCardId: Readonly<Record<FullMatchTraceValidationCardId, string>>;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
};

export type FullMatchTraceValidationModel = {
  readonly status: FullMatchTraceValidationStatus;
  readonly profileCount: number;
  readonly baselineProfileId: FullMatchTraceValidationProfileId;
  readonly profiles: readonly FullMatchTraceValidationProfileResult[];
  readonly profileVariationDetected: boolean;
  readonly reportVariationDetected: boolean;
  readonly distinctDangerZoneProfiles: number;
  readonly distinctPressureLossProfiles: number;
  readonly distinctRecoveryProfiles: number;
  readonly distinctCauseTagProfiles: number;
  readonly distinctWatchpointProfiles: number;
  readonly allProfilesKeepOfficialDiagnosticSandboxSeparate: boolean;
  readonly allProfilesKeepSelectionPreviewSandboxOnly: boolean;
  readonly noProfileUpgradesSelectionPreviewConfidence: boolean;
  readonly mutationCountsAllZero: true;
  readonly productionScoringEventCreationCount: 0;
  readonly globalEconomyClaimCount: 0;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type FullMatchTraceValidationProfile = {
  readonly profileId: FullMatchTraceValidationProfileId;
  readonly label: string;
  readonly expectedSignals: readonly string[];
  readonly createInput: () => MatchInput;
};

export const FULL_MATCH_TRACE_VALIDATION_BASELINE_PROFILE_ID: FullMatchTraceValidationProfileId = "high_press_profile";

const z2c = "Z2-C" as ZoneId;
const z3c = "Z3-C" as ZoneId;
const z4c = "Z4-C" as ZoneId;
const z5c = "Z5-C" as ZoneId;
const z5hsl = "Z5-HSL" as ZoneId;
const z5hsr = "Z5-HSR" as ZoneId;

function baseInput(profileId: FullMatchTraceValidationProfileId): MatchInput {
  return {
    ...engineToCoachPublicContractFixtures.matchInputFixture,
    matchId: `trace-validation-${profileId}`,
    seed: `trace-validation-seed-${profileId}`,
  };
}

function withPlan(plan: TacticalPlan, patch: Partial<TacticalPlan>): TacticalPlan {
  return {
    ...plan,
    ...patch,
  };
}

function mapRoster(team: TeamSnapshot, mapper: (player: PlayerSnapshot) => PlayerSnapshot): TeamSnapshot {
  return {
    ...team,
    roster: team.roster.map(mapper),
  };
}

function boostGoalkeeper(team: TeamSnapshot): TeamSnapshot {
  return mapRoster(team, (player) => {
    if (player.playerId !== team.goalkeeperId) {
      return player;
    }

    return {
      ...player,
      attributes: {
        ...player.attributes,
        handPlay: 99,
        agility: 92,
        intelligence: 98,
        mental: 99,
      },
      traits: [...new Set([...player.traits, "elite_rebound_control", "high_concentration_load_resistance"])],
      currentCondition: 98,
      mentalFreshness: 99,
    };
  });
}

function fatigueRoster(team: TeamSnapshot): TeamSnapshot {
  return mapRoster(team, (player) => ({
    ...player,
    currentCondition: Math.max(55, player.currentCondition - 26),
    mentalFreshness: Math.max(52, player.mentalFreshness - 30),
    traits: [...new Set([...player.traits, "late_fatigue_risk"])],
  }));
}

export const FULL_MATCH_TRACE_VALIDATION_PROFILES: readonly FullMatchTraceValidationProfile[] = [
  {
    profileId: "high_press_profile",
    label: "High Press",
    expectedSignals: ["pressure_forced_error", "high_pressure", "fatigue_drop"],
    createInput: () => {
      const input = baseInput("high_press_profile");
      return {
        ...input,
        homePlan: withPlan(input.homePlan, {
          defensiveIntent: "high_press",
          transitionIntent: "counterpress",
          tempo: "fast",
          riskLevel: "high",
          targetZones: [z5c, z5hsl],
          pressingIntensity: 95,
          defensiveLineHeight: 88,
          restDefensePriority: 45,
        }),
      };
    },
  },
  {
    profileId: "low_block_profile",
    label: "Low Block",
    expectedSignals: ["defensive_recovery", "low_block", "rest_defense"],
    createInput: () => {
      const input = baseInput("low_block_profile");
      return {
        ...input,
        homePlan: withPlan(input.homePlan, {
          defensiveIntent: "low_block",
          transitionIntent: "delay_and_recover",
          tempo: "slow",
          riskLevel: "low",
          targetZones: [z2c, z3c],
          pressingIntensity: 18,
          defensiveLineHeight: 24,
          widthUsage: 42,
          restDefensePriority: 94,
        }),
      };
    },
  },
  {
    profileId: "fast_transition_profile",
    label: "Fast Transition",
    expectedSignals: ["speed_advantage", "line_broken", "fast_break"],
    createInput: () => {
      const input = baseInput("fast_transition_profile");
      return {
        ...input,
        homePlan: withPlan(input.homePlan, {
          attackingIntent: "wide_progression",
          transitionIntent: "fast_break",
          tempo: "fast",
          riskLevel: "medium",
          targetZones: [z5hsl, z5hsr, z5c],
          widthUsage: 88,
          pressingIntensity: 62,
        }),
      };
    },
  },
  {
    profileId: "power_contact_profile",
    label: "Power / Contact",
    expectedSignals: ["power_advantage", "direct_pressure", "fatigue_drop"],
    createInput: () => {
      const input = baseInput("power_contact_profile");
      return {
        ...input,
        homePlan: withPlan(input.homePlan, {
          attackingIntent: "direct_pressure",
          transitionIntent: "territorial_reset",
          tempo: "balanced",
          riskLevel: "high",
          targetZones: [z4c, z5c],
          widthUsage: 36,
          pressingIntensity: 70,
          restDefensePriority: 58,
        }),
      };
    },
  },
  {
    profileId: "strong_goalkeeper_profile",
    label: "Strong Goalkeeper",
    expectedSignals: ["goalkeeper_quality", "shot_prevented", "goalkeeper_profile_strong"],
    createInput: () => {
      const input = baseInput("strong_goalkeeper_profile");
      return {
        ...input,
        homeTeam: boostGoalkeeper(input.homeTeam),
        awayPlan: withPlan(input.awayPlan, {
          attackingIntent: "territorial_kicking",
          scoringBias: "goal_first",
          targetZones: [z5c, z5hsr],
          tempo: "fast",
          riskLevel: "medium",
        }),
      };
    },
  },
  {
    profileId: "late_fatigue_profile",
    label: "Late Fatigue",
    expectedSignals: ["fatigue_drop", "fatigue_generated", "late_fatigue"],
    createInput: () => {
      const input = baseInput("late_fatigue_profile");
      return {
        ...input,
        homeTeam: fatigueRoster(input.homeTeam),
        awayTeam: fatigueRoster(input.awayTeam),
        homePlan: withPlan(input.homePlan, {
          tempo: "fast",
          riskLevel: "high",
          transitionIntent: "counterpress",
          pressingIntensity: 90,
          defensiveLineHeight: 78,
          restDefensePriority: 40,
        }),
        awayPlan: withPlan(input.awayPlan, {
          tempo: "fast",
          riskLevel: "high",
          pressingIntensity: 92,
          defensiveLineHeight: 82,
          restDefensePriority: 38,
        }),
      };
    },
  },
] as const;

export function getFullMatchTraceValidationProfile(
  profileId: FullMatchTraceValidationProfileId,
): FullMatchTraceValidationProfile {
  const profile = FULL_MATCH_TRACE_VALIDATION_PROFILES.find((candidate) => candidate.profileId === profileId);
  if (profile === undefined) {
    throw new Error(`Unknown full-match trace validation profile: ${profileId}`);
  }

  return profile;
}
