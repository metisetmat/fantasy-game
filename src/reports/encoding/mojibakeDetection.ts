export interface MojibakeScanResult {
  readonly markerCount: number;
  readonly markers: readonly string[];
}

export const FORBIDDEN_MOJIBAKE_MARKERS: readonly string[] = [
  "\u00c3\u0192",
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
  "\u00c3\u0089",
  "\u00c3\u0080",
  "\u00c2",
  "\u00e2\u20ac",
  "\ufffd",
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
