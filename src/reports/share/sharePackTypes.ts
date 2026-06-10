export type SharePackMode = "FULL_AUDIT" | "MINIMAL_REVIEW";

export interface SharePackFileConfig {
  readonly file: string;
  readonly required: boolean;
  readonly reason: string;
}

export interface OptionalSharePackFileConfig {
  readonly file: string;
  readonly includeIf: string;
  readonly reason?: string;
}

export interface CurrentSharePackConfig {
  readonly name: string;
  readonly mode: SharePackMode;
  readonly requiredFiles: readonly string[];
  readonly optionalFiles: readonly OptionalSharePackFileConfig[];
  readonly excludedByDefault: readonly string[];
  readonly fileReasons: Readonly<Record<string, string>>;
}

export interface SharePackBuildFile {
  readonly file: string;
  readonly sourcePath: string;
  readonly sharePath: string;
  readonly required: boolean;
  readonly reason: string;
}

export interface ActiveSharePackConfig {
  readonly sprintName: string;
  readonly mode: SharePackMode;
  readonly files: readonly SharePackBuildFile[];
  readonly excludedByDefault: readonly string[];
}
