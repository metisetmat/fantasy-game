import type { ShapeState } from "../../models/tactics";
import type { SpatialTeamContext } from "../spatial";
import type { InteractionScoreBreakdown, TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import { TACTICAL_EXPLAINABILITY_MODE } from "../../config/debug";

export function explainabilityLogs(logs: readonly TacticalLogLine[]): readonly TacticalLogLine[] {
  return TACTICAL_EXPLAINABILITY_MODE ? logs : [];
}

export function scaleLine(label: string, value: number): TacticalLogLine {
  return createLogLine(`${label}: ${value} / 100`);
}

export function createBreakdownLogs(input: {
  readonly title: string;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}): readonly TacticalLogLine[] {
  return explainabilityLogs([
    createLogLine(input.title),
    ...input.breakdown.map((item) => createLogLine(`- ${item.label}: ${item.value} / 100`)),
  ]);
}

export function createShapeExplainabilityLogs(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly offensiveShape: ShapeState;
  readonly defensiveShape: ShapeState;
}): readonly TacticalLogLine[] {
  const offensive = input.offensiveTeam;
  const defensive = input.defensiveTeam;

  return explainabilityLogs([
    createLogLine("Shape context explainability:"),
    scaleLine(`${offensive.teamName} width`, input.offensiveShape.widthOccupation),
    createLogLine(`- offensive philosophy ${offensive.offensiveProgressionPhilosophy}`),
    createLogLine(`- collectiveness ${offensive.tacticalInstructions.offensive.collectiveness} / 100`),
    createLogLine(`- verticality ${offensive.tacticalInstructions.offensive.verticality} / 100`),
    createLogLine(`- collective mobility ${offensive.collectiveProperties.collectiveMobility} / 100`),
    createLogLine(`- diagonal support ${input.offensiveShape.diagonalSupport} / 100`),
    scaleLine(`${defensive.teamName} compactness`, input.defensiveShape.compactness),
    createLogLine(`- collective discipline ${defensive.collectiveProperties.tacticalDiscipline} / 100`),
    createLogLine(`- cohesion ${defensive.collectiveProperties.cohesion} / 100`),
    createLogLine(`- defensive transition ${defensive.collectiveProperties.defensiveTransition} / 100`),
    createLogLine(`- structural delay penalty ${defensive.structuralShiftDelay} / 100`),
  ]);
}
