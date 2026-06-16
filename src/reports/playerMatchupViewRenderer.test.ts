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

  assertTest(includesAny(html, ["Joueurs a etudier", "Joueurs à étudier", "Joueurs &agrave; &eacute;tudier"]), "product report must contain Joueurs a etudier.");
  assertTest(
    includesAny(html, ["Compatibilite profil-joueur", "Compatibilité profil-joueur", "Compatibilit&eacute; profil-joueur"]),
    "product report must contain Compatibilite profil-joueur.",
  );
  assertTest(includesAny(html, ["Atouts visibles", "Point fort distinctif"]), "product report must contain strengths heading.");
  assertTest(
    includesAny(html, ["Points a verifier", "Points à vérifier", "Points &agrave; v&eacute;rifier", "Point a verifier", "Point à vérifier", "Point &agrave; v&eacute;rifier"]),
    "product report must contain checks heading.",
  );
  assertTest(
    includesAny(html, ["Risque si utilise dans ce role", "Risque si utilisé dans ce rôle", "Risque si utilis&eacute; dans ce r&ocirc;le", "Risque principal"]),
    "product report must contain risk heading.",
  );
  assertTest(
    includesAny(html, ["Signal a observer au prochain match", "Signal à observer au prochain match", "Signal &agrave; observer au prochain match", "A verifier au prochain match", "À vérifier au prochain match", "&Agrave; v&eacute;rifier au prochain match"]),
    "product report must contain next observation signal.",
  );
  assertTest(
    includesAny(html, ["Comparaison non appliquee", "Comparaison non appliquée"]),
    "product report must contain Comparaison non appliquee.",
  );
  assertTest(
    includesAny(html, ["Non confirmee comme recommandation officielle", "Non confirmée comme recommandation officielle"]),
    "product report must contain non-official confirmation.",
  );
  assertTest(
    html.includes("Les rapprochements profil-joueur ne sont pas des choix de composition.") ||
      html.includes("Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni les titulaires, ni le banc."),
    "interpretation guard must mention profile-player matchups.",
  );
  assertTest(!html.includes("player selected count: 1"), "default report must not apply any player matchup.");

  return [
    "Joueurs a etudier section is visible",
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
