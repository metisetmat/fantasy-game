import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSourceOfTruthGuards3Y(): readonly string[] {
  try {
    assertCanMakeGlobalScoringEconomyClaim("WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION");
  } catch (error) {
    const rejection = error instanceof Error ? error.message : String(error);

    assertTest(rejection.includes("50-match economy"), "rejection must name the 50-match economy source.");
    assertTest(rejection.includes("single runFullMatch harness output"), "rejection must mention single-run limits.");

    return [
      "sandbox decision batch confidence calibration cannot make global economy claims",
      "FULL_MATCH_BATCH_ECONOMY remains the only global economy proof",
    ];
  }

  throw new Error("WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION must not make global economy claims.");
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3Y();

  console.log("sourceOfTruthGuards.3y tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
