import { RecoverySaturationLevel, type RecoverySaturationImpact, type RecoverySaturationState } from "./types";

export function applyRecoverySaturationImpact(
  saturation: RecoverySaturationState,
): RecoverySaturationImpact {
  switch (saturation.level) {
    case RecoverySaturationLevel.Critical:
      return {
        recoveryQualityPenalty: 18,
        compactnessPenalty: 9,
        freeSafetyPenalty: 18,
        lastLineSavePenalty: 22,
        pressingPenalty: 12,
        reasons: ["recovery saturation critical", "last-line coverage is overloaded"],
      };
    case RecoverySaturationLevel.High:
      return {
        recoveryQualityPenalty: 12,
        compactnessPenalty: 6,
        freeSafetyPenalty: 12,
        lastLineSavePenalty: 14,
        pressingPenalty: 8,
        reasons: ["recovery saturation high", "depth protection is carrying repeated load"],
      };
    case RecoverySaturationLevel.Medium:
      return {
        recoveryQualityPenalty: 6,
        compactnessPenalty: 3,
        freeSafetyPenalty: 6,
        lastLineSavePenalty: 7,
        pressingPenalty: 4,
        reasons: ["recovery saturation medium", "emergency coverage is less fresh"],
      };
    case RecoverySaturationLevel.Low:
      return {
        recoveryQualityPenalty: 0,
        compactnessPenalty: 0,
        freeSafetyPenalty: 0,
        lastLineSavePenalty: 0,
        pressingPenalty: 0,
        reasons: ["recovery saturation low"],
      };
  }
}
