const MOJIBAKE_MARKERS: readonly string[] = [
  "\u00c3\u0192",
  "\u00c3\u00a2\u00e2\u201a\u00ac",
  "\u00c3\u00a9",
  "\u00c3\u00a8",
  "\u00c3\u00aa",
  "\u00c3\u00ab",
  "\u00c3\u00a0",
  "\u00c3\u00a2",
  "\u00c3\u00ae",
  "\u00c3\u00b4",
  "\u00c3\u00b9",
  "\u00c3\u00bb",
  "\u00c3\u00a7",
  "\u00c3\u2030",
  "\u00c2",
  "\u00e2\u20ac",
  "\ufffd",
];

const COACH_COPY_REPLACEMENTS: readonly [string, string][] = [
  ["A travailler", "\u00c0 travailler"],
  ["recuperations", "r\u00e9cup\u00e9rations"],
  ["recuperation", "r\u00e9cup\u00e9ration"],
  ["securiser", "s\u00e9curiser"],
  ["securise", "s\u00e9curise"],
  ["securisee", "s\u00e9curis\u00e9e"],
  ["premiere", "premi\u00e8re"],
  ["apres", "apr\u00e8s"],
  ["economie globale", "\u00e9conomie globale"],
  ["economie du score", "\u00e9conomie du score"],
  ["G\u00c3\u0192\u00c2\u00a9n\u00c3\u0192\u00c2\u00a9r\u00c3\u0192\u00c2\u00a9", "G\u00e9n\u00e9r\u00e9"],
  ["G\u00c3\u00a9n\u00c3\u00a9r\u00c3\u00a9", "G\u00e9n\u00e9r\u00e9"],
  ["R\u00c3\u0192\u00c2\u00a9sum\u00c3\u0192\u00c2\u00a9", "R\u00e9sum\u00e9"],
  ["R\u00c3\u00a9sum\u00c3\u00a9", "R\u00e9sum\u00e9"],
  ["Moments cl\u00c3\u0192\u00c2\u00a9s", "Moments cl\u00e9s"],
  ["Moments cl\u00c3\u00a9s", "Moments cl\u00e9s"],
  ["s\u00c3\u0192\u00c2\u00a9quences", "s\u00e9quences"],
  ["s\u00c3\u00a9quences", "s\u00e9quences"],
  ["d\u00c3\u0192\u00c2\u00a9cisives", "d\u00e9cisives"],
  ["d\u00c3\u00a9cisives", "d\u00e9cisives"],
  ["\u00c3\u0192\u00c2\u0089quipe", "\u00c9quipe"],
  ["\u00c3\u2030quipe", "\u00c9quipe"],
  ["\u00c3\u0192\u00c2\u00a9v\u00c3\u0192\u00c2\u00a9nement", "\u00e9v\u00e9nement"],
  ["\u00c3\u0192\u00c2\u00a9v\u00c3\u0192\u00c2\u00a9nements", "\u00e9v\u00e9nements"],
  ["\u00c3\u00a9v\u00c3\u00a9nement", "\u00e9v\u00e9nement"],
  ["\u00c3\u00a9v\u00c3\u00a9nements", "\u00e9v\u00e9nements"],
  ["\u00c3\u0192\u00c2\u00a9", "\u00e9"],
  ["\u00c3\u0192\u00c2\u00a8", "\u00e8"],
  ["\u00c3\u0192\u00c2\u00aa", "\u00ea"],
  ["\u00c3\u0192\u00c2\u00ab", "\u00eb"],
  ["\u00c3\u0192\u00c2\u00a0", "\u00e0"],
  ["\u00c3\u0192\u00c2\u00a2", "\u00e2"],
  ["\u00c3\u0192\u00c2\u00ae", "\u00ee"],
  ["\u00c3\u0192\u00c2\u00b4", "\u00f4"],
  ["\u00c3\u0192\u00c2\u00b9", "\u00f9"],
  ["\u00c3\u0192\u00c2\u00bb", "\u00fb"],
  ["\u00c3\u0192\u00c2\u00a7", "\u00e7"],
  ["\u00c3\u0192\u00c2\u0089", "\u00c9"],
  ["\u00c3\u0192\u00c2\u0080", "\u00c0"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ab", "\u00eb"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00ae", "\u00ee"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b9", "\u00f9"],
  ["\u00c3\u00bb", "\u00fb"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u0089", "\u00c9"],
  ["\u00c3\u0080", "\u00c0"],
  ["\u00c2\u00ab", "\u00ab"],
  ["\u00c2\u00bb", "\u00bb"],
  ["\u00c2\u00a0", " "],
  ["\u00c2 ", " "],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00e2\u20ac\u201c", "\u2013"],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u02dc", "\u2018"],
  ["\u00e2\u20ac\u0153", "\u201c"],
  ["\u00e2\u20ac\u009d", "\u201d"],
  ["\u00e2\u20ac\u00a6", "\u2026"],
];

export function normalizeCoachFacingCopy(value: string): string {
  let normalized = value;

  for (const [from, to] of COACH_COPY_REPLACEMENTS) {
    normalized = normalized.replaceAll(from, to);
  }

  return normalized;
}

export function containsMojibake(value: string): boolean {
  return MOJIBAKE_MARKERS.some((marker) => value.includes(marker));
}

export function assertNoMojibake(value: string, context: string): void {
  if (containsMojibake(value)) {
    throw new Error(`${context} contains mojibake.`);
  }
}
