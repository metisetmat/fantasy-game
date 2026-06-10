import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";

export type MiniMatchWorkbenchAlignmentReport = {
  readonly fixtureId: string;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly supportedTruths: readonly string[];
  readonly missingTruths: readonly string[];
  readonly lossyMappings: readonly string[];
  readonly recommendations: readonly string[];
};

export function analyzeMiniMatchWorkbenchAlignment(frame: TacticalWorkbenchFrame): MiniMatchWorkbenchAlignmentReport {
  const supportedTruths = [
    `can represent selected action type ${frame.selectedAction.actionType}`,
    `can represent from-zone ${frame.selectedAction.fromZone}`,
    `can represent target cluster ${frame.selectedAction.targetZone}`,
    `can represent reception zone ${frame.selectedAction.actualReceptionZone ?? "unknown"}`,
    "can preserve selected candidate versus ranked alternatives in report artifacts",
  ];
  const missingTruths = [
    "official MatchInput roster players are not yet converted into mini-match SpatialTeamContext players",
    "workbench before/after team shapes are not replayed as the source of mini-match state",
    "visual role occupation and rendered-zone offset semantics are not consumed by runMiniMatch",
    "full ranked option table is not a first-class mini-match decision input",
  ];
  const lossyMappings = [
    "CONTROL TH / ML identities map to prototype role players rather than official roster snapshots",
    "target cluster Z3-C and actual reception Z3-HSL can be reported, but are not yet grounded from workbench truth",
    "team shape intents become general tactical context rather than exact before/after spatial state",
  ];

  return {
    fixtureId: frame.frameId,
    status: missingTruths.length === 0 && lossyMappings.length === 0 ? "PASS" : "PARTIAL",
    supportedTruths,
    missingTruths,
    lossyMappings,
    recommendations: [
      "CONFIRM_MINIMATCH_ALIGNMENT_PARTIAL",
      "PREPARE_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "PREPARE_WORKBENCH_REPLAY_ENGINE",
    ],
  };
}
