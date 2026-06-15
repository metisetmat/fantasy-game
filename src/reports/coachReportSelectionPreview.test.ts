import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

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
  const profileViewVisibleHtml = selectionPreviewProfileViewVisibleHtml(experimentalHtml);
  const forbiddenVisibleTerms = [
    "SegmentRouteInput",
    "selection shadow",
    "canDrive",
    "production route resolution",
    "scoreMutationCount",
    "workbench_chain_",
  ];

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must not show selection preview profile view.");
  assertTest(experimentalHtml.includes("Profils à observer"), "experimental report must show selection preview profile view.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — soutien proche autour des zones de danger"), "support profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — présence sur second ballon"), "second-ball profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — réponse face à un gardien fort"), "strong-goalkeeper-response profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Famille de rôle"), "profile view must expose role family.");
  assertTest(profileViewVisibleHtml.includes("Attributs utiles"), "profile view must expose useful attributes.");
  assertTest(profileViewVisibleHtml.includes("Bénéfice attendu"), "profile view must expose expected benefit.");
  assertTest(profileViewVisibleHtml.includes("Risque tactique"), "profile view must expose tactical risk.");
  assertTest(profileViewVisibleHtml.includes("Signal à vérifier au prochain match"), "profile view must expose next-match signal.");
  assertTest(profileViewVisibleHtml.includes("Prévisualisation non appliquée"), "profile view must remain non-applied.");
  assertTest(profileViewVisibleHtml.includes("non confirmée comme recommandation officielle"), "official recommendation overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques des profils à observer"), "technical profile view data must remain behind details.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view"), "technical profile view tags must remain available inside details.");

  return [
    "experimental report contains Profils à observer",
    "experimental report contains three concrete profile cards",
    "experimental report shows role family, attributes, benefit, risk, and next-match signal",
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
