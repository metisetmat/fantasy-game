import type { SnapshotReference } from "../visualization";
import { TacticalPhaseState } from "../../systems/tacticalState";
import { FocusCategory } from "./focusCategories";

export interface FocusPriorityCandidate {
  readonly category: FocusCategory;
  readonly score: number;
  readonly reason: string;
}

function topDangerScore(snapshot: SnapshotReference): number {
  return snapshot.afterMetadata.dangerMap
    .map((zone) => zone.danger)
    .sort((left, right) => right - left)[0] ?? 0;
}

export function rankFocusCandidates(snapshot: SnapshotReference): readonly FocusPriorityCandidate[] {
  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  const hasRecovery = snapshot.afterMetadata.recoveryVectors.length > 0;
  const blindSide = snapshot.afterMetadata.blindSideClaims.length > 0;
  const overload = snapshot.afterMetadata.overloadWindows[0];
  const topDanger = topDangerScore(snapshot);
  const ballState = snapshot.afterMetadata.ballState;
  const phaseState = snapshot.phaseState;
  const selectedAction = snapshot.afterTruthContract.selectedActionType ?? "";
  const supportConnected = snapshot.afterMetadata.supportTriangle.connected;
  const candidates: FocusPriorityCandidate[] = [
    {
      category: FocusCategory.FinishingWindow,
      score: (selectedAction.includes("FINISHING") ? 42 : 0) + (topDanger >= 70 ? 38 : topDanger >= 60 ? 20 : 0),
      reason: "scoring danger and last-line access shape the frame",
    },
    {
      category: FocusCategory.WeakSideAttack,
      score: (blindSide ? 34 : 0) + (hasRecovery ? 18 : 0) + (lane?.laneState === "OPEN" || lane?.laneState === "TEMPORARY_WINDOW" ? 18 : 0),
      reason: "blind-side awareness and recovery timing create the main lane",
    },
    {
      category: FocusCategory.PressBreak,
      score: (lane?.laneState === "OPEN" ? 34 : lane?.laneState === "TEMPORARY_WINDOW" ? 26 : 0) + (snapshot.afterMetadata.defendingDistortion.score >= 55 ? 18 : 0),
      reason: "the pressure line is beaten through the selected lane",
    },
    {
      category: FocusCategory.OverloadCreation,
      score: overload === undefined ? 0 : 24 + overload.effectiveAdvantage * 8 + Math.max(0, overload.windowTicks) * 3,
      reason: "local numbers create the strongest visible advantage",
    },
    {
      category: FocusCategory.DelayedRecovery,
      score: hasRecovery ? 32 + snapshot.afterMetadata.recoveryVectors.length * 6 : 0,
      reason: "late defenders define the tactical tension",
    },
    {
      category: FocusCategory.ReboundPhase,
      score: ballState === "REBOUND" || ballState === "LOOSE" ? 45 : 0,
      reason: "loose-ball timing is the main story",
    },
    {
      category: FocusCategory.ChaosRecovery,
      score: phaseState === TacticalPhaseState.BrokenPlay ? 38 : phaseState === TacticalPhaseState.ChaoticAttackingAdvantage ? 30 : 0,
      reason: "the frame is about who organizes first after disorder",
    },
    {
      category: FocusCategory.DepthAttack,
      score: snapshot.afterMetadata.playerStates.some((player) => player.primaryIntent?.type === "ATTACK_DEPTH") ? 24 : 0,
      reason: "a runner is trying to stretch depth",
    },
    {
      category: FocusCategory.StructureReset,
      score: phaseState === TacticalPhaseState.Settled || selectedAction.includes("BUILD_UP") ? 18 : 0,
      reason: "the action is mainly about restoring possession structure",
    },
    {
      category: FocusCategory.SupportTriangle,
      score: supportConnected ? 20 : 0,
      reason: "connected support is the stabilizing mechanism",
    },
  ];

  return candidates
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.category.localeCompare(right.category));
}
