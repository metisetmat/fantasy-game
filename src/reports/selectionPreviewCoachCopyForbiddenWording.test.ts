import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewCoachCopyVisibleHtml } from "./selectionPreviewCoachCopyRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function countOccurrences(value: string, fragment: string): number {
  let count = 0;
  let cursor = value.indexOf(fragment);

  while (cursor !== -1) {
    count += 1;
    cursor = value.indexOf(fragment, cursor + fragment.length);
  }

  return count;
}

function coachCopySection(visible: string): string {
  const start = visible.indexOf("Profils à observer");
  const end = visible.indexOf("<section", start + 1);

  return start === -1 ? visible : visible.slice(start, end === -1 ? visible.length : end);
}

export function validateSelectionPreviewCoachCopyForbiddenWording(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = coachCopySection(selectionPreviewCoachCopyVisibleHtml(html));
  const forbiddenVisiblePhrases = [
    "Composition recommandée",
    "Le coach doit sélectionner",
    "Meilleure sélection",
    "Changement appliqué",
    "Officiellement confirmé",
    "Confiance élevée",
    "officially_confirmed",
  ];

  assertTest(forbiddenVisiblePhrases.every((phrase) => !visible.includes(phrase)), "visible coach copy must avoid official/mandatory wording.");
  assertTest(countOccurrences(visible, "Officiellement confirmé") === 0, "positive official confirmation wording must be absent.");
  assertTest(!visible.includes("composition recommandée"), "lineup recommendation wording must be absent.");
  assertTest(!visible.includes("Statut d'appui"), "legacy support status label must not remain visible.");
  assertTest(!visible.includes("Source principale"), "legacy source label must not remain visible.");
  assertTest(!visible.includes("Force de l'appui trace"), "legacy strength label must not remain visible.");

  return [
    "visible copy avoids official selection wording",
    "official recommendation appears only as non-confirmed",
    "legacy technical status labels are hidden",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyForbiddenWording();

  console.log("selectionPreviewCoachCopyForbiddenWording tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
