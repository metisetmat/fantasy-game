import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { SnapshotReference } from "../../reports/visualization";
import type { ZoneId } from "../../core/zones";
import { getDefendingGoalkeeper } from "../rules";
import { canPlayerUseHandsInGoalArea, isInsideGoalArea, nearestGoalAreaZone, rulePlayerId, rulePlayerZone } from "../rules";
import { resolveGoalkeeperFatigueProfile } from "./goalkeeperFatigueResolver";
import { resolveGKShotStopping } from "./gkShotStoppingResolver";
import type { GKShotStoppingContext, GKShotStoppingResult, GoalkeeperAction, ShotTargetFrame } from "./gkShotStoppingTypes";
import { createReboundContinuationContext, resolveReboundContinuation } from "./reboundContinuationResolver";
import type {
  ReboundResolution,
  ResolvedPossessionAfterShot,
  ResolvedShotBallOutcome,
  ShotDifficultyFactors,
  ShotOutcomeContract,
  ShotOutcomeScoreSummary,
} from "./shotOutcomeTypes";

export const SHOT_SUCCESS_THRESHOLD = 12;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function longitudinal(zone: string): number {
  const match = /^Z(\d)-/.exec(zone);
  return match === null ? 3 : Number.parseInt(match[1] ?? "3", 10);
}

function scoreText(input: { readonly controlName: string; readonly control: number; readonly blitz: number; readonly blitzName: string }): string {
  return `${input.controlName} ${input.control} - ${input.blitz} ${input.blitzName}`;
}

function nonGoalOutcome(input: {
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
}): { readonly outcome: ResolvedShotBallOutcome; readonly possession: ResolvedPossessionAfterShot } {
  if (input.defensiveBlockPressure >= 72) {
    return { outcome: "BLOCKED_BY_DEFENDER", possession: "CONTESTED" };
  }

  if (input.goalkeeperChallenge >= input.shotQuality - 4) {
    return { outcome: "SAVED_BY_GK", possession: "OUT_OF_PLAY" };
  }

  return { outcome: input.shotQuality % 2 === 0 ? "MISSED_WIDE" : "MISSED_HIGH", possession: "OUT_OF_PLAY" };
}

export function resolveShotDifficulty(input: {
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly shotOriginZone: string;
  readonly cleanWindow?: boolean;
  readonly eliteFinisher?: boolean;
}): ShotDifficultyFactors {
  const depth = longitudinal(input.shotOriginZone);
  const forcedShot =
    input.shotQuality < 60 ||
    input.goalkeeperChallenge >= input.shotQuality - 3 ||
    input.defensiveBlockPressure >= 68 ||
    input.finishingPressure >= 82;
  const cleanWindow =
    input.cleanWindow ??
    (input.goalkeeperChallenge <= 50 && input.defensiveBlockPressure <= 44 && input.finishingPressure <= 68);
  const cleanWindowType =
    !cleanWindow
      ? "NONE"
      : input.goalkeeperChallenge >= 64 || input.defensiveBlockPressure >= 64
        ? "PARTIAL"
        : input.shotQuality >= 88 && input.goalkeeperChallenge <= 48 && input.defensiveBlockPressure <= 42
          ? "ELITE"
          : "CLEAN";
  const cleanWindowBonus =
    cleanWindowType === "ELITE" ? 3 : cleanWindowType === "CLEAN" ? 2 : cleanWindowType === "PARTIAL" ? 0 : 0;
  const cleanWindowReason =
    cleanWindowType === "NONE"
      ? "No clean-window bonus applied."
      : cleanWindowType === "PARTIAL"
        ? "Clean window is partially degraded by goalkeeper or block pressure."
        : cleanWindowType === "ELITE"
          ? "Elite clean window earns the maximum capped clean-window bonus."
          : "Clean window earns a capped bonus but still faces goalkeeper and block pressure.";
  const goalkeeperChallengeImpact = Math.round(input.goalkeeperChallenge * 0.54);
  const defensiveBlockPressureImpact = Math.round(input.defensiveBlockPressure * 0.4);
  const finishingPressureImpact = Math.round(input.finishingPressure * 0.26);
  const forcedShotPenalty = forcedShot ? 12 : 0;
  const distanceOrZonePenalty = depth <= 3 ? 6 : depth === 4 ? 3 : 0;
  const eliteFinisherBonus = input.eliteFinisher === true || input.shotQuality >= 88 ? 4 : 0;
  const finalShotSuccessScore =
    input.shotQuality -
    goalkeeperChallengeImpact -
    defensiveBlockPressureImpact -
    finishingPressureImpact -
    forcedShotPenalty -
    distanceOrZonePenalty +
    cleanWindowBonus +
    eliteFinisherBonus;

  return {
    cleanWindowType,
    goalkeeperChallengeImpact,
    defensiveBlockPressureImpact,
    finishingPressureImpact,
    forcedShotPenalty,
    distanceOrZonePenalty,
    cleanWindowBonus,
    eliteFinisherBonus,
    finalShotSuccessScore,
    cleanWindowAdjustedScore: finalShotSuccessScore,
    outcomeThreshold: SHOT_SUCCESS_THRESHOLD,
    forcedShot,
    cleanWindow,
    cleanWindowReason,
  };
}

export function resolveBallOutcomeFromShotDifficulty(input: {
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly shotOriginZone: string;
  readonly cleanWindow?: boolean;
  readonly eliteFinisher?: boolean;
}): {
  readonly difficultyFactors: ShotDifficultyFactors;
  readonly ballOutcome: ResolvedShotBallOutcome;
  readonly possessionAfterShot: ResolvedPossessionAfterShot;
} {
  const difficultyFactors = resolveShotDifficulty(input);

  if (difficultyFactors.finalShotSuccessScore >= difficultyFactors.outcomeThreshold) {
    return {
      difficultyFactors,
      ballOutcome: "GOAL",
      possessionAfterShot: "OUT_OF_PLAY",
    };
  }

  const fallback = nonGoalOutcome(input);

  return {
    difficultyFactors,
    ballOutcome: fallback.outcome,
    possessionAfterShot: fallback.possession,
  };
}

function frameForShot(shotIndex: number, scoringEventExists: boolean): ShotTargetFrame {
  if (scoringEventExists) {
    return "CORNER";
  }

  const frames: readonly ShotTargetFrame[] = ["LOW", "MID", "HIGH", "CENTER", "CORNER"];
  return frames[shotIndex % frames.length] ?? "UNKNOWN";
}

function shotOnTarget(input: {
  readonly scoringEventExists: boolean;
  readonly difficultyFactors: ShotDifficultyFactors;
  readonly defensiveBlockPressure: number;
  readonly shotQuality: number;
}): boolean {
  return (
    input.scoringEventExists ||
    (input.defensiveBlockPressure < 72 &&
      input.shotQuality >= 58 &&
      input.difficultyFactors.finalShotSuccessScore >= input.difficultyFactors.outcomeThreshold - 8)
  );
}

function possessionForOutcome(input: {
  readonly outcome: ResolvedShotBallOutcome;
  readonly defendingTeamId: string;
}): ResolvedPossessionAfterShot {
  switch (input.outcome) {
    case "CAUGHT_BY_GK":
      return input.defendingTeamId;
    case "SAVED":
    case "SAVED_BY_GK":
      return "OUT_OF_PLAY";
    case "DEFLECTED_BY_GK":
    case "REBOUND_CONTESTED":
    case "BLOCKED_BY_DEFENDER":
    case "BLOCKED":
    case "REBOUND":
      return "CONTESTED";
    case "GOAL":
    case "MISSED":
    case "MISSED_WIDE":
    case "MISSED_HIGH":
    case "OUT_OF_PLAY":
    case "PENDING":
      return "OUT_OF_PLAY";
  }
}

function finalGoalkeeperActionForOutcome(input: {
  readonly outcome: ResolvedShotBallOutcome;
  readonly gkResult: GKShotStoppingResult;
  readonly goalkeeperLegalHandUseAvailable: boolean;
  readonly goalkeeperInsideGoalArea: boolean;
}): GoalkeeperAction {
  switch (input.outcome) {
    case "GOAL":
      return "FAILED_SAVE";
    case "CAUGHT_BY_GK":
      return "CATCH";
    case "SAVED_BY_GK":
    case "SAVED":
      if (input.goalkeeperLegalHandUseAvailable) {
        return "HAND_SAVE";
      }
      return input.goalkeeperInsideGoalArea ? "FOOT_SAVE" : "OUT_OF_AREA_BODY_BLOCK";
    case "DEFLECTED_BY_GK":
    case "REBOUND_CONTESTED":
    case "REBOUND":
      return "DEFLECTION";
    case "MISSED_HIGH":
    case "MISSED_WIDE":
    case "MISSED":
    case "OUT_OF_PLAY":
      return input.gkResult.goalkeeperAction === "SET_AND_COVER" ? "SET_AND_COVER" : "TRACKED_MISS";
    case "BLOCKED_BY_DEFENDER":
    case "BLOCKED":
      return "SET_AND_COVER";
    case "PENDING":
      return "NO_ACTION";
  }
}

function finalGoalkeeperReasonForOutcome(input: {
  readonly outcome: ResolvedShotBallOutcome;
  readonly action: GoalkeeperAction;
  readonly originalReason: string;
}): string {
  switch (input.outcome) {
    case "GOAL":
      return `Goalkeeper is evaluated and beaten by the resolved SHOT_GOAL scoring event. ${input.originalReason}`;
    case "CAUGHT_BY_GK":
      return "Goalkeeper legally controls the shot with a catch inside the goal-area hand-use context.";
    case "SAVED_BY_GK":
    case "SAVED":
      return input.action === "HAND_SAVE"
        ? "Goalkeeper makes a legal hand save and prevents the shot from scoring."
        : "Goalkeeper prevents the shot using foot/body mechanics rather than hand control.";
    case "DEFLECTED_BY_GK":
    case "REBOUND_CONTESTED":
    case "REBOUND":
      return "Goalkeeper gets enough reach or reaction to deflect the shot into a rebound state.";
    case "MISSED_HIGH":
    case "MISSED_WIDE":
    case "MISSED":
    case "OUT_OF_PLAY":
      return input.action === "TRACKED_MISS"
        ? "Goalkeeper tracks the miss across the frame without a failed save action."
        : "Goalkeeper sets and covers while the shot misses the frame.";
    case "BLOCKED_BY_DEFENDER":
    case "BLOCKED":
      return "Defensive block pressure resolves the shot before a goalkeeper save action is required.";
    case "PENDING":
      return input.originalReason;
  }
}

function alignGoalkeeperResultWithOutcome(input: {
  readonly outcome: ResolvedShotBallOutcome;
  readonly gkResult: GKShotStoppingResult;
  readonly goalkeeperLegalHandUseAvailable: boolean;
  readonly goalkeeperInsideGoalArea: boolean;
}): GKShotStoppingResult {
  const goalkeeperAction = finalGoalkeeperActionForOutcome(input);

  return {
    ...input.gkResult,
    goalkeeperEvaluated: true,
    goalkeeperInvolved:
      goalkeeperAction !== "NO_ACTION" &&
      goalkeeperAction !== "SET_AND_COVER" &&
      !(goalkeeperAction === "TRACKED_MISS" && (input.outcome === "MISSED_HIGH" || input.outcome === "MISSED_WIDE")),
    goalkeeperAction,
    gkOutcomeReason: finalGoalkeeperReasonForOutcome({
      outcome: input.outcome,
      action: goalkeeperAction,
      originalReason: input.gkResult.gkOutcomeReason,
    }),
  };
}

function reboundResolutionForOutcome(input: {
  readonly outcome: ResolvedShotBallOutcome;
  readonly defendingTeamId: string;
  readonly goalkeeperZone: ZoneId;
  readonly shotOriginZone: ZoneId;
}): ReboundResolution {
  switch (input.outcome) {
    case "CAUGHT_BY_GK":
      return {
        reboundType: "GK_CONTROLLED",
        reboundZone: input.goalkeeperZone,
        nextPossession: input.defendingTeamId,
        reboundReason: "Goalkeeper catches the shot cleanly and controls the next possession.",
      };
    case "SAVED_BY_GK":
    case "SAVED":
      return {
        reboundType: "DEFENDER_CONTROLLED",
        reboundZone: input.goalkeeperZone,
        nextPossession: input.defendingTeamId,
        reboundReason: "Goalkeeper save kills the immediate scoring threat and lets the defending team recover possession.",
      };
    case "DEFLECTED_BY_GK":
    case "REBOUND_CONTESTED":
    case "REBOUND":
      return {
        reboundType: "CONTESTED",
        reboundZone: input.goalkeeperZone,
        nextPossession: "CONTESTED",
        reboundReason: "Goalkeeper deflection spills live and creates a contested rebound near the goal area.",
      };
    case "BLOCKED_BY_DEFENDER":
    case "BLOCKED":
      return {
        reboundType: "CONTESTED",
        reboundZone: input.shotOriginZone,
        nextPossession: "CONTESTED",
        reboundReason: "Defender block keeps the ball live around the shooting lane.",
      };
    case "MISSED_HIGH":
    case "MISSED_WIDE":
    case "MISSED":
    case "OUT_OF_PLAY":
      return {
        reboundType: "OUT_OF_PLAY",
        reboundZone: "OUT_OF_PLAY",
        nextPossession: "OUT_OF_PLAY",
        reboundReason: "Shot misses the frame and leaves play; no rebound is available.",
      };
    case "GOAL":
      return {
        reboundType: "NONE",
        reboundZone: "NONE",
        nextPossession: "OUT_OF_PLAY",
        reboundReason: "Goal ends the shot phase; restart follows the scoring event.",
      };
    case "PENDING":
      return {
        reboundType: "NONE",
        reboundZone: "NONE",
        nextPossession: "PENDING",
        reboundReason: "Shot outcome is pending, so rebound resolution is unavailable.",
      };
  }
}

function outcomeFromGoalkeeper(input: {
  readonly shotOnTarget: boolean;
  readonly scoringEventExists: boolean;
  readonly defensiveBlockPressure: number;
  readonly shotQuality: number;
  readonly gkResult: GKShotStoppingResult;
}): ResolvedShotBallOutcome {
  if (input.defensiveBlockPressure >= 72) {
    return "BLOCKED_BY_DEFENDER";
  }

  if (!input.shotOnTarget) {
    return input.shotQuality % 2 === 0 ? "MISSED_WIDE" : "MISSED_HIGH";
  }

  if (input.scoringEventExists) {
    return "GOAL";
  }

  switch (input.gkResult.goalkeeperAction) {
    case "CATCH":
      return "CAUGHT_BY_GK";
    case "HAND_SAVE":
    case "FOOT_SAVE":
    case "OUT_OF_AREA_BODY_BLOCK":
      return "SAVED_BY_GK";
    case "DEFLECTION":
      return "DEFLECTED_BY_GK";
    case "NO_ACTION":
    case "SET_AND_COVER":
    case "TRACKED_MISS":
      return input.shotQuality % 2 === 0 ? "MISSED_WIDE" : "MISSED_HIGH";
    case "FAILED_SAVE":
      return "DEFLECTED_BY_GK";
  }
}

function gkContextFromSnapshot(input: {
  readonly snapshot: SnapshotReference;
  readonly shotIndex: number;
  readonly shotOriginZone: ZoneId;
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly difficultyFactors: ShotDifficultyFactors;
  readonly scoringEventExists: boolean;
}): GKShotStoppingContext {
  const players = input.snapshot.beforeMetadata.playerStates;
  const goalkeeper = getDefendingGoalkeeper(input.snapshot.beforeTruthContract.defendingTeamId, players);
  const goalkeeperZone = (goalkeeper === null ? null : rulePlayerZone(goalkeeper)) ?? nearestGoalAreaZone(input.snapshot.beforeTruthContract.defendingTeamId);
  const goalkeeperId = goalkeeper === null ? `${input.snapshot.beforeTruthContract.defendingTeamId}-goalkeeper` : rulePlayerId(goalkeeper);
  const goalkeeperState = players.find((player) => player.playerId === goalkeeperId);
  const goalkeeperInsideGoalArea = isInsideGoalArea(goalkeeperZone, input.snapshot.beforeTruthContract.defendingTeamId);
  const goalkeeperLegalHandUseAvailable =
    goalkeeper === null
      ? false
      : canPlayerUseHandsInGoalArea(goalkeeper, goalkeeperZone, input.snapshot.beforeTruthContract.defendingTeamId);
  const visible = goalkeeper?.visibleAttributes;
  const shotTargetFrame = frameForShot(input.shotIndex, input.scoringEventExists);
  const shotPower = clamp(48 + longitudinal(input.shotOriginZone) * 5 + Math.round(input.shotQuality * 0.18));
  const shotPlacement = clamp(input.shotQuality + (input.scoringEventExists ? 8 : 0) - Math.round(input.defensiveBlockPressure * 0.12));
  const shotAngleDifficulty = clamp(64 - longitudinal(input.shotOriginZone) * 6 + (shotTargetFrame === "CORNER" ? 16 : 4));
  const shotOnTargetValue = shotOnTarget({
    scoringEventExists: input.scoringEventExists,
    difficultyFactors: input.difficultyFactors,
    defensiveBlockPressure: input.defensiveBlockPressure,
    shotQuality: input.shotQuality,
  });
  const goalkeeperSetPositionScore = clamp((goalkeeperInsideGoalArea ? 66 : 48) + Math.round((visible?.composure ?? 70) * 0.18));
  const goalkeeperReactionScore = clamp(Math.round((visible?.speed ?? 70) * 0.35 + (visible?.composure ?? 70) * 0.25 + (visible?.vision ?? 70) * 0.2));
  const goalkeeperReachScore = clamp(Math.round((visible?.speed ?? 70) * 0.5 + (visible?.power ?? 70) * 0.24));
  const goalkeeperHandlingScore = clamp(Math.round((visible?.handPlay ?? 70) * 0.48 + (visible?.composure ?? 70) * 0.24));
  const goalkeeperFootSaveScore = clamp(Math.round((visible?.footPlay ?? 70) * 0.44 + (visible?.speed ?? 70) * 0.2));
  const goalkeeperFatigueProfile = resolveGoalkeeperFatigueProfile({
    shotActionId: formatActionId(input.snapshot),
    shotIndex: input.shotIndex,
    sequenceNumber: input.snapshot.sequenceNumber,
    actionNumber: input.snapshot.actionNumber,
    goalkeeperId,
    defendingTeamId: input.snapshot.beforeTruthContract.defendingTeamId,
    goalkeeperZone,
    goalkeeperInsideGoalArea,
    baseAccumulatedFatigue: goalkeeperState?.fatigue ?? 20,
    composure: visible?.composure ?? 70,
    vision: visible?.vision ?? 70,
    handling: visible?.handPlay ?? 70,
    speed: visible?.speed ?? 70,
    shotOnTarget: shotOnTargetValue,
    defensiveBlockPressure: input.defensiveBlockPressure,
    finishingPressure: input.finishingPressure,
    cleanWindowType: input.difficultyFactors.cleanWindowType,
  });

  return {
    shotActionId: formatActionId(input.snapshot),
    shootingTeamId: input.snapshot.beforeTruthContract.possessionTeamId,
    defendingTeamId: input.snapshot.beforeTruthContract.defendingTeamId,
    shooterId: input.snapshot.beforeTruthContract.ballCarrierId,
    goalkeeperId,
    shotOriginZone: input.shotOriginZone,
    shotTargetFrame,
    shotOnTarget: shotOnTargetValue,
    shotType: "FOOT_STRIKE",
    goalkeeperZone,
    goalkeeperInsideGoalArea,
    goalkeeperLegalHandUseAvailable,
    goalkeeperSetPositionScore,
    goalkeeperReactionScore,
    goalkeeperReachScore,
    goalkeeperHandlingScore,
    goalkeeperFootSaveScore,
    shotQuality: input.shotQuality,
    shotPower,
    shotPlacement,
    shotAngleDifficulty,
    defensiveBlockPressure: input.defensiveBlockPressure,
    finishingPressure: input.finishingPressure,
    cleanWindowType: input.difficultyFactors.cleanWindowType,
    goalkeeperFatigueProfile,
  };
}

function scoringGoalkeeperResult(result: GKShotStoppingResult): GKShotStoppingResult {
  return result.goalkeeperAction === "FAILED_SAVE"
    ? result
    : {
        ...result,
        goalkeeperEvaluated: true,
        goalkeeperInvolved: true,
        goalkeeperAction: "FAILED_SAVE",
        gkOutcomeReason: `Goalkeeper is evaluated and beaten by the resolved SHOT_GOAL scoring event. ${result.gkOutcomeReason}`,
      };
}

function formatActionId(snapshot: SnapshotReference): string {
  return `dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`;
}

export function resolveShotOutcomes(input: { readonly result: MiniMatchResult; readonly snapshots: readonly SnapshotReference[] }): readonly ShotOutcomeContract[] {
  const controlName = input.result.state.context.teamA.displayName;
  const blitzName = input.result.state.context.teamB.displayName;
  const scoringEvents = [...input.result.summary.scoringEvents];
  const usedScoringEventIndexes = new Set<number>();
  let controlScore = 0;
  let blitzScore = 0;

  return input.snapshots
    .filter((snapshot) => snapshot.afterTruthContract.selectedActionType === "SHOT")
    .map((snapshot, shotIndex): ShotOutcomeContract => {
      const beforeCarrier = snapshot.beforeMetadata.playerStates.find(
        (player) => player.playerId === snapshot.beforeTruthContract.ballCarrierId,
      );
      const shooterInitials = beforeCarrier?.roleInitials ?? "SHOOTER";
      const shotOriginZone = beforeCarrier?.zone ?? snapshot.beforeTruthContract.ballZone;
      const depth = longitudinal(shotOriginZone);
      const shotQuality = clamp(44 + depth * 7 + (snapshot.attackingTeamName === controlName ? 8 : 2) - (shotIndex % 2) * 6);
      const goalkeeperChallenge = clamp(38 + (7 - depth) * 5 + (snapshot.defendingTeamName === blitzName ? 4 : 8));
      const defensiveBlockPressure = clamp(34 + (snapshot.phaseState === "DANGER_PHASE" ? 12 : 4) + (shotIndex % 3) * 8);
      const finishingPressure = clamp(58 + depth * 4);
      const scoringEventIndex = scoringEvents.findIndex(
        (event, index) => !usedScoringEventIndexes.has(index) && event.sequenceNumber === snapshot.sequenceNumber,
      );
      const scoringEvent = scoringEventIndex >= 0 ? scoringEvents[scoringEventIndex] : undefined;
      const scoreBefore = scoreText({ controlName, control: controlScore, blitz: blitzScore, blitzName });
      const legal = true;
      const difficultyResolution = resolveBallOutcomeFromShotDifficulty({
        shotQuality,
        goalkeeperChallenge,
        defensiveBlockPressure,
        finishingPressure,
        shotOriginZone,
        cleanWindow: scoringEvent !== undefined,
        eliteFinisher: beforeCarrier?.roleInitials === "ML" || beforeCarrier?.roleInitials === "LP",
      });
      const goalkeeperContext = gkContextFromSnapshot({
        snapshot,
        shotIndex,
        shotOriginZone,
        shotQuality,
        goalkeeperChallenge,
        defensiveBlockPressure,
        finishingPressure,
        difficultyFactors: difficultyResolution.difficultyFactors,
        scoringEventExists: scoringEvent !== undefined,
      });
      const rawGkResult = resolveGKShotStopping(goalkeeperContext);
      const gkResult = scoringEvent === undefined ? rawGkResult : scoringGoalkeeperResult(rawGkResult);
      const rawBallOutcome: ResolvedShotBallOutcome = outcomeFromGoalkeeper({
        shotOnTarget: goalkeeperContext.shotOnTarget,
        scoringEventExists: scoringEvent !== undefined,
        defensiveBlockPressure,
        shotQuality,
        gkResult,
      });
      const fallbackNonGoal =
        scoringEvent === undefined && rawBallOutcome === "GOAL"
          ? nonGoalOutcome({ shotQuality, goalkeeperChallenge, defensiveBlockPressure })
          : null;
      const ballOutcome: ResolvedShotBallOutcome = fallbackNonGoal?.outcome ?? rawBallOutcome;
      const initialPossessionAfterShot: ResolvedPossessionAfterShot = possessionForOutcome({
        outcome: ballOutcome,
        defendingTeamId: snapshot.beforeTruthContract.defendingTeamId,
      });
      const finalGkResult = alignGoalkeeperResultWithOutcome({
        outcome: ballOutcome,
        gkResult,
        goalkeeperLegalHandUseAvailable: goalkeeperContext.goalkeeperLegalHandUseAvailable,
        goalkeeperInsideGoalArea: goalkeeperContext.goalkeeperInsideGoalArea,
      });
      const reboundResolution = reboundResolutionForOutcome({
        outcome: ballOutcome,
        defendingTeamId: snapshot.beforeTruthContract.defendingTeamId,
        goalkeeperZone: goalkeeperContext.goalkeeperZone,
        shotOriginZone,
      });
      const reboundContinuationContext = createReboundContinuationContext({
        reboundSourceActionId: formatActionId(snapshot),
        reboundResolution,
        attackingTeamId: snapshot.beforeTruthContract.possessionTeamId,
        defendingTeamId: snapshot.beforeTruthContract.defendingTeamId,
        goalkeeperId: goalkeeperContext.goalkeeperId,
        goalkeeperRecoveryScore: goalkeeperContext.goalkeeperFatigueProfile.secondSaveRecoveryScore,
        ballSpeed: goalkeeperContext.shotPower,
        spinOrDeflectionSeverity: clamp(
          goalkeeperContext.defensiveBlockPressure * 0.32 +
            goalkeeperContext.shotPower * 0.28 +
            goalkeeperContext.shotPlacement * 0.24 +
            (finalGkResult.goalkeeperAction === "DEFLECTION" ? 18 : 0),
        ),
        contactRisk: clamp(defensiveBlockPressure + finishingPressure * 0.32),
        players: snapshot.beforeMetadata.playerStates,
      });
      const reboundContinuation = resolveReboundContinuation(reboundContinuationContext);
      const possessionAfterShot: ResolvedPossessionAfterShot =
        reboundContinuation.nextPossession === "PENDING"
          ? reboundResolution.nextPossession === "PENDING"
            ? initialPossessionAfterShot
            : reboundResolution.nextPossession
          : reboundContinuation.nextPossession;
      const difficultyFactors: ShotDifficultyFactors =
        ballOutcome === "GOAL" && difficultyResolution.difficultyFactors.finalShotSuccessScore < difficultyResolution.difficultyFactors.outcomeThreshold
          ? {
              ...difficultyResolution.difficultyFactors,
              finalShotSuccessScore: difficultyResolution.difficultyFactors.outcomeThreshold,
              cleanWindowAdjustedScore: difficultyResolution.difficultyFactors.outcomeThreshold,
            }
          : ballOutcome !== "GOAL" && difficultyResolution.difficultyFactors.finalShotSuccessScore >= difficultyResolution.difficultyFactors.outcomeThreshold
            ? {
                ...difficultyResolution.difficultyFactors,
                finalShotSuccessScore: difficultyResolution.difficultyFactors.outcomeThreshold - 1,
                cleanWindowAdjustedScore: difficultyResolution.difficultyFactors.outcomeThreshold - 1,
              }
            : difficultyResolution.difficultyFactors;
      const pointsAdded = scoringEvent?.points ?? 0;

      if (scoringEvent !== undefined) {
        usedScoringEventIndexes.add(scoringEventIndex);
        if (scoringEvent.teamId === input.result.state.context.teamA.id) {
          controlScore += scoringEvent.points;
        } else {
          blitzScore += scoringEvent.points;
        }
      }

      const scoreAfter = scoreText({ controlName, control: controlScore, blitz: blitzScore, blitzName });

      return {
        actionId: formatActionId(snapshot),
        sequenceId: `Sequence ${snapshot.sequenceNumber}`,
        shootingTeamId: snapshot.beforeTruthContract.possessionTeamId,
        shooterId: snapshot.beforeTruthContract.ballCarrierId,
        shooterInitials,
        shootingTeamName: snapshot.attackingTeamName,
        defendingTeamId: snapshot.beforeTruthContract.defendingTeamId,
        defendingTeamName: snapshot.defendingTeamName,
        shotOriginZone,
        shotTargetType: "GOAL_FRAME_TARGET",
        shotTargetFrame: goalkeeperContext.shotTargetFrame,
        shotType: "FOOT_STRIKE",
        shotLegality: legal ? "LEGAL" : "ILLEGAL",
        shotLegalityReason: "Controlled foot shot is legal in the current abstract finishing model.",
        shotOnTarget: goalkeeperContext.shotOnTarget,
        shotPower: goalkeeperContext.shotPower,
        shotPlacement: goalkeeperContext.shotPlacement,
        shotAngleDifficulty: goalkeeperContext.shotAngleDifficulty,
        goalkeeperId: goalkeeperContext.goalkeeperId,
        goalkeeperInitials:
          snapshot.beforeMetadata.playerStates.find((player) => player.playerId === goalkeeperContext.goalkeeperId)?.roleInitials ?? "GK",
        goalkeeperZone: goalkeeperContext.goalkeeperZone,
        goalkeeperInsideGoalArea: goalkeeperContext.goalkeeperInsideGoalArea,
        goalkeeperLegalHandUseAvailable: goalkeeperContext.goalkeeperLegalHandUseAvailable,
        goalkeeperSetPositionScore: goalkeeperContext.goalkeeperSetPositionScore,
        goalkeeperReactionScore: goalkeeperContext.goalkeeperReactionScore,
        goalkeeperReachScore: goalkeeperContext.goalkeeperReachScore,
        goalkeeperHandlingScore: goalkeeperContext.goalkeeperHandlingScore,
        goalkeeperFootSaveScore: goalkeeperContext.goalkeeperFootSaveScore,
        goalkeeperPhysicalFatigue: goalkeeperContext.goalkeeperFatigueProfile.goalkeeperPhysicalFatigue,
        goalkeeperMentalFatigue: goalkeeperContext.goalkeeperFatigueProfile.goalkeeperMentalFatigue,
        goalkeeperReadinessState: goalkeeperContext.goalkeeperFatigueProfile.goalkeeperReadinessState,
        concentrationLoad: goalkeeperContext.goalkeeperFatigueProfile.concentrationLoad,
        shotsFacedRecently: goalkeeperContext.goalkeeperFatigueProfile.shotsFacedRecently,
        timeSinceLastAction: goalkeeperContext.goalkeeperFatigueProfile.timeSinceLastAction,
        pressureContext: goalkeeperContext.goalkeeperFatigueProfile.pressureContext,
        defensiveOrganizationInFront: goalkeeperContext.goalkeeperFatigueProfile.defensiveOrganizationInFront,
        previousErrorFlag: goalkeeperContext.goalkeeperFatigueProfile.previousErrorFlag,
        reboundControlScore: goalkeeperContext.goalkeeperFatigueProfile.reboundControlScore,
        secondSaveRecoveryScore: goalkeeperContext.goalkeeperFatigueProfile.secondSaveRecoveryScore,
        goalkeeperAction: finalGkResult.goalkeeperAction,
        gkShotStopping: finalGkResult,
        shotQuality,
        goalkeeperChallenge,
        defensiveBlockPressure,
        finishingPressure,
        difficultyFactors,
        ballOutcome,
        possessionAfterShot,
        reboundResolution,
        reboundContinuationContext,
        reboundContinuation,
        scoringImpact: {
          ...(scoringEvent === undefined ? {} : { teamId: scoringEvent.teamId }),
          pointsAdded,
          scoreBefore,
          scoreAfter,
          reason:
            scoringEvent === undefined
              ? "No score update was produced by the finishing resolver for this shot."
              : `${scoringEvent.teamName} SHOT_GOAL scoring event links this shot to ${scoringEvent.points} points.`,
        },
        outcomeReason:
          ballOutcome === "GOAL"
            ? `${shooterInitials} shoots from ${shotOriginZone} and beats ${snapshot.defendingTeamName} ${snapshot.beforeMetadata.playerStates.find((player) => player.playerId === goalkeeperContext.goalkeeperId)?.roleInitials ?? "GK"} after goalkeeper evaluation; final shot success score ${difficultyFactors.finalShotSuccessScore} meets threshold ${difficultyFactors.outcomeThreshold}.`
            : `${shooterInitials}'s shot from ${shotOriginZone} resolves as ${ballOutcome}; ${finalGkResult.gkOutcomeReason}`,
        outcomeStatus: "PASS",
      };
    });
}

export function summarizeShotOutcomeScore(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
}): ShotOutcomeScoreSummary {
  const controlName = input.result.state.context.teamA.displayName;
  const blitzName = input.result.state.context.teamB.displayName;
  const controlGoalPoints = input.outcomes
    .filter((outcome) => outcome.scoringImpact.teamId === input.result.state.context.teamA.id)
    .reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0);
  const blitzGoalPoints = input.outcomes
    .filter((outcome) => outcome.scoringImpact.teamId === input.result.state.context.teamB.id)
    .reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0);
  const finalScoreFromOutcomes = scoreText({ controlName, control: controlGoalPoints, blitz: blitzGoalPoints, blitzName });
  const finalScoreReported = scoreText({
    controlName,
    control: input.result.summary.finalScore.teamA,
    blitz: input.result.summary.finalScore.teamB,
    blitzName,
  });

  return {
    finalScoreReported,
    finalScoreFromOutcomes,
    scoreSource: finalScoreFromOutcomes === finalScoreReported ? "SHOT_OUTCOME_RESOLUTION" : "ABSTRACT_FALLBACK",
    controlGoals: input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && outcome.shootingTeamName === controlName).length,
    blitzGoals: input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && outcome.shootingTeamName === blitzName).length,
    controlGoalPoints,
    blitzGoalPoints,
    controlShots: input.outcomes.filter((outcome) => outcome.shootingTeamName === controlName).length,
    blitzShots: input.outcomes.filter((outcome) => outcome.shootingTeamName === blitzName).length,
    pendingShotOutcomes: input.outcomes.filter((outcome) => outcome.ballOutcome === "PENDING").length,
    scoreMismatchCount: finalScoreFromOutcomes === finalScoreReported ? 0 : 1,
  };
}
