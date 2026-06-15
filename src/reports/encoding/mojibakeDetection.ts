export interface MojibakeScanResult {
  readonly markerCount: number;
  readonly markers: readonly string[];
}

export const FORBIDDEN_MOJIBAKE_MARKERS: readonly string[] = [
  "Ãƒ",
  "Ã‚",
  "Ã¢â‚¬â„¢",
  "Ã¢â‚¬Å“",
  "Ã¢â‚¬",
  "ÃƒÂ©",
  "ÃƒÂ¨",
  "ÃƒÂª",
  "Ãƒ ",
];

export function findMojibakeMarkers(value: string): readonly string[] {
  return FORBIDDEN_MOJIBAKE_MARKERS.filter((marker) => value.includes(marker));
}

export function countMojibakeMarkers(value: string): number {
  return findMojibakeMarkers(value).length;
}

export function scanForMojibake(value: string): MojibakeScanResult {
  const markers = findMojibakeMarkers(value);

  return {
    markerCount: markers.length,
    markers,
  };
}

export function hasMojibake(value: string): boolean {
  return countMojibakeMarkers(value) > 0;
}
