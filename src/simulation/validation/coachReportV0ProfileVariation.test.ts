import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";
import type { FullMatchTraceValidationCardId } from "./fullMatchTraceValidationProfiles";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function distinctCardValues(model: ReturnType<typeof runFullMatchTraceValidationModel>, cardId: FullMatchTraceValidationCardId): number {
  return new Set(model.profiles.map((profile) => profile.cardSignatureByCardId[cardId])).size;
}

export function validateCoachReportV0ProfileVariation(): readonly string[] {
  const model = runFullMatchTraceValidationModel();
  const allCardSignatures = model.profiles.map((profile) =>
    Object.values(profile.cardSignatureByCardId).join("||")
  );

  assertTest(new Set(allCardSignatures).size > 1, "Coach Report V0 must not produce identical card signatures for all profiles.");
  assertTest(distinctCardValues(model, "official_danger_zones") > 1, "danger zone card must change for at least one profile.");
  assertTest(distinctCardValues(model, "official_pressure_losses") > 1, "pressure loss card must change for at least one profile.");
  assertTest(distinctCardValues(model, "official_recoveries") > 1, "recoveries card must change for at least one profile.");
  assertTest(distinctCardValues(model, "official_recurring_causes") > 1, "recurring causes card must change for at least one profile.");
  assertTest(distinctCardValues(model, "official_coach_watchpoint") > 1, "watchpoint card must change for at least one profile.");

  return [
    "Coach Report V0 does not produce identical card summaries for all profiles",
    "danger zone card changes for at least one profile",
    "pressure loss card changes for at least one profile",
    "recoveries card changes for at least one profile",
    "recurring causes card changes for at least one profile",
    "watchpoint card changes for at least one profile",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV0ProfileVariation();

  console.log("coachReportV0ProfileVariation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
