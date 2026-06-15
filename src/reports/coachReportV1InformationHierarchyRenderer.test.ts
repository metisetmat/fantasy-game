import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { hasMojibake } from "./encoding/mojibakeDetection";

const FORBIDDEN_VISIBLE_JARGON: readonly string[] = [
  "workbench_chain_",
  "Production route resolution",
  "Global economy claim",
  "Controlled route resolution",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1InformationHierarchyRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);
  const officialIndex = experimentalHtml.indexOf("Ce que le match dit");
  const experimentalIndex = experimentalHtml.indexOf("Hypothèses expérimentales à tester");
  const sandboxDecisionIndex = experimentalHtml.indexOf("Panneau de décision sandbox");

  assertTest(experimentalHtml.includes("Ce que le match dit"), "experimental report must contain official hierarchy title.");
  assertTest(experimentalHtml.includes("Signaux officiels détaillés"), "experimental report must contain detailed official title.");
  assertTest(experimentalHtml.includes("Hypothèses expérimentales à tester"), "experimental report must contain experimental group title.");
  assertTest(experimentalHtml.includes("Détails techniques et traçabilité"), "experimental report must contain technical traceability title.");
  assertTest(officialIndex !== -1 && experimentalIndex !== -1 && officialIndex < experimentalIndex, "official reading must appear before experimental hypotheses.");
  assertTest(officialIndex !== -1 && sandboxDecisionIndex !== -1 && officialIndex < sandboxDecisionIndex, "V1 official section must appear before sandbox decision panel.");
  assertTest(!defaultHtml.includes("Ce que le match dit"), "default report must hide hierarchy.");
  assertTest(experimentalHtml.includes("<summary>Détails techniques et traçabilité</summary>"), "technical traceability must be collapsed.");
  assertTest(!hasMojibake(visible), "visible copy must have no mojibake.");
  assertTest(FORBIDDEN_VISIBLE_JARGON.every((term) => !visible.includes(term)), "visible copy must avoid developer jargon outside details.");
  assertTest(!visible.includes("doit absolument") && !visible.includes("obligatoire"), "visible copy must avoid mandatory wording.");

  return [
    "experimental report contains Ce que le match dit",
    "experimental report contains Signaux officiels détaillés",
    "experimental report contains Hypothèses expérimentales à tester",
    "experimental report contains Détails techniques et traçabilité",
    "Ce que le match dit appears before experimental hypotheses",
    "V1 official section appears before sandbox decision panel",
    "default report hides hierarchy",
    "technical details are collapsed",
    "visible copy has no mojibake",
    "visible copy avoids developer jargon outside technical details",
    "visible copy avoids mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1InformationHierarchyRenderer();

  console.log("coachReportV1InformationHierarchyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
