import { createLogLine, type TacticalLogLine } from "../../interactions/shared";
import type { StructuralDistortionEvaluation } from "./types";

export function createStructuralDistortionLogs(input: {
  readonly teamName: string;
  readonly distortion: StructuralDistortionEvaluation;
}): readonly TacticalLogLine[] {
  return [
    createLogLine(`${input.teamName} structural distortion: ${input.distortion.level} (${input.distortion.score} / 100).`),
    createLogLine("Distortion effects:"),
    createLogLine(`- compactness penalty ${input.distortion.profile.compactnessPenalty}`),
    createLogLine(`- corridor stretch ${input.distortion.profile.corridorStretch}`),
    createLogLine(`- recovery delay ${input.distortion.profile.recoveryDelay} action(s)`),
    createLogLine(`- fold speed ${input.distortion.profile.foldSpeed} / 100`),
    createLogLine("Distortion triggers:"),
    ...input.distortion.triggers.map((trigger) => createLogLine(`- ${trigger}`)),
    createLogLine("Recovery factors:"),
    ...input.distortion.recoveryReasons.map((reason) => createLogLine(`- ${reason}`)),
  ];
}
