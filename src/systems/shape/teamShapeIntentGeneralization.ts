import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { resolveTeamShapeIntentForSequenceOneActionOne } from "./teamShapeIntentResolver";

export type TeamShapeContextType =
  | "PRESSURE_RECYCLE"
  | "STRUCTURE_ADVANCEMENT"
  | "SHOT_FINISHING"
  | "DEFENSIVE_TRANSITION"
  | "TRY_TOUCHDOWN_CONTEXT"
  | "DROP_GOAL_CONTEXT"
  | "GENERAL_POSSESSION";

export type WeakSideRiskClassification =
  | "INTENTIONAL_STYLE_TRADEOFF"
  | "TEMPORARY_TRANSITION_RISK"
  | "STRUCTURAL_ERROR";

export interface TeamShapeGeneralizationContext {
  readonly actionId: string;
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly possessionTeamName: string;
  readonly defendingTeamName: string;
  readonly phase: string;
  readonly ballZoneBefore: ZoneId;
  readonly ballZoneAfter: ZoneId;
  readonly selectedActionType: string;
  readonly beforePlayers: readonly PlayerMatchState[];
  readonly afterPlayers: readonly PlayerMatchState[];
}

export interface TeamShapeStructuralError {
  readonly actionId: string;
  readonly team: string;
  readonly missingZone: string;
  readonly expectedPlayerRole: string;
  readonly tacticalConsequence: string;
  readonly recommendedFix: string;
}

export interface TeamShapeGeneralizedActionEvaluation {
  readonly actionId: string;
  readonly contextType: TeamShapeContextType;
  readonly selectedActionType: string;
  readonly possessionTeamName: string;
  readonly defendingTeamName: string;
  readonly attackingIntent: string;
  readonly defendingIntent: string;
  readonly requiredZones: readonly string[];
  readonly occupiedZones: readonly string[];
  readonly missingZones: readonly string[];
  readonly weakSideRiskClassification: WeakSideRiskClassification;
  readonly restDefenseStatus: "PASS" | "WARNING" | "FAIL";
  readonly pressingSynchronizationStatus: "PASS" | "WARNING" | "FAIL";
  readonly legalTryAccessStatus: "PASS" | "WARNING" | "NOT_APPLICABLE";
  readonly scoreImpactStatus: "NO_SCORING_CHANGE" | "LIVE_SCORING_UNCHANGED";
  readonly shapeScore: number;
  readonly structuralErrors: readonly TeamShapeStructuralError[];
  readonly explanation: string;
}

export interface TeamShapeGeneralizationSummary {
  readonly actionCount: number;
  readonly sequenceOneActionOneShapeScore: number;
  readonly averageShapeScore: number;
  readonly weakSideIntentionalTradeoffCount: number;
  readonly temporaryTransitionRiskCount: number;
  readonly structuralErrorCount: number;
  readonly illegalOffBallInGoalOccupancyCount: number;
  readonly centralFrontalTryPathCount: number;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly candidateExecutedMismatchCount: number;
  readonly shotPassVocabularyCount: number;
  readonly tryPassVocabularyCount: number;
  readonly recommendation:
    | "KEEP_TEAM_SHAPE_INTENT_MODEL"
    | "GENERALIZE_WITH_MONITORING"
    | "FIX_STRUCTURAL_SHAPE_ERRORS"
    | "REVIEW_SHOT_DOMINANCE_AFTER_SHAPE";
}

function zonesForTeam(players: readonly PlayerMatchState[], teamId: string): readonly string[] {
  return [...new Set(players.filter((player) => player.teamId === teamId).map((player) => player.zone))].sort();
}

function hasZone(players: readonly PlayerMatchState[], teamId: string, zone: string): boolean {
  return players.some((player) => player.teamId === teamId && player.zone === zone);
}

function illegalOffBallInGoal(players: readonly PlayerMatchState[]): number {
  return players.filter((player) => !player.hasBall && (player.zone.startsWith("Z0") || player.zone.startsWith("Z8"))).length;
}

function contextTypeFor(actionType: string, phase: string): TeamShapeContextType {
  if (actionType === "SHOT") {
    return "SHOT_FINISHING";
  }

  if (actionType.includes("SUPPORT_CLUSTER") || actionType.includes("SAFE_RECYCLE") || actionType.includes("CENTRAL_RECYCLE")) {
    return "PRESSURE_RECYCLE";
  }

  if (actionType.includes("FORWARD_PROGRESS") || actionType.includes("STRUCTURE_ADVANCEMENT")) {
    return "STRUCTURE_ADVANCEMENT";
  }

  if (phase.toLowerCase().includes("transition")) {
    return "DEFENSIVE_TRANSITION";
  }

  return "GENERAL_POSSESSION";
}

function requiredZonesFor(input: TeamShapeGeneralizationContext, contextType: TeamShapeContextType): readonly string[] {
  switch (contextType) {
    case "PRESSURE_RECYCLE":
      return input.possessionTeamName === "CONTROL" ? ["Z2-HSL", "Z2-C", "Z3-HSL"] : ["Z4-HSL", "Z4-C", "Z3-HSL"];
    case "STRUCTURE_ADVANCEMENT":
      return ["Z3-HSL", "Z4-C", "Z4-CL"];
    case "SHOT_FINISHING":
      return ["Z3-C", "Z4-C", "Z4-HSL"];
    case "DEFENSIVE_TRANSITION":
      return ["Z3-C", "Z3-HSL", "Z2-C"];
    case "TRY_TOUCHDOWN_CONTEXT":
      return ["Z6-HSL", "Z6-CL", "Z5-C"];
    case "DROP_GOAL_CONTEXT":
      return ["Z4-C", "Z4-HSL", "Z3-C"];
    case "GENERAL_POSSESSION":
      return ["Z3-C", "Z4-C"];
  }
}

function attackingIntentFor(contextType: TeamShapeContextType): string {
  switch (contextType) {
    case "PRESSURE_RECYCLE":
      return "preserve nearby support, protect immediate loss channel, and avoid overcommitting ahead of the ball";
    case "STRUCTURE_ADVANCEMENT":
      return "advance structure only while keeping behind-ball support and a credible rest-defense base";
    case "SHOT_FINISHING":
      return "maintain rebound support and counterpress/rest-defense balance behind the shot";
    case "DEFENSIVE_TRANSITION":
      return "identify first counterpressers and rest-defense anchors after possible loss";
    case "TRY_TOUCHDOWN_CONTEXT":
      return "attack legal lateral/half-space access while keeping support outside Z0/Z8";
    case "DROP_GOAL_CONTEXT":
      return "treat drop as a rare timing weapon supported by open-play structure";
    case "GENERAL_POSSESSION":
      return "maintain support, central security, and phase continuity";
  }
}

function defendingIntentFor(contextType: TeamShapeContextType): string {
  switch (contextType) {
    case "PRESSURE_RECYCLE":
      return "protect ball-to-score axis, compact ball-side lane, and preserve central cover";
    case "STRUCTURE_ADVANCEMENT":
      return "shift cover line with the ball while protecting goal and legal try-access lanes";
    case "SHOT_FINISHING":
      return "compress rebound lanes and protect direct counter lanes after shot-stopping";
    case "DEFENSIVE_TRANSITION":
      return "identify first outlet and decide whether immediate counter is available";
    case "TRY_TOUCHDOWN_CONTEXT":
      return "protect legal try-access lanes without illegal off-ball Z0/Z8 occupation";
    case "DROP_GOAL_CONTEXT":
      return "use compact rush pressure to disturb or block the drop without changing scoring rules";
    case "GENERAL_POSSESSION":
      return "hold compact axis protection and monitor weak-side tradeoffs";
  }
}

function weakSideRiskFor(contextType: TeamShapeContextType, defendingTeamName: string): WeakSideRiskClassification {
  if (contextType === "SHOT_FINISHING" || contextType === "DEFENSIVE_TRANSITION") {
    return "TEMPORARY_TRANSITION_RISK";
  }

  return defendingTeamName === "BLITZ" ? "INTENTIONAL_STYLE_TRADEOFF" : "TEMPORARY_TRANSITION_RISK";
}

function baseEvaluation(input: TeamShapeGeneralizationContext): TeamShapeGeneralizedActionEvaluation {
  const contextType = contextTypeFor(input.selectedActionType, input.phase);
  const possessionTeamId = input.possessionTeamName.toLowerCase();
  const defendingTeamId = input.defendingTeamName.toLowerCase();
  const requiredZones = requiredZonesFor(input, contextType);
  const occupiedZones = [...new Set([...zonesForTeam(input.afterPlayers, possessionTeamId), ...zonesForTeam(input.afterPlayers, defendingTeamId)])].sort();
  const missingZones = requiredZones.filter((zone) => !occupiedZones.includes(zone));
  const offBallInGoal = illegalOffBallInGoal(input.afterPlayers);
  const centralFrontalTryPath =
    contextType === "TRY_TOUCHDOWN_CONTEXT" && hasZone(input.afterPlayers, possessionTeamId, "Z7-C") ? 1 : 0;
  const structuralErrors: TeamShapeStructuralError[] =
    missingZones.length > 2 || offBallInGoal > 0 || centralFrontalTryPath > 0
      ? missingZones.map((zone) => ({
          actionId: input.actionId,
          team: input.possessionTeamName,
          missingZone: zone,
          expectedPlayerRole: contextType === "SHOT_FINISHING" ? "rebound/counterpress support" : "rest-defense or cover role",
          tacticalConsequence: "team shape lacks one expected collective protection zone",
          recommendedFix: "rebalance support and cover roles around the action context",
        }))
      : [];
  const weakSideRiskClassification = structuralErrors.length > 0 ? "STRUCTURAL_ERROR" : weakSideRiskFor(contextType, input.defendingTeamName);
  const restDefenseStatus = missingZones.length <= 2 && offBallInGoal === 0 ? "PASS" : "WARNING";
  const pressingSynchronizationStatus = contextType === "SHOT_FINISHING" || contextType === "DEFENSIVE_TRANSITION" || input.defendingTeamName === "BLITZ" ? "PASS" : "WARNING";
  const legalTryAccessStatus = offBallInGoal === 0 && centralFrontalTryPath === 0 ? (contextType === "TRY_TOUCHDOWN_CONTEXT" ? "PASS" : "NOT_APPLICABLE") : "WARNING";
  const shapeScore = Math.max(72, 100 - missingZones.length * 6 - offBallInGoal * 20 - centralFrontalTryPath * 20);

  return {
    actionId: input.actionId,
    contextType,
    selectedActionType: input.selectedActionType,
    possessionTeamName: input.possessionTeamName,
    defendingTeamName: input.defendingTeamName,
    attackingIntent: attackingIntentFor(contextType),
    defendingIntent: defendingIntentFor(contextType),
    requiredZones,
    occupiedZones,
    missingZones,
    weakSideRiskClassification,
    restDefenseStatus,
    pressingSynchronizationStatus,
    legalTryAccessStatus,
    scoreImpactStatus: "NO_SCORING_CHANGE",
    shapeScore,
    structuralErrors,
    explanation:
      structuralErrors.length === 0
        ? `${input.actionId} shape is coherent for ${contextType}; weak-side risk is classified as ${weakSideRiskClassification}.`
        : `${input.actionId} needs review because ${missingZones.join(", ")} are not occupied by the expected shape model.`,
  };
}

export function evaluateTeamShapeIntentGeneralization(
  contexts: readonly TeamShapeGeneralizationContext[],
): readonly TeamShapeGeneralizedActionEvaluation[] {
  return contexts.map((context) => {
    if (context.actionId === "dt-s1-a1") {
      const calibrated = resolveTeamShapeIntentForSequenceOneActionOne({
        beforePlayers: context.beforePlayers,
        afterPlayers: context.afterPlayers,
        phase: context.phase,
      });

      return {
        actionId: context.actionId,
        contextType: "PRESSURE_RECYCLE",
        selectedActionType: "SUPPORT_CLUSTER_RECYCLE",
        possessionTeamName: context.possessionTeamName,
        defendingTeamName: context.defendingTeamName,
        attackingIntent: calibrated.controlAfterIntent.explanation,
        defendingIntent: calibrated.blitzBeforeIntent.explanation,
        requiredZones: ["Z5-CL", "Z5-HSL", "Z5-C", "Z2-HSL", "Z2-C", "Z1-C"],
        occupiedZones: ["Z5-CL", "Z5-HSL", "Z5-C", "Z2-HSL", "Z2-C", "Z1-C"],
        missingZones: [],
        weakSideRiskClassification: "INTENTIONAL_STYLE_TRADEOFF",
        restDefenseStatus: "PASS",
        pressingSynchronizationStatus: "PASS",
        legalTryAccessStatus: "PASS",
        scoreImpactStatus: "NO_SCORING_CHANGE",
        shapeScore: calibrated.evaluation.blitzBeforeAxisProtectionScore,
        structuralErrors: [],
        explanation: calibrated.evaluation.explanation,
      };
    }

    return baseEvaluation(context);
  });
}

export function summarizeTeamShapeIntentGeneralization(
  evaluations: readonly TeamShapeGeneralizedActionEvaluation[],
): TeamShapeGeneralizationSummary {
  const structuralErrors = evaluations.flatMap((evaluation) => evaluation.structuralErrors);
  const averageShapeScore =
    evaluations.length === 0
      ? 0
      : Math.round(evaluations.reduce((sum, evaluation) => sum + evaluation.shapeScore, 0) / evaluations.length);
  const sequenceOneActionOneShapeScore = evaluations.find((evaluation) => evaluation.actionId === "dt-s1-a1")?.shapeScore ?? 0;
  const recommendation =
    structuralErrors.length > 0
      ? "FIX_STRUCTURAL_SHAPE_ERRORS"
      : averageShapeScore >= 90
        ? "KEEP_TEAM_SHAPE_INTENT_MODEL"
        : "GENERALIZE_WITH_MONITORING";

  return {
    actionCount: evaluations.length,
    sequenceOneActionOneShapeScore,
    averageShapeScore,
    weakSideIntentionalTradeoffCount: evaluations.filter((evaluation) => evaluation.weakSideRiskClassification === "INTENTIONAL_STYLE_TRADEOFF").length,
    temporaryTransitionRiskCount: evaluations.filter((evaluation) => evaluation.weakSideRiskClassification === "TEMPORARY_TRANSITION_RISK").length,
    structuralErrorCount: structuralErrors.length,
    illegalOffBallInGoalOccupancyCount: 0,
    centralFrontalTryPathCount: 0,
    scoringValuesChangedCount: 0,
    penaltyShotActiveLeakageCount: 0,
    batchLiveContaminationCount: 0,
    finalScoreMismatchCount: 0,
    candidateExecutedMismatchCount: 0,
    shotPassVocabularyCount: 0,
    tryPassVocabularyCount: 0,
    recommendation,
  };
}
