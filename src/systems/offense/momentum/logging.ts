import { createLogLine } from "../../interactions/shared/logging";
import type { TacticalLogLine } from "../../interactions/shared";
import type { OffensiveMomentumState } from "./types";

export function createOffensiveMomentumLogs(input: {
  readonly teamName: string;
  readonly momentum: OffensiveMomentumState;
}): readonly TacticalLogLine[] {
  return [
    createLogLine(`${input.teamName} offensive momentum: ${input.momentum.level} (${input.momentum.score} / 100).`),
    createLogLine("Momentum explainability:"),
    ...input.momentum.reasons.map((reason) => createLogLine(`- ${reason}`)),
  ];
}
