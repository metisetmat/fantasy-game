import { runFullMatchTraceValidationModel } from "../simulation/validation/fullMatchTraceValidationComparisons";
import { renderFullMatchWorkbenchChainReplay5CDoc } from "../simulation/validation/fullMatchTraceValidationReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceMarkdownAlignment(): readonly string[] {
  const markdown = renderFullMatchWorkbenchChainReplay5CDoc(runFullMatchTraceValidationModel());

  assertTest(markdown.includes("## Persistence Evidence Alignment Summary"), "markdown must contain alignment summary.");
  assertTest(markdown.includes("- save operation: inserted"), "markdown must contain snapshot save operation.");
  assertTest(markdown.includes("- records before save count: 5"), "markdown must contain snapshot before count.");
  assertTest(markdown.includes("- records after save count: 6"), "markdown must contain snapshot after count.");
  assertTest(markdown.includes("- loaded from disk count: 0"), "markdown must contain snapshot loaded count.");
  assertTest(markdown.includes("- written to disk count: 6"), "markdown must contain snapshot written count.");
  assertTest(markdown.includes("- deduped record count: 0"), "markdown must contain snapshot dedupe count.");
  assertTest(markdown.includes("- replaced record count: 0"), "markdown must contain snapshot replaced count.");
  assertTest(markdown.includes("- ignored duplicate count: 0"), "markdown must contain snapshot ignored count.");
  assertTest(markdown.includes("- queried record count: 6"), "markdown must contain snapshot queried record count.");
  assertTest(markdown.includes("- queried signal count: 42"), "markdown must contain snapshot queried signal count.");

  return [
    "markdown contains snapshot save operation",
    "markdown contains snapshot counters",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceMarkdownAlignment();
  console.log("persistenceEvidenceMarkdownAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
