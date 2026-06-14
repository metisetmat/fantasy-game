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

  assertTest(!defaultHtml.includes("Prévisualisation de sélection"), "default report must not show selection preview.");
  assertTest(experimentalHtml.includes("Prévisualisation de sélection"), "experimental report must show selection preview.");
  assertTest(experimentalHtml.includes("Soutien proche autour de Z4-HSR"), "support preview must be visible.");
  assertTest(experimentalHtml.includes("Présence sur second ballon"), "second-ball preview must be visible.");
  assertTest(experimentalHtml.includes("Réponse face à un gardien fort"), "strong-goalkeeper-response preview must be visible.");
  assertTest(experimentalHtml.includes("Ces profils sont des pistes de sélection à prévisualiser, pas des changements appliqués"), "profiles must be preview-only.");
  assertTest(experimentalHtml.includes("Aucune composition, aucun titulaire, aucun remplaçant et aucune sélection live ne sont modifiés"), "lineup, starters, bench, and live selection must remain unchanged.");
  assertTest(experimentalHtml.includes("Cette prévisualisation ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score"), "official match state must remain unchanged.");
  assertTest(experimentalHtml.includes("Elle ne constitue pas une preuve d’économie globale"), "global economy overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "visible generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques de la prévisualisation"), "technical preview data must remain behind details.");
  assertTest(experimentalHtml.includes("selection_preview"), "technical tags must remain available inside details.");

  return [
    "experimental report contains Prévisualisation de sélection",
    "experimental report contains three selection preview cards",
    "experimental report says profiles are preview-only",
    "experimental report says lineup, starters, bench, and live selection are unchanged",
    "experimental report says official match state is unchanged",
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
