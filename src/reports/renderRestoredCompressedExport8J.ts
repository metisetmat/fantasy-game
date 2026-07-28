import { renderStoryFirstCompressedExport8I } from "./renderStoryFirstCompressedExport8I";
import { cleanupReplayExportWording8K } from "./cleanupReplayExportWording8K";
import { insertCoachDecisionLayerExport8K } from "./renderCoachDecisionLayerExport8K";
import { insertSeasonlessLearningLoopExport8L } from "./renderSeasonlessLearningLoopExport8L";
import { insertManualPostMatchObservationReviewFormExport8M } from "./renderManualPostMatchObservationReviewFormExport8M";
import { insertManualReviewResultIntakeBoundaryExport8N } from "./renderManualReviewResultIntakeBoundaryExport8N";

export function renderRestoredCompressedExport8J(input: {
  readonly productReportHtml: string;
}): string {
  return insertManualReviewResultIntakeBoundaryExport8N(
    insertManualPostMatchObservationReviewFormExport8M(
      insertSeasonlessLearningLoopExport8L(
        insertCoachDecisionLayerExport8K(cleanupReplayExportWording8K(renderStoryFirstCompressedExport8I(input))),
      ),
    ),
  );
}
