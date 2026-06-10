import type { TacticalStoryboardPage } from "../storyboard";

export interface FocusStoryboardValidationResult {
  readonly status: "PASS" | "FAIL";
  readonly warnings: readonly string[];
}

const GENERIC_FILLER_PHRASES: readonly string[] = [
  "blind-side awareness remains a tactical issue",
  "action follows the current possession structure",
  "no major late recovery vector",
  "orientation and scan freshness help explain",
  "support is present but not fully connected",
  "debug layers are suppressed",
  "debug noise",
];

function containsGenericFiller(text: string): string | null {
  const lower = text.toLowerCase();

  return GENERIC_FILLER_PHRASES.find((phrase) => lower.includes(phrase)) ?? null;
}

function narrativeMentionsFocusActor(page: TacticalStoryboardPage): boolean {
  const narrative = [...page.beforeNarrative, ...page.afterNarrative, ...page.aiTacticalAnalysis].join(" ");

  return page.focus.primaryActors.some((actor) => narrative.includes(actor.initials));
}

export function validateFocusStoryboardPage(input: {
  readonly page: TacticalStoryboardPage;
  readonly beforeSvg: string;
  readonly afterSvg: string;
}): FocusStoryboardValidationResult {
  const allNarrative = [...input.page.beforeNarrative, ...input.page.afterNarrative, ...input.page.aiTacticalAnalysis];
  const genericFillerWarnings = allNarrative
    .map((line) => ({ line, phrase: containsGenericFiller(line) }))
    .filter((entry): entry is { readonly line: string; readonly phrase: string } => entry.phrase !== null)
    .map((entry) => `generic filler phrase rejected: ${entry.phrase} in "${entry.line}"`);
  const primaryActorWarnings = input.page.focus.primaryActors.flatMap((actor) => [
    ...(input.beforeSvg.includes(`data-player-id="${actor.playerId}"`) &&
    input.afterSvg.includes(`data-player-id="${actor.playerId}"`)
      ? []
      : [`camera/visuals do not include primary actor ${actor.initials}`]),
    ...(input.beforeSvg.includes(`data-key-actor="true"`) || input.afterSvg.includes(`data-key-actor="true"`)
      ? []
      : ["no key actor emphasis found"]),
  ]);
  const focusOverlayCount =
    (input.beforeSvg.match(/data-storyboard-layer="focus-cue"|data-storyboard-layer="primary-action"|data-storyboard-layer="recovery"/g)?.length ??
      0) +
    (input.afterSvg.match(/data-storyboard-layer="focus-cue"|data-storyboard-layer="primary-action"|data-storyboard-layer="recovery"/g)?.length ??
      0);
  const warnings = [
    ...(input.page.focus.primaryActors.length > 0 ? [] : ["primary tactical focus has no primary actors"]),
    ...(input.page.focus.category.length > 0 ? [] : ["missing focus category"]),
    ...(narrativeMentionsFocusActor(input.page) ? [] : ["narrative does not reference a primary focus actor"]),
    ...(input.afterSvg.includes("id=\"storyboard-delta\"") ? [] : ["AFTER frame does not highlight tactical change"]),
    ...(focusOverlayCount <= 6 ? [] : [`overlay explosion: ${focusOverlayCount} focus overlays rendered`]),
    ...primaryActorWarnings,
    ...genericFillerWarnings,
  ];

  return {
    status: warnings.length === 0 ? "PASS" : "FAIL",
    warnings,
  };
}
