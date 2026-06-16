import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { renderCoachProductReport } from "./renderCoachProductReport";

function writeLatestCoachReport(): void {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const reportsDirectory = join(process.cwd(), "reports");

  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(
    join(reportsDirectory, "match-report.latest.json"),
    `${JSON.stringify(defaultReport, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.latest.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.default.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.experimental.html"),
    renderHtmlCoachReport(experimentalReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.product.html"),
    renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
      experimentalReport,
      engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
    )),
    "utf8",
  );

  console.log("Generated reports/match-report.latest.json");
  console.log("Generated reports/coach-report.latest.html");
  console.log("Generated reports/coach-report.default.html");
  console.log("Generated reports/coach-report.experimental.html");
  console.log("Generated reports/coach-report.product.html");
}

if (require.main === module) {
  writeLatestCoachReport();
}
