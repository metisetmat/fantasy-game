import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewCoachCopyFrench(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(html);
  const forbiddenUnaccented = [
    "hypothese",
    "Previsualisation",
    "previsualisation",
    "appliquee",
    "recommandee",
    "confirmee",
    "elevee",
    "recuperation",
    "decision",
  ];

  assertTest(forbiddenUnaccented.every((word) => !visible.includes(word)), "visible copy must avoid unaccented French placeholders.");
  assertTest(visible.includes("rôle"), "visible copy must contain accented rôle.");
  assertTest(visible.includes("Bénéfice attendu"), "visible copy must contain accented bénéfice.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "visible copy must contain accented non-applied wording.");
  assertTest(visible.includes("confirmée"), "visible copy must contain accented confirmée.");
  assertTest(visible.includes("récupération"), "visible copy must contain accented récupération.");
  assertTest(visible.includes("prise de décision"), "visible copy must contain accented décision.");
  assertTest(visible.includes("fraîcheur mentale"), "visible copy must contain accented fraîcheur.");

  return [
    "visible profile copy has accented French",
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
