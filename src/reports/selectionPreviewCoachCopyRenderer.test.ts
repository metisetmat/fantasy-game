import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function selectionPreviewCoachCopyVisibleHtml(html: string): string {
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

export function validateSelectionPreviewCoachCopyRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewCoachCopyVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide coach copy cards.");
  assertTest(visible.includes("Profils à observer"), "experimental report must show coach copy section.");
  assertTest(visible.includes("Ces profils restent des prévisualisations non appliquées"), "intro must frame previews as non-applied.");
  assertTest(visible.includes("Profil à observer — soutien proche autour des zones de danger"), "support card title must be visible.");
  assertTest(visible.includes("Profil à observer — présence sur second ballon"), "second-ball card title must be visible.");
  assertTest(visible.includes("Profil à observer — réponse face à un gardien fort"), "goalkeeper response card title must be visible.");
  assertTest(visible.includes("Origine :</strong> hypothèse sandbox"), "origin label must be visible.");
  assertTest(visible.includes("Appui :</strong> appuyé par les traces officielles"), "trace support label must be visible.");
  assertTest(visible.includes("Décision :</strong> prévisualisation non appliquée"), "decision label must be visible.");
  assertTest(visible.includes("Confirmation :</strong> non confirmée comme recommandation officielle"), "confirmation label must be visible.");
  assertTest(visible.includes("Pourquoi l’observer"), "why-observe section must be visible.");
  assertTest(visible.includes("Ce que les traces soutiennent"), "trace support section must be visible.");
  assertTest(visible.includes("Limite"), "limit section must be visible.");
  assertTest(!visible.includes("trace_supported"), "internal status must be hidden from visible copy.");
  assertTest(!visible.includes("sandbox_only"), "internal sandbox status must be hidden from visible copy.");
  assertTest(experimentalHtml.includes("selection_preview_coach_copy"), "technical coach copy tags must be preserved in details.");

  return [
    "default report hides coach copy cards",
    "experimental report shows Profils à observer",
    "origin/support/decision/confirmation labels visible",
    "internal status tags hidden from visible copy",
    "technical tags preserved in details",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyRenderer();

  console.log("selectionPreviewCoachCopyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
