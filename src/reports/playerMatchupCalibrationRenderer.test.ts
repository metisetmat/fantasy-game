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
    "joueur recommandÃ©",
    "titulaire conseillÃ©",
    "composition recommandÃ©e",
    "sÃ©lection automatique",
    "choisir ce joueur",
    "officiellement confirmÃ©",
    "confiance Ã©levÃ©e",
  ];

  assertTest(includesAny(html, ["Joueurs à étudier", "Joueurs Ã  Ã©tudier", "Joueurs ÃƒÂ  ÃƒÂ©tudier"]), "coach-report.product.html must contain Joueurs a etudier.");
  assertTest(includesAny(html, ["Compatibilit&eacute; calibr&eacute;e", "CompatibilitÃ© calibrÃ©e", "CompatibilitÃƒÂ© calibrÃƒÂ©e"]), "product report must contain calibrated compatibility.");
  assertTest(html.includes("Pourquoi ce joueur est visible"), "product report must contain why-visible heading.");
  assertTest(html.includes("Atouts visibles"), "product report must contain visible strengths heading.");
  assertTest(includesAny(html, ["Points à vérifier", "Points Ã  vÃ©rifier", "Points ÃƒÂ  vÃƒÂ©rifier"]), "product report must contain checks heading.");
  assertTest(html.includes("Limites du profil"), "product report must contain profile limits heading.");
  assertTest(includesAny(html, ["Risque si utilisé dans ce rôle", "Risque si utilisÃ© dans ce rÃ´le", "Risque si utilisÃƒÂ© dans ce rÃƒÂ´le"]), "product report must contain role risk heading.");
  assertTest(includesAny(html, ["Signal à observer au prochain match", "Signal Ã  observer au prochain match", "Signal ÃƒÂ  observer au prochain match"]), "product report must contain next-match signal heading.");
  assertTest(includesAny(html, ["Comparaison non appliquée", "Comparaison non appliquÃ©e", "Comparaison non appliquÃƒÂ©e"]), "product report must contain non-applied comparison.");
  assertTest(includesAny(html, ["Non confirmée comme recommandation officielle", "Non confirmÃ©e comme recommandation officielle", "Non confirmÃƒÂ©e comme recommandation officielle"]), "product report must contain non-official confirmation.");
  assertTest(
    includesAny(html, ["Details de couverture roster et calibration", "DÃ©tails de couverture roster et calibration"])
      && html.includes("roster size:")
      && html.includes("Les joueurs affich"),
    "product report must contain roster coverage calibration appendix.",
  );
  assertTest(forbidden.every((term) => !html.toLocaleLowerCase("fr-FR").includes(term.toLocaleLowerCase("fr-FR"))), "visible copy must avoid selection recommendation wording.");

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
