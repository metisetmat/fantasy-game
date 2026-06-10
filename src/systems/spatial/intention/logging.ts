import type { TacticalLogLine } from "../../interactions/shared";
import { createLogLine } from "../../interactions/shared";
import { explainabilityLogs } from "../../explainability";
import { describeAttackingDirection } from "./attackingDirection";
import {
  OffensiveOptionType,
  SpatialMoveType,
  type BallContext,
  type OffensiveOptionEvaluation,
  type OffensiveUrgencyEvaluation,
  type TargetZoneSelection,
  type ZoneAttractivenessEvaluation,
} from "./types";

function formatRole(role: string): string {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createBallContextLogs(input: {
  readonly teamName: string;
  readonly defendingTeamName?: string;
  readonly ballContext: BallContext;
  readonly phaseState?: string;
}): readonly TacticalLogLine[] {
  return [
    createLogLine("### Action Context"),
    createLogLine(`[CALCULATED] Possession team: ${input.teamName}.`),
    ...(input.defendingTeamName === undefined
      ? []
      : [createLogLine(`[CALCULATED] Defending team: ${input.defendingTeamName}.`)]),
    createLogLine(
      `[CALCULATED] Ball: ${input.teamName} ${formatRole(input.ballContext.ballCarrierRole)} in ${input.ballContext.ballLocation}.`,
    ),
    createLogLine(`[CALCULATED] Ball zone: ${input.ballContext.ballLocation}.`),
    createLogLine(
      `[CALCULATED] ${input.teamName} attacks from ${describeAttackingDirection(input.ballContext.attackingDirection)}.`,
    ),
    ...(input.phaseState === undefined ? [] : [createLogLine(`[CALCULATED] Phase state: ${input.phaseState}.`)]),
  ];
}

export function createTargetSelectionLogs(
  selection: TargetZoneSelection,
  teamName = "Attacking team",
): readonly TacticalLogLine[] {
  const selectedTarget = selection.selectedLabel ?? selection.selectedZone;
  const rankedRows = createRankedRows(selection);
  const selectedRow = rankedRows.find((row) => row.selected);
  const selectedRank = selectedRow?.rank ?? 0;
  const overrideApplied = selectedRow !== undefined && selectedRank > 1;
  const decisionExplainability =
    selectedRow === undefined
      ? []
      : explainabilityLogs([
          createLogLine("Decision explainability:"),
          createLogLine(`- selected ${selectedRow.action} to ${selectedRow.to} because ${selection.reason}`),
          ...(overrideApplied
            ? [
                createLogLine(
                  `- Override applied: selected option was rank ${selectedRank} by final score before override.`,
                ),
                createLogLine("- Override reason: tactical selection rule promoted the chosen option after candidate scoring."),
                createLogLine(`- Post-override rank: 1 for execution handoff.`),
              ]
            : []),
          ...rankedRows.slice(1, 4).map((row) =>
            row.selected
              ? createLogLine(`- ${row.action} to ${row.to} selected from rank ${row.rank}: ${row.factors}`)
              : row.score <= selectedRow.score
                ? createLogLine(
                    `- ${row.action} to ${row.to} lost by ${Math.max(0, selectedRow.score - row.score)} points: ${row.factors}`,
                  )
                : createLogLine(
                    `- ${row.action} to ${row.to} ranked ${row.rank} by final score but was not selected because override applied: ${row.factors}`,
                  ),
          ),
          createLogLine(
            "- threshold note: vertical actions must overcome support, pressure, and verticality costs",
          ),
        ]);

  return [
    createLogLine(`### ${teamName} Attacking Team Reasoning`),
    createLogLine("Ranked target candidates:"),
    createLogLine("| Rank | From | To | Action | Legal | Base | Key modifiers | Final score |"),
    createLogLine("| --- | --- | --- | --- | --- | --- | --- | --- |"),
    ...rankedRows.map((row) =>
      createLogLine(`| ${row.rank} | ${row.from} | ${row.to} | ${row.action} | ${row.legal} | ${row.baseScore} | ${row.factors} | ${row.score} |`),
    ),
    ...(overrideApplied
      ? [
          createLogLine("Override applied: YES."),
          createLogLine(`Pre-override rank: ${selectedRank}.`),
          createLogLine("Post-override rank: 1 for execution handoff."),
        ]
      : [createLogLine("Override applied: NO.")]),
    createLogLine(`Selected target: ${selectedTarget}.`),
    createLogLine(`Move type: ${selection.moveType}.`),
    createLogLine(`Selection reason: ${selection.reason}.`),
    ...decisionExplainability,
  ];
}

export function createOffensiveUrgencyLogs(urgency: OffensiveUrgencyEvaluation): readonly TacticalLogLine[] {
  return [
    createLogLine(`Offensive urgency: ${urgency.level} (${urgency.score} / 100).`),
    createLogLine("Reasons:"),
    ...urgency.reasons.map((reason) => createLogLine(`- ${reason}`)),
  ];
}

function formatModifiers(modifiers: readonly { readonly label: string; readonly value: number }[]): string {
  if (modifiers.length === 0) {
    return "";
  }

  return `, ${modifiers
    .map((modifier) => `${modifier.label} ${modifier.value >= 0 ? "+" : ""}${modifier.value}`)
    .join(", ")}`;
}

interface RankedTargetRow {
  readonly from: string;
  readonly to: string;
  readonly action: string;
  readonly legal: "YES" | "NO";
  readonly baseScore: number;
  readonly score: number;
  readonly rank: number;
  readonly factors: string;
  readonly selected: boolean;
}

function simplifyAction(moveType: SpatialMoveType): string {
  switch (moveType) {
    case SpatialMoveType.Progression:
      return "PROGRESSION";
    case SpatialMoveType.DirectVerticalAttack:
      return "DIRECT_ATTACK";
    case SpatialMoveType.LateralCirculation:
      return "LATERAL";
    case SpatialMoveType.BackwardRecycle:
      return "RECYCLE";
    case SpatialMoveType.WeakSideSwitch:
      return "WEAK_SIDE_SWITCH";
    case SpatialMoveType.SafetyClearance:
      return "SAFETY";
    case SpatialMoveType.Finishing:
      return "FINISHING";
  }
}

function rowFactors(evaluation: ZoneAttractivenessEvaluation): string {
  const localFactors =
    evaluation.localAdvantage === undefined
      ? []
      : [
          `${evaluation.localAdvantage.numerical.attackersInTarget}v${evaluation.localAdvantage.numerical.defendersInTarget}`,
          `lane ${evaluation.localAdvantage.passingLane.difficulty}`,
          `receiver ${evaluation.localAdvantage.receiver.level}`,
        ];
  const modifiers = evaluation.modifiers
    .filter((modifier) => Math.abs(modifier.value) >= 3)
    .slice(0, 3)
    .map((modifier) => `${modifier.label} ${modifier.value >= 0 ? "+" : ""}${modifier.value}`);

  if (modifiers.length > 0) {
    return [...localFactors, ...modifiers].slice(0, 5).join(" / ");
  }

  return [...localFactors, ...evaluation.reasons.slice(0, 2)].slice(0, 5).join(" / ");
}

function estimateBaseScore(score: number, modifiers: readonly { readonly value: number }[]): number {
  return Math.max(0, Math.min(100, score - modifiers.reduce((sum, modifier) => sum + modifier.value, 0)));
}

function optionFactors(option: OffensiveOptionEvaluation): string {
  return option.reasons.slice(0, 3).join(" / ");
}

function createFinishingRow(selection: TargetZoneSelection): RankedTargetRow | null {
  const finishingOption = selection.optionEvaluations.find((option) => option.optionType === OffensiveOptionType.Finishing);

  if (finishingOption === undefined) {
    return null;
  }

  return {
    from: selection.fromZone,
    to: finishingOption.label,
    action: "FINISHING",
    legal: "YES",
    baseScore: Math.max(0, Math.min(100, finishingOption.score)),
    score: finishingOption.score,
    factors: optionFactors(finishingOption),
    rank: 0,
    selected: selection.moveType === SpatialMoveType.Finishing,
  };
}

function createRankedRows(selection: TargetZoneSelection): readonly RankedTargetRow[] {
  const zoneRows: readonly RankedTargetRow[] = selection.evaluations.map((evaluation) => ({
    from: selection.fromZone,
    to: evaluation.zone,
    action: simplifyAction(evaluation.moveType),
    legal: "YES",
    baseScore: estimateBaseScore(evaluation.score, evaluation.modifiers),
    score: evaluation.score,
    factors: rowFactors(evaluation),
    rank: 0,
    selected: selection.moveType !== SpatialMoveType.Finishing && evaluation.zone === selection.selectedZone,
  }));
  const finishingRow = createFinishingRow(selection);
  const rows = [...zoneRows, ...(finishingRow === null ? [] : [finishingRow])];
  const ranked = [...rows].sort((left, right) => right.score - left.score).map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  const selectedRow = ranked.find((row) => row.selected);
  const topRows = ranked.slice(0, 6);

  if (selectedRow !== undefined && !topRows.some((row) => row.selected)) {
    return [...topRows.slice(0, 5), selectedRow];
  }

  return topRows;
}
