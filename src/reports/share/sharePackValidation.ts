import { existsSync } from "node:fs";
import { basename } from "node:path";
import { sourcePathForShareFile } from "./sharePackConfig";
import type { ActiveSharePackConfig } from "./sharePackTypes";

export function staleShareFiles(input: {
  readonly filesOnDisk: readonly string[];
  readonly activeConfig: ActiveSharePackConfig;
}): readonly string[] {
  const allowlist = new Set(input.activeConfig.files.map((file) => basename(file.sharePath)));

  return input.filesOnDisk.filter((file) => !allowlist.has(file));
}

export function excludedFilesFoundInShare(input: {
  readonly filesOnDisk: readonly string[];
  readonly activeConfig: ActiveSharePackConfig;
}): readonly string[] {
  const fileSet = new Set(input.filesOnDisk);

  return input.activeConfig.excludedByDefault.filter((file) => fileSet.has(file));
}

export function missingExcludedSourceFiles(input: {
  readonly reportDirectory: string;
  readonly activeConfig: ActiveSharePackConfig;
}): readonly string[] {
  return input.activeConfig.excludedByDefault.filter((file) => !existsSync(sourcePathForShareFile(input.reportDirectory, file)));
}
