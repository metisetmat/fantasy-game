import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSourceOfTruthGuards3U(): readonly string[] {
  try {
    assertCanMakeGlobalScoringEconomyClaim("WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    assertTest(message.includes("50-match economy"), "official timeline diff view rejection must mention 50-match economy.");
    assertTest(message.includes("single runFullMatch harness output"), "official timeline diff view rejection must mention single-run limitation.");

    return [
      "official timeline diff view cannot make global scoring economy claims",
      "official timeline diff view guard message mentions 50-match economy",
      "official timeline diff view guard message mentions single-run limitation",
    ];
  }

  throw new Error("WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW must not make global scoring economy claims.");
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3U();

  console.log("source-of-truth guard 3U tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
