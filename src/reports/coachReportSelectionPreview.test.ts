import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf("<details", cursor);

    if (open === -1) {
      output += html.slice(cursor);
      break;
    }

    output += html.slice(cursor, open);
    let depth = 1;
    let scan = html.indexOf(">", open);

    if (scan === -1) {
      break;
    }

    scan += 1;
    while (scan < html.length && depth > 0) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        scan = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = html.indexOf(">", nextOpen);
        scan = scan === -1 ? html.length : scan + 1;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
    }

    cursor = scan;
  }

  return output;
}

export function validateCoachReportSelectionPreview(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);
  const forbiddenVisibleTerms = [
    "SegmentRouteInput",
    "selection shadow",
    "canDrive",
    "production route resolution",
    "scoreMutationCount",
    "workbench_chain_",
  ];

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must not show selection preview coach copy.");
  assertTest(experimentalHtml.includes("Profils à observer"), "experimental report must show selection preview coach copy.");
  assertTest(experimentalHtml.includes("Profil à observer — soutien proche autour des zones de danger"), "support preview must be visible.");
  assertTest(experimentalHtml.includes("Profil à observer — présence sur second ballon"), "second-ball preview must be visible.");
  assertTest(experimentalHtml.includes("Profil à observer — réponse face à un gardien fort"), "strong-goalkeeper-response preview must be visible.");
  assertTest(experimentalHtml.includes("Ces profils restent des prévisualisations non appliquées"), "profiles must be preview-only.");
  assertTest(experimentalHtml.includes("La confiance n’est pas rehaussée automatiquement et la sélection live reste inchangée"), "live selection and confidence must remain unchanged.");
  assertTest(experimentalHtml.includes("Décision :</strong> prévisualisation non appliquée"), "decision status must remain non-applied.");
  assertTest(experimentalHtml.includes("Confirmation :</strong> non confirmée comme recommandation officielle"), "official recommendation overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques de la prévisualisation"), "technical preview data must remain behind details.");
  assertTest(experimentalHtml.includes("Détails techniques de la copie coach"), "technical coach copy data must remain behind details.");
  assertTest(experimentalHtml.includes("selection_preview"), "technical tags must remain available inside details.");

  return [
    "experimental report contains Profils à observer",
    "experimental report contains three coach-ready selection preview cards",
    "experimental report says profiles are preview-only",
    "experimental report says live selection and confidence are unchanged",
    "experimental report says preview remains non-applied and non-official",
    "default report hides the experimental selection preview",
    "visible coach copy contains no mojibake",
    "visible coach copy avoids developer jargon outside details",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSelectionPreview();

  console.log("coachReportSelectionPreview tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
