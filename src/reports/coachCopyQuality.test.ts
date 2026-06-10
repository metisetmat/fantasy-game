import { assertNoMojibake, containsMojibake, normalizeCoachFacingCopy } from "./coachCopyQuality";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachCopyQualityUtilities(): readonly string[] {
  const mojibake = "GÃƒÂ©nÃƒÂ©rÃƒÂ© depuis le rapport de match typÃƒÂ©.";
  const normalized = normalizeCoachFacingCopy(mojibake);

  assertTest(containsMojibake(mojibake), "mojibake marker must be detected.");
  assertTest(!containsMojibake("Résumé, Moments clés, Équipe, Événement."), "clean French copy must not be flagged.");
  assertTest(normalized.includes("Généré"), "normalizer must repair generated-copy mojibake.");
  assertTest(normalized.includes("typé"), "normalizer must repair typed-report mojibake.");
  assertNoMojibake(normalized, "normalized coach copy");

  return [
    "coach copy mojibake marker detection works",
    "clean French copy is accepted",
    "coach copy normalizer repairs generated-copy mojibake",
    "coach copy assertion accepts normalized French text",
  ];
}

if (require.main === module) {
  const checks = validateCoachCopyQualityUtilities();

  console.log("Coach copy quality tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
