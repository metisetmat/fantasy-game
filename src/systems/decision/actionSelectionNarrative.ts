import type { ActionSelectionCandidateDiagnostic, ActionSelectionDiagnostic } from "./actionSelectionDiagnostic";

function componentText(input: {
  readonly prefix: string;
  readonly components: readonly { readonly label: string; readonly value: number; readonly reason: string }[];
}): readonly string[] {
  return input.components.slice(0, 4).map((component) => `${input.prefix}${Math.abs(component.value)} ${component.label}: ${component.reason}`);
}

export function summarizeCandidateScore(candidate: ActionSelectionCandidateDiagnostic): readonly string[] {
  return [
    `rawCandidateScore: ${candidate.rawCandidateScore}`,
    ...componentText({ prefix: "+", components: candidate.scoring.bonuses }),
    ...componentText({ prefix: "-", components: candidate.scoring.penalties }),
    ...candidate.selectionAdjustments.map((adjustment) => `${adjustment.value >= 0 ? "+" : ""}${adjustment.value} ${adjustment.code}: ${adjustment.reason}`),
    `finalSelectionScore: ${candidate.finalSelectionScore}`,
  ];
}

export function summarizeActionSelectionDiagnostic(diagnostic: ActionSelectionDiagnostic): readonly string[] {
  return [
    `${diagnostic.selectedAction} is ${diagnostic.verdict} at finalSelectionScore ${diagnostic.selectedFinalSelectionScore}/100.`,
    `Best rejected alternative: ${diagnostic.bestRejectedAlternative}, rawCandidateScore ${diagnostic.bestRejectedRawScore}, finalSelectionScore ${diagnostic.bestRejectedFinalScore}.`,
    diagnostic.higherRawScoreDemotionReason,
    diagnostic.overConservatismReason,
    diagnostic.eliteOverrideCheck,
    `Expected next phase: ${diagnostic.expectedNextPhase}`,
  ];
}
