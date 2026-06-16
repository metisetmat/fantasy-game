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

export function validatePlayerMatchupCalibrationRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ));
  const forbidden = [
    "meilleur choix",
    "joueur recommande",
    "titulaire conseille",
    "composition recommandee",
    "selection automatique",
    "choisir ce joueur",
    "officiellement confirmee",
    "confiance elevee",
  ];

  assertTest(includesAny(html, ["Joueurs a etudier", "Joueurs à étudier", "Joueurs &agrave; &eacute;tudier"]), "coach-report.product.html must contain Joueurs a etudier.");
  assertTest(includesAny(html, ["Compatibilite calibree", "Compatibilité calibrée", "Compatibilit&eacute; calibr&eacute;e"]), "product report must contain calibrated compatibility.");
  assertTest(html.includes("Pourquoi ce joueur est visible"), "product report must contain why-visible heading.");
  assertTest(includesAny(html, ["Atouts visibles", "Point fort distinctif"]), "product report must contain visible strengths heading.");
  assertTest(
    includesAny(html, ["Points a verifier", "Points à vérifier", "Points &agrave; v&eacute;rifier", "Point a verifier", "Point à vérifier", "Point &agrave; v&eacute;rifier"]),
    "product report must contain checks heading.",
  );
  assertTest(includesAny(html, ["Limites du profil", "Risque principal"]), "product report must contain profile limits heading.");
  assertTest(
    includesAny(html, ["Risque si utilise dans ce role", "Risque si utilisé dans ce rôle", "Risque si utilis&eacute; dans ce r&ocirc;le", "Risque principal"]),
    "product report must contain role risk heading.",
  );
  assertTest(
    includesAny(html, ["Signal a observer au prochain match", "Signal à observer au prochain match", "Signal &agrave; observer au prochain match", "A verifier au prochain match", "À vérifier au prochain match", "&Agrave; v&eacute;rifier au prochain match"]),
    "product report must contain next-match signal heading.",
  );
  assertTest(includesAny(html, ["Comparaison non appliquee", "Comparaison non appliquée"]), "product report must contain non-applied comparison.");
  assertTest(
    includesAny(html, ["Non confirmee comme recommandation officielle", "Non confirmée comme recommandation officielle"]),
    "product report must contain non-official confirmation.",
  );
  assertTest(
    includesAny(html, ["Details de couverture roster et calibration", "Détails de couverture roster et calibration"])
      && html.includes("roster size:")
      && html.includes("Les joueurs affich"),
    "product report must contain roster coverage calibration appendix.",
  );
  assertTest(
    forbidden.every((term) => !html.toLocaleLowerCase("fr-FR").includes(term.toLocaleLowerCase("fr-FR"))),
    "visible copy must avoid selection recommendation wording.",
  );

  return [
    "Joueurs a etudier section is visible",
    "calibrated compatibility is visible",
    "why-visible heading is visible",
    "candidate fields are visible",
    "roster coverage calibration appendix is visible",
    "selection recommendation wording is absent",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupCalibrationRenderer();

  console.log("playerMatchupCalibrationRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
