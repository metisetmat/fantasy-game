export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let cursor = 0;

  while (cursor < haystack.length) {
    const next = haystack.indexOf(needle, cursor);
    if (next === -1) break;
    count += 1;
    cursor = next + needle.length;
  }

  return count;
}

export function sectionIndex(html: string, sectionId: string): number {
  return html.indexOf(`id="${sectionId}"`);
}

export function appearsBefore(html: string, firstSectionId: string, secondSectionId: string): boolean {
  const first = sectionIndex(html, firstSectionId);
  const second = sectionIndex(html, secondSectionId);
  return first >= 0 && second >= 0 && first < second;
}

export function extractSection(html: string, sectionId: string): string {
  const start = new RegExp(`<section\\s+id="${escapeRegExp(sectionId)}"[^>]*>`, "u").exec(html);
  if (start === null || start.index === undefined) return "";

  let depth = 1;
  let cursor = start.index + start[0].length;
  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);
    if (nextClose === -1) return "";
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }
    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(start.index, cursor);
}

export function visibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<details[\s\S]*?<\/details>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function wordCount(text: string): number {
  return text.split(/\s+/u).filter((word) => word.length > 0).length;
}

export function readTimeSecondsFromHtml(html: string): number {
  return Math.max(8, Math.ceil(wordCount(visibleText(html)) / 3.8));
}

export function countClass(html: string, className: string): number {
  const matcher = new RegExp(`class="[^"]*${escapeRegExp(className)}[^"]*"`, "gu");
  return [...html.matchAll(matcher)].length;
}

export function containsForbiddenCoachWording(html: string): boolean {
  const text = visibleText(html)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
  return /score equilibre manuellement|score ajuste|but de compensation|essai de compensation|comeback garanti|equilibre garanti|preuve definitive|verite globale depuis ce run|composition recommandee automatiquement|selection imposee|plan tactique impose|sandbox applique|diagnostic comme verite officielle|batch score comme score officiel/u.test(text);
}
