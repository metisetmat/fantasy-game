import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function containsAny(value: string, fragments: readonly string[]): boolean {
  return fragments.some((fragment) => value.includes(fragment));
}

export function validateSelectionPreviewProfileViewCopy(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(html);

  assertTest(!containsAny(visible, ["trace_supported", "sandbox_only", "officially_confirmed"]), "visible copy must hide internal status names.");
  assertTest(
    !containsAny(visible, [
      "support_runner",
      "mobile_lock",
      "hook_link",
      "playmaker_support",
      "rebound_chaser",
      "pressure_forward",
      "high_work_rate_runner",
      "continuity_option",
      "secondary_playmaker",
      "support_receiver",
      "rest_defense_anchor",
    ]),
    "visible copy must hide internal role ids.",
  );
  assertTest(
    !containsAny(visible, [
      "decision_making",
      "off_ball_support",
      "mental_freshness",
      "tactical_discipline",
    ]),
    "visible copy must hide internal attribute ids.",
  );
  assertTest(visible.includes("soutien mobile"), "visible copy must use French role labels.");
  assertTest(visible.includes("chasseur de second ballon"), "visible copy must use French second-ball role label.");
  assertTest(visible.includes("prise de décision"), "visible copy must use French attribute labels.");
  assertTest(visible.includes("soutien sans ballon"), "visible copy must use French off-ball support attribute label.");
  assertTest(
    !containsAny(visible, [
      "composition recommandée",
      "meilleure sélection",
      "le coach doit sélectionner",
      "Changez votre composition",
    ]),
    "visible copy must avoid official selection wording.",
  );

  return [
    "visible copy hides internal statuses",
    "visible copy hides internal role and attribute ids",
    "visible copy uses French role labels",
    "visible copy uses French attribute labels",
    "visible copy avoids official selection wording",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewCopy();

  console.log("selectionPreviewProfileViewCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
