import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotReference, SnapshotReportClaim } from "../visualization";
import { SnapshotTruthClaimStatus } from "../visualization";

export interface SnapshotManifestClaim {
  readonly claimId: string;
  readonly claimType: string;
  readonly status: SnapshotTruthClaimStatus;
  readonly linkedVisualElementIds: readonly string[];
  readonly missingVisualElementIds: readonly string[];
}

export interface SnapshotManifestEntry {
  readonly filename: string;
  readonly snapshotId: string;
  readonly timelineEventId: string;
  readonly tick: number;
  readonly sequence: number;
  readonly action: number;
  readonly beforeAfter: "before" | "after";
  readonly sourceWorldStateHash: string;
  readonly truthStatus: SnapshotTruthClaimStatus;
  readonly renderedPlayerCount: number;
  readonly visualClaims: readonly SnapshotManifestClaim[];
  readonly failedClaims: readonly string[];
  readonly linkedReportSection: string;
}

export interface SnapshotTruthValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly manifest: readonly SnapshotManifestEntry[];
  readonly markdown: string;
}

interface SnapshotSvgReadModel {
  readonly filename: string;
  readonly svg: string;
  readonly markerPlayerIds: readonly string[];
  readonly labelPlayerIds: readonly string[];
  readonly labelInitials: readonly string[];
  readonly layerNames: readonly string[];
  readonly truthTypes: readonly string[];
}

function extractFromPattern(svg: string, pattern: RegExp): readonly string[] {
  const values: string[] = [];
  let match = pattern.exec(svg);

  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      values.push(value);
    }
    match = pattern.exec(svg);
  }

  return values;
}

function readSnapshotSvg(input: { readonly reportDirectory: string; readonly relativePath: string }): SnapshotSvgReadModel {
  const filename = input.relativePath.replace(/^snapshots\//, "");
  const fullPath = join(input.reportDirectory, input.relativePath);
  const svg = readFileSync(fullPath, "utf8");

  return {
    filename,
    svg,
    markerPlayerIds: extractFromPattern(svg, /<g id="player-[^"]+"[^>]*data-player-id="([^"]+)"/g),
    labelPlayerIds: extractFromPattern(svg, /<text class="player-label"[^>]*data-player-id="([^"]+)"/g),
    labelInitials: extractFromPattern(svg, /<text class="player-label"[^>]*data-initials="([^"]+)"/g),
    layerNames: extractFromPattern(svg, /data-layer="([^"]+)"/g),
    truthTypes: extractFromPattern(svg, /data-truth-type="([^"]+)"/g),
  };
}

function hasElementId(svg: string, id: string): boolean {
  return svg.includes(`id="${id}"`);
}

function uniqueCount(values: readonly string[]): number {
  return new Set(values).size;
}

function validateVisualClaim(claim: SnapshotReportClaim, svg: string): SnapshotManifestClaim {
  const missingVisualElementIds = claim.linkedVisualElementIds.filter((id) => !hasElementId(svg, id));
  const status =
    claim.status === SnapshotTruthClaimStatus.NotRenderable
      ? SnapshotTruthClaimStatus.NotRenderable
      : missingVisualElementIds.length === 0
        ? claim.status
        : SnapshotTruthClaimStatus.Fail;

  return {
    claimId: claim.claimId,
    claimType: claim.claimType,
    status,
    linkedVisualElementIds: claim.linkedVisualElementIds,
    missingVisualElementIds,
  };
}

function requiredLayerErrors(readModel: SnapshotSvgReadModel): readonly string[] {
  const layers = new Set(readModel.layerNames);
  const required = [
    "field",
    "zone-grid",
    "scoring",
    "player-marker",
    "ball",
    "action",
    "influence",
    "perception",
    "legend",
  ];

  return required.filter((layer) => !layers.has(layer)).map((layer) => `${readModel.filename}: missing ${layer} layer`);
}

function requiredElementErrors(input: {
  readonly readModel: SnapshotSvgReadModel;
  readonly expectedPlayerIds: readonly string[];
  readonly ballCarrierId: string;
  readonly primaryActorId: string | null;
  readonly receiverId: string | null;
  readonly selectedTargetZone: string | null;
  readonly hasPassingLane: boolean;
  readonly hasOverload: boolean;
  readonly hasRecoveryVector: boolean;
  readonly hasPerception: boolean;
}): readonly string[] {
  const markerIds = new Set(input.readModel.markerPlayerIds);
  const labelIds = new Set(input.readModel.labelPlayerIds);
  const missingMarkers = input.expectedPlayerIds.filter((playerId) => !markerIds.has(playerId));
  const missingLabels = input.expectedPlayerIds.filter((playerId) => !labelIds.has(playerId));
  const errors = [
    ...(uniqueCount(input.readModel.markerPlayerIds) === 20
      ? []
      : [`${input.readModel.filename}: expected 20 unique player markers, rendered ${uniqueCount(input.readModel.markerPlayerIds)}`]),
    ...(input.readModel.labelPlayerIds.length === 20
      ? []
      : [`${input.readModel.filename}: expected 20 player labels, rendered ${input.readModel.labelPlayerIds.length}`]),
    ...(input.readModel.markerPlayerIds.length === uniqueCount(input.readModel.markerPlayerIds)
      ? []
      : [`${input.readModel.filename}: duplicated player marker id`]),
    ...(missingMarkers.length === 0 ? [] : [`${input.readModel.filename}: missing player markers ${missingMarkers.join(", ")}`]),
    ...(missingLabels.length === 0 ? [] : [`${input.readModel.filename}: missing player labels ${missingLabels.join(", ")}`]),
    ...(hasElementId(input.readModel.svg, `ball-carrier-ring-${input.ballCarrierId}`)
      ? []
      : [`${input.readModel.filename}: ball carrier ring missing for ${input.ballCarrierId}`]),
    ...(hasElementId(input.readModel.svg, "ball-marker") ? [] : [`${input.readModel.filename}: ball marker missing`]),
    ...(input.primaryActorId === null || hasElementId(input.readModel.svg, `player-${input.primaryActorId}`)
      ? []
      : [`${input.readModel.filename}: primary actor marker missing ${input.primaryActorId}`]),
    ...(input.receiverId === null || hasElementId(input.readModel.svg, `player-${input.receiverId}`)
      ? []
      : [`${input.readModel.filename}: receiver marker missing ${input.receiverId}`]),
    ...(input.selectedTargetZone === null || hasElementId(input.readModel.svg, `selected-target-${input.selectedTargetZone}`)
      ? []
      : [`${input.readModel.filename}: selected target highlight missing ${input.selectedTargetZone}`]),
    ...(input.hasPassingLane && !hasElementId(input.readModel.svg, "selected-passing-lane")
      ? [`${input.readModel.filename}: passing lane visual missing`]
      : []),
    ...(input.hasOverload && !input.readModel.svg.includes('data-truth-type="OVERLOAD"')
      ? [`${input.readModel.filename}: overload visual missing`]
      : []),
    ...(input.hasRecoveryVector && !input.readModel.svg.includes('data-truth-type="RECOVERY_VECTOR"')
      ? [`${input.readModel.filename}: recovery vector visual missing`]
      : []),
    ...(input.hasPerception && !input.readModel.svg.includes('data-truth-type="VISION_CONE"')
      ? [`${input.readModel.filename}: perception cone visual missing`]
      : []),
    ...(hasElementId(input.readModel.svg, "goal-frame-left") && hasElementId(input.readModel.svg, "goal-frame-right")
      ? []
      : [`${input.readModel.filename}: goal frame visual missing`]),
    ...(input.readModel.svg.includes("data-lane-state=") || !input.hasPassingLane
      ? []
      : [`${input.readModel.filename}: passing lane state data missing`]),
    ...(input.readModel.svg.includes("data-primary-actor=") || !input.hasPassingLane
      ? []
      : [`${input.readModel.filename}: primary actor data missing on action vector`]),
    ...(input.readModel.layerNames.length > 0 ? [] : [`${input.readModel.filename}: no data-layer attributes found`]),
    ...(input.readModel.truthTypes.length > 0 ? [] : [`${input.readModel.filename}: no data-truth-type attributes found`]),
  ];

  return [...requiredLayerErrors(input.readModel), ...errors];
}

function truthStatusFromErrors(errors: readonly string[], claims: readonly SnapshotManifestClaim[]): SnapshotTruthClaimStatus {
  if (errors.length > 0 || claims.some((claim) => claim.status === SnapshotTruthClaimStatus.Fail)) {
    return SnapshotTruthClaimStatus.Fail;
  }

  if (claims.some((claim) => claim.status === SnapshotTruthClaimStatus.Partial)) {
    return SnapshotTruthClaimStatus.Partial;
  }

  return SnapshotTruthClaimStatus.Pass;
}

function createManifestEntry(input: {
  readonly snapshot: SnapshotReference;
  readonly beforeAfter: "before" | "after";
  readonly readModel: SnapshotSvgReadModel;
  readonly claimErrors: readonly string[];
  readonly visualClaims: readonly SnapshotManifestClaim[];
}): SnapshotManifestEntry {
  const contract =
    input.beforeAfter === "before" ? input.snapshot.beforeTruthContract : input.snapshot.afterTruthContract;
  const metadata = input.beforeAfter === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const failedClaims = [
    ...input.claimErrors,
    ...input.visualClaims
      .filter((claim) => claim.status === SnapshotTruthClaimStatus.Fail)
      .map((claim) => `${claim.claimId}: missing ${claim.missingVisualElementIds.join(", ") || "visual evidence"}`),
  ];

  return {
    filename: input.readModel.filename,
    snapshotId: contract.snapshotId,
    timelineEventId: contract.timelineEventId,
    tick: contract.tick,
    sequence: input.snapshot.sequenceNumber,
    action: input.snapshot.actionNumber,
    beforeAfter: input.beforeAfter,
    sourceWorldStateHash: metadata.worldStateHash,
    truthStatus: truthStatusFromErrors(input.claimErrors, input.visualClaims),
    renderedPlayerCount: uniqueCount(input.readModel.markerPlayerIds),
    visualClaims: input.visualClaims,
    failedClaims,
    linkedReportSection: `Sequence ${input.snapshot.sequenceNumber} action ${input.snapshot.actionNumber} ${input.beforeAfter}`,
  };
}

function validateOneSnapshot(input: {
  readonly snapshot: SnapshotReference;
  readonly beforeAfter: "before" | "after";
  readonly reportDirectory: string;
}): SnapshotManifestEntry {
  const relativePath = input.beforeAfter === "before" ? input.snapshot.beforePath : input.snapshot.afterPath;
  const readModel = readSnapshotSvg({ reportDirectory: input.reportDirectory, relativePath });
  const contract =
    input.beforeAfter === "before" ? input.snapshot.beforeTruthContract : input.snapshot.afterTruthContract;
  const metadata = input.beforeAfter === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const expectedPlayerIds = metadata.playerStates.map((player) => player.playerId);
  const visualClaims = contract.reportClaims.map((claim) => validateVisualClaim(claim, readModel.svg));
  const claimErrors = requiredElementErrors({
    readModel,
    expectedPlayerIds,
    ballCarrierId: contract.ballCarrierId,
    primaryActorId: contract.primaryActorId,
    receiverId: contract.receiverId,
    selectedTargetZone: contract.selectedTargetZone,
    hasPassingLane: metadata.passingLaneAnalysis !== null,
    hasOverload: metadata.overloadWindows.length > 0,
    hasRecoveryVector: metadata.recoveryVectors.length > 0,
    hasPerception: metadata.perceptionClaims.length > 0,
  });

  return createManifestEntry({
    snapshot: input.snapshot,
    beforeAfter: input.beforeAfter,
    readModel,
    claimErrors,
    visualClaims,
  });
}

function renderValidationMarkdown(input: {
  readonly manifest: readonly SnapshotManifestEntry[];
  readonly orphanFiles: readonly string[];
}): string {
  const failingEntries = input.manifest.filter((entry) => entry.truthStatus === SnapshotTruthClaimStatus.Fail);
  const lines = [
    "# Snapshot Truth Validation",
    "",
    `- snapshots validated: ${input.manifest.length}`,
    `- failures: ${failingEntries.length}`,
    `- orphan SVGs: ${input.orphanFiles.length === 0 ? "none" : input.orphanFiles.join(", ")}`,
    "",
    "## Manifest Summary",
    ...input.manifest.map(
      (entry) =>
        `- ${entry.filename}: ${entry.truthStatus}, players ${entry.renderedPlayerCount}/20, failed claims ${entry.failedClaims.length}`,
    ),
  ];

  if (failingEntries.length > 0) {
    lines.push("", "## Failures");
    for (const entry of failingEntries) {
      lines.push(`- ${entry.filename}`);
      lines.push(...entry.failedClaims.map((claim) => `  - ${claim}`));
    }
  }

  return `${lines.join("\n")}\n`;
}

export function validateSnapshotTruth(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): SnapshotTruthValidationResult {
  const snapshotDirectory = join(input.reportDirectory, "snapshots");
  const manifest = input.snapshots.flatMap((snapshot) => [
    validateOneSnapshot({ snapshot, beforeAfter: "before", reportDirectory: input.reportDirectory }),
    validateOneSnapshot({ snapshot, beforeAfter: "after", reportDirectory: input.reportDirectory }),
  ]);
  const manifestFilenames = new Set(manifest.map((entry) => entry.filename));
  const orphanFiles = existsSync(snapshotDirectory)
    ? readdirSync(snapshotDirectory).filter((fileName) => fileName.endsWith(".svg") && !manifestFilenames.has(fileName))
    : [];
  const errors = [
    ...manifest.flatMap((entry) => entry.failedClaims.map((claim) => `${entry.filename}: ${claim}`)),
    ...orphanFiles.map((fileName) => `${fileName}: orphan snapshot not referenced by manifest`),
  ];
  const markdown = renderValidationMarkdown({ manifest, orphanFiles });

  if (!existsSync(snapshotDirectory)) {
    throw new Error(`Snapshot directory missing: ${snapshotDirectory}`);
  }

  writeFileSync(join(snapshotDirectory, "snapshot-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  writeFileSync(join(input.reportDirectory, "snapshot-truth-validation.md"), markdown, "utf8");

  return {
    valid: errors.length === 0,
    errors,
    manifest,
    markdown,
  };
}
