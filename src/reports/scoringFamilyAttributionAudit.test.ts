import assert from "node:assert/strict";
import { test } from "node:test";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";

test("builds a PASS scoring family attribution audit for the full-match fixture", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const audit = buildScoringFamilyAttributionAuditModel(report);

  assert.equal(audit.status, "PASS");
  assert.equal(audit.totalScoringEventCount > 0, true);
  assert.equal(audit.unknownScoringEventCount, 0);
  assert.equal(audit.unknownScoringPointTotal, 0);
  assert.equal(audit.attributionCoverageRate, 100);
  assert.equal(audit.legacyUnknownScoringEventCount > audit.unknownScoringEventCount, true);
  assert.equal(audit.scoringEventsByFamily.UNKNOWN, 0);
  assert.equal(audit.scoringPointsByFamily.UNKNOWN, 0);
  assert.equal(audit.scoringEventsByFamily.SHOT_GOAL > 0, true);
  assert.equal(audit.scoringPointsByFamily.SHOT_GOAL > 0, true);
});

test("keeps Sprint 6B attribution as a report-only audit without score mutation", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const audit = buildScoringFamilyAttributionAuditModel(report);

  assert.equal(audit.scoringConstantsChanged, false);
  assert.equal(audit.scoreCapApplied, false);
  assert.equal(audit.postHocRewriteApplied, false);
  assert.equal(audit.scoringEventsDeleted, false);
  assert.equal(audit.scoringEventsRewritten, false);
  assert.equal(audit.forcedOpponentScoreApplied, false);
  assert.equal(audit.batchLiveSeparationPreserved, true);
  assert.equal(audit.matchBonusEventChanged, false);
  assert.equal(audit.persistenceUsedForAttribution, false);
  assert.equal(audit.sqliteUsedAsScoreEconomySource, false);
  assert.equal(audit.fullMatchBatchEconomyRemainsOnlyGlobalProof, true);
});

test("downgrades attributed audits with classifier warnings to WARNING", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoringIndex = report.timeline.findIndex((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change")
  );

  assert.equal(scoringIndex >= 0, true);

  const timeline = [...report.timeline];
  const scoringEvent = timeline[scoringIndex];
  if (scoringEvent === undefined) {
    throw new Error("Expected a scoring event in the full-match fixture.");
  }

  timeline[scoringIndex] = {
    ...scoringEvent,
    scoringFamily: "PENALTY_SHOT",
    scoringAction: "PENALTY_SHOT",
    scoringAttributionWarningCodes: ["INACTIVE_PENALTY_SHOT_USED"],
    tags: [
      ...scoringEvent.tags.filter((tag) => !tag.startsWith("scoring_type_") && !tag.startsWith("scoring_family_") && !tag.startsWith("scoring_action_")),
      "scoring_type_penalty",
      "scoring_family_PENALTY_SHOT",
      "scoring_action_PENALTY_SHOT",
    ],
  };

  const audit = buildScoringFamilyAttributionAuditModel({
    ...report,
    timeline,
  });

  assert.equal(audit.status, "WARNING");
  assert.equal(audit.unknownScoringEventCount, 0);
  assert.ok(audit.familyAttributionWarnings.includes("INACTIVE_PENALTY_SHOT_USED"));
});
