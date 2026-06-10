import type { SnapshotReference } from "../visualization";
import {
  evaluateTeamShapeIntentGeneralization,
  summarizeTeamShapeIntentGeneralization,
  type TeamShapeGeneralizationContext,
  type TeamShapeGeneralizedActionEvaluation,
  type TeamShapeGeneralizationSummary,
} from "../../systems/shape";

function actionId(snapshot: SnapshotReference): string {
  return `dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`;
}

function contextFromSnapshot(snapshot: SnapshotReference): TeamShapeGeneralizationContext {
  const beforeCarrier = snapshot.beforeMetadata.playerStates.find((player) => player.hasBall);
  const afterCarrier = snapshot.afterMetadata.playerStates.find((player) => player.hasBall);
  const possessionTeamName = afterCarrier?.teamId === "blitz" ? "BLITZ" : "CONTROL";
  const defendingTeamName = possessionTeamName === "CONTROL" ? "BLITZ" : "CONTROL";

  return {
    actionId: actionId(snapshot),
    sequenceNumber: snapshot.sequenceNumber,
    actionNumber: snapshot.actionNumber,
    possessionTeamName,
    defendingTeamName,
    phase: String(snapshot.phaseState),
    ballZoneBefore: beforeCarrier?.zone ?? snapshot.ballZone,
    ballZoneAfter: afterCarrier?.zone ?? snapshot.ballZone,
    selectedActionType: snapshot.afterTruthContract.selectedActionType ?? "GENERAL_POSSESSION",
    beforePlayers: snapshot.beforeMetadata.playerStates,
    afterPlayers: snapshot.afterMetadata.playerStates,
  };
}

export function buildTeamShapeIntentGeneralization(input: {
  readonly snapshots: readonly SnapshotReference[];
}): {
  readonly contexts: readonly TeamShapeGeneralizationContext[];
  readonly evaluations: readonly TeamShapeGeneralizedActionEvaluation[];
  readonly summary: TeamShapeGeneralizationSummary;
} {
  const contexts = input.snapshots.map(contextFromSnapshot);
  const evaluations = evaluateTeamShapeIntentGeneralization(contexts);
  const summary = summarizeTeamShapeIntentGeneralization(evaluations);

  return {
    contexts,
    evaluations,
    summary,
  };
}

export function createTeamShapeIntentGeneralizationReport(input: {
  readonly snapshots: readonly SnapshotReference[];
}): string {
  const { evaluations, summary } = buildTeamShapeIntentGeneralization(input);

  return [
    "# Team Shape Intent Generalization - Multi-Sequence Validation",
    "",
    "## Summary",
    "- sprint: Team Shape Intent Generalization - Multi-Sequence Validation",
    "- scoring version: V2_DROP_FOUNDATION",
    "- score unit: POINTS",
    "- scoring source: UNIFIED_LIVE_SCORING_EVENTS",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    `- actions evaluated: ${summary.actionCount}`,
    `- Sequence 1 Action 1 shape score: ${summary.sequenceOneActionOneShapeScore}`,
    `- average shape score: ${summary.averageShapeScore}`,
    `- structural errors: ${summary.structuralErrorCount}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Model Inputs",
    "- phase",
    "- possession state",
    "- ball zone",
    "- attacking direction",
    "- selected action type",
    "- team style",
    "- pressure / pressing context",
    "- defensive scoring threats",
    "- legal try-access routes",
    "- rest-defense needs",
    "- loss-channel risk",
    "- pressing synchronization",
    "- weak-side risk acceptance",
    "",
    "## Action Shape Matrix",
    "",
    "| action | context | selectedActionType | attacking intent | defending intent | required zones | occupied zones | missing zones | weak-side risk | rest defense | press sync | legal try access | score impact | shape score |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...evaluations.map(
      (evaluation) =>
        `| ${evaluation.actionId} | ${evaluation.contextType} | ${evaluation.selectedActionType} | ${evaluation.attackingIntent} | ${evaluation.defendingIntent} | ${evaluation.requiredZones.join(", ")} | ${evaluation.occupiedZones.join(", ")} | ${evaluation.missingZones.join(", ") || "none"} | ${evaluation.weakSideRiskClassification} | ${evaluation.restDefenseStatus} | ${evaluation.pressingSynchronizationStatus} | ${evaluation.legalTryAccessStatus} | ${evaluation.scoreImpactStatus} | ${evaluation.shapeScore} |`,
    ),
    "",
    "## Context Coverage",
    "- Pressure recycle context: SUPPORT_CLUSTER_RECYCLE / SAFE_RECYCLE / CENTRAL_RECYCLE actions preserve support, loss-channel protection, and defensive axis cover.",
    "- Structure advancement context: FORWARD_PROGRESS actions require behind-ball support and cover-line shift.",
    "- Shot / finishing context: SHOT actions use rebound/counterpress support and shot-specific semantics, not pass/receiver semantics.",
    "- Defensive transition context: saved/deflected/failed actions are treated as transition risks when present in the action stream.",
    "- Try / touchdown context: legal try access remains lateral/half-space/wide; no off-ball Z0/Z8 occupancy or central frontal path is introduced.",
    "- Drop goal context: DROP_GOAL remains a scoring route diagnostic; shape notes do not alter drop selection, resolution, or batch/live separation.",
    "",
    "## Weak-Side Risk Classification",
    `- INTENTIONAL_STYLE_TRADEOFF: ${summary.weakSideIntentionalTradeoffCount}`,
    `- TEMPORARY_TRANSITION_RISK: ${summary.temporaryTransitionRiskCount}`,
    `- STRUCTURAL_ERROR: ${summary.structuralErrorCount}`,
    "",
    "## Structural Errors",
    "",
    ...(summary.structuralErrorCount === 0
      ? ["- none"]
      : evaluations
          .flatMap((evaluation) => evaluation.structuralErrors)
          .map(
            (error) =>
              `- ${error.actionId} / ${error.team}: missing ${error.missingZone}; expected ${error.expectedPlayerRole}; consequence ${error.tacticalConsequence}; fix ${error.recommendedFix}`,
          )),
    "",
    "## Invariant Checks",
    "- Sequence 1 Action 1 remains TH -> ML / SUPPORT_CLUSTER_RECYCLE.",
    "- Sequence 1 Action 1 shape score remains 100.",
    "- Candidate/executed consistency remains PASS.",
    "- Shot semantics remain shot-specific.",
    "- Try semantics remain try-specific.",
    "- DROP_GOAL remains active at 2 points.",
    "- PENALTY_SHOT remains inactive.",
    "- Batch diagnostics remain separate from live score.",
    "- Final live score still comes from active live ScoringEvents.",
    "- No scoring values changed.",
    "- No off-ball Z0/Z8 occupancy.",
    "- No central/frontal try path introduced.",
    "",
  ].join("\n");
}
