import { type FunctionalOccupationEvaluation, type PlayerFunctionalOccupation } from "./occupationTypes";

function formatPlayerRow(player: PlayerFunctionalOccupation): string {
  const topScores = player.functionScores
    .slice(0, 3)
    .map((score) => `${score.function} ${score.score}`)
    .join(", ");

  return `| ${player.roleInitials} | ${player.zone} | ${player.primaryFunction} | ${player.secondaryFunction} | ${player.structureFreedomBalance.structure}/${player.structureFreedomBalance.freedom} ${player.structureFreedomBalance.label} | ${player.occupationInterpretation.replace(/\|/g, "/")} | ${topScores} |`;
}

export function formatFunctionalOccupationMarkdown(evaluation: FunctionalOccupationEvaluation): readonly string[] {
  return [
    "### Functional Occupation",
    "",
    "| Player | Zone | Primary current function | Secondary current function | StructureFreedomBalance | occupation interpretation | Top function scores |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...evaluation.teams.flatMap((team) => team.players.map(formatPlayerRow)),
    "",
    "### Functional Occupation Validation",
    ...evaluation.teams.flatMap((team) => [
      `- ${team.style} ${team.teamId}: ${team.validation.status}`,
      ...team.validation.checks.map((check) => `  - ${check.status}: ${check.label} (${check.detail})`),
    ]),
  ];
}

export function summarizeFunctionalOccupation(evaluation: FunctionalOccupationEvaluation): readonly string[] {
  return evaluation.teams.flatMap((team) =>
    team.players.map(
      (player) =>
        `${team.style} ${player.roleInitials}@${player.zone}: ${player.primaryFunction} / ${player.secondaryFunction} - ${player.structureFreedomBalance.label}`,
    ),
  );
}
