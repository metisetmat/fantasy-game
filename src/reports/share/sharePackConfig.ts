import { basename, join } from "node:path";
import { currentSprint } from "./currentSharePack";
import type { ActiveSharePackConfig, SharePackBuildFile, SharePackMode } from "./sharePackTypes";

const fullAuditExtraFiles: readonly string[] = [
  "validation.coach-summary-data-binding.md",
  "validation.tactical-evidence-compaction.md",
  "validation.tactical-evidence-missing-data.md",
  "validation.score-unit-semantics.md",
  "validation.scoring-rules-v1.md",
  "validation.scoring-v1-gameplay-calibration.md",
  "validation.scoring-v1-batch-calibration.md",
  "validation.scenario-seed-variation.md",
  "validation.shot-difficulty-calibration.md",
  "validation.clean-window-style-balance.md",
  "validation.draw-rate-style-outcome-monitoring.md",
  "validation.coach-report-hierarchy.md",
  "multi-action-semantic-generalization.md",
  "scoring-v1-gameplay-calibration.md",
  "scoring-v1-batch-calibration.md",
  "scenario-seed-variation.md",
  "shot-difficulty-calibration.md",
  "clean-window-style-balance.md",
  "draw-rate-style-outcome-monitoring.md",
  "scoring-model.md",
  "sequence-1-action-1.html",
  "debug-full.latest.md",
];

function modeFromEnvironment(): SharePackMode {
  const requestedMode = process.env.SHARE_PACK_MODE;

  return requestedMode === "FULL_AUDIT" || requestedMode === "MINIMAL_REVIEW" ? requestedMode : currentSprint.mode;
}

export function sourcePathForShareFile(reportDirectory: string, file: string): string {
  if (file.startsWith("src/")) {
    return join(reportDirectory, "..", file);
  }

  if (file === "sequence-1-action-1.html") {
    return join(reportDirectory, "workbench", file);
  }

  if (file === "scoring-model.md") {
    return join(reportDirectory, "..", "docs", "game-design", "scoring-model.md");
  }

  if (file === "role_archetypes.md" || file === "role_skill_mapping.md") {
    return join(reportDirectory, "..", "docs", "gameplay", file);
  }

  return join(reportDirectory, file);
}

function unique(files: readonly string[]): readonly string[] {
  return [...new Set(files)];
}

function reasonForFile(file: string): string {
  return currentSprint.fileReasons[file] ?? "included for full-audit context";
}

function activeFileNames(): readonly string[] {
  const mode = modeFromEnvironment();

  return mode === "FULL_AUDIT"
    ? unique([...currentSprint.requiredFiles, ...fullAuditExtraFiles])
    : currentSprint.requiredFiles;
}

export function resolveActiveSharePackConfig(reportDirectory: string): ActiveSharePackConfig {
  const mode = modeFromEnvironment();
  const shareDirectory = join(reportDirectory, "share");
  const files: readonly SharePackBuildFile[] = activeFileNames().map((file) => ({
    file,
    sourcePath: sourcePathForShareFile(reportDirectory, file),
    sharePath: join(shareDirectory, basename(file)),
    required: true,
    reason: reasonForFile(file),
  }));

  return {
    sprintName: currentSprint.name,
    mode,
    files,
    excludedByDefault: mode === "MINIMAL_REVIEW" ? currentSprint.excludedByDefault : [],
  };
}

export function expectedSharePackFiles(reportDirectory: string): readonly string[] {
  return resolveActiveSharePackConfig(reportDirectory).files.map((file) => basename(file.sharePath));
}
