import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function selectionPreviewCoachCopySection(html: string): string {
  const start = html.indexOf("Profils à observer");
  const detailsStart = start === -1 ? -1 : html.indexOf("<details class=\"internal-markers\">", start);

  return start === -1 ? "" : html.slice(start, detailsStart === -1 ? html.length : detailsStart);
}

export function validateSelectionPreviewTraceBackingRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const coachCopyVisible = selectionPreviewCoachCopySection(experimentalHtml);

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide selection preview coach copy.");
  assertTest(coachCopyVisible.includes("Profils à observer"), "experimental report must show coach-ready selection preview.");
  assertTest(coachCopyVisible.includes("Profil à observer"), "selection preview cards must use coach-facing profile wording.");
  assertTest(coachCopyVisible.includes("Origine :</strong> hypothèse sandbox"), "selection preview cards must show origin label.");
  assertTest(coachCopyVisible.includes("Appui :</strong> appuyé par les traces officielles"), "selection preview cards must show trace support label.");
  assertTest(coachCopyVisible.includes("Décision :</strong> prévisualisation non appliquée"), "selection preview must remain non-applied.");
  assertTest(coachCopyVisible.includes("Confirmation :</strong> non confirmée comme recommandation officielle"), "selection preview must not become official.");
  assertTest(coachCopyVisible.includes("rehaussée automatiquement"), "trace backing must not upgrade confidence.");
  assertTest(experimentalHtml.includes("selection_preview_trace_backing_status_"), "technical trace backing tags must be present.");
  assertTest(experimentalHtml.includes("selection_preview_coach_copy_status_available"), "technical coach copy tags must be present.");
  assertTest(!coachCopyVisible.includes("trace_supported"), "raw trace_supported status must not be visible.");
  assertTest(!coachCopyVisible.includes("sandbox_only"), "raw sandbox_only status must not be visible.");
  assertTest(!coachCopyVisible.includes("Composition recommandée"), "selection preview must not look like recommended lineup.");
  assertTest(!coachCopyVisible.includes("Le coach doit sélectionner"), "selection preview must not mandate a selection.");
  assertTest(!coachCopyVisible.includes("Meilleure sélection"), "selection preview must not claim best selection.");
  assertTest(!coachCopyVisible.includes("Changement appliqué"), "selection preview must not claim applied change.");
  assertTest(!coachCopyVisible.includes("Officiellement confirmé"), "selection preview must not use official confirmation wording.");
  assertTest(!coachCopyVisible.includes("Confiance élevée"), "selection preview must not upgrade confidence to high.");

  return [
    "default report hides selection preview",
    "experimental report shows coach-ready selection preview",
    "trace support label is visible",
    "selection preview remains non-applied",
    "selection preview is not official",
    "confidence is not upgraded",
    "technical trace backing tags are preserved",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBackingRenderer();

  console.log("selectionPreviewTraceBackingRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
