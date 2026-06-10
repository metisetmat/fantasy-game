import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function writeLatestCoachReport(): void {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const reportsDirectory = join(process.cwd(), "reports");

  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(
    join(reportsDirectory, "match-report.latest.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.latest.html"),
    renderHtmlCoachReport(report),
    "utf8",
  );

  console.log("Generated reports/match-report.latest.json");
  console.log("Generated reports/coach-report.latest.html");
}

if (require.main === module) {
  writeLatestCoachReport();
}
