import { scoreSourceLabel } from "./scoreSourceLabel";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoreSourceLabel(): readonly string[] {
  const fullMatch = scoreSourceLabel("full_match_report");
  const scoringEvents = scoreSourceLabel("live_scoring_events_sample");
  const batch = scoreSourceLabel("batch_diagnostic");

  assertTest(fullMatch.label === "Score du rapport full-match", "full-match report score label must be available.");
  assertTest(scoringEvents.label === "Échantillon live scoring-events", "scoring-events sample label must be available.");
  assertTest(batch.label === "Diagnostic batch séparé", "batch diagnostics label must be available.");
  assertTest(scoringEvents.compactNote.includes("distinct du score affiché"), "scoring-events sample label must not imply scores are the same.");
  assertTest(batch.compactNote.includes("ne remplacent jamais"), "batch label must not imply it replaces full-match score.");
  assertTest(!fullMatch.canMutateScore && !scoringEvents.canMutateScore && !batch.canMutateScore, "score labels must not mutate score values.");

  return [
    "full-match report score label is available",
    "scoring-events sample label is available when needed",
    "batch diagnostics label is available when needed",
    "labels do not imply the scores are the same",
    "labels do not mutate score values",
  ];
}

if (require.main === module) {
  const checks = validateScoreSourceLabel();

  console.log("scoreSourceLabel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
