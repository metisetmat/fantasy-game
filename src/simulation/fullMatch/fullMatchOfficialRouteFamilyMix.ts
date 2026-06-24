import type { MatchEvent, MatchInput, TeamSnapshot, TacticalPlan } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { MatchPhase, PressureLevel, type ScoreState } from "../../models/match";
import { scoringRegistryEntry } from "../../systems/scoring/scoringActionRegistry";
import { computeEarnedDangerGate, type EarnedDangerResetSourceType } from "./earnedDangerGate";
import type { FullMatchSegmentState, FullMatchTeamSegmentState } from "./fullMatchSegmentState";
import { teamStateForId } from "./fullMatchSegmentState";

export type OfficialRouteFamily = OfficialScoringFamily | "CONTINUATION";

export type OfficialRouteFamilyUnavailableReasonCode =
  | "TRY_ACCESS_ZONE_MISSING"
  | "TRY_GROUNDING_WINDOW_MISSING"
  | "TRY_SUPPORT_MISSING"
  | "TRY_CONTACT_CONTEST_FAILED"
  | "TRY_PATH_CLOSED"
  | "DROP_DISTANCE_WINDOW_MISSING"
  | "DROP_KICKER_NOT_AVAILABLE"
  | "DROP_PRESSURE_TOO_HIGH"
  | "DROP_BALANCE_NOT_AVAILABLE"
  | "CONVERSION_REQUIRES_TRY"
  | "SHOT_ROUTE_DOMINATES_RANKING"
  | "ROUTE_FAMILY_COMPETITION_NOT_BALANCED"
  | "DANGER_PHASE_NOT_CREATING_NON_SHOT"
  | "NON_SHOT_AFFORDANCE_NOT_PROMOTED_TO_OFFICIAL_CANDIDATE"
  | "DEFENSIVE_STRUCTURE_BLOCKS_ROUTE"
  | "FATIGUE_BLOCKS_ROUTE"
  | "UNKNOWN_SUPPRESSION_REASON";

export type OfficialRouteFamilyOutcome =
  | "SHOT_RETAINED"
  | "TRY_TOUCHDOWN_SCORED"
  | "LOST_FORWARD"
  | "HELD_UP"
  | "CONTACT_STOPPED"
  | "TURNOVER_ON_GROUNDING"
  | "OUT_OF_BOUNDS"
  | "DROP_GOAL_SCORED"
  | "DROP_MISSED"
  | "DROP_BLOCKED"
  | "DROP_INVALID"
  | "CONVERSION_GOAL_SCORED"
  | "CONVERSION_MISSED"
  | "SAFE_CONTINUATION"
  | "POSSESSION_CONTINUES";

export interface OfficialRouteFamilyCandidate {
  readonly candidateId: string;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
  readonly teamId: TeamId;
  readonly actorId: PlayerId;
  readonly family: OfficialRouteFamily;
  readonly targetZone: ZoneId;
  readonly candidateScore: number;
  readonly legality: "LEGAL" | "BLOCKED" | "REQUIRES_PREVIOUS_TRY";
  readonly eligible: boolean;
  readonly selected: boolean;
  readonly resolved: boolean;
  readonly scoring: boolean;
  readonly outcome: OfficialRouteFamilyOutcome;
  readonly unavailableReasonCodes: readonly OfficialRouteFamilyUnavailableReasonCode[];
  readonly suppressionReasonCodes: readonly OfficialRouteFamilyUnavailableReasonCode[];
  readonly calibrationTags: readonly string[];
  readonly reason: string;
}

export interface OfficialRouteFamilyAvailabilityRow {
  readonly family: OfficialRouteFamily;
  readonly candidateCount: number;
  readonly eligibleCandidateCount: number;
  readonly selectedCandidateCount: number;
  readonly resolvedCandidateCount: number;
  readonly scoringCandidateCount: number;
  readonly nonScoringOutcomeCount: number;
  readonly unavailableReasonCodes: readonly OfficialRouteFamilyUnavailableReasonCode[];
  readonly suppressionReasonCodes: readonly OfficialRouteFamilyUnavailableReasonCode[];
  readonly selectedButFailedCount: number;
  readonly resolvedToScoreCount: number;
  readonly resolvedToNonScoreCount: number;
}

export interface TeamOpportunityBalanceModel {
  readonly homePossessionDangerPhases: number;
  readonly awayPossessionDangerPhases: number;
  readonly homeScoringOpportunities: number;
  readonly awayScoringOpportunities: number;
  readonly homeEligibleNonShotRoutes: number;
  readonly awayEligibleNonShotRoutes: number;
  readonly homeSelectedRoutesByFamily: Readonly<Record<OfficialRouteFamily, number>>;
  readonly awaySelectedRoutesByFamily: Readonly<Record<OfficialRouteFamily, number>>;
  readonly homeScoringEventsByFamily: Readonly<Record<OfficialRouteFamily, number>>;
  readonly awayScoringEventsByFamily: Readonly<Record<OfficialRouteFamily, number>>;
  readonly oneSidedOpportunityRisk: boolean;
  readonly oneSidedScoringRisk: boolean;
  readonly suppressionReasonsByTeam: Readonly<Record<TeamId, readonly OfficialRouteFamilyUnavailableReasonCode[]>>;
  readonly recommendation: "KEEP_MONITORING" | "IMPROVE_AWAY_DANGER_ACCESS" | "IMPROVE_HOME_DANGER_ACCESS" | "IMPROVE_NON_SHOT_ACCESS";
}

export interface FullMatchOfficialRouteFamilyMixModel {
  readonly status: "available" | "not_available";
  readonly scope: "FULL_MATCH_ROUTE_FAMILY_MIX_SINGLE_RUN";
  readonly version: "ROUTE_FAMILY_MIX_6F";
  readonly routeFamiliesSupported: readonly OfficialRouteFamily[];
  readonly shotCandidateCount: number;
  readonly tryCandidateCount: number;
  readonly dropCandidateCount: number;
  readonly conversionCandidateCount: number;
  readonly continuationCandidateCount: number;
  readonly eligibleShotCandidateCount: number;
  readonly eligibleTryCandidateCount: number;
  readonly eligibleDropCandidateCount: number;
  readonly eligibleConversionCandidateCount: number;
  readonly selectedRouteFamilies: readonly OfficialRouteFamily[];
  readonly resolvedRouteFamilies: readonly OfficialRouteFamily[];
  readonly scoringRouteFamilies: readonly OfficialRouteFamily[];
  readonly nonScoringRouteFamilies: readonly OfficialRouteFamily[];
  readonly nonShotCandidateShare: number;
  readonly nonShotEligibleShare: number;
  readonly nonShotSelectedShare: number;
  readonly nonShotScoringShare: number;
  readonly tryDropAvailabilityRate: number;
  readonly tryDropSelectionRate: number;
  readonly tryDropScoringRate: number;
  readonly conversionGeneratedOnlyAfterTry: boolean;
  readonly conversionWithoutTryBlocked: boolean;
  readonly penaltyShotInactive: boolean;
  readonly routeFamilyCompetitionActive: boolean;
  readonly routeFamilyCompetitionCanSelectNonShot: boolean;
  readonly routeFamilyCompetitionCanSelectContinuation: boolean;
  readonly shotOnlyMatchRisk: boolean;
  readonly oneSidedScoringRisk: boolean;
  readonly availabilityRows: readonly OfficialRouteFamilyAvailabilityRow[];
  readonly teamOpportunityBalance: TeamOpportunityBalanceModel;
  readonly candidates: readonly OfficialRouteFamilyCandidate[];
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly scoreFromOfficialScoreChangeEvents: boolean;
  readonly globalEconomyClaimCount: 0;
  readonly singleRunOnly: true;
  readonly recommendation:
    | "KEEP_ROUTE_FAMILY_MIX_MONITORING"
    | "TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT"
    | "IMPROVE_TRY_DROP_RESOLUTION"
    | "FIX_OFFICIAL_SCORING_GUARDRAILS";
}

export interface FullMatchOfficialRouteFamilyMixState {
  readonly candidates: readonly OfficialRouteFamilyCandidate[];
  readonly routeEvents: readonly MatchEvent[];
}

export interface FullMatchOfficialRouteFamilyMixSegmentResolution {
  readonly events: readonly MatchEvent[];
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly selectedCandidates: readonly OfficialRouteFamilyCandidate[];
}

const ROUTE_FAMILIES: readonly OfficialRouteFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "CONTINUATION",
];

const ROUTE_MIX_TAGS = [
  "official_route_family_mix_6f",
  "official_route_family_candidate",
  "route_family_mix_applied",
] as const;

function emptyRouteFamilyCounts(): Record<OfficialRouteFamily, number> {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
    CONTINUATION: 0,
  };
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function deterministicNoise(seed: string): number {
  let hash = 0;
  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) % 997;
  }

  return hash % 21;
}

function averageAttribute(team: TeamSnapshot, selector: (player: TeamSnapshot["roster"][number]) => number): number {
  if (team.roster.length === 0) {
    return 55;
  }

  return team.roster.reduce((sum, player) => sum + selector(player), 0) / team.roster.length;
}

function primaryActorForFamily(team: TeamSnapshot, family: OfficialRouteFamily): PlayerId {
  if (family === "DROP_GOAL" && team.primaryDropTakerId !== undefined) {
    return team.primaryDropTakerId;
  }
  if (family === "CONVERSION_GOAL" && team.primaryKickerId !== undefined) {
    return team.primaryKickerId;
  }
  if (family === "SHOT_GOAL" && team.captainId !== undefined) {
    return team.captainId;
  }

  return team.starters[0] ?? team.roster[0]?.playerId ?? team.goalkeeperId;
}

function targetZoneForFamily(plan: TacticalPlan, family: OfficialRouteFamily): ZoneId {
  if (plan.targetZones.length > 0) {
    const target = family === "TRY_TOUCHDOWN"
      ? plan.targetZones[plan.targetZones.length - 1]
      : family === "DROP_GOAL"
        ? plan.targetZones[Math.floor(plan.targetZones.length / 2)]
        : plan.targetZones[0];

    if (target !== undefined) {
      return target;
    }
  }

  if (family === "TRY_TOUCHDOWN") {
    return "Z5-C";
  }
  if (family === "DROP_GOAL") {
    return "Z4-C";
  }

  return "Z3-C";
}

function planBias(plan: TacticalPlan, family: OfficialRouteFamily): number {
  if (family === "TRY_TOUCHDOWN") {
    return plan.scoringBias === "try_first" ? 18 : plan.attackingIntent === "direct_pressure" ? 11 : 0;
  }
  if (family === "DROP_GOAL") {
    return plan.scoringBias === "drop_threat" ? 28 : plan.attackingIntent === "territorial_kicking" ? 18 : 0;
  }
  if (family === "SHOT_GOAL") {
    return plan.scoringBias === "goal_first" ? 13 : plan.riskLevel === "high" ? 6 : 0;
  }
  if (family === "CONTINUATION") {
    return plan.riskLevel === "low" ? 12 : plan.restDefensePriority > 70 ? 8 : 0;
  }

  return 0;
}

function routeScore(input: {
  readonly matchInput: MatchInput;
  readonly segmentState: FullMatchSegmentState;
  readonly team: TeamSnapshot;
  readonly opponent: TeamSnapshot;
  readonly plan: TacticalPlan;
  readonly teamState: FullMatchTeamSegmentState;
  readonly family: OfficialRouteFamily;
  readonly segmentIndex: number;
  readonly scoreBefore: ScoreState;
}): number {
  const technical = averageAttribute(input.team, (player) => player.attributes.footPlayPassingShooting);
  const tactical = averageAttribute(input.team, (player) => player.attributes.intelligence);
  const physical = averageAttribute(input.team, (player) => player.attributes.power);
  const pressureLoad = input.teamState.pressureLoad;
  const fatiguePenalty = Math.max(0, 58 - input.teamState.condition) * 0.3;
  const noise = deterministicNoise(`${input.matchInput.seed}:${input.team.teamId}:${input.segmentIndex}:${input.family}`) - 10;
  const phaseBoost = input.segmentIndex % 2 === 0 ? 4 : -1;
  const teamPoints = input.team.teamId === input.matchInput.homeTeam.teamId ? input.scoreBefore.home : input.scoreBefore.away;
  const opponentPoints = input.team.teamId === input.matchInput.homeTeam.teamId ? input.scoreBefore.away : input.scoreBefore.home;
  const scoreDelta = teamPoints - opponentPoints;
  const trailingResponseBoost = scoreDelta < 0 ? Math.min(14, Math.abs(scoreDelta) * 0.65) : 0;
  const dominantMomentumDampening = scoreDelta > 7 ? Math.min(12, (scoreDelta - 5) * 0.45) : 0;
  const responseWindowBoost = scoreDelta < 0 && input.segmentIndex % 3 !== 0 ? 3 : 0;
  const resetStabilityBoost = scoreDelta < 0 ? 4 : scoreDelta > 7 ? 8 : 0;

  if (input.family === "SHOT_GOAL") {
    return clampRating(48 + technical * 0.2 + tactical * 0.12 + planBias(input.plan, input.family) + phaseBoost + noise - fatiguePenalty + trailingResponseBoost * 0.25 - dominantMomentumDampening * 0.55);
  }
  if (input.family === "TRY_TOUCHDOWN") {
    const support = input.plan.widthUsage * 0.12 + physical * 0.18 + tactical * 0.15;
    const contactPenalty = Math.max(0, input.opponent.teamIdentity === undefined ? 55 : 62) * 0.05;
    return clampRating(42 + support + planBias(input.plan, input.family) + input.teamState.momentum * 0.08 + noise - contactPenalty - fatiguePenalty + trailingResponseBoost * 0.7 + responseWindowBoost - dominantMomentumDampening * 0.5);
  }
  if (input.family === "DROP_GOAL") {
    const kicker = input.team.primaryDropTakerId === undefined ? 0 : 7;
    const pressurePenalty = pressureLoad * 0.08;
    const timingBoost = input.segmentIndex % 3 === 1 ? 8 : 0;
    return clampRating(45 + technical * 0.22 + tactical * 0.12 + kicker + planBias(input.plan, input.family) + timingBoost + noise - pressurePenalty + trailingResponseBoost * 0.45 - dominantMomentumDampening * 0.45);
  }
  if (input.family === "CONTINUATION") {
    return clampRating(44 + tactical * 0.18 + input.plan.restDefensePriority * 0.18 + planBias(input.plan, input.family) - pressureLoad * 0.05 + noise + resetStabilityBoost);
  }
  if (input.family === "CONVERSION_GOAL") {
    const kicker = input.team.primaryKickerId === undefined ? 0 : 6;
    return clampRating(46 + technical * 0.24 + tactical * 0.08 + kicker + noise - pressureLoad * 0.03);
  }

  return 0;
}

function candidateReasons(input: {
  readonly family: OfficialRouteFamily;
  readonly score: number;
  readonly plan: TacticalPlan;
  readonly team: TeamSnapshot;
  readonly segmentIndex: number;
  readonly tryAlreadyScored: boolean;
}): readonly OfficialRouteFamilyUnavailableReasonCode[] {
  if (input.family === "CONVERSION_GOAL") {
    return input.tryAlreadyScored ? [] : ["CONVERSION_REQUIRES_TRY"];
  }

  if (input.family === "TRY_TOUCHDOWN") {
    const reasons: OfficialRouteFamilyUnavailableReasonCode[] = [];
    if (input.plan.targetZones.length === 0) {
      reasons.push("TRY_ACCESS_ZONE_MISSING");
    }
    if (input.score < 50) {
      reasons.push("TRY_GROUNDING_WINDOW_MISSING");
    }
    if (input.plan.widthUsage < 38 && input.plan.attackingIntent !== "direct_pressure") {
      reasons.push("TRY_SUPPORT_MISSING");
    }
    if (input.score < 45) {
      reasons.push("TRY_PATH_CLOSED");
    }
    return reasons;
  }

  if (input.family === "DROP_GOAL") {
    const reasons: OfficialRouteFamilyUnavailableReasonCode[] = [];
    const averageFootSkill = averageAttribute(input.team, (player) => player.attributes.footPlayPassingShooting);
    if (input.plan.targetZones.length === 0) {
      reasons.push("DROP_DISTANCE_WINDOW_MISSING");
    }
    if (input.team.primaryDropTakerId === undefined && averageFootSkill < 58) {
      reasons.push("DROP_KICKER_NOT_AVAILABLE");
    }
    if (input.score < 48) {
      reasons.push("DROP_BALANCE_NOT_AVAILABLE");
    }
    if (input.plan.riskLevel === "high" && input.score < 55) {
      reasons.push("DROP_PRESSURE_TOO_HIGH");
    }
    return reasons;
  }

  return [];
}

function buildCandidate(input: {
  readonly matchInput: MatchInput;
  readonly segmentState: FullMatchSegmentState;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
  readonly team: TeamSnapshot;
  readonly opponent: TeamSnapshot;
  readonly plan: TacticalPlan;
  readonly family: OfficialRouteFamily;
  readonly tryAlreadyScored: boolean;
  readonly scoreBefore: ScoreState;
}): OfficialRouteFamilyCandidate {
  const teamState = teamStateForId(input.segmentState, input.team.teamId);
  const score = routeScore({
    matchInput: input.matchInput,
    segmentState: input.segmentState,
    team: input.team,
    opponent: input.opponent,
    plan: input.plan,
    teamState,
    family: input.family,
    segmentIndex: input.segmentIndex,
    scoreBefore: input.scoreBefore,
  });
  const unavailableReasonCodes = candidateReasons({
    family: input.family,
    score,
    plan: input.plan,
    team: input.team,
    segmentIndex: input.segmentIndex,
    tryAlreadyScored: input.tryAlreadyScored,
  });
  const eligible = unavailableReasonCodes.length === 0 && score >= (input.family === "CONTINUATION" ? 45 : 50);

  return {
    candidateId: `${input.segmentLabel}:${input.team.teamId}:${input.family}`,
    segmentLabel: input.segmentLabel,
    segmentIndex: input.segmentIndex,
    teamId: input.team.teamId,
    actorId: primaryActorForFamily(input.team, input.family),
    family: input.family,
    targetZone: targetZoneForFamily(input.plan, input.family),
    candidateScore: score,
    legality: input.family === "CONVERSION_GOAL" && !input.tryAlreadyScored
      ? "REQUIRES_PREVIOUS_TRY"
      : eligible
        ? "LEGAL"
        : "BLOCKED",
    eligible,
    selected: false,
    resolved: false,
    scoring: false,
    outcome: "POSSESSION_CONTINUES",
    unavailableReasonCodes,
    suppressionReasonCodes: [],
    calibrationTags: [],
    reason: eligible
      ? `${input.family} is available in the official route family mix with score ${score}.`
      : `${input.family} is unavailable or below gate: ${unavailableReasonCodes.join(", ") || "score below threshold"}.`,
  };
}

function selectCandidate(candidates: readonly OfficialRouteFamilyCandidate[]): OfficialRouteFamilyCandidate {
  const eligible = candidates.filter((candidate) => candidate.eligible);
  const pool = eligible.length > 0 ? eligible : candidates;
  const sorted = [...pool].sort((a, b) => {
    if (b.candidateScore !== a.candidateScore) {
      return b.candidateScore - a.candidateScore;
    }

    return routeTiePriority(b.family) - routeTiePriority(a.family);
  });

  return sorted[0] ?? (candidates[0] as OfficialRouteFamilyCandidate);
}

function previousSelectedOpportunities(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly segmentIndex: number;
}): readonly OfficialRouteFamilyCandidate[] {
  return input.state.candidates
    .filter((candidate) =>
      candidate.selected &&
      candidate.family !== "CONTINUATION" &&
      candidate.segmentIndex < input.segmentIndex
    )
    .sort((a, b) => a.segmentIndex - b.segmentIndex);
}

function consecutiveSameTeamOpportunityCount(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly teamId: TeamId;
  readonly segmentIndex: number;
}): number {
  let count = 0;
  for (const candidate of [...previousSelectedOpportunities(input)].reverse()) {
    if (candidate.teamId !== input.teamId) {
      break;
    }
    count += 1;
  }
  return count;
}

function recentSameZoneOpportunityCount(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly selected: OfficialRouteFamilyCandidate;
  readonly segmentIndex: number;
}): number {
  return previousSelectedOpportunities(input)
    .filter((candidate) =>
      candidate.teamId === input.selected.teamId &&
      candidate.targetZone === input.selected.targetZone &&
      input.segmentIndex - candidate.segmentIndex <= 4
    )
    .length;
}

function previousSelectedCandidates(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly segmentIndex: number;
}): readonly OfficialRouteFamilyCandidate[] {
  return input.state.candidates
    .filter((candidate) => candidate.selected && candidate.segmentIndex < input.segmentIndex)
    .sort((a, b) => a.segmentIndex - b.segmentIndex);
}

function previousSelectedScoringCandidate(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly segmentIndex: number;
}): OfficialRouteFamilyCandidate | undefined {
  return [...previousSelectedCandidates(input)]
    .reverse()
    .find((candidate) => candidate.scoring && candidate.family !== "CONTINUATION");
}

function opposingRestartAfterScore(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly scoringCandidate: OfficialRouteFamilyCandidate;
  readonly segmentIndex: number;
}): boolean {
  return input.state.candidates.some((candidate) =>
    candidate.selected &&
    candidate.segmentIndex > input.scoringCandidate.segmentIndex &&
    candidate.segmentIndex < input.segmentIndex &&
    candidate.teamId !== input.scoringCandidate.teamId
  );
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function previousScoringRouteEvent(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly segmentIndex: number;
}): MatchEvent | undefined {
  const currentSegmentTick = input.segmentIndex * 100;
  return [...input.state.routeEvents]
    .filter((event) => event.timestamp.tick < currentSegmentTick && scoreChangePoints(event) > 0)
    .sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick)
    .reverse()[0];
}

function previousResetRouteEvent(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly segmentIndex: number;
}): MatchEvent | undefined {
  const currentSegmentTick = input.segmentIndex * 100;
  return [...input.state.routeEvents]
    .filter((event) =>
      event.timestamp.tick < currentSegmentTick &&
      (
        event.tags.some((tag) =>
          tag === "official_route_family_CONTINUATION" ||
          tag.includes("reset") ||
          tag.includes("restart")
        ) ||
        event.outcome === "neutral"
      )
    )
    .sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick)
    .reverse()[0];
}

function hasGoalkeeperSecureSource(event: MatchEvent): boolean {
  const tags = event.tags.map((tag) => tag.toLowerCase());
  return event.eventType === "goalkeeper_action" ||
    tags.some((tag) =>
      tag.includes("goalkeeper") ||
      tag.includes("keeper") ||
      tag.includes("gk")
    );
}

function earnedDangerResetSourceType(event: MatchEvent | undefined): EarnedDangerResetSourceType {
  if (event === undefined) {
    return "SAFE_POSSESSION";
  }
  const tags = event.tags.map((tag) => tag.toLowerCase());
  if (event.eventType === "goalkeeper_action" || tags.some((tag) => tag.includes("goalkeeper") || tag.includes("keeper") || tag.includes("gk"))) {
    return "GOALKEEPER_SECURE";
  }
  if (tags.some((tag) => tag.includes("post_score") || tag.includes("restart"))) {
    return "POST_SCORE_RESET";
  }
  if (event.eventType === "turnover" || tags.some((tag) => tag.includes("turnover"))) {
    return "TURNOVER";
  }
  if (tags.some((tag) => tag.includes("recovery"))) {
    return "DEFENSIVE_RECOVERY";
  }
  if (tags.some((tag) => tag.includes("out_of_play"))) {
    return "OUT_OF_PLAY";
  }
  if (event.outcome === "neutral") {
    return "NEUTRAL_PHASE";
  }
  return "SAFE_POSSESSION";
}

type RouteEconomyDangerQuality = "HIGH_QUALITY_DANGER" | "MEDIUM_QUALITY_DANGER" | "LOW_QUALITY_DANGER";
type RouteEconomyDangerOutcome =
  | "SCORING_OPPORTUNITY"
  | "EARNED_DANGER"
  | "HALF_CHANCE"
  | "FORCED_DEFENSIVE_ACTION"
  | "TERRITORIAL_GAIN"
  | "MOMENTUM_GAIN"
  | "SAFE_POSSESSION"
  | "NEUTRAL_PHASE";

function lateGameThreatQualityOutcome6V(input: {
  readonly baseOutcome: RouteEconomyDangerOutcome;
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly dangerQuality: RouteEconomyDangerQuality;
  readonly scoreDelta: number;
  readonly segmentIndex: number;
  readonly deterministicBreak: number;
  readonly pressureFatigueLoad: number;
  readonly monitorAutomaticity6W?: boolean;
}): RouteEconomyDangerOutcome {
  if (input.scoreDelta >= 0) return input.baseOutcome;
  if (input.baseOutcome === "SCORING_OPPORTUNITY") return input.baseOutcome;

  const lateBoost = input.segmentIndex >= 6 ? 2 : 0;
  const routeQualityBoost = input.candidate.candidateScore >= 90 ? 2 : input.candidate.candidateScore >= 82 ? 1 : 0;
  const qualityBoost = input.dangerQuality === "HIGH_QUALITY_DANGER" ? 3 : input.dangerQuality === "MEDIUM_QUALITY_DANGER" ? 2 : 0;
  const trailingPressureScore = lateBoost + routeQualityBoost + qualityBoost + Math.max(0, Math.abs(input.scoreDelta) >= 6 ? 1 : 0);
  const selector = (input.deterministicBreak + input.segmentIndex + Math.round(input.pressureFatigueLoad)) % 12;

  if (trailingPressureScore >= 6) {
    if (selector === 0) return "SCORING_OPPORTUNITY";
    if (selector <= 3) return "EARNED_DANGER";
    if (selector <= 6) return "HALF_CHANCE";
    if (selector <= 9) return "FORCED_DEFENSIVE_ACTION";
    return "TERRITORIAL_GAIN";
  }

  if (trailingPressureScore >= 5) {
    if (selector <= 2) return "EARNED_DANGER";
    if (selector <= 5) return "HALF_CHANCE";
    if (selector <= 8) return "FORCED_DEFENSIVE_ACTION";
    return "TERRITORIAL_GAIN";
  }

  if (trailingPressureScore >= 4) {
    if (selector <= 2) return "HALF_CHANCE";
    if (selector <= 6) return "FORCED_DEFENSIVE_ACTION";
    return "TERRITORIAL_GAIN";
  }

  if (trailingPressureScore >= 3) {
    if (selector <= 4) return "FORCED_DEFENSIVE_ACTION";
    return "TERRITORIAL_GAIN";
  }
  if (input.monitorAutomaticity6W === true) return input.baseOutcome;
  if (input.baseOutcome === "SAFE_POSSESSION" || input.baseOutcome === "NEUTRAL_PHASE") return "TERRITORIAL_GAIN";
  return input.baseOutcome;
}

function routeEconomyDangerQuality(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly earnedDangerScore: number;
  readonly scoreDelta: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly deterministicBreak: number;
}): RouteEconomyDangerQuality {
  const qualityScore = Math.round(
    input.earnedDangerScore * 0.52 +
    input.candidate.candidateScore * 0.38 +
    input.deterministicBreak * 0.5 -
    (input.scoreDelta > 0 ? 5 : 0) -
    (input.goalkeeperSecureContext ? 10 : 0) -
    (input.postScoreContext ? 5 : 0),
  );

  if (qualityScore >= 74) {
    return "HIGH_QUALITY_DANGER";
  }

  if (qualityScore >= 64) {
    return "MEDIUM_QUALITY_DANGER";
  }

  return "LOW_QUALITY_DANGER";
}

function earnedDangerOutcomeDistributionQuality6R(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly earnedDangerScore: number;
  readonly scoreDelta: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly deterministicBreak: number;
}): RouteEconomyDangerQuality {
  if (input.goalkeeperSecureContext && input.deterministicBreak <= 2) {
    return "LOW_QUALITY_DANGER";
  }

  if (input.deterministicBreak <= 1 || (input.postScoreContext && input.deterministicBreak <= 3)) {
    return "LOW_QUALITY_DANGER";
  }

  const qualityScore = Math.round(
    input.earnedDangerScore * 0.36 +
    input.candidate.candidateScore * 0.29 +
    input.deterministicBreak * 2.2 -
    (input.scoreDelta > 0 ? 7 : 0) -
    (input.goalkeeperSecureContext ? 14 : 0) -
    (input.postScoreContext ? 8 : 0),
  );

  if (qualityScore >= 82 && input.deterministicBreak >= 6) {
    return "HIGH_QUALITY_DANGER";
  }

  if (qualityScore >= 63 || input.deterministicBreak >= 3) {
    return "MEDIUM_QUALITY_DANGER";
  }

  return "LOW_QUALITY_DANGER";
}

function routeEconomyDangerOutcome(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly gateDecision: string;
  readonly dangerQuality: RouteEconomyDangerQuality;
  readonly scoreDelta: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly deterministicBreak: number;
}): RouteEconomyDangerOutcome {
  const highQuality = input.dangerQuality === "HIGH_QUALITY_DANGER";
  const mediumQuality = input.dangerQuality === "MEDIUM_QUALITY_DANGER";
  const borderline = input.gateDecision === "ALLOW_BORDERLINE_DANGER";
  const protectedContext = input.goalkeeperSecureContext || input.postScoreContext || input.scoreDelta > 0;
  const strongRoute = input.candidate.candidateScore >= 90 && !protectedContext;

  if (highQuality && !borderline && (input.deterministicBreak >= 8 || (strongRoute && input.deterministicBreak >= 2))) {
    return "SCORING_OPPORTUNITY";
  }

  if (highQuality && !borderline && input.deterministicBreak >= 3) {
    return "HALF_CHANCE";
  }

  if (highQuality && borderline && strongRoute && input.deterministicBreak >= 8) {
    return "SCORING_OPPORTUNITY";
  }

  if ((highQuality || mediumQuality) && !protectedContext && input.deterministicBreak >= 6) {
    return "HALF_CHANCE";
  }

  if (mediumQuality) {
    return input.deterministicBreak >= 4 ? "FORCED_DEFENSIVE_ACTION" : "TERRITORIAL_GAIN";
  }

  if (input.deterministicBreak >= 8 && !input.goalkeeperSecureContext) {
    return "MOMENTUM_GAIN";
  }

  return input.goalkeeperSecureContext ? "SAFE_POSSESSION" : "TERRITORIAL_GAIN";
}

function earnedDangerOutcomeDistributionOutcome6R(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly gateDecision: string;
  readonly dangerQuality: RouteEconomyDangerQuality;
  readonly scoreDelta: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly deterministicBreak: number;
}): RouteEconomyDangerOutcome {
  const highQuality = input.dangerQuality === "HIGH_QUALITY_DANGER";
  const mediumQuality = input.dangerQuality === "MEDIUM_QUALITY_DANGER";
  const lowQuality = input.dangerQuality === "LOW_QUALITY_DANGER";
  const borderline = input.gateDecision === "ALLOW_BORDERLINE_DANGER";
  const protectedContext = input.goalkeeperSecureContext || input.postScoreContext || input.scoreDelta > 0;
  const excellentRoute = input.candidate.candidateScore >= 94 && !protectedContext;
  if (highQuality && !borderline && input.deterministicBreak >= 10) {
    return "SCORING_OPPORTUNITY";
  }

  if (highQuality && !borderline) {
    return input.deterministicBreak >= 5 ? "HALF_CHANCE" : "FORCED_DEFENSIVE_ACTION";
  }

  if (highQuality && borderline && excellentRoute && input.deterministicBreak >= 8) {
    return "SCORING_OPPORTUNITY";
  }

  if (mediumQuality && !borderline && !protectedContext && input.deterministicBreak >= 9) {
    return "SCORING_OPPORTUNITY";
  }

  if (mediumQuality) {
    if (input.deterministicBreak >= 5) return "HALF_CHANCE";
    if (input.deterministicBreak >= 3) return "FORCED_DEFENSIVE_ACTION";
    return "TERRITORIAL_GAIN";
  }

  if (lowQuality && input.goalkeeperSecureContext) {
    return "SAFE_POSSESSION";
  }

  if (lowQuality && input.deterministicBreak >= 7) {
    return "MOMENTUM_GAIN";
  }

  return input.deterministicBreak <= 1 ? "NEUTRAL_PHASE" : "TERRITORIAL_GAIN";
}

function earnedDangerOutcomeDistributionOutcome6S(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly gateDecision: string;
  readonly dangerQuality: RouteEconomyDangerQuality;
  readonly scoreDelta: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly deterministicBreak: number;
  readonly consecutiveSameTeamOpportunities: number;
  readonly recentTeamOpportunities: number;
  readonly recentSameFamily: number;
}): RouteEconomyDangerOutcome {
  const baseOutcome = earnedDangerOutcomeDistributionOutcome6R(input);
  const repeatedDangerPressure =
    input.consecutiveSameTeamOpportunities >= 2 ||
    input.recentTeamOpportunities >= 2 ||
    (input.recentSameFamily >= 1 && input.candidate.family !== "CONVERSION_GOAL") ||
    (input.scoreDelta > 0 && input.consecutiveSameTeamOpportunities >= 1);

  if (baseOutcome !== "SCORING_OPPORTUNITY") {
    return baseOutcome;
  }

  if (input.consecutiveSameTeamOpportunities >= 4) {
    return input.deterministicBreak % 2 === 0 ? "FORCED_DEFENSIVE_ACTION" : "HALF_CHANCE";
  }

  if (repeatedDangerPressure && input.deterministicBreak <= 8) {
    if (input.deterministicBreak <= 4) return "FORCED_DEFENSIVE_ACTION";
    return "HALF_CHANCE";
  }

  if (input.dangerQuality === "HIGH_QUALITY_DANGER" && input.deterministicBreak <= 2) {
    return "HALF_CHANCE";
  }

  return baseOutcome;
}

function routeEconomyTagsForOutcome(input: {
  readonly gateDecision: string;
  readonly dangerQuality: RouteEconomyDangerQuality;
  readonly dangerOutcome: RouteEconomyDangerOutcome;
  readonly includeEarnedDangerOutcomeDistribution6R?: boolean;
  readonly includeDominanceChainCoverage6S?: boolean;
  readonly includeCloseGameDistribution6T?: boolean;
  readonly includeTrailingTeamResponse6U?: boolean;
  readonly includeLateGameThreatQuality6V?: boolean;
  readonly includeLateGameThreatMonitoring6W?: boolean;
  readonly repeatedDangerDampened?: boolean;
  readonly trailingTeamResponseWindow?: boolean;
  readonly leadingTeamRunawayWindow?: boolean;
  readonly lateGamePressureWindow?: boolean;
}): readonly string[] {
  const allowedTag = input.gateDecision === "ALLOW_BORDERLINE_DANGER"
    ? "borderline_danger_allowed"
    : "earned_danger_confirmed";
  return [
    "route_economy_recheck_6q",
    ...(input.includeEarnedDangerOutcomeDistribution6R === true
      ? ["earned_danger_outcome_distribution_6r", "danger_quality_classifier_6r", "earned_danger_outcome_resolver_6r"]
      : []),
    ...(input.includeDominanceChainCoverage6S === true
      ? [
          "dominance_chain_calibration_coverage_6s",
          "calibration_coverage_6s_applied",
          "earned_danger_outcome_distribution_6s",
        ]
      : []),
    ...(input.includeCloseGameDistribution6T === true
      ? [
          "close_game_distribution_6t",
          "calibration_coverage_6t_applied",
          "close_game_distribution_measured_6t",
          "no_rubber_banding_6t",
        ]
      : []),
    "route_quality_gate_connected",
    "opportunity_quality_gate_connected",
    `danger_quality_${input.dangerQuality}`,
    `danger_outcome_${input.dangerOutcome}`,
    "earned_danger_gate_6n",
    "earned_danger_gate_connected",
    allowedTag,
    ...(input.dangerOutcome === "SCORING_OPPORTUNITY"
      ? ["route_economy_scoring_opportunity_preserved"]
      : ["danger_to_opportunity_decoupled", "official_route_family_non_scoring_outcome"]),
    ...(input.dangerOutcome === "HALF_CHANCE" ? ["half_chance_layer_added"] : []),
    ...(input.dangerOutcome === "FORCED_DEFENSIVE_ACTION" ? ["forced_defensive_action_layer_added"] : []),
    ...(input.dangerOutcome === "TERRITORIAL_GAIN" ? ["territorial_gain_layer_added"] : []),
    ...(input.dangerOutcome === "MOMENTUM_GAIN" ? ["momentum_gain_layer_added"] : []),
    ...(input.dangerOutcome === "SAFE_POSSESSION" ? ["safe_possession_layer_added"] : []),
    ...(input.dangerOutcome === "NEUTRAL_PHASE" ? ["neutral_phase_layer_added"] : []),
    ...(input.repeatedDangerDampened === true
      ? [
          "repeat_opportunity_dampener_6s",
          "chain_break_event_6s",
          "defensive_recovery_after_repeated_danger_6s",
          "neutral_reset_after_repeated_danger_6s",
        ]
      : []),
    ...(input.includeCloseGameDistribution6T === true && input.repeatedDangerDampened === true
      ? [
          "leading_team_runaway_dampener_6t",
          "leading_team_repeat_opportunity_dampened_6t",
          "close_game_chain_break_event_6t",
        ]
      : []),
    ...(input.includeCloseGameDistribution6T === true && input.trailingTeamResponseWindow === true
      ? [
          "trailing_team_response_balancer_6t",
          "trailing_team_response_opportunity_6t",
        ]
      : []),
    ...(input.includeTrailingTeamResponse6U === true && input.trailingTeamResponseWindow === true
      ? [
          "trailing_team_response_6u",
          "trailing_team_response_measured_6u",
          "trailing_team_tactical_response_6u",
          input.dangerOutcome === "SCORING_OPPORTUNITY"
            ? "trailing_team_earned_danger_6u"
            : input.dangerOutcome === "HALF_CHANCE"
              ? "trailing_team_half_chance_6u"
              : input.dangerOutcome === "FORCED_DEFENSIVE_ACTION"
                ? "trailing_team_forced_defensive_action_6u"
                : input.dangerOutcome === "TERRITORIAL_GAIN"
                  ? "trailing_team_territorial_gain_6u"
                  : "trailing_team_pressure_relief_6u",
          "trailing_team_route_quality_signal_6u",
          "trailing_team_risk_increase_6u",
        ]
      : []),
    ...(input.includeTrailingTeamResponse6U === true && input.lateGamePressureWindow === true
      ? [
          "late_game_pressure_6u",
          "trailing_team_late_game_pressure_6u",
          "late_game_pressure_measured_6u",
        ]
      : []),
    ...(input.includeLateGameThreatQuality6V === true && input.trailingTeamResponseWindow === true
      ? [
          "late_game_threat_quality_6v",
          "trailing_threat_quality_measured_6v",
          input.dangerOutcome === "SCORING_OPPORTUNITY"
            ? "trailing_threat_scoring_opportunity_6v"
            : input.dangerOutcome === "EARNED_DANGER"
              ? "trailing_threat_earned_danger_6v"
              : input.dangerOutcome === "HALF_CHANCE"
                ? "trailing_threat_half_chance_6v"
                : input.dangerOutcome === "FORCED_DEFENSIVE_ACTION"
                  ? "trailing_threat_forced_defensive_action_6v"
                  : input.dangerOutcome === "TERRITORIAL_GAIN"
                    ? "trailing_threat_territorial_gain_6v"
                    : "trailing_threat_safe_possession_6v",
          input.dangerOutcome !== "SAFE_POSSESSION" && input.dangerOutcome !== "NEUTRAL_PHASE"
            ? "trailing_safe_possession_to_threat_6v"
            : "trailing_safe_possession_still_safe_6v",
          input.dangerOutcome === "SCORING_OPPORTUNITY"
            ? "natural_trailing_conversion_candidate_6v"
            : "natural_trailing_threat_without_score_6v",
          "trailing_route_quality_to_threat_6v",
          "trailing_tactical_edge_to_threat_6v",
        ]
      : []),
    ...(input.includeLateGameThreatQuality6V === true && input.lateGamePressureWindow === true
      ? ["late_game_threat_quality_measured_6v", "trailing_late_game_threat_6v"]
      : []),
    ...(input.includeLateGameThreatMonitoring6W === true && input.trailingTeamResponseWindow === true
      ? [
          "late_game_threat_monitoring_6w",
          "late_game_threat_automaticity_measured_6w",
          input.dangerOutcome === "SCORING_OPPORTUNITY" ||
          input.dangerOutcome === "EARNED_DANGER" ||
          input.dangerOutcome === "HALF_CHANCE" ||
          input.dangerOutcome === "FORCED_DEFENSIVE_ACTION" ||
          input.dangerOutcome === "TERRITORIAL_GAIN"
            ? "late_game_threat_from_real_signal_6w"
            : "late_game_threat_denied_6w",
          input.dangerOutcome === "SAFE_POSSESSION" || input.dangerOutcome === "NEUTRAL_PHASE"
            ? "late_game_threat_downgraded_6w"
            : "late_game_threat_supported_6w",
        ]
      : []),
    ...(input.includeCloseGameDistribution6T === true && input.leadingTeamRunawayWindow === true
      ? ["leading_team_runaway_window_6t"]
      : []),
  ];
}

function densitySelectedCandidate(input: {
  readonly candidates: readonly OfficialRouteFamilyCandidate[];
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly teamId: TeamId;
  readonly segmentIndex: number;
  readonly teamState: FullMatchTeamSegmentState;
  readonly seed: string;
  readonly events: readonly MatchEvent[];
  readonly scoreBefore: ScoreState;
  readonly homeTeamId: TeamId;
}): OfficialRouteFamilyCandidate {
  const selected = selectCandidate(input.candidates);
  const continuation = input.candidates.find((candidate) => candidate.family === "CONTINUATION" && candidate.eligible);
  const teamPoints = input.teamId === input.homeTeamId ? input.scoreBefore.home : input.scoreBefore.away;
  const opponentPoints = input.teamId === input.homeTeamId ? input.scoreBefore.away : input.scoreBefore.home;
  const scoreDelta = teamPoints - opponentPoints;
  const lateGameThreatMonitoring6WEnabled = input.seed.includes("late-game-threat-quality-monitoring-6w");
  const lateGameThreatQuality6VEnabled = input.seed.includes("late-game-threat-quality-trailing-conversion-6v") || lateGameThreatMonitoring6WEnabled;
  const trailingTeamResponse6UEnabled = input.seed.includes("trailing-team-response-late-pressure-6u") || lateGameThreatQuality6VEnabled;
  const closeGameDistribution6TEnabled = input.seed.includes("close-game-distribution-calibration-6t") || trailingTeamResponse6UEnabled;
  const bestScoringCandidate = selectCandidate(input.candidates.filter((candidate) => candidate.family !== "CONTINUATION"));
  const lastScoringCandidate = previousSelectedScoringCandidate({
    state: input.state,
    segmentIndex: input.segmentIndex,
  });
  const lastScoringRouteEvent = previousScoringRouteEvent({
    state: input.state,
    segmentIndex: input.segmentIndex,
  });
  const lastResetRouteEvent = previousResetRouteEvent({
    state: input.state,
    segmentIndex: input.segmentIndex,
  });

  if (
    (trailingTeamResponse6UEnabled ? scoreDelta < 0 : scoreDelta < -5) &&
    selected.family === "CONTINUATION" &&
    bestScoringCandidate.eligible &&
    bestScoringCandidate.candidateScore + (trailingTeamResponse6UEnabled ? 14 : 9) >= selected.candidateScore
  ) {
    return {
      ...bestScoringCandidate,
      candidateScore: Math.max(bestScoringCandidate.candidateScore, selected.candidateScore + 1),
      calibrationTags: [
        ...bestScoringCandidate.calibrationTags,
        ...(trailingTeamResponse6UEnabled
          ? [
              "trailing_team_response_6u",
              "trailing_team_response_measured_6u",
              "trailing_team_tactical_response_6u",
              "trailing_team_earned_danger_6u",
              "trailing_team_route_quality_signal_6u",
              "trailing_team_risk_increase_6u",
              ...(input.segmentIndex >= 6
                ? [
                    "late_game_pressure_6u",
                    "trailing_team_late_game_pressure_6u",
                    "late_game_pressure_measured_6u",
                  ]
                : []),
            ]
          : []),
        ...(lateGameThreatQuality6VEnabled
          ? [
              "late_game_threat_quality_6v",
              "trailing_threat_quality_measured_6v",
              "trailing_threat_scoring_opportunity_6v",
              "natural_trailing_conversion_candidate_6v",
              "trailing_route_quality_to_threat_6v",
              ...(input.segmentIndex >= 6 ? ["late_game_threat_quality_measured_6v", "trailing_late_game_threat_6v"] : []),
              ...(lateGameThreatMonitoring6WEnabled
                ? [
                    "late_game_threat_monitoring_6w",
                    "late_game_threat_automaticity_measured_6w",
                    "late_game_threat_from_real_signal_6w",
                    "late_game_threat_supported_6w",
                    "natural_trailing_conversion_path_6w",
                  ]
                : []),
            ]
          : []),
        ...(closeGameDistribution6TEnabled
          ? [
              "close_game_distribution_6t",
              "calibration_coverage_6t_applied",
              "trailing_team_response_balancer_6t",
              "trailing_team_response_opportunity_6t",
              "no_rubber_banding_6t",
            ]
          : []),
      ],
      reason: closeGameDistribution6TEnabled
        ? `${trailingTeamResponse6UEnabled ? "Trailing team response calibration 6U" : "Close game distribution calibration 6T"} opens a trailing-team response window: legal route access is preferred over another safe reset only when route quality is competitive, without forcing a score or comeback.`
        : "Team opportunity balance calibration opens a trailing-team response window: legal scoring route access is preferred over another safe reset without forcing a score.",
    };
  }

  const postScoreSameTeamReattackWindow =
    (
      lastScoringCandidate !== undefined &&
      lastScoringCandidate.teamId === input.teamId &&
      input.segmentIndex - lastScoringCandidate.segmentIndex <= 2 &&
      !opposingRestartAfterScore({
        state: input.state,
        scoringCandidate: lastScoringCandidate,
        segmentIndex: input.segmentIndex,
      })
    ) ||
    (
      lastScoringCandidate === undefined &&
      lastScoringRouteEvent?.teamId === input.teamId &&
      input.segmentIndex * 100 - lastScoringRouteEvent.timestamp.tick <= 250
    ) ||
    (
      lastScoringCandidate === undefined &&
      lastScoringRouteEvent === undefined &&
      teamPoints > opponentPoints &&
      input.segmentIndex > 0
    );
  const postScoreConcedingRestartWindow =
    (
      lastScoringCandidate !== undefined &&
      lastScoringCandidate.teamId !== input.teamId &&
      input.segmentIndex - lastScoringCandidate.segmentIndex <= 2
    ) ||
    (
      lastScoringRouteEvent !== undefined &&
      lastScoringRouteEvent.teamId !== input.teamId &&
      input.segmentIndex * 100 - lastScoringRouteEvent.timestamp.tick <= 250
    );
  const dominanceChainCoverage6SEnabled = input.seed.includes("dominance-chain-calibration-coverage-fix-6s") || closeGameDistribution6TEnabled;
  const earnedDangerOutcomeDistribution6REnabled = input.seed.includes("earned-danger-outcome-distribution-6r") || dominanceChainCoverage6SEnabled;
  const routeEconomyRecheck6QEnabled = input.seed.includes("route-economy-recheck-6q") || earnedDangerOutcomeDistribution6REnabled;
  const gateSelectivityVolume6PEnabled = input.seed.includes("gate-selectivity-volume-6p") || routeEconomyRecheck6QEnabled;
  const earnedDangerGateTuning6OEnabled = input.seed.includes("earned-danger-gate-tuning-6o") || gateSelectivityVolume6PEnabled;

  if (continuation === undefined) {
    return selected;
  }

  if (selected.family === "CONTINUATION") {
    return postScoreSameTeamReattackWindow
      ? {
          ...selected,
          calibrationTags: [...selected.calibrationTags, "post_score_reset_protected"],
          reason: "Post-score reset calibration protects restart: the scoring team must pass through a neutral reset before another dangerous opportunity, without forcing opponent scores.",
        }
      : postScoreConcedingRestartWindow
        ? {
            ...selected,
            calibrationTags: [...selected.calibrationTags, "post_score_conceding_restart_protected"],
            reason: "Post-score conceding restart calibration gives the conceding team a safe restart possession after the score: the restart breaks momentum without forcing a reply score.",
          }
        : selected;
  }

  if (postScoreSameTeamReattackWindow && !earnedDangerGateTuning6OEnabled) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
      calibrationTags: [...continuation.calibrationTags, "post_score_reset_protected"],
      reason: "Post-score reset calibration protects restart: the scoring team must pass through a neutral reset before another dangerous opportunity, without forcing opponent scores.",
    };
  }

  const previousTeamSelections = input.state.candidates.filter((candidate) =>
    candidate.teamId === input.teamId &&
    candidate.selected &&
    candidate.segmentIndex < input.segmentIndex
  );
  const lastTeamSelection = previousTeamSelections[previousTeamSelections.length - 1];
  const recentTeamOpportunities = previousTeamSelections
    .filter((candidate) => candidate.family !== "CONTINUATION" && input.segmentIndex - candidate.segmentIndex <= 2)
    .length;
  const recentSameFamily = previousTeamSelections
    .filter((candidate) => candidate.family === selected.family && input.segmentIndex - candidate.segmentIndex <= 3)
    .length;
  const pressureFatigueLoad = input.teamState.pressureLoad + Math.max(0, 68 - input.teamState.condition);
  const deterministicBreak = deterministicNoise(`${input.seed}:${input.teamId}:${input.segmentIndex}:density-break`);
  const possessionResetWindow = lastTeamSelection?.scoring === true && input.segmentIndex - lastTeamSelection.segmentIndex <= 1;
  const goalkeeperOrDefensiveResetWindow =
    lastTeamSelection !== undefined &&
    !lastTeamSelection.scoring &&
    lastTeamSelection.family !== "CONTINUATION" &&
    input.segmentIndex - lastTeamSelection.segmentIndex <= 1;
  const goalkeeperSecureResetWindow = goalkeeperOrDefensiveResetWindow &&
    lastResetRouteEvent !== undefined &&
    hasGoalkeeperSecureSource(lastResetRouteEvent);
  const sameTeamChainTooLong = recentTeamOpportunities >= 2;
  const sameFamilyRepeatTooHigh = recentSameFamily >= 1 && selected.family !== "CONVERSION_GOAL";
  const sameZoneRepeatTooHigh = recentSameZoneOpportunityCount({
    state: input.state,
    selected,
    segmentIndex: input.segmentIndex,
  }) >= 2 && selected.family !== "CONVERSION_GOAL";
  const consecutiveSameTeamOpportunities = consecutiveSameTeamOpportunityCount({
    state: input.state,
    teamId: input.teamId,
    segmentIndex: input.segmentIndex,
  });
  const pressureForcesNeutralPhase = pressureFatigueLoad + deterministicBreak >= 92;
  const plannedNeutralBeat = (input.segmentIndex + deterministicNoise(`${input.seed}:${input.teamId}:neutral-offset`)) % 4 === 0;
  const dominantTeamNeedsReset = scoreDelta > 8 &&
    deterministicNoise(`${input.seed}:${input.teamId}:${input.segmentIndex}:dominance-dampening`) >= 9;
  const dominanceChainDecay =
    consecutiveSameTeamOpportunities >= 2 ||
    (consecutiveSameTeamOpportunities >= 1 && scoreDelta > 0) ||
    (recentTeamOpportunities >= 1 && pressureFatigueLoad + deterministicBreak >= 78);
  const routeRepeatDecay = sameFamilyRepeatTooHigh || sameZoneRepeatTooHigh;
  const recentResetToDangerWindow = lastResetRouteEvent !== undefined &&
    input.segmentIndex * 100 - lastResetRouteEvent.timestamp.tick <= 160;
  const resetBreakBlowoutEconomyEnabled = input.seed.includes("reset-break-blowout-economy-6m");
  const earnedDangerAfterReset = selected.candidateScore >= 88 ||
    scoreDelta <= 0 ||
    pressureFatigueLoad + deterministicBreak >= 96 ||
    selected.family === "CONVERSION_GOAL";
  const automaticDangerAfterReset = recentResetToDangerWindow &&
    resetBreakBlowoutEconomyEnabled &&
    scoreDelta > 0 &&
    !earnedDangerAfterReset;
  const earnedDangerGateEnabled = input.seed.includes("earned-danger-gate-6n") || earnedDangerGateTuning6OEnabled;
  const earnedDangerGateWindow = recentResetToDangerWindow ||
    (
      earnedDangerGateTuning6OEnabled &&
      (
        postScoreSameTeamReattackWindow ||
        postScoreConcedingRestartWindow ||
        goalkeeperOrDefensiveResetWindow ||
        possessionResetWindow ||
        (input.segmentIndex > 0 && selected.family !== "CONVERSION_GOAL")
      )
    );
  const earnedDangerGateResult = earnedDangerGateEnabled && earnedDangerGateWindow
    ? computeEarnedDangerGate({
        candidate: selected,
        teamState: input.teamState,
        resetSourceType: earnedDangerResetSourceType(lastResetRouteEvent),
        scoreDelta,
        pressureFatigueLoad,
        deterministicBreak,
        recentResetToDangerWindow: earnedDangerGateWindow,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
        calibrationVersion: gateSelectivityVolume6PEnabled
          ? "GATE_SELECTIVITY_VOLUME_6P"
          : earnedDangerGateTuning6OEnabled
            ? "EARNED_DANGER_GATE_TUNING_6O"
            : "EARNED_DANGER_GATE_6N",
      })
    : undefined;
  const earnedDangerGateLabel = gateSelectivityVolume6PEnabled
    ? "Earned danger gate calibration 6N selectivity 6P"
    : earnedDangerGateTuning6OEnabled
    ? "Earned danger gate calibration 6N tuning 6O"
    : "Earned danger gate calibration 6N";

  if (
    earnedDangerGateResult !== undefined &&
    !["ALLOW_DANGER", "ALLOW_BORDERLINE_DANGER"].includes(earnedDangerGateResult.gateDecision)
  ) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
      reason: `${earnedDangerGateLabel} downgrades reset-to-danger from ${selected.family} to ${earnedDangerGateResult.gateDecision}: score ${earnedDangerGateResult.earnedDangerScore}, classification ${earnedDangerGateResult.earnedDangerClassification}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
    };
  }

  if (
    routeEconomyRecheck6QEnabled &&
    earnedDangerGateResult !== undefined &&
    (earnedDangerGateResult.gateDecision === "ALLOW_DANGER" || earnedDangerGateResult.gateDecision === "ALLOW_BORDERLINE_DANGER")
  ) {
    const dangerQuality = earnedDangerOutcomeDistribution6REnabled
      ? earnedDangerOutcomeDistributionQuality6R({
        candidate: selected,
        earnedDangerScore: earnedDangerGateResult.earnedDangerScore,
        scoreDelta,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
        deterministicBreak,
      })
      : routeEconomyDangerQuality({
        candidate: selected,
        earnedDangerScore: earnedDangerGateResult.earnedDangerScore,
        scoreDelta,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
        deterministicBreak,
      });
    const baseDangerOutcome = dominanceChainCoverage6SEnabled
      ? earnedDangerOutcomeDistributionOutcome6S({
        candidate: selected,
        gateDecision: earnedDangerGateResult.gateDecision,
        dangerQuality,
        scoreDelta,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
        deterministicBreak,
        consecutiveSameTeamOpportunities,
        recentTeamOpportunities,
        recentSameFamily,
      })
      : earnedDangerOutcomeDistribution6REnabled
        ? earnedDangerOutcomeDistributionOutcome6R({
        candidate: selected,
        gateDecision: earnedDangerGateResult.gateDecision,
        dangerQuality,
        scoreDelta,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
        deterministicBreak,
        })
        : routeEconomyDangerOutcome({
          candidate: selected,
          gateDecision: earnedDangerGateResult.gateDecision,
          dangerQuality,
          scoreDelta,
          goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
          postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
          deterministicBreak,
        });
    const dangerOutcome = lateGameThreatQuality6VEnabled
      ? lateGameThreatQualityOutcome6V({
          baseOutcome: baseDangerOutcome,
          candidate: selected,
          dangerQuality,
          scoreDelta,
          segmentIndex: input.segmentIndex,
          deterministicBreak,
          pressureFatigueLoad,
          monitorAutomaticity6W: lateGameThreatMonitoring6WEnabled,
        })
      : baseDangerOutcome;
    const repeatedDangerDampened = dominanceChainCoverage6SEnabled &&
      dangerOutcome !== "SCORING_OPPORTUNITY" &&
      (
        consecutiveSameTeamOpportunities >= 2 ||
        recentTeamOpportunities >= 2 ||
        (recentSameFamily >= 1 && selected.family !== "CONVERSION_GOAL") ||
        (scoreDelta > 0 && consecutiveSameTeamOpportunities >= 1)
      );
    const routeEconomyTags = routeEconomyTagsForOutcome({
      gateDecision: earnedDangerGateResult.gateDecision,
      dangerQuality,
      dangerOutcome,
      includeEarnedDangerOutcomeDistribution6R: earnedDangerOutcomeDistribution6REnabled,
      includeDominanceChainCoverage6S: dominanceChainCoverage6SEnabled,
      includeCloseGameDistribution6T: closeGameDistribution6TEnabled,
      includeTrailingTeamResponse6U: trailingTeamResponse6UEnabled,
      includeLateGameThreatQuality6V: lateGameThreatQuality6VEnabled,
      includeLateGameThreatMonitoring6W: lateGameThreatMonitoring6WEnabled,
      repeatedDangerDampened,
      trailingTeamResponseWindow: scoreDelta < 0,
      leadingTeamRunawayWindow: scoreDelta > 7,
      lateGamePressureWindow: scoreDelta < 0 && input.segmentIndex >= 6,
    });
    const gateText = `${earnedDangerGateLabel} ${earnedDangerGateResult.gateDecision === "ALLOW_BORDERLINE_DANGER" ? "allows borderline danger" : "confirms earned danger"}: score ${earnedDangerGateResult.earnedDangerScore}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`;

    if (dangerOutcome !== "SCORING_OPPORTUNITY") {
      return {
        ...continuation,
        candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
        calibrationTags: [...continuation.calibrationTags, ...routeEconomyTags],
        reason: dominanceChainCoverage6SEnabled
        ? `${trailingTeamResponse6UEnabled && scoreDelta < 0 ? "Trailing team response calibration 6U" : closeGameDistribution6TEnabled ? "Close game distribution calibration 6T" : "Dominance chain calibration coverage 6S"} converts repeated ${selected.family} danger into ${dangerOutcome}: quality ${dangerQuality}, preserving possession economy before any score_change. ${gateText}`
          : `Route economy recheck 6Q converts ${selected.family} danger into ${dangerOutcome}: quality ${dangerQuality}, preserving possession economy before any score_change. ${gateText}`,
      };
    }

    return {
      ...selected,
      calibrationTags: [...selected.calibrationTags, ...routeEconomyTags],
      reason: `${selected.reason} ${trailingTeamResponse6UEnabled && scoreDelta < 0 ? "Trailing team response calibration 6U" : closeGameDistribution6TEnabled ? "Close game distribution calibration 6T" : dominanceChainCoverage6SEnabled ? "Dominance chain calibration coverage 6S" : "Route economy recheck 6Q"} preserves a scoring opportunity: quality ${dangerQuality}. ${gateText}`,
    };
  }

  if (earnedDangerGateResult?.gateDecision === "ALLOW_BORDERLINE_DANGER") {
    return {
      ...selected,
      reason: `${selected.reason} ${earnedDangerGateLabel} allows borderline danger: score ${earnedDangerGateResult.earnedDangerScore}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
    };
  }

  if (earnedDangerGateResult?.gateDecision === "ALLOW_DANGER") {
    return {
      ...selected,
      reason: `${selected.reason} ${earnedDangerGateLabel} confirms earned danger: score ${earnedDangerGateResult.earnedDangerScore}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
    };
  }

  if (automaticDangerAfterReset) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
      reason: "Reset break blowout economy calibration selects a safe possession beat: the leading team cannot turn a recent reset into immediate danger without enough support, spacing, fatigue edge, or tactical justification.",
    };
  }

  if (
    possessionResetWindow ||
    goalkeeperOrDefensiveResetWindow ||
    sameTeamChainTooLong ||
    routeRepeatDecay ||
    pressureForcesNeutralPhase ||
    plannedNeutralBeat ||
    dominantTeamNeedsReset ||
    dominanceChainDecay
  ) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
      reason: goalkeeperSecureResetWindow
        ? "Goalkeeper secure reset calibration converts the secured ball into a possession reset: the goalkeeper team restarts safely and the previous danger chain is broken."
        : goalkeeperOrDefensiveResetWindow
          ? "Defensive secure reset calibration converts the stopped route into a possession reset: the defensive team restarts safely and the previous danger chain is broken."
        : dominanceChainDecay || dominantTeamNeedsReset
        ? "Dominance chain calibration selects a continuation/reset beat: repeated same-team danger now creates fatigue, defensive adaptation, and momentum decay without forcing opponent scores."
        : routeRepeatDecay
          ? "Dominance chain calibration dampens repeated route family or zone access before another scoring opportunity without changing score values."
          : "Segment density calibration selects continuation/reset before another scoring opportunity: recent danger, pressure, fatigue, or route repetition interrupts the chain.",
      calibrationTags: [
        ...continuation.calibrationTags,
        ...(goalkeeperSecureResetWindow ? ["goalkeeper_secure_reset_break_6l"] : []),
        ...(dominanceChainDecay || dominantTeamNeedsReset || routeRepeatDecay ? ["dominance_chain_calibration_6j", "dominance_decay_applied"] : []),
      ],
    };
  }

  return selected;
}

function routeTiePriority(family: OfficialRouteFamily): number {
  switch (family) {
    case "TRY_TOUCHDOWN":
      return 5;
    case "DROP_GOAL":
      return 4;
    case "SHOT_GOAL":
      return 3;
    case "CONTINUATION":
      return 2;
    case "CONVERSION_GOAL":
      return 1;
    case "PENALTY_SHOT":
    case "UNKNOWN":
      return 0;
  }
}

function routeEventTimelineOffset(family: OfficialRouteFamily): number {
  switch (family) {
    case "TRY_TOUCHDOWN":
      return 5;
    case "CONVERSION_GOAL":
      return 6;
    default:
      return routeTiePriority(family);
  }
}

function routeFamilyCoachLabel(family: OfficialRouteFamily): string {
  switch (family) {
    case "TRY_TOUCHDOWN":
      return "essai";
    case "CONVERSION_GOAL":
      return "conversion";
    case "DROP_GOAL":
      return "drop";
    case "SHOT_GOAL":
      return "tir au but";
    case "CONTINUATION":
      return "continuite";
    default:
      return "route de score";
  }
}

function calibrationReason(candidate: OfficialRouteFamilyCandidate): string {
  return candidate.calibrationTags.length > 0 ||
    candidate.reason.includes("Earned danger gate calibration") ||
    candidate.reason.includes("Post-score reset calibration") ||
    candidate.reason.includes("Post-score conceding restart calibration") ||
    candidate.reason.includes("Dominance chain calibration") ||
    candidate.reason.includes("Goalkeeper secure reset calibration")
    ? candidate.reason
    : "";
}

function resolvedReason(candidate: OfficialRouteFamilyCandidate, reason: string): string {
  const contextReason = calibrationReason(candidate);
  return contextReason.length > 0 ? `${reason} ${contextReason}` : reason;
}

function resolveSelectedCandidate(candidate: OfficialRouteFamilyCandidate, seed: string): OfficialRouteFamilyCandidate {
  const noise = deterministicNoise(`${seed}:${candidate.candidateId}:resolve`);
  const successScore = candidate.candidateScore + noise - 10;

  if (!candidate.eligible) {
    return {
      ...candidate,
      selected: true,
      resolved: true,
      scoring: false,
      outcome: "POSSESSION_CONTINUES",
      suppressionReasonCodes: candidate.unavailableReasonCodes.length > 0
        ? candidate.unavailableReasonCodes
        : ["ROUTE_FAMILY_COMPETITION_NOT_BALANCED"],
      reason: `${candidate.family} was selected as a fallback but did not clear official availability gates.`,
    };
  }

  if (candidate.family === "TRY_TOUCHDOWN") {
    const scoring = successScore >= 74;
    return {
      ...candidate,
      selected: true,
      resolved: true,
      scoring,
      outcome: scoring
        ? "TRY_TOUCHDOWN_SCORED"
        : successScore >= 66
          ? "HELD_UP"
          : successScore >= 58
            ? "LOST_FORWARD"
            : "CONTACT_STOPPED",
      suppressionReasonCodes: scoring ? [] : [successScore >= 66 ? "TRY_CONTACT_CONTEST_FAILED" : "TRY_GROUNDING_WINDOW_MISSING"],
      reason: resolvedReason(candidate, scoring
        ? "Legal try access, support, and grounding control clear the official try gate."
        : "Try route is selected and attempted, but grounding pressure, ball control, or contact resistance stops the score."),
    };
  }

  if (candidate.family === "DROP_GOAL") {
    const scoring = successScore >= 76;
    return {
      ...candidate,
      selected: true,
      resolved: true,
      scoring,
      outcome: scoring
        ? "DROP_GOAL_SCORED"
        : successScore >= 66
          ? "DROP_MISSED"
          : successScore >= 56
            ? "DROP_BLOCKED"
            : "DROP_INVALID",
      suppressionReasonCodes: scoring ? [] : [successScore >= 66 ? "DROP_BALANCE_NOT_AVAILABLE" : "DROP_PRESSURE_TOO_HIGH"],
      reason: resolvedReason(candidate, scoring
        ? "Open-play drop timing, kicker profile, and balance clear the official drop gate."
        : "Drop route is selected and attempted, but timing, balance, or block pressure prevents scoring."),
    };
  }

  if (candidate.family === "CONTINUATION") {
    const calibratedReason = candidate.reason.includes("calibration")
      ? candidate.reason
      : "Continuation is selected to preserve the possession rather than force a low-upside score attempt.";
    return {
      ...candidate,
      selected: true,
      resolved: true,
      scoring: false,
      outcome: "SAFE_CONTINUATION",
      reason: calibratedReason,
    };
  }

  return {
    ...candidate,
    selected: true,
    resolved: true,
    scoring: candidate.family === "SHOT_GOAL",
    outcome: "SHOT_RETAINED",
    reason: resolvedReason(candidate, "Shot route remains the selected official scoring family for this danger phase."),
  };
}

function scoreAfter(scoreBefore: ScoreState, teamId: TeamId, homeTeamId: TeamId, points: number): string {
  const home = scoreBefore.home + (teamId === homeTeamId ? points : 0);
  const away = scoreBefore.away + (teamId === homeTeamId ? 0 : points);
  return `${home} - ${away}`;
}

function earnedDangerGateTagsForCandidate(candidate: OfficialRouteFamilyCandidate): readonly string[] {
  if (!candidate.reason.includes("Earned danger gate calibration 6N")) {
    return [];
  }

  const downgradeApplied = candidate.family === "CONTINUATION";
  const allowed = candidate.family !== "CONTINUATION";
  return [
    "earned_danger_gate_6n",
    "earned_danger_gate_connected",
    ...(downgradeApplied
      ? [
          "danger_downgraded_by_gate",
          candidate.reason.includes("DOWNGRADE_TO_SAFE_POSSESSION")
            ? "danger_downgraded_to_safe_possession"
            : candidate.reason.includes("DOWNGRADE_TO_NEUTRAL")
              ? "danger_downgraded_to_neutral"
              : "reset_rebuild_required",
          "automatic_reset_to_danger_blocked",
          "neutral_phase_breaks_momentum",
          "reset_breaks_dominance",
        ]
      : []),
    ...(allowed
      ? [
          candidate.reason.includes("borderline")
            ? "borderline_danger_allowed"
            : "earned_danger_confirmed",
        ]
      : []),
  ];
}

function annotateShotGateEvent(
  events: readonly MatchEvent[],
  candidate: OfficialRouteFamilyCandidate,
): readonly MatchEvent[] {
  if (
    candidate.family !== "SHOT_GOAL" ||
    !candidate.reason.includes("Earned danger gate calibration 6N")
  ) {
    return events;
  }

  const eventIndex = events.findIndex((event) =>
    event.teamId === candidate.teamId &&
    (
      scoreChangePoints(event) > 0 ||
      event.eventType === "scoring" ||
      event.tacticalContext.moveType === "SHOT_GOAL" ||
      event.tacticalContext.moveType === "SHOT" ||
      event.zone === candidate.targetZone
    )
  );
  if (eventIndex < 0) {
    return events;
  }

  const event = events[eventIndex];
  if (event === undefined) {
    return events;
  }
  const gateTags = earnedDangerGateTagsForCandidate(candidate);
  const nextTags = [
    ...event.tags,
    "official_route_family_SHOT_GOAL",
    `official_route_family_outcome_${candidate.outcome}`,
    ...gateTags,
    ...candidate.calibrationTags,
  ];
  const annotatedEvent: MatchEvent = {
    ...event,
    tacticalContext: {
      ...event.tacticalContext,
      reason: `${event.tacticalContext.reason} ${candidate.reason}`.trim(),
    },
    tags: [...new Set(nextTags)],
  };

  return events.map((item, index) => index === eventIndex ? annotatedEvent : item);
}

function eventForResolvedCandidate(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly matchInput: MatchInput;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
  readonly scoreBefore: ScoreState;
  readonly timelineOffset?: number;
  readonly template?: MatchEvent;
}): MatchEvent | null {
  if (input.candidate.family === "SHOT_GOAL") {
    return null;
  }

  const points = input.candidate.family === "TRY_TOUCHDOWN"
    ? scoringRegistryEntry("TRY_TOUCHDOWN").points ?? 0
    : input.candidate.family === "DROP_GOAL"
      ? scoringRegistryEntry("DROP_GOAL").points ?? 0
      : input.candidate.family === "CONVERSION_GOAL"
        ? scoringRegistryEntry("CONVERSION_GOAL").points ?? 0
        : 0;
  const shouldScore = input.candidate.scoring && input.candidate.family !== "CONTINUATION";
  const team = input.matchInput.homeTeam.teamId === input.candidate.teamId
    ? input.matchInput.homeTeam
    : input.matchInput.awayTeam;
  const opponent = input.matchInput.homeTeam.teamId === input.candidate.teamId
    ? input.matchInput.awayTeam
    : input.matchInput.homeTeam;
  const familyLabel = routeFamilyCoachLabel(input.candidate.family);
  const calibrationTags = new Set(input.candidate.calibrationTags);
  const dominanceChainDecayApplied = input.candidate.family === "CONTINUATION" &&
    calibrationTags.has("dominance_decay_applied");
  const postScoreResetApplied = input.candidate.family === "CONTINUATION" &&
    (
      calibrationTags.has("post_score_reset_protected") ||
      calibrationTags.has("post_score_conceding_restart_protected")
    );
  const goalkeeperSecureResetApplied = input.candidate.family === "CONTINUATION" &&
    calibrationTags.has("goalkeeper_secure_reset_break_6l");
  const resetBreakBlowoutEconomyApplied = input.candidate.family === "CONTINUATION" &&
    input.candidate.reason.includes("Reset break blowout economy calibration");
  const earnedDangerGateApplied = input.candidate.reason.includes("Earned danger gate calibration 6N");
  const scoreDescription = shouldScore
    ? `${team.name} marque ${points} points via ${familyLabel}.`
    : `${team.name} poursuit l'action via ${familyLabel} sans modifier le score.`;

  return {
    eventId: `${input.segmentLabel}-route-family-${input.candidate.family.toLowerCase()}-${input.candidate.teamId}` as MatchEvent["eventId"],
    matchId: input.matchInput.matchId,
    timestamp: {
      tick: (input.segmentIndex * 100 + 92 + (input.timelineOffset ?? routeEventTimelineOffset(input.candidate.family))) as MatchEvent["timestamp"]["tick"],
      minute: (input.template?.timestamp.minute ?? input.segmentIndex * 10) + 8,
      period: input.template?.timestamp.period ?? "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `full-match-${input.segmentLabel}-route-family` as MatchEvent["sequenceId"],
    teamId: team.teamId,
    opponentTeamId: opponent.teamId,
    eventType: shouldScore ? "scoring" : "progression",
    zone: input.candidate.targetZone,
    primaryPlayerId: input.candidate.actorId,
    tacticalContext: {
      pressureLevel: input.candidate.family === "DROP_GOAL"
        ? PressureLevel.Medium
        : input.candidate.family === "TRY_TOUCHDOWN"
          ? PressureLevel.High
          : PressureLevel.Medium,
      ballZone: input.candidate.targetZone,
      targetZone: input.candidate.targetZone,
      moveType: input.candidate.family,
      attackingDirection: team.teamId === input.matchInput.homeTeam.teamId ? "left_to_right" : "right_to_left",
      reason: input.candidate.reason,
    },
    fatigueContext: {
      teamCondition: team.roster[0]?.currentCondition ?? 70,
      primaryPlayerCondition: team.roster.find((player) => player.playerId === input.candidate.actorId)?.currentCondition ?? 70,
      primaryPlayerMentalFreshness: team.roster.find((player) => player.playerId === input.candidate.actorId)?.mentalFreshness ?? 70,
    },
    outcome: shouldScore ? "score" : "neutral",
    consequences: shouldScore
      ? [
          {
            type: "score_change",
            description: `${scoreDescription} Score apres action: ${scoreAfter(input.scoreBefore, team.teamId, input.matchInput.homeTeam.teamId, points)}.`,
            value: points,
          },
          {
            type: "momentum_change",
            description: "La route non-shot choisie marque sans cap, reecriture, ni score force.",
            value: 5,
          },
        ]
      : [
          {
            type: "tactical_warning",
            description: scoreDescription,
          },
        ],
    ...(shouldScore ? {
      scoringFamily: input.candidate.family as OfficialScoringFamily,
      scoringAction: input.candidate.family as OfficialScoringFamily,
      scoringPointValue: points,
      scoringAttributionConfidence: "high" as const,
      scoringAttributionReason:
        `${input.candidate.family} was generated, selected, and resolved by the official route family mix before score_change emission.`,
      scoringAttributionSourceFields: [
        "officialRouteFamilyCandidate.family",
        "officialRouteFamilyCandidate.scoring",
        "score_change.value",
      ],
      scoringAttributionMissingFields: [],
      scoringAttributionWarningCodes: [],
    } : {}),
    tags: [
      ...ROUTE_MIX_TAGS,
      `official_route_family_${input.candidate.family}`,
      `official_route_family_outcome_${input.candidate.outcome}`,
      ...(shouldScore ? ["official_route_family_non_shot_score_change"] : ["official_route_family_non_scoring_outcome"]),
      ...(dominanceChainDecayApplied
        ? [
            "dominance_chain_calibration_6j",
            "dominance_decay_applied",
            "neutral_phase_breaks_momentum",
            input.candidate.reason.includes("repeated route family or zone")
              ? "route_family_repeat_dampened"
              : "reset_breaks_dominance",
          ]
        : []),
      ...(postScoreResetApplied
        ? [
            "break_event_post_score_reset_6k",
            "post_score_reset_protected",
            "neutral_phase_breaks_momentum",
            "reset_breaks_dominance",
            "post_score_dominance_decay_applied",
          ]
        : []),
      ...(goalkeeperSecureResetApplied
        ? [
            "goalkeeper_secure_reset_break_6l",
            "GOALKEEPER_SECURE_BREAKS_CHAIN",
            "GOALKEEPER_SECURE_POSSESSION_RESET",
            "GOALKEEPER_SECURE_SAFE_RESTART",
            "GOALKEEPER_SECURE_NEUTRAL_RESTART",
            "goalkeeper_secure_breaks_dominance",
            "goalkeeper_secure_possession_reset",
            "goalkeeper_secure_safe_restart",
            "neutral_phase_breaks_momentum",
            "reset_breaks_dominance",
          ]
        : []),
      ...(resetBreakBlowoutEconomyApplied
        ? [
            "reset_break_blowout_economy_6m",
            "automatic_danger_dampened",
            "post_break_safe_possession",
            "reset_to_danger_quality_gate",
            "neutral_phase_breaks_momentum",
            "reset_breaks_dominance",
          ]
        : []),
      ...(earnedDangerGateApplied ? earnedDangerGateTagsForCandidate(input.candidate) : []),
      ...input.candidate.calibrationTags.filter((tag) =>
        ![
          "dominance_chain_calibration_6j",
          "dominance_decay_applied",
          "post_score_reset_protected",
          "post_score_conceding_restart_protected",
          "goalkeeper_secure_reset_break_6l",
        ].includes(tag)
      ),
    ],
    narrativeWeight: shouldScore ? 82 : 48,
  };
}

function conversionCandidateFromTry(input: {
  readonly tryCandidate: OfficialRouteFamilyCandidate;
  readonly matchInput: MatchInput;
  readonly segmentState: FullMatchSegmentState;
  readonly team: TeamSnapshot;
  readonly opponent: TeamSnapshot;
  readonly plan: TacticalPlan;
  readonly scoreBefore: ScoreState;
}): OfficialRouteFamilyCandidate {
  const base = buildCandidate({
    matchInput: input.matchInput,
    segmentState: input.segmentState,
    segmentLabel: input.tryCandidate.segmentLabel,
    segmentIndex: input.tryCandidate.segmentIndex,
    team: input.team,
    opponent: input.opponent,
    plan: input.plan,
    family: "CONVERSION_GOAL",
    tryAlreadyScored: true,
    scoreBefore: input.scoreBefore,
  });
  const noise = deterministicNoise(`${input.matchInput.seed}:${base.candidateId}:conversion`);
  const scoring = base.candidateScore + noise >= 68;

  return {
    ...base,
    selected: true,
    resolved: true,
    scoring,
    outcome: scoring ? "CONVERSION_GOAL_SCORED" : "CONVERSION_MISSED",
    reason: scoring
      ? "Conversion is generated only after a valid try route and clears the conversion gate."
      : "Conversion is generated only after a valid try route but misses the conversion gate.",
  };
}

export function createFullMatchOfficialRouteFamilyMixState(): FullMatchOfficialRouteFamilyMixState {
  return {
    candidates: [],
    routeEvents: [],
  };
}

export function resolveFullMatchOfficialRouteFamilyMixForSegment(input: {
  readonly events: readonly MatchEvent[];
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly matchInput: MatchInput;
  readonly segmentLabel: string;
  readonly segmentIndex: number;
  readonly segmentState: FullMatchSegmentState;
  readonly scoreBefore: ScoreState;
}): FullMatchOfficialRouteFamilyMixSegmentResolution {
  const teams: readonly {
    readonly team: TeamSnapshot;
    readonly opponent: TeamSnapshot;
    readonly plan: TacticalPlan;
  }[] = [
    { team: input.matchInput.homeTeam, opponent: input.matchInput.awayTeam, plan: input.matchInput.homePlan },
    { team: input.matchInput.awayTeam, opponent: input.matchInput.homeTeam, plan: input.matchInput.awayPlan },
  ];
  const selectedCandidates: OfficialRouteFamilyCandidate[] = [];
  const allCandidates: OfficialRouteFamilyCandidate[] = [];
  const generatedEvents: MatchEvent[] = [];
  let segmentEvents: readonly MatchEvent[] = input.events;

  for (const teamInput of teams) {
    const candidates = (["SHOT_GOAL", "TRY_TOUCHDOWN", "DROP_GOAL", "CONTINUATION"] as const).map((family) =>
      buildCandidate({
        matchInput: input.matchInput,
        segmentState: input.segmentState,
        segmentLabel: input.segmentLabel,
        segmentIndex: input.segmentIndex,
        team: teamInput.team,
        opponent: teamInput.opponent,
        plan: teamInput.plan,
        family,
        tryAlreadyScored: false,
        scoreBefore: input.scoreBefore,
      })
    );
    const selected = resolveSelectedCandidate(densitySelectedCandidate({
      candidates,
      state: input.state,
      teamId: teamInput.team.teamId,
      segmentIndex: input.segmentIndex,
      teamState: teamStateForId(input.segmentState, teamInput.team.teamId),
      seed: input.matchInput.seed,
      events: input.events,
      scoreBefore: input.scoreBefore,
      homeTeamId: input.matchInput.homeTeam.teamId,
    }), input.matchInput.seed);
    const candidatesWithSelection = candidates.map((candidate) =>
      candidate.candidateId === selected.candidateId ? selected : candidate
    );
    allCandidates.push(...candidatesWithSelection);
    selectedCandidates.push(selected);
    const template = input.events[0];
    const event = eventForResolvedCandidate({
      candidate: selected,
      matchInput: input.matchInput,
      segmentLabel: input.segmentLabel,
      segmentIndex: input.segmentIndex,
      scoreBefore: input.scoreBefore,
      ...(template === undefined ? {} : { template }),
    });

    if (event !== null) {
      generatedEvents.push(event);
    } else {
      segmentEvents = annotateShotGateEvent(segmentEvents, selected);
    }

    if (selected.family === "TRY_TOUCHDOWN" && selected.scoring) {
      const conversion = conversionCandidateFromTry({
        tryCandidate: selected,
        matchInput: input.matchInput,
        segmentState: input.segmentState,
        team: teamInput.team,
        opponent: teamInput.opponent,
        plan: teamInput.plan,
        scoreBefore: input.scoreBefore,
      });
      allCandidates.push(conversion);
      selectedCandidates.push(conversion);
      const conversionEvent = eventForResolvedCandidate({
        candidate: conversion,
        matchInput: input.matchInput,
        segmentLabel: input.segmentLabel,
        segmentIndex: input.segmentIndex,
        scoreBefore: {
          home: input.scoreBefore.home + (selected.teamId === input.matchInput.homeTeam.teamId ? (scoringRegistryEntry("TRY_TOUCHDOWN").points ?? 0) : 0),
          away: input.scoreBefore.away + (selected.teamId === input.matchInput.homeTeam.teamId ? 0 : (scoringRegistryEntry("TRY_TOUCHDOWN").points ?? 0)),
        },
        timelineOffset: routeEventTimelineOffset(selected.family) + 1,
        ...(template === undefined ? {} : { template }),
      });

      if (conversionEvent !== null) {
        generatedEvents.push(conversionEvent);
      }
    } else {
      allCandidates.push(buildCandidate({
        matchInput: input.matchInput,
        segmentState: input.segmentState,
        segmentLabel: input.segmentLabel,
        segmentIndex: input.segmentIndex,
        team: teamInput.team,
        opponent: teamInput.opponent,
        plan: teamInput.plan,
        family: "CONVERSION_GOAL",
        tryAlreadyScored: false,
        scoreBefore: input.scoreBefore,
      }));
    }
  }

  return {
    events: [...segmentEvents, ...generatedEvents],
    selectedCandidates,
    state: {
      candidates: [...input.state.candidates, ...allCandidates],
      routeEvents: [...input.state.routeEvents, ...generatedEvents],
    },
  };
}

function availabilityRows(candidates: readonly OfficialRouteFamilyCandidate[]): readonly OfficialRouteFamilyAvailabilityRow[] {
  return ROUTE_FAMILIES.map((family) => {
    const rows = candidates.filter((candidate) => candidate.family === family);
    const uniqueUnavailable = new Set(rows.flatMap((candidate) => candidate.unavailableReasonCodes));
    const uniqueSuppression = new Set(rows.flatMap((candidate) => candidate.suppressionReasonCodes));

    return {
      family,
      candidateCount: rows.length,
      eligibleCandidateCount: rows.filter((candidate) => candidate.eligible).length,
      selectedCandidateCount: rows.filter((candidate) => candidate.selected).length,
      resolvedCandidateCount: rows.filter((candidate) => candidate.resolved).length,
      scoringCandidateCount: rows.filter((candidate) => candidate.scoring).length,
      nonScoringOutcomeCount: rows.filter((candidate) => candidate.resolved && !candidate.scoring).length,
      unavailableReasonCodes: [...uniqueUnavailable],
      suppressionReasonCodes: [...uniqueSuppression],
      selectedButFailedCount: rows.filter((candidate) => candidate.selected && candidate.resolved && !candidate.scoring).length,
      resolvedToScoreCount: rows.filter((candidate) => candidate.resolved && candidate.scoring).length,
      resolvedToNonScoreCount: rows.filter((candidate) => candidate.resolved && !candidate.scoring).length,
    };
  });
}

function routeFamilies(candidates: readonly OfficialRouteFamilyCandidate[], predicate: (candidate: OfficialRouteFamilyCandidate) => boolean): readonly OfficialRouteFamily[] {
  return [...new Set(candidates.filter(predicate).map((candidate) => candidate.family))];
}

function buildTeamOpportunityBalance(input: {
  readonly matchInput: MatchInput;
  readonly candidates: readonly OfficialRouteFamilyCandidate[];
}): TeamOpportunityBalanceModel {
  const homeTeamId = input.matchInput.homeTeam.teamId;
  const awayTeamId = input.matchInput.awayTeam.teamId;
  const selectedByFamily = (teamId: TeamId): Record<OfficialRouteFamily, number> =>
    input.candidates
      .filter((candidate) => candidate.teamId === teamId && candidate.selected)
      .reduce((counts, candidate) => ({
        ...counts,
        [candidate.family]: counts[candidate.family] + 1,
      }), emptyRouteFamilyCounts());
  const scoringByFamily = (teamId: TeamId): Record<OfficialRouteFamily, number> =>
    input.candidates
      .filter((candidate) => candidate.teamId === teamId && candidate.scoring)
      .reduce((counts, candidate) => ({
        ...counts,
        [candidate.family]: counts[candidate.family] + 1,
      }), emptyRouteFamilyCounts());
  const suppressionReasons = (teamId: TeamId): readonly OfficialRouteFamilyUnavailableReasonCode[] =>
    [...new Set(input.candidates
      .filter((candidate) => candidate.teamId === teamId)
      .flatMap((candidate) => [...candidate.unavailableReasonCodes, ...candidate.suppressionReasonCodes]))];
  const homeDanger = new Set(input.candidates.filter((candidate) => candidate.teamId === homeTeamId).map((candidate) => candidate.segmentLabel)).size;
  const awayDanger = new Set(input.candidates.filter((candidate) => candidate.teamId === awayTeamId).map((candidate) => candidate.segmentLabel)).size;
  const homeScoringOpportunities = input.candidates.filter((candidate) =>
    candidate.teamId === homeTeamId &&
    candidate.family !== "CONTINUATION" &&
    candidate.eligible
  ).length;
  const awayScoringOpportunities = input.candidates.filter((candidate) =>
    candidate.teamId === awayTeamId &&
    candidate.family !== "CONTINUATION" &&
    candidate.eligible
  ).length;
  const homeEligibleNonShotRoutes = input.candidates.filter((candidate) =>
    candidate.teamId === homeTeamId &&
    candidate.family !== "SHOT_GOAL" &&
    candidate.family !== "CONTINUATION" &&
    candidate.eligible
  ).length;
  const awayEligibleNonShotRoutes = input.candidates.filter((candidate) =>
    candidate.teamId === awayTeamId &&
    candidate.family !== "SHOT_GOAL" &&
    candidate.family !== "CONTINUATION" &&
    candidate.eligible
  ).length;
  const homeScoring = input.candidates.some((candidate) => candidate.teamId === homeTeamId && candidate.scoring);
  const awayScoring = input.candidates.some((candidate) => candidate.teamId === awayTeamId && candidate.scoring);

  return {
    homePossessionDangerPhases: homeDanger,
    awayPossessionDangerPhases: awayDanger,
    homeScoringOpportunities,
    awayScoringOpportunities,
    homeEligibleNonShotRoutes,
    awayEligibleNonShotRoutes,
    homeSelectedRoutesByFamily: selectedByFamily(homeTeamId),
    awaySelectedRoutesByFamily: selectedByFamily(awayTeamId),
    homeScoringEventsByFamily: scoringByFamily(homeTeamId),
    awayScoringEventsByFamily: scoringByFamily(awayTeamId),
    oneSidedOpportunityRisk: homeScoringOpportunities === 0 || awayScoringOpportunities === 0,
    oneSidedScoringRisk: homeScoring !== awayScoring,
    suppressionReasonsByTeam: {
      [homeTeamId]: suppressionReasons(homeTeamId),
      [awayTeamId]: suppressionReasons(awayTeamId),
    },
    recommendation:
      homeScoringOpportunities === 0
        ? "IMPROVE_HOME_DANGER_ACCESS"
        : awayScoringOpportunities === 0
          ? "IMPROVE_AWAY_DANGER_ACCESS"
          : homeEligibleNonShotRoutes + awayEligibleNonShotRoutes === 0
            ? "IMPROVE_NON_SHOT_ACCESS"
            : "KEEP_MONITORING",
  };
}

export function summarizeFullMatchOfficialRouteFamilyMix(input: {
  readonly state: FullMatchOfficialRouteFamilyMixState;
  readonly matchInput: MatchInput;
  readonly scoreFromOfficialScoreChangeEvents: boolean;
}): FullMatchOfficialRouteFamilyMixModel {
  const candidates = input.state.candidates;
  const nonShot = candidates.filter((candidate) => candidate.family !== "SHOT_GOAL" && candidate.family !== "CONTINUATION");
  const eligible = candidates.filter((candidate) => candidate.eligible);
  const selected = candidates.filter((candidate) => candidate.selected);
  const scoring = candidates.filter((candidate) => candidate.scoring);
  const nonShotSelected = selected.filter((candidate) => candidate.family !== "SHOT_GOAL" && candidate.family !== "CONTINUATION");
  const nonShotScoring = scoring.filter((candidate) => candidate.family !== "SHOT_GOAL" && candidate.family !== "CONTINUATION");
  const tryDropCandidates = candidates.filter((candidate) => candidate.family === "TRY_TOUCHDOWN" || candidate.family === "DROP_GOAL");
  const tryDropSelected = selected.filter((candidate) => candidate.family === "TRY_TOUCHDOWN" || candidate.family === "DROP_GOAL");
  const tryDropScoring = scoring.filter((candidate) => candidate.family === "TRY_TOUCHDOWN" || candidate.family === "DROP_GOAL");
  const conversionCandidates = candidates.filter((candidate) => candidate.family === "CONVERSION_GOAL");
  const conversionGeneratedOnlyAfterTry = conversionCandidates
    .filter((candidate) => candidate.selected)
    .every((candidate) =>
      candidates.some((tryCandidate) =>
        tryCandidate.segmentLabel === candidate.segmentLabel &&
        tryCandidate.teamId === candidate.teamId &&
        tryCandidate.family === "TRY_TOUCHDOWN" &&
        tryCandidate.scoring
      )
    );
  const teamOpportunityBalance = buildTeamOpportunityBalance({
    matchInput: input.matchInput,
    candidates,
  });
  const selectedFamilies = routeFamilies(candidates, (candidate) => candidate.selected);
  const scoringFamilies = routeFamilies(candidates, (candidate) => candidate.scoring);
  const shotOnlyMatchRisk = scoringFamilies.length <= 1 && scoringFamilies.includes("SHOT_GOAL");
  const routeFamilyCompetitionCanSelectNonShot = nonShotSelected.length > 0;
  const routeFamilyCompetitionCanSelectContinuation = selected.some((candidate) => candidate.family === "CONTINUATION");
  const recommendation =
    !input.scoreFromOfficialScoreChangeEvents
      ? "FIX_OFFICIAL_SCORING_GUARDRAILS"
      : nonShotSelected.length === 0
        ? "TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT"
        : nonShotScoring.length === 0
          ? "IMPROVE_TRY_DROP_RESOLUTION"
          : "KEEP_ROUTE_FAMILY_MIX_MONITORING";

  return {
    status: candidates.length > 0 ? "available" : "not_available",
    scope: "FULL_MATCH_ROUTE_FAMILY_MIX_SINGLE_RUN",
    version: "ROUTE_FAMILY_MIX_6F",
    routeFamiliesSupported: ROUTE_FAMILIES,
    shotCandidateCount: candidates.filter((candidate) => candidate.family === "SHOT_GOAL").length,
    tryCandidateCount: candidates.filter((candidate) => candidate.family === "TRY_TOUCHDOWN").length,
    dropCandidateCount: candidates.filter((candidate) => candidate.family === "DROP_GOAL").length,
    conversionCandidateCount: conversionCandidates.length,
    continuationCandidateCount: candidates.filter((candidate) => candidate.family === "CONTINUATION").length,
    eligibleShotCandidateCount: candidates.filter((candidate) => candidate.family === "SHOT_GOAL" && candidate.eligible).length,
    eligibleTryCandidateCount: candidates.filter((candidate) => candidate.family === "TRY_TOUCHDOWN" && candidate.eligible).length,
    eligibleDropCandidateCount: candidates.filter((candidate) => candidate.family === "DROP_GOAL" && candidate.eligible).length,
    eligibleConversionCandidateCount: candidates.filter((candidate) => candidate.family === "CONVERSION_GOAL" && candidate.eligible).length,
    selectedRouteFamilies: selectedFamilies,
    resolvedRouteFamilies: routeFamilies(candidates, (candidate) => candidate.resolved),
    scoringRouteFamilies: scoringFamilies,
    nonScoringRouteFamilies: routeFamilies(candidates, (candidate) => candidate.resolved && !candidate.scoring),
    nonShotCandidateShare: percent(nonShot.length, candidates.length),
    nonShotEligibleShare: percent(nonShot.filter((candidate) => candidate.eligible).length, eligible.length),
    nonShotSelectedShare: percent(nonShotSelected.length, selected.length),
    nonShotScoringShare: percent(nonShotScoring.length, scoring.length),
    tryDropAvailabilityRate: percent(tryDropCandidates.filter((candidate) => candidate.eligible).length, tryDropCandidates.length),
    tryDropSelectionRate: percent(tryDropSelected.length, tryDropCandidates.length),
    tryDropScoringRate: percent(tryDropScoring.length, tryDropCandidates.length),
    conversionGeneratedOnlyAfterTry,
    conversionWithoutTryBlocked: conversionCandidates
      .filter((candidate) => !candidate.selected)
      .every((candidate) => candidate.unavailableReasonCodes.includes("CONVERSION_REQUIRES_TRY")),
    penaltyShotInactive: scoringRegistryEntry("PENALTY_SHOT").active === false,
    routeFamilyCompetitionActive: selectedFamilies.length > 1,
    routeFamilyCompetitionCanSelectNonShot,
    routeFamilyCompetitionCanSelectContinuation,
    shotOnlyMatchRisk,
    oneSidedScoringRisk: teamOpportunityBalance.oneSidedScoringRisk,
    availabilityRows: availabilityRows(candidates),
    teamOpportunityBalance,
    candidates,
    scoringConstantsChanged: false,
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    scoreFromOfficialScoreChangeEvents: input.scoreFromOfficialScoreChangeEvents,
    globalEconomyClaimCount: 0,
    singleRunOnly: true,
    recommendation,
  };
}
