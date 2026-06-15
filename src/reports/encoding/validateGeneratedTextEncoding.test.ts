import { existsSync } from "node:fs";
import { join } from "node:path";
import { findMojibakeMarkers, hasMojibake } from "./mojibakeDetection";
import {
  generatedTextEncodingTargets,
  validateGeneratedTextEncoding,
} from "./validateGeneratedTextEncoding";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function repositoryRoot(): string {
  return join(__dirname, "..", "..", "..");
}

export function validateGeneratedTextEncodingContracts(): readonly string[] {
  const doubleEncodedBadSample = "\u00c3\u0192\u00c2\u00a9tiquette encod\u00c3\u0192\u00c2\u00a9e";
  const singleEncodedBadSample = "qualit\u00c3\u00a9, multi-sc\u00c3\u00a9narios, \u00e2\u20ac\u201d";
  const goodSample = "r\u00e9cup\u00e9ration d\u00e9fensive, erreurs provoqu\u00e9es par la pression, ligne cass\u00e9e, possession s\u00e9curis\u00e9e, danger cr\u00e9\u00e9";
  const reportDirectory = join(repositoryRoot(), "reports");
  const targets = generatedTextEncodingTargets(reportDirectory);
  const result = validateGeneratedTextEncoding({ reportDirectory });

  assertTest(hasMojibake(doubleEncodedBadSample), "double-encoded mojibake markers must be detected.");
  assertTest(hasMojibake(singleEncodedBadSample), "single-encoded mojibake markers must be detected.");
  assertTest(findMojibakeMarkers(doubleEncodedBadSample).length > 0, "bad sample must expose marker names.");
  assertTest(!hasMojibake(goodSample), "correct French strings must pass mojibake detection.");
  assertTest(targets.some((target) => target.path.endsWith("fullmatch-workbench-chain-replay-4i.md")), "fullmatch-workbench-chain-replay-4i.md must be covered.");
  assertTest(targets.some((target) => target.path.endsWith("coach-report.default.html")), "default coach report HTML must be covered.");
  assertTest(targets.some((target) => target.path.endsWith("coach-report.experimental.html")), "coach report HTML files must be covered.");
  assertTest(targets.some((target) => target.category === "share_markdown"), "share-pack markdown files must be covered.");
  assertTest(targets.some((target) => target.category === "validation_markdown"), "validation markdown files must be covered.");

  if (existsSync(join(reportDirectory, "share", "fullmatch-workbench-chain-replay-4i.md"))) {
    const existingMojibakeMarkerCount = result.targets
      .filter((target) => target.exists)
      .reduce((total, target) => total + target.mojibakeMarkerCount, 0);

    assertTest(existingMojibakeMarkerCount === 0, `existing generated artifacts must contain no mojibake markers, got ${existingMojibakeMarkerCount}.`);
  }

  return [
    "double-encoded mojibake sample is detected",
    "single-encoded mojibake sample is detected",
    "correct French strings pass",
    "fullmatch-workbench-chain-replay-4i.md is covered",
    "coach-report.default.html is covered",
    "coach report HTML files are covered",
    "share-pack markdown files are covered",
    "validation markdown files are covered",
  ];
}

if (require.main === module) {
  const checks = validateGeneratedTextEncodingContracts();

  console.log("validateGeneratedTextEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
