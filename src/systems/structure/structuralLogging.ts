import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import { PlayerRole } from "../../models/player";
import type { PlayerDerivedNumericalPressure } from "../players";
import { getTacticalReportMode, TacticalReportMode } from "../explainability";
import { PlayerStructuralState, type DefensiveParticipationEvaluation } from "./types";
import { formatStructuralRole } from "./playerStructuralState";

function formatPlayerCount(players: readonly { readonly roleInitials: string; readonly zone: string }[]): string {
  if (players.length === 0) {
    return "0 (none)";
  }

  return `${players.length} (${players.map((player) => `${player.roleInitials}@${player.zone}`).join(", ")})`;
}

export function createDefensiveParticipationLogs(input: {
  readonly teamName: string;
  readonly participation: DefensiveParticipationEvaluation;
  readonly playerDerivedNumericalPressure?: PlayerDerivedNumericalPressure;
}): readonly TacticalLogLine[] {
  const mobileLock = input.participation.players.find((player) => player.role === PlayerRole.MobileLock);
  const lastLineProtector =
    input.participation.players.find((player) => player.role === PlayerRole.GoalkeeperFreeSafety) ??
    input.participation.players.find((player) => player.role === PlayerRole.FreeSafety);
  const lateCount = input.participation.delayedDefenders;
  const playerDerived = input.playerDerivedNumericalPressure;
  const mode = getTacticalReportMode();
  const showEstimatedStructure = playerDerived === undefined || mode === TacticalReportMode.DeepDebug;
  const playerDerivedStateLogs =
    playerDerived === undefined
      ? []
      : [
          createLogLine("Player-derived defensive state:"),
          createLogLine(`- ${input.teamName} defenders goal-side: ${playerDerived.defendersGoalSide.length}`),
          createLogLine(`- delayed/recovering: ${formatPlayerCount(playerDerived.delayedDefenders)}`),
          createLogLine(
            playerDerived.bypassedDefenders.length > 0
              ? `- line bypassed: ${formatPlayerCount(playerDerived.bypassedDefenders)}`
              : "- line bypassed: none",
          ),
        ];

  return [
    createLogLine(`### ${input.teamName} Defensive Structural Reading`),
    createLogLine(`${input.teamName} defensive participation:`),
    ...playerDerivedStateLogs,
    ...(showEstimatedStructure
      ? [
          createLogLine(`- [ESTIMATED] ${input.participation.counts.inStructure} defenders still in structure`),
          createLogLine(`- [ESTIMATED] ${input.participation.counts.recovering} defenders recovering`),
          createLogLine(`- [ESTIMATED] ${input.participation.counts.delayed} defenders delayed`),
          createLogLine(`- [ESTIMATED] ${input.participation.counts.eliminated} defenders eliminated`),
        ]
      : []),
    createLogLine(
      mobileLock?.state === PlayerStructuralState.Covering
        ? `- [ESTIMATED] ${formatStructuralRole(mobileLock.role)} covering ${mobileLock.zone}`
        : "- [ESTIMATED] Mobile Lock not in a covering position",
    ),
    createLogLine(
      lastLineProtector?.state === PlayerStructuralState.Covering
        ? `- [ESTIMATED] ${formatStructuralRole(lastLineProtector.role)} protecting depth in ${lastLineProtector.zone}`
        : "- [ESTIMATED] Goalkeeper / Free Safety not protecting depth",
    ),
    createLogLine(
      playerDerived === undefined
        ? lateCount > 0
          ? `[ESTIMATED] Defensive recovery delayed: ${lateCount} defenders not yet back in structure.`
          : "[ESTIMATED] Defensive recovery connected: block remains mostly in structure."
        : playerDerived.delayedDefenders.length > 0
          ? `[CALCULATED FROM PLAYERS] Defensive recovery delayed: ${playerDerived.delayedDefenders.length} defenders not yet back in structure.`
          : "[CALCULATED FROM PLAYERS] Defensive recovery connected: no delayed or eliminated defenders in player state.",
    ),
    ...(mode === TacticalReportMode.DeepDebug
      ? [createLogLine(`[NARRATIVE] Structural reason: ${input.participation.explanation}.`)]
      : []),
  ];
}
