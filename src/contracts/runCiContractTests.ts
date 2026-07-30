import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST_ROOT = join(__dirname, "..");

const CI_CONTRACTS: readonly string[] = [
  "contracts/engineToCoachContractGuard.js",
  "simulation/runMatchContractGuard.js",
  "simulation/tacticalPlanInfluenceGuard.js",
  "simulation/runFullMatchContractGuard.js",
  "simulation/matchReportContractGuard.js",
  "reports/htmlCoachReportGuard.js",
  "reports/manualReviewPreviewRenderer8O.test.js",
  "reports/manualReviewPreviewComparison8P.test.js",
  "reports/manualReviewPreviewDecisionGate8Q.test.js",
  "reports/manualReviewWorkflowReadiness8R.test.js",
  "reports/manualReviewWorkflowUxSkeleton8S.test.js",
  "reports/manualReviewUxInteractionContract8T.test.js",
  "reports/manualReviewInputFieldContract8U.test.js",
  "reports/encoding/validateGeneratedTextEncoding.test.js",
];

function runNodeFile(filePath: string): void {
  const displayPath = relative(DIST_ROOT, filePath);
  console.log(`\n[ci-contract-test] ${displayPath}`);
  execFileSync(process.execPath, [filePath], {
    cwd: join(DIST_ROOT, ".."),
    stdio: "inherit",
  });
}

function main(): void {
  for (const contract of CI_CONTRACTS) {
    const contractPath = join(DIST_ROOT, contract);

    if (!existsSync(contractPath)) {
      throw new Error(`Missing CI contract: ${contract}`);
    }

    runNodeFile(contractPath);
  }
}

main();
