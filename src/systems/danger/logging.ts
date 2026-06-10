import { createLogLine, type TacticalLogLine } from "../interactions/shared";
import type { DangerMetricsEvaluation } from "./types";

export function createDangerMetricsLogs(metrics: DangerMetricsEvaluation): readonly TacticalLogLine[] {
  return [
    createLogLine("Danger metrics:"),
    createLogLine(`- chaos: ${metrics.chaosLevel} / 100`),
    createLogLine(`- structural break: ${metrics.structuralBreak} / 100`),
    createLogLine(
      `- numerical advantage: ${metrics.numericalAdvantage} / 100 (${metrics.attackingNumericalMargin >= 0 ? "+" : ""}${metrics.attackingNumericalMargin})`,
    ),
    createLogLine(`- lane access: ${metrics.laneAccess} / 100`),
    createLogLine(`- support quality: ${metrics.supportQuality} / 100`),
    createLogLine(`- goalkeeper exposure: ${metrics.goalkeeperExposure} / 100`),
    createLogLine(`- finishing viability: ${metrics.finishingViability} / 100`),
    createLogLine(`- conversion probability: ${metrics.conversionProbability} / 100`),
    createLogLine(`- final danger: ${metrics.finalDanger} / 100 (${metrics.finalDangerLevel})`),
    ...metrics.reasons.map((reason) => createLogLine(`- reason: ${reason}`)),
    ...metrics.warnings.map((warning) => createLogLine(`- warning: ${warning}`)),
  ];
}
