import { renderStoryFirstCompressedExport8I } from "./renderStoryFirstCompressedExport8I";
import { cleanupReplayExportWording8K } from "./cleanupReplayExportWording8K";
import { insertCoachDecisionLayerExport8K } from "./renderCoachDecisionLayerExport8K";
import { insertSeasonlessLearningLoopExport8L } from "./renderSeasonlessLearningLoopExport8L";
import { insertManualPostMatchObservationReviewFormExport8M } from "./renderManualPostMatchObservationReviewFormExport8M";

export function renderRestoredCompressedExport8J(input: {
  readonly productReportHtml: string;
}): string {
  return insertManualPostMatchObservationReviewFormExport8M(
    insertSeasonlessLearningLoopExport8L(
      insertCoachDecisionLayerExport8K(cleanupReplayExportWording8K(renderStoryFirstCompressedExport8I(input))),
    ),
  );
}
