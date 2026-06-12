import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_MOJIBAKE_MARKERS: readonly string[] = [
  "Ãƒ",
  "Ã‚",
  "Ã¢â‚¬â€",
  "Ã¢â‚¬â€œ",
  "ÃƒÂ©",
  "ÃƒÂ¨",
  "Ãƒ ",
  "ÃƒÂ§",
  "Ã©",
  "Ã¨",
  "Ã ",
  "Ã§",
  "â€”",
  "â€“",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function forbiddenMarkersIn(value: string): readonly string[] {
  return FORBIDDEN_MOJIBAKE_MARKERS.filter((marker) => value.includes(marker));
}

export function validateHtmlCoachReportEncoding(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const defaultMarkers = forbiddenMarkersIn(defaultHtml);
  const experimentalMarkers = forbiddenMarkersIn(experimentalHtml);

  assertTest(experimentalHtml.includes("Confiance multi-scénarios"), "experimental coach HTML must contain valid multi-scenario title.");
  assertTest(experimentalHtml.includes("Confiance faible — 37/100"), "experimental coach HTML must contain valid em dash in confidence copy.");
  assertTest(experimentalHtml.includes("Stabilité"), "experimental coach HTML must contain valid accented stability copy.");
  assertTest(!containsMojibake(experimentalHtml), "experimental coach HTML must not contain mojibake.");
  assertTest(!containsMojibake(defaultHtml), "default coach HTML must not contain mojibake.");
  assertTest(experimentalMarkers.length === 0, `experimental coach HTML contains mojibake markers: ${experimentalMarkers.join(", ")}`);
  assertTest(defaultMarkers.length === 0, `default coach HTML contains mojibake markers: ${defaultMarkers.join(", ")}`);

  return [
    "experimental coach HTML contains Confiance multi-scénarios",
    "experimental coach HTML contains valid em dash confidence copy",
    "experimental coach HTML contains Stabilité with valid accents",
    "experimental coach HTML contains no mojibake markers",
    "default coach HTML contains no mojibake markers",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportEncoding();

  console.log("htmlCoachReportEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
