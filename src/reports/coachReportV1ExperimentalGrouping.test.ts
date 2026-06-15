import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function between(html: string, start: string, end: string): string {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end, startIndex + start.length);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return html.slice(startIndex, endIndex);
}

export function validateCoachReportV1ExperimentalGrouping(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const group = between(html, "Hypothèses expérimentales à tester", "Détails techniques et traçabilité");
  const guardrail = "Ces éléments sont expérimentaux : ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.";

  assertTest(group.includes("Lecture timeline officielle vs sandbox"), "sandbox timeline review must be inside experimental group.");
  assertTest(group.includes("Panneau de décision sandbox"), "sandbox decision panel must be inside experimental group.");
  assertTest(group.includes("Plan de test coach"), "coach test plan must be inside experimental group.");
  assertTest(group.includes("Profils à observer"), "selection preview coach copy must be inside experimental group.");
  assertTest(group.includes(guardrail), "experimental group must have shared guardrail banner.");
  assertTest((html.match(new RegExp(guardrail, "g")) ?? []).length === 1, "shared guardrail copy must be reduced to one visible banner.");
  assertTest(group.includes("Prévisualisation non appliquée"), "selection preview must remain non-applied.");

  return [
    "sandbox timeline review is inside experimental group",
    "sandbox decision panel is inside experimental group",
    "coach test plan is inside experimental group",
    "selection preview coach copy is inside experimental group",
    "experimental group has shared guardrail banner",
    "repeated guardrail copy is reduced",
    "selection preview remains non-applied",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1ExperimentalGrouping();

  console.log("coachReportV1ExperimentalGrouping tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
