import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotReference } from "../visualization";
import {
  analyzeStoryboardFacts,
  createStoryboardCamera,
  selectStoryboardKeyActors,
} from "./storyboardAnalysis";
import { buildStoryboardAnalysisBoard } from "./storyboardAnalysisBoard";
import { renderStoryboardFrameSvg, renderStoryboardMarkdown } from "./storyboardRenderer";
import type { TacticalStoryboardPage, TacticalStoryboardReference } from "./tacticalStoryboard";
import { renderStoryboardValidationMarkdown, validateStoryboardPage } from "./storyboardValidator";
import {
  buildFocusAfterNarrative,
  buildFocusBeforeNarrative,
  buildFocusTacticalAnalysis,
  buildFocusVisualPlan,
  resolveTacticalFocus,
} from "../focus";

function pageTitle(snapshot: SnapshotReference): string {
  return `Sequence ${snapshot.sequenceNumber}, Action ${snapshot.actionNumber}: ${snapshot.attackingTeamName} vs ${snapshot.defendingTeamName}`;
}

function buildStoryboardPage(snapshot: SnapshotReference): TacticalStoryboardPage {
  const focus = resolveTacticalFocus(snapshot);
  const visualPlan = buildFocusVisualPlan(focus);
  const camera = createStoryboardCamera({ snapshot, focus });
  const beforeFacts = analyzeStoryboardFacts({ snapshot, frame: "before" });
  const afterFacts = analyzeStoryboardFacts({ snapshot, frame: "after" });
  const beforeKeyActors = selectStoryboardKeyActors({
    facts: beforeFacts,
    players: snapshot.beforeMetadata.playerStates,
    focus,
  });
  const afterKeyActors = selectStoryboardKeyActors({
    facts: afterFacts,
    players: snapshot.afterMetadata.playerStates,
    focus,
  });
  const baseName = `sequence-${snapshot.sequenceNumber}-action-${snapshot.actionNumber}`;

  return {
    sequenceNumber: snapshot.sequenceNumber,
    actionNumber: snapshot.actionNumber,
    title: pageTitle(snapshot),
    pageFileName: `${baseName}.md`,
    beforeFrame: {
      snapshotKind: "before",
      svgFileName: `${baseName}-before.svg`,
      camera,
      facts: beforeFacts,
      focus,
      visualPlan,
    },
    afterFrame: {
      snapshotKind: "after",
      svgFileName: `${baseName}-after.svg`,
      camera,
      facts: afterFacts,
      focus,
      visualPlan,
    },
    beforeNarrative: buildFocusBeforeNarrative({ snapshot, focus }),
    afterNarrative: buildFocusAfterNarrative({ snapshot, focus }),
    aiTacticalAnalysis: buildFocusTacticalAnalysis({ snapshot, focus }),
    analysisBoard: buildStoryboardAnalysisBoard({ snapshot, facts: beforeFacts }),
    visualLegend: [
      "solid marker = real player position from PlayerMatchState",
      "ghost marker = projected target position only",
      "dashed arrow = trajectory from real position to projection",
      "yellow ring = ball carrier",
      "bold action arrow = selected option/lane",
      "leader line = visual offset inside the same real zone",
    ],
    focus,
    sourceSnapshot: snapshot,
  };
}

function renderStoryboardIndex(references: readonly TacticalStoryboardReference[]): string {
  return [
    "# Tactical Storyboards",
    "",
    "Human-readable tactical pages generated from the same snapshot and timeline state as the debug report.",
    "",
    ...references.map(
      (reference) =>
        `- [Sequence ${reference.sequenceNumber} action ${reference.actionNumber}](${reference.pagePath.replace(/^storyboards\//, "")}) - ${reference.focusCategory} - ${reference.validationStatus}`,
    ),
    "",
  ].join("\n");
}

export function writeTacticalStoryboards(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): readonly TacticalStoryboardReference[] {
  const storyboardDirectory = join(input.reportDirectory, "storyboards");

  if (!existsSync(storyboardDirectory)) {
    mkdirSync(storyboardDirectory, { recursive: true });
  }

  for (const fileName of readdirSync(storyboardDirectory)) {
    if (fileName.endsWith(".svg") || fileName.endsWith(".md") || fileName === "storyboard-manifest.json") {
      unlinkSync(join(storyboardDirectory, fileName));
    }
  }

  const references = input.snapshots.map((snapshot): TacticalStoryboardReference => {
    const page = buildStoryboardPage(snapshot);
    const beforeKeyActors = selectStoryboardKeyActors({
      facts: page.beforeFrame.facts,
      players: snapshot.beforeMetadata.playerStates,
      focus: page.focus,
    });
    const afterKeyActors = selectStoryboardKeyActors({
      facts: page.afterFrame.facts,
      players: snapshot.afterMetadata.playerStates,
      focus: page.focus,
    });
    const beforeSvg = renderStoryboardFrameSvg({
      title: `${page.title} - Before`,
      snapshot,
      frame: "before",
      facts: page.beforeFrame.facts,
      keyActors: beforeKeyActors,
      camera: page.beforeFrame.camera,
      focus: page.focus,
      visualPlan: page.beforeFrame.visualPlan,
    });
    const afterSvg = renderStoryboardFrameSvg({
      title: `${page.title} - After`,
      snapshot,
      frame: "after",
      facts: page.afterFrame.facts,
      keyActors: afterKeyActors,
      camera: page.afterFrame.camera,
      focus: page.focus,
      visualPlan: page.afterFrame.visualPlan,
    });
    const validation = validateStoryboardPage({ page, beforeSvg, afterSvg });
    const markdown = renderStoryboardMarkdown(page);

    writeFileSync(join(storyboardDirectory, page.beforeFrame.svgFileName), beforeSvg, "utf8");
    writeFileSync(join(storyboardDirectory, page.afterFrame.svgFileName), afterSvg, "utf8");
    writeFileSync(join(storyboardDirectory, page.pageFileName), markdown, "utf8");

    return {
      sequenceNumber: page.sequenceNumber,
      actionNumber: page.actionNumber,
      focusCategory: page.focus.category,
      pagePath: `storyboards/${page.pageFileName}`,
      beforeSvgPath: `storyboards/${page.beforeFrame.svgFileName}`,
      afterSvgPath: `storyboards/${page.afterFrame.svgFileName}`,
      validationStatus: validation.status,
      warnings: validation.warnings,
    };
  });

  writeFileSync(join(storyboardDirectory, "index.md"), renderStoryboardIndex(references), "utf8");
  writeFileSync(join(storyboardDirectory, "storyboard-manifest.json"), JSON.stringify(references, null, 2), "utf8");
  writeFileSync(join(storyboardDirectory, "storyboard-validation.md"), renderStoryboardValidationMarkdown(references), "utf8");
  writeFileSync(join(input.reportDirectory, "storyboard-validation.md"), renderStoryboardValidationMarkdown(references), "utf8");

  return references;
}
