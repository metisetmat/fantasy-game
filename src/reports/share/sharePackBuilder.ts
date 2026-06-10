import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { currentSprint } from "./currentSharePack";
import { expectedSharePackFiles, resolveActiveSharePackConfig } from "./sharePackConfig";
import type { ActiveSharePackConfig, SharePackBuildFile } from "./sharePackTypes";

function timestamp(): string {
  const now = new Date();
  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

function archiveSharePackIfRequested(reportDirectory: string, shareDirectory: string): void {
  if (process.env.SHARE_PACK_ARCHIVE !== "true" || !existsSync(shareDirectory)) {
    return;
  }

  const archiveDirectory = join(reportDirectory, "archive", `share-pack-${timestamp()}`);
  mkdirSync(archiveDirectory, { recursive: true });

  for (const entry of readdirSync(shareDirectory)) {
    const entryPath = join(shareDirectory, entry);
    if (statSync(entryPath).isFile()) {
      copyFileSync(entryPath, join(archiveDirectory, entry));
    }
  }
}

function cleanupShareDirectory(input: {
  readonly shareDirectory: string;
  readonly allowlist: ReadonlySet<string>;
}): void {
  for (const entry of readdirSync(input.shareDirectory)) {
    const entryPath = join(input.shareDirectory, entry);
    if (statSync(entryPath).isFile() && !input.allowlist.has(entry)) {
      unlinkSync(entryPath);
    }
  }
}

function copyCurrentFiles(files: readonly SharePackBuildFile[]): void {
  for (const file of files) {
    if (file.file === "manifest.md" || file.file === "README.md" || file.file === "validation.share-pack.md") {
      continue;
    }

    if (!existsSync(file.sourcePath)) {
      throw new Error(`Required share pack file missing: ${file.sourcePath}`);
    }

    copyFileSync(file.sourcePath, file.sharePath);
  }
}

function replacementForExcludedFile(file: string): string {
  if (file === "sequence-1-action-1.html") {
    return "excluded workbench artifact";
  }

  if (file === "scoring-model.md") {
    return "excluded scoring model reference";
  }

  if (file.includes("calibration") || file.includes("seed") || file.includes("style") || file.includes("outcome-monitoring")) {
    return "excluded calibration report";
  }

  return "excluded non-current report";
}

function sanitizeCopiedMinimalReviewFiles(input: {
  readonly shareDirectory: string;
  readonly config: ActiveSharePackConfig;
}): void {
  if (input.config.mode !== "MINIMAL_REVIEW") {
    return;
  }

  for (const entry of readdirSync(input.shareDirectory)) {
    const entryPath = join(input.shareDirectory, entry);
    if (!statSync(entryPath).isFile()) {
      continue;
    }
    if (entry === "manifest.md" || entry === "README.md") {
      continue;
    }

    if (![".md", ".html"].includes(extname(entry))) {
      continue;
    }

    if (entry === "route-resolution-calibrations.md" || entry === "validation.route-resolution-calibrations.md") {
      continue;
    }

    let markdown = readFileSync(entryPath, "utf8");
    for (const excludedFile of input.config.excludedByDefault) {
      markdown = markdown.replaceAll(excludedFile, replacementForExcludedFile(excludedFile));
    }
    writeFileSync(entryPath, markdown, "utf8");
  }
}

function readmeMarkdown(config: ActiveSharePackConfig): string {
  return [
    "# Current Review Pack",
    "",
    "This directory contains only the files to upload for the current ChatGPT review.",
    "",
    "Current sprint:",
    config.sprintName,
    "",
    "Mode:",
    config.mode,
    "",
    "Upload instruction:",
    "Upload every file in this folder.",
    "Do not add files from reports/ unless ChatGPT asks for them.",
    "",
    "If a deeper audit is needed:",
    "Run with SHARE_PACK_MODE=FULL_AUDIT.",
    "",
  ].join("\n");
}

function manifestMarkdown(config: ActiveSharePackConfig): string {
  const excludedDescriptions =
    config.excludedByDefault.length === 0
      ? ["- none in FULL_AUDIT mode"]
      : [
          "- broader scoring calibration reports",
          "- scenario and style-balance calibration reports",
          "- scoring model reference documentation",
          "- workbench HTML artifacts",
        ];

  return [
    "# Share Pack Manifest",
    "",
    "## Purpose",
    config.mode === "MINIMAL_REVIEW"
      ? "Minimal files to upload to ChatGPT for review after this sprint."
      : "Full audit files to upload to ChatGPT for a broad report review.",
    "",
    "## Sprint",
    config.sprintName,
    "",
    "## Share pack mode",
    config.mode,
    "",
    "## Upload instruction",
    "Upload every file in this reports/share directory.",
    "Do not upload files from reports/ unless they are listed here.",
    "",
    "## Included files",
    "",
    "| Share path | Required | Reason |",
    "| --- | --- | --- |",
    ...config.files.map((file) => `| reports/share/${basename(file.sharePath)} | ${file.required ? "required" : "optional"} | ${file.reason} |`),
    "",
    "## Excluded by default",
    "",
    ...excludedDescriptions,
    "",
    "These files remain in their source locations and can be requested if a regression requires them.",
    "",
    "## Optional files",
    "",
    ...currentSprint.optionalFiles.map((file) => `- ${file.file}: ${file.includeIf}`),
    "",
  ].join("\n");
}

export function writeSharePack(input: { readonly reportDirectory: string }): void {
  const config = resolveActiveSharePackConfig(input.reportDirectory);
  const shareDirectory = join(input.reportDirectory, "share");
  const allowlist = new Set(config.files.map((file) => basename(file.sharePath)));

  if (!existsSync(shareDirectory)) {
    mkdirSync(shareDirectory, { recursive: true });
  }

  archiveSharePackIfRequested(input.reportDirectory, shareDirectory);
  cleanupShareDirectory({ shareDirectory, allowlist });
  copyCurrentFiles(config.files);
  writeFileSync(join(shareDirectory, "README.md"), readmeMarkdown(config), "utf8");
  writeFileSync(join(shareDirectory, "manifest.md"), manifestMarkdown(config), "utf8");
  sanitizeCopiedMinimalReviewFiles({ shareDirectory, config });
}

export { expectedSharePackFiles, resolveActiveSharePackConfig };
