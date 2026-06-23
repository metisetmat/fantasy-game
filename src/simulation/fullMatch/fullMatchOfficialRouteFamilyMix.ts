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
    scoreDelta < -5 &&
    selected.family === "CONTINUATION" &&
    bestScoringCandidate.eligible &&
    bestScoringCandidate.candidateScore + 9 >= selected.candidateScore
  ) {
    return {
      ...bestScoringCandidate,
      candidateScore: Math.max(bestScoringCandidate.candidateScore, selected.candidateScore + 1),
      reason: "Team opportunity balance calibration opens a trailing-team response window: legal scoring route access is preferred over another safe reset without forcing a score.",
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

  if (continuation === undefined) {
    return selected;
  }

  if (selected.family === "CONTINUATION") {
    return postScoreSameTeamReattackWindow
      ? {
          ...selected,
          reason: "Post-score reset calibration protects restart: the scoring team must pass through a neutral reset before another dangerous opportunity, without forcing opponent scores.",
        }
      : postScoreConcedingRestartWindow
        ? {
            ...selected,
            reason: "Post-score conceding restart calibration gives the conceding team a safe restart possession after the score: the restart breaks momentum without forcing a reply score.",
          }
        : selected;
  }

  if (postScoreSameTeamReattackWindow) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
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
    input.events.some(hasGoalkeeperSecureSource);
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
  const earnedDangerGateEnabled = input.seed.includes("earned-danger-gate-6n");
  const earnedDangerGateResult = earnedDangerGateEnabled && recentResetToDangerWindow
    ? computeEarnedDangerGate({
        candidate: selected,
        teamState: input.teamState,
        resetSourceType: earnedDangerResetSourceType(lastResetRouteEvent),
        scoreDelta,
        pressureFatigueLoad,
        deterministicBreak,
        recentResetToDangerWindow,
        goalkeeperSecureContext: lastResetRouteEvent !== undefined && hasGoalkeeperSecureSource(lastResetRouteEvent),
        postScoreContext: postScoreSameTeamReattackWindow || postScoreConcedingRestartWindow,
      })
    : undefined;

  if (
    earnedDangerGateResult !== undefined &&
    !["ALLOW_DANGER", "ALLOW_BORDERLINE_DANGER"].includes(earnedDangerGateResult.gateDecision)
  ) {
    return {
      ...continuation,
      candidateScore: Math.max(continuation.candidateScore, selected.candidateScore + 1),
      reason: `Earned danger gate calibration 6N downgrades reset-to-danger to ${earnedDangerGateResult.gateDecision}: score ${earnedDangerGateResult.earnedDangerScore}, classification ${earnedDangerGateResult.earnedDangerClassification}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
    };
  }

  if (earnedDangerGateResult?.gateDecision === "ALLOW_BORDERLINE_DANGER") {
    return {
      ...selected,
      reason: `${selected.reason} Earned danger gate calibration 6N allows borderline danger: score ${earnedDangerGateResult.earnedDangerScore}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
    };
  }

  if (earnedDangerGateResult?.gateDecision === "ALLOW_DANGER") {
    return {
      ...selected,
      reason: `${selected.reason} Earned danger gate calibration 6N confirms earned danger: score ${earnedDangerGateResult.earnedDangerScore}, reasons ${earnedDangerGateResult.gateReasonCodes.join("+")}.`,
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
      reason: scoring
        ? "Legal try access, support, and grounding control clear the official try gate."
        : "Try route is selected and attempted, but grounding pressure, ball control, or contact resistance stops the score.",
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
      reason: scoring
        ? "Open-play drop timing, kicker profile, and balance clear the official drop gate."
        : "Drop route is selected and attempted, but timing, balance, or block pressure prevents scoring.",
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
    reason: "Shot route remains the selected official scoring family for this danger phase.",
  };
}

function scoreAfter(scoreBefore: ScoreState, teamId: TeamId, homeTeamId: TeamId, points: number): string {
  const home = scoreBefore.home + (teamId === homeTeamId ? points : 0);
  const away = scoreBefore.away + (teamId === homeTeamId ? 0 : points);
  return `${home} - ${away}`;
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
  const dominanceChainDecayApplied = input.candidate.family === "CONTINUATION" &&
    input.candidate.reason.includes("Dominance chain calibration");
  const postScoreResetApplied = input.candidate.family === "CONTINUATION" &&
    input.candidate.reason.includes("Post-score reset calibration");
  const goalkeeperSecureResetApplied = input.candidate.family === "CONTINUATION" &&
    input.candidate.reason.includes("Goalkeeper secure reset calibration");
  const resetBreakBlowoutEconomyApplied = input.candidate.family === "CONTINUATION" &&
    input.candidate.reason.includes("Reset break blowout economy calibration");
  const earnedDangerGateApplied = input.candidate.reason.includes("Earned danger gate calibration 6N");
  const earnedDangerGateDowngradeApplied = input.candidate.family === "CONTINUATION" && earnedDangerGateApplied;
  const earnedDangerGateAllowed = input.candidate.family !== "CONTINUATION" && earnedDangerGateApplied;
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
      ...(earnedDangerGateApplied
        ? [
            "earned_danger_gate_6n",
            "earned_danger_gate_connected",
            ...(earnedDangerGateDowngradeApplied
              ? [
                  "danger_downgraded_by_gate",
                  input.candidate.reason.includes("DOWNGRADE_TO_SAFE_POSSESSION")
                    ? "danger_downgraded_to_safe_possession"
                    : input.candidate.reason.includes("DOWNGRADE_TO_NEUTRAL")
                      ? "danger_downgraded_to_neutral"
                      : "reset_rebuild_required",
                  "automatic_reset_to_danger_blocked",
                  "neutral_phase_breaks_momentum",
                  "reset_breaks_dominance",
                ]
              : []),
            ...(earnedDangerGateAllowed
              ? [
                  input.candidate.reason.includes("borderline")
                    ? "borderline_danger_allowed"
                    : "earned_danger_confirmed",
                ]
              : []),
          ]
        : []),
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
    events: [...input.events, ...generatedEvents],
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
