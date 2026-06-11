import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST_ROOT = join(__dirname, "..");

const EXPLICIT_GUARDS: readonly string[] = [
  "contracts/engineToCoachContractGuard.js",
  "simulation/runMatchContractGuard.js",
  "simulation/tacticalPlanInfluenceGuard.js",
  "simulation/runFullMatchContractGuard.js",
  "simulation/matchReportContractGuard.js",
  "reports/htmlCoachReportGuard.js",
];

function collectTestFiles(directory: string): readonly string[] {
  const entries = readdirSync(directory)
    .map((entry) => join(directory, entry))
    .sort((a, b) => a.localeCompare(b));
  const files: string[] = [];

  for (const entry of entries) {
    const stats = statSync(entry);

    if (stats.isDirectory()) {
      files.push(...collectTestFiles(entry));
      continue;
    }

    if (entry.endsWith(".test.js")) {
      files.push(entry);
    }
  }

  return files;
}

function runNodeFile(filePath: string): void {
  const displayPath = relative(DIST_ROOT, filePath);
  console.log(`\n[contract-test] ${displayPath}`);
  execFileSync(process.execPath, [filePath], {
    cwd: join(DIST_ROOT, ".."),
    stdio: "inherit",
  });
}

function main(): void {
  for (const guard of EXPLICIT_GUARDS) {
    const guardPath = join(DIST_ROOT, guard);

    if (!existsSync(guardPath)) {
      throw new Error(`Missing contract guard: ${guard}`);
    }

    runNodeFile(guardPath);
  }

  for (const testFile of collectTestFiles(DIST_ROOT)) {
    runNodeFile(testFile);
  }
}

main();
