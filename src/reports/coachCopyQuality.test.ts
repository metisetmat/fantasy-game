import { assertNoMojibake, containsMojibake, normalizeCoachFacingCopy } from "./coachCopyQuality";
import { coachFacingScoringDominanceSummary } from "./coachFacingCopy";
import type { FullMatchScoringDominanceReport } from "../simulation/diagnostics/fullMatchScoringDominanceDiagnostics";

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

  const partialDominance: FullMatchScoringDominanceReport = {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings: ["ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"],
    score: { home: 27, away: 3 },
    scoringEventsByTeam: [
      {
        teamId: "control",
        scoringEventCount: 9,
        points: 27,
        mainScoringZones: ["Z3-C"],
        mainScoringEventTypes: ["SHOT_GOAL"],
      },
      {
        teamId: "blitz",
        scoringEventCount: 1,
        points: 3,
        mainScoringZones: ["Z4-C"],
        mainScoringEventTypes: ["SHOT_GOAL"],
      },
    ],
    dominatedTeamId: "blitz",
    dominantTeamId: "control",
    dominatedTeamEvidenceEventIds: [],
    affectedZones: ["Z3-C"],
    interpretation: "test fixture",
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [],
  };
  const partialDominanceSummary = coachFacingScoringDominanceSummary(partialDominance);

  assertTest(!partialDominanceSummary.includes("BLITZ n’a converti aucun événement de score"), "dominance copy must not say a scoring opponent had zero conversion.");
  assertTest(partialDominanceSummary.includes("BLITZ a converti 1 événement de score pour 3 points"), "dominance copy must mention opponent scoring when present.");

  return [
    "coach copy mojibake marker detection works",
    "clean French copy is accepted",
    "coach copy normalizer repairs generated-copy mojibake",
    "coach copy assertion accepts normalized French text",
    "coach-facing dominance copy handles opponents that scored",
  ];
}

if (require.main === module) {
  const checks = validateCoachCopyQualityUtilities();

  console.log("Coach copy quality tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
