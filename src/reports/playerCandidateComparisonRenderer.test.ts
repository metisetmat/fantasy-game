import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function validatePlayerCandidateComparisonRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ));

  assertTest(includesAny(html, ["Joueurs a etudier", "Joueurs à étudier", "Joueurs &agrave; &eacute;tudier"]), "product report must contain Joueurs a etudier.");
  assertTest(html.includes("A etudier en priorite"), "product report must contain A etudier en priorite.");
  assertTest(html.includes("Alternative a comparer"), "product report must contain Alternative a comparer.");
  assertTest(html.includes("Profil complementaire"), "product report must contain Profil complementaire when applicable.");
  assertTest(html.includes("Pourquoi ce joueur est visible"), "product report must contain why visible heading.");
  assertTest(html.includes("Point fort distinctif"), "product report must contain distinctive strength heading.");
  assertTest(
    html.includes("Point a verifier") ||
      html.includes("Point à vérifier") ||
      html.includes("Point &agrave; v&eacute;rifier"),
    "product report must contain point a verifier heading.",
  );
  assertTest(html.includes("Risque principal"), "product report must contain main risk heading.");
  assertTest(
    html.includes("A verifier au prochain match") ||
      html.includes("À vérifier au prochain match") ||
      html.includes("&Agrave; v&eacute;rifier au prochain match"),
    "product report must contain next-match heading.",
  );
  assertTest(
    includesAny(html, ["Comparaison non appliquee", "Comparaison non appliquée"]),
    "product report must contain non-applied label.",
  );
  assertTest(
    includesAny(html, ["Non confirmee comme recommandation officielle", "Non confirmée comme recommandation officielle"]),
    "product report must contain non-official confirmation label.",
  );
  assertTest(
    html.includes("D&eacute;tails repli&eacute;s") ||
      html.includes("Détails repliés") ||
      html.includes("Details replies"),
    "product report must contain collapsed candidate details.",
  );

  return [
    "Joueurs a etudier section is visible",
    "comparison priority labels are visible",
    "candidate cards expose why visible, strength, check, risk, and next-match signal",
    "non-applied and non-official labels are visible",
    "collapsed candidate details are visible",
  ];
}

if (require.main === module) {
  const checks = validatePlayerCandidateComparisonRenderer();

  console.log("playerCandidateComparisonRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
