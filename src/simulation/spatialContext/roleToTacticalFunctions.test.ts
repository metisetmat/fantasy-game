import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { hasExplicitTacticalFunctionMapping, tacticalFunctionsForRole } from "./roleToTacticalFunctions";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRoleToTacticalFunctions(): readonly string[] {
  const roles = new Set(sequence1Action1WorkbenchTruth.playerPositions.map((position) => position.role));

  for (const role of roles) {
    assertTest(hasExplicitTacticalFunctionMapping(role), `role ${role} must have explicit tactical functions.`);
    assertTest(tacticalFunctionsForRole(role).length > 0, `role ${role} must map to at least one tactical function.`);
  }

  return [
    "every CONTROL/BLITZ workbench role has explicit tactical functions",
    "every mapped role has at least one tactical function",
  ];
}

if (require.main === module) {
  const checks = validateRoleToTacticalFunctions();

  console.log("roleToTacticalFunctions tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
