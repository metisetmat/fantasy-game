import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { runFullMatch } from "../runFullMatch";
import { runMiniMatch } from "./runMiniMatch";
import type { MiniMatchSegmentInfluence } from "./types";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreFromConsequences(input: {
  readonly report: ReturnType<typeof runFullMatch>;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
}): { readonly home: number; readonly away: number } {
  return input.report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );
}

export function validateMiniMatchSegmentInfluence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const adapter = adaptMatchInputToMiniMatch(input);
  const baselineA = runMiniMatch(adapter.miniMatchInput);
  const baselineB = runMiniMatch(adapter.miniMatchInput);
  const influence: MiniMatchSegmentInfluence = {
    segmentIndex: 2,
    scoreState: "close",
    home: {
      teamId: adapter.homePrototype.id,
      conditionModifier: -2,
      mentalFreshnessModifier: -1,
      momentumModifier: 2,
      pressureLoadModifier: 2,
      defensiveStressModifier: 1,
      scoringConfidenceModifier: 1,
      routeRiskModifier: 1,
      supportStabilityModifier: -1,
      finalActionComposureModifier: 0,
    },
    away: {
      teamId: adapter.awayPrototype.id,
      conditionModifier: -3,
      mentalFreshnessModifier: -2,
      momentumModifier: -1,
      pressureLoadModifier: 3,
      defensiveStressModifier: 2,
      scoringConfidenceModifier: -1,
      routeRiskModifier: -2,
      supportStabilityModifier: -3,
      finalActionComposureModifier: -2,
    },
    global: {
      repeatedPatternPressure: 3,
      matchTempoAdjustment: 2,
      conversionVolatilityAdjustment: 1,
    },
  };
  const influenced = runMiniMatch({
    ...adapter.miniMatchInput,
    segmentInfluence: influence,
  });
  const baselineFirstContext = baselineA.state.records[0]?.setup.resolveInput.initialContext;
  const influencedFirstContext = influenced.state.records[0]?.setup.resolveInput.initialContext;
  const fullReport = runFullMatch(input);
  const influencedEvents = fullReport.timeline.filter((event) => event.tags.includes("segment_influence_active"));
  const firstSegmentInfluencedEvents = influencedEvents.filter((event) => event.eventId.includes("-segment-1-"));
  const segmentStateFact = fullReport.evidenceFacts.find((fact) =>
    fact.internalTags.includes("segment_state_influence"),
  );
  const consequenceScore = scoreFromConsequences({
    report: fullReport,
    homeTeamId: input.homeTeam.teamId,
    awayTeamId: input.awayTeam.teamId,
  });

  assertTest(
    JSON.stringify(baselineA.summary) === JSON.stringify(baselineB.summary),
    "runMiniMatch without segment influence must remain deterministic and backward compatible.",
  );
  assertTest(
    baselineA.state.context.segmentInfluence === undefined,
    "runMiniMatch without segment influence must not attach influence context.",
  );
  assertTest(
    baselineA.state.context.spatialContext === undefined,
    "runMiniMatch without spatial context must remain backward compatible.",
  );
  assertTest(
    influenced.state.context.segmentInfluence !== undefined,
    "runMiniMatch with segment influence must attach influence context.",
  );
  assertTest(
    baselineFirstContext !== undefined && influencedFirstContext !== undefined,
    "mini-match test fixtures must produce at least one sequence context.",
  );
  if (baselineFirstContext !== undefined && influencedFirstContext !== undefined) {
    assertTest(
      influencedFirstContext.chaosLevel !== baselineFirstContext.chaosLevel ||
        influencedFirstContext.territorialPressure !== baselineFirstContext.territorialPressure ||
        influencedFirstContext.sequenceMomentum !== baselineFirstContext.sequenceMomentum,
      "segment influence must affect resolution context without forcing score events.",
    );
  }
  assertTest(influencedEvents.length > 0, "runFullMatch must tag events with segment influence after the first segment.");
  assertTest(
    firstSegmentInfluencedEvents.length === 0,
    "runFullMatch must not apply segment influence to the first segment.",
  );
  assertTest(segmentStateFact !== undefined, "segment-state influence must appear in canonical evidence facts.");
  assertTest(
    consequenceScore.home === fullReport.score.home && consequenceScore.away === fullReport.score.away,
    "final score must remain derived from score_change consequences.",
  );

  return [
    "runMiniMatch remains backward compatible without influence",
    "segment influence affects mini-match resolution context",
    "runFullMatch applies segment influence after the first segment",
    "segment influence is represented by internal tags and evidence facts",
    "final score remains derived from score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSegmentInfluence();

  console.log("miniMatchSegmentInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
