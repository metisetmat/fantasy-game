import { TACTICAL_STORYBOARD_CONFIG } from "./storyboardConfig";
import type { TacticalStoryboardPage, TacticalStoryboardReference } from "./tacticalStoryboard";
import { validateFocusStoryboardPage } from "../focus";

export interface StoryboardValidationResult {
  readonly status: "PASS" | "FAIL";
  readonly warnings: readonly string[];
}

function narrativeWarnings(input: {
  readonly sectionName: string;
  readonly bullets: readonly string[];
  readonly maxBullets: number;
}): readonly string[] {
  return [
    ...(input.bullets.length === 0 ? [`${input.sectionName}: missing narrative bullets`] : []),
    ...(input.bullets.length > input.maxBullets
      ? [`${input.sectionName}: ${input.bullets.length} bullets exceeds ${input.maxBullets}`]
      : []),
    ...input.bullets
      .filter((bullet) => /\d{2,}\/100|openness|pressure \d/i.test(bullet))
      .map((bullet) => `${input.sectionName}: debug metric leaked into coach language: ${bullet}`),
  ];
}

function extractRootNumber(svg: string, attribute: string): number {
  const match = new RegExp(`<svg[^>]*${attribute}="([^"]+)"`).exec(svg);
  return Number.parseFloat(match?.[1] ?? "0");
}

function rootAttribute(svg: string, attribute: string): string {
  return new RegExp(`<svg[^>]*${attribute}="([^"]+)"`).exec(svg)?.[1] ?? "";
}

function svgReadabilityWarnings(svg: string, label: string): readonly string[] {
  const width = extractRootNumber(svg, "width");
  const height = extractRootNumber(svg, "height");
  const fieldWidthRatio = Number.parseFloat(rootAttribute(svg, "data-field-width-ratio"));
  const majorLabels = svg.match(/data-major-label=/g)?.length ?? 0;
  const textPattern = /<text([^>]*)>([^<]*)<\/text>/g;
  const longTextWarnings: string[] = [];
  let textMatch = textPattern.exec(svg);

  while (textMatch !== null) {
    const attrs = textMatch[1] ?? "";
    const text = (textMatch[2] ?? "").trim();
    if (!attrs.includes("data-title=\"true\"") && text.length > 28) {
      longTextWarnings.push(`${label}: SVG text node too long: ${text}`);
    }
    textMatch = textPattern.exec(svg);
  }

  return [
    ...(width >= TACTICAL_STORYBOARD_CONFIG.storyboardSvgWidth
      ? []
      : [`${label}: SVG width ${width} below ${TACTICAL_STORYBOARD_CONFIG.storyboardSvgWidth}`]),
    ...(height >= TACTICAL_STORYBOARD_CONFIG.storyboardSvgHeight
      ? []
      : [`${label}: SVG height ${height} below ${TACTICAL_STORYBOARD_CONFIG.storyboardSvgHeight}`]),
    ...(fieldWidthRatio >= TACTICAL_STORYBOARD_CONFIG.fieldWidthRatio
      ? []
      : [`${label}: field width ratio ${fieldWidthRatio} below ${TACTICAL_STORYBOARD_CONFIG.fieldWidthRatio}`]),
    ...(majorLabels <= TACTICAL_STORYBOARD_CONFIG.maxOnFieldLabels
      ? []
      : [`${label}: ${majorLabels} on-field labels exceeds ${TACTICAL_STORYBOARD_CONFIG.maxOnFieldLabels}`]),
    ...(svg.includes("Visual Legend") || svg.includes("legend")
      ? [`${label}: footer legend text appears inside SVG`]
      : []),
    ...longTextWarnings,
  ];
}

function playerAttribute(svg: string, playerId: string, attribute: string): string | null {
  return (
    new RegExp(`<g id="storyboard-player-${playerId}"[^>]*${attribute}="([^"]*)"`).exec(svg)?.[1] ??
    null
  );
}

function positionWarnings(input: {
  readonly page: TacticalStoryboardPage;
  readonly svg: string;
  readonly frame: "before" | "after";
}): readonly string[] {
  const metadata = input.frame === "before" ? input.page.sourceSnapshot.beforeMetadata : input.page.sourceSnapshot.afterMetadata;

  return metadata.playerStates.flatMap((player) => {
    const realZone = playerAttribute(input.svg, player.playerId, "data-real-zone");
    const source = playerAttribute(input.svg, player.playerId, "data-position-source");
    const renderedZone = playerAttribute(input.svg, player.playerId, "data-rendered-zone");
    const projectedZone = playerAttribute(input.svg, player.playerId, "data-projected-zone");
    const hasProjectedMarker =
      projectedZone !== null && projectedZone.length > 0 && projectedZone !== player.zone
        ? input.svg.includes(`id="storyboard-projected-${player.playerId}"`)
        : true;
    const hasLeaderLine =
      source === "OFFSET_FOR_VISIBILITY" ? input.svg.includes(`id="storyboard-leader-${player.playerId}"`) : true;

    return [
      ...(realZone === player.zone ? [] : [`${input.frame}: ${player.roleInitials} real zone ${realZone ?? "missing"} != ${player.zone}`]),
      ...(renderedZone === player.zone ? [] : [`${input.frame}: ${player.roleInitials} rendered zone ${renderedZone ?? "missing"} != real zone`]),
      ...(source === "REAL" || source === "OFFSET_FOR_VISIBILITY"
        ? []
        : [`${input.frame}: ${player.roleInitials} invalid position source ${source ?? "missing"}`]),
      ...(hasLeaderLine ? [] : [`${input.frame}: ${player.roleInitials} offset marker missing leader line`]),
      ...(hasProjectedMarker ? [] : [`${input.frame}: ${player.roleInitials} projected zone metadata missing ghost marker`]),
    ];
  });
}

export function validateStoryboardPage(input: {
  readonly page: TacticalStoryboardPage;
  readonly beforeSvg: string;
  readonly afterSvg: string;
}): StoryboardValidationResult {
  const focusValidation = validateFocusStoryboardPage(input);
  const requiredKeyActors = [
    input.page.beforeFrame.facts.ballCarrier?.playerId ?? "",
    input.page.afterFrame.facts.ballCarrier?.playerId ?? "",
    input.page.beforeFrame.facts.primaryActor?.playerId ?? "",
  ].filter((playerId) => playerId !== "");
  const keyActorWarnings = requiredKeyActors.flatMap((playerId) => [
    ...(input.beforeSvg.includes(`data-player-id="${playerId}"`) || input.afterSvg.includes(`data-player-id="${playerId}"`)
      ? []
      : [`key actor missing from storyboard SVG: ${playerId}`]),
  ]);
  const selectedOptionVisible = input.page.analysisBoard.rankedOptions.some((option) => option.selected);
  const warnings = [
    ...(input.page.beforeFrame.camera.cameraKey === input.page.afterFrame.camera.cameraKey
      ? []
      : ["before/after snapshots do not share camera framing"]),
    ...(input.beforeSvg.includes("storyboard-ball") && input.afterSvg.includes("storyboard-ball")
      ? []
      : ["ball carrier marker missing from before or after frame"]),
    ...(input.beforeSvg.includes("storyboard-selected-action") || input.afterSvg.includes("storyboard-selected-action")
      ? []
      : ["selected action vector missing from storyboard"]),
    ...keyActorWarnings,
    ...(input.page.analysisBoard.actionContext.length > 0 ? [] : ["Tactical Analysis Board missing Action Context"]),
    ...(input.page.analysisBoard.rankedOptions.length > 0 ? [] : ["Ranked Options table has no options"]),
    ...(selectedOptionVisible ? [] : ["Ranked Options table does not include selected option"]),
    ...svgReadabilityWarnings(input.beforeSvg, "before"),
    ...svgReadabilityWarnings(input.afterSvg, "after"),
    ...positionWarnings({ page: input.page, svg: input.beforeSvg, frame: "before" }),
    ...positionWarnings({ page: input.page, svg: input.afterSvg, frame: "after" }),
    ...narrativeWarnings({ sectionName: "before narrative", bullets: input.page.beforeNarrative, maxBullets: 7 }),
    ...narrativeWarnings({ sectionName: "after narrative", bullets: input.page.afterNarrative, maxBullets: 7 }),
    ...narrativeWarnings({ sectionName: "AI tactical analysis", bullets: input.page.aiTacticalAnalysis, maxBullets: 7 }),
    ...(input.page.aiTacticalAnalysis.some((bullet) => bullet.includes("Why it mattered") || bullet.includes("Why it matters"))
      ? []
      : ["AI tactical analysis does not explain why the action mattered"]),
    ...focusValidation.warnings,
  ];

  return {
    status: warnings.length === 0 ? "PASS" : "FAIL",
    warnings,
  };
}

export function renderStoryboardValidationMarkdown(references: readonly TacticalStoryboardReference[]): string {
  const failed = references.filter((reference) => reference.validationStatus === "FAIL");

  return [
    "# Tactical Storyboard Validation",
    "",
    `- storyboard pages: ${references.length}`,
    `- failures: ${failed.length}`,
    "",
    "## Pages",
    ...references.map(
      (reference) =>
        `- sequence ${reference.sequenceNumber} action ${reference.actionNumber}: ${reference.focusCategory} ${reference.validationStatus} (${reference.pagePath})`,
    ),
    ...(failed.length === 0
      ? []
      : [
          "",
          "## Warnings",
          ...failed.flatMap((reference) => [
            `- ${reference.pagePath}`,
            ...reference.warnings.map((warning) => `  - ${warning}`),
          ]),
        ]),
    "",
  ].join("\n");
}
