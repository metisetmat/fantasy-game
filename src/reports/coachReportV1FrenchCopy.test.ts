import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { hasMojibake } from "./encoding/mojibakeDetection";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_VISIBLE_TERMS: readonly string[] = [
  "A travailler",
  "recuperations",
  "securiser",
  "premiere",
  "apres",
  "economie globale",
];

function assertTest(condition: boolean, message: string): void {
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

export function validateCoachReportV1FrenchCopy(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(html);

  for (const term of FORBIDDEN_VISIBLE_TERMS) {
    assertTest(!visible.includes(term), `visible report must not contain ${term}.`);
  }

  assertTest(visible.includes("À travailler"), "visible report must contain accented À travailler replacement.");
  assertTest(visible.includes("récupérations"), "visible report must contain accented récupérations replacement.");
  assertTest(visible.includes("sécuriser"), "visible report must contain accented sécuriser replacement.");
  assertTest(visible.includes("première"), "visible report must contain accented première replacement.");
  assertTest(visible.includes("après"), "visible report must contain accented après replacement.");
  assertTest(!hasMojibake(visible), "visible report must contain no mojibake markers.");

  return [
    "visible report does not contain A travailler",
    "visible report does not contain recuperations",
    "visible report does not contain securiser",
    "visible report does not contain premiere",
    "visible report does not contain apres as French prose",
    "visible report contains correct accented replacements",
    "no mojibake markers appear",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1FrenchCopy();

  console.log("coachReportV1FrenchCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

