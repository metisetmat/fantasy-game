import { analyzeMiniMatchWorkbenchAlignment } from "./miniMatchWorkbenchAlignment";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMiniMatchWorkbenchAlignment(): readonly string[] {
  const report = analyzeMiniMatchWorkbenchAlignment(sequence1Action1WorkbenchTruth);

  assertTest(report.status === "PARTIAL", `mini-match alignment must honestly be PARTIAL, received ${report.status}.`);
  assertTest(report.supportedTruths.some((truth) => truth.includes("SUPPORT_CLUSTER_RECYCLE")), "selected action type must be supported.");
  assertTest(report.supportedTruths.some((truth) => truth.includes("Z3-HSL")), "reception zone must be representable.");
  assertTest(report.missingTruths.some((truth) => truth.includes("official MatchInput roster")), "official roster gap must be named.");
  assertTest(report.lossyMappings.some((truth) => truth.includes("prototype")), "prototype lossy mapping must be named.");

  return [
    "mini-match alignment is PARTIAL, not fake PASS",
    "selected action semantics are partially supported",
    "official roster and workbench shape gaps are named",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchWorkbenchAlignment();

  console.log("miniMatchWorkbenchAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
