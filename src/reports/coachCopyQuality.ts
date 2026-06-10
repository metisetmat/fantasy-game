const MOJIBAKE_MARKERS: readonly string[] = [
  "Ãƒ",
  "Ã‚",
  "Ã¢â‚¬â„¢",
  "Ã¢â‚¬Å“",
  "Ã¢â‚¬",
  "ÃƒÂ©",
  "ÃƒÂ¨",
  "ÃƒÂª",
  "Ãƒ ",
  "ÃƒÂ¹",
  "ÃƒÂ§",
  "ÃƒÆ’",
  "Â©",
  "Â¨",
  "Âª",
  "Â ",
  "â€™",
  "â€œ",
  "â€",
];

const COACH_COPY_REPLACEMENTS: readonly [string, string][] = [
  ["GÃƒÂ©nÃƒÂ©rÃƒÂ©", "Généré"],
  ["GÃ©nÃ©rÃ©", "Généré"],
  ["RÃƒÂ©sumÃƒÂ©", "Résumé"],
  ["RÃ©sumÃ©", "Résumé"],
  ["Moments clÃƒÂ©s", "Moments clés"],
  ["Moments clÃ©s", "Moments clés"],
  ["sÃƒÆ’Ã‚Â©quences", "séquences"],
  ["sÃƒÂ©quences", "séquences"],
  ["sÃ©quences", "séquences"],
  ["dÃƒÆ’Ã‚Â©cisives", "décisives"],
  ["dÃƒÂ©cisives", "décisives"],
  ["dÃ©cisives", "décisives"],
  ["Ãƒâ€°quipe", "Équipe"],
  ["ÃƒÂ‰quipe", "Équipe"],
  ["Ã‰quipe", "Équipe"],
  ["ÃƒÂ©vÃƒÂ©nement", "événement"],
  ["ÃƒÂ©vÃƒÂ©nements", "événements"],
  ["Ã©vÃ©nement", "événement"],
  ["Ã©vÃ©nements", "événements"],
  ["ÃƒÂ©", "é"],
  ["ÃƒÂ¨", "è"],
  ["ÃƒÂª", "ê"],
  ["ÃƒÂ«", "ë"],
  ["ÃƒÂ ", "à"],
  ["ÃƒÂ¢", "â"],
  ["ÃƒÂ¹", "ù"],
  ["ÃƒÂ»", "û"],
  ["ÃƒÂ§", "ç"],
  ["ÃƒÂ‰", "É"],
  ["Ãƒâ‚¬", "À"],
  ["Ã©", "é"],
  ["Ã¨", "è"],
  ["Ãª", "ê"],
  ["Ã«", "ë"],
  ["Ã ", "à"],
  ["Ã¢", "â"],
  ["Ã¹", "ù"],
  ["Ã»", "û"],
  ["Ã§", "ç"],
  ["Ã‰", "É"],
  ["Ã¢â‚¬â„¢", "’"],
  ["Ã¢â‚¬Å“", "“"],
  ["Ã¢â‚¬Â", "”"],
  ["â€™", "’"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["Â«", "«"],
  ["Â»", "»"],
  ["Â ", " "],
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
