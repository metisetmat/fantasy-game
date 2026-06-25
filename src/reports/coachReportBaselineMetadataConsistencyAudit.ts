import type { CoachActionPlanCardsTrainingFocusPackagingModel } from "./coachActionPlanCardsTrainingFocusPackaging";
import type { CoachInsightDepthNextMatchRecommendationsModel } from "./coachInsightDepthNextMatchRecommendations";
import type { CoachReportPremiumLayoutVisualHierarchyWarningCode } from "./coachReportPremiumLayoutVisualHierarchyWarnings";
import type { ProductBaselineCoachReportReadinessModel } from "./productBaselineCoachReportReadiness";

export interface CoachReportBaselineMetadataConsistencyAudit {
  readonly baseline7AStatusReported: string;
  readonly baseline7AValidationStatus: string;
  readonly baseline7BStatusReported: string;
  readonly baseline7BValidationStatus: string;
  readonly baseline7CStatusReported: string;
  readonly baseline7CValidationStatus: string;
  readonly baselineStatusMismatchCount: number;
  readonly baselineProductReadyMismatchCount: number;
  readonly baselineMetadataCorrected: boolean;
  readonly baselineContradictionExplained: boolean;
  readonly roadmapConsistencyReady: boolean;
  readonly baselineMetadataWarningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: "KEEP_BASELINE_METADATA" | "EXPLAIN_BASELINE_METADATA_CONTRADICTION" | "FIX_BASELINE_METADATA";
}

function validationStatusFromDoc(markdown: string | undefined, fallback: string): string {
  if (markdown === undefined || markdown.length === 0) return fallback;
  const status = /^Status:\s*(PASS|PARTIAL|FAIL)$/mu.exec(markdown)?.[1];
  return status ?? fallback;
}

export function auditCoachReportBaselineMetadataConsistency(input: {
  readonly baseline7A: ProductBaselineCoachReportReadinessModel;
  readonly baseline7B: CoachInsightDepthNextMatchRecommendationsModel;
  readonly baseline7C: CoachActionPlanCardsTrainingFocusPackagingModel;
  readonly validation7AMarkdown?: string;
  readonly validation7BMarkdown?: string;
  readonly validation7CMarkdown?: string;
}): CoachReportBaselineMetadataConsistencyAudit {
  const baseline7AValidationStatus = validationStatusFromDoc(input.validation7AMarkdown, input.baseline7A.status);
  const baseline7BValidationStatus = validationStatusFromDoc(input.validation7BMarkdown, input.baseline7B.status);
  const baseline7CValidationStatus = validationStatusFromDoc(input.validation7CMarkdown, input.baseline7C.status);
  const statusPairs = [
    [input.baseline7A.status, baseline7AValidationStatus],
    [input.baseline7B.status, baseline7BValidationStatus],
    [input.baseline7C.status, baseline7CValidationStatus],
  ] as const;
  const baselineStatusMismatchCount = statusPairs.filter(([reported, validation]) => reported !== validation).length;
  const baselineProductReadyMismatchCount = [
    input.baseline7A.productBaselineReady === (baseline7AValidationStatus === "PASS"),
    input.baseline7B.productBaselineReady === (baseline7BValidationStatus === "PASS"),
    input.baseline7C.productBaselineReady === (baseline7CValidationStatus === "PASS"),
  ].filter((matches) => !matches).length;
  const baselineMetadataCorrected = baseline7AValidationStatus === "PASS" &&
    baseline7BValidationStatus === "PASS" &&
    baseline7CValidationStatus === "PASS" &&
    input.baseline7A.status === "PASS" &&
    input.baseline7B.status === "PASS" &&
    input.baseline7C.status === "PASS" &&
    input.baseline7A.productBaselineReady &&
    input.baseline7B.productBaselineReady &&
    input.baseline7C.productBaselineReady;
  const baselineContradictionExplained = baselineStatusMismatchCount === 0 || baselineProductReadyMismatchCount === 0;
  const roadmapConsistencyReady = baselineMetadataCorrected && baselineContradictionExplained;
  const baselineMetadataWarningCodes: CoachReportPremiumLayoutVisualHierarchyWarningCode[] = [
    ...(roadmapConsistencyReady ? ["BASELINE_METADATA_CONSISTENT" as const, "BASELINE_METADATA_CORRECTED" as const, "ROADMAP_CONSISTENCY_READY" as const] : ["BASELINE_METADATA_INCONSISTENT" as const]),
    ...(!baselineContradictionExplained ? ["BASELINE_METADATA_CONTRADICTION_UNRESOLVED" as const] : []),
  ];

  return {
    baseline7AStatusReported: input.baseline7A.status,
    baseline7AValidationStatus,
    baseline7BStatusReported: input.baseline7B.status,
    baseline7BValidationStatus,
    baseline7CStatusReported: input.baseline7C.status,
    baseline7CValidationStatus,
    baselineStatusMismatchCount,
    baselineProductReadyMismatchCount,
    baselineMetadataCorrected,
    baselineContradictionExplained,
    roadmapConsistencyReady,
    baselineMetadataWarningCodes,
    recommendation: roadmapConsistencyReady
      ? "KEEP_BASELINE_METADATA"
      : baselineContradictionExplained
        ? "EXPLAIN_BASELINE_METADATA_CONTRADICTION"
        : "FIX_BASELINE_METADATA",
  };
}
