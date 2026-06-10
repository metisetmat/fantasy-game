import type { Rating } from "../../../core/ratings";

export enum AttributeRangeBand {
  Catastrophic = "CATASTROPHIC",
  Weak = "WEAK",
  Average = "AVERAGE",
  Strong = "STRONG",
  Elite = "ELITE",
  WorldClass = "WORLD_CLASS",
  Generational = "GENERATIONAL",
}

export function classifyAttributeRange(value: Rating): AttributeRangeBand {
  if (value < 20) {
    return AttributeRangeBand.Catastrophic;
  }
  if (value < 40) {
    return AttributeRangeBand.Weak;
  }
  if (value < 60) {
    return AttributeRangeBand.Average;
  }
  if (value < 75) {
    return AttributeRangeBand.Strong;
  }
  if (value < 90) {
    return AttributeRangeBand.Elite;
  }
  if (value < 98) {
    return AttributeRangeBand.WorldClass;
  }

  return AttributeRangeBand.Generational;
}
