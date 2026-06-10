import { existsSync } from "node:fs";
import { join } from "node:path";
import { extractSequenceOneActionOneWorkbenchTruthFromHtml } from "./extractWorkbenchTruth";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { validateSequenceOneActionOneWorkbenchTruth } from "./tacticalWorkbenchContractGuard";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateTacticalWorkbenchContractGuard(): readonly string[] {
  const workbenchPath = join(__dirname, "..", "..", "..", "reports", "workbench", "sequence-1-action-1.html");
  const extracted = extractSequenceOneActionOneWorkbenchTruthFromHtml(workbenchPath);
  const checks = validateSequenceOneActionOneWorkbenchTruth(sequence1Action1WorkbenchTruth);

  assertTest(existsSync(workbenchPath), "sequence-1-action-1 workbench HTML must exist.");
  assertTest(extracted.selectedAction.actorId === "control-tempo-half", "selected action actor must be TH.");
  assertTest(extracted.selectedAction.receiverId === "control-mobile-lock", "selected action receiver must be ML.");
  assertTest(extracted.afterState?.ballZone === "Z3-HSL", "after ball zone must be Z3-HSL.");
  assertTest(extracted.playerPositions.length >= 20, "extracted before positions must include both teams.");
  assertTest((extracted.afterPlayerPositions ?? []).length >= 10, "extracted after positions must include tactical after-state.");

  return checks;
}

if (require.main === module) {
  const checks = validateTacticalWorkbenchContractGuard();

  console.log("tacticalWorkbenchContractGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
