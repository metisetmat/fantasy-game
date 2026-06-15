import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
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

export function validateSelectionPreviewTraceBackingRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Prévisualisation de sélection"), "default report must hide selection preview.");
  assertTest(visible.includes("Prévisualisation de sélection"), "experimental report must show selection preview.");
  assertTest(visible.includes("Profil à observer"), "selection preview cards must use coach-facing profile wording.");
  assertTest(visible.includes("Statut d'appui"), "selection preview cards must show trace backing status.");
  assertTest(visible.includes("Source principale"), "selection preview cards must show backing source.");
  assertTest(visible.includes("Confiance"), "selection preview cards must show confidence wording.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "selection preview must remain non-applied.");
  assertTest(visible.includes("Non confirmé comme recommandation officielle"), "selection preview must not become official.");
  assertTest(visible.includes("non rehaussée automatiquement"), "trace backing must not upgrade confidence.");
  assertTest(experimentalHtml.includes("selection_preview_trace_backing_status_"), "technical trace backing tags must be present.");
  assertTest(!visible.includes("Composition recommandée"), "selection preview must not look like recommended lineup.");
  assertTest(!visible.includes("Le coach doit sélectionner"), "selection preview must not mandate a selection.");
  assertTest(!visible.includes("Meilleure sélection"), "selection preview must not claim best selection.");
  assertTest(!visible.includes("Changement appliqué"), "selection preview must not claim applied change.");
  assertTest(!visible.includes("Officiellement confirmé"), "selection preview must not use official confirmation wording.");
  assertTest(!visible.includes("Confiance élevée"), "selection preview must not upgrade confidence to high.");

  return [
    "default report hides selection preview",
    "experimental report shows selection preview",
    "trace backing status is visible",
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
