export type Rating = number;
export type Intensity = number;
export type TacticalTick = number;

export enum QualitativeLevel {
  VeryLow = "very_low",
  Low = "low",
  MediumLow = "medium_low",
  Medium = "medium",
  MediumHigh = "medium_high",
  High = "high",
  VeryHigh = "very_high",
}

export interface Range {
  readonly min: number;
  readonly max: number;
}

export const RATING_SCALE: Range = {
  min: 0,
  max: 100,
};

export const NORMALIZED_SCALE: Range = {
  min: 0,
  max: 1,
};
