import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSourceOfTruthGuards3W(): readonly string[] {
  try {
    assertCanMakeGlobalScoringEconomyClaim("WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    assertTest(message.includes("50-match economy"), "sandbox decision panel rejection must mention 50-match economy.");
    assertTest(message.includes("single runFullMatch harness output"), "sandbox decision panel rejection must mention single-run limitation.");

    return [
      "sandbox decision panel cannot make global scoring economy claims",
      "sandbox decision panel guard message mentions 50-match economy",
      "sandbox decision panel guard message mentions single-run limitation",
    ];
  }

  throw new Error("WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL must not make global scoring economy claims.");
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3W();

  console.log("source-of-truth guard 3W tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
