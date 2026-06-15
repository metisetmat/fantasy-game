import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function selectionPreviewProfileViewVisibleHtml(html: string): string {
  const start = html.indexOf("Profils à observer");
  const detailsStart = start === -1 ? -1 : html.indexOf("<details class=\"internal-markers\">", start);

  if (start === -1) {
    return "";
  }

  return html.slice(start, detailsStart === -1 ? html.length : detailsStart);
}

export function validateSelectionPreviewProfileViewRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Famille de rôle"), "default report must hide profile view.");
  assertTest(visible.includes("Profils à observer"), "experimental report must contain Profils à observer.");
  assertTest(visible.includes("Famille de rôle"), "profile cards must show role family.");
  assertTest(visible.includes("Attributs utiles"), "profile cards must show useful attributes.");
  assertTest(visible.includes("Pourquoi l’observer"), "profile cards must show why-observe section.");
  assertTest(visible.includes("Ce que les traces soutiennent"), "profile cards must show trace support section.");
  assertTest(visible.includes("Bénéfice attendu"), "profile cards must show expected benefit section.");
  assertTest(visible.includes("Risque tactique"), "profile cards must show tactical risk section.");
  assertTest(visible.includes("Signal à vérifier au prochain match"), "profile cards must show next-match signal section.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "profile cards must show non-applied guard.");
  assertTest(visible.includes("non confirmée comme recommandation officielle"), "profile cards must show non-official guard.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_card_count_3"), "profile view tags must be preserved in details.");

  return [
    "experimental report contains profile view",
    "three profile-card sections expose role family, attributes, why-observe, trace support, benefit, risk, and next-match signal",
    "profile view guard remains visible",
    "default report hides profile view",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewRenderer();

  console.log("selectionPreviewProfileViewRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
