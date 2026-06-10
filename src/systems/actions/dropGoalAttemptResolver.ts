import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalOpportunities } from "./dropGoalOpportunityDetector";
import type { DropGoalOpportunityRecord } from "./dropGoalOpportunityTypes";
import { resolveDropGoalLegality } from "../rules/dropGoalLegalityRules";
import { DROP_GOAL_POINT_VALUE, pointValueForDropGoalOutcome } from "../scoring/dropGoalRules";
import type { BatchScoringCalibrationSummary } from "../scoring/batchScoringCalibrationTypes";
import type { DropGoalAttemptContext, DropGoalAttemptResult, DropGoalFoundationSummary, DropGoalOutcome } from "../scoring/dropGoalTypes";

function scoreBeforeForResult(result: MiniMatchResult): string {
  return `CONTROL ${result.summary.finalScore.teamA} - ${result.summary.finalScore.teamB} BLITZ`;
}

function scoreAfter(input: { readonly scoreBefore: string; readonly teamId: string; readonly points: number }): string {
  const match = /CONTROL (\d+) - (\d+) BLITZ/.exec(input.scoreBefore);
  const control = Number.parseInt(match?.[1] ?? "0", 10) + (input.teamId === "control" || input.teamId === "CONTROL" ? input.points : 0);
  const blitz = Number.parseInt(match?.[2] ?? "0", 10) + (input.teamId === "blitz" || input.teamId === "BLITZ" ? input.points : 0);

  return `CONTROL ${control} - ${blitz} BLITZ`;
}

function pressurePenalty(pressureLevel: string): number {
  if (pressureLevel === "HIGH") {
    return 6;
  }

  if (pressureLevel === "MEDIUM") {
    return 3;
  }

  return 0;
}

function pressureThresholdBump(pressureLevel: string): number {
  if (pressureLevel === "HIGH") {
    return 5;
  }

  if (pressureLevel === "MEDIUM") {
    return 2;
  }

  return 0;
}

function dropExecutionScore(context: DropGoalAttemptContext): number {
  const centralLaneBonus = context.ballLane === "C" ? 6 : 0;
  const centralModerateDistanceBonus = context.ballLane === "C" && context.distanceToPosts <= 28 ? 2 : 0;
  const distancePenalty = Math.max(0, context.distanceToPosts - 23) * 0.45;
  const anglePenalty = context.angleDifficulty * 0.14;
  const defenderRushPenalty = Math.max(0, context.defenderRushPressure - 50) * 0.18;
  const blockPenalty = Math.max(0, context.blockPressure - 44) * 0.14;
  const transitionPenalty = context.phase === "offensive_transition" ? 1.5 : 0;
  const score =
    context.footSkill * 0.25 +
    context.kickingAccuracy * 0.25 +
    context.kickingPower * 0.15 +
    context.kickingComposure * 0.2 +
    context.bodyShapeScore * 0.1 +
    context.dropSetupScore * 0.1 +
    context.timeWindowScore * 0.08 +
    centralLaneBonus +
    centralModerateDistanceBonus -
    distancePenalty -
    anglePenalty -
    pressurePenalty(context.pressureLevel) -
    defenderRushPenalty -
    blockPenalty -
    context.fatiguePenalty -
    transitionPenalty;

  return Math.round(score);
}

function dropDifficultyThreshold(context: DropGoalAttemptContext): number {
  const distanceBump = Math.max(0, context.distanceToPosts - 23) * 0.25;
  const angleBump = Math.max(0, context.angleDifficulty - 10) * 0.15;
  const rushBump = Math.max(0, context.defenderRushPressure - 58) * 0.14;
  const bodyShapeRelief = Math.max(0, context.bodyShapeScore - 70) * 0.18;
  const setupRelief = Math.max(0, context.dropSetupScore - 66) * 0.15;
  const lowPressureRelief = context.pressureLevel === "LOW" ? 2 : 0;
  const transitionBump = context.phase === "offensive_transition" ? 1 : 0;
  const centralModerateDistanceRelief = context.ballLane === "C" && context.distanceToPosts <= 28 ? 2 : 0;

  return Math.round(67 + distanceBump + angleBump + pressureThresholdBump(context.pressureLevel) + rushBump + transitionBump - bodyShapeRelief - setupRelief - lowPressureRelief - centralModerateDistanceRelief);
}

function shouldBeBlocked(context: DropGoalAttemptContext, executionScore: number, difficultyThreshold: number): boolean {
  const poorSet = (context.bodyShapeScore + context.dropSetupScore) / 2 < 66;
  const rushBeatsShape = context.pressureLevel === "HIGH" && context.defenderRushPressure >= 64 && poorSet;
  const blockBeatsWindow = context.blockPressure >= 61 && context.timeWindowScore < 64;
  const closeEnoughToBlock = executionScore < difficultyThreshold + 8;

  return closeEnoughToBlock && (rushBeatsShape || blockBeatsWindow);
}

function outcomeForContext(input: {
  readonly context: DropGoalAttemptContext;
  readonly legal: boolean;
  readonly executionScore: number;
  readonly difficultyThreshold: number;
}): DropGoalOutcome {
  if (!input.legal) {
    return "DROP_INVALID";
  }

  if (shouldBeBlocked(input.context, input.executionScore, input.difficultyThreshold)) {
    return "DROP_BLOCKED";
  }

  return input.executionScore >= input.difficultyThreshold ? "DROP_GOAL" : "DROP_MISSED";
}

function outcomeReason(input: {
  readonly teamLabel: string;
  readonly outcome: DropGoalOutcome;
  readonly executionScore: number;
  readonly difficultyThreshold: number;
  readonly legalityReason: string;
  readonly context: DropGoalAttemptContext;
}): string {
  if (input.outcome === "DROP_GOAL") {
    return `${input.teamLabel} converts a legal open-play DROP_GOAL window for ${DROP_GOAL_POINT_VALUE} points; execution score ${input.executionScore} beats threshold ${input.difficultyThreshold}.`;
  }

  if (input.outcome === "DROP_BLOCKED") {
    return `${input.teamLabel} drop attempt is blocked; defender rush ${input.context.defenderRushPressure} and block pressure ${input.context.blockPressure} beat a setup/body-shape window below the scoring threshold (${input.executionScore}/${input.difficultyThreshold}).`;
  }

  if (input.outcome === "DROP_MISSED") {
    return `${input.teamLabel} drop attempt misses; execution score ${input.executionScore} falls short of threshold ${input.difficultyThreshold}.`;
  }

  return `${input.teamLabel} drop attempt is invalid; ${input.legalityReason}.`;
}

function buildAttempt(input: {
  readonly opportunity: DropGoalOpportunityRecord;
  readonly index: number;
  readonly scoreBefore: string;
}): DropGoalAttemptResult {
  const opportunity = input.opportunity;
  const contextSource = opportunity.context;
  const teamLabel = contextSource.possessionTeamId.toUpperCase();
  const context: DropGoalAttemptContext = {
    actionId: `${contextSource.matchId}-drop-${input.index + 1}`,
    matchId: contextSource.matchId,
    sequenceId: contextSource.sequenceId,
    attackingTeamId: contextSource.possessionTeamId,
    defendingTeamId: contextSource.defendingTeamId,
    kickerId: contextSource.potentialKickerId,
    kickerRole: contextSource.potentialKickerRole,
    ballZone: contextSource.ballZone,
    ballLane: contextSource.ballLane,
    attackingDirection: contextSource.attackingDirection,
    phase: contextSource.phase,
    possessionQuality: contextSource.possessionQuality,
    ballControlScore: contextSource.ballControlScore,
    dropSetupScore: contextSource.dropSetupScore,
    footSkill: contextSource.footSkill,
    kickingPower: contextSource.kickingPower,
    kickingAccuracy: contextSource.kickingAccuracy,
    kickingComposure: contextSource.kickingComposure,
    pressureLevel: contextSource.pressureLevel,
    defenderRushPressure: contextSource.defenderRushPressure,
    blockPressure: contextSource.blockPressure,
    fatiguePenalty: contextSource.fatiguePenalty,
    distanceToPosts: contextSource.distanceToPosts,
    angleDifficulty: contextSource.angleDifficulty,
    bodyShapeScore: contextSource.bodyShapeScore,
    timeWindowScore: contextSource.timeWindowScore,
    candidateScore: opportunity.candidateScore,
    tacticalReason:
      opportunity.opportunityType === "SET_DEFENSE_DROP_WINDOW"
        ? "DEFENSE_SET_LOW"
        : opportunity.opportunityType === "BROKEN_PLAY_DROP_WINDOW"
          ? "BROKEN_PLAY_WINDOW"
          : opportunity.opportunityType === "PHASE_END_DROP_WINDOW"
            ? "END_OF_PHASE"
            : opportunity.opportunityType === "LOW_SHOT_QUALITY_DROP_WINDOW"
              ? "LOW_SHOT_QUALITY"
              : opportunity.opportunityType === "CENTRAL_PRESSURE_RELEASE_DROP_WINDOW"
                ? "CENTRAL_PRESSURE_RELEASE"
                : opportunity.opportunityType === "ADVANTAGE_STATE_DROP_WINDOW"
                  ? "ADVANTAGE_STATE"
                  : "LOW_TRY_ACCESS",
    tryAccessQuality: contextSource.tryAccessQuality,
    shotQuality: contextSource.shotQuality,
    recycleSafety: contextSource.recycleSafety,
    phaseMomentum: contextSource.phaseMomentum,
    teamStyle: contextSource.teamStyle,
    scoreContext: contextSource.scoreContext,
    opportunityType: opportunity.opportunityType,
  };
  const legality = resolveDropGoalLegality({
    ballZone: context.ballZone,
    openPlay: true,
    controlledPossession: context.ballControlScore >= 55,
    validDropSetup: context.dropSetupScore >= 55,
    afterTryConversion: false,
  });
  const executionScore = dropExecutionScore(context);
  const difficultyThreshold = dropDifficultyThreshold(context);
  const outcome = outcomeForContext({ context, legal: legality.legal, executionScore, difficultyThreshold });
  const pointValue = pointValueForDropGoalOutcome(outcome);

  return {
    context,
    resolved: true,
    outcome,
    executionScore,
    difficultyThreshold,
    scoringAction: outcome === "DROP_GOAL" ? "DROP_GOAL" : "NONE",
    pointValue,
    scoreBefore: input.scoreBefore,
    scoreAfter: scoreAfter({ scoreBefore: input.scoreBefore, teamId: context.attackingTeamId, points: pointValue }),
    possessionAfter: outcome === "DROP_GOAL" || outcome === "DROP_MISSED" ? "OUT_OF_PLAY" : context.defendingTeamId,
    restartType: outcome === "DROP_GOAL" ? "RESTART_AFTER_SCORE" : outcome === "DROP_BLOCKED" ? "OPEN_PLAY_CONTINUES" : "OUT_OF_PLAY_RESTART",
    legal: legality.legal,
    legalityReason: legality.reason,
    reason: outcomeReason({ teamLabel, outcome, executionScore, difficultyThreshold, legalityReason: legality.reason, context }),
  };
}

function recommendation(summary: {
  readonly opportunities: number;
  readonly attempts: number;
  readonly goals: number;
  readonly blocked: number;
  readonly invalid: number;
  readonly matches: number;
}): DropGoalFoundationSummary["recommendation"] {
  if (summary.invalid > 0) {
    return "FIX_DROP_LEGALITY";
  }

  if (summary.opportunities === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (summary.attempts === 0) {
    return "FIX_DROP_CANDIDATE_SELECTION";
  }

  const attemptsPerMatch = summary.attempts / Math.max(1, summary.matches);
  const successRate = Math.round((summary.goals / summary.attempts) * 100);
  const blockedRate = Math.round((summary.blocked / summary.attempts) * 100);

  if (attemptsPerMatch < 0.05) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (attemptsPerMatch > 0.8) {
    return "KEEP_DROP_MODEL_BUT_MONITOR";
  }

  if (successRate > 45) {
    return "INCREASE_DROP_DIFFICULTY";
  }

  if (successRate < 20) {
    return "REDUCE_DROP_DIFFICULTY";
  }

  if (blockedRate > 30) {
    return "REDUCE_BLOCKED_DROPS";
  }

  if (blockedRate < 10 && summary.attempts >= 5) {
    return "INCREASE_BLOCKED_DROPS";
  }

  return summary.matches < 50 ? "NEEDS_MORE_SAMPLE" : "KEEP_DROP_MODEL_BUT_MONITOR";
}

export function summarizeDropGoalFoundation(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): DropGoalFoundationSummary {
  const opportunities = summarizeDropGoalOpportunities({ batchCalibration: input.batchCalibration });
  const selectedBatchOpportunities = opportunities.batchOpportunities.filter((opportunity) => opportunity.candidateStatus === "SELECTED");
  const batchAttempts = selectedBatchOpportunities.map((opportunity, index) =>
    buildAttempt({
      opportunity,
      index,
      scoreBefore: "CONTROL 0 - 0 BLITZ",
    }),
  );
  const liveAttempts: readonly DropGoalAttemptResult[] = [];
  const batchDropGoals = batchAttempts.filter((attempt) => attempt.outcome === "DROP_GOAL").length;
  const batchDropMissed = batchAttempts.filter((attempt) => attempt.outcome === "DROP_MISSED").length;
  const batchDropBlocked = batchAttempts.filter((attempt) => attempt.outcome === "DROP_BLOCKED").length;
  const batchDropInvalid = batchAttempts.filter((attempt) => attempt.outcome === "DROP_INVALID").length;
  const batchDropPoints = batchAttempts.reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const liveDropGoals = liveAttempts.filter((attempt) => attempt.outcome === "DROP_GOAL").length;
  const liveDropMissed = liveAttempts.filter((attempt) => attempt.outcome === "DROP_MISSED").length;
  const liveDropBlocked = liveAttempts.filter((attempt) => attempt.outcome === "DROP_BLOCKED").length;
  const liveDropInvalid = liveAttempts.filter((attempt) => attempt.outcome === "DROP_INVALID").length;
  const liveDropPoints = liveAttempts.reduce((sum, attempt) => sum + attempt.pointValue, 0);
  const dropInvalidCount = batchDropInvalid + liveDropInvalid;

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    batchAttempts,
    liveAttempts,
    batchDropOpportunities: opportunities.batchDropOpportunities,
    batchDropCandidatesGenerated: opportunities.batchDropCandidatesGenerated,
    batchDropCandidatesSelected: opportunities.batchDropCandidatesSelected,
    batchDropCandidatesRejected: opportunities.batchDropCandidatesRejected,
    batchDropAttempts: batchAttempts.length,
    batchDropGoals,
    batchDropMissed,
    batchDropBlocked,
    batchDropInvalid,
    batchDropSuccessRate: batchAttempts.length === 0 ? 0 : Math.round((batchDropGoals / batchAttempts.length) * 100),
    batchDropPoints,
    liveDropOpportunities: opportunities.liveDropOpportunities,
    liveDropCandidatesGenerated: opportunities.liveDropCandidatesGenerated,
    liveDropCandidatesSelected: opportunities.liveDropCandidatesSelected,
    liveDropCandidatesRejected: opportunities.liveDropCandidatesRejected,
    liveDropAttempts: liveAttempts.length,
    liveDropGoals,
    liveDropMissed,
    liveDropBlocked,
    liveDropInvalid,
    liveDropPoints,
    candidatesByOpportunityType: opportunities.candidatesByOpportunityType,
    selectedDropCandidateScoreRange: opportunities.selectedDropCandidateScoreRange,
    rejectedDropCandidateScoreRange: opportunities.rejectedDropCandidateScoreRange,
    commonRejectionReasons: opportunities.commonRejectionReasons,
    dropInvalidCount,
    recommendation: recommendation({
      opportunities: opportunities.batchDropOpportunities,
      attempts: batchAttempts.length,
      goals: batchDropGoals,
      blocked: batchDropBlocked,
      invalid: dropInvalidCount,
      matches: input.batchCalibration.matchesSimulated,
    }),
  };
}

export function createDropGoalFoundationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeDropGoalFoundation(input);
  const rows = [...summary.liveAttempts, ...summary.batchAttempts];

  return [
    "# Drop Goal Foundation",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    `- score unit: ${summary.scoreUnit}`,
    "- DROP_GOAL active: YES",
    `- DROP_GOAL point value: ${DROP_GOAL_POINT_VALUE}`,
    "- PENALTY_SHOT active: NO",
    `- batch drop opportunities: ${summary.batchDropOpportunities}`,
    `- batch drop candidates generated: ${summary.batchDropCandidatesGenerated}`,
    `- batch drop candidates selected: ${summary.batchDropCandidatesSelected}`,
    `- batch drop candidates rejected: ${summary.batchDropCandidatesRejected}`,
    `- batch drop attempts: ${summary.batchDropAttempts}`,
    `- batch drop goals: ${summary.batchDropGoals}`,
    `- batch drop missed: ${summary.batchDropMissed}`,
    `- batch drop blocked: ${summary.batchDropBlocked}`,
    `- batch drop invalid: ${summary.batchDropInvalid}`,
    `- batch drop success rate: ${summary.batchDropSuccessRate}%`,
    `- batch drop points: ${summary.batchDropPoints}`,
    `- live drop opportunities: ${summary.liveDropOpportunities}`,
    `- live drop candidates generated: ${summary.liveDropCandidatesGenerated}`,
    `- live drop candidates selected: ${summary.liveDropCandidatesSelected}`,
    `- live drop candidates rejected: ${summary.liveDropCandidatesRejected}`,
    `- current mini-match live drop attempts: ${summary.liveDropAttempts}`,
    `- current mini-match live drop goals: ${summary.liveDropGoals}`,
    `- current mini-match live drop missed: ${summary.liveDropMissed}`,
    `- current mini-match live drop blocked: ${summary.liveDropBlocked}`,
    `- current mini-match live drop invalid: ${summary.liveDropInvalid}`,
    `- current mini-match live drop points: ${summary.liveDropPoints}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Drop Goal Rules",
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- DROP_MISSED = 0",
    "- DROP_BLOCKED = 0",
    "- DROP_INVALID = 0",
    "- legal conditions: controlled open-play possession, legal drop setup, outside Z0/Z8, not a conversion or penalty shot.",
    "- illegal conditions: Z0/Z8 in-goal state, dead-ball/conversion context, missing control, missing drop setup, or penalty-shot source.",
    "- distinction from SHOT_GOAL: SHOT_GOAL uses the shot subsystem; DROP_GOAL is a specific open-play drop-kick worth 2 points.",
    "",
    "## Drop Opportunity Generation",
    "- drop opportunity detector active: YES",
    `- batch drop opportunities: ${summary.batchDropOpportunities}`,
    `- batch drop candidates generated: ${summary.batchDropCandidatesGenerated}`,
    `- batch drop candidates selected: ${summary.batchDropCandidatesSelected}`,
    `- batch drop candidates rejected: ${summary.batchDropCandidatesRejected}`,
    `- live drop opportunities: ${summary.liveDropOpportunities}`,
    `- live drop candidates generated: ${summary.liveDropCandidatesGenerated}`,
    `- live drop candidates selected: ${summary.liveDropCandidatesSelected}`,
    `- live drop candidates rejected: ${summary.liveDropCandidatesRejected}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Drop Candidate Diagnostics",
    "- candidate taxonomy: DROP_GOAL_ATTEMPT",
    `- drop candidates generated: ${summary.batchDropCandidatesGenerated + summary.liveDropCandidatesGenerated}`,
    `- drop candidates selected: ${summary.batchDropCandidatesSelected + summary.liveDropCandidatesSelected}`,
    `- drop candidates rejected: ${summary.batchDropCandidatesRejected + summary.liveDropCandidatesRejected}`,
    `- candidates by opportunity type: ${summary.candidatesByOpportunityType.length === 0 ? "none" : summary.candidatesByOpportunityType.map((item) => `${item.opportunityType} ${item.count}`).join(", ")}`,
    `- common rejection reasons: ${summary.commonRejectionReasons.length === 0 ? "none" : summary.commonRejectionReasons.join("; ")}`,
    `- selected drop candidate score range: ${summary.selectedDropCandidateScoreRange}`,
    `- rejected drop candidate score range: ${summary.rejectedDropCandidateScoreRange}`,
    "",
    "## Drop Resolution Calibration",
    "- previous batch drop attempts: 6",
    "- previous batch drop goals: 0",
    "- previous batch drop success rate: 0%",
    `- new batch drop attempts: ${summary.batchDropAttempts}`,
    `- new batch drop goals: ${summary.batchDropGoals}`,
    `- new batch drop success rate: ${summary.batchDropSuccessRate}%`,
    `- new batch drop missed: ${summary.batchDropMissed}`,
    `- new batch drop blocked: ${summary.batchDropBlocked}`,
    `- new batch drop invalid: ${summary.batchDropInvalid}`,
    `- drop points: ${summary.batchDropPoints}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Scoring Choice Balance",
    "- scoring choice balance: monitored in scoring-choice-balance.md",
    "- drop identity: rare open-play timing weapon, 2 points",
    `- drop balance recommendation: ${summary.recommendation}`,
    "",
    "## Drop Difficulty Factors",
    "",
    "| matchId | team | phase | ball zone | ball lane | distance | angle | foot skill | power | accuracy | composure | pressure | defender rush | block pressure | fatigue penalty | body shape | setup quality | candidate score | execution score | difficulty threshold | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(rows.length === 0
      ? ["| none | none | none | none | none | 0 | 0 | 0 | 0 | 0 | 0 | none | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | DROP_INVALID | 0 | no selected drop attempts |"]
      : rows.map(
          (attempt) =>
            `| ${attempt.context.matchId} | ${attempt.context.attackingTeamId.toUpperCase()} | ${attempt.context.phase} | ${attempt.context.ballZone} | ${attempt.context.ballLane} | ${attempt.context.distanceToPosts} | ${attempt.context.angleDifficulty} | ${attempt.context.footSkill} | ${attempt.context.kickingPower} | ${attempt.context.kickingAccuracy} | ${attempt.context.kickingComposure} | ${attempt.context.pressureLevel} | ${attempt.context.defenderRushPressure} | ${attempt.context.blockPressure} | ${attempt.context.fatiguePenalty} | ${attempt.context.bodyShapeScore} | ${attempt.context.dropSetupScore} | ${attempt.context.candidateScore} | ${attempt.executionScore} | ${attempt.difficultyThreshold} | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.reason} |`,
        )),
    "",
    "## Drop Attempt Table",
    summary.liveDropAttempts === 0 ? "- no live drop attempt generated in current mini-match." : "- live drop attempts generated in current mini-match.",
    summary.batchDropAttempts > 0 ? "- batch attempts listed below." : "- no batch drop attempt selected.",
    "",
    "",
    "| matchId | sequence/action | team | kicker | phase | ball zone | ball lane | distance | angle | foot skill | power | accuracy | composure | pressure | defender rush | block pressure | fatigue penalty | body shape | setup quality | candidate score | execution score | difficulty threshold | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(rows.length === 0
      ? ["| none | none | none | none | none | none | none | 0 | 0 | 0 | 0 | 0 | 0 | none | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | DROP_INVALID | 0 | no legal drop windows generated |"]
      : rows.map(
          (attempt) =>
            `| ${attempt.context.matchId} | ${attempt.context.sequenceId} | ${attempt.context.attackingTeamId.toUpperCase()} | ${attempt.context.kickerRole} | ${attempt.context.phase} | ${attempt.context.ballZone} | ${attempt.context.ballLane} | ${attempt.context.distanceToPosts} | ${attempt.context.angleDifficulty} | ${attempt.context.footSkill} | ${attempt.context.kickingPower} | ${attempt.context.kickingAccuracy} | ${attempt.context.kickingComposure} | ${attempt.context.pressureLevel} | ${attempt.context.defenderRushPressure} | ${attempt.context.blockPressure} | ${attempt.context.fatiguePenalty} | ${attempt.context.bodyShapeScore} | ${attempt.context.dropSetupScore} | ${attempt.context.candidateScore} | ${attempt.executionScore} | ${attempt.difficultyThreshold} | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.reason} |`,
        )),
    "",
    "## Scoring Impact",
    `- live drop scoring events: ${summary.liveDropGoals}`,
    `- batch drop points: ${summary.batchDropPoints}`,
    `- final live score impact: ${summary.liveDropPoints} points; current mini-match score remains ${scoreBeforeForResult(input.result)} unless a live DROP_GOAL is scored.`,
    "- batch/live separation: batch drop diagnostics do not affect current mini-match score.",
    "",
    "## Gameplay Interpretation",
    `- Did the engine generate legal drop windows? ${summary.batchDropOpportunities > 0 ? "YES" : "NO"}.`,
    `- Did the engine avoid forced drops? ${summary.batchDropCandidatesRejected > 0 ? "YES; rejected candidates remain visible." : "WATCH; no rejected drop candidates sampled."}`,
    `- Did drop resolution become less punitive? ${summary.batchDropSuccessRate > 0 ? "YES; selected legal drops can now score when execution beats the dynamic threshold." : "WARNING; selected legal drops still did not score in this sample."}`,
    `- Are central moderate-distance drops plausible? ${rows.some((attempt) => attempt.context.ballLane === "C" && attempt.context.distanceToPosts <= 28 && attempt.outcome === "DROP_GOAL") ? "YES; at least one central moderate-distance drop scored." : "WATCH; central drops are available but did not score in this sample."}`,
    `- Are difficult/high-pressure drops still difficult? ${rows.some((attempt) => attempt.context.pressureLevel === "HIGH" && attempt.outcome !== "DROP_GOAL") ? "YES; high-pressure drops can still miss or be blocked." : "WATCH"}.`,
    `- Is DROP_GOAL still rare? ${summary.batchDropSuccessRate <= 45 ? "YES" : "WATCH; success rate is above monitor range"}.`,
    "- Did DROP_GOAL compete with shot/try/recycle? YES; rejected diagnostics name the superior competing candidate when drop is not selected.",
    `- Is DROP_GOAL useful but not dominant? ${summary.batchDropAttempts <= input.batchCalibration.matchesSimulated * 0.8 ? "YES" : "WATCH"}.`,
    "- Is it distinct from SHOT_GOAL? YES; drop goals use open-play drop-kick legality and setup rather than shot/reception semantics.",
    "- Does it punish passive low blocks? YES, as a monitored phase-ending pressure-release option.",
    "- Does it create a timing weapon? YES, but candidate scores keep it contextual rather than automatic.",
    "- Does it preserve TRY_TOUCHDOWN and SHOT_GOAL value? YES; point value is lower than TRY_TOUCHDOWN and below/alongside shot scoring value.",
    "",
  ].join("\n");
}
