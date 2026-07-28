import {
  buildInvalidManualReviewIntakePayloadFixtures8N,
  buildValidManualReviewIntakePayloadFixture8N,
} from "./manualReviewResultIntakeContractAudit8N";
import type { ManualReviewResultIntakePayload8N } from "./manualReviewResultIntakeBoundaryTypes8N";
import { validateManualReviewResultIntakePayload8N } from "./validateManualReviewResultIntakePayload8N";
import { scoringRegistryEntry } from "../systems/scoring";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function clonePayload(payload: ManualReviewResultIntakePayload8N): ManualReviewResultIntakePayload8N {
  return JSON.parse(JSON.stringify(payload)) as ManualReviewResultIntakePayload8N;
}

export function validateManualReviewResultIntakeBoundary8N(): readonly string[] {
  const validPayload = buildValidManualReviewIntakePayloadFixture8N("test-match-8n");
  const beforeValidation = JSON.stringify(validPayload);
  const validResult = validateManualReviewResultIntakePayload8N(validPayload);
  const afterValidation = JSON.stringify(validPayload);
  const invalidResults = buildInvalidManualReviewIntakePayloadFixtures8N(validPayload);
  const invalidFixtureIds = new Set(invalidResults.map((fixture) => fixture.fixtureId));

  assertTest(validResult.status === "accepted_for_preview", "valid manual review intake payload must be accepted for preview.");
  assertTest(validResult.officialTruthStatus === "non_official_coach_review", "manual intake must remain non-official coach review.");
  assertTest(validResult.normalizedPayload?.entries.length === 3, "manual intake must keep exactly three linked entries.");
  assertTest(validResult.persistencePerformed === false, "validator must not persist.");
  assertTest(validResult.officialMutationPerformed === false, "validator must not promote official truth.");
  assertTest(validResult.scoreMutationPerformed === false, "validator must not mutate score.");
  assertTest(validResult.timelineMutationPerformed === false, "validator must not mutate timeline.");
  assertTest(validResult.automaticClassificationPerformed === false, "validator must not auto-classify.");
  assertTest(beforeValidation === afterValidation, "validator must not mutate its input payload.");

  for (const fixtureId of [
    "unknown-outcome",
    "invalid-entry-count",
    "duplicate-linked-section",
    "missing-source-match-id",
    "fractional-manual-count",
    "unknown-linked-section",
    "auto-classified",
    "official-truth",
    "persistence-intent",
    "score-mutation",
    "timeline-mutation",
    "scoring-event-mutation",
    "season-memory",
    "team-style-memory",
    "selection-automation",
    "tactical-instruction",
    "missing-acknowledgement",
  ]) {
    assertTest(invalidFixtureIds.has(fixtureId), `${fixtureId} invalid fixture must exist.`);
    assertTest(
      invalidResults.find((fixture) => fixture.fixtureId === fixtureId)?.result.status === "rejected",
      `${fixtureId} invalid fixture must be rejected.`,
    );
  }

  const canCreateMemoryPayload: Record<string, unknown> = {
    ...clonePayload(validPayload),
    entries: validPayload.entries.map((entry, index) =>
      index === 0 ? { ...entry, canCreateMemory: true } : entry
    ),
  };
  const canCreateMemoryResult = validateManualReviewResultIntakePayload8N(canCreateMemoryPayload);
  assertTest(canCreateMemoryResult.status === "rejected", "canCreateMemory=true must be rejected.");

  const serializedValidation = JSON.stringify(validResult);
  assertTest(!serializedValidation.includes("score_change"), "manual intake validation must not emit score_change.");
  assertTest(!serializedValidation.includes("MatchBonusEvent"), "manual intake validation must not mutate MatchBonusEvent.");
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

  return [
    "valid manual intake payload accepted for preview only",
    "invalid manual intake payloads rejected",
    "validator does not mutate input or persist data",
    "manual intake cannot mutate score, timeline, ScoringEvent, or MatchBonusEvent",
    "scoring constants unchanged and PENALTY_SHOT inactive",
  ];
}

if (require.main === module) {
  const checks = validateManualReviewResultIntakeBoundary8N();
  console.log("manualReviewResultIntakeBoundary8N tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
