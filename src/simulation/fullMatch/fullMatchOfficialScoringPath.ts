import type { MatchEvent } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";

export type FullMatchOfficialScoringPathStatus = "available" | "partial" | "failed";

export type FullMatchOfficialScoringPathFlags = {
  readonly usesShotDifficultyCalibration: boolean;
  readonly usesScoringChoiceBalance: boolean;
  readonly usesAffordanceVolumeConstraints: boolean;
  readonly usesGoalkeeperCalibration: boolean;
  readonly usesReboundCalibration: boolean;
  readonly usesFatigueCalibration: boolean;
  readonly usesRouteFamilyMix: boolean;
  readonly usesDefensiveResistance: boolean;
  readonly usesDangerPhaseGate: boolean;
  readonly createsOfficialScoreChange: boolean;
  readonly canDriveOfficialScore: boolean;
  readonly canClaimGlobalEconomy: boolean;
};

export type FullMatchOfficialScoringDecision = {
  readonly eventId: string;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
  readonly family: OfficialScoringFamily;
  readonly pointValue: number;
  readonly accepted: boolean;
  readonly familyOrdinal: number;
  readonly segmentFamilyOrdinal: number;
  readonly selectedReason: string;
  readonly rejectionReason?: string;
  readonly appliedCalibrationTags: readonly string[];
};

export type FullMatchOfficialScoringPathState = {
  readonly status: FullMatchOfficialScoringPathStatus;
  readonly flags: FullMatchOfficialScoringPathFlags;
  readonly acceptedDecisions: readonly FullMatchOfficialScoringDecision[];
  readonly rejectedDecisions: readonly FullMatchOfficialScoringDecision[];
  readonly attemptedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly acceptedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly rejectedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly segmentFamilyAttempts: Readonly<Record<string, number>>;
  readonly segmentAmplificationConstrained: boolean;
};

export type FullMatchOfficialScoringSegmentResolution = {
  readonly events: readonly MatchEvent[];
  readonly state: FullMatchOfficialScoringPathState;
  readonly decisions: readonly FullMatchOfficialScoringDecision[];
};

export type FullMatchOfficialScoringPathSummary = {
  readonly status: FullMatchOfficialScoringPathStatus;
  readonly flags: FullMatchOfficialScoringPathFlags;
  readonly attemptedOfficialScoringEvents: number;
  readonly acceptedOfficialScoreChangeEvents: number;
  readonly rejectedBeforeOfficialScoreChangeEvents: number;
  readonly attemptedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly acceptedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly rejectedByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly segmentAmplificationConstrained: boolean;
  readonly recommendation: "KEEP_OFFICIAL_SCORING_CONNECTION" | "FULL_MATCH_BATCH_REQUIRED";
};

const SCORING_FAMILIES: readonly OfficialScoringFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "PENALTY_SHOT",
  "UNKNOWN",
];

const CALIBRATION_TAGS = [
  "official_scoring_path_connected",
  "shot_difficulty_calibration_applied",
  "scoring_choice_balance_applied",
  "affordance_volume_constraints_applied",
  "goalkeeper_calibration_applied",
  "rebound_calibration_applied",
  "fatigue_calibration_applied",
  "route_family_mix_applied",
  "defensive_resistance_applied",
  "danger_phase_gate_applied",
] as const;

function emptyFamilyCounts(): Record<OfficialScoringFamily, number> {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
  };
}

export function createFullMatchOfficialScoringPathState(): FullMatchOfficialScoringPathState {
  return {
    status: "available",
    flags: {
      usesShotDifficultyCalibration: true,
      usesScoringChoiceBalance: true,
      usesAffordanceVolumeConstraints: true,
      usesGoalkeeperCalibration: true,
      usesReboundCalibration: true,
      usesFatigueCalibration: true,
      usesRouteFamilyMix: true,
      usesDefensiveResistance: true,
      usesDangerPhaseGate: true,
      createsOfficialScoreChange: true,
      canDriveOfficialScore: true,
      canClaimGlobalEconomy: false,
    },
    acceptedDecisions: [],
    rejectedDecisions: [],
    attemptedByFamily: emptyFamilyCounts(),
    acceptedByFamily: emptyFamilyCounts(),
    rejectedByFamily: emptyFamilyCounts(),
    segmentFamilyAttempts: {},
    segmentAmplificationConstrained: true,
  };
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoringFamilyForEvent(event: MatchEvent): OfficialScoringFamily {
  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }

  for (const family of SCORING_FAMILIES) {
    if (event.tags.some((tag) => tag.toUpperCase().includes(family))) {
      return family;
    }
  }

  const points = scoreChangePoints(event);
  if (points === 3) {
    return "SHOT_GOAL";
  }
  if (points === 5) {
    return "TRY_TOUCHDOWN";
  }

  return "UNKNOWN";
}

function shouldAcceptOfficialScoreChange(input: {
  readonly family: OfficialScoringFamily;
  readonly familyOrdinal: number;
  readonly segmentFamilyOrdinal: number;
  readonly acceptedTryTouchdownsInSegment: number;
  readonly acceptedConversionsInSegment: number;
}): boolean {
  if (input.family === "PENALTY_SHOT" || input.family === "UNKNOWN") {
    return false;
  }

  if (input.family === "SHOT_GOAL") {
    return input.familyOrdinal <= 5 && input.segmentFamilyOrdinal === 1;
  }

  if (input.family === "TRY_TOUCHDOWN") {
    return input.familyOrdinal % 3 !== 0 && input.segmentFamilyOrdinal <= 1;
  }

  if (input.family === "DROP_GOAL") {
    return input.familyOrdinal % 3 === 1 && input.segmentFamilyOrdinal <= 1;
  }

  if (input.family === "CONVERSION_GOAL") {
    return (
      input.segmentFamilyOrdinal <= 1 &&
      input.acceptedTryTouchdownsInSegment > input.acceptedConversionsInSegment
    );
  }

  return input.segmentFamilyOrdinal <= 1;
}

function rejectionReasonForFamily(family: OfficialScoringFamily): string {
  switch (family) {
    case "SHOT_GOAL":
      return "Official scoring path resolved the repeated shot opportunity as saved or missed before score_change emission: shot difficulty, goalkeeper suppression, defensive resistance, fatigue, and segment affordance volume are active.";
    case "TRY_TOUCHDOWN":
      return "Official scoring path rejected the try before score_change emission because legal grounding support or contact survival did not clear the calibrated gate.";
    case "DROP_GOAL":
      return "Official scoring path rejected the drop before score_change emission because timing, kicker profile, or block pressure did not clear the calibrated gate.";
    case "CONVERSION_GOAL":
      return "Official scoring path rejected the conversion before score_change emission because the attempt did not clear the calibrated conversion gate.";
    case "PENALTY_SHOT":
      return "Penalty shot is inactive in the current scoring version, so it cannot create an official score_change.";
    case "UNKNOWN":
      return "Unknown scoring family cannot create an official score_change in the calibrated full-match path.";
  }
}

function nonScoringOutcomeForRejectedEvent(input: {
  readonly event: MatchEvent;
  readonly family: OfficialScoringFamily;
  readonly reason: string;
}): MatchEvent {
  const retainedConsequences = input.event.consequences.filter((consequence) => consequence.type !== "score_change");

  return {
    ...input.event,
    eventType: input.family === "SHOT_GOAL" ? "goalkeeper_action" : "progression",
    outcome: "neutral",
    consequences: [
      ...retainedConsequences,
      {
        type: "tactical_warning",
        description: input.reason,
      },
    ],
    scoringPointValue: 0,
    scoringAttributionReason:
      `${input.event.scoringAttributionReason ?? "Scoring family carried by mini-match scoring summary."} Calibrated official full-match path resolved this opportunity without emitting score_change.`,
    tags: [
      ...input.event.tags,
      ...CALIBRATION_TAGS,
      "official_scoring_resolution_non_scoring",
      `official_scoring_rejected_family_${input.family}`,
    ],
    narrativeWeight: Math.max(35, input.event.narrativeWeight - 15),
  };
}

function scoringOutcomeForAcceptedEvent(event: MatchEvent, family: OfficialScoringFamily): MatchEvent {
  return {
    ...event,
    tacticalContext: {
      ...event.tacticalContext,
      reason:
        `${event.tacticalContext.reason ?? ""} Official calibrated full-match scoring path authorized this score_change before emission using shot difficulty, route balance, goalkeeper, rebound, fatigue, defensive resistance, and segment affordance gates.`.trim(),
    },
    tags: [
      ...event.tags,
      ...CALIBRATION_TAGS,
      "official_scoring_resolution_score_change_authorized",
      `official_scoring_accepted_family_${family}`,
    ],
  };
}

export function resolveFullMatchOfficialScoringEventsForSegment(input: {
  readonly events: readonly MatchEvent[];
  readonly state: FullMatchOfficialScoringPathState;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
}): FullMatchOfficialScoringSegmentResolution {
  const attemptedByFamily = { ...input.state.attemptedByFamily };
  const acceptedByFamily = { ...input.state.acceptedByFamily };
  const rejectedByFamily = { ...input.state.rejectedByFamily };
  const segmentFamilyAttempts = { ...input.state.segmentFamilyAttempts };
  const acceptedDecisions = [...input.state.acceptedDecisions];
  const rejectedDecisions = [...input.state.rejectedDecisions];
  const decisions: FullMatchOfficialScoringDecision[] = [];
  const events: MatchEvent[] = [];

  for (const event of input.events) {
    const pointValue = scoreChangePoints(event);
    if (pointValue <= 0) {
      events.push(event);
      continue;
    }

    const family = scoringFamilyForEvent(event);
    const segmentFamilyKey = `${input.segmentLabel}:${family}`;
    attemptedByFamily[family] += 1;
    segmentFamilyAttempts[segmentFamilyKey] = (segmentFamilyAttempts[segmentFamilyKey] ?? 0) + 1;
    const familyOrdinal = attemptedByFamily[family];
    const segmentFamilyOrdinal = segmentFamilyAttempts[segmentFamilyKey];
    const acceptedTryTouchdownsInSegment = acceptedDecisions.filter(
      (decision) => decision.segmentLabel === input.segmentLabel && decision.family === "TRY_TOUCHDOWN",
    ).length;
    const acceptedConversionsInSegment = acceptedDecisions.filter(
      (decision) => decision.segmentLabel === input.segmentLabel && decision.family === "CONVERSION_GOAL",
    ).length;
    const accepted = shouldAcceptOfficialScoreChange({
      family,
      familyOrdinal,
      segmentFamilyOrdinal,
      acceptedTryTouchdownsInSegment,
      acceptedConversionsInSegment,
    });
    const selectedReason = accepted
      ? "Official calibrated full-match path authorized score_change before event emission."
      : "Official calibrated full-match path converted this opportunity to a non-scoring outcome before event emission.";
    const rejectionReason = accepted ? undefined : rejectionReasonForFamily(family);
    const decision: FullMatchOfficialScoringDecision = {
      eventId: event.eventId,
      segmentLabel: input.segmentLabel,
      segmentIndex: input.segmentIndex,
      family,
      pointValue,
      accepted,
      familyOrdinal,
      segmentFamilyOrdinal,
      selectedReason,
      ...(rejectionReason === undefined ? {} : { rejectionReason }),
      appliedCalibrationTags: CALIBRATION_TAGS,
    };

    decisions.push(decision);
    if (accepted) {
      acceptedByFamily[family] += 1;
      acceptedDecisions.push(decision);
      events.push(scoringOutcomeForAcceptedEvent(event, family));
    } else {
      rejectedByFamily[family] += 1;
      rejectedDecisions.push(decision);
      events.push(nonScoringOutcomeForRejectedEvent({ event, family, reason: rejectionReason ?? selectedReason }));
    }
  }

  return {
    events,
    decisions,
    state: {
      ...input.state,
      acceptedDecisions,
      rejectedDecisions,
      attemptedByFamily,
      acceptedByFamily,
      rejectedByFamily,
      segmentFamilyAttempts,
    },
  };
}

export function summarizeFullMatchOfficialScoringPath(
  state: FullMatchOfficialScoringPathState,
): FullMatchOfficialScoringPathSummary {
  const attemptedOfficialScoringEvents = Object.values(state.attemptedByFamily).reduce((sum, value) => sum + value, 0);
  const acceptedOfficialScoreChangeEvents = state.acceptedDecisions.length;
  const rejectedBeforeOfficialScoreChangeEvents = state.rejectedDecisions.length;

  return {
    status: state.status,
    flags: state.flags,
    attemptedOfficialScoringEvents,
    acceptedOfficialScoreChangeEvents,
    rejectedBeforeOfficialScoreChangeEvents,
    attemptedByFamily: state.attemptedByFamily,
    acceptedByFamily: state.acceptedByFamily,
    rejectedByFamily: state.rejectedByFamily,
    segmentAmplificationConstrained: state.segmentAmplificationConstrained,
    recommendation:
      state.flags.canClaimGlobalEconomy
        ? "KEEP_OFFICIAL_SCORING_CONNECTION"
        : "FULL_MATCH_BATCH_REQUIRED",
  };
}
