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
    "fullmatch-workbench-chain-replay-4i.md",
    "validation.fullmatch-workbench-chain-replay-4i.md",
    "validation.share-pack.md",
    "coach-report.default.html",
    "coach-report.experimental.html",
    "coach-report.latest.html",
  ];

  for (const suffix of requiredSuffixes) {
    const target = result.targets.find((candidate) => candidate.path.endsWith(suffix));
    assertTest(target !== undefined, `${suffix} must be covered by generated artifact encoding validation.`);
    if (target === undefined) {
      continue;
    }
    if (target.exists) {
      assertTest(target.mojibakeMarkerCount === 0, `${suffix} must contain no mojibake markers.`);
    }
  }

  const existingMojibakeMarkerCount = result.targets
    .filter((target) => target.exists)
    .reduce((total, target) => total + target.mojibakeMarkerCount, 0);

  assertTest(existingMojibakeMarkerCount === 0, `generated artifacts must contain no mojibake markers, got ${existingMojibakeMarkerCount}.`);

  return [
    "fullmatch-workbench-chain-replay-4i.md has no mojibake markers",
    "validation.fullmatch-workbench-chain-replay-4i.md has no mojibake markers",
    "validation.share-pack.md has no mojibake markers",
    "coach-report.default.html has no mojibake markers",
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
