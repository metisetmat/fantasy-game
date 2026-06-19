import { readFileSync } from "node:fs";
import { join } from "node:path";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceNoRendererSideEffects(): readonly string[] {
  const source = readFileSync(join(process.cwd(), "src", "reports", "renderCoachReportExportHtml.ts"), "utf8");

  assertTest(!/\.save\s*\(/u.test(source), "renderer must not call save.");
  assertTest(!/\.query\s*\(/u.test(source), "renderer must not call query.");
  assertTest(!source.includes("createFileBackedCoachMatchHistoryStore"), "renderer must not create or read a file-backed store.");
  assertTest(!source.includes("readFileSync"), "renderer must not read files.");
  assertTest(source.includes("persistenceEvidenceSnapshot"), "renderer must consume supplied persistence snapshot.");

  return [
    "renderer does not call save",
    "renderer does not call query",
    "renderer does not read or create file-backed stores",
    "renderer consumes supplied persistence snapshot",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceNoRendererSideEffects();
  console.log("persistenceEvidenceNoRendererSideEffects tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
