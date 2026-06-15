import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { hasMojibake } from "./encoding/mojibakeDetection";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function repositoryRoot(): string {
  return join(__dirname, "..", "..");
}

export function validateCoachReportV1VisualPolishEncoding(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const shareFiles = [
    join(repositoryRoot(), "reports", "share", "fullmatch-workbench-chain-replay-4i.md"),
    join(repositoryRoot(), "reports", "share", "validation.fullmatch-workbench-chain-replay-4i.md"),
  ].filter((file) => existsSync(file));
  const shareText = shareFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assertTest(!hasMojibake(html), "experimental HTML must contain no mojibake markers.");
  assertTest(shareText.length === 0 || !hasMojibake(shareText), "share markdown must contain no mojibake markers.");
  assertTest(html.includes("Ce que le match dit"), "French label Ce que le match dit must render correctly.");
  assertTest(html.includes("Signaux officiels détaillés"), "French label Signaux officiels détaillés must render correctly.");
  assertTest(html.includes("Hypothèses expérimentales à tester"), "French label Hypothèses expérimentales à tester must render correctly.");
  assertTest(html.includes("Détails techniques et traçabilité"), "French label Détails techniques et traçabilité must render correctly.");

  return [
    "no mojibake markers in experimental HTML",
    "no mojibake markers in share markdown",
    "French labels render correctly",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1VisualPolishEncoding();

  console.log("coachReportV1VisualPolishEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
