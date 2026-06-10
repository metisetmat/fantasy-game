import { OffensiveMomentumLevel, type OffensiveMomentumBias, type OffensiveMomentumState } from "./types";

export function applyOffensiveMomentumBias(momentum: OffensiveMomentumState): OffensiveMomentumBias {
  switch (momentum.level) {
    case OffensiveMomentumLevel.Low:
      return {
        progression: 0,
        finishing: 0,
        directAttack: 0,
        lateralCirculation: 0,
        recycle: 0,
        reasons: [],
      };
    case OffensiveMomentumLevel.Medium:
      return {
        progression: 3,
        finishing: 3,
        directAttack: 2,
        lateralCirculation: -2,
        recycle: -3,
        reasons: ["attacking rhythm is building"],
      };
    case OffensiveMomentumLevel.High:
      return {
        progression: 6,
        finishing: 6,
        directAttack: 4,
        lateralCirculation: -4,
        recycle: -6,
        reasons: ["offensive momentum pushes conversion"],
      };
    case OffensiveMomentumLevel.Surging:
      return {
        progression: 10,
        finishing: 12,
        directAttack: 8,
        lateralCirculation: -8,
        recycle: -10,
        reasons: ["surging momentum demands a forward action"],
      };
  }
}
