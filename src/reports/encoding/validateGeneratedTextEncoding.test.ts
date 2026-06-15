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
  const badSample = "\u00c3\u0192\u00c2\u00a9tiquette encod\u00c3\u0192\u00c2\u00a9e";
  const goodSample = "récupération défensive, erreurs provoquées par la pression, ligne cassée, possession sécurisée, danger créé";
  const reportDirectory = join(repositoryRoot(), "reports");
  const targets = generatedTextEncodingTargets(reportDirectory);
  const result = validateGeneratedTextEncoding({ reportDirectory });

  assertTest(hasMojibake(badSample), "bad sample mojibake markers must be detected.");
  assertTest(findMojibakeMarkers(badSample).length > 0, "bad sample must expose marker names.");
  assertTest(!hasMojibake(goodSample), "correct French strings must pass mojibake detection.");
  assertTest(targets.some((target) => target.path.endsWith("fullmatch-workbench-chain-replay-4i.md")), "fullmatch-workbench-chain-replay-4i.md must be covered.");
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
    "bad mojibake sample is detected",
    "correct French strings pass",
    "fullmatch-workbench-chain-replay-4i.md is covered",
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
