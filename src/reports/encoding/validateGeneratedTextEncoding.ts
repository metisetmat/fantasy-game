import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanForMojibake } from "./mojibakeDetection";

export interface GeneratedTextEncodingTarget {
  readonly path: string;
  readonly category: "coach_html" | "share_markdown" | "trace_validation_markdown" | "validation_markdown";
  readonly required: boolean;
}

export interface GeneratedTextEncodingTargetResult extends GeneratedTextEncodingTarget {
  readonly exists: boolean;
  readonly mojibakeMarkerCount: number;
  readonly mojibakeMarkers: readonly string[];
}

export interface GeneratedTextEncodingValidationResult {
  readonly status: "PASS" | "FAIL";
  readonly targets: readonly GeneratedTextEncodingTargetResult[];
  readonly totalMojibakeMarkerCount: number;
}

export function generatedTextEncodingTargets(reportDirectory: string): readonly GeneratedTextEncodingTarget[] {
  return [
    { path: join(reportDirectory, "coach-report.latest.html"), category: "coach_html", required: true },
    { path: join(reportDirectory, "coach-report.experimental.html"), category: "coach_html", required: true },
    { path: join(reportDirectory, "share", "coach-report.latest.html"), category: "coach_html", required: false },
    { path: join(reportDirectory, "share", "coach-report.experimental.html"), category: "coach_html", required: false },
    { path: join(reportDirectory, "share", "fullmatch-trace-validation-4g.md"), category: "trace_validation_markdown", required: true },
    { path: join(reportDirectory, "share", "fullmatch-workbench-chain-replay-4g.md"), category: "share_markdown", required: true },
    { path: join(reportDirectory, "share", "validation.fullmatch-workbench-chain-replay-4g.md"), category: "validation_markdown", required: true },
    { path: join(reportDirectory, "share", "validation.share-pack.md"), category: "validation_markdown", required: true },
    { path: join(reportDirectory, "share", "README.md"), category: "share_markdown", required: true },
    { path: join(reportDirectory, "share", "manifest.md"), category: "share_markdown", required: true },
  ];
}

export function validateGeneratedTextEncoding(input: {
  readonly reportDirectory: string;
}): GeneratedTextEncodingValidationResult {
  const targets = generatedTextEncodingTargets(input.reportDirectory).map((target) => {
    if (!existsSync(target.path)) {
      return {
        ...target,
        exists: false,
        mojibakeMarkerCount: target.required ? 1 : 0,
        mojibakeMarkers: target.required ? ["MISSING_REQUIRED_TARGET"] : [],
      };
    }

    const scan = scanForMojibake(readFileSync(target.path, "utf8"));

    return {
      ...target,
      exists: true,
      mojibakeMarkerCount: scan.markerCount,
      mojibakeMarkers: scan.markers,
    };
  });
  const totalMojibakeMarkerCount = targets.reduce((total, target) => total + target.mojibakeMarkerCount, 0);

  return {
    status: totalMojibakeMarkerCount === 0 ? "PASS" : "FAIL",
    targets,
    totalMojibakeMarkerCount,
  };
}
