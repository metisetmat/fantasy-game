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

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide profile view cards.");
  assertTest(visible.includes("Profils à observer"), "experimental report must show profile view section.");
  assertTest(visible.includes("Ces profils ne sont pas des choix imposés"), "intro must frame profiles as non-prescriptive.");
  assertTest(visible.includes("Profil à observer — soutien proche autour des zones de danger"), "support card title must be visible.");
  assertTest(visible.includes("Profil à observer — présence sur second ballon"), "second-ball card title must be visible.");
  assertTest(visible.includes("Profil à observer — réponse face à un gardien fort"), "goalkeeper response card title must be visible.");
  assertTest(visible.includes("Famille de rôle"), "role family label must be visible.");
  assertTest(visible.includes("Attributs utiles"), "useful attributes label must be visible.");
  assertTest(visible.includes("Pourquoi l’observer"), "why-observe section must be visible.");
  assertTest(visible.includes("Ce que les traces soutiennent"), "trace support section must be visible.");
  assertTest(visible.includes("Bénéfice attendu"), "expected benefit section must be visible.");
  assertTest(visible.includes("Risque tactique"), "tactical risk section must be visible.");
  assertTest(visible.includes("Signal à vérifier au prochain match"), "next-match signal section must be visible.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "decision guard must be visible.");
  assertTest(visible.includes("non confirmée comme recommandation officielle"), "confirmation guard must be visible.");
  assertTest(!visible.includes("trace_supported"), "internal status must be hidden from visible copy.");
  assertTest(!visible.includes("sandbox_only"), "internal sandbox status must be hidden from visible copy.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_card_count_3"), "technical profile view tags must be preserved in details.");

  return [
    "default report hides profile view cards",
    "experimental report shows Profils à observer",
    "role family, attributes, benefit, risk, and next-match signal labels visible",
    "internal status tags hidden from visible copy",
    "technical profile view tags preserved in details",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyRenderer();

  console.log("selectionPreviewCoachCopyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
