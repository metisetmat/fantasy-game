import type {
  FullMatchTraceValidationCardId,
  FullMatchTraceValidationProfileId,
} from "./fullMatchTraceValidationProfiles";
import { getFullMatchTraceProfileSignalExpectation } from "./profileSignalExpectations";

export type FullMatchTraceProfileSignalStatus = "PASS" | "PARTIAL" | "FAIL";

export interface FullMatchTraceProfileSignalAssessment {
  readonly profileId: FullMatchTraceValidationProfileId;
  readonly status: FullMatchTraceProfileSignalStatus;
  readonly expectedSignalTagsPresent: readonly string[];
  readonly expectedSignalTagsMissing: readonly string[];
  readonly acceptedFallbackSignals: readonly string[];
  readonly primarySignalCount: number;
  readonly fallbackSignalCount: number;
  readonly explanation: string;
}

function haystackHas(haystack: string, tag: string): boolean {
  return haystack.includes(tag.toLowerCase());
}

function cardFallbacks(input: {
  readonly changedCards: readonly FullMatchTraceValidationCardId[];
  readonly highPressureTraceCount: number;
  readonly fatigueImpactTotal: number;
}): readonly string[] {
  const fallbacks: string[] = [];

  if (input.highPressureTraceCount > 0) {
    fallbacks.push("high_pressure_trace_count");
  }
  if (input.fatigueImpactTotal >= 180) {
    fallbacks.push("fatigue_impact_total");
  }
  if (input.changedCards.includes("official_danger_zones")) {
    fallbacks.push("danger_zones_changed");
  }
  if (input.changedCards.includes("official_pressure_losses")) {
    fallbacks.push("official_pressure_losses", "pressure_loss_profile_changed");
  }
  if (input.changedCards.includes("official_recoveries")) {
    fallbacks.push("recovery_zones_changed");
  }
  if (input.changedCards.includes("official_player_involvement")) {
    fallbacks.push("player_involvement_changed");
  }
  if (input.changedCards.includes("official_coach_watchpoint")) {
    fallbacks.push("watchpoint_changed");
  }

  return [...new Set(fallbacks)];
}

export function assessFullMatchTraceProfileSignals(input: {
  readonly profileId: FullMatchTraceValidationProfileId;
  readonly haystack: string;
  readonly changedCards: readonly FullMatchTraceValidationCardId[];
  readonly highPressureTraceCount: number;
  readonly fatigueImpactTotal: number;
}): FullMatchTraceProfileSignalAssessment {
  const expectation = getFullMatchTraceProfileSignalExpectation(input.profileId);
  const haystack = input.haystack.toLowerCase();
  const structuralFallbacks = cardFallbacks(input);
  const expectedSignalTagsPresent = expectation.expectedSignals
    .filter((signal) => haystackHas(haystack, signal.tag))
    .map((signal) => signal.tag);
  const expectedSignalTagsMissing = expectation.expectedSignals
    .filter((signal) => !haystackHas(haystack, signal.tag))
    .map((signal) => signal.tag);
  const acceptedFallbackSignals = expectation.expectedSignals.flatMap((signal) =>
    signal.fallbackTags.filter((fallbackTag) =>
      haystackHas(haystack, fallbackTag) || structuralFallbacks.includes(fallbackTag)
    )
  );
  const primarySignalCount = expectedSignalTagsPresent.length;
  const fallbackSignalCount = new Set(acceptedFallbackSignals).size;
  const totalSignalCount = primarySignalCount + fallbackSignalCount;
  const status: FullMatchTraceProfileSignalStatus = primarySignalCount >= expectation.minimumExpectedSignalCount
    ? "PASS"
    : totalSignalCount >= expectation.minimumExpectedSignalCount
      ? "PARTIAL"
      : "FAIL";

  return {
    profileId: input.profileId,
    status,
    expectedSignalTagsPresent,
    expectedSignalTagsMissing,
    acceptedFallbackSignals: [...new Set(acceptedFallbackSignals)],
    primarySignalCount,
    fallbackSignalCount,
    explanation: expectation.tacticalMeaning,
  };
}
