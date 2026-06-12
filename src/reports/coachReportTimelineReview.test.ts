import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportTimelineReview(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Lecture timeline officielle vs sandbox"), "default report must not show experimental timeline review.");
  assertTest(experimentalHtml.includes("Lecture timeline officielle vs sandbox"), "experimental report must show coach-facing timeline review.");
  assertTest(experimentalHtml.includes("Ce qui s&#39;est passé officiellement"), "official timeline block title missing.");
  assertTest(experimentalHtml.includes("Ce que le sandbox a rejoué"), "sandbox replay block title missing.");
  assertTest(experimentalHtml.includes("Ce qui est différent"), "differences block title missing.");
  assertTest(experimentalHtml.includes("Ce qui n&#39;a pas été modifié"), "unchanged block title missing.");
  assertTest(experimentalHtml.includes("La timeline officielle reste la seule source de vérité"), "official source-of-truth wording missing.");
  assertTest(experimentalHtml.includes("Les événements sandbox ne sont pas des MatchEvents officiels"), "sandbox non-official wording missing.");
  assertTest(experimentalHtml.includes("Le score officiel reste inchangé"), "official score unchanged wording missing.");
  assertTest(experimentalHtml.includes("Détails techniques du sandbox"), "technical sandbox details must be behind details.");
  assertTest(!experimentalVisibleHtml.includes("Le contexte workbench produit une selection shadow"), "long technical workbench paragraph must not dominate visible coach text.");

  return [
    "default report hides experimental timeline review",
    "experimental report shows four coach-facing timeline review blocks",
    "experimental report keeps sandbox technical details behind details",
    "visible coach text no longer exposes the long technical workbench chain paragraph",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTimelineReview();

  console.log("coachReportTimelineReview tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
