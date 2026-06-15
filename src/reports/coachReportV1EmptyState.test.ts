import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchReport } from "../contracts/engineToCoach";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";
import { buildCoachReportV1Visualization } from "./buildCoachReportV1Visualization";
import { createMatchTraceEvent } from "../simulation/tracing/matchTraceEvent";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function reportFixture(): MatchReport {
  return {
    matchId: "coach-report-v1-empty-state",
    score: { home: 0, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "test",
      limitations: [],
    },
    timeline: [],
    teamStats: [],
    playerStats: [],
    zoneStats: [],
    fatigueReport: { teamSummaries: [], playerSummaries: [] },
    tacticalReport: { diagnoses: [] },
    keyMoments: [],
    coachInsights: [],
    suggestedFocus: [],
  };
}

export function validateCoachReportV1EmptyState(): readonly string[] {
  const traces = [
    createMatchTraceEvent({
      traceId: "official-danger",
      source: "official_match_event",
      matchId: "coach-report-v1-empty-state",
      minute: 8,
      sequenceId: "sequence-1",
      teamId: "CONTROL",
      opponentTeamId: "BLITZ",
      phase: "FINAL_ZONE_ATTACK",
      zone: "Z5-C",
      actionType: "SHOT",
      outcome: "SHOT_CREATED",
      primaryPlayerId: "control-space-hunter",
      pressureLevel: "HIGH",
      causeTags: ["good_decision"],
      impactTags: ["danger_created"],
      dangerDelta: 18,
      possessionValueDelta: 6,
      coachVisible: true,
      diagnosticWeight: 70,
      officialTruth: true,
      tags: ["empty_state_pressure_detected"],
      warnings: [],
    }),
    createMatchTraceEvent({
      traceId: "official-recovery",
      source: "official_match_event",
      matchId: "coach-report-v1-empty-state",
      minute: 12,
      sequenceId: "sequence-2",
      teamId: "CONTROL",
      opponentTeamId: "BLITZ",
      phase: "DEFENSIVE_TRANSITION",
      zone: "Z3-C",
      actionType: "RECOVERY",
      outcome: "RECOVERY_WON",
      primaryPlayerId: "control-mobile-lock",
      pressureLevel: "HIGH",
      causeTags: ["defensive_recovery"],
      impactTags: ["possession_secured"],
      dangerDelta: -4,
      possessionValueDelta: 10,
      coachVisible: true,
      diagnosticWeight: 64,
      officialTruth: true,
      tags: ["empty_state_recovery"],
      warnings: [],
    }),
  ];
  const aggregate = matchTraceAggregateFromSpine({
    traceSpine: {
      status: "available",
      traces,
      totalTraceCount: traces.length,
      officialTraceCount: traces.length,
      miniMatchTraceCount: 0,
      sandboxTraceCount: 0,
      phaseCoverageCount: 2,
      actionTypeCoverageCount: 2,
      causeTagCoverageCount: 2,
      impactTagCoverageCount: 2,
      coachVisibleTraceCount: traces.length,
      officialTruthTrueCount: traces.length,
      officialTruthFalseCount: 0,
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
    } satisfies MatchTraceSpineModel,
  });
  const traceV0 = buildCoachReportFromTraceAggregates({ aggregate });
  const model = buildCoachReportV1Visualization({
    matchReport: reportFixture(),
    traceV0,
    aggregate,
  });

  assertTest(model.emptyPressureLossZoneState, "V1 must expose pressure-loss zone empty state.");
  assertTest(model.tags.includes("coach_report_v1_empty_pressure_loss_zone_state_true"), "empty-state tag must be true.");
  assertTest(
    model.zoneCards.some((card) => card.bullets.includes("Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées.")),
    "empty-state wording must be present.",
  );
  assertTest(engineToCoachPublicContractFixtures.matchInputFixture.matchId.length > 0, "fixture import must remain valid.");

  return [
    "V1 exposes pressure-loss zone empty state",
    "empty-state tag is true",
    "required empty-state wording is present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1EmptyState();

  console.log("coachReportV1EmptyState tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
