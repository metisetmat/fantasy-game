import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import { getOffensiveProgressionPhilosophy } from "./offensivePhilosophy";
import type { OffensiveProgressionPhilosophy } from "../../models/tactics";

export function createOffensivePhilosophyLogs(input: {
  readonly teamName: string;
  readonly tacticalStyle: Parameters<typeof getOffensiveProgressionPhilosophy>[0];
  readonly philosophy?: OffensiveProgressionPhilosophy;
}): readonly TacticalLogLine[] {
  const philosophy = input.philosophy ?? getOffensiveProgressionPhilosophy(input.tacticalStyle);

  return [
    createLogLine(
      `${input.teamName} offensive philosophy: ${philosophy}.`,
    ),
  ];
}
