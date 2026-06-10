import { StructuralDistortionLevel, type StructuralDistortionProfile } from "./types";

export function getDistortionProfile(level: StructuralDistortionLevel): StructuralDistortionProfile {
  switch (level) {
    case StructuralDistortionLevel.Critical:
      return {
        compactnessPenalty: 24,
        corridorStretch: 3,
        supportSpacingStretch: 3,
        defensiveLineDamage: 34,
        restDefenseDamage: 30,
        recoveryDelay: 3,
        foldSpeed: 28,
        transitionLag: 2,
      };
    case StructuralDistortionLevel.High:
      return {
        compactnessPenalty: 16,
        corridorStretch: 2,
        supportSpacingStretch: 2,
        defensiveLineDamage: 24,
        restDefenseDamage: 22,
        recoveryDelay: 2,
        foldSpeed: 42,
        transitionLag: 1,
      };
    case StructuralDistortionLevel.Medium:
      return {
        compactnessPenalty: 9,
        corridorStretch: 1,
        supportSpacingStretch: 1,
        defensiveLineDamage: 12,
        restDefenseDamage: 12,
        recoveryDelay: 1,
        foldSpeed: 58,
        transitionLag: 1,
      };
    case StructuralDistortionLevel.Low:
      return {
        compactnessPenalty: 3,
        corridorStretch: 0,
        supportSpacingStretch: 0,
        defensiveLineDamage: 4,
        restDefenseDamage: 4,
        recoveryDelay: 0,
        foldSpeed: 76,
        transitionLag: 0,
      };
  }
}
