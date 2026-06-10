import { diagnoseActionSelection, type ActionSelectionDiagnostic, type ActionSelectionDiagnosticInput } from "./actionSelectionDiagnostic";

export function calibrateActionSelection(input: ActionSelectionDiagnosticInput): ActionSelectionDiagnostic {
  return diagnoseActionSelection(input);
}
