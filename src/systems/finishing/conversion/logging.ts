import { createLogLine } from "../../interactions/shared/logging";
import type { TacticalLogLine } from "../../interactions/shared";
import type { ConversionContextEvaluation, ConversionQualityEvaluation, FinishingStyleEvaluation } from "./types";

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function createConversionQualityLogs(input: {
  readonly teamName: string;
  readonly style: FinishingStyleEvaluation;
  readonly context: ConversionContextEvaluation;
  readonly quality: ConversionQualityEvaluation;
}): readonly TacticalLogLine[] {
  return [
    createLogLine(`${input.teamName} finishing style: ${input.style.identity}.`),
    createLogLine(`Style effect: ${input.style.description}.`),
    createLogLine(`Finishing context: ${input.context.contextQuality}.`),
    ...input.context.reasons.map((reason) => createLogLine(`- ${reason}`)),
    createLogLine(`Finishing quality: ${input.quality.conversionQuality}.`),
    ...input.quality.breakdown.map((item) => createLogLine(`- ${item.label} ${formatSigned(Math.round(item.value))}`)),
  ];
}
