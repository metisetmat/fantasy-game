import { createLogLine } from "../interactions/shared/logging";
import type { TacticalLogLine } from "../interactions/shared";
import { SequenceInteractionKind, type SequenceTacticalContext } from "./types";

function formatInteraction(interaction: SequenceInteractionKind): string {
  switch (interaction) {
    case SequenceInteractionKind.BuildUpUnderPressure:
      return "Build-Up Under Pressure";
    case SequenceInteractionKind.OffensiveTransition:
      return "Offensive Transition";
    case SequenceInteractionKind.OffensiveConstruction:
      return "Offensive Construction";
    case SequenceInteractionKind.Finishing:
      return "Finishing";
    case SequenceInteractionKind.OffensiveConstructionPending:
      return "Controlled Construction";
    case SequenceInteractionKind.SequenceSettled:
      return "Sequence Settled";
  }
}

function formatDelta(before: number, after: number): string {
  const delta = after - before;
  if (delta === 0) {
    return "no change";
  }

  return delta > 0 ? `+${delta}` : `${delta}`;
}

function formatStateReason(reason: string): string {
  return reason.endsWith(".") ? reason.slice(0, -1).toLowerCase() : reason.toLowerCase();
}

export function createSequenceStateLogs(input: {
  readonly before: SequenceTacticalContext;
  readonly after: SequenceTacticalContext;
  readonly reason: string;
}): readonly TacticalLogLine[] {
  const reason = formatStateReason(input.reason);

  return [
    createLogLine(""),
    createLogLine("Sequence state updated:"),
    createLogLine(`- chaos: ${input.after.chaosLevel} / 100 (${formatDelta(input.before.chaosLevel, input.after.chaosLevel)} because ${reason})`),
    createLogLine(
      `- possession stability: ${input.after.possessionStability} (${input.before.possessionStability} -> ${input.after.possessionStability} because ${reason})`,
    ),
    createLogLine(
      `- territorial pressure: ${input.after.territorialPressure} / 100 (${formatDelta(input.before.territorialPressure, input.after.territorialPressure)} because ${reason})`,
    ),
    createLogLine(
      `- current danger: ${input.after.currentDanger} (${input.before.currentDanger} -> ${input.after.currentDanger} because ${reason})`,
    ),
    createLogLine(
      `- weak side exposure: ${input.after.weakSideExposure} (${input.before.weakSideExposure} -> ${input.after.weakSideExposure} because ${reason})`,
    ),
    createLogLine(
      `- tactical phase state: ${input.after.tacticalPhaseState} (${input.before.tacticalPhaseState} -> ${input.after.tacticalPhaseState} because ${reason})`,
    ),
  ];
}

export function createNextInteractionLog(nextInteraction: SequenceInteractionKind): TacticalLogLine {
  if (nextInteraction === SequenceInteractionKind.OffensiveTransition) {
    return createLogLine("Transition triggered.");
  }

  if (
    nextInteraction === SequenceInteractionKind.OffensiveConstructionPending ||
    nextInteraction === SequenceInteractionKind.OffensiveConstruction
  ) {
    return createLogLine("Sequence enters controlled construction phase.");
  }

  if (nextInteraction === SequenceInteractionKind.Finishing) {
    return createLogLine("Finishing opportunity triggered.");
  }

  return createLogLine(`Next interaction: ${formatInteraction(nextInteraction)}.`);
}

export function combineSequenceLogs(logGroups: readonly (readonly TacticalLogLine[])[]): readonly TacticalLogLine[] {
  return logGroups.flat();
}
