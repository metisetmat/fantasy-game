import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import type { DecisionDimensionEvaluation, TacticalPhaseEvaluation, TacticalPhaseState } from "./types";

export function createTacticalPhaseLogs(evaluation: TacticalPhaseEvaluation): readonly TacticalLogLine[] {
  return [
    createLogLine("Tactical phase state:"),
    createLogLine(`${evaluation.phase}.`),
    createLogLine("Reasons:"),
    ...evaluation.reasons.map((reason) => createLogLine(`- ${reason}`)),
    createLogLine("State effect:"),
    ...evaluation.effects.map((effect) => createLogLine(`- ${effect}`)),
  ];
}

export function createPersistedPhaseLog(phase: TacticalPhaseState): TacticalLogLine {
  return createLogLine(`Persistent tactical phase: ${phase}.`);
}

export function createDecisionDimensionLogs(evaluation: DecisionDimensionEvaluation): readonly TacticalLogLine[] {
  return [
    createLogLine("Decision dimensions:"),
    createLogLine(`- tactical choice: ${evaluation.tacticalChoice}`),
    createLogLine(`- execution: ${evaluation.technicalExecution}`),
    createLogLine(`- emotional control: ${evaluation.emotionalControl}`),
    createLogLine(`- support: ${evaluation.structuralSupport}`),
    ...evaluation.reasons.map((reason) => createLogLine(`- ${reason}`)),
  ];
}
