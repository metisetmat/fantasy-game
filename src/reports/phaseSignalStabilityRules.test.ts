import { classifyPhaseSignalStability } from "./buildCoachReportMultiMatchPhaseComparison";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePhaseSignalStabilityRules(): readonly string[] {
  const repeated = classifyPhaseSignalStability({ occurrenceCount: 3, sampleCount: 5 });

  assertTest(
    classifyPhaseSignalStability({ occurrenceCount: 1, sampleCount: 1 }) === "insufficient_data",
    "sample count under 2 must return insufficient_data.",
  );
  assertTest(
    classifyPhaseSignalStability({ occurrenceCount: 1, sampleCount: 3 }) === "visible_once",
    "occurrence count 1 must return visible_once.",
  );
  assertTest(
    classifyPhaseSignalStability({ occurrenceCount: 2, sampleCount: 3 }) === "repeated",
    "occurrence ratio >= 0.6 must return repeated.",
  );
  assertTest(
    classifyPhaseSignalStability({ occurrenceCount: 2, sampleCount: 4 }) === "unstable",
    "occurrence ratio below 0.6 must return unstable.",
  );
  assertTest(repeated === "repeated", "repeated classification must stay repeated.");

  return [
    "sample count under 2 returns insufficient data",
    "occurrence count 1 returns visible once",
    "occurrence ratio >= 0.6 returns repeated",
    "occurrence ratio below 0.6 returns unstable",
    "repeated does not equal officially confirmed",
  ];
}

if (require.main === module) {
  const checks = validatePhaseSignalStabilityRules();

  console.log("phaseSignalStabilityRules tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
