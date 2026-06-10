import type { TacticalLogLine } from "../../interactions/shared";
import { createLogLine } from "../../interactions/shared";
import type { DerivedAttributeDebugEntry, DerivedAttributeKey } from "./types";

function formatKey(key: DerivedAttributeKey): string {
  return key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
}

function formatTerm(entry: DerivedAttributeDebugEntry): string {
  return entry.terms.map((term) => `${term.label} ${term.value} * ${term.weight}`).join(" / ");
}

export function createDerivedAttributeDebugLogs(input: {
  readonly playerLabel: string;
  readonly entries: readonly DerivedAttributeDebugEntry[];
  readonly keys?: readonly DerivedAttributeKey[];
}): readonly TacticalLogLine[] {
  const keys = input.keys ?? ["supportTiming", "tacticalDiscipline", "goalkeeperResponse"];
  const selected = input.entries.filter((entry) => keys.includes(entry.key));

  return [
    createLogLine(`${input.playerLabel} derived attribute debug:`),
    ...selected.flatMap((entry) => [
      createLogLine(`- ${formatKey(entry.key)}:`),
      createLogLine(`  - inputs: ${formatTerm(entry)}`),
      createLogLine(`  - role modifier: ${entry.roleModifier >= 0 ? "+" : ""}${entry.roleModifier}`),
      createLogLine(`  - philosophy modifier: ${entry.philosophyModifier >= 0 ? "+" : ""}${entry.philosophyModifier}`),
      createLogLine(`  - normalized result: ${entry.normalizedResult}`),
    ]),
  ];
}
