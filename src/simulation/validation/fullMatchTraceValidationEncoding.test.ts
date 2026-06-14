import { join } from "node:path";
import { validateGeneratedTextEncoding } from "../../reports/encoding/validateGeneratedTextEncoding";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function repositoryRoot(): string {
  return join(__dirname, "..", "..", "..");
}

export function validateFullMatchTraceValidationEncoding(): readonly string[] {
  const result = validateGeneratedTextEncoding({
    reportDirectory: join(repositoryRoot(), "reports"),
  });
  const requiredSuffixes = [
    "fullmatch-trace-validation-4g.md",
    "fullmatch-workbench-chain-replay-4g.md",
    "validation.fullmatch-workbench-chain-replay-4g.md",
    "validation.share-pack.md",
    "coach-report.experimental.html",
    "coach-report.latest.html",
  ];

  for (const suffix of requiredSuffixes) {
    const target = result.targets.find((candidate) => candidate.path.endsWith(suffix));
    assertTest(target !== undefined, `${suffix} must be covered by generated artifact encoding validation.`);
    if (target === undefined) {
      continue;
    }
    assertTest(target.exists, `${suffix} must exist before encoding validation.`);
    assertTest(target.mojibakeMarkerCount === 0, `${suffix} must contain no mojibake markers.`);
  }

  assertTest(result.totalMojibakeMarkerCount === 0, `generated artifacts must contain no mojibake markers, got ${result.totalMojibakeMarkerCount}.`);

  return [
    "fullmatch-trace-validation-4g.md has no mojibake markers",
    "fullmatch-workbench-chain-replay-4g.md has no mojibake markers",
    "validation.fullmatch-workbench-chain-replay-4g.md has no mojibake markers",
    "validation.share-pack.md has no mojibake markers",
    "coach-report.experimental.html has no mojibake markers",
    "coach-report.latest.html has no mojibake markers",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationEncoding();

  console.log("fullMatchTraceValidationEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
