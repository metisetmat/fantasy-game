import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewTraceBackingRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const profileVisible = selectionPreviewProfileViewVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide selection preview profile view.");
  assertTest(profileVisible.includes("Profils à observer"), "experimental report must show coach-ready selection preview.");
  assertTest(profileVisible.includes("Profil à observer"), "selection preview cards must use coach-facing profile wording.");
  assertTest(profileVisible.includes("Famille de rôle"), "profile view must show role family instead of raw support status.");
  assertTest(profileVisible.includes("Attributs utiles"), "profile view must show useful attributes.");
  assertTest(profileVisible.includes("Ce que les traces soutiennent"), "profile view must show trace support section.");
  assertTest(profileVisible.includes("Prévisualisation non appliquée"), "selection preview must remain non-applied.");
  assertTest(profileVisible.includes("non confirmée comme recommandation officielle"), "selection preview must not become official.");
  assertTest(experimentalHtml.includes("selection_preview_trace_backing_status_"), "technical trace backing tags must be present.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_status_available"), "technical profile view tags must be present.");
  assertTest(!profileVisible.includes("trace_supported"), "raw trace_supported status must not be visible.");
  assertTest(!profileVisible.includes("sandbox_only"), "raw sandbox_only status must not be visible.");
  assertTest(!profileVisible.includes("support_runner"), "raw role ids must not be visible.");
  assertTest(!profileVisible.includes("decision_making"), "raw attribute ids must not be visible.");
  assertTest(!profileVisible.includes("Composition recommandée"), "selection preview must not look like recommended lineup.");
  assertTest(!profileVisible.includes("Le coach doit sélectionner"), "selection preview must not mandate a selection.");
  assertTest(!profileVisible.includes("Meilleure sélection"), "selection preview must not claim best selection.");
  assertTest(!profileVisible.includes("Changement appliqué"), "selection preview must not claim applied change.");
  assertTest(!profileVisible.includes("Officiellement confirmé"), "selection preview must not use official confirmation wording.");
  assertTest(!profileVisible.includes("Confiance élevée"), "selection preview must not upgrade confidence to high.");

  return [
    "default report hides selection preview",
    "experimental report shows coach-ready profile view",
    "trace support remains visible as a coach section",
    "selection preview remains non-applied",
    "selection preview is not official",
    "technical trace backing and profile view tags are preserved",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBackingRenderer();

  console.log("selectionPreviewTraceBackingRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
