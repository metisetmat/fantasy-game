import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { analyzeFullMatchGroundingDiagnostics } from "./fullMatchGroundingDiagnostics";
import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchGroundingDiagnostics(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const diagnostics = analyzeFullMatchGroundingDiagnostics(report);
  const scoreFromConsequences = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertTest(diagnostics.warnings.includes("FULL_MATCH_NOT_WORKBENCH_GROUNDED"), "full-match grounding warning must be emitted.");
  assertTest(diagnostics.warnings.includes("ROSTER_NOT_CONVERTED_TO_SPATIAL_CONTEXT"), "roster conversion warning must be emitted.");
  assertTest(!diagnostics.mayInvalidateGlobalScoringEconomy, "grounding diagnostics must not invalidate global economy.");
  assertTest(!diagnostics.scoringEventsMutated, "grounding diagnostics must not mutate scoring events.");
  assertTest(
    report.warnings.some((warning) => warning.warningId.endsWith("tactical-grounding-gap")),
    "MatchReport must include a grounding warning.",
  );
  assertTest(
    report.evidenceFacts.some((fact) => fact.internalTags.includes("tactical_grounding_gap")),
    "MatchReport must include grounding evidence facts.",
  );
  assertTest(
    scoreFromConsequences.home === report.score.home && scoreFromConsequences.away === report.score.away,
    "final score must remain derived from score_change consequences.",
  );

  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be allowed to make global economy claims.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "50-match economy must remain the global reference.");
  }

  return [
    "full-match grounding warning is emitted",
    "grounding evidence facts are attached",
    "scoring events are not mutated",
    "final score remains derived from score_change",
    "50-match economy remains the global reference",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchGroundingDiagnostics();

  console.log("fullMatchGroundingDiagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
