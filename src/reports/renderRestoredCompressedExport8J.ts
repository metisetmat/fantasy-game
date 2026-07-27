import { renderStoryFirstCompressedExport8I } from "./renderStoryFirstCompressedExport8I";
import { cleanupReplayExportWording8K } from "./cleanupReplayExportWording8K";
import { insertCoachDecisionLayerExport8K } from "./renderCoachDecisionLayerExport8K";
import { insertSeasonlessLearningLoopExport8L } from "./renderSeasonlessLearningLoopExport8L";

export function renderRestoredCompressedExport8J(input: {
  readonly productReportHtml: string;
}): string {
  return insertSeasonlessLearningLoopExport8L(
    insertCoachDecisionLayerExport8K(cleanupReplayExportWording8K(renderStoryFirstCompressedExport8I(input))),
  );
}
