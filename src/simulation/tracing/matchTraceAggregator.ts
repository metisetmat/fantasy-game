import type { MatchInput, MatchReport } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { MatchTraceSpineModel } from "./matchTraceSpine";
import { matchTraceAggregateFromSpine } from "./matchTraceAggregateFromSpine";
import type { MatchTraceAggregateModel } from "./matchTraceAggregateTypes";

export type { MatchTraceAggregateModel };

export function buildMatchTraceAggregator(input: {
  readonly traceSpine: MatchTraceSpineModel;
}): MatchTraceAggregateModel {
  return matchTraceAggregateFromSpine({ traceSpine: input.traceSpine });
}

export function matchTraceAggregatorEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: MatchTraceAggregateModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-match-trace-aggregator`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [
      ...input.model.topOfficialDangerZones,
      ...input.model.topOfficialPressureLossZones,
      ...input.model.topOfficialRecoveryZones,
    ].slice(0, 5),
    summary:
      `Match trace aggregator ${input.model.status}: traceSpineStatus=${input.model.traceSpineStatus}, ` +
      `totalInputTraceCount=${input.model.totalInputTraceCount}, totalDeduplicatedTraceCount=${input.model.totalDeduplicatedTraceCount}, ` +
      `duplicateTraceCount=${input.model.totalDuplicateTraceCount}, officialTraceCount=${input.model.official.deduplicatedTraceCount}, ` +
      `diagnosticTraceCount=${input.model.diagnostic.deduplicatedTraceCount}, sandboxTraceCount=${input.model.sandbox.deduplicatedTraceCount}, ` +
      `officialDangerZoneCount=${input.model.topOfficialDangerZones.length}, officialPressureLossZoneCount=${input.model.topOfficialPressureLossZones.length}, ` +
      `officialRecoveryZoneCount=${input.model.topOfficialRecoveryZones.length}, phaseCoverage=${Object.keys(input.model.official.phaseCounts).length}, ` +
      `actionTypeCoverage=${Object.keys(input.model.official.actionTypeCounts).length}, causeTagCoverage=${Object.keys(input.model.official.causeTagCounts).length}, ` +
      `impactTagCoverage=${Object.keys(input.model.official.impactTagCounts).length}, topOfficialCauseTags=${input.model.topOfficialCauseTags.join("|") || "none"}, ` +
      `topOfficialImpactTags=${input.model.topOfficialImpactTags.join("|") || "none"}, topOfficialPlayerInvolvement=${input.model.topOfficialPlayerInvolvement.join("|") || "none"}, ` +
      "selectionPreviewTraceBackingStatus=sandbox_only, mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 56,
    coachVisible: false,
    internalTags: [
      "workbench_chain_match_trace_aggregator",
      ...input.model.tags,
    ],
  };
}

export function matchTraceAggregatorLimitations(model: MatchTraceAggregateModel): readonly string[] {
  if (model.status === "not_available") {
    return ["MATCH_TRACE_AGGREGATOR_NOT_AVAILABLE"];
  }

  return [
    "MATCH_TRACE_AGGREGATOR_DIAGNOSTIC_ONLY",
    "MATCH_TRACE_AGGREGATOR_SCOPE_SEPARATION_OFFICIAL_DIAGNOSTIC_SANDBOX",
    "MATCH_TRACE_AGGREGATOR_CANNOT_MUTATE_OFFICIAL_TIMELINE",
    "MATCH_TRACE_AGGREGATOR_CANNOT_MUTATE_OFFICIAL_SCORE",
    "MATCH_TRACE_AGGREGATOR_CANNOT_MUTATE_OFFICIAL_POSSESSION",
    "MATCH_TRACE_AGGREGATOR_CANNOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "MATCH_TRACE_AGGREGATOR_CANNOT_DRIVE_LIVE_SELECTION",
    "MATCH_TRACE_AGGREGATOR_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "MATCH_TRACE_AGGREGATOR_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "SELECTION_PREVIEW_CONFIDENCE_NOT_UPGRADED_BY_AGGREGATOR",
  ];
}
