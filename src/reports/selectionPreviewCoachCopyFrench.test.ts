import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewCoachCopyVisibleHtml } from "./selectionPreviewCoachCopyRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function coachCopySection(visible: string): string {
  const start = visible.indexOf("Profils à observer");
  const end = visible.indexOf("<section", start + 1);

  return start === -1 ? visible : visible.slice(start, end === -1 ? visible.length : end);
}

export function validateSelectionPreviewCoachCopyFrench(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = coachCopySection(selectionPreviewCoachCopyVisibleHtml(html));
  const forbiddenUnaccented = [
    "hypothese",
    "selection live",
    "Previsualisation",
    "previsualisation",
    "rehaussee",
    "appliquee",
    "recommandee",
    "confirmee",
    "elevee",
  ];

  assertTest(forbiddenUnaccented.every((word) => !visible.includes(word)), "visible copy must avoid unaccented French placeholders.");
  assertTest(visible.includes("hypothèse"), "visible copy must contain accented hypothèse.");
  assertTest(visible.includes("sélection live"), "visible copy must contain accented sélection.");
  assertTest(visible.includes("prévisualisation non appliquée"), "visible copy must contain accented prévisualisation appliquée wording.");
  assertTest(visible.includes("rehaussée"), "visible copy must contain accented rehaussée.");
  assertTest(visible.includes("confirmée"), "visible copy must contain accented confirmée.");
  assertTest(visible.includes("récupérations"), "visible copy must contain accented récupérations.");

  return [
    "visible copy has accented French",
    "unaccented French placeholders are absent",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyFrench();

  console.log("selectionPreviewCoachCopyFrench tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
