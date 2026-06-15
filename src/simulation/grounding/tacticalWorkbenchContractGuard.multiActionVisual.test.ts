import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  extractSequenceOneActionThreeWorkbenchTruthFromHtml,
  extractSequenceOneActionTwoWorkbenchTruthFromHtml,
} from "./extractWorkbenchTruth";
import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";
import {
  validateSequenceOneActionThreeWorkbenchTruth,
  validateSequenceOneActionTwoWorkbenchTruth,
  validateSequenceOneMultiActionWorkbenchChainTruth,
} from "./tacticalWorkbenchContractGuard";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function workbenchPath(file: string): string {
  return join(__dirname, "..", "..", "..", "reports", "workbench", file);
}

export function validateTacticalWorkbenchContractGuardMultiActionVisual(): readonly string[] {
  const action2Path = workbenchPath("sequence-1-action-2.html");
  const action3Path = workbenchPath("sequence-1-action-3.html");
  const action2 = extractSequenceOneActionTwoWorkbenchTruthFromHtml(action2Path);
  const action3 = extractSequenceOneActionThreeWorkbenchTruthFromHtml(action3Path);
  const checks = [
    ...validateSequenceOneActionTwoWorkbenchTruth(action2),
    ...validateSequenceOneActionThreeWorkbenchTruth(action3),
    ...validateSequenceOneMultiActionWorkbenchChainTruth(),
  ];

  assertTest(existsSync(action2Path), "sequence-1-action-2 visual truth artifact must exist.");
  assertTest(existsSync(action3Path), "sequence-1-action-3 visual truth artifact must exist.");
  assertTest(action2.selectedAction.actorId === "control-mobile-lock", "sequence-1-action-2 selected actor must be ML.");
  assertTest(action2.selectedAction.receiverId === "control-playmaker", "sequence-1-action-2 selected receiver must be PM.");
  assertTest(action2.ballZone === "Z3-HSL" && action2.afterState?.ballZone === "Z3-C", "sequence-1-action-2 must transition Z3-HSL -> Z3-C.");
  assertTest(action3.selectedAction.actorId === "control-playmaker", "sequence-1-action-3 selected actor must be PM.");
  assertTest(action3.selectedAction.receiverId === "control-space-hunter", "sequence-1-action-3 selected receiver must be SH.");
  assertTest(action3.ballZone === "Z3-C" && action3.afterState?.ballZone === "Z4-HSR", "sequence-1-action-3 must transition Z3-C -> Z4-HSR.");
  assertTest(action2.playerPositions.some((player) => player.renderedZone !== undefined && player.renderedZone !== player.realZone), "action 2 must keep rendered offsets distinct.");
  assertTest(action3.playerPositions.some((player) => player.renderedZone !== undefined && player.renderedZone !== player.realZone), "action 3 must keep rendered offsets distinct.");
  assertTest(sequence1MultiActionChain.steps.every((step) => step.stepSource.source === "visual_workbench_truth"), "all chain steps must be visual workbench truth.");
  assertTest(!sequence1MultiActionChain.steps.some((step) => step.stepSource.source === "synthetic_continuation"), "no synthetic_continuation may remain.");

  return checks;
}

if (require.main === module) {
  const checks = validateTacticalWorkbenchContractGuardMultiActionVisual();

  console.log("tacticalWorkbenchContractGuard.multiActionVisual tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
