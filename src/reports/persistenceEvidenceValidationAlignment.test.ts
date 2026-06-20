import { runFullMatchTraceValidationModel } from "../simulation/validation/fullMatchTraceValidationComparisons";
import { renderFullMatchWorkbenchChainReplay5CValidation } from "../simulation/validation/fullMatchTraceValidationReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceValidationAlignment(): readonly string[] {
  const validation = renderFullMatchWorkbenchChainReplay5CValidation(runFullMatchTraceValidationModel());

  assertTest(validation.includes("Status: PASS"), "validation report must pass.");
  assertTest(validation.includes("- save operation: inserted"), "validation must contain snapshot save operation.");
  assertTest(validation.includes("- records before save count: 5"), "validation must contain snapshot before count.");
  assertTest(validation.includes("- records after save count: 6"), "validation must contain snapshot after count.");
  assertTest(validation.includes("- loaded from disk count: 0"), "validation must contain snapshot loaded count.");
  assertTest(validation.includes("- written to disk count: 6"), "validation must contain snapshot written count.");
  assertTest(validation.includes("- deduped record count: 0"), "validation must contain snapshot dedupe count.");
  assertTest(validation.includes("- replaced record count: 0"), "validation must contain snapshot replaced count.");
  assertTest(validation.includes("- ignored duplicate count: 0"), "validation must contain snapshot ignored count.");
  assertTest(validation.includes("- queried record count: 6"), "validation must contain snapshot queried record count.");
  assertTest(validation.includes("- queried signal count: 40"), "validation must contain snapshot queried signal count.");

  return [
    "validation contains snapshot save operation",
    "validation contains snapshot counters",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceValidationAlignment();
  console.log("persistenceEvidenceValidationAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
