import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export type RouteEconomyWarningCode =
  | "EARNED_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC"
  | "BORDERLINE_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC"
  | "CONTINUATION_TO_OPPORTUNITY_TOO_HIGH"
  | "GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_HIGH"
  | "LOW_QUALITY_DANGER_BECAME_OPPORTUNITY"
  | "MEDIUM_QUALITY_DANGER_BECAME_OPPORTUNITY_TOO_OFTEN"
  | "HIGH_QUALITY_DANGER_PRESERVED"
  | "HALF_CHANCE_LAYER_ADDED"
  | "FORCED_DEFENSIVE_ACTION_LAYER_ADDED"
  | "TERRITORIAL_GAIN_LAYER_ADDED"
  | "ROUTE_QUALITY_GATE_CONNECTED"
  | "OPPORTUNITY_QUALITY_GATE_CONNECTED"
  | "ROUTE_ECONOMY_HEALTHY"
  | "ROUTE_ECONOMY_PARTIAL"
  | "ROUTE_ECONOMY_REGRESSED";

export interface RouteEconomyDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchRouteEconomyRecheckAudit {
  readonly routeEconomyWindowCount: number;
  readonly earnedDangerWindowCount: number;
  readonly borderlineDangerWindowCount: number;
  readonly continuationWindowCount: number;
  readonly goalkeeperSecureWindowCount: number;
  readonly earnedDangerToOpportunityCount: number;
  readonly earnedDangerToHalfChanceCount: number;
  readonly earnedDangerToForcedDefensiveActionCount: number;
  readonly earnedDangerToTerritorialGainCount: number;
  readonly earnedDangerToMomentumGainCount: number;
  readonly earnedDangerToSafePossessionCount: number;
  readonly earnedDangerToNeutralCount: number;
  readonly borderlineDangerToOpportunityCount: number;
  readonly borderlineDangerToHalfChanceCount: number;
  readonly borderlineDangerToForcedDefensiveActionCount: number;
  readonly borderlineDangerToTerritorialGainCount: number;
  readonly borderlineDangerToNeutralCount: number;
  readonly continuationToOpportunityCount: number;
  readonly continuationToPossessionCount: number;
  readonly continuationToRebuildCount: number;
  readonly continuationToTurnoverCount: number;
  readonly continuationToDefensiveRecoveryCount: number;
  readonly goalkeeperSecureToDangerAgainstCount: number;
  readonly goalkeeperSecureToSafePossessionCount: number;
  readonly goalkeeperSecureToRebuildCount: number;
  readonly goalkeeperSecureToTurnoverAgainstCount: number;
  readonly routeQualityGatePassCount: number;
  readonly routeQualityGateFailCount: number;
  readonly opportunityQualityGatePassCount: number;
  readonly opportunityQualityGateFailCount: number;
  readonly lowQualityDangerBlockedFromOpportunityCount: number;
  readonly mediumQualityDangerConvertedToHalfChanceCount: number;
  readonly mediumQualityDangerConvertedToOpportunityCount: number;
  readonly lowQualityDangerConvertedToOpportunityCount: number;
  readonly highQualityDangerConvertedToOpportunityCount: number;
  readonly dangerQualityDistribution: readonly RouteEconomyDistributionRow[];
  readonly dangerOutcomeDistribution: readonly RouteEconomyDistributionRow[];
  readonly routeEconomyWarningCodes: readonly RouteEconomyWarningCode[];
  readonly recommendation:
    | "KEEP_ROUTE_ECONOMY_RECHECK"
    | "MONITOR_ROUTE_ECONOMY_PARTIAL"
    | "REPAIR_ROUTE_ECONOMY_REGRESSION";
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function hasTagPrefix(event: MatchEvent, prefix: string): boolean {
  return event.tags.some((tag) => tag.startsWith(prefix));
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function distribution(events: readonly MatchEvent[], prefix: string, labelName: string): readonly RouteEconomyDistributionRow[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    for (const tag of event.tags) {
      if (tag.startsWith(prefix)) {
        const label = tag.replace(prefix, "");
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
  }

  if (counts.size === 0) {
    return [{ label: `${labelName}_NONE`, count: 0 }];
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function nextTeamEvent(timeline: readonly MatchEvent[], index: number, teamId: string): MatchEvent | undefined {
  return timeline.slice(index + 1, index + 5).find((event) => event.teamId === teamId);
}

function isOpportunity(event: MatchEvent | undefined): boolean {
  if (event === undefined) {
    return false;
  }
  return scoreChangePoints(event) > 0 ||
    event.eventType === "scoring" ||
    event.tags.some((tag) =>
      tag === "official_route_family_SHOT_GOAL" ||
      tag === "official_route_family_TRY_TOUCHDOWN" ||
      tag === "official_route_family_DROP_GOAL" ||
      tag === "official_route_family_CONVERSION_GOAL"
    );
}

function isGoalkeeperSecure(event: MatchEvent): boolean {
  return hasTag(event, "goalkeeper_secure_reset_break_6l") ||
    hasTag(event, "GOALKEEPER_SECURE_SAFE_RESTART") ||
    event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => tag.toLowerCase().includes("goalkeeper_secure"));
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

export function auditFullMatchRouteEconomyRecheck(report: MatchReport): FullMatchRouteEconomyRecheckAudit {
  const timeline = [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
  const routeEconomyEvents = timeline.filter((event) => hasTag(event, "route_economy_recheck_6q"));
  const earnedEvents = routeEconomyEvents.filter((event) => hasTag(event, "earned_danger_confirmed"));
  const borderlineEvents = routeEconomyEvents.filter((event) => hasTag(event, "borderline_danger_allowed"));
  const opportunityEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_SCORING_OPPORTUNITY"));
  const halfChanceEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_HALF_CHANCE"));
  const forcedDefensiveActionEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_FORCED_DEFENSIVE_ACTION"));
  const territorialGainEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_TERRITORIAL_GAIN"));
  const momentumGainEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_MOMENTUM_GAIN"));
  const safePossessionEvents = routeEconomyEvents.filter((event) => hasTag(event, "danger_outcome_SAFE_POSSESSION"));
  const continuationEvents = timeline.filter((event) => hasTag(event, "official_route_family_CONTINUATION"));
  const goalkeeperSecureEvents = timeline.filter(isGoalkeeperSecure);
  const continuationToOpportunityCount = continuationEvents.filter((event) => {
    const index = timeline.findIndex((item) => item.eventId === event.eventId);
    return isOpportunity(nextTeamEvent(timeline, index, event.teamId));
  }).length;
  const continuationToTurnoverCount = continuationEvents.filter((event) => {
    const index = timeline.findIndex((item) => item.eventId === event.eventId);
    const next = nextTeamEvent(timeline, index, event.opponentTeamId);
    return next !== undefined && (next.eventType === "turnover" || hasTagPrefix(next, "official_route_family_"));
  }).length;
  const goalkeeperSecureToDangerAgainstCount = goalkeeperSecureEvents.filter((event) => {
    const index = timeline.findIndex((item) => item.eventId === event.eventId);
    return isOpportunity(nextTeamEvent(timeline, index, event.opponentTeamId));
  }).length;
  const goalkeeperSecureToSafePossessionCount = goalkeeperSecureEvents.filter((event) => {
    const index = timeline.findIndex((item) => item.eventId === event.eventId);
    const next = nextTeamEvent(timeline, index, event.teamId);
    return next !== undefined && !isOpportunity(next);
  }).length;
  const lowQualityOpportunityCount = routeEconomyEvents.filter((event) =>
    hasTag(event, "danger_quality_LOW_QUALITY_DANGER") && hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")
  ).length;
  const mediumQualityOpportunityCount = routeEconomyEvents.filter((event) =>
    hasTag(event, "danger_quality_MEDIUM_QUALITY_DANGER") && hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")
  ).length;
  const warnings: RouteEconomyWarningCode[] = [];
  const earnedOpportunityRate = rate(earnedEvents.filter((event) => hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")).length, earnedEvents.length);
  const borderlineOpportunityRate = rate(borderlineEvents.filter((event) => hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")).length, borderlineEvents.length);
  const continuationOpportunityRate = rate(continuationToOpportunityCount, continuationEvents.length);
  const goalkeeperDangerRate = rate(goalkeeperSecureToDangerAgainstCount, goalkeeperSecureEvents.length);

  if (earnedOpportunityRate > 75) warnings.push("EARNED_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC");
  if (borderlineOpportunityRate > 60) warnings.push("BORDERLINE_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC");
  if (continuationOpportunityRate > 55) warnings.push("CONTINUATION_TO_OPPORTUNITY_TOO_HIGH");
  if (goalkeeperDangerRate > 50) warnings.push("GOALKEEPER_SECURE_TO_DANGER_AGAINST_TOO_HIGH");
  if (lowQualityOpportunityCount > 0) warnings.push("LOW_QUALITY_DANGER_BECAME_OPPORTUNITY");
  if (mediumQualityOpportunityCount > 0) warnings.push("MEDIUM_QUALITY_DANGER_BECAME_OPPORTUNITY_TOO_OFTEN");
  if (opportunityEvents.some((event) => hasTag(event, "danger_quality_HIGH_QUALITY_DANGER"))) warnings.push("HIGH_QUALITY_DANGER_PRESERVED");
  if (halfChanceEvents.length > 0) warnings.push("HALF_CHANCE_LAYER_ADDED");
  if (forcedDefensiveActionEvents.length > 0) warnings.push("FORCED_DEFENSIVE_ACTION_LAYER_ADDED");
  if (territorialGainEvents.length > 0) warnings.push("TERRITORIAL_GAIN_LAYER_ADDED");
  if (routeEconomyEvents.some((event) => hasTag(event, "route_quality_gate_connected"))) warnings.push("ROUTE_QUALITY_GATE_CONNECTED");
  if (routeEconomyEvents.some((event) => hasTag(event, "opportunity_quality_gate_connected"))) warnings.push("OPPORTUNITY_QUALITY_GATE_CONNECTED");

  const blocking = warnings.some((warning) =>
    warning === "EARNED_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC" ||
    warning === "BORDERLINE_DANGER_TO_OPPORTUNITY_TOO_AUTOMATIC" ||
    warning === "LOW_QUALITY_DANGER_BECAME_OPPORTUNITY"
  );
  warnings.push(blocking ? "ROUTE_ECONOMY_PARTIAL" : "ROUTE_ECONOMY_HEALTHY");

  return {
    routeEconomyWindowCount: routeEconomyEvents.length,
    earnedDangerWindowCount: earnedEvents.length,
    borderlineDangerWindowCount: borderlineEvents.length,
    continuationWindowCount: continuationEvents.length,
    goalkeeperSecureWindowCount: goalkeeperSecureEvents.length,
    earnedDangerToOpportunityCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")).length,
    earnedDangerToHalfChanceCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_HALF_CHANCE")).length,
    earnedDangerToForcedDefensiveActionCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_FORCED_DEFENSIVE_ACTION")).length,
    earnedDangerToTerritorialGainCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_TERRITORIAL_GAIN")).length,
    earnedDangerToMomentumGainCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_MOMENTUM_GAIN")).length,
    earnedDangerToSafePossessionCount: earnedEvents.filter((event) => hasTag(event, "danger_outcome_SAFE_POSSESSION")).length,
    earnedDangerToNeutralCount: earnedEvents.filter((event) => event.outcome === "neutral").length,
    borderlineDangerToOpportunityCount: borderlineEvents.filter((event) => hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")).length,
    borderlineDangerToHalfChanceCount: borderlineEvents.filter((event) => hasTag(event, "danger_outcome_HALF_CHANCE")).length,
    borderlineDangerToForcedDefensiveActionCount: borderlineEvents.filter((event) => hasTag(event, "danger_outcome_FORCED_DEFENSIVE_ACTION")).length,
    borderlineDangerToTerritorialGainCount: borderlineEvents.filter((event) => hasTag(event, "danger_outcome_TERRITORIAL_GAIN")).length,
    borderlineDangerToNeutralCount: borderlineEvents.filter((event) => event.outcome === "neutral").length,
    continuationToOpportunityCount,
    continuationToPossessionCount: continuationEvents.length - continuationToOpportunityCount - continuationToTurnoverCount,
    continuationToRebuildCount: continuationEvents.filter((event) => (event.tacticalContext.reason ?? "").includes("rebuild")).length,
    continuationToTurnoverCount,
    continuationToDefensiveRecoveryCount: continuationEvents.filter((event) => (event.tacticalContext.reason ?? "").includes("defensive")).length,
    goalkeeperSecureToDangerAgainstCount,
    goalkeeperSecureToSafePossessionCount,
    goalkeeperSecureToRebuildCount: goalkeeperSecureEvents.filter((event) => (event.tacticalContext.reason ?? "").includes("rebuild")).length,
    goalkeeperSecureToTurnoverAgainstCount: goalkeeperSecureEvents.filter((event) => {
      const index = timeline.findIndex((item) => item.eventId === event.eventId);
      return nextTeamEvent(timeline, index, event.opponentTeamId)?.eventType === "turnover";
    }).length,
    routeQualityGatePassCount: routeEconomyEvents.filter((event) => hasTag(event, "route_quality_gate_connected")).length,
    routeQualityGateFailCount: routeEconomyEvents.filter((event) => !hasTag(event, "route_quality_gate_connected")).length,
    opportunityQualityGatePassCount: opportunityEvents.length,
    opportunityQualityGateFailCount: routeEconomyEvents.length - opportunityEvents.length,
    lowQualityDangerBlockedFromOpportunityCount: routeEconomyEvents.filter((event) =>
      hasTag(event, "danger_quality_LOW_QUALITY_DANGER") && !hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")
    ).length,
    mediumQualityDangerConvertedToHalfChanceCount: routeEconomyEvents.filter((event) =>
      hasTag(event, "danger_quality_MEDIUM_QUALITY_DANGER") && hasTag(event, "danger_outcome_HALF_CHANCE")
    ).length,
    mediumQualityDangerConvertedToOpportunityCount: mediumQualityOpportunityCount,
    lowQualityDangerConvertedToOpportunityCount: lowQualityOpportunityCount,
    highQualityDangerConvertedToOpportunityCount: routeEconomyEvents.filter((event) =>
      hasTag(event, "danger_quality_HIGH_QUALITY_DANGER") && hasTag(event, "danger_outcome_SCORING_OPPORTUNITY")
    ).length,
    dangerQualityDistribution: distribution(routeEconomyEvents, "danger_quality_", "QUALITY"),
    dangerOutcomeDistribution: distribution(routeEconomyEvents, "danger_outcome_", "OUTCOME"),
    routeEconomyWarningCodes: [...new Set(warnings)],
    recommendation: blocking ? "MONITOR_ROUTE_ECONOMY_PARTIAL" : "KEEP_ROUTE_ECONOMY_RECHECK",
  };
}
