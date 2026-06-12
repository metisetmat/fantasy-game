import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSourceOfTruthGuards3V(): readonly string[] {
  try {
    assertCanMakeGlobalScoringEconomyClaim("WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    assertTest(message.includes("50-match economy"), "coach-facing timeline review rejection must mention 50-match economy.");
    assertTest(message.includes("single runFullMatch harness output"), "coach-facing timeline review rejection must mention single-run limitation.");

    return [
      "coach-facing timeline review cannot make global scoring economy claims",
      "coach-facing timeline review guard message mentions 50-match economy",
      "coach-facing timeline review guard message mentions single-run limitation",
    ];
  }

  throw new Error("WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW must not make global scoring economy claims.");
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3V();

  console.log("source-of-truth guard 3V tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
