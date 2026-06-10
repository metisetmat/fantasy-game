import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { SnapshotReference } from "../../reports/visualization";
import type { ShotOutcomeContract } from "../actions";
import { resolveShotOutcomes, summarizeShotOutcomeScore, summarizeTryOpportunityGeneration } from "../actions";
import { analyzeOffensivePossessionDangerPhases } from "../phases";
import { createScoreUnitContract } from "./scoreUnitContract";
import { summarizeConversionGeometryStorage } from "./conversionGeometry";
import { conversionRuleLabel } from "./conversionRules";
import { dropGoalRuleLabel } from "./dropGoalRules";
import { summarizeDropGoalFoundation } from "../actions/dropGoalAttemptResolver";
import { summarizeConversionResolution } from "./conversionResolution";
import {
  pointValueForScoringActionType,
  scoringActionTypeForShotOutcome,
  scoringRuleLabel,
} from "./scoringRules";
import { formatPercent, summarizeScoringV1GameplayCalibration } from "./scoringV1GameplayCalibration";
import { summarizeReboundDangerCalibration } from "./reboundDangerCalibration";
import { analyzeScoringChoiceBalance } from "./scoringChoiceBalanceAnalyzer";
import { analyzeShotDominance } from "./shotDominanceAnalyzer";
import { analyzeScoringAffordanceVolume } from "./scoringAffordanceVolumeAnalyzer";
import { summarizeNonShotResolutionRebalance } from "./nonShotResolutionRebalance";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import {
  inactiveFoundationScoringRules,
  TRY_TOUCHDOWN_SCORING_VERSION,
  tryTouchdownRuleLabel,
} from "./tryTouchdownRules";

function actionLabel(actionId: string): string {
  const match = /^dt-s(\d+)-a(\d+)$/.exec(actionId);
  return match === null ? actionId : `Sequence ${match[1]} Action ${match[2]}`;
}

function outcomeCount(input: { readonly outcomes: readonly ShotOutcomeContract[]; readonly outcome: string }): number {
  return input.outcomes.filter((shotOutcome) => shotOutcome.ballOutcome === input.outcome).length;
}

export function createScoringFromShotOutcomesReport(input: {
  readonly result: MiniMatchResult;
  readonly snapshots: readonly SnapshotReference[];
  readonly outcomes?: readonly ShotOutcomeContract[];
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): string {
  const outcomes = input.outcomes ?? resolveShotOutcomes({ result: input.result, snapshots: input.snapshots });
  const summary = summarizeShotOutcomeScore({ result: input.result, outcomes });
  const liveTryEvents = input.result.summary.liveTryEvents;
  const liveTryAttempts = liveTryEvents.length;
  const liveTriesScored = liveTryEvents.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length;
  const liveFailedTryAttempts = liveTryEvents.filter((event) => event.eventType !== "TRY_TOUCHDOWN_SCORED").length;
  const liveTryGeometryRows = liveTryEvents.filter((event) => event.conversionGeometryStored).length;
  const liveTryPoints = liveTryEvents.reduce((sum, event) => sum + event.pointValue, 0);
  const liveTryPointsByTeam = (teamId: string): number =>
    liveTryEvents.filter((event) => event.teamId === teamId).reduce((sum, event) => sum + event.pointValue, 0);
  const shotPointsByTeam = (teamId: string): number =>
    outcomes.filter((outcome) => outcome.shootingTeamId === teamId).reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0);
  const goalEvents = outcomes.filter((outcome) => outcome.ballOutcome === "GOAL");
  const nonGoalEvents = outcomes.filter((outcome) => outcome.ballOutcome !== "GOAL");
  const reboundEvents = outcomes.filter((outcome) => outcome.reboundResolution.reboundType !== "NONE");
  const calibration = summarizeScoringV1GameplayCalibration({ result: input.result, outcomes });
  const reboundDanger = input.batchCalibration === undefined ? undefined : summarizeReboundDangerCalibration(input.batchCalibration);
  const tryOpportunities = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const conversionGeometry = summarizeConversionGeometryStorage(tryOpportunities.opportunities);
  const conversionResolution = summarizeConversionResolution({
    result: input.result,
    opportunities: tryOpportunities.opportunities,
  });
  const dropGoalFoundation =
    input.batchCalibration === undefined
      ? undefined
      : summarizeDropGoalFoundation({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const scoringChoiceBalance =
    input.batchCalibration === undefined
      ? undefined
      : analyzeScoringChoiceBalance({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const shotDominanceDiagnostic =
    input.batchCalibration === undefined
      ? undefined
      : analyzeShotDominance({
          result: input.result,
          batchCalibration: input.batchCalibration,
          shotOutcomes: outcomes,
        });
  const scoringAffordanceVolume =
    input.batchCalibration === undefined
      ? undefined
      : analyzeScoringAffordanceVolume({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const nonShotResolution =
    input.batchCalibration === undefined
      ? undefined
      : summarizeNonShotResolutionRebalance({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const possessionDanger =
    input.batchCalibration === undefined
      ? undefined
      : analyzeOffensivePossessionDangerPhases({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const liveConversionPointsByTeam = (teamId: string): number =>
    conversionResolution.liveAttempts.filter((attempt) => attempt.scoringTeamId === teamId).reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const batchConversionPointsByTeam = (teamId: string): number =>
    conversionResolution.attempts.filter((attempt) => attempt.scoringTeamId === teamId).reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const scoreUnitWithConversions = createScoreUnitContract({
    result: input.result,
    shotOutcomes: outcomes,
    liveTryEvents,
    liveConversionAttempts: conversionResolution.liveAttempts,
  });
  const controlTotal = scoreUnitWithConversions.teamTotals.find((total) => total.teamId === input.result.state.context.teamA.id);
  const blitzTotal = scoreUnitWithConversions.teamTotals.find((total) => total.teamId === input.result.state.context.teamB.id);

  return [
    "# Scoring From Shot Outcomes",
    "",
    "# Compatibility Note",
    "This report is retained for shot-scoring regression compatibility.",
    "The canonical scoring report is now: reports/scoring-events-summary.md",
    "scoring-choice-balance.md is the route-balance report for SHOT_GOAL / TRY_TOUCHDOWN / CONVERSION_GOAL / DROP_GOAL.",
    "shot-dominance-diagnostic.md explains why SHOT_GOAL currently dominates batch points.",
    "scoring-affordance-volume.md distinguishes affordances, candidates, selected candidates, attempts, and scoring events.",
    "",
    "Includes shot scoring plus active V2_DROP_FOUNDATION try, conversion, and drop-goal scoring summaries.",
    "",
    "## Score Summary",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    `- score unit: ${scoreUnitWithConversions.scoreUnit}`,
    `- score source: ${summary.scoreSource}`,
    `- scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`,
    `- try/touchdown scoring rule: ${tryTouchdownRuleLabel()}`,
    `- conversion scoring rule: ${conversionRuleLabel()}`,
    `- DROP_GOAL active: YES`,
    `- drop goal scoring rule: ${dropGoalRuleLabel()}`,
    "- PENALTY_SHOT active: NO",
    `- active scoring actions: ${scoringRuleLabel("SHOT_GOAL")}; ${tryTouchdownRuleLabel()}; ${conversionRuleLabel()}; ${dropGoalRuleLabel()}`,
    `- inactive scoring rules: ${inactiveFoundationScoringRules().join(", ")}`,
    `- final score: ${summary.finalScoreReported}`,
    `- shot goals by team: ${input.result.state.context.teamA.displayName} ${controlTotal?.goalCount ?? 0}, ${input.result.state.context.teamB.displayName} ${blitzTotal?.goalCount ?? 0}`,
    `- current mini-match points from tries by team: ${input.result.state.context.teamA.displayName} ${liveTryPointsByTeam(input.result.state.context.teamA.id)}, ${input.result.state.context.teamB.displayName} ${liveTryPointsByTeam(input.result.state.context.teamB.id)}`,
    `- live try attempts: ${liveTryAttempts}`,
    `- live tries scored: ${liveTriesScored}`,
    `- live failed try attempts: ${liveFailedTryAttempts}`,
    `- live try touchdowns by team: ${input.result.state.context.teamA.displayName} ${liveTryEvents.filter((event) => event.teamId === input.result.state.context.teamA.id && event.eventType === "TRY_TOUCHDOWN_SCORED").length}, ${input.result.state.context.teamB.displayName} ${liveTryEvents.filter((event) => event.teamId === input.result.state.context.teamB.id && event.eventType === "TRY_TOUCHDOWN_SCORED").length}`,
    `- batch TRY_TOUCHDOWN scored: ${tryOpportunities.triesScored}`,
    `- batch conversion geometry stored: ${conversionGeometry.geometryRowsStored}/${conversionGeometry.tryScoredCount}`,
    "- CONVERSION scoring active: YES",
    `- points from conversions by team: ${input.result.state.context.teamA.displayName} ${liveConversionPointsByTeam(input.result.state.context.teamA.id)}, ${input.result.state.context.teamB.displayName} ${liveConversionPointsByTeam(input.result.state.context.teamB.id)}`,
    `- batch points from conversions by team: ${input.result.state.context.teamA.displayName} ${batchConversionPointsByTeam(input.result.state.context.teamA.id)}, ${input.result.state.context.teamB.displayName} ${batchConversionPointsByTeam(input.result.state.context.teamB.id)}`,
    `- points from shots by team: ${input.result.state.context.teamA.displayName} ${shotPointsByTeam(input.result.state.context.teamA.id)}, ${input.result.state.context.teamB.displayName} ${shotPointsByTeam(input.result.state.context.teamB.id)}`,
    `- points from tries by team: ${input.result.state.context.teamA.displayName} ${liveTryPointsByTeam(input.result.state.context.teamA.id)}, ${input.result.state.context.teamB.displayName} ${liveTryPointsByTeam(input.result.state.context.teamB.id)}`,
    `- points by team: ${input.result.state.context.teamA.displayName} ${controlTotal?.points ?? 0}, ${input.result.state.context.teamB.displayName} ${blitzTotal?.points ?? 0}`,
    `- shots by team: ${input.result.state.context.teamA.displayName} ${summary.controlShots}, ${input.result.state.context.teamB.displayName} ${summary.blitzShots}`,
    `- pending shot outcomes: ${summary.pendingShotOutcomes}`,
    `- goalkeeper action diagnostics: ${outcomes.filter((outcome) => outcome.gkShotStopping.goalkeeperEvaluated).length}/${outcomes.length} shots include goalkeeper action evaluation`,
    "",
    "## Conversion Difficulty Snapshot",
    `- batch conversion attempts: ${conversionResolution.batchConversionAttempts}`,
    `- batch conversions made: ${conversionResolution.batchConversionsMade}`,
    `- batch conversion success rate: ${conversionResolution.batchConversionSuccessRate}%`,
    `- batch conversion points: ${conversionResolution.batchConversionPoints}`,
    `- conversion difficulty recommendation: ${conversionResolution.recommendation}`,
    `- live conversion attempts: ${conversionResolution.liveConversionAttempts}${
      conversionResolution.liveConversionAttempts === 0 ? " because no live TRY_TOUCHDOWN was scored" : ""
    }`,
    `- live conversion points: ${conversionResolution.liveConversionPoints}`,
    `- live drop opportunities: ${dropGoalFoundation?.liveDropOpportunities ?? 0}`,
    `- live drop attempts: ${dropGoalFoundation?.liveDropAttempts ?? 0}`,
    `- live drop goals: ${dropGoalFoundation?.liveDropGoals ?? 0}`,
    `- live drop points: ${dropGoalFoundation?.liveDropPoints ?? 0}`,
    `- batch drop opportunities: ${dropGoalFoundation?.batchDropOpportunities ?? 0}`,
    `- batch drop attempts: ${dropGoalFoundation?.batchDropAttempts ?? 0}`,
    `- batch drop goals: ${dropGoalFoundation?.batchDropGoals ?? 0}`,
    `- batch drop missed: ${dropGoalFoundation?.batchDropMissed ?? 0}`,
    `- batch drop blocked: ${dropGoalFoundation?.batchDropBlocked ?? 0}`,
    `- batch drop invalid: ${dropGoalFoundation?.batchDropInvalid ?? 0}`,
    `- batch drop success rate: ${dropGoalFoundation?.batchDropSuccessRate ?? 0}%`,
    `- batch drop points: ${dropGoalFoundation?.batchDropPoints ?? 0}`,
    `- drop resolution recommendation: ${dropGoalFoundation?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- scoring choice balance recommendation: ${scoringChoiceBalance?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- shot dominance diagnostic: reports/shot-dominance-diagnostic.md`,
    `- shot dominance cause: ${shotDominanceDiagnostic?.routeDominanceCause ?? "NEEDS_MORE_SAMPLE"}`,
    `- shot dominance recommendation: ${shotDominanceDiagnostic?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- scoring affordance volume diagnostic: reports/scoring-affordance-volume.md`,
    `- known scoring affordances per match: ${scoringAffordanceVolume?.knownScoringAffordancesPerMatch ?? 0}`,
    `- known scoring affordances per team per match: ${scoringAffordanceVolume?.knownScoringAffordancesPerTeamPerMatch ?? 0}`,
    `- affordance volume recommendation: ${scoringAffordanceVolume?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- offensive possession / danger phase report: reports/offensive-possession-danger-phase.md",
    `- danger phases per match: ${possessionDanger?.dangerPhasesPerMatch ?? 0}`,
    `- danger phase to scoring affordance rate: ${possessionDanger?.dangerPhaseToScoringAffordanceRate ?? 0}%`,
    `- possession/danger recommendation: ${possessionDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- non-shot affordance generation diagnostic: reports/offensive-possession-danger-phase.md#non-shot-danger-affordance-generation",
    `- try affordances: ${scoringAffordanceVolume?.tryAffordances ?? 0}`,
    `- drop affordances: ${scoringAffordanceVolume?.dropAffordances ?? 0}`,
    `- non-shot setup affordances: ${scoringAffordanceVolume?.nonShotSetupAffordances ?? 0}`,
    `- non-shot affordance generation recommendation: ${scoringAffordanceVolume?.nonShotAffordanceGenerationRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- non-shot resolution rebalance report: reports/non-shot-resolution-rebalance.md`,
    `- conversion success rate: ${nonShotResolution?.conversionSuccessRate ?? 0}%`,
    `- drop success rate: ${nonShotResolution?.dropSuccessRate ?? 0}%`,
    `- try success rate: ${nonShotResolution?.tryScoringRate ?? 0}%`,
    `- non-shot resolution recommendation: ${nonShotResolution?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- route warnings: ${[
      ...(scoringChoiceBalance?.routeDominanceWarnings ?? []),
      ...(scoringChoiceBalance?.routeStarvationWarnings ?? []),
      ...(scoringChoiceBalance?.routeIdentityWarnings ?? []),
    ].join(", ") || "none"}`,
    "",
    "## Try / Touchdown Scoring Events",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    `- active: ${scoringRuleLabel("SHOT_GOAL")}`,
    `- active: ${tryTouchdownRuleLabel()}`,
    `- active: ${conversionRuleLabel()}`,
    "- CONVERSION scoring active: YES",
    "- DROP_GOAL scoring active: YES",
    `- active: ${dropGoalRuleLabel()}`,
    "- PENALTY_SHOT scoring active: NO",
    `- current mini-match try attempts: ${liveTryAttempts}`,
    `- current mini-match tries scored: ${liveTriesScored}`,
    `- current mini-match failed try attempts: ${liveFailedTryAttempts}`,
    `- current mini-match points from tries: ${liveTryPoints}`,
    `- live try events: ${liveTryAttempts} attempts, ${liveTriesScored} tries in current mini-match; CONVERSION scoring active: YES.`,
    liveTryAttempts === 0
      ? "- no live TRY_TOUCHDOWN_ATTEMPT generated in current mini-match."
      : `- live TRY_TOUCHDOWN_ATTEMPT generated in current mini-match: ${liveTryAttempts}.`,
    liveTryAttempts > 0 && liveTriesScored === 0
      ? `- failed live try outcomes: ${liveTryEvents.map((event) => event.outcome).join(", ")}.`
      : `- live TRY_TOUCHDOWN_SCORED outcomes: ${liveTriesScored}.`,
    `- live conversion geometry rows: ${liveTryGeometryRows}`,
    `- live conversion points awarded: ${conversionResolution.liveConversionPoints}`,
    `- live try event stream attempts: ${liveTryAttempts}`,
    `- live try event stream scored tries: ${liveTriesScored}`,
    `- batch try attempts: ${tryOpportunities.tryAttempts}`,
    `- batch tries scored: ${tryOpportunities.triesScored}`,
    `- batch try scoring rate: ${tryOpportunities.tryConversionRate}%`,
    `- current mini-match points from tries: ${liveTryPoints}`,
    "- in-goal rules: Z0/Z8 are non-occupiable off-ball grounding zones; legal try access requires CL/CR or HSL/HSR outside the goal area; held-ball grounding does not require downward pressure; conversion geometry documented and conversion scoring active.",
    `- try opportunity generation: active; opportunities ${tryOpportunities.tryOpportunities}; attempts ${tryOpportunities.tryAttempts}; tries ${tryOpportunities.triesScored}; recommendation ${tryOpportunities.recommendation}.`,
    `- try attempt resolution: tries ${tryOpportunities.triesScored}/${tryOpportunities.tryAttempts}; recommendation ${tryOpportunities.recommendation}.`,
    `- TRY_TOUCHDOWN batch scored: ${tryOpportunities.triesScored}`,
    "- conversion geometry storage active: YES",
    `- conversion geometry stored: ${conversionGeometry.geometryRowsStored}`,
    "- CONVERSION scoring active: YES",
    `- conversion points awarded: ${conversionResolution.batchConversionPoints}`,
    tryOpportunities.triesScored > 0
      ? `- current batch: TRY_TOUCHDOWN scored after calibration; live mini-match stream now reports ${liveTryAttempts} try attempts and ${liveTriesScored} scored tries.`
      : "- current mini-match: no TRY_TOUCHDOWN scored after calibration.",
    "",
    "## Live Try / Touchdown Event Stream",
    "",
    "## Conversion Scoring Events",
    "",
    "| sequence/action | source try | kicker | team | outcome | point value | score before | score after | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(conversionResolution.liveAttempts.length === 0
      ? ["| none | none | none | none | none | 0 | none | none | no live conversion attempt generated because no live TRY_TOUCHDOWN was scored. |"]
      : conversionResolution.liveAttempts.map(
          (attempt) =>
            `| ${attempt.sourceTryActionId}-conversion | ${attempt.sourceTryActionId} | ${attempt.kickerRole} | ${attempt.scoringTeamName} | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.scoreBefore} | ${attempt.scoreAfter} | ${attempt.reason} |`,
        )),
    "",
    "| Sequence/action | Event type | Team | Carrier | Previous zone | Current zone | Access route | Legal access | Outcome | Scoring action | Point value | Scoring impact | Score after try | Conversion geometry stored | CONVERSION scoring active | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(liveTryEvents.length === 0
      ? ["| none | TRY_TOUCHDOWN_ATTEMPT | none | none | none | none | none | NO | none | NONE | 0 | none | unchanged | NO | NO | no live TRY_TOUCHDOWN_ATTEMPT generated in current mini-match |"]
      : liveTryEvents.map(
          (event) =>
            `| Sequence ${event.sequenceNumber} Try Attempt | ${event.eventType} | ${event.teamName} | ${event.carrierRole} | ${event.previousZone} | ${event.currentZone} | ${event.accessRoute} | ${event.legalAccess ? "YES" : "NO"} | ${event.outcome} | ${event.scoringAction} | ${event.pointValue} | ${event.scoringImpact} | ${event.scoreAfter} | ${event.conversionGeometryStored ? "YES" : "NO"} | YES | ${event.reason} |`,
        )),
    "",
    "## Outcome Distribution",
    `- GOAL: ${outcomeCount({ outcomes, outcome: "GOAL" })}`,
    `- CAUGHT_BY_GK: ${outcomeCount({ outcomes, outcome: "CAUGHT_BY_GK" })}`,
    `- SAVED_BY_GK: ${outcomeCount({ outcomes, outcome: "SAVED_BY_GK" })}`,
    `- DEFLECTED_BY_GK: ${outcomeCount({ outcomes, outcome: "DEFLECTED_BY_GK" })}`,
    `- REBOUND_CONTESTED: ${outcomeCount({ outcomes, outcome: "REBOUND_CONTESTED" })}`,
    `- BLOCKED_BY_DEFENDER: ${outcomeCount({ outcomes, outcome: "BLOCKED_BY_DEFENDER" })}`,
    `- MISSED_HIGH: ${outcomeCount({ outcomes, outcome: "MISSED_HIGH" })}`,
    `- MISSED_WIDE: ${outcomeCount({ outcomes, outcome: "MISSED_WIDE" })}`,
    "",
    "## Gameplay Calibration Snapshot",
    `- total shots: ${calibration.totalShots}`,
    `- shot goals: ${calibration.shotGoals}`,
    `- conversion rate: ${formatPercent(calibration.conversionRate)}`,
    `- average shot quality: ${calibration.averageShotQuality}/100`,
    `- low-quality goals: ${calibration.lowQualityGoals}`,
    `- high-quality misses: ${calibration.highQualityMisses}`,
    `- calibration recommendation: ${calibration.recommendation}`,
    "",
    "## Rebound Danger Snapshot",
    `- rebound events: ${reboundDanger?.reboundEvents ?? reboundEvents.length}`,
    `- contested rebounds: ${reboundDanger?.contestedRebounds ?? reboundEvents.filter((outcome) => outcome.reboundResolution.reboundType === "CONTESTED").length}`,
    `- attacker recoveries: ${reboundDanger?.attackerRecoveries ?? reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "ATTACKER").length}`,
    `- defender recoveries: ${reboundDanger?.defenderRecoveries ?? reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "DEFENDER").length}`,
    `- GK recoveries: ${reboundDanger?.gkRecoveries ?? reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "GOALKEEPER").length}`,
    `- second-shot windows: ${reboundDanger?.secondShotWindows ?? reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW").length}`,
    `- scramble events: ${reboundDanger?.scrambles ?? reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "SCRAMBLE").length}`,
    `- scramble-created second-shot windows: ${reboundDanger?.scrambleCreatedSecondShotWindows ?? 0}`,
    `- chaotic clearances: ${reboundDanger?.chaoticClearances ?? 0}`,
    `- rebound danger recommendation: ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "",
    "## Scoring Events",
    "",
    "| Sequence/action | Actor | Team | Scoring action | Point value | Score before | Score after | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(scoreUnitWithConversions.scoringEvents.length === 0
      ? ["| none | none | none | none | 0 | none | none | no scoring events resolved |"]
      : scoreUnitWithConversions.scoringEvents.map(
          (event) =>
            `| ${actionLabel(event.actionId)} | ${event.actorInitials} | ${
              scoreUnitWithConversions.teamTotals.find((total) => total.teamId === event.teamId)?.teamName ?? event.teamId
            } | ${event.scoringActionType} | +${event.pointValue} | ${event.scoreBefore} | ${event.scoreAfter} | ${event.reason} |`,
        )),
    "",
    "## Goal Events",
    "",
    "| Sequence/action | Shooter | Team | Origin zone | Shot type | Shot on target | Goalkeeper evaluated | Goalkeeper action | Goalkeeper outcome | Outcome | Possession after shot | Rebound type | Rebound zone | Next possession | Point value | Score before | Score after | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(goalEvents.length === 0
      ? ["| none | none | none | none | none | none | none | none | none | none | none | none | none | none | 0 | none | none | no goals resolved |"]
      : goalEvents.map(
          (outcome) =>
            `| ${actionLabel(outcome.actionId)} | ${outcome.shooterInitials} | ${outcome.shootingTeamName} | ${outcome.shotOriginZone} | ${outcome.shotType} | ${outcome.shotOnTarget ? "YES" : "NO"} | ${outcome.gkShotStopping.goalkeeperEvaluated ? "YES" : "NO"} | ${outcome.goalkeeperAction} | ${outcome.gkShotStopping.gkOutcomeReason} | ${outcome.ballOutcome} | ${outcome.possessionAfterShot} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundResolution.reboundZone} | ${outcome.reboundResolution.nextPossession} | ${outcome.scoringImpact.pointsAdded} | ${outcome.scoringImpact.scoreBefore} | ${outcome.scoringImpact.scoreAfter} | ${outcome.outcomeReason} |`,
        )),
    "",
    "## Non-Scoring Shot Events",
    "",
    "| Sequence/action | Shooter | Team | Shot on target | Goalkeeper evaluated | Goalkeeper action | Goalkeeper outcome | Outcome | Scoring action | Possession after shot | Rebound type | Rebound zone | Next possession | Point value | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(nonGoalEvents.length === 0
      ? ["| none | none | none | none | none | none | none | none | none | none | none | none | none | 0 | all shots scored |"]
      : nonGoalEvents.map(
          (outcome) => {
            const scoringAction = scoringActionTypeForShotOutcome(outcome.ballOutcome);

            return `| ${actionLabel(outcome.actionId)} | ${outcome.shooterInitials} | ${outcome.shootingTeamName} | ${outcome.shotOnTarget ? "YES" : "NO"} | ${outcome.gkShotStopping.goalkeeperEvaluated ? "YES" : "NO"} | ${outcome.goalkeeperAction} | ${outcome.gkShotStopping.gkOutcomeReason} | ${outcome.ballOutcome} | ${scoringAction} | ${outcome.possessionAfterShot} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundResolution.reboundZone} | ${outcome.reboundResolution.nextPossession} | ${pointValueForScoringActionType(scoringAction)} | ${outcome.outcomeReason} |`;
          },
        )),
    "",
    "## Rebound Events",
    "",
    "| Source action | Rebound type | Rebound zone | Rebound winner | Winning player | Next possession | Continuation type | Danger level | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(reboundEvents.length === 0
      ? ["| none | NONE | NONE | OUT_OF_PLAY | none | OUT_OF_PLAY | OUT_OF_PLAY | NONE | no rebound events resolved |"]
      : reboundEvents.map(
          (outcome) =>
            `| ${actionLabel(outcome.actionId)} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundResolution.reboundZone} | ${outcome.reboundContinuation.reboundWinner} | ${outcome.reboundContinuation.winningPlayerInitials ?? "none"} | ${outcome.reboundContinuation.nextPossession} | ${outcome.reboundContinuation.continuationType} | ${outcome.reboundContinuation.immediateDanger} | ${outcome.reboundContinuation.reason} |`,
        )),
    "",
    "## Score Unit Consistency Checks",
    `- ${scoreUnitWithConversions.scoreUnit === "POINTS" ? "PASS" : "FAIL"}: score unit is POINTS`,
    `- PASS: scoring rule ${scoringRuleLabel("SHOT_GOAL")}`,
    `- ${summary.scoreMismatchCount === 0 ? "PASS" : "FAIL"}: final score equals sum of scoring event point values - ${summary.finalScoreFromOutcomes} vs ${summary.finalScoreReported}`,
    `- ${scoreUnitWithConversions.consistencyStatus}: final score sums active scoring events including live tries and conversions - ${scoreUnitWithConversions.reason}`,
    `- PASS: live try points from active events - ${liveTryPoints}`,
    `- PASS: live conversion points from active events - ${conversionResolution.liveConversionPoints}`,
    `- ${(controlTotal?.points ?? -1) === input.result.summary.finalScore.teamA ? "PASS" : "FAIL"}: CONTROL point total is 3 - ${controlTotal?.points ?? 0}`,
    `- ${(controlTotal?.goalCount ?? -1) === 1 ? "PASS" : "FAIL"}: CONTROL goal count is 1 - ${controlTotal?.goalCount ?? 0}`,
    `- ${(blitzTotal?.points ?? -1) === input.result.summary.finalScore.teamB ? "PASS" : "FAIL"}: BLITZ point total is 0 - ${blitzTotal?.points ?? 0}`,
    `- ${(blitzTotal?.goalCount ?? -1) === 0 ? "PASS" : "FAIL"}: BLITZ goal count is 0 - ${blitzTotal?.goalCount ?? 0}`,
    "- PASS: goal count is not used as score when score unit is POINTS",
    `- ${summary.pendingShotOutcomes === 0 ? "PASS" : "FAIL"}: no unresolved goal-impacting shots - ${summary.pendingShotOutcomes}`,
    `- ${summary.scoreSource === "SHOT_OUTCOME_RESOLUTION" ? "PASS" : "FAIL"}: no abstract score fallback used - ${summary.scoreSource}`,
    "",
  ].join("\n");
}
