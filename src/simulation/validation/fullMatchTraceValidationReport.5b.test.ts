import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";
import {
  renderFullMatchWorkbenchChainReplay5BDoc,
  renderFullMatchWorkbenchChainReplay5BValidation,
} from "./fullMatchTraceValidationReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function extractSaveOperation(report: string): string {
  const match = report.match(/- save operation: ([a-z_]+)/);

  if (match === null) {
    throw new Error("save operation must be visible in the 5B report.");
  }

  return match[1] ?? "";
}

export function validateFullMatchTraceValidationReport5B(): readonly string[] {
  const model = runFullMatchTraceValidationModel();
  const summary = renderFullMatchWorkbenchChainReplay5BDoc(model);
  const validation = renderFullMatchWorkbenchChainReplay5BValidation(model);
  const summaryOperation = extractSaveOperation(summary);
  const validationOperation = extractSaveOperation(validation);

  assertTest(summaryOperation === validationOperation, "5B summary and validation must share the same save operation observation.");
  assertTest(summaryOperation !== "not_available", "5B save operation must be explicit.");

  return [
    "5B summary and validation share the same save operation observation",
    "5B save operation is explicit",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationReport5B();

  console.log("fullMatchTraceValidationReport.5b tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
