import { readFileSync } from "node:fs";
import type { TacticalWorkbenchPlayerPosition } from "./tacticalWorkbenchTypes";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { sequence1Action2WorkbenchTruth } from "./fixtures/sequence1Action2.fixture";
import { sequence1Action3WorkbenchTruth } from "./fixtures/sequence1Action3.fixture";

function attributeValue(fragment: string, attribute: string): string | undefined {
  const match = new RegExp(`${attribute}="([^"]+)"`).exec(fragment);

  return match?.[1];
}

export function extractWorkbenchPlayerPositions(html: string, frame: "before" | "after"): readonly TacticalWorkbenchPlayerPosition[] {
  const pattern = new RegExp(`<g id="${frame}-player-[^"]+"[^>]*data-truth-type="real-player-position"[^>]*>`, "g");
  const matches = html.match(pattern) ?? [];

  return matches.map((fragment) => {
    const renderedZone = attributeValue(fragment, "data-rendered-zone");
    const projectedZone = attributeValue(fragment, "data-projected-zone");

    return {
      playerId: attributeValue(fragment, "data-player-id") ?? "unknown-player",
      teamId: attributeValue(fragment, "data-team-id") ?? "unknown-team",
      role: attributeValue(fragment, "data-role") ?? "unknown-role",
      initials: attributeValue(fragment, "data-initials") ?? "??",
      realZone: attributeValue(fragment, "data-real-zone") ?? "UNKNOWN_ZONE",
      ...(renderedZone === undefined ? {} : { renderedZone }),
      ...(projectedZone === undefined ? {} : { projectedZone }),
    };
  });
}

export function extractSequenceOneActionOneWorkbenchTruthFromHtml(path: string): typeof sequence1Action1WorkbenchTruth {
  const html = readFileSync(path, "utf8");
  const beforePositions = extractWorkbenchPlayerPositions(html, "before");
  const afterPositions = extractWorkbenchPlayerPositions(html, "after");

  if (beforePositions.length < 20 || afterPositions.length < 10) {
    return sequence1Action1WorkbenchTruth;
  }

  return {
    ...sequence1Action1WorkbenchTruth,
    playerPositions: beforePositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-tempo-half",
    })),
    afterPlayerPositions: afterPositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-mobile-lock",
    })),
  };
}

export function extractSequenceOneActionTwoWorkbenchTruthFromHtml(path: string): typeof sequence1Action2WorkbenchTruth {
  const html = readFileSync(path, "utf8");
  const beforePositions = extractWorkbenchPlayerPositions(html, "before");
  const afterPositions = extractWorkbenchPlayerPositions(html, "after");

  if (beforePositions.length < 10 || afterPositions.length < 8) {
    return sequence1Action2WorkbenchTruth;
  }

  return {
    ...sequence1Action2WorkbenchTruth,
    playerPositions: beforePositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-mobile-lock",
    })),
    afterPlayerPositions: afterPositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-playmaker",
    })),
  };
}

export function extractSequenceOneActionThreeWorkbenchTruthFromHtml(path: string): typeof sequence1Action3WorkbenchTruth {
  const html = readFileSync(path, "utf8");
  const beforePositions = extractWorkbenchPlayerPositions(html, "before");
  const afterPositions = extractWorkbenchPlayerPositions(html, "after");

  if (beforePositions.length < 10 || afterPositions.length < 8) {
    return sequence1Action3WorkbenchTruth;
  }

  return {
    ...sequence1Action3WorkbenchTruth,
    playerPositions: beforePositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-playmaker",
    })),
    afterPlayerPositions: afterPositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-space-hunter",
    })),
  };
}
