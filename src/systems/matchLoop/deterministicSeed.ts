export interface DeterministicSeedState {
  readonly initialSeed: number;
  readonly currentSeed: number;
}

export interface DeterministicRoll {
  readonly value: number;
  readonly seed: DeterministicSeedState;
}

const MODULUS = 2_147_483_647;
const MULTIPLIER = 48_271;

function normalizeSeed(seed: number): number {
  const normalized = Math.abs(Math.trunc(seed)) % MODULUS;

  return normalized === 0 ? 1 : normalized;
}

export function createDeterministicSeed(seed: number): DeterministicSeedState {
  const normalized = normalizeSeed(seed);

  return {
    initialSeed: normalized,
    currentSeed: normalized,
  };
}

export function nextDeterministicRoll(seed: DeterministicSeedState): DeterministicRoll {
  const nextSeed = (seed.currentSeed * MULTIPLIER) % MODULUS;

  return {
    value: nextSeed / MODULUS,
    seed: {
      initialSeed: seed.initialSeed,
      currentSeed: nextSeed,
    },
  };
}

export function seededRandom(seed: DeterministicSeedState): DeterministicRoll {
  return nextDeterministicRoll(seed);
}

export interface WeightedPickOption<T> {
  readonly item: T;
  readonly weight: number;
}

export interface WeightedPickResult<T> {
  readonly item: T;
  readonly seed: DeterministicSeedState;
  readonly roll: number;
}

export function pickWeighted<T>(
  options: readonly WeightedPickOption<T>[],
  seed: DeterministicSeedState,
): WeightedPickResult<T> {
  if (options.length === 0) {
    throw new Error("Cannot pick from an empty weighted option list.");
  }

  const roll = seededRandom(seed);
  const totalWeight = options.reduce((sum, option) => sum + Math.max(0, option.weight), 0);

  if (totalWeight <= 0) {
    const first = options[0];
    if (first === undefined) {
      throw new Error("Cannot pick from an empty weighted option list.");
    }

    return {
      item: first.item,
      seed: roll.seed,
      roll: roll.value,
    };
  }

  const target = roll.value * totalWeight;
  let running = 0;

  for (const option of options) {
    running += Math.max(0, option.weight);
    if (target <= running) {
      return {
        item: option.item,
        seed: roll.seed,
        roll: roll.value,
      };
    }
  }

  const fallback = options[options.length - 1];
  if (fallback === undefined) {
    throw new Error("Cannot pick from an empty weighted option list.");
  }

  return {
    item: fallback.item,
    seed: roll.seed,
    roll: roll.value,
  };
}

export interface ChanceRollResult {
  readonly success: boolean;
  readonly seed: DeterministicSeedState;
  readonly roll: number;
}

export function rollChance(probability: number, seed: DeterministicSeedState): ChanceRollResult {
  const roll = seededRandom(seed);
  const clampedProbability = Math.max(0, Math.min(1, probability));

  return {
    success: roll.value <= clampedProbability,
    seed: roll.seed,
    roll: roll.value,
  };
}
