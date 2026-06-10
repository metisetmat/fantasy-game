import { createLogLine, type TacticalLogLine } from "../../interactions/shared";
import type { UtilityActorSelection } from "./actionSelection";

export function createUtilityDebugLogs(input: {
  readonly label: string;
  readonly selection: UtilityActorSelection;
}): readonly TacticalLogLine[] {
  const selected = input.selection.selected;
  const topCandidates = input.selection.candidates.slice(0, 5);

  return [
    createLogLine(`Utility AI ${input.label}: ${selected.player.roleInitials ?? selected.player.role} selected ${selected.action} (${selected.score} / 100).`),
    ...topCandidates.flatMap((candidate, index) => [
      createLogLine(
        `- utility rank ${index + 1}: ${candidate.player.roleInitials ?? candidate.player.role} ${candidate.action} ${candidate.score}/100 (ability ${candidate.breakdown.playerAbility}, spatial ${candidate.breakdown.spatialContext}, perception ${candidate.breakdown.perceptionModifier}, role ${candidate.breakdown.roleResponsibility}, style ${candidate.breakdown.teamStyle})`,
      ),
      createLogLine(`- utility rank ${index + 1}: perception modifier ${candidate.breakdown.perceptionBreakdown}`),
      createLogLine(
        `- utility rank ${index + 1}: ${candidate.player.roleInitials ?? candidate.player.role} primary intent ${candidate.player.primaryIntent?.type ?? "NONE"} alignment ${candidate.breakdown.activeIntentMultiplier}/100 priority bonus ${candidate.breakdown.intentPriorityBonus}`,
      ),
    ]),
  ];
}
