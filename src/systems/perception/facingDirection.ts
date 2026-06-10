export enum FacingDirection {
  North = "NORTH",
  South = "SOUTH",
  East = "EAST",
  West = "WEST",
  NorthEast = "NORTH_EAST",
  NorthWest = "NORTH_WEST",
  SouthEast = "SOUTH_EAST",
  SouthWest = "SOUTH_WEST",
}

export interface FacingVector {
  readonly dx: number;
  readonly dy: number;
}

export function vectorForFacingDirection(direction: FacingDirection): FacingVector {
  switch (direction) {
    case FacingDirection.North:
      return { dx: 0, dy: -1 };
    case FacingDirection.South:
      return { dx: 0, dy: 1 };
    case FacingDirection.East:
      return { dx: 1, dy: 0 };
    case FacingDirection.West:
      return { dx: -1, dy: 0 };
    case FacingDirection.NorthEast:
      return { dx: 0.7, dy: -0.7 };
    case FacingDirection.NorthWest:
      return { dx: -0.7, dy: -0.7 };
    case FacingDirection.SouthEast:
      return { dx: 0.7, dy: 0.7 };
    case FacingDirection.SouthWest:
      return { dx: -0.7, dy: 0.7 };
  }
}

export function facingDirectionFromVector(input: {
  readonly dx: number;
  readonly dy: number;
  readonly fallback: FacingDirection;
}): FacingDirection {
  const horizontal = Math.abs(input.dx) < 0.12 ? "" : input.dx > 0 ? "E" : "W";
  const vertical = Math.abs(input.dy) < 0.12 ? "" : input.dy > 0 ? "S" : "N";
  const combined = `${vertical}${horizontal}`;

  switch (combined) {
    case "N":
      return FacingDirection.North;
    case "S":
      return FacingDirection.South;
    case "E":
      return FacingDirection.East;
    case "W":
      return FacingDirection.West;
    case "NE":
      return FacingDirection.NorthEast;
    case "NW":
      return FacingDirection.NorthWest;
    case "SE":
      return FacingDirection.SouthEast;
    case "SW":
      return FacingDirection.SouthWest;
    default:
      return input.fallback;
  }
}
