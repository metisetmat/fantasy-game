import type { TeamId } from "../../core/ids";
import type { LiveScoringAction } from "./scoringEventTypes";

export type MatchBonusType =
  | "OFFENSIVE_3_PLUS_TRIES"
  | "OFFENSIVE_3_MAIN_SCORING_FAMILIES"
  | "DEFENSIVE_CLOSE_LOSS_WITHIN_7"
  | "DEFENSIVE_MAJOR_THREAT_SHUTDOWN";

export type MatchBonusCategory = "DEFENSIVE" | "OFFENSIVE";
export type MatchBonusRuleVersion = "MATCH_BONUS_V1";
export type LeagueResult = "DRAW" | "FORFEIT" | "LOSS" | "WIN";
export type BonusFlag = "NO" | "YES";

export interface MatchBonusSourceScoringAction {
  readonly id: string;
  readonly scoringAction: Exclude<LiveScoringAction, "NONE">;
  readonly teamId: TeamId;
  readonly active: boolean;
}

export interface MatchBonusInputTeamRow {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly style: string;
  readonly opponentStyle: string;
  readonly matchScoreFor: number;
  readonly matchScoreAgainst: number;
  readonly sourceScoringActionsFor: readonly MatchBonusSourceScoringAction[];
  readonly sourceScoringActionsAgainst: readonly MatchBonusSourceScoringAction[];
  readonly noTeamSet?: boolean;
  readonly forfeitApplied?: boolean;
}

export interface MatchBonusEvent {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly bonusType: MatchBonusType;
  readonly bonusCategory: MatchBonusCategory;
  readonly leaguePoints: number;
  readonly ruleVersion: MatchBonusRuleVersion;
  readonly triggerReason: string;
  readonly sourceScoringEvents: readonly string[];
  readonly computedAfterFinalWhistle: BonusFlag;
  readonly cappedByBonusLimit: BonusFlag;
  readonly active: BonusFlag;
}

export interface LeaguePointsSummary {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly style: string;
  readonly opponentStyle: string;
  readonly result: LeagueResult;
  readonly matchScoreFor: number;
  readonly matchScoreAgainst: number;
  readonly baseLeaguePoints: number;
  readonly rawBonusPoints: number;
  readonly cappedBonusPoints: number;
  readonly totalLeaguePoints: number;
  readonly bonusEvents: readonly MatchBonusEvent[];
  readonly forfeitApplied: BonusFlag;
  readonly noTeamSet: BonusFlag;
  readonly computedFromFinalScore: BonusFlag;
  readonly scoringFamiliesAchieved: readonly string[];
  readonly triesScored: number;
  readonly concededShotGoals: number;
  readonly concededTryTouchdowns: number;
  readonly closeLossMargin: number;
  readonly capApplied: BonusFlag;
}

export interface MatchBonusBatchSummary {
  readonly ruleVersion: MatchBonusRuleVersion;
  readonly bonusCap: number;
  readonly teamRowsChecked: number;
  readonly totalMatchBonusEvents: number;
  readonly activeMatchBonusEvents: number;
  readonly offensiveEventCount: number;
  readonly defensiveEventCount: number;
  readonly averageBonusPoints: number;
  readonly averageLeaguePoints: number;
  readonly maxRawBonusPoints: number;
  readonly maxCappedBonusPoints: number;
  readonly capActivationCount: number;
  readonly offensiveAndDefensiveSameMatchCount: number;
  readonly losingTeamsEarningBonusCount: number;
  readonly losingTeamEarnsMoreLeaguePointsThanWinnerCount: number;
  readonly forfeitRowsTested: number;
  readonly noTeamSetRowsTested: number;
  readonly scorelineMismatchCount: number;
  readonly staleMetricDetectionCount: number;
  readonly conversionExcludedFromFamilyBonus: BonusFlag;
  readonly summaries: readonly LeaguePointsSummary[];
  readonly events: readonly MatchBonusEvent[];
}

export type LeagueTableRowType = "STYLE" | "TEAM";
export type InstrumentationAvailability = "AVAILABLE" | "NOT_AVAILABLE";
export type FatigueMatchThird = "FINAL_THIRD" | "FIRST_THIRD" | "SECOND_THIRD";
export type InstrumentationValue = InstrumentationAvailability | number;
export type InstrumentationFlag = BonusFlag | InstrumentationAvailability;

export interface PlayerFatigueTimelineRow {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly playerId: string;
  readonly role: string;
  readonly styleId: string;
  readonly possessionIndex: number;
  readonly matchThird: FatigueMatchThird;
  readonly fatigueBeforePossession: number;
  readonly fatigueAfterPossession: number;
  readonly fatigueDelta: number;
  readonly actionLoadDelta: number;
  readonly recoveryDelta: number;
  readonly onField: BonusFlag;
  readonly bench: BonusFlag;
  readonly involvedInPossession: BonusFlag;
  readonly primaryActionType: string;
  readonly defensiveActionType: string;
  readonly highIntensityAction: BonusFlag;
  readonly contactAction: BonusFlag;
  readonly sprintAction: BonusFlag;
  readonly recoveryAction: BonusFlag;
  readonly scoringActionInvolved: BonusFlag;
  readonly concededScoringActionInvolved: BonusFlag;
}

export interface TeamFatigueTimelineRow {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly styleId: string;
  readonly possessionIndex: number;
  readonly matchThird: FatigueMatchThird;
  readonly averageTeamFatigue: number;
  readonly medianTeamFatigue: number;
  readonly maxPlayerFatigue: number;
  readonly minPlayerFatigue: number;
  readonly fatigueSpread: number;
  readonly highFatiguePlayerCount: number;
  readonly exhaustedPlayerCount: number;
  readonly averageOnFieldFatigue: number;
  readonly averageBenchFatigue: number;
  readonly teamFatigueDelta: number;
  readonly teamRecoveryDelta: number;
  readonly teamActionLoadDelta: number;
  readonly lateMatchFatigueIndex: InstrumentationValue;
  readonly fatigueCollapseFlag: BonusFlag;
}

export interface LeagueTableRow {
  readonly rowId: string;
  readonly rowType: LeagueTableRowType;
  readonly matchesPlayed: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly forfeits: number;
  readonly matchPointsFor: number;
  readonly matchPointsAgainst: number;
  readonly matchPointDifferential: number;
  readonly baseLeaguePoints: number;
  readonly offensiveBonusPoints: number;
  readonly defensiveBonusPoints: number;
  readonly cappedBonusPoints: number;
  readonly totalLeaguePoints: number;
  readonly bonusEventsCount: number;
  readonly capActivationCount: number;
  readonly forfeitsApplied: number;
  readonly rankingPosition: number;
  readonly tieBreakExplanation: string;
}

export interface BonusDistributionStyleRow {
  readonly styleId: string;
  readonly matches: number;
  readonly averageBaseLeaguePoints: number;
  readonly averageOffensiveBonusPoints: number;
  readonly averageDefensiveBonusPoints: number;
  readonly averageTotalLeaguePoints: number;
  readonly offensiveBonusRate: number;
  readonly defensiveBonusRate: number;
  readonly capActivationRate: number;
  readonly threePlusTriesBonusRate: number;
  readonly threeMainFamiliesBonusRate: number;
  readonly closeLossBonusRate: number;
  readonly majorThreatShutdownBonusRate: number;
  readonly winRate: number;
  readonly drawRate: number;
  readonly lossRate: number;
  readonly blowoutInvolvementRate: number;
  readonly closeGameInvolvementRate: number;
  readonly tacticalRead: string;
}

export interface FatigueTeamConstructionInstrumentationRow {
  readonly cohort: string;
  readonly averageTeamFatigueStart: InstrumentationValue;
  readonly averageTeamFatigueHalfTime: InstrumentationValue;
  readonly averageTeamFatigueFinal: InstrumentationValue;
  readonly maxPlayerFatigueFinal: InstrumentationValue;
  readonly fatigueDelta: InstrumentationValue;
  readonly lateMatchFatigueIndex: InstrumentationValue;
  readonly fatigueSpread: InstrumentationValue;
  readonly highIntensityActionLoad: InstrumentationValue;
  readonly contactLoad: InstrumentationValue;
  readonly sprintLoad: InstrumentationValue;
  readonly repeatedEffortLoad: InstrumentationValue;
  readonly benchDepthUsed: InstrumentationAvailability;
  readonly benchContributionScore: InstrumentationAvailability;
  readonly lateScoreFor: InstrumentationValue;
  readonly lateScoreAgainst: InstrumentationValue;
  readonly lateDefensiveStops: InstrumentationValue;
  readonly squadDepthScore: InstrumentationAvailability;
  readonly roleBalanceScore: InstrumentationAvailability;
  readonly tacticalCoherenceScore: InstrumentationAvailability;
  readonly missingDataSource: string;
  readonly recommendation: string;
}

export interface TeamMatchFatigueSummary {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly styleId: string;
  readonly averageTeamFatigueStart: InstrumentationValue;
  readonly averageTeamFatigueFirstThird: InstrumentationValue;
  readonly averageTeamFatigueSecondThird: InstrumentationValue;
  readonly averageTeamFatigueFinalThird: InstrumentationValue;
  readonly averageTeamFatigueFinal: InstrumentationValue;
  readonly maxPlayerFatigueFinal: InstrumentationValue;
  readonly minPlayerFatigueFinal: InstrumentationValue;
  readonly fatigueDeltaStartToFinal: InstrumentationValue;
  readonly fatigueDeltaSecondToFinalThird: InstrumentationValue;
  readonly fatigueSpreadFinal: InstrumentationValue;
  readonly fatigueVolatility: InstrumentationValue;
  readonly highFatiguePlayerCount: InstrumentationValue;
  readonly exhaustedPlayerCount: InstrumentationValue;
  readonly lateMatchFatigueIndex: InstrumentationValue;
  readonly fatigueResilienceScore: InstrumentationValue;
  readonly fatigueCollapseFlag: InstrumentationFlag;
  readonly missingSourceData: string;
}

export interface PlayerMatchLoadSummary {
  readonly matchId: string;
  readonly playerId: string;
  readonly teamId: TeamId;
  readonly role: string;
  readonly styleId: string;
  readonly minutesOrPossessionsPlayed: InstrumentationValue;
  readonly possessionsOnBench: InstrumentationValue;
  readonly startingFatigue: InstrumentationValue;
  readonly finalFatigue: InstrumentationValue;
  readonly fatigueDelta: InstrumentationValue;
  readonly averageFatigue: InstrumentationValue;
  readonly maxFatigue: InstrumentationValue;
  readonly finalThirdAverageFatigue: InstrumentationValue;
  readonly sprintLoad: InstrumentationValue;
  readonly highIntensityRunLoad: InstrumentationValue;
  readonly contactLoad: InstrumentationValue;
  readonly tackleLoad: InstrumentationValue;
  readonly carryLoad: InstrumentationValue;
  readonly shotLoad: InstrumentationValue;
  readonly tryAttemptLoad: InstrumentationValue;
  readonly dropAttemptLoad: InstrumentationValue;
  readonly defensiveRecoveryLoad: InstrumentationValue;
  readonly goalkeeperRecoveryLoad: InstrumentationValue;
  readonly reboundCrashLoad: InstrumentationValue;
  readonly repeatedEffortLoad: InstrumentationValue;
  readonly lateMatchActionLoad: InstrumentationValue;
  readonly performanceDropFlag: InstrumentationFlag;
  readonly overloadFlag: InstrumentationFlag;
  readonly fatigueContributionToFailedAction: InstrumentationAvailability;
  readonly injuryRiskProxy: InstrumentationValue;
  readonly missingSourceData: string;
}

export interface TeamLoadSummary {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly styleId: string;
  readonly totalSprintLoad: InstrumentationValue;
  readonly totalHighIntensityLoad: InstrumentationValue;
  readonly totalContactLoad: InstrumentationValue;
  readonly totalTackleLoad: InstrumentationValue;
  readonly totalCarryLoad: InstrumentationValue;
  readonly totalShotLoad: InstrumentationValue;
  readonly totalTryAttemptLoad: InstrumentationValue;
  readonly totalDropAttemptLoad: InstrumentationValue;
  readonly totalDefensiveRecoveryLoad: InstrumentationValue;
  readonly totalGoalkeeperLoad: InstrumentationValue;
  readonly totalRepeatedEffortLoad: InstrumentationValue;
  readonly offensiveLoad: InstrumentationValue;
  readonly defensiveLoad: InstrumentationValue;
  readonly goalkeeperLoad: InstrumentationValue;
  readonly roleLoadImbalance: InstrumentationValue;
  readonly overusedPlayerCount: InstrumentationValue;
  readonly underusedBenchCount: InstrumentationValue;
  readonly highFatiguePlayerCountFinal: InstrumentationValue;
  readonly exhaustedPlayerCountFinal: InstrumentationValue;
  readonly loadConcentrationIndex: InstrumentationValue;
  readonly topLoadedPlayerShare: InstrumentationValue;
  readonly lateLoadSpikeFlag: InstrumentationFlag;
  readonly missingSourceData: string;
}

export interface RosterQualitySummary {
  readonly rosterId: string;
  readonly teamId: TeamId;
  readonly styleId: string;
  readonly sourceStatus: "EXPLICIT_PLAYER_ROSTER" | "MISSING_PLAYER_SOURCE";
  readonly squadDepthScore: InstrumentationValue;
  readonly benchQualityScore: InstrumentationValue;
  readonly roleCoverageScore: InstrumentationValue;
  readonly offensiveRoleCoverageScore: InstrumentationValue;
  readonly defensiveRoleCoverageScore: InstrumentationValue;
  readonly goalkeeperQualityScore: InstrumentationValue;
  readonly goalkeeperMentalReliabilityScore: InstrumentationValue;
  readonly goalkeeperReboundControlScore: InstrumentationValue;
  readonly goalkeeperSecondSaveScore: InstrumentationValue;
  readonly goalkeeperCommunicationScore: InstrumentationValue;
  readonly goalkeeperPressureComposureScore: InstrumentationValue;
  readonly goalkeeperReadinessManagementScore: InstrumentationValue;
  readonly goalkeeperColdStartRisk: InstrumentationValue;
  readonly goalkeeperOverloadRisk: InstrumentationValue;
  readonly defensiveProtectionScore: InstrumentationValue;
  readonly goalkeeperExposureScore: InstrumentationValue;
  readonly reboundConcessionRisk: InstrumentationValue;
  readonly secondShotConcessionRisk: InstrumentationValue;
  readonly enduranceProfileScore: InstrumentationValue;
  readonly speedPowerBalanceScore: InstrumentationValue;
  readonly kickingQualityScore: InstrumentationValue;
  readonly dropThreatScore: InstrumentationValue;
  readonly conversionThreatScore: InstrumentationValue;
  readonly shotThreatScore: InstrumentationValue;
  readonly tryThreatScore: InstrumentationValue;
  readonly handlingQualityScore: InstrumentationValue;
  readonly ballSecurityScore: InstrumentationValue;
  readonly contactPowerScore: InstrumentationValue;
  readonly tacticalIntelligenceScore: InstrumentationValue;
  readonly decisionQualityScore: InstrumentationValue;
  readonly concentrationProfileScore: InstrumentationValue;
  readonly roleSpecializationBalance: InstrumentationValue;
  readonly specialistDependencyIndex: InstrumentationValue;
  readonly tacticalCoherenceScore: InstrumentationValue;
  readonly fatigueResiliencePotential: InstrumentationValue;
  readonly rosterWeaknessFlags: readonly string[];
  readonly rosterStrengthFlags: readonly string[];
  readonly coachFacingSummary: string;
  readonly recommendedImprovement: string;
  readonly missingSourceData: string;
}

export interface LateMatchPerformanceSummary {
  readonly matchId: string;
  readonly teamId: TeamId;
  readonly styleId: string;
  readonly lateMatchWindow: string;
  readonly lateMatchScoreFor: InstrumentationValue;
  readonly lateMatchScoreAgainst: InstrumentationValue;
  readonly lateMatchPointDifferential: InstrumentationValue;
  readonly lateMatchScoringEventsFor: InstrumentationValue;
  readonly lateMatchScoringEventsAgainst: InstrumentationValue;
  readonly lateMatchRouteDiversity: InstrumentationValue;
  readonly lateMatchTryAttemptsFor: InstrumentationValue;
  readonly lateMatchTrySuccessFor: InstrumentationValue;
  readonly lateMatchShotAttemptsFor: InstrumentationValue;
  readonly lateMatchShotGoalsFor: InstrumentationValue;
  readonly lateMatchDropAttemptsFor: InstrumentationValue;
  readonly lateMatchDropGoalsFor: InstrumentationValue;
  readonly lateMatchConcededShotGoals: InstrumentationValue;
  readonly lateMatchConcededTries: InstrumentationValue;
  readonly lateMatchConcededDrops: InstrumentationValue;
  readonly lateMatchDefensiveStops: InstrumentationValue;
  readonly lateMatchTurnoversWon: InstrumentationValue;
  readonly lateMatchTurnoversConceded: InstrumentationValue;
  readonly lateMatchDangerPhasesFor: InstrumentationValue;
  readonly lateMatchDangerPhasesAgainst: InstrumentationValue;
  readonly lateMatchFatigueIndex: InstrumentationValue;
  readonly lateCollapseFlag: InstrumentationFlag;
  readonly lateSurgeFlag: InstrumentationFlag;
  readonly lateControlFlag: InstrumentationFlag;
  readonly missingSourceData: string;
}

export interface LeagueTableIntegrationSummary {
  readonly playerFatigueTimelineRows: readonly PlayerFatigueTimelineRow[];
  readonly teamFatigueTimelineRows: readonly TeamFatigueTimelineRow[];
  readonly leagueTableByTeam: readonly LeagueTableRow[];
  readonly leagueTableByStyle: readonly LeagueTableRow[];
  readonly bonusDistributionByStyle: readonly BonusDistributionStyleRow[];
  readonly fatigueInstrumentationRows: readonly FatigueTeamConstructionInstrumentationRow[];
  readonly teamMatchFatigueSummaries: readonly TeamMatchFatigueSummary[];
  readonly playerMatchLoadSummaries: readonly PlayerMatchLoadSummary[];
  readonly teamLoadSummaries: readonly TeamLoadSummary[];
  readonly rosterQualitySummaries: readonly RosterQualitySummary[];
  readonly lateMatchPerformanceSummaries: readonly LateMatchPerformanceSummary[];
  readonly lateMatchWindow: string;
  readonly sumMatchLeaguePoints: number;
  readonly sumTeamTableLeaguePoints: number;
  readonly matchPointsEqualTablePoints: BonusFlag;
  readonly everyBonusEventAttached: BonusFlag;
  readonly everyBonusEventInLeaguePointsSummary: BonusFlag;
  readonly uncappedBonusLeakCount: number;
  readonly forfeitBonusLeakCount: number;
  readonly scorelineMismatchCount: number;
  readonly tieCases: number;
  readonly rankingTieBreakExplanations: readonly string[];
  readonly fatigueInstrumentationAvailable: BonusFlag;
  readonly teamConstructionInstrumentationAvailable: BonusFlag;
  readonly recommendations: readonly string[];
}
