import type { TacticalLogLine } from "../../interactions/shared";
import { createLogLine } from "../../interactions/shared";
import { applyRecoverySaturationImpact } from "./applyRecoverySaturationImpact";
import type { RecoverySaturationState } from "./types";

export function createRecoverySaturationLogs(input: {
  readonly teamName: string;
  readonly saturation: RecoverySaturationState;
}): readonly TacticalLogLine[] {
  const impact = applyRecoverySaturationImpact(input.saturation);

  return [
    createLogLine(`${input.teamName} recovery saturation: ${input.saturation.level} (${input.saturation.score} / 100).`),
    ...(input.saturation.level === "LOW" || input.saturation.reasons.length === 0
      ? []
      : [
          createLogLine("Reason:"),
          ...input.saturation.reasons.map((reason) => createLogLine(`- ${reason}`)),
        ]),
    ...(input.saturation.level === "LOW"
      ? []
      : [
          createLogLine("Recovery impact:"),
          createLogLine(`- recovery quality -${impact.recoveryQualityPenalty}`),
          createLogLine(`- Free Safety effectiveness -${impact.freeSafetyPenalty}`),
          createLogLine(`- compactness -${impact.compactnessPenalty}`),
          createLogLine(`- last-line save chance -${impact.lastLineSavePenalty}`),
        ]),
  ];
}
