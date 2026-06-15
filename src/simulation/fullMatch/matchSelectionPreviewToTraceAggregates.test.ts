import { matchTraceAggregateFromSpine } from "../tracing/matchTraceAggregateFromSpine";
import { createMatchTraceEvent, type MatchTraceEvent } from "../tracing/matchTraceEvent";
import type { MatchTraceSpineModel } from "../tracing/matchTraceSpine";
import { matchTraceAggregateFixture } from "../tracing/matchTraceAggregateFixture";
import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";
import { multiScenarioCoachTestPlanFromBatch } from "./multiScenarioCoachTestPlanFromBatch";
import { selectionPreviewFromCoachTestPlan } from "./selectionPreviewFromCoachTestPlanBuilder";
import { matchSelectionPreviewToTraceAggregates } from "./matchSelectionPreviewToTraceAggregates";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function trace(input: {
  readonly traceId: string;
  readonly source: MatchTraceEvent["source"];
  readonly officialTruth: boolean;
  readonly actionType: MatchTraceEvent["actionType"];
  readonly outcome: MatchTraceEvent["outcome"];
  readonly zone: string;
  readonly causeTags: MatchTraceEvent["causeTags"];
  readonly impactTags: MatchTraceEvent["impactTags"];
  readonly pressureLevel?: MatchTraceEvent["pressureLevel"];
}): MatchTraceEvent {
  return createMatchTraceEvent({
    traceId: input.traceId,
    source: input.source,
    matchId: "fixture-match",
    minute: 12,
    teamId: "CONTROL",
    opponentTeamId: "BLITZ",
    phase: input.actionType === "GOALKEEPER_SAVE" ? "GOALKEEPER_SEQUENCE" : "FINAL_ZONE_ATTACK",
    zone: input.zone,
    actionType: input.actionType,
    outcome: input.outcome,
    pressureLevel: input.pressureLevel ?? "MEDIUM",
    causeTags: input.causeTags,
    impactTags: input.impactTags,
    dangerDelta: 12,
    possessionValueDelta: 5,
    fatigueImpact: input.causeTags.includes("fatigue_drop") ? 2 : 0,
    coachVisible: input.officialTruth,
    diagnosticWeight: 70,
    officialTruth: input.officialTruth,
    tags: [],
    warnings: [],
  });
}

function spine(traces: readonly MatchTraceEvent[]): MatchTraceSpineModel {
  return {
    status: "available",
    traces,
    totalTraceCount: traces.length,
    officialTraceCount: traces.filter((candidate) => candidate.source === "official_match_event").length,
    miniMatchTraceCount: traces.filter((candidate) => candidate.source === "mini_match_record").length,
    sandboxTraceCount: traces.filter((candidate) => candidate.source === "sandbox_event").length,
    phaseCoverageCount: 3,
    actionTypeCoverageCount: 4,
    causeTagCoverageCount: 5,
    impactTagCoverageCount: 5,
    coachVisibleTraceCount: traces.filter((candidate) => candidate.coachVisible).length,
    officialTruthTrueCount: traces.filter((candidate) => candidate.officialTruth).length,
    officialTruthFalseCount: traces.filter((candidate) => !candidate.officialTruth).length,
    traceMutationCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    globalEconomyClaimCount: 0,
    selectionPreviewTraceBackingStatus: "sandbox_only",
    tags: ["match_event_trace_spine"],
    warnings: [],
  };
}

function preview() {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  return selectionPreviewFromCoachTestPlan({ testPlan: plan });
}

export function validateMatchSelectionPreviewToTraceAggregates(): readonly string[] {
  const model = preview();
  const officialAggregate = matchTraceAggregateFromSpine({
    traceSpine: spine([
      ...matchTraceAggregateFixture(),
      trace({
        traceId: "official-hsr-support",
        source: "official_match_event",
        officialTruth: true,
        actionType: "RECOVERY",
        outcome: "RECOVERY_WON",
        zone: "Z5-HSR",
        causeTags: ["defensive_recovery", "pressure_forced_error"],
        impactTags: ["danger_created", "possession_secured"],
        pressureLevel: "HIGH",
      }),
      trace({
        traceId: "official-recovery",
        source: "official_match_event",
        officialTruth: true,
        actionType: "RECOVERY",
        outcome: "RECOVERY_WON",
        zone: "Z3-C",
        causeTags: ["defensive_recovery", "second_ball_presence"],
        impactTags: ["possession_secured", "second_chance_allowed"],
        pressureLevel: "HIGH",
      }),
      trace({
        traceId: "official-gk",
        source: "official_match_event",
        officialTruth: true,
        actionType: "GOALKEEPER_SAVE",
        outcome: "SAVE_MADE",
        zone: "Z5-C",
        causeTags: ["goalkeeper_quality"],
        impactTags: ["shot_prevented"],
      }),
    ]),
  });
  const matched = matchSelectionPreviewToTraceAggregates({ preview: model, aggregate: officialAggregate });
  const support = matched.supports.find((candidate) => candidate.previewId === "support_near_z4_hsr");
  const secondBall = matched.supports.find((candidate) => candidate.previewId === "second_ball_presence");
  const goalkeeper = matched.supports.find((candidate) => candidate.previewId === "strong_goalkeeper_response");

  const sandboxOnlyAggregate = matchTraceAggregateFromSpine({
    traceSpine: spine([
      trace({
        traceId: "sandbox-only-gk",
        source: "sandbox_event",
        officialTruth: false,
        actionType: "GOALKEEPER_SAVE",
        outcome: "SAVE_MADE",
        zone: "Z5-C",
        causeTags: ["goalkeeper_quality"],
        impactTags: ["shot_prevented"],
      }),
    ]),
  });
  const sandboxOnlyMatched = matchSelectionPreviewToTraceAggregates({ preview: model, aggregate: sandboxOnlyAggregate });
  const unrelatedOfficialAggregate = matchTraceAggregateFromSpine({
    traceSpine: spine([
      trace({
        traceId: "official-unrelated",
        source: "official_match_event",
        officialTruth: true,
        actionType: "RECOVERY",
        outcome: "RECOVERY_WON",
        zone: "Z1-C",
        causeTags: ["defensive_recovery", "fatigue_drop"],
        impactTags: ["possession_secured"],
        pressureLevel: "HIGH",
      }),
    ]),
  });
  const unrelatedOfficialMatched = matchSelectionPreviewToTraceAggregates({ preview: model, aggregate: unrelatedOfficialAggregate });
  const unrelatedSupport = unrelatedOfficialMatched.supports.find((candidate) => candidate.previewId === "support_near_z4_hsr");

  assertTest(support !== undefined, "support near Z4-HSR support row must exist.");
  assertTest(secondBall !== undefined, "second-ball support row must exist.");
  assertTest(goalkeeper !== undefined, "goalkeeper support row must exist.");
  assertTest(support.newBackingStatus === "trace_supported", "support near Z4-HSR must match official danger/recovery/cause signals.");
  assertTest(support.supportReasons.includes("danger_zone_support"), "support preview must expose danger support.");
  assertTest(support.matchedDangerZones.every((zone) => zone === "Z4-HSR" || zone === "Z5-HSR" || zone === "Z3-HSR"), "support preview must only expose scoped matched danger zones.");
  assertTest(secondBall?.newBackingStatus === "trace_supported", "second-ball preview must match recovery/impact/second-ball signals.");
  assertTest(secondBall.supportReasons.includes("second_ball_signal_support"), "second-ball preview must expose second-ball support.");
  assertTest(goalkeeper?.newBackingStatus === "trace_supported", "goalkeeper preview must match goalkeeper/danger/second-ball signals.");
  assertTest(goalkeeper.supportReasons.includes("goalkeeper_signal_support"), "goalkeeper preview must expose goalkeeper support.");
  assertTest(sandboxOnlyMatched.status === "not_available", "sandbox-only aggregate evidence must keep trace backing not_available.");
  assertTest(sandboxOnlyMatched.supports.length === 0, "sandbox-only aggregate evidence must not create support rows.");
  assertTest(unrelatedSupport !== undefined, "unrelated official aggregate must still create a support row.");
  assertTest(unrelatedSupport.newBackingStatus === "sandbox_only", "unrelated official zones must not support the Z4-HSR support preview.");
  assertTest(unrelatedSupport.supportReasons.length === 0, "unrelated official zones must not create support reasons for the Z4-HSR support preview.");

  return [
    "support near Z4-HSR can match official danger/recovery/cause signals",
    "support near Z4-HSR requires scoped official zones",
    "second-ball presence can match recovery/impact/second-ball signals",
    "strong goalkeeper response can match goalkeeper/danger/second-ball signals",
    "sandbox aggregate evidence alone keeps trace backing not_available",
    "unrelated official aggregate evidence alone cannot create trace_supported",
  ];
}

if (require.main === module) {
  const checks = validateMatchSelectionPreviewToTraceAggregates();

  console.log("matchSelectionPreviewToTraceAggregates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
