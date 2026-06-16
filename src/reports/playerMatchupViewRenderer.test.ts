import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function validatePlayerMatchupViewRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ));

  assertTest(includesAny(html, ["Joueurs à étudier", "Joueurs Ã  Ã©tudier"]), "product report must contain Joueurs à étudier.");
  assertTest(includesAny(html, ["Compatibilité profil-joueur", "CompatibilitÃ© profil-joueur"]), "product report must contain Compatibilité profil-joueur.");
  assertTest(html.includes("Atouts visibles"), "product report must contain Atouts visibles.");
  assertTest(includesAny(html, ["Points à vérifier", "Points Ã  vÃ©rifier"]), "product report must contain Points à vérifier.");
  assertTest(includesAny(html, ["Risque si utilisé dans ce rôle", "Risque si utilisÃ© dans ce rÃ´le"]), "product report must contain risk heading.");
  assertTest(includesAny(html, ["Signal à observer au prochain match", "Signal Ã  observer au prochain match"]), "product report must contain next observation signal.");
  assertTest(includesAny(html, ["Comparaison non appliquée", "Comparaison non appliquÃ©e"]), "product report must contain Comparaison non appliquée.");
  assertTest(includesAny(html, ["Non confirmée comme recommandation officielle", "Non confirmÃ©e comme recommandation officielle"]), "product report must contain non-official confirmation.");
  assertTest(html.includes("Les rapprochements profil-joueur ne sont pas des choix de composition."), "interpretation guard must mention profile-player matchups.");
  assertTest(!html.includes("player selected count: 1"), "default report must not apply any player matchup.");

  return [
    "Joueurs à étudier section is visible",
    "matchup cards show required headings",
    "comparison guard is visible",
    "interpretation guard mentions profile-player matchups",
    "default report does not apply player matchup",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupViewRenderer();

  console.log("playerMatchupViewRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
