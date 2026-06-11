# Bundle: bundle__contracts.md

Generated for Sprint 3H - Isolated MiniMatch Override Experiment. Source files are bundled by domain for compact ChatGPT review.

## File: src/contracts/engineToCoach.ts

```ts
import type { EventId, MatchId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type { Rating, TacticalTick } from "../core/ratings";
import type { ZoneId } from "../core/zones";
import type { MatchPhase, PressureLevel, ScoreState } from "../models/match";
import type { PlayerAttributes, PlayerRole } from "../models/player";
import type { TeamIdentity } from "../models/team";
import type { MatchReportEvidenceCategory, MatchReportEvidenceFact } from "./matchReportEvidence";
import type { MatchReportWarning } from "./matchReportWarnings";

export type MatchTimestamp = {
  readonly tick: TacticalTick;
  readonly minute: number;
  readonly period: MatchPeriod;
};

export type MatchPeriod = "first_half" | "second_half" | "extra_time" | "shootout";

export type CompetitionType = "friendly" | "league" | "cup" | "playoff";

export type WeatherCondition = "clear" | "rain" | "wind" | "heat" | "cold";

export type PitchCondition = "fast" | "normal" | "heavy" | "worn";

export type AttackingIntent =
  | "structured_possession"
  | "wide_progression"
  | "direct_pressure"
  | "territorial_kicking"
  | "chaos_creation";

export type DefensiveIntent =
  | "compact_block"
  | "high_press"
  | "mid_block"
  | "low_block"
  | "man_oriented_pressure";

export type TransitionIntent =
  | "counterpress"
  | "secure_rest_defense"
  | "fast_break"
  | "territorial_reset"
  | "delay_and_recover";

export type TacticalTempo = "slow" | "balanced" | "fast";

export type TacticalRiskLevel = "low" | "medium" | "high";

export type ScoringBias = "balanced" | "try_first" | "goal_first" | "drop_threat" | "territory_first";

export type PlayerTrait = string;

export interface ChemistryLink {
  readonly playerId: PlayerId;
  readonly strength: Rating;
  readonly description?: string;
}

export interface MatchContext {
  readonly competitionType: CompetitionType;
  readonly matchImportance: Rating;
  readonly weather?: WeatherCondition;
  readonly pitch?: PitchCondition;
  readonly crowdPressure?: Rating;
}

export interface RulesetConfig {
  readonly rulesetId: string;
  readonly scoringVersion: string;
  readonly maxPlayersOnField?: number;
}

export interface MatchInput {
  readonly matchId: MatchId;
  readonly seed: string;
  readonly homeTeam: TeamSnapshot;
  readonly awayTeam: TeamSnapshot;
  readonly homePlan: TacticalPlan;
  readonly awayPlan: TacticalPlan;
  readonly matchContext: MatchContext;
  readonly ruleset: RulesetConfig;
}

export interface TeamSnapshot {
  readonly teamId: TeamId;
  readonly name: string;
  readonly roster: readonly PlayerSnapshot[];
  readonly starters: readonly PlayerId[];
  readonly bench: readonly PlayerId[];
  readonly captainId?: PlayerId;
  readonly primaryKickerId?: PlayerId;
  readonly primaryDropTakerId?: PlayerId;
  readonly goalkeeperId: PlayerId;
  readonly teamIdentity?: TeamIdentity;
}

export interface PlayerSnapshot {
  readonly playerId: PlayerId;
  readonly name: string;
  readonly role: PlayerRole;
  readonly attributes: PlayerAttributes;
  readonly traits: readonly PlayerTrait[];
  readonly currentCondition: Rating;
  readonly mentalFreshness: Rating;
  readonly chemistryLinks?: readonly ChemistryLink[];
}

export interface TacticalPlan {
  readonly attackingIntent: AttackingIntent;
  readonly defensiveIntent: DefensiveIntent;
  readonly transitionIntent: TransitionIntent;
  readonly tempo: TacticalTempo;
  readonly riskLevel: TacticalRiskLevel;
  readonly targetZones: readonly ZoneId[];
  readonly scoringBias: ScoringBias;
  readonly pressingIntensity: Rating;
  readonly defensiveLineHeight: Rating;
  readonly widthUsage: Rating;
  readonly restDefensePriority: Rating;
}

export type MatchEventType =
  | "kickoff"
  | "gain_possession"
  | "lose_possession"
  | "turnover"
  | "progression"
  | "duel"
  | "defensive_action"
  | "fatigue_error"
  | "goalkeeper_action"
  | "scoring"
  | "tactical_shift"
  | "discipline";

export type EventOutcome = "success" | "failure" | "neutral" | "advantage" | "score";

export type EventConsequenceType =
  | "score_change"
  | "possession_change"
  | "zone_change"
  | "fatigue_change"
  | "momentum_change"
  | "tactical_warning";

export interface EventConsequence {
  readonly type: EventConsequenceType;
  readonly description: string;
  readonly value?: number;
}

export type EventTag = string;

export interface TacticalContextSnapshot {
  readonly pressureLevel: PressureLevel;
  readonly ballZone: ZoneId;
  readonly targetZone?: ZoneId;
  readonly moveType?: string;
  readonly attackingDirection?: string;
  readonly reason?: string;
}

export interface FatigueContextSnapshot {
  readonly teamCondition: Rating;
  readonly primaryPlayerCondition?: Rating;
  readonly primaryPlayerMentalFreshness?: Rating;
  readonly fatiguePressure?: Rating;
  readonly goalkeeperMentalFatigue?: Rating;
}

export interface MatchEvent {
  readonly eventId: EventId;
  readonly matchId: MatchId;
  readonly timestamp: MatchTimestamp;
  readonly phase: MatchPhase;
  readonly sequenceId: SequenceId;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly eventType: MatchEventType;
  readonly zone: ZoneId;
  readonly subZone?: string;
  readonly primaryPlayerId?: PlayerId;
  readonly secondaryPlayerId?: PlayerId;
  readonly opposingPlayerId?: PlayerId;
  readonly tacticalContext: TacticalContextSnapshot;
  readonly fatigueContext: FatigueContextSnapshot;
  readonly outcome: EventOutcome;
  readonly consequences: readonly EventConsequence[];
  readonly tags: readonly EventTag[];
  readonly narrativeWeight: Rating;
}

export interface MatchMomentumState {
  readonly teamId: TeamId | null;
  readonly intensity: Rating;
  readonly description?: string;
}

export interface TeamRuntimeState {
  readonly teamId: TeamId;
  readonly condition: Rating;
  readonly tacticalStability: Rating;
  readonly pressureResistance: Rating;
}

export interface CoachWarning {
  readonly warningId: string;
  readonly teamId: TeamId;
  readonly title: string;
  readonly severity: "low" | "medium" | "high";
  readonly relatedZone?: ZoneId;
}

export interface MatchSnapshot {
  readonly matchId: MatchId;
  readonly currentMinute: number;
  readonly score: ScoreState;
  readonly phase: MatchPhase;
  readonly possessionTeamId: TeamId;
  readonly ballZone: ZoneId;
  readonly momentum: MatchMomentumState;
  readonly teamStates: readonly TeamRuntimeState[];
  readonly lastEvents: readonly MatchEvent[];
  readonly activeWarnings: readonly CoachWarning[];
}

export interface TeamMatchStats {
  readonly teamId: TeamId;
  readonly score: number;
  readonly possessionShare?: Rating;
  readonly turnovers?: number;
  readonly scoringAttempts?: number;
  readonly eventShare?: Rating;
  readonly progressionCount?: number;
  readonly scoringEventCount?: number;
  readonly pressureInstabilityCount?: number;
}

export interface PlayerMatchStats {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly minutes: number;
  readonly actionsInvolved: number;
  readonly mistakes: number;
  readonly contributionScore: Rating;
}

export interface ZoneStats {
  readonly zone: ZoneId;
  readonly entries: number;
  readonly successfulProgressions: number;
  readonly defensiveStops: number;
  readonly scoringEvents?: number;
  readonly pressureEvents?: number;
}

export interface FatigueReport {
  readonly teamSummaries: readonly TeamFatigueSummary[];
  readonly playerSummaries: readonly PlayerFatigueSummary[];
}

export interface TeamFatigueSummary {
  readonly teamId: TeamId;
  readonly averageConditionEnd: Rating;
  readonly highIntensityLoad: Rating;
  readonly lateErrorCount: number;
}

export interface PlayerFatigueSummary {
  readonly playerId: PlayerId;
  readonly conditionStart: Rating;
  readonly conditionEnd: Rating;
  readonly mentalFreshnessEnd: Rating;
}

export interface TacticalReport {
  readonly diagnoses: readonly TacticalDiagnosis[];
}

export interface KeyMoment {
  readonly eventId: EventId;
  readonly evidenceFactId?: string;
  readonly category?: MatchReportEvidenceCategory;
  readonly title: string;
  readonly summary: string;
  readonly minute: number;
}

export type MatchReportMeta = {
  readonly reportScope: "MINI_MATCH_LOCAL" | "FULL_MATCH_HARNESS_SINGLE_RUN" | "FULL_MATCH_BATCH_ECONOMY";
  readonly generatorVersion: string;
  readonly generatedFrom: "runMatch" | "runFullMatch";
  readonly sourceOfTruthNote: string;
  readonly limitations: readonly string[];
};

export interface TrainingFocusSuggestion {
  readonly focusId: string;
  readonly title: string;
  readonly reason: string;
}

export interface MatchReport {
  readonly matchId: MatchId;
  readonly score: ScoreState;
  readonly evidenceFacts: readonly MatchReportEvidenceFact[];
  readonly warnings: readonly MatchReportWarning[];
  readonly reportMeta: MatchReportMeta;
  readonly timeline: readonly MatchEvent[];
  readonly teamStats: readonly TeamMatchStats[];
  readonly playerStats: readonly PlayerMatchStats[];
  readonly zoneStats: readonly ZoneStats[];
  readonly fatigueReport: FatigueReport;
  readonly tacticalReport: TacticalReport;
  readonly keyMoments: readonly KeyMoment[];
  readonly coachInsights: readonly CoachInsight[];
  readonly suggestedFocus: readonly TrainingFocusSuggestion[];
}

export type CoachInsightType =
  | "strength"
  | "weakness"
  | "tactical_success"
  | "tactical_failure"
  | "fatigue_warning"
  | "player_spotlight"
  | "synergy_detected"
  | "opponent_exploit"
  | "training_recommendation";

export interface InsightEvidence {
  readonly eventIds: readonly EventId[];
  readonly summary: string;
  readonly confidenceNote?: string;
}

export interface CoachActionSuggestion {
  readonly actionId: string;
  readonly label: string;
  readonly tradeoff?: string;
}

export interface CoachInsight {
  readonly insightId: string;
  readonly type: CoachInsightType;
  readonly title: string;
  readonly summary: string;
  readonly evidence: readonly InsightEvidence[];
  readonly affectedPlayers: readonly PlayerId[];
  readonly affectedZones: readonly ZoneId[];
  readonly confidence: "low" | "medium" | "high";
  readonly recommendedActions: readonly CoachActionSuggestion[];
}

export interface TacticalDiagnosis {
  readonly diagnosisId: string;
  readonly teamId: TeamId;
  readonly title: string;
  readonly summary: string;
  readonly evidenceEventIds: readonly EventId[];
  readonly affectedZones: readonly ZoneId[];
  readonly confidence: "low" | "medium" | "high";
}

export interface TrainingRecommendation {
  readonly recommendationId: string;
  readonly teamId: TeamId;
  readonly focus: string;
  readonly priority: "low" | "medium" | "high";
  readonly reason: string;
  readonly tradeoff?: string;
  readonly affectedPlayers: readonly PlayerId[];
}

export interface ProgressionSignal {
  readonly signalId: string;
  readonly playerId?: PlayerId;
  readonly teamId?: TeamId;
  readonly sourceEventIds: readonly EventId[];
  readonly category: "technical" | "physical" | "tactical" | "mental" | "chemistry";
  readonly direction: "positive" | "negative" | "neutral";
  readonly summary: string;
}
```

## File: src/contracts/matchReportEvidence.ts

```ts
export type MatchReportEvidenceCategory =
  | "SCORING_CONVERSION"
  | "DANGER_CREATION"
  | "PRESSURE_WITHOUT_CONVERSION"
  | "POSSESSION_INSTABILITY"
  | "TERRITORIAL_PRESSURE"
  | "FATIGUE_LOAD"
  | "MOMENTUM_SHIFT"
  | "TACTICAL_PLAN_SIGNAL"
  | "HARNESS_PLAUSIBILITY_WARNING"
  | "WORKBENCH_CHAIN_CONSUMPTION"
  | "WORKBENCH_CHAIN_SEGMENT_CONTEXT"
  | "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE"
  | "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION"
  | "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION"
  | "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT"
  | "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE"
  | "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD"
  | "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT";

export type MatchReportEvidenceScope =
  | "MATCH_REPORT"
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "MINI_MATCH_LOCAL"
  | "LIVE_SCORING_STREAM"
  | "BATCH_DIAGNOSTIC_PROJECTION";

export type MatchReportEvidenceFact = {
  readonly factId: string;
  readonly matchId: string;
  readonly teamId?: string;
  readonly opponentTeamId?: string;
  readonly category: MatchReportEvidenceCategory;
  readonly scope: MatchReportEvidenceScope;
  readonly eventIds: readonly string[];
  readonly affectedZones: readonly string[];
  readonly summary: string;
  readonly confidence: "low" | "medium" | "high";
  readonly strength: number;
  readonly coachVisible: boolean;
  readonly internalTags: readonly string[];
};
```

## File: src/contracts/matchReportWarnings.ts

```ts
export type MatchReportWarningType =
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "INFLATED_SINGLE_RUN_SCORE"
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "REPEATED_SEGMENT_PATTERN"
  | "LOW_EVENT_FAMILY_DIVERSITY"
  | "FATIGUE_SIGNAL_FLAT"
  | "HIGH_LOAD_WITH_NO_PAYOFF"
  | "REPORT_COPY_LIMITATION"
  | "ADAPTER_LIMITATION";

export type MatchReportWarning = {
  readonly warningId: string;
  readonly type: MatchReportWarningType;
  readonly scope: "coach_visible" | "internal" | "validation_only";
  readonly severity: "info" | "low" | "medium" | "high";
  readonly title: string;
  readonly coachSummary: string;
  readonly technicalSummary: string;
  readonly evidenceFactIds: readonly string[];
  readonly eventIds: readonly string[];
  readonly mayInvalidateGlobalScoringEconomy: false;
};
```

## File: src/contracts/engineToCoach.test.ts

```ts
import { MatchPhase, PlayerRole, PressureLevel } from "../index";
import type {
  CoachInsight,
  MatchEvent,
  MatchInput,
  MatchReport,
  MatchSnapshot,
  PlayerSnapshot,
  ProgressionSignal,
  TacticalDiagnosis,
  TeamSnapshot,
  TrainingRecommendation,
} from "../index";
import type { ZoneId } from "../core/zones";

const centralBuildOut = "Z2-C" as ZoneId;
const centralMidfield = "Z3-C" as ZoneId;

const goalkeeper: PlayerSnapshot = {
  playerId: "control-gk",
  name: "Control Goalkeeper",
  role: PlayerRole.GoalkeeperFreeSafety,
  attributes: {
    speed: 64,
    agility: 62,
    endurance: 78,
    power: 66,
    handPlay: 86,
    footPlayDribble: 54,
    footPlayPassingShooting: 88,
    intelligence: 92,
    mental: 94,
  },
  traits: ["calm_relaunch"],
  currentCondition: 96,
  mentalFreshness: 98,
};

const homeTeam: TeamSnapshot = {
  teamId: "control",
  name: "CONTROL",
  roster: [goalkeeper],
  starters: [goalkeeper.playerId],
  bench: [],
  goalkeeperId: goalkeeper.playerId,
};

const awayTeam: TeamSnapshot = {
  ...homeTeam,
  teamId: "blitz",
  name: "BLITZ",
  roster: [{ ...goalkeeper, playerId: "blitz-gk", name: "Blitz Goalkeeper" }],
  starters: ["blitz-gk"],
  goalkeeperId: "blitz-gk",
};

const matchInputFixture: MatchInput = {
  matchId: "contract-fixture-001",
  seed: "contract-seed-001",
  homeTeam,
  awayTeam,
  homePlan: {
    attackingIntent: "structured_possession",
    defensiveIntent: "compact_block",
    transitionIntent: "secure_rest_defense",
    tempo: "balanced",
    riskLevel: "medium",
    targetZones: [centralMidfield],
    scoringBias: "balanced",
    pressingIntensity: 50,
    defensiveLineHeight: 50,
    widthUsage: 55,
    restDefensePriority: 75,
  },
  awayPlan: {
    attackingIntent: "direct_pressure",
    defensiveIntent: "high_press",
    transitionIntent: "counterpress",
    tempo: "fast",
    riskLevel: "high",
    targetZones: [centralBuildOut],
    scoringBias: "try_first",
    pressingIntensity: 88,
    defensiveLineHeight: 78,
    widthUsage: 70,
    restDefensePriority: 52,
  },
  matchContext: {
    competitionType: "friendly",
    matchImportance: 40,
  },
  ruleset: {
    rulesetId: "v0.1-contract",
    scoringVersion: "V1",
  },
};

const eventFixture: MatchEvent = {
  eventId: "event-001",
  matchId: matchInputFixture.matchId,
  timestamp: {
    tick: 1,
    minute: 1,
    period: "first_half",
  },
  phase: MatchPhase.InProgress,
  sequenceId: "sequence-001",
  teamId: homeTeam.teamId,
  opponentTeamId: awayTeam.teamId,
  eventType: "progression",
  zone: centralBuildOut,
  tacticalContext: {
    pressureLevel: PressureLevel.Medium,
    ballZone: centralBuildOut,
    targetZone: centralMidfield,
    moveType: "support_recycle",
    reason: "contract fixture verifies public event shape",
  },
  fatigueContext: {
    teamCondition: 94,
    primaryPlayerCondition: 96,
    primaryPlayerMentalFreshness: 98,
  },
  outcome: "success",
  consequences: [
    {
      type: "zone_change",
      description: "Ball advances into central midfield.",
    },
  ],
  tags: ["contract_fixture"],
  narrativeWeight: 20,
};

const coachInsightFixture: CoachInsight = {
  insightId: "insight-001",
  type: "tactical_success",
  title: "Central recycle held",
  summary: "CONTROL escaped pressure through a stable support option.",
  evidence: [
    {
      eventIds: [eventFixture.eventId],
      summary: "The progression event moved the ball into midfield under medium pressure.",
    },
  ],
  affectedPlayers: [goalkeeper.playerId],
  affectedZones: [centralBuildOut, centralMidfield],
  confidence: "medium",
  recommendedActions: [
    {
      actionId: "keep-rest-defense",
      label: "Keep rest defense priority balanced",
      tradeoff: "May reduce immediate vertical threat.",
    },
  ],
};

const tacticalDiagnosisFixture: TacticalDiagnosis = {
  diagnosisId: "diagnosis-001",
  teamId: homeTeam.teamId,
  title: "Stable central support",
  summary: "The plan preserved a safe outlet under pressure.",
  evidenceEventIds: [eventFixture.eventId],
  affectedZones: [centralBuildOut],
  confidence: "medium",
};

const trainingRecommendationFixture: TrainingRecommendation = {
  recommendationId: "training-001",
  teamId: homeTeam.teamId,
  focus: "passing under pressure",
  priority: "medium",
  reason: "The fixture keeps recommendations typed for Sprint 1A.",
  affectedPlayers: [goalkeeper.playerId],
};

const progressionSignalFixture: ProgressionSignal = {
  signalId: "progression-001",
  playerId: goalkeeper.playerId,
  sourceEventIds: [eventFixture.eventId],
  category: "tactical",
  direction: "positive",
  summary: "Player contributed to stable pressure escape.",
};

const matchSnapshotFixture: MatchSnapshot = {
  matchId: matchInputFixture.matchId,
  currentMinute: 1,
  score: { home: 0, away: 0 },
  phase: MatchPhase.InProgress,
  possessionTeamId: homeTeam.teamId,
  ballZone: centralMidfield,
  momentum: {
    teamId: homeTeam.teamId,
    intensity: 55,
  },
  teamStates: [
    {
      teamId: homeTeam.teamId,
      condition: 94,
      tacticalStability: 76,
      pressureResistance: 82,
    },
  ],
  lastEvents: [eventFixture],
  activeWarnings: [],
};

const matchReportFixture: MatchReport = {
  matchId: matchInputFixture.matchId,
  score: { home: 0, away: 0 },
  evidenceFacts: [
    {
      factId: "contract-fixture-001-evidence-001",
      matchId: matchInputFixture.matchId,
      teamId: homeTeam.teamId,
      opponentTeamId: awayTeam.teamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "MATCH_REPORT",
      eventIds: [eventFixture.eventId],
      affectedZones: [centralBuildOut],
      summary: "CONTROL progression evidence remains typed and coach-visible.",
      confidence: "medium",
      strength: 55,
      coachVisible: true,
      internalTags: ["contract_fixture"],
    },
  ],
  warnings: [],
  reportMeta: {
    reportScope: "MINI_MATCH_LOCAL",
    generatorVersion: "contract-fixture-v2p",
    generatedFrom: "runMatch",
    sourceOfTruthNote: "Final score is derived only from score_change consequences.",
    limitations: ["Contract fixture is intentionally compact."],
  },
  timeline: [eventFixture],
  teamStats: [
    {
      teamId: homeTeam.teamId,
      score: 0,
      possessionShare: 52,
    },
  ],
  playerStats: [
    {
      playerId: goalkeeper.playerId,
      teamId: homeTeam.teamId,
      minutes: 1,
      actionsInvolved: 1,
      mistakes: 0,
      contributionScore: 55,
    },
  ],
  zoneStats: [
    {
      zone: centralBuildOut,
      entries: 1,
      successfulProgressions: 1,
      defensiveStops: 0,
    },
  ],
  fatigueReport: {
    teamSummaries: [
      {
        teamId: homeTeam.teamId,
        averageConditionEnd: 94,
        highIntensityLoad: 12,
        lateErrorCount: 0,
      },
    ],
    playerSummaries: [
      {
        playerId: goalkeeper.playerId,
        conditionStart: 96,
        conditionEnd: 95,
        mentalFreshnessEnd: 98,
      },
    ],
  },
  tacticalReport: {
    diagnoses: [tacticalDiagnosisFixture],
  },
  keyMoments: [
    {
      eventId: eventFixture.eventId,
      evidenceFactId: "contract-fixture-001-evidence-001",
      category: "TACTICAL_PLAN_SIGNAL",
      title: "First pressure escape",
      summary: "CONTROL progressed cleanly into midfield.",
      minute: 1,
    },
  ],
  coachInsights: [coachInsightFixture],
  suggestedFocus: [
    {
      focusId: trainingRecommendationFixture.recommendationId,
      title: trainingRecommendationFixture.focus,
      reason: trainingRecommendationFixture.reason,
    },
  ],
};

export const engineToCoachPublicContractFixtures = {
  matchInputFixture,
  eventFixture,
  coachInsightFixture,
  tacticalDiagnosisFixture,
  trainingRecommendationFixture,
  progressionSignalFixture,
  matchSnapshotFixture,
  matchReportFixture,
} as const;
```

## File: src/contracts/engineToCoachContractGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "./engineToCoach.test";
import type { MatchInput, MatchReport, PlayerSnapshot, TeamSnapshot } from "./engineToCoach";

interface RatingCheck {
  readonly label: string;
  readonly value: number;
}

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertRating(check: RatingCheck): void {
  assertGuard(
    Number.isFinite(check.value) && check.value >= 0 && check.value <= 100,
    `${check.label} must be a finite 0-100 rating, received ${check.value}.`,
  );
}

function rosterIds(team: TeamSnapshot): ReadonlySet<string> {
  return new Set(team.roster.map((player) => player.playerId));
}

function assertPlayerRefsExist(input: {
  readonly team: TeamSnapshot;
  readonly label: string;
  readonly playerIds: readonly string[];
  readonly knownRosterIds: ReadonlySet<string>;
}): void {
  for (const playerId of input.playerIds) {
    assertGuard(
      input.knownRosterIds.has(playerId),
      `${input.label} references ${playerId}, but ${playerId} is not present in ${input.team.name} roster.`,
    );
  }
}

function validateTeamSnapshot(team: TeamSnapshot): void {
  const knownRosterIds = rosterIds(team);

  assertPlayerRefsExist({
    team,
    label: `${team.name} goalkeeperId`,
    playerIds: [team.goalkeeperId],
    knownRosterIds,
  });
  assertPlayerRefsExist({
    team,
    label: `${team.name} starters`,
    playerIds: team.starters,
    knownRosterIds,
  });
  assertPlayerRefsExist({
    team,
    label: `${team.name} bench`,
    playerIds: team.bench,
    knownRosterIds,
  });
}

function playerRatingChecks(player: PlayerSnapshot): readonly RatingCheck[] {
  return [
    { label: `${player.name}.attributes.speed`, value: player.attributes.speed },
    { label: `${player.name}.attributes.agility`, value: player.attributes.agility },
    { label: `${player.name}.attributes.endurance`, value: player.attributes.endurance },
    { label: `${player.name}.attributes.power`, value: player.attributes.power },
    { label: `${player.name}.attributes.handPlay`, value: player.attributes.handPlay },
    { label: `${player.name}.attributes.footPlayDribble`, value: player.attributes.footPlayDribble },
    { label: `${player.name}.attributes.footPlayPassingShooting`, value: player.attributes.footPlayPassingShooting },
    { label: `${player.name}.attributes.intelligence`, value: player.attributes.intelligence },
    { label: `${player.name}.attributes.mental`, value: player.attributes.mental },
    { label: `${player.name}.currentCondition`, value: player.currentCondition },
    { label: `${player.name}.mentalFreshness`, value: player.mentalFreshness },
    ...((player.chemistryLinks ?? []).map((link) => ({
      label: `${player.name}.chemistryLinks.${link.playerId}.strength`,
      value: link.strength,
    }))),
  ];
}

function validateMatchInputRatings(input: MatchInput): void {
  const planChecks: readonly RatingCheck[] = [
    { label: "matchContext.matchImportance", value: input.matchContext.matchImportance },
    { label: "homePlan.pressingIntensity", value: input.homePlan.pressingIntensity },
    { label: "homePlan.defensiveLineHeight", value: input.homePlan.defensiveLineHeight },
    { label: "homePlan.widthUsage", value: input.homePlan.widthUsage },
    { label: "homePlan.restDefensePriority", value: input.homePlan.restDefensePriority },
    { label: "awayPlan.pressingIntensity", value: input.awayPlan.pressingIntensity },
    { label: "awayPlan.defensiveLineHeight", value: input.awayPlan.defensiveLineHeight },
    { label: "awayPlan.widthUsage", value: input.awayPlan.widthUsage },
    { label: "awayPlan.restDefensePriority", value: input.awayPlan.restDefensePriority },
  ];
  const playerChecks = [...input.homeTeam.roster, ...input.awayTeam.roster].flatMap((player) => playerRatingChecks(player));

  for (const check of [...planChecks, ...playerChecks]) {
    assertRating(check);
  }
}

function validateMatchReportReferences(report: MatchReport): void {
  const timelineEventIds = new Set(report.timeline.map((event) => event.eventId));
  const evidenceFactIds = new Set(report.evidenceFacts.map((fact) => fact.factId));

  for (const event of report.timeline) {
    assertGuard(
      event.matchId === report.matchId,
      `MatchEvent ${event.eventId} matchId ${event.matchId} does not match parent MatchReport ${report.matchId}.`,
    );
  }

  for (const insight of report.coachInsights) {
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(
          timelineEventIds.has(eventId),
          `CoachInsight ${insight.insightId} evidence references missing event ${eventId}.`,
        );
      }
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(
      timelineEventIds.has(moment.eventId),
      `KeyMoment ${moment.title} references missing event ${moment.eventId}.`,
    );
    if (moment.evidenceFactId !== undefined) {
      assertGuard(
        evidenceFactIds.has(moment.evidenceFactId),
        `KeyMoment ${moment.title} references missing evidence fact ${moment.evidenceFactId}.`,
      );
    }
  }

  for (const fact of report.evidenceFacts) {
    for (const eventId of fact.eventIds) {
      assertGuard(
        timelineEventIds.has(eventId),
        `MatchReportEvidenceFact ${fact.factId} references missing event ${eventId}.`,
      );
    }
  }

  for (const warning of report.warnings) {
    for (const factId of warning.evidenceFactIds) {
      assertGuard(
        evidenceFactIds.has(factId),
        `MatchReportWarning ${warning.warningId} references missing evidence fact ${factId}.`,
      );
    }
    for (const eventId of warning.eventIds) {
      assertGuard(
        timelineEventIds.has(eventId),
        `MatchReportWarning ${warning.warningId} references missing event ${eventId}.`,
      );
    }
  }
}

function validateMatchReportRatings(report: MatchReport): void {
  const eventChecks = report.timeline.flatMap((event) => [
    { label: `${event.eventId}.narrativeWeight`, value: event.narrativeWeight },
    { label: `${event.eventId}.fatigueContext.teamCondition`, value: event.fatigueContext.teamCondition },
    ...(event.fatigueContext.primaryPlayerCondition === undefined
      ? []
      : [{ label: `${event.eventId}.fatigueContext.primaryPlayerCondition`, value: event.fatigueContext.primaryPlayerCondition }]),
    ...(event.fatigueContext.primaryPlayerMentalFreshness === undefined
      ? []
      : [
          {
            label: `${event.eventId}.fatigueContext.primaryPlayerMentalFreshness`,
            value: event.fatigueContext.primaryPlayerMentalFreshness,
          },
        ]),
  ]);
  const reportChecks: readonly RatingCheck[] = [
    ...eventChecks,
    ...report.teamStats.flatMap((stats) =>
      stats.possessionShare === undefined ? [] : [{ label: `${stats.teamId}.teamStats.possessionShare`, value: stats.possessionShare }],
    ),
    ...report.playerStats.map((stats) => ({
      label: `${stats.playerId}.playerStats.contributionScore`,
      value: stats.contributionScore,
    })),
    ...report.evidenceFacts.map((fact) => ({
      label: `${fact.factId}.evidenceFacts.strength`,
      value: fact.strength,
    })),
    ...report.fatigueReport.teamSummaries.flatMap((summary) => [
      { label: `${summary.teamId}.fatigueReport.averageConditionEnd`, value: summary.averageConditionEnd },
      { label: `${summary.teamId}.fatigueReport.highIntensityLoad`, value: summary.highIntensityLoad },
    ]),
    ...report.fatigueReport.playerSummaries.flatMap((summary) => [
      { label: `${summary.playerId}.fatigueReport.conditionStart`, value: summary.conditionStart },
      { label: `${summary.playerId}.fatigueReport.conditionEnd`, value: summary.conditionEnd },
      { label: `${summary.playerId}.fatigueReport.mentalFreshnessEnd`, value: summary.mentalFreshnessEnd },
    ]),
  ];

  for (const check of reportChecks) {
    assertRating(check);
  }
}

function validateMatchReportMeta(report: MatchReport): void {
  assertGuard(report.reportMeta.generatorVersion.length > 0, "MatchReport.reportMeta.generatorVersion must be populated.");
  assertGuard(report.reportMeta.sourceOfTruthNote.length > 0, "MatchReport.reportMeta.sourceOfTruthNote must be populated.");
  assertGuard(report.reportMeta.limitations.length > 0, "MatchReport.reportMeta.limitations must document report limitations.");
}

export function validateEngineToCoachContractFixtures(): readonly string[] {
  const { matchInputFixture, matchReportFixture, matchSnapshotFixture } = engineToCoachPublicContractFixtures;

  validateTeamSnapshot(matchInputFixture.homeTeam);
  validateTeamSnapshot(matchInputFixture.awayTeam);
  validateMatchInputRatings(matchInputFixture);
  validateMatchReportReferences(matchReportFixture);
  validateMatchReportRatings(matchReportFixture);
  validateMatchReportMeta(matchReportFixture);

  assertGuard(
    matchSnapshotFixture.matchId === matchInputFixture.matchId,
    `MatchSnapshot ${matchSnapshotFixture.matchId} does not match MatchInput ${matchInputFixture.matchId}.`,
  );

  return [
    "goalkeeper, starter, and bench references resolve to roster players",
    "MatchEvent.matchId values match parent MatchReport.matchId",
    "CoachInsight evidence references timeline events",
    "KeyMoment references timeline events",
    "MatchReport evidenceFacts reference timeline events",
    "MatchReport warnings reference evidenceFacts and timeline events",
    "MatchReport reportMeta is populated",
    "contract fixture ratings stay within 0-100 bounds",
  ];
}

if (require.main === module) {
  const passedChecks = validateEngineToCoachContractFixtures();

  console.log("Engine-to-Coach contract guard passed.");
  for (const check of passedChecks) {
    console.log(`- ${check}`);
  }
}
```
