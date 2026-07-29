import { renderStoryFirstCompressedExport8I } from "./renderStoryFirstCompressedExport8I";
import { cleanupReplayExportWording8K } from "./cleanupReplayExportWording8K";
import { insertCoachDecisionLayerExport8K } from "./renderCoachDecisionLayerExport8K";
import { insertSeasonlessLearningLoopExport8L } from "./renderSeasonlessLearningLoopExport8L";
import { insertManualPostMatchObservationReviewFormExport8M } from "./renderManualPostMatchObservationReviewFormExport8M";
import { insertManualReviewResultIntakeBoundaryExport8N } from "./renderManualReviewResultIntakeBoundaryExport8N";
import { insertManualReviewPreviewExport8O } from "./renderManualReviewPreviewExport8O";

export function renderRestoredCompressedExport8J(input: {
  readonly productReportHtml: string;
}): string {
  const manualReviewPreviewExport8O = [
    '<section id="manual-review-preview-renderer-export-8o" class="premium-section manual-review-preview-renderer-export-8o" data-manual-review-preview-renderer-version="8O">',
    "<h2>Preview revue manuelle</h2>",
    '<p class="eyebrow">Preview demo non officielle 8O</p>',
    '<ul class="compact-list">',
    "<li><strong>Premiere sortie apres recuperation</strong> - Confirme dans ce payload de preview. Situations: 4; signaux + / -: 3/1. Question: Le meme signal reste-t-il lisible sur une autre situation comparable ?</li>",
    "<li><strong>Continuite apres entree en zone dangereuse</strong> - Inconclusif dans ce payload de preview. Situations: 3; signaux + / -: 1/2. Question: Quelles situations supplementaires faut-il comparer avant de conclure ?</li>",
    "<li><strong>Structure apres action neutralisee</strong> - Echantillon insuffisant dans ce payload de preview. Situations: 1; signaux + / -: 1/0. Question: Combien de situations comparables faut-il collecter avant de relire ce point ?</li>",
    "</ul>",
    "<p>Cette lecture montre seulement comment trois reponses manuelles seraient relues avant stockage ou application.</p>",
    '<p class="guard">Preview de demonstration non officielle. Non persistee, non appliquee, sans mutation score/timeline.</p>',
    "</section>",
  ].join("\n");
  return insertManualReviewPreviewExport8O(
    insertManualReviewResultIntakeBoundaryExport8N(
      insertManualPostMatchObservationReviewFormExport8M(
        insertSeasonlessLearningLoopExport8L(
          insertCoachDecisionLayerExport8K(cleanupReplayExportWording8K(renderStoryFirstCompressedExport8I(input))),
        ),
      ),
    ),
    manualReviewPreviewExport8O,
  );
}
