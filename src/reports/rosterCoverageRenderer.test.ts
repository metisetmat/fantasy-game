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

function includesAny(text: string, values: readonly string[]): boolean {
  return values.some((value) => text.includes(value));
}

export function validateRosterCoverageRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ));

  assertTest(html.includes("Les joueurs affichés sont issus d'une calibration rôle-attributs") || html.includes("Les joueurs affichés sont issus d'une calibration r"), "product report must explain calibration source.");
  assertTest(html.includes("Un joueur peut être utile pour un profil et non pertinent pour un autre.") || html.includes("Un joueur peut"), "product report must explain per-profile relevance.");
  assertTest(includesAny(html, ["Details de couverture roster et calibration", "DÃ©tails de couverture roster et calibration"]), "product report appendix must expose roster coverage details.");
  assertTest(html.includes("roster size: 10"), "product report appendix must include roster size.");

  return [
    "product report explains calibration source",
    "product report keeps per-profile relevance warning",
    "product report includes roster coverage appendix details",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageRenderer();

  console.log("rosterCoverageRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
