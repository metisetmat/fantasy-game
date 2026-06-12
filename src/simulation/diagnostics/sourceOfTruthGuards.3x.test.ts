import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSourceOfTruthGuards3X(): readonly string[] {
  try {
    assertCanMakeGlobalScoringEconomyClaim("WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    assertTest(message.includes("50-match economy"), "sandbox decision evidence rejection must mention 50-match economy.");
    assertTest(message.includes("single runFullMatch harness output"), "sandbox decision evidence rejection must mention single-run limitation.");

    return [
      "sandbox decision evidence calibration cannot make global scoring economy claims",
      "sandbox decision evidence guard message mentions 50-match economy",
      "sandbox decision evidence guard message mentions single-run limitation",
    ];
  }

  throw new Error("WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION must not make global scoring economy claims.");
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3X();

  console.log("source-of-truth guard 3X tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
