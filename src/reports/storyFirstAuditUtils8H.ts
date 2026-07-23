export function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function readTimeSeconds(html: string): number {
  const wordCount = stripTags(html).split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil(wordCount / 3);
}

export function sectionPosition(html: string, sectionId: string): number {
  const index = html.indexOf(`id="${sectionId}"`);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}

export function sectionBefore(html: string, sectionId: string): string {
  const index = sectionPosition(html, sectionId);
  return index === Number.MAX_SAFE_INTEGER ? html : html.slice(0, index);
}

export function coreStoryHtml(html: string): string {
  const storyStart = sectionPosition(html, "official-match-story-spine");
  const actionPlanStart = sectionPosition(html, "coach-action-plan");
  if (storyStart === Number.MAX_SAFE_INTEGER) return "";
  return html.slice(storyStart, actionPlanStart === Number.MAX_SAFE_INTEGER ? html.length : actionPlanStart);
}

export function orderedSectionIds(html: string): readonly string[] {
  return [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/giu)].map((match) => match[1] ?? "");
}
