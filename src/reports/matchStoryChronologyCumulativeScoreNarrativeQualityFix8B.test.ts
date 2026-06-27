import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildMatchStoryNarrativeQuality } from "./buildMatchStoryNarrativeQuality";
import { currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel } from "./matchStoryChronologyCumulativeScoreNarrativeQualityFix8B";
import type { OfficialMatchStoryBeat, OfficialMatchStorySegment } from "./officialMatchStorySpineTypes";
import { repairOfficialMatchStoryChronology } from "./repairOfficialMatchStoryChronology";

describe("Sprint 8B official match story chronology and narrative quality", () => {
  it("repairs cumulative segment scores, turning point order, and narrative quality without changing guardrails", () => {
    const model = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel();

    assert.equal(model.status, "PASS");
    assert.equal(model.storyChronologyReady, true);
    assert.equal(model.cumulativeScoreReady, true);
    assert.equal(model.turningPointOrderReady, true);
    assert.equal(model.narrativeQualityReady, true);
    assert.equal(model.storyRegressionFixed, true);
    assert.equal(model.cumulativeScoreAudit.finalCumulativeScoreMatchesOfficial, true);
    assert.equal(model.cumulativeScoreAudit.scoreResetCount, 0);
    assert.equal(model.chronologyAudit.scoreLabelAmbiguityCount, 0);
    assert.equal(model.turningPointOrderAudit.invalidFirstDangerLabelCount, 0);
    assert.equal(model.narrativeQualityAudit.mechanicalSentenceCount, 0);
    assert.equal(model.narrativeQualityAudit.repeatedSentenceCount, 0);
    assert.equal(model.sourceOfTruthRegressionAudit.inventedEventCount, 0);
    assert.equal(model.sourceOfTruthRegressionAudit.noForcedNarrativeOutcome, true);
    assert.ok(model.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B <= 900);
    assert.equal(model.guardrailsPreserved, true);
    assert.equal(model.nextSprintRecommendation, "8C - Attribute Role Fatigue Causality Deepening");
  });

  it("does not invent an opponent score response when one team owns every score_change", () => {
    const segment: OfficialMatchStorySegment = {
      ...currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel().storySpine.segments[0]!,
      scoreAfterCumulative: "control 14 - 0 blitz",
      segmentScoreLabel: "score cumule : control 14 - 0 blitz ; score du segment : 14-0",
      isScorelessSegment: false,
    };
    const scoreBeat: OfficialMatchStoryBeat = {
      ...currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel().storySpine.beats.find((beat) => beat.beatType === "score")!,
      teamId: "control",
      opponentTeamId: "blitz",
      minute: 2,
      beatType: "score",
    };
    const narrative = buildMatchStoryNarrativeQuality({
      officialScore: "14 - 0",
      segments: [segment],
      beats: [scoreBeat, { ...scoreBeat, beatId: "score-2", linkedOfficialEventId: "score-2", minute: 18 }],
      turningPoints: [],
      causalityLinks: [],
      scoreChangeEventCount: 2,
    });

    assert.equal(/blitz repond|blitz reste dans le recit par sa reponse officielle/iu.test(narrative.shortNarrative), false);
    assert.equal(/reponse au score que la timeline ne montre pas/iu.test(narrative.coachFacingNarrative), true);
  });

  it("counts same-minute earlier score events before repairing first-danger labels", () => {
    const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    });
    const scoreEvent = report.timeline.find((event) =>
      event.consequences.some((consequence) => consequence.type === "score_change" && (consequence.value ?? 0) > 0),
    );
    assert.notEqual(scoreEvent, undefined);
    const dangerEvent: MatchEvent = {
      ...(scoreEvent as MatchEvent),
      eventId: "same-minute-danger-after-score",
      eventType: "scoring",
      outcome: "advantage",
      consequences: [],
      timestamp: { ...scoreEvent!.timestamp, minute: 10, tick: 2 },
      tags: ["danger", "opportunity"],
    };
    const sameMinuteScore: MatchEvent = {
      ...(scoreEvent as MatchEvent),
      eventId: "same-minute-score-before-danger",
      timestamp: { ...scoreEvent!.timestamp, minute: 10, tick: 1 },
    };
    const sameMinuteReport: MatchReport = {
      ...report,
      timeline: [sameMinuteScore, dangerEvent, ...report.timeline.filter((event) => event.eventId !== scoreEvent?.eventId)],
    };
    const model = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel().storySpine;
    const dangerPoint = model.turningPoints.find((point) => point.turningPointType === "first_real_danger");
    assert.notEqual(dangerPoint, undefined);
    const repaired = repairOfficialMatchStoryChronology({
      ...model,
      turningPoints: [{
        ...(dangerPoint!),
        minute: 10,
        title: "Premier vrai danger officiel",
        linkedOfficialEventIds: ["same-minute-danger-after-score"],
      }],
    }, sameMinuteReport);

    assert.equal(repaired.turningPoints[0]?.previousScoreChangeCount, 1);
    assert.equal(repaired.turningPoints[0]?.title, "Premier danger non converti apres les premiers scores");
    assert.equal(repaired.turningPoints[0]?.firstDangerEligibility, "QUALIFIED_AFTER_SCORE");
  });
});
