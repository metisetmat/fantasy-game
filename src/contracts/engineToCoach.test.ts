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
