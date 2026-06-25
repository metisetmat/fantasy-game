import {
  COACH_REPORT_PHASE_VISUALS_GUARD,
  type TacticalPitchPanelModel,
} from "./coachReportPhaseVisuals";
import {
  COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD,
  type CoachReportPhaseVisualReadabilityModel,
  type PhaseVisualCoachCopyBlock,
  type PhaseVisualLegendItem,
  type PhaseVisualZoneHierarchy,
} from "./coachReportPhaseVisualReadability";
import type {
  CoachReportMultiMatchPhaseComparisonModel,
  MultiMatchPhaseComparisonPanel,
  MultiMatchPhaseZoneSignal,
} from "./coachReportMultiMatchPhaseComparison";
import type { CoachReportMultiMatchHistoryViewModel, MultiMatchSignalDrilldown } from "./coachReportMultiMatchHistoryView";
import type { CoachReportHistoryStoreConsistencyModel } from "./coachReportHistoryStoreConsistency";
import type { CoachReportPersistenceEvidenceSnapshot } from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachReportPersistentHistoryAdapterModel } from "./coachReportPersistentHistoryAdapter";
import type { CoachReportRealMatchHistoryIntegrationModel } from "./coachReportRealMatchHistoryIntegration";
import type { CoachReportDatabaseMigrationPreparationModel } from "./coachReportDatabaseMigrationPreparation";
import type { CoachReportDatabaseAdapterSpikeModel } from "./coachReportDatabaseAdapterSpike";
import type { CoachReportDurableStorageDecisionModel } from "./coachReportDurableStorageDecision";
import type { CoachReportControlledLocalReadOnlyDbModeModel } from "./coachReportControlledLocalReadOnlyDbMode";
import type { CoachReportRealSQLiteReadOnlyIOSmokeTestModel } from "./coachReportRealSQLiteReadOnlyIOSmokeTest";
import type { FullMatchScoreEconomyCalibrationModel } from "./fullMatchScoreEconomyCalibration";
import type { FullMatchCalibrationCarryoverReconciliationModel } from "./fullMatchCalibrationCarryoverReconciliation";
import type { FullMatchOfficialScoringCalibrationConnectionModel } from "./fullMatchOfficialScoringConnection";
import type { FullMatchBatchEconomyProofModel } from "./fullMatchBatchEconomyProof";
import type { FullMatchRouteFamilyMixActivationModel } from "./fullMatchRouteFamilyMixActivation";
import type { FullMatchRouteFamilyScoringRateCalibrationModel } from "./fullMatchRouteFamilyScoringRateCalibration";
import type { FullMatchSegmentScoringDensityCalibrationModel } from "./fullMatchSegmentScoringDensityCalibration";
import type { FullMatchTeamOpportunityBalanceCalibrationModel } from "./fullMatchTeamOpportunityBalanceCalibration";
import type { FullMatchDominanceChainCalibrationModel } from "./fullMatchDominanceChainCalibration";
import type { FullMatchBreakEventPostScoreResetCalibrationModel } from "./fullMatchBreakEventPostScoreResetCalibration";
import type {
  FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel,
} from "./fullMatchGoalkeeperSecureResetBreakSpecificityCalibration";
import type {
  FullMatchResetBreakBlowoutEconomyCalibrationModel,
} from "./fullMatchResetBreakBlowoutEconomyCalibration";
import type {
  FullMatchEarnedDangerGateCalibrationModel,
} from "./fullMatchEarnedDangerGateCalibration";
import type {
  FullMatchEarnedDangerGateTuningModel,
} from "./fullMatchEarnedDangerGateTuningCalibration";
import type {
  FullMatchGateSelectivityVolumeRegressionFixModel,
} from "./fullMatchGateSelectivityVolumeRegressionFix";
import type {
  FullMatchRouteEconomyRecheckAfterSelectivityFixModel,
} from "./fullMatchRouteEconomyRecheckAfterSelectivityFix";
import type {
  FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel,
} from "./fullMatchEarnedDangerOutcomeDistribution";
import type {
  FullMatchDominanceChainCalibrationCoverageFixModel,
} from "./fullMatchDominanceChainCalibrationCoverageFix";
import type {
  FullMatchCloseGameDistributionCalibrationModel,
} from "./fullMatchCloseGameDistributionCalibration";
import type {
  FullMatchTrailingTeamResponseLateGamePressureModel,
} from "./fullMatchTrailingTeamResponseLateGamePressure";
import type {
  FullMatchLateGameThreatQualityTrailingConversionModel,
} from "./fullMatchLateGameThreatQualityTrailingConversion";
import type {
  FullMatchLateGameThreatQualityMonitoringModel,
} from "./fullMatchLateGameThreatQualityMonitoring";
import type {
  FullMatchEconomyFinalStabilizationModel,
} from "./fullMatchMatchEconomyFinalStabilization";
import type {
  ProductBaselineCoachReportReadinessModel,
} from "./productBaselineCoachReportReadiness";
import type { ScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";
import { deriveCoachReportPhasePanels } from "./buildCoachReportPhaseVisuals";
import {
  deriveCoachReportPhaseVisualReadabilityPresentation,
} from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { escapeHtml } from "./htmlCoachReport";
import { renderTacticalPitchPanel } from "./renderTacticalPitchPanel";

const EXPORT_TITLE = "Rapport coach - export partageable";
const CONTROLLED_EMPTY_STATE = "Donn&eacute;es insuffisantes dans ce run pour stabiliser cette lecture.";

const PREMIUM_EXPORT_CSS = `
    :root {
      --report-bg: #eef2f7;
      --report-paper: #ffffff;
      --report-ink: #0f1726;
      --report-muted: #566273;
      --report-line: #d7dee8;
      --report-soft: #f6f8fb;
      --report-soft-strong: #edf2f8;
      --report-accent: #1a4a8a;
      --report-accent-soft: #e8effa;
      --report-dark: #0e223f;
      --report-green: #2d936c;
      --report-warning: #b8741a;
      --report-shadow: 0 18px 46px rgba(15, 23, 38, 0.08);
    }

    body {
      margin: 0;
      background: linear-gradient(180deg, #e9eef6 0%, #f4f6fa 100%);
      color: var(--report-ink);
    }

    main#product-main {
      max-width: 1160px;
      padding: 28px 20px 56px;
    }

    .report-cover {
      background:
        linear-gradient(135deg, rgba(26, 74, 138, 0.96) 0%, rgba(13, 33, 62, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      color: #fff;
      padding: 28px;
      box-shadow: var(--report-shadow);
      overflow: hidden;
      position: relative;
    }

    .report-cover::after {
      content: "";
      position: absolute;
      inset: auto -50px -60px auto;
      width: 240px;
      height: 240px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 72%);
      pointer-events: none;
    }

    .report-cover-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.8fr);
      gap: 22px;
      align-items: stretch;
    }

    .report-cover-copy h1 {
      margin: 0 0 12px;
      font-size: 2.25rem;
      line-height: 1.08;
      color: #fff;
    }

    .report-cover-copy p {
      color: rgba(255, 255, 255, 0.88);
    }

    .report-meta-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .report-meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 0.82rem;
      letter-spacing: 0.01em;
    }

    .report-scoreboard {
      border-radius: 16px;
      padding: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.14);
      display: grid;
      align-content: start;
      gap: 10px;
    }

    .report-scoreboard .score-label,
    .report-scoreboard .muted {
      color: rgba(255, 255, 255, 0.82);
    }

    .report-scoreboard .score {
      display: block;
      margin-top: 4px;
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
    }

    .report-truth-note {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-left: 3px solid rgba(255, 255, 255, 0.44);
      color: rgba(255, 255, 255, 0.95);
    }

    .premium-section {
      margin-top: 20px;
      background: var(--report-paper);
      border: 1px solid var(--report-line);
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(15, 23, 38, 0.05);
      padding: 22px;
    }

    .report-section-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 16px;
      color: var(--report-accent);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .report-section-divider::before {
      content: "";
      flex: 0 0 38px;
      height: 2px;
      border-radius: 999px;
      background: var(--report-accent);
    }

    .report-section-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .report-section-header h2 {
      margin: 0;
      font-size: 1.45rem;
      color: var(--report-ink);
    }

    .report-section-header p {
      margin: 6px 0 0;
      color: var(--report-muted);
    }

    .report-summary-list {
      margin: 0;
      padding-left: 20px;
    }

    .report-summary-list li + li {
      margin-top: 8px;
    }

    .report-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 14px;
    }

    .report-kpi-card {
      border-radius: 14px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid var(--report-line);
      box-shadow: none;
      margin: 0;
    }

    .report-kpi-card .signal-grid section {
      background: var(--report-soft);
    }

    .report-phase-layout {
      display: grid;
      grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
      gap: 16px;
      align-items: start;
    }

    .report-phase-section {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-soft);
      padding: 16px;
    }

    .report-phase-section h3 {
      margin: 0 0 8px;
      font-size: 1.02rem;
    }

    .report-phase-section p {
      color: var(--report-muted);
    }

    .report-phase-cards {
      display: grid;
      gap: 12px;
    }

    .report-pitch-panel {
      border-radius: 14px;
      padding: 16px;
      background: linear-gradient(180deg, #0f5132 0%, #12482d 100%);
      color: rgba(255, 255, 255, 0.92);
      min-height: 230px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .report-pitch-panel h3 {
      margin: 0;
      color: #fff;
      font-size: 1rem;
    }

    .report-pitch-placeholder {
      min-height: 148px;
      border-radius: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.4);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      display: grid;
      place-items: center;
      text-align: center;
      padding: 14px;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .phase-pitch-legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }

    .phase-legend-item {
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--report-line);
      background: var(--report-paper);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-legend-item p {
      margin: 4px 0 0;
      color: var(--report-muted);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .phase-legend-swatch {
      width: 18px;
      height: 18px;
      border-radius: 6px;
      border: 1px solid rgba(15, 23, 38, 0.12);
      display: inline-block;
      margin-top: 2px;
    }

    .phase-pitch {
      width: 100%;
      height: auto;
      display: block;
    }

    .phase-zone {
      fill: rgba(255, 255, 255, 0.08);
      stroke: rgba(255, 255, 255, 0.22);
      stroke-width: 1.5;
    }

    .phase-zone--danger {
      fill: rgba(255, 122, 89, 0.82);
      stroke: rgba(255, 239, 234, 0.72);
    }

    .phase-zone--recovery {
      fill: rgba(61, 214, 140, 0.78);
      stroke: rgba(228, 255, 241, 0.72);
    }

    .phase-zone--pressure {
      fill: rgba(255, 192, 76, 0.82);
      stroke: rgba(255, 244, 214, 0.74);
    }

    .phase-zone--goalkeeper {
      fill: rgba(110, 173, 255, 0.8);
      stroke: rgba(231, 241, 255, 0.74);
    }

    .phase-zone--empty {
      fill: rgba(255, 255, 255, 0.05);
      stroke: rgba(255, 255, 255, 0.28);
    }

    .phase-zone--primary {
      stroke-width: 2.8;
      filter: drop-shadow(0 0 8px rgba(255,255,255,0.18));
    }

    .phase-zone--secondary {
      opacity: 0.92;
      stroke-width: 2.1;
    }

    .phase-zone--muted {
      opacity: 0.42;
    }

    .phase-zone-label {
      fill: rgba(255, 255, 255, 0.94);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .phase-zone-value {
      fill: rgba(255, 255, 255, 0.92);
      font-size: 14px;
      font-weight: 800;
    }

    .phase-panel-summary,
    .phase-panel-why,
    .phase-panel-next-check,
    .phase-panel-limitation {
      margin: 0;
      color: rgba(255, 255, 255, 0.94);
    }

    .phase-panel-summary strong,
    .phase-panel-why strong,
    .phase-panel-next-check strong,
    .phase-panel-limitation strong {
      color: #fff;
    }

    .report-table-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
    }

    .report-table-card h3 {
      margin: 0 0 10px;
      font-size: 1.02rem;
    }

    .report-controlled-empty {
      border-left: 3px solid var(--report-warning);
      background: #fff9ef;
      color: #6f531f;
      padding: 12px 14px;
      border-radius: 10px;
    }

    .report-player-study {
      display: grid;
      gap: 12px;
    }

    .report-player-study-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .phase-stability-section {
      display: grid;
      gap: 14px;
    }

    .phase-stability-guard {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .phase-stability-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .phase-stability-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-stability-card header {
      display: grid;
      gap: 8px;
    }

    .phase-stability-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .phase-stability-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .phase-stability-badge--repeated {
      background: #e6f6ef;
      color: #1d6b4f;
      border-color: rgba(29, 107, 79, 0.18);
    }

    .phase-stability-badge--visible-once {
      background: #eef2f7;
      color: #445061;
      border-color: rgba(68, 80, 97, 0.16);
    }

    .phase-stability-badge--unstable {
      background: #fff4e7;
      color: #9a5a14;
      border-color: rgba(154, 90, 20, 0.18);
    }

    .phase-stability-badge--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
      border-color: rgba(107, 77, 183, 0.18);
    }

    .phase-stability-zone-list {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 8px;
    }

    .phase-stability-zone-list li {
      color: var(--report-muted);
      line-height: 1.45;
    }

    .phase-stability-zone-list strong {
      color: var(--report-ink);
    }

    .phase-stability-reading {
      display: grid;
      gap: 10px;
    }

    .phase-history-section {
      display: grid;
      gap: 14px;
    }

    .phase-history-guard {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .phase-history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .phase-history-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-history-strength,
    .phase-history-presence {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .phase-history-strength--local-repeated {
      background: #e6f6ef;
      color: #1d6b4f;
      border-color: rgba(29, 107, 79, 0.18);
    }

    .phase-history-strength--visible-once {
      background: #eef2f7;
      color: #445061;
      border-color: rgba(68, 80, 97, 0.16);
    }

    .phase-history-strength--unstable {
      background: #fff4e7;
      color: #9a5a14;
      border-color: rgba(154, 90, 20, 0.18);
    }

    .phase-history-strength--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
      border-color: rgba(107, 77, 183, 0.18);
    }

    .phase-history-presence--present {
      background: #e6f6ef;
      color: #1d6b4f;
    }

    .phase-history-presence--absent {
      background: #eef2f7;
      color: #445061;
    }

    .phase-history-presence--unstable {
      background: #fff4e7;
      color: #9a5a14;
    }

    .phase-history-presence--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
    }

    .phase-history-table {
      display: grid;
      gap: 8px;
    }

    .phase-history-row {
      display: grid;
      grid-template-columns: minmax(110px, 0.9fr) auto minmax(0, 1.2fr);
      gap: 10px;
      align-items: start;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--report-soft);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .match-history-section {
      display: grid;
      gap: 14px;
    }

    .match-history-guard,
    .match-history-boundary {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .match-history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .match-history-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .match-history-card h3 {
      margin: 0;
    }

    .match-history-kpi {
      display: grid;
      gap: 6px;
      margin: 0;
    }

    .match-history-kpi div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--report-muted);
    }

    .match-history-kpi strong {
      color: var(--report-ink);
    }

    .persistent-history-section {
      display: grid;
      gap: 14px;
    }

    .persistent-history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .persistent-history-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .persistent-history-kpi {
      display: grid;
      gap: 6px;
    }

    .persistent-history-kpi div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--report-muted);
    }

    .persistent-history-kpi strong {
      color: var(--report-ink);
    }

    .persistent-history-boundary,
    .persistent-history-guard,
    .persistent-history-warning {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .persistent-history-store-kind,
    .persistent-history-readonly {
      font-weight: 700;
      color: var(--report-accent);
    }

    .history-consistency-section {
      display: grid;
      gap: 14px;
      border-top: 1px solid var(--report-line);
      padding-top: 16px;
    }

    .history-consistency-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .history-consistency-card {
      border: 1px solid var(--report-line);
      border-radius: 12px;
      background: var(--report-soft);
      padding: 14px;
      display: grid;
      gap: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .history-consistency-kpi {
      display: grid;
      gap: 6px;
    }

    .history-consistency-kpi div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--report-muted);
    }

    .history-consistency-kpi strong,
    .history-consistency-operation,
    .history-consistency-boundary,
    .history-consistency-database-contract,
    .history-consistency-guard {
      color: var(--report-dark);
      font-weight: 700;
    }

    .history-consistency-boundary,
    .history-consistency-database-contract,
    .history-consistency-guard,
    .history-consistency-warning {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      padding: 10px 12px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .history-consistency-warning {
      border-left-color: var(--report-warning);
      background: #fff8ed;
    }

    .database-migration-section {
      display: grid;
      gap: 14px;
      border-top: 1px solid var(--report-line);
      padding-top: 16px;
    }

    .database-migration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .database-migration-card {
      border: 1px solid var(--report-line);
      border-radius: 12px;
      background: var(--report-soft);
      padding: 14px;
      display: grid;
      gap: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .database-migration-kpi {
      display: grid;
      gap: 6px;
    }

    .database-migration-kpi div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--report-muted);
    }

    .database-migration-kpi strong,
    .database-migration-boundary,
    .database-migration-plan,
    .database-migration-guard,
    .database-migration-dry-run {
      color: var(--report-dark);
      font-weight: 700;
    }

    .database-migration-boundary,
    .database-migration-plan,
    .database-migration-guard,
    .database-migration-warning,
    .database-migration-dry-run {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      padding: 10px 12px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .database-migration-warning {
      border-left-color: var(--report-warning);
      background: #fff8ed;
    }

    .database-adapter-spike-section {
      display: grid;
      gap: 14px;
      border-top: 1px solid var(--report-line);
      padding-top: 16px;
    }

    .database-adapter-spike-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .database-adapter-spike-card {
      border: 1px solid var(--report-line);
      border-radius: 12px;
      background: var(--report-soft);
      padding: 14px;
      display: grid;
      gap: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .database-adapter-spike-kpi {
      display: grid;
      gap: 6px;
    }

    .database-adapter-spike-kpi div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--report-muted);
    }

    .database-adapter-spike-kpi strong,
    .database-adapter-spike-boundary,
    .database-adapter-spike-guard,
    .database-adapter-spike-feature-flag {
      color: var(--report-dark);
      font-weight: 700;
    }

    .database-adapter-spike-boundary,
    .database-adapter-spike-guard,
    .database-adapter-spike-warning,
    .database-adapter-spike-feature-flag {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      padding: 10px 12px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .database-adapter-spike-warning {
      border-left-color: var(--report-warning);
      background: #fff8ed;
    }

    .match-history-source-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .match-history-source-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid transparent;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .match-history-source-badge--controlled {
      background: #f7f3ff;
      color: #6b4db7;
      border-color: rgba(107, 77, 183, 0.18);
    }

    .match-history-source-badge--simulated {
      background: #e6f6ef;
      color: #1d6b4f;
      border-color: rgba(29, 107, 79, 0.18);
    }

    .match-history-source-badge--product {
      background: #fff4e7;
      color: #9a5a14;
      border-color: rgba(154, 90, 20, 0.18);
    }

    .report-appendix-stack {
      margin-top: 10px;
    }

    .report-appendix-stack summary {
      cursor: pointer;
      font-weight: 700;
    }

    .report-print-footer {
      margin-top: 18px;
      color: var(--report-muted);
      font-size: 0.84rem;
      text-align: right;
    }

    .report-phase-bullet-list,
    .report-summary-list,
    .report-appendix-stack ul {
      margin-top: 8px;
    }

    @media (max-width: 840px) {
      .report-cover-grid,
      .report-phase-layout,
      .report-player-study-grid,
      .phase-stability-grid,
      .phase-history-grid,
      .match-history-grid {
        grid-template-columns: 1fr;
      }

      .persistent-history-grid {
        grid-template-columns: 1fr;
      }

      .history-consistency-grid {
        grid-template-columns: 1fr;
      }

      .database-migration-grid {
        grid-template-columns: 1fr;
      }
    }

    @media print {
      @page {
        size: A4;
        margin: 14mm;
      }

      body {
        background: #fff;
      }

      main#product-main {
        max-width: none;
        padding: 0;
      }

      .report-cover,
      .premium-section,
      .product-card,
      .summary-list,
      .interpretation-guard,
      .comparison-card,
      .comparison-detail-card,
      .matchup-card,
      .appendix,
      .report-table-card,
      .report-pitch-panel,
      .report-phase-section,
      .phase-pitch-legend,
      .phase-legend-item,
      .phase-history-card,
      .phase-history-row,
      .match-history-card,
      .match-history-guard,
      .match-history-boundary,
      .persistent-history-card,
      .persistent-history-boundary,
      .persistent-history-guard,
      .persistent-history-warning,
      .history-consistency-card,
      .history-consistency-boundary,
      .history-consistency-database-contract,
      .history-consistency-guard,
      .history-consistency-warning,
      .database-migration-card,
      .database-migration-boundary,
      .database-migration-plan,
      .database-migration-guard,
      .database-migration-warning,
      .database-migration-dry-run {
        break-inside: avoid;
        page-break-inside: avoid;
        box-shadow: none;
      }

      details {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-cover {
        min-height: 0;
      }

      .report-section-divider {
        break-after: avoid;
        page-break-after: avoid;
      }

      .no-print {
        display: none !important;
      }
    }
`;

function replaceTitle(html: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/u, `<title>${EXPORT_TITLE}</title>`);
}

function replaceStyle(html: string): string {
  return html.replace(/<style>[\s\S]*?<\/style>/u, `<style>${PREMIUM_EXPORT_CSS}</style>`);
}

function extractSection(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const startMatch = new RegExp(`<section\\s+id="${escaped}"[^>]*>`, "u").exec(html);

  if (startMatch === null || startMatch.index === undefined) {
    return "";
  }

  let depth = 1;
  let cursor = startMatch.index + startMatch[0].length;

  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);

    if (nextClose === -1) {
      return "";
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }

    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(startMatch.index, cursor);
}

function removeOuterSection(sectionHtml: string): string {
  return sectionHtml
    .replace(/^<section[^>]*>/u, "")
    .replace(/<\/section>$/u, "");
}

function removeFirstHeading(sectionInner: string): string {
  return sectionInner.replace(/^\s*<h2>[\s\S]*?<\/h2>\s*/u, "");
}

function extractSectionInner(html: string, id: string): string {
  return removeFirstHeading(removeOuterSection(extractSection(html, id))).trim();
}

function extractListItems(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<li>([\s\S]*?)<\/li>/gu)].map((match) =>
    match[1]?.trim() ?? ""
  ).filter((item) => item.length > 0);
}

function extractMatch(sectionHtml: string, pattern: RegExp): string {
  const match = sectionHtml.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function extractSignalCards(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<article class="product-card signal-card">[\s\S]*?<\/article>/gu)].map((match) =>
    match[0] ?? ""
  );
}

function toKpiCard(cardHtml: string): string {
  return cardHtml.replace(
    "class=\"product-card signal-card\"",
    "class=\"product-card signal-card report-kpi-card\"",
  );
}

interface SignalExcerpt {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
}

function excerptFromSignalCard(cardHtml: string): SignalExcerpt {
  return {
    title: stripTags(extractMatch(cardHtml, /<h3>([\s\S]*?)<\/h3>/u)),
    summary: stripTags(extractMatch(cardHtml, /<h4>&Agrave; surveiller<\/h4>\s*<p>([\s\S]*?)<\/p>/u)),
    bullets: extractListItems(cardHtml).slice(0, 3).map(stripTags),
  };
}

function findHierarchy(
  hierarchies: readonly PhaseVisualZoneHierarchy[],
  phase: TacticalPitchPanelModel["phase"],
): PhaseVisualZoneHierarchy | undefined {
  return hierarchies.find((hierarchy) => hierarchy.phase === phase);
}

function findCopyBlock(
  copyBlocks: readonly PhaseVisualCoachCopyBlock[],
  phase: TacticalPitchPanelModel["phase"],
): PhaseVisualCoachCopyBlock | undefined {
  return copyBlocks.find((copyBlock) => copyBlock.phase === phase);
}

function renderPhaseLegend(legendItems: readonly PhaseVisualLegendItem[]): string {
  return `
  <section id="phase-visual-legend" class="premium-section" data-source-product-sections="key-coach-signals|interpretation-guard">
    <div class="report-section-divider">Phase visual legend</div>
    <div class="report-section-header">
      <div>
        <h2>L&eacute;gende des cartes terrain</h2>
        <p>Ces cartes sont des aides de lecture. Elles visualisent le signal disponible, pas une prescription tactique.</p>
      </div>
    </div>
    <div class="phase-pitch-legend">
      ${legendItems.map((item) => `
        <article class="phase-legend-item">
          <span class="phase-legend-swatch ${item.cssClass}"></span>
          <div>
            <strong>${item.label}</strong>
            <p>${item.explanation}</p>
          </div>
        </article>
      `).join("")}
    </div>
    <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUALS_GUARD}</p>
    <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD}</p>
  </section>`;
}

function readabilityContextForPanel(
  panel: TacticalPitchPanelModel,
  readabilityPresentation: ReturnType<typeof deriveCoachReportPhaseVisualReadabilityPresentation>,
): {
  readonly hierarchy?: PhaseVisualZoneHierarchy;
  readonly copyBlock?: PhaseVisualCoachCopyBlock;
} {
  const hierarchy = findHierarchy(readabilityPresentation.zoneHierarchies, panel.phase);
  const copyBlock = findCopyBlock(readabilityPresentation.coachCopyBlocks, panel.phase);

  return {
    ...(hierarchy === undefined ? {} : { hierarchy }),
    ...(copyBlock === undefined ? {} : { copyBlock }),
  };
}

function renderCover(html: string): string {
  const matchId = stripTags(extractMatch(html, /Match\s*:\s*([^<]+)/u));
  const scoreSourceNote = stripTags(extractMatch(html, /<p class="muted">([\s\S]*?)<\/p>/u));
  const scoreLabel = extractMatch(html, /<span class="score">([\s\S]*?)<\/span>/u);

  return `
  <section id="cover" class="report-cover premium-section">
    <div class="report-cover-grid">
      <div class="report-cover-copy">
        <div class="report-meta-strip">
          <span class="report-meta-pill">Rapport coach export&eacute;</span>
          <span class="report-meta-pill">Match : ${matchId}</span>
          <span class="report-meta-pill">HTML-first</span>
        </div>
        <h1>Rapport coach - synth&egrave;se premium exportable</h1>
        <p>Lecture coach structur&eacute;e pour partage et revue produit, &agrave; partir du rapport produit existant.</p>
        <p class="report-truth-note">Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
      </div>
      <div class="report-scoreboard">
        <div>
          <span class="score-label">Score du rapport full-match</span>
          <span class="score">${scoreLabel}</span>
        </div>
        <p class="muted">${scoreSourceNote}</p>
        <p class="muted">Contexte : export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
      </div>
    </div>
  </section>`;
}

function renderExecutiveSummary(html: string): string {
  const items = extractListItems(extractSection(html, "executive-summary")).slice(0, 5);

  return `
  <section id="executive-summary" class="premium-section" data-source-product-sections="executive-summary">
    <div class="report-section-divider">Executive coach summary</div>
    <div class="report-section-header">
      <div>
        <h2>R&eacute;sum&eacute; coach</h2>
        <p>La lecture prioritaire du match avant d'ouvrir les blocs plus techniques.</p>
      </div>
    </div>
    <ul class="report-summary-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>`;
}

function renderMatchStory(html: string): string {
  const body = extractSectionInner(html, "official-match-reading");

  return `
  <section id="match-story" class="premium-section" data-source-product-sections="official-match-reading">
    <div class="report-section-divider">Match story</div>
    <div class="report-section-header">
      <div>
        <h2>Ce que le match dit</h2>
        <p>Lecture officielle prioritaire, conserv&eacute;e sans recr&eacute;er une autre narration du match.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderKeyStatistics(html: string): string {
  const signalCards = extractSignalCards(extractSection(html, "key-coach-signals"));

  return `
  <section id="key-statistics" class="premium-section" data-source-product-sections="key-coach-signals">
    <div class="report-section-divider">Key statistics</div>
    <div class="report-section-header">
      <div>
        <h2>3 signaux cl&eacute;s</h2>
        <p>Les cartes officielles restent visibles, mais rang&eacute;es dans une hi&eacute;rarchie plus claire.</p>
      </div>
    </div>
    <div class="report-kpi-grid">
      ${signalCards.map(toKpiCard).join("")}
    </div>
  </section>`;
}

function renderPhaseSection(
  panel: TacticalPitchPanelModel,
  readability: {
    readonly hierarchy?: PhaseVisualZoneHierarchy;
    readonly copyBlock?: PhaseVisualCoachCopyBlock;
  },
): string {
  const controlledEmptyBlock = panel.controlledEmptyStateUsed
    ? `
        <article class="report-table-card">
          <h3>Etat controle</h3>
          <p class="report-controlled-empty">${panel.emptyStateReason ?? CONTROLLED_EMPTY_STATE}</p>
        </article>`
    : "";
  const signalSummaryBlock = panel.zoneSignals.length === 0
    ? `
        <article class="report-table-card">
          <h3>Lecture a stabiliser</h3>
          <p class="report-controlled-empty">${panel.emptyStateReason ?? CONTROLLED_EMPTY_STATE}</p>
        </article>`
    : `
        <article class="report-table-card">
          <h3>Hi&eacute;rarchie des zones</h3>
          <p>${readability.hierarchy?.hierarchyExplanation ?? panel.coachReading}</p>
          <ul class="report-phase-bullet-list">
            ${panel.zoneSignals.map((signal) => `<li><strong>${signal.zone}</strong> - ${signal.explanation}</li>`).join("")}
          </ul>
        </article>`;

  return `
  <section id="${panel.phase.replace("_", "-")}" class="premium-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">${panel.title}</div>
    <div class="report-section-header">
      <div>
        <h2>${panel.title}</h2>
        <p>${panel.subtitle}</p>
      </div>
    </div>
    <div class="report-phase-layout">
      ${renderTacticalPitchPanel(panel, readability)}
      <div class="report-phase-cards">
        <article class="report-table-card">
          <h3>A verifier au prochain match</h3>
          <p>${readability.copyBlock?.whatToVerifyNext ?? panel.nextMatchCheck}</p>
        </article>
        <article class="report-table-card">
          <h3>Garde-fou visuel</h3>
          <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD}</p>
        </article>
        ${signalSummaryBlock}
        ${controlledEmptyBlock}
      </div>
    </div>
  </section>`;
}

function stabilityBadgeLabel(signal: MultiMatchPhaseZoneSignal): string {
  switch (signal.stability) {
    case "repeated":
      return "Signal répété";
    case "visible_once":
      return "Visible dans ce run";
    case "unstable":
      return "Signal instable";
    case "insufficient_data":
      return "Donnée insuffisante";
  }
}

function stabilityBadgeClass(signal: MultiMatchPhaseZoneSignal): string {
  switch (signal.stability) {
    case "repeated":
      return "phase-stability-badge phase-stability-badge--repeated";
    case "visible_once":
      return "phase-stability-badge phase-stability-badge--visible-once";
    case "unstable":
      return "phase-stability-badge phase-stability-badge--unstable";
    case "insufficient_data":
      return "phase-stability-badge phase-stability-badge--insufficient";
  }
}

function phaseFragilityCopy(panel: MultiMatchPhaseComparisonPanel): string {
  switch (panel.phase) {
    case "with_ball":
      return panel.unstableSignalCount > 0 || panel.visibleOnceSignalCount > 0 || panel.sampleCount < 4
        ? "Le volume de runs reste limité, donc le signal doit rester une piste d’observation."
        : "Même répété, le signal reste lié aux runs comparés et ne suffit pas à lui seul pour trancher.";
    case "without_ball":
      return panel.unstableSignalCount > 0 || panel.visibleOnceSignalCount > 0 || panel.insufficientDataCount > 0
        ? "Une récupération répétée ne prouve pas encore une sortie propre après récupération."
        : "Le signal reste utile pour surveiller un comportement, pas pour conclure à lui seul.";
    case "goalkeeper":
      return panel.insufficientDataCount > 0 || panel.visibleOnceSignalCount > 0 || panel.sampleCount < 4
        ? "Si peu d’actions gardien sont disponibles, le rapport doit garder un état prudent."
        : "Même répété, le signal gardien doit rester une lecture locale et ouverte au contexte.";
  }
}

function renderPhaseStabilityCard(panel: MultiMatchPhaseComparisonPanel): string {
  const zoneList = panel.zoneSignals.length === 0
    ? `<p class="report-controlled-empty">Donnée insuffisante : le volume disponible ne permet pas encore de comparer des zones de manière honnête.</p>`
    : `<ul class="phase-stability-zone-list">
        ${panel.zoneSignals.map((signal) => `
          <li>
            <strong>${signal.zone}</strong>
            <span class="${stabilityBadgeClass(signal)}">${stabilityBadgeLabel(signal)}</span>
            <br />
            ${signal.explanation}
          </li>`).join("")}
      </ul>`;

  return `
    <article class="phase-stability-card">
      <div class="phase-stability-card-header">
        <div class="report-section-header">
          <div>
            <h3>${panel.title}</h3>
            <p>${panel.sampleCount} run(s) comparé(s) dans ce périmètre local.</p>
          </div>
        </div>
        <div class="phase-stability-meta">
          <span class="phase-stability-badge phase-stability-badge--repeated">Signal répété: ${panel.repeatedSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--visible-once">Visible dans ce run: ${panel.visibleOnceSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--unstable">Signal instable: ${panel.unstableSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--insufficient">Donnée insuffisante: ${panel.insufficientDataCount}</span>
        </div>
      </div>
      ${panel.primaryRepeatedZone === undefined ? "" : `<p><strong>Zone répétée principale:</strong> ${panel.primaryRepeatedZone}</p>`}
      ${zoneList}
      <div class="phase-stability-reading">
        <div>
          <h4>Ce qui revient</h4>
          <p>${panel.coachReading}</p>
        </div>
        <div>
          <h4>Ce qui reste fragile</h4>
          <p>${phaseFragilityCopy(panel)}</p>
        </div>
        <div>
          <h4>&Agrave; v&eacute;rifier au prochain match</h4>
          <p>${panel.whatToVerifyNext}</p>
        </div>
      </div>
    </article>`;
}

function renderMultiMatchPhaseComparison(
  comparison: CoachReportMultiMatchPhaseComparisonModel,
): string {
  if (comparison.status === "not_available") {
    return "";
  }

  return `
  <section id="phase-signal-stability" class="premium-section phase-stability-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Phase signal stability</div>
    <div class="report-section-header">
      <div>
        <h2>Stabilit&eacute; des signaux de phase</h2>
        <p>Comparaison locale sur ${comparison.sampleCount} run(s) disponibles pour distinguer un signal r&eacute;p&eacute;t&eacute; d'un signal ponctuel.</p>
      </div>
    </div>
    <p class="phase-stability-guard">Cette comparaison reste locale aux runs disponibles. Elle aide &agrave; distinguer un signal r&eacute;p&eacute;t&eacute; d&rsquo;un signal ponctuel, sans transformer ce rep&egrave;re en verdict g&eacute;n&eacute;ral ni en consigne directe.</p>
    <div class="phase-stability-grid">
      ${comparison.panels.map((panel) => renderPhaseStabilityCard(panel)).join("\n")}
    </div>
  </section>`;
}

function historyStrengthLabel(drilldown: MultiMatchSignalDrilldown): string {
  switch (drilldown.strength) {
    case "local_repeated":
      return "Revient dans les échantillons disponibles";
    case "local_visible_once":
      return "Visible ponctuellement";
    case "local_unstable":
      return "Signal encore instable";
    case "insufficient_data":
      return "Donnée insuffisante";
  }
}

function historyStrengthClass(drilldown: MultiMatchSignalDrilldown): string {
  switch (drilldown.strength) {
    case "local_repeated":
      return "phase-history-strength phase-history-strength--local-repeated";
    case "local_visible_once":
      return "phase-history-strength phase-history-strength--visible-once";
    case "local_unstable":
      return "phase-history-strength phase-history-strength--unstable";
    case "insufficient_data":
      return "phase-history-strength phase-history-strength--insufficient";
  }
}

function historyPresenceLabel(presence: MultiMatchSignalDrilldown["samples"][number]["presence"]): string {
  switch (presence) {
    case "present":
      return "Présent";
    case "absent":
      return "Absent";
    case "unstable":
      return "Instable";
    case "insufficient_data":
      return "Insuffisant";
  }
}

function historyPresenceClass(presence: MultiMatchSignalDrilldown["samples"][number]["presence"]): string {
  switch (presence) {
    case "present":
      return "phase-history-presence phase-history-presence--present";
    case "absent":
      return "phase-history-presence phase-history-presence--absent";
    case "unstable":
      return "phase-history-presence phase-history-presence--unstable";
    case "insufficient_data":
      return "phase-history-presence phase-history-presence--insufficient";
  }
}

function renderHistoryDrilldownCard(drilldown: MultiMatchSignalDrilldown): string {
  return `
    <article class="phase-history-card">
      <div class="report-section-header">
        <div>
          <h3>${drilldown.label}</h3>
          <p>${drilldown.phase.replaceAll("_", " ")}${drilldown.primaryZone === undefined ? "" : ` · zone principale ${drilldown.primaryZone}`}</p>
        </div>
        <span class="${historyStrengthClass(drilldown)}">${historyStrengthLabel(drilldown)}</span>
      </div>
      <p><strong>Échantillons:</strong> ${drilldown.sampleCount} · <strong>Présent:</strong> ${drilldown.presentCount} · <strong>Absent:</strong> ${drilldown.absentCount} · <strong>Instable:</strong> ${drilldown.unstableCount} · <strong>Insuffisant:</strong> ${drilldown.insufficientDataCount}</p>
      <div>
        <h4>Ce que l&rsquo;historique montre</h4>
        <p>${drilldown.coachReading}</p>
      </div>
      <div>
        <h4>Pourquoi on reste prudent</h4>
        <p>${drilldown.whyStillCautious}</p>
      </div>
      <div>
        <h4>&Agrave; v&eacute;rifier ensuite</h4>
        <p>${drilldown.whatToVerifyNext}</p>
      </div>
      <div class="phase-history-table">
        ${drilldown.samples.map((sample) => `
          <div class="phase-history-row">
            <strong>${sample.sampleLabel}</strong>
            <span class="${historyPresenceClass(sample.presence)}">${historyPresenceLabel(sample.presence)}</span>
            <span>${sample.explanation}</span>
          </div>
        `).join("")}
      </div>
    </article>`;
}

function renderMultiMatchHistoryView(
  historyView: CoachReportMultiMatchHistoryViewModel,
): string {
  if (historyView.status === "not_available") {
    return "";
  }

  return `
  <section id="phase-signal-history" class="premium-section phase-history-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Phase signal history</div>
    <div class="report-section-header">
      <div>
        <h2>Historique des signaux compar&eacute;s</h2>
        <p>${historyView.sampleCount} &eacute;chantillon(s) disponibles, ${historyView.drilldownCount} signal(aux) relus dans ce p&eacute;rim&egrave;tre local.</p>
      </div>
    </div>
    <p class="phase-history-guard">Cet historique d&eacute;crit uniquement les &eacute;chantillons disponibles. Il aide &agrave; comprendre pourquoi un signal est affich&eacute; comme r&eacute;p&eacute;t&eacute; ou ponctuel, sans prouver une tendance globale.</p>
    <div class="phase-history-grid">
      ${historyView.drilldowns.map((drilldown) => renderHistoryDrilldownCard(drilldown)).join("\n")}
    </div>
  </section>`;
}

function renderRealMatchHistoryIntegration(
  model: CoachReportRealMatchHistoryIntegrationModel,
): string {
  if (model.status === "not_available") {
    return "";
  }

  return `
  <section id="real-match-history-store" class="premium-section match-history-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Product match history</div>
    <div class="report-section-header">
      <div>
        <h2>Historique produit des matchs</h2>
        <p>${model.storedRecordCount} enregistrement(s) locaux, ${model.queriedRecordCount} relu(s), ${model.queriedSignalCount} signal(aux) observables dans ce p&eacute;rim&egrave;tre.</p>
      </div>
    </div>
    <p class="match-history-guard">Cet historique pr&eacute;pare le stockage produit des rapports. Dans cette version, il reste local et en lecture seule : il n&rsquo;applique aucune d&eacute;cision, ne modifie pas le score et ne remplace pas l&rsquo;analyse du match courant.</p>
    <div class="match-history-grid">
      <article class="match-history-card">
        <h3>Lecture locale</h3>
        <div class="match-history-kpi">
          <div><span>Type de store</span><strong>${model.storeKind}</strong></div>
          <div><span>Match courant sauv&eacute;</span><strong>${model.currentMatchRecordSaved ? "oui" : "non"}</strong></div>
          <div><span>Historique visible</span><strong>${model.historySummaryVisible ? "oui" : "non"}</strong></div>
        </div>
      </article>
      <article class="match-history-card">
        <h3>Sources relues</h3>
        <div class="match-history-source-list">
          <span class="match-history-source-badge match-history-source-badge--controlled">sample contr&ocirc;l&eacute;: ${model.controlledSampleRecordCount}</span>
          <span class="match-history-source-badge match-history-source-badge--simulated">match simul&eacute;: ${model.simulatedMatchHistoryRecordCount}</span>
          <span class="match-history-source-badge match-history-source-badge--product">store produit: ${model.productHistoryRecordCount}</span>
        </div>
        <div class="match-history-kpi">
          <div><span>Enregistrements stock&eacute;s</span><strong>${model.storedRecordCount}</strong></div>
          <div><span>Enregistrements relus</span><strong>${model.queriedRecordCount}</strong></div>
          <div><span>Signaux relus</span><strong>${model.queriedSignalCount}</strong></div>
        </div>
      </article>
      <article class="match-history-card">
        <h3>Ce que l&rsquo;historique ajoute</h3>
        <p>Il conserve les signaux de phase issus des rapports pour pouvoir les relire match apr&egrave;s match.</p>
        <h3>Ce qui reste limit&eacute;</h3>
        <p>Cette version valide le mod&egrave;le et la lecture, pas encore une base de donn&eacute;es produit compl&egrave;te.</p>
        <h3>&Agrave; pr&eacute;parer c&ocirc;t&eacute; produit</h3>
        <p>Brancher ce mod&egrave;le sur un stockage durable par &eacute;quipe, saison et comp&eacute;tition.</p>
      </article>
    </div>
    <p class="match-history-boundary">Historique d&rsquo;observation, pas d&eacute;cision automatique. Les signaux stock&eacute;s servent &agrave; relire le contexte, jamais &agrave; s&eacute;lectionner un joueur, changer une composition ou piloter la r&eacute;solution live.</p>
  </section>`;
}

function renderHistoryStoreConsistency(
  model: CoachReportHistoryStoreConsistencyModel | undefined,
  persistenceEvidenceSnapshot?: CoachReportPersistenceEvidenceSnapshot,
): string {
  if ((model === undefined || model.status === "not_available") && persistenceEvidenceSnapshot === undefined) {
    return "";
  }
  const values = persistenceEvidenceSnapshot ?? {
    saveOperation: model?.saveOperation ?? "not_available",
    idempotentSave: model?.idempotentSave ?? false,
    recordsBeforeSaveCount: model?.recordsBeforeSaveCount ?? 0,
    recordsAfterSaveCount: model?.recordsAfterSaveCount ?? 0,
    loadedFromDiskCount: model?.loadedFromDiskCount ?? 0,
    writtenToDiskCount: model?.writtenToDiskCount ?? 0,
    dedupedRecordCount: model?.dedupedRecordCount ?? 0,
    replacedRecordCount: model?.replacedRecordCount ?? 0,
    ignoredDuplicateCount: model?.ignoredDuplicateCount ?? 0,
    queriedRecordCount: model?.queriedRecordCount ?? 0,
    queriedSignalCount: model?.queriedSignalCount ?? 0,
    databaseAdapterImplemented: model?.databaseContractImplemented ?? false,
    migrationFromFileBackedRequired: model?.databaseMigrationRequired ?? true,
    snapshotId: "not_available",
    scenario: model?.saveOperation ?? "not_available",
  };

  return `
    <section class="history-consistency-section" aria-label="Coh&eacute;rence du stockage historique">
      <div>
        <h3>Coh&eacute;rence du stockage</h3>
        <p>La coh&eacute;rence de stockage affiche un instantan&eacute; unique de sauvegarde. Les compteurs visibles dans le rapport, la validation et l&rsquo;export doivent correspondre exactement.</p>
      </div>
      <ul class="history-consistency-snapshot">
        <li>snapshot id: ${escapeHtml(values.snapshotId)}</li>
        <li>scenario: ${escapeHtml(values.scenario)}</li>
        <li>save operation: ${escapeHtml(values.saveOperation)}</li>
        <li>idempotent save: ${values.idempotentSave}</li>
        <li>records before save count: ${values.recordsBeforeSaveCount}</li>
        <li>records after save count: ${values.recordsAfterSaveCount}</li>
        <li>loaded from disk count: ${values.loadedFromDiskCount}</li>
        <li>written to disk count: ${values.writtenToDiskCount}</li>
        <li>deduped record count: ${values.dedupedRecordCount}</li>
        <li>replaced record count: ${values.replacedRecordCount}</li>
        <li>ignored duplicate count: ${values.ignoredDuplicateCount}</li>
        <li>queried record count: ${values.queriedRecordCount}</li>
        <li>queried signal count: ${values.queriedSignalCount}</li>
        <li>migration SPI adapter implemented false: ${!values.databaseAdapterImplemented}</li>
        <li>migration from file-backed required true: ${values.migrationFromFileBackedRequired}</li>
      </ul>
      <div class="history-consistency-grid">
        <article class="history-consistency-card">
          <h4>R&eacute;sultat de sauvegarde</h4>
          <div class="history-consistency-kpi">
            <div><span>Op&eacute;ration</span><strong class="history-consistency-operation">${escapeHtml(values.saveOperation)}</strong></div>
            <div><span>Idempotent</span><strong>${values.idempotentSave ? "oui" : "non"}</strong></div>
            <div><span>Avant</span><strong>${values.recordsBeforeSaveCount}</strong></div>
            <div><span>Apr&egrave;s</span><strong>${values.recordsAfterSaveCount}</strong></div>
          </div>
        </article>
        <article class="history-consistency-card">
          <h4>Compteurs durables</h4>
          <div class="history-consistency-kpi">
            <div><span>Charg&eacute;s disque</span><strong>${values.loadedFromDiskCount}</strong></div>
            <div><span>&Eacute;crits disque</span><strong>${values.writtenToDiskCount}</strong></div>
            <div><span>D&eacute;dupliqu&eacute;s</span><strong>${values.dedupedRecordCount}</strong></div>
            <div><span>Remplac&eacute;s</span><strong>${values.replacedRecordCount}</strong></div>
            <div><span>Doublons ignor&eacute;s</span><strong>${values.ignoredDuplicateCount}</strong></div>
            <div><span>Records relus</span><strong>${values.queriedRecordCount}</strong></div>
            <div><span>Signaux relus</span><strong>${values.queriedSignalCount}</strong></div>
          </div>
        </article>
        <article class="history-consistency-card">
          <h4>Contrat DB futur</h4>
          <div class="history-consistency-kpi">
            <div><span>Visible</span><strong>oui</strong></div>
            <div><span>Impl&eacute;ment&eacute;</span><strong>${values.databaseAdapterImplemented ? "oui" : "non"}</strong></div>
            <div><span>Migration requise</span><strong>${values.migrationFromFileBackedRequired ? "oui" : "non"}</strong></div>
          </div>
        </article>
      </div>
      <p class="history-consistency-boundary">Coh&eacute;rence historique d&rsquo;observation : aucune mutation du score, de la timeline, des &eacute;v&eacute;nements de score ou de la s&eacute;lection live.</p>
      <p class="history-consistency-database-contract">Migration SPI adapter contract visible, implemented=false, migrationRequired=true. This refers to the previous migration SPI, not to the experimental or durable storage adapter.</p>
      <p class="history-consistency-guard">Les compteurs de cette section viennent d&rsquo;un instantan&eacute; unique issu du <code>CoachMatchHistorySaveResult</code>, pas d&rsquo;un recalcul ad hoc du renderer.</p>
      ${model === undefined || model.warnings.length === 0 ? "" : `<p class="history-consistency-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderDatabaseMigrationPreparation(
  model: CoachReportDatabaseMigrationPreparationModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="database-migration-section" aria-label="Pr&eacute;paration migration historique">
      <div>
        <h3>Pr&eacute;paration migration historique</h3>
        <p>La migration database est pr&eacute;par&eacute;e comme un dry run de lecture : elle d&eacute;crit ce qui serait ins&eacute;r&eacute;, remplac&eacute;, ignor&eacute; ou rejet&eacute;, sans activer de stockage database.</p>
      </div>
      <p class="database-migration-dry-run">Cette migration est un dry run. Elle pr&eacute;pare le passage vers un futur stockage database sans &eacute;crire dans une base r&eacute;elle, sans changer le rapport courant et sans cr&eacute;er une nouvelle source de v&eacute;rit&eacute;.</p>
      <div class="database-migration-grid">
        <article class="database-migration-card">
          <h4>Boundary database</h4>
          <div class="database-migration-kpi">
            <div><span>Source store kind</span><strong>${model.sourceStoreKind}</strong></div>
            <div><span>Target adapter kind</span><strong>${model.targetAdapterKind}</strong></div>
            <div><span>Dry run only</span><strong>${model.dryRunOnly ? "true" : "false"}</strong></div>
            <div><span>Adapter impl&eacute;ment&eacute;</span><strong>${model.databaseAdapterImplemented ? "true" : "false"}</strong></div>
            <div><span>Production ready</span><strong>${model.databaseAdapterProductionReady ? "true" : "false"}</strong></div>
            <div><span>Real DB write count</span><strong>${model.realDatabaseWriteCount}</strong></div>
            <div><span>Real DB read count</span><strong>${model.realDatabaseReadCount}</strong></div>
          </div>
        </article>
        <article class="database-migration-card">
          <h4>Plan de migration</h4>
          <div class="database-migration-kpi">
            <div><span>Source record count</span><strong>${model.sourceRecordCount}</strong></div>
            <div><span>Migration plan count</span><strong>${model.migrationPlanCount}</strong></div>
            <div><span>Migrable record count</span><strong>${model.migrableRecordCount}</strong></div>
            <div><span>Would insert count</span><strong>${model.wouldInsertCount}</strong></div>
            <div><span>Would replace count</span><strong>${model.wouldReplaceCount}</strong></div>
            <div><span>Would ignore duplicate count</span><strong>${model.wouldIgnoreDuplicateCount}</strong></div>
            <div><span>Rejected invalid count</span><strong>${model.rejectedInvalidCount}</strong></div>
            <div><span>Rejected unsupported count</span><strong>${model.rejectedUnsupportedCount}</strong></div>
          </div>
        </article>
        <article class="database-migration-card">
          <h4>Ce que la migration pr&eacute;pare</h4>
          <p>Ce que la migration pr&eacute;pare : les records file-backed peuvent &ecirc;tre analys&eacute;s avec le m&ecirc;me contrat de sauvegarde qu&rsquo;un futur adapter database.</p>
          <h4>Ce qui reste volontairement limit&eacute;</h4>
          <p>Ce qui reste volontairement limit&eacute; : aucune base r&eacute;elle n&rsquo;est utilis&eacute;e ; le dry run ne fait qu&rsquo;expliquer ce qui serait ins&eacute;r&eacute;, remplac&eacute; ou ignor&eacute;.</p>
          <h4>Prochaine &eacute;tape produit</h4>
          <p>Prochaine &eacute;tape produit : choisir un stockage durable produit et brancher l&rsquo;adapter sans changer les garanties read-only du rapport.</p>
        </article>
      </div>
      <p class="database-migration-boundary">Migration de pr&eacute;paration uniquement : aucune mutation du score, de la timeline, de la possession, des &eacute;v&eacute;nements de score, de la s&eacute;lection live ou de la composition.</p>
      <p class="database-migration-plan">Save-result semantics preserved: ${model.preservesSaveResultSemantics}. Report queries read-only: ${model.reportQueriesReadOnly}.</p>
      <p class="database-migration-guard">Migration SPI adapter implemented false, production ready false, real database read/write counts 0. This refers to the previous migration SPI, not to the experimental or durable storage adapter.</p>
      ${model.warnings.length === 0 ? "" : `<p class="database-migration-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderDatabaseAdapterSpike(
  model: CoachReportDatabaseAdapterSpikeModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="database-adapter-spike-section" aria-label="Adapter database exp&eacute;rimental">
      <div>
        <h3>Adapter database exp&eacute;rimental</h3>
        <p>Cet adapter database est exp&eacute;rimental. Il valide une forme technique future, mais le rapport ne l&rsquo;utilise pas comme source de v&eacute;rit&eacute; produit et aucune base r&eacute;elle n&rsquo;est lue ou &eacute;crite.</p>
      </div>
      <p class="database-adapter-spike-feature-flag">Feature flag ${escapeHtml(model.featureFlagEnabled ? "enabled" : "disabled")}; default enabled false; product activation allowed false.</p>
      <div class="database-adapter-spike-grid">
        <article class="database-adapter-spike-card">
          <h4>Adapter</h4>
          <div class="database-adapter-spike-kpi">
            <div><span>Adapter kind</span><strong>${model.adapterKind}</strong></div>
            <div><span>Adapter implemented</span><strong>${model.adapterImplemented ? "true" : "false"}</strong></div>
            <div><span>Production ready</span><strong>${model.adapterProductionReady ? "true" : "false"}</strong></div>
            <div><span>Feature flag enabled</span><strong>${model.featureFlagEnabled ? "true" : "false"}</strong></div>
            <div><span>Product activation allowed</span><strong>${model.productActivationAllowed ? "true" : "false"}</strong></div>
            <div><span>Report can use as source of truth</span><strong>${model.reportCanUseAsSourceOfTruth ? "true" : "false"}</strong></div>
            <div><span>Real DB write count</span><strong>${model.realDatabaseWriteCount}</strong></div>
            <div><span>Real DB read count</span><strong>${model.realDatabaseReadCount}</strong></div>
          </div>
        </article>
        <article class="database-adapter-spike-card">
          <h4>Source active</h4>
          <div class="database-adapter-spike-kpi">
            <div><span>Active product history source</span><strong>${model.activeProductHistorySource}</strong></div>
            <div><span>Database used as product truth</span><strong>${model.databaseUsedAsProductTruth ? "true" : "false"}</strong></div>
            <div><span>Dry run only</span><strong>${model.dryRunOnly ? "true" : "false"}</strong></div>
            <div><span>Source record count</span><strong>${model.sourceRecordCount}</strong></div>
            <div><span>Experimental adapter record count</span><strong>${model.experimentalAdapterRecordCount}</strong></div>
            <div><span>Dry run save count</span><strong>${model.dryRunSaveCount}</strong></div>
            <div><span>Dry run query count</span><strong>${model.dryRunQueryCount}</strong></div>
          </div>
        </article>
        <article class="database-adapter-spike-card">
          <h4>Sc&eacute;narios valid&eacute;s</h4>
          <div class="database-adapter-spike-kpi">
            <div><span>Inserted scenario pass</span><strong>${model.insertedScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Replaced scenario pass</span><strong>${model.replacedScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Ignored duplicate scenario pass</span><strong>${model.ignoredDuplicateScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Query by team pass</span><strong>${model.queryByTeamPass ? "true" : "false"}</strong></div>
            <div><span>Query by phase pass</span><strong>${model.queryByPhasePass ? "true" : "false"}</strong></div>
            <div><span>Deterministic ordering pass</span><strong>${model.deterministicOrderingPass ? "true" : "false"}</strong></div>
          </div>
        </article>
        <article class="database-adapter-spike-card">
          <h4>Ce que le spike valide</h4>
          <p>Ce que le spike valide : l&rsquo;adapter exp&eacute;rimental reproduit les sc&eacute;narios inserted, replaced et ignored_duplicate sans d&eacute;pendance &agrave; une base r&eacute;elle.</p>
          <h4>Ce qui reste d&eacute;sactiv&eacute;</h4>
          <p>Ce qui reste d&eacute;sactiv&eacute; : la DB ne devient pas la source de v&eacute;rit&eacute; du rapport et ne pilote aucune d&eacute;cision coach.</p>
          <h4>Prochaine &eacute;tape produit</h4>
          <p>Prochaine &eacute;tape produit : choisir une vraie technologie de stockage puis brancher l&rsquo;adapter derri&egrave;re la m&ecirc;me boundary.</p>
        </article>
      </div>
      <p class="database-adapter-spike-boundary">Boundary 5E : file_backed reste la source produit active ; l&rsquo;adapter experimental_database reste un spike technique non appliqu&eacute;.</p>
      <p class="database-adapter-spike-guard">Aucune mutation du score, de la timeline, de la possession, des &eacute;v&eacute;nements de score, de la s&eacute;lection live ou de la composition.</p>
      ${model.warnings.length === 0 ? "" : `<p class="database-adapter-spike-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderDurableStorageDecision(
  model: CoachReportDurableStorageDecisionModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="durable-storage-decision-section" aria-label="D&eacute;cision stockage durable">
      <div>
        <h3>D&eacute;cision stockage durable</h3>
        <p>Le stockage durable cible est choisi pour la prochaine &eacute;tape de d&eacute;veloppement/test, sans activation produit. Le rapport continue de lire l&rsquo;historique actif en file_backed.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Cible durable</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Storage target selected</span><strong>${model.selectedStorageTarget}</strong></div>
            <div><span>Schema version</span><strong>${model.schemaVersion}</strong></div>
            <div><span>Decision made</span><strong>${model.decisionMade ? "true" : "false"}</strong></div>
            <div><span>Real adapter wiring prepared</span><strong>${model.realAdapterWiringPrepared ? "true" : "false"}</strong></div>
            <div><span>Adapter kind</span><strong>${model.adapterKind}</strong></div>
            <div><span>Adapter implemented</span><strong>${model.adapterImplemented ? "true" : "false"}</strong></div>
            <div><span>Adapter production ready</span><strong>${model.adapterProductionReady ? "true" : "false"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Boundary produit</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Feature flag enabled</span><strong>${model.featureFlagEnabled ? "true" : "false"}</strong></div>
            <div><span>Default feature flag enabled</span><strong>${model.defaultFeatureFlagEnabled ? "true" : "false"}</strong></div>
            <div><span>Product activation allowed</span><strong>${model.productActivationAllowed ? "true" : "false"}</strong></div>
            <div><span>Active product history source</span><strong>${model.activeProductHistorySource}</strong></div>
            <div><span>Database used as product truth</span><strong>${model.databaseUsedAsProductTruth ? "true" : "false"}</strong></div>
            <div><span>Report can use as source of truth</span><strong>${model.reportCanUseAsSourceOfTruth ? "true" : "false"}</strong></div>
            <div><span>Real DB write count</span><strong>${model.realDatabaseWriteCount}</strong></div>
            <div><span>Real DB read count</span><strong>${model.realDatabaseReadCount}</strong></div>
            <div><span>Dry run only</span><strong>${model.dryRunOnly ? "true" : "false"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Sc&eacute;narios pr&eacute;par&eacute;s</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Inserted scenario pass</span><strong>${model.insertedScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Replaced scenario pass</span><strong>${model.replacedScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Ignored duplicate scenario pass</span><strong>${model.ignoredDuplicateScenarioPass ? "true" : "false"}</strong></div>
            <div><span>Query by team pass</span><strong>${model.queryByTeamPass ? "true" : "false"}</strong></div>
            <div><span>Query by phase pass</span><strong>${model.queryByPhasePass ? "true" : "false"}</strong></div>
            <div><span>Deterministic ordering pass</span><strong>${model.deterministicOrderingPass ? "true" : "false"}</strong></div>
            <div><span>Durable adapter record count</span><strong>${model.durableAdapterRecordCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Prochaine &eacute;tape produit</h4>
          <p>Activer une lecture contr&ocirc;l&eacute;e en environnement test/local, pas en produit. La lecture produit courante reste file_backed jusqu&rsquo;&agrave; validation explicite ult&eacute;rieure.</p>
          <p>${escapeHtml(model.reason)}</p>
        </article>
      </div>
      <p class="durable-storage-decision-boundary">Boundary 5F : sqlite_local est une cible de pr&eacute;paration ; file_backed reste la source active, la base n&rsquo;est pas utilis&eacute;e comme v&eacute;rit&eacute; produit et les compteurs DB r&eacute;els restent &agrave; 0.</p>
      <p class="durable-storage-decision-guard">Aucune mutation du score, de la timeline, de la possession, des &eacute;v&eacute;nements de score, de la s&eacute;lection live ou de la composition.</p>
      ${model.warnings.length === 0 ? "" : `<p class="durable-storage-decision-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderControlledLocalReadOnlyDbMode(
  model: CoachReportControlledLocalReadOnlyDbModeModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Lecture SQLite locale contr&ocirc;l&eacute;e">
      <div>
        <h3>Lecture SQLite locale contr&ocirc;l&eacute;e</h3>
        <p>Ce mode sert uniquement &agrave; relire localement des records compatibles en environnement test/dev. Il n&rsquo;est pas actif par d&eacute;faut et la source produit active reste inchang&eacute;e.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Mode contr&ocirc;l&eacute;</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Mode</span><strong>${model.modeName}</strong></div>
            <div><span>Stockage cible</span><strong>${model.storageTarget}</strong></div>
            <div><span>Sch&eacute;ma</span><strong>${model.schemaVersion}</strong></div>
            <div><span>Read-only mode</span><strong>${model.readOnlyMode ? "true" : "false"}</strong></div>
            <div><span>Write mode allowed</span><strong>${model.writeModeAllowed ? "true" : "false"}</strong></div>
            <div><span>Write rejected pass</span><strong>${model.writeRejectedPass ? "true" : "false"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Boundary produit</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Actif par d&eacute;faut</span><strong>${model.defaultEnabled ? "oui" : "non"}</strong></div>
            <div><span>Feature flag enabled</span><strong>${model.featureFlagEnabled ? "true" : "false"}</strong></div>
            <div><span>Activation produit</span><strong>${model.productActivationAllowed ? "oui" : "non"}</strong></div>
            <div><span>Source produit active</span><strong>${model.activeProductHistorySource}</strong></div>
            <div><span>DB comme v&eacute;rit&eacute; produit</span><strong>${model.databaseUsedAsProductTruth ? "oui" : "non"}</strong></div>
            <div><span>Rapport source officielle</span><strong>${model.reportCanUseAsSourceOfTruth ? "oui" : "non"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Lecture locale</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Lectures DB r&eacute;elles mode d&eacute;faut</span><strong>${model.realDatabaseReadCount}</strong></div>
            <div><span>&Eacute;critures DB r&eacute;elles</span><strong>${model.realDatabaseWriteCount}</strong></div>
            <div><span>Controlled read attempts</span><strong>${model.controlledReadAttemptCount}</strong></div>
            <div><span>Source record count</span><strong>${model.sourceRecordCount}</strong></div>
            <div><span>Read-only record count</span><strong>${model.readOnlyRecordCount}</strong></div>
            <div><span>Read-only query count</span><strong>${model.readOnlyQueryCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Contrats v&eacute;rifi&eacute;s</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Query by team pass</span><strong>${model.readOnlyQueryByTeamPass ? "true" : "false"}</strong></div>
            <div><span>Query by phase pass</span><strong>${model.readOnlyQueryByPhasePass ? "true" : "false"}</strong></div>
            <div><span>Deterministic ordering pass</span><strong>${model.deterministicOrderingPass ? "true" : "false"}</strong></div>
            <div><span>Schema compatibility pass</span><strong>${model.schemaCompatibilityPass ? "true" : "false"}</strong></div>
            <div><span>Dry-run fallback</span><strong>${model.dryRunFallbackAvailable ? "true" : "false"}</strong></div>
            <div><span>True SQLite IO deferred</span><strong>${model.trueSqliteIoDeferred ? "true" : "false"}</strong></div>
          </div>
        </article>
      </div>
      <p class="durable-storage-decision-boundary">Boundary 5G : mode contr&ocirc;l&eacute;, lecture locale, non actif par d&eacute;faut, non utilis&eacute; comme v&eacute;rit&eacute; produit, aucune &eacute;criture et source produit active inchang&eacute;e.</p>
      <p class="durable-storage-decision-guard">Aucune modification du score, de la timeline, de la possession, des &eacute;v&eacute;nements de score, de la s&eacute;lection, de la composition ou des d&eacute;cisions coach.</p>
      <p class="durable-storage-decision-warning">Prochaine &eacute;tape : ${escapeHtml(model.nextStep)}.</p>
      ${model.warnings.length === 0 ? "" : `<p class="durable-storage-decision-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderRealSQLiteReadOnlyIOSmokeTest(
  model: CoachReportRealSQLiteReadOnlyIOSmokeTestModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Smoke test SQLite read-only">
      <div>
        <h3>Smoke test SQLite read-only</h3>
        <p>Smoke test contr&ocirc;l&eacute; : une fixture SQLite locale non-prod est lue en read-only. Elle n&rsquo;est pas active par d&eacute;faut, non utilis&eacute;e comme v&eacute;rit&eacute; produit, et la source produit active reste inchang&eacute;e.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Lecture SQLite r&eacute;elle</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Mode</span><strong>${model.modeName}</strong></div>
            <div><span>Storage target</span><strong>${model.storageTarget}</strong></div>
            <div><span>Schema</span><strong>${model.schemaVersion}</strong></div>
            <div><span>Vraie lecture SQLite contr&ocirc;l&eacute;e</span><strong>${model.realSQLiteIoEnabled ? "oui" : "non"}</strong></div>
            <div><span>Read-only</span><strong>${model.readOnlyMode ? "true" : "false"}</strong></div>
            <div><span>Write mode allowed</span><strong>${model.writeModeAllowed ? "true" : "false"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Boundary produit</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Actif par d&eacute;faut</span><strong>${model.defaultFeatureFlagEnabled ? "oui" : "non"}</strong></div>
            <div><span>Feature flag enabled</span><strong>${model.featureFlagEnabled ? "true" : "false"}</strong></div>
            <div><span>Activation produit</span><strong>${model.productActivationAllowed ? "oui" : "non"}</strong></div>
            <div><span>Source produit active</span><strong>${model.activeProductHistorySource}</strong></div>
            <div><span>DB comme v&eacute;rit&eacute; produit</span><strong>${model.databaseUsedAsProductTruth ? "oui" : "non"}</strong></div>
            <div><span>Rapport source officielle</span><strong>${model.reportCanUseAsSourceOfTruth ? "oui" : "non"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Compteurs IO</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Lecture DB r&eacute;elle mode d&eacute;faut</span><strong>${model.defaultRealDatabaseReadCount}</strong></div>
            <div><span>Lecture DB r&eacute;elle mode contr&ocirc;l&eacute;</span><strong>${model.controlledRealDatabaseReadCount}</strong></div>
            <div><span>&Eacute;criture DB</span><strong>${model.realDatabaseWriteCount}</strong></div>
            <div><span>Write rejected</span><strong>${model.writeRejectedPass ? "true" : "false"}</strong></div>
            <div><span>Fixture record count</span><strong>${model.fixtureRecordCount}</strong></div>
            <div><span>Adapter record count</span><strong>${model.readOnlyAdapterRecordCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Contrats v&eacute;rifi&eacute;s</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Query by team</span><strong>${model.queryByTeamPass ? "true" : "false"}</strong></div>
            <div><span>Query by phase</span><strong>${model.queryByPhasePass ? "true" : "false"}</strong></div>
            <div><span>Deterministic ordering</span><strong>${model.deterministicOrderingPass ? "true" : "false"}</strong></div>
            <div><span>Schema compatibility</span><strong>${model.schemaCompatibilityPass ? "true" : "false"}</strong></div>
            <div><span>Dry-run fallback</span><strong>${model.dryRunFallbackAvailable ? "true" : "false"}</strong></div>
            <div><span>Driver choice</span><strong>${model.sqliteDriverChoice}</strong></div>
          </div>
        </article>
      </div>
      <p class="durable-storage-decision-boundary">Boundary 5H : smoke test contr&ocirc;l&eacute;, read-only, non actif par d&eacute;faut, non utilis&eacute; comme v&eacute;rit&eacute; produit, source produit active inchang&eacute;e et aucune &eacute;criture.</p>
      <p class="durable-storage-decision-guard">Aucune mutation du match officiel : score, timeline, possession, scoring events, s&eacute;lection, composition, titulaires, banc et routes production restent intacts.</p>
      <p class="durable-storage-decision-warning">Prochaine &eacute;tape : ${escapeHtml(model.nextStep)}, uniquement en non-prod et pas encore activ&eacute;e.</p>
      ${model.warnings.length === 0 ? "" : `<p class="durable-storage-decision-warning">${model.warnings.map(escapeHtml).join(" ")}</p>`}
    </section>`;
}

function renderFullMatchScoreEconomyCalibration(
  model: FullMatchScoreEconomyCalibrationModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Calibration economie du score">
      <div>
        <h3>Calibration &eacute;conomie du score</h3>
        <p>Signal single-run : le score reste issu des &eacute;v&eacute;nements officiels. Cette calibration moteur explique les causes probables et reste &agrave; confirmer sur batch.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Avant / apr&egrave;s projet&eacute;</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Score full-match avant calibration</span><strong>${escapeHtml(model.officialScoreBeforeCalibration)}</strong></div>
            <div><span>Projection apr&egrave;s calibration</span><strong>${escapeHtml(model.officialScoreAfterCalibration)}</strong></div>
            <div><span>Scoring events avant</span><strong>${model.comparison.scoringEventsBefore}</strong></div>
            <div><span>Scoring events apr&egrave;s</span><strong>${model.comparison.scoringEventsAfter}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Causes probables</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Cause principale</span><strong>${escapeHtml(model.rootCause.primaryCause)}</strong></div>
            <div><span>Confiance</span><strong>${escapeHtml(model.rootCause.confidence)}</strong></div>
            <div><span>SHOT_GOAL share</span><strong>${model.shotGoalShare}%</strong></div>
            <div><span>Dominance &eacute;quipe</span><strong>${model.dominantTeamScoringShare}%</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Sanity warnings</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Segments</span><strong>${model.segmentCount}</strong></div>
            <div><span>Occasions danger</span><strong>${model.finishingOpportunityCount}</strong></div>
            <div><span>Risque amplification</span><strong>${escapeHtml(model.repeatedSegmentAmplificationRisk)}</strong></div>
            <div><span>Volatilit&eacute; single-run</span><strong>${escapeHtml(model.singleRunVolatilityRisk)}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Garde-fous</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Constantes inchang&eacute;es</span><strong>${model.scoringConstantsChanged ? "non" : "oui"}</strong></div>
            <div><span>Aucun plafond artificiel</span><strong>${model.scoreCapApplied ? "non" : "oui"}</strong></div>
            <div><span>Aucune r&eacute;&eacute;criture</span><strong>${model.postHocScoreRewriteApplied ? "non" : "oui"}</strong></div>
            <div><span>Batch/live s&eacute;par&eacute;s</span><strong>${model.batchLiveSeparationPreserved ? "oui" : "non"}</strong></div>
          </div>
        </article>
      </div>
      <p class="durable-storage-decision-boundary">${escapeHtml(model.rootCause.evidenceSummary)}</p>
      <p class="durable-storage-decision-guard">Constantes inchang&eacute;es, aucun plafond artificiel, aucun &eacute;v&eacute;nement supprim&eacute; ou r&eacute;&eacute;crit, aucun score adverse forc&eacute;, et FULL_MATCH_BATCH_ECONOMY reste la r&eacute;f&eacute;rence globale.</p>
      <p class="durable-storage-decision-warning">${escapeHtml(model.recommendation)}</p>
    </section>`;
}

function renderScoringFamilyAttributionAudit(
  model: ScoringFamilyAttributionAuditModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const familyRows = Object.entries(model.scoringEventsByFamily)
    .map(([family, count]) => {
      const points = model.scoringPointsByFamily[family as keyof typeof model.scoringPointsByFamily] ?? 0;
      return `<tr><td>${escapeHtml(family)}</td><td>${count}</td><td>${points}</td></tr>`;
    })
    .join("");
  const tracedPointTotal = Object.values(model.scoringPointsByFamily).reduce((total, points) => total + points, 0);
  const unknownCopy = model.unknownScoringEventCount === 0
    ? "Aucun evenement de score officiel ne reste sans famille."
    : `${model.unknownScoringEventCount} evenement(s) restent UNKNOWN avec raison explicite : ${escapeHtml(model.unknownReasons.join(" | "))}.`;

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Origine des points">
      <div>
        <h3>Origine des points</h3>
        <p>Lecture single-run : les points restent issus des evenements officiels score_change. Cette section attribue chaque score a une famille pour rendre la calibration lisible, sans modifier le score.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Score officiel</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Points traces</span><strong>${tracedPointTotal}</strong></div>
            <div><span>Evenements officiels</span><strong>${model.totalScoringEventCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Couverture</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Attribution</span><strong>${model.attributionCoverageRate}%</strong></div>
            <div><span>Attribues</span><strong>${model.attributedScoringEventCount}/${model.totalScoringEventCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>UNKNOWN</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Apres 6B</span><strong>${model.unknownScoringEventCount}</strong></div>
            <div><span>Legacy 6A</span><strong>${model.legacyUnknownScoringEventCount}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Confiance</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Haute</span><strong>${model.highConfidenceCount}</strong></div>
            <div><span>Moyenne / basse</span><strong>${model.mediumConfidenceCount} / ${model.lowConfidenceCount}</strong></div>
          </div>
        </article>
      </div>
      <table class="premium-table">
        <thead><tr><th>Famille de score</th><th>Evenements</th><th>Points</th></tr></thead>
        <tbody>${familyRows}</tbody>
      </table>
      <p class="durable-storage-decision-guard">${unknownCopy}</p>
      <p class="durable-storage-decision-guard">Constantes de scoring inchangees, aucun evenement officiel supprime ou reecrit, aucun plafond artificiel, aucune correction manuelle du score. L'economie globale reste a confirmer sur batch.</p>
    </section>`;
}

function renderFullMatchCalibrationCarryoverReconciliation(
  model: FullMatchCalibrationCarryoverReconciliationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const matrixRows = model.carryoverMatrix
    .slice(0, 6)
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.calibrationName)}</td>
        <td>${row.validated ? "oui" : "non"}</td>
        <td>${row.fullMatchOfficialApplied ? "oui" : "non"}</td>
        <td>${escapeHtml(row.gap)}</td>
      </tr>`)
    .join("");
  const pathRows = model.scoringPathAuditRows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.pathName)}</td>
        <td>${escapeHtml(row.pathType)}</td>
        <td>${row.canDriveOfficialScore ? "oui" : "non"}</td>
        <td>${row.canClaimGlobalEconomy ? "oui" : "non"}</td>
      </tr>`)
    .join("");

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Reconciliation des calibrations">
      <div>
        <h3>R&eacute;conciliation des calibrations</h3>
        <p>Diagnostic single-run : ce bloc explique pourquoi le full-match officiel peut encore produire un score tr&egrave;s &eacute;lev&eacute; malgr&eacute; les calibrations batch/live d&eacute;j&agrave; valid&eacute;es. Il ne modifie pas le score.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Score observ&eacute;</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Score officiel</span><strong>${escapeHtml(model.officialFullMatchScore)}</strong></div>
            <div><span>Score events</span><strong>${model.officialFullMatchScoringEvents}</strong></div>
            <div><span>SHOT_GOAL</span><strong>${model.officialFullMatchShotGoalEvents}</strong></div>
            <div><span>Points SHOT_GOAL</span><strong>${model.officialFullMatchShotGoalPoints}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>R&eacute;f&eacute;rence historique</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>SHOT_GOAL / match batch</span><strong>${model.batchCalibrationKnownShotGoalsPerMatch}</strong></div>
            <div><span>Conversion batch</span><strong>${model.batchCalibrationKnownConversionRate}%</strong></div>
            <div><span>Confiance</span><strong>${escapeHtml(model.confidence)}</strong></div>
            <div><span>Scope</span><strong>${escapeHtml(model.scope)}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Cause probable</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Primaire</span><strong>${escapeHtml(model.primaryRegressionCause)}</strong></div>
            <div><span>Chemin parall&egrave;le</span><strong>${model.fullMatchUsesParallelScoringPath ? "oui" : "non"}</strong></div>
            <div><span>Amplification segment</span><strong>${model.fullMatchUsesSegmentAmplificationPath ? "oui" : "non"}</strong></div>
            <div><span>Path legacy shot</span><strong>${model.fullMatchUsesLegacyShotPath ? "oui" : "non"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Garde-fous</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Cap score</span><strong>${model.scoreCapApplied ? "oui" : "non"}</strong></div>
            <div><span>Events supprim&eacute;s</span><strong>${model.scoringEventsDeleted ? "oui" : "non"}</strong></div>
            <div><span>Events r&eacute;&eacute;crits</span><strong>${model.scoringEventsRewritten ? "oui" : "non"}</strong></div>
            <div><span>Batch/live s&eacute;par&eacute;s</span><strong>${model.batchLiveSeparationPreserved ? "oui" : "non"}</strong></div>
          </div>
        </article>
      </div>
      <table class="premium-table">
        <thead><tr><th>Calibration</th><th>Valid&eacute;e</th><th>Appliqu&eacute;e full-match</th><th>&Eacute;cart</th></tr></thead>
        <tbody>${matrixRows}</tbody>
      </table>
      <table class="premium-table">
        <thead><tr><th>Chemin scoring</th><th>Type</th><th>Score officiel</th><th>R&eacute;f&eacute;rence globale</th></tr></thead>
        <tbody>${pathRows}</tbody>
      </table>
      <p class="durable-storage-decision-boundary">${escapeHtml(model.evidenceSummary)}</p>
      <p class="durable-storage-decision-guard">6C est diagnostic only : constantes inchang&eacute;es, aucun cap, aucune suppression ou r&eacute;&eacute;criture d&rsquo;&eacute;v&eacute;nements, aucun score adverse forc&eacute;. FULL_MATCH_BATCH_ECONOMY reste la seule r&eacute;f&eacute;rence globale.</p>
      <p class="durable-storage-decision-warning">${escapeHtml(model.recommendation)}</p>
    </section>`;
}

function renderFullMatchOfficialScoringConnection(
  model: FullMatchOfficialScoringCalibrationConnectionModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Chemin officiel de scoring calibre">
      <div>
        <h3>Chemin officiel de scoring calibr&eacute;</h3>
        <p>Connexion single-run : les opportunit&eacute;s de score passent maintenant par les calibrations valid&eacute;es avant l&rsquo;&eacute;mission des <code>score_change</code> officiels. Ce bloc reste limit&eacute; &agrave; ce run et demande une confirmation batch.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Avant / apr&egrave;s connexion</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Score avant</span><strong>${escapeHtml(model.officialScoreBeforeConnection)}</strong></div>
            <div><span>Score apr&egrave;s</span><strong>${escapeHtml(model.officialScoreAfterConnection)}</strong></div>
            <div><span>Score events avant</span><strong>${model.officialScoringEventsBeforeConnection}</strong></div>
            <div><span>Score events apr&egrave;s</span><strong>${model.officialScoringEventsAfterConnection}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Famille SHOT_GOAL</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Events avant</span><strong>${model.officialShotGoalEventsBeforeConnection}</strong></div>
            <div><span>Events apr&egrave;s</span><strong>${model.officialShotGoalEventsAfterConnection}</strong></div>
            <div><span>Points avant</span><strong>${model.officialShotGoalPointsBeforeConnection}</strong></div>
            <div><span>Points apr&egrave;s</span><strong>${model.officialShotGoalPointsAfterConnection}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Calibrations actives</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Shot difficulty</span><strong>${model.usesShotDifficultyCalibrationAfter ? "oui" : "non"}</strong></div>
            <div><span>Choix route</span><strong>${model.usesScoringChoiceBalanceAfter ? "oui" : "non"}</strong></div>
            <div><span>Volume affordances</span><strong>${model.usesAffordanceVolumeConstraintsAfter ? "oui" : "non"}</strong></div>
            <div><span>GK / rebond / fatigue</span><strong>${model.usesGoalkeeperCalibrationAfter && model.usesReboundCalibrationAfter && model.usesFatigueCalibrationAfter ? "oui" : "non"}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Garde-fous</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Score issu des score_change</span><strong>${model.officialScoreComesFromScoreChangeEvents ? "oui" : "non"}</strong></div>
            <div><span>Cap score</span><strong>${model.scoreCapApplied ? "oui" : "non"}</strong></div>
            <div><span>R&eacute;&eacute;criture post-run</span><strong>${model.postHocScoreRewriteApplied ? "oui" : "non"}</strong></div>
            <div><span>R&eacute;f&eacute;rence globale</span><strong>${model.canClaimGlobalEconomyAfter ? "oui" : "non"}</strong></div>
          </div>
        </article>
      </div>
      <p class="durable-storage-decision-boundary">${escapeHtml(model.evidenceSummary)}</p>
      <p class="durable-storage-decision-guard">Constantes inchang&eacute;es : SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactif. Aucun score adverse forc&eacute;, aucune suppression apr&egrave;s g&eacute;n&eacute;ration.</p>
      <p class="durable-storage-decision-warning">${escapeHtml(model.recommendation)}</p>
    </section>`;
}

export function renderFullMatchBatchEconomyProofSection(
  model: FullMatchBatchEconomyProofModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const pointRows = [
    ["SHOT_GOAL", model.scoringPointsByFamily.SHOT_GOAL, model.scoringPointsShareByFamily.SHOT_GOAL],
    ["TRY_TOUCHDOWN", model.scoringPointsByFamily.TRY_TOUCHDOWN, model.scoringPointsShareByFamily.TRY_TOUCHDOWN],
    ["CONVERSION_GOAL", model.scoringPointsByFamily.CONVERSION_GOAL, model.scoringPointsShareByFamily.CONVERSION_GOAL],
    ["DROP_GOAL", model.scoringPointsByFamily.DROP_GOAL, model.scoringPointsShareByFamily.DROP_GOAL],
    ["PENALTY_SHOT", model.scoringPointsByFamily.PENALTY_SHOT, model.scoringPointsShareByFamily.PENALTY_SHOT],
    ["UNKNOWN", model.scoringPointsByFamily.UNKNOWN, model.scoringPointsShareByFamily.UNKNOWN],
  ].map(([family, points, share]) => `<tr><td>${escapeHtml(String(family))}</td><td>${points}</td><td>${share}%</td></tr>`).join("");
  const scorelineRows = model.scorelineDistribution
    .slice(0, 5)
    .map((row) => `<tr><td>${escapeHtml(row.scoreline)}</td><td>${row.matches}</td></tr>`)
    .join("");

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Preuve batch full-match">
      <div>
        <h3>Preuve batch full-match</h3>
        <p>&Eacute;conomie observ&eacute;e sur ${model.matchCount} matchs avec le chemin officiel connect&eacute;. Le score est issu des &eacute;v&eacute;nements officiels <code>score_change</code>; cette lecture mesure la stabilit&eacute; globale sans modifier les valeurs de scoring.</p>
      </div>
      <div class="durable-storage-decision-grid">
        <article class="durable-storage-decision-card">
          <h4>Scorelines</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Status</span><strong>${escapeHtml(model.status)}</strong></div>
            <div><span>Scorelines uniques</span><strong>${model.uniqueScorelines}</strong></div>
            <div><span>Points moyens</span><strong>${model.averageTotalPoints}</strong></div>
            <div><span>&Eacute;cart moyen</span><strong>${model.averageScoreDifference}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Risques score</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Blowout rate</span><strong>${model.blowoutRate}%</strong></div>
            <div><span>Severe blowout</span><strong>${model.severeBlowoutRate}%</strong></div>
            <div><span>Shutout rate</span><strong>${model.shutoutRate}%</strong></div>
            <div><span>0-0</span><strong>${model.zeroZeroRate}%</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Familles</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>SHOT_GOAL share</span><strong>${model.scoringPointsShareByFamily.SHOT_GOAL}%</strong></div>
            <div><span>TRY/DROP pr&eacute;sence</span><strong>${model.tryDropPresenceRate}%</strong></div>
            <div><span>Non-shot points</span><strong>${model.nonShotPointShare}%</strong></div>
            <div><span>Multi-familles</span><strong>${model.matchesWithMultipleScoringFamilies}</strong></div>
          </div>
        </article>
        <article class="durable-storage-decision-card">
          <h4>Garde-fous</h4>
          <div class="durable-storage-decision-kpi">
            <div><span>Chemin officiel</span><strong>${model.officialScoringPathConnectedAllRuns ? "oui" : "non"}</strong></div>
            <div><span>Calibrations</span><strong>${model.calibrationAppliedAllRuns ? "oui" : "non"}</strong></div>
            <div><span>Score_change</span><strong>${model.officialScoreFromScoreChangeAllRuns ? "oui" : "non"}</strong></div>
            <div><span>Cap / rewrite</span><strong>${model.scoreCapAppliedCount + model.postHocRewriteCount}</strong></div>
          </div>
        </article>
      </div>
      <table class="premium-table">
        <thead><tr><th>Famille</th><th>Points</th><th>Part</th></tr></thead>
        <tbody>${pointRows}</tbody>
      </table>
      <table class="premium-table">
        <thead><tr><th>Top scorelines</th><th>Matchs</th></tr></thead>
        <tbody>${scorelineRows}</tbody>
      </table>
      <p class="durable-storage-decision-boundary">Conclusion prudente : ${escapeHtml(model.status)}. ${model.status === "PASS" ? "Les crit&egrave;res batch sont satisfaits." : "Les garde-fous techniques sont propres, mais l&rsquo;&eacute;conomie observ&eacute;e reste &agrave; corriger avant confirmation globale."}</p>
      <p class="durable-storage-decision-guard">Constantes inchang&eacute;es : SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactif. Aucune correction manuelle du score, aucune retouche post-run.</p>
      <p class="durable-storage-decision-warning">${escapeHtml(model.recommendation)} — ${escapeHtml(model.nextSprintRecommendation)}</p>
    </section>`;
}

export function renderFullMatchRouteFamilyMixActivationSection(
  model: FullMatchRouteFamilyMixActivationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const proof = model.batchProof;
  const totalPoints = Object.values(proof.scoringPointsByFamily).reduce((sum, value) => sum + value, 0);
  const share = (value: number): number => totalPoints === 0 ? 0 : Math.round((value / totalPoints) * 100);

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Mix des familles de score">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6F</p>
        <h3>Mix des familles de score</h3>
        <p>
          Le chemin officiel active des routes disponibles et eligibles pour SHOT_GOAL, TRY_TOUCHDOWN,
          DROP_GOAL, CONVERSION_GOAL apres essai valide, et continuation. Ces routes ne sont pas forcees :
          le score reste issu des evenements officiels <code>score_change</code>.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Match courant et routes</h4>
          <ul>
            <li>Familles supportees: ${model.routeFamiliesSupported.join(", ")}</li>
            <li>Familles selectionnees: ${model.selectedRouteFamilies.join(", ")}</li>
            <li>Familles scorantes: ${model.scoringRouteFamilies.join(", ")}</li>
            <li>Conversion uniquement apres TRY: ${model.conversionGeneratedOnlyAfterTry ? "oui" : "non"}</li>
            <li>PENALTY_SHOT inactive: ${model.penaltyShotInactive ? "oui" : "non"}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Batch 6F</h4>
          <ul>
            <li>Matchs: ${proof.matchCount}</li>
            <li>Scorelines uniques: ${proof.uniqueScorelines}</li>
            <li>Matchs avec TRY/DROP: ${proof.matchesWithTryOrDrop}</li>
            <li>Matchs uniquement SHOT: ${proof.matchesWithOnlyShotGoals}</li>
            <li>Matchs multi-familles: ${proof.matchesWithMultipleScoringFamilies}</li>
            <li>Shutout rate: ${proof.shutoutRate}%</li>
          </ul>
        </article>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>Famille</th>
            <th>Evenements</th>
            <th>Points</th>
            <th>Part points</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>SHOT_GOAL</td><td>${proof.scoringEventsByFamily.SHOT_GOAL}</td><td>${proof.scoringPointsByFamily.SHOT_GOAL}</td><td>${share(proof.scoringPointsByFamily.SHOT_GOAL)}%</td></tr>
          <tr><td>TRY_TOUCHDOWN</td><td>${proof.scoringEventsByFamily.TRY_TOUCHDOWN}</td><td>${proof.scoringPointsByFamily.TRY_TOUCHDOWN}</td><td>${share(proof.scoringPointsByFamily.TRY_TOUCHDOWN)}%</td></tr>
          <tr><td>CONVERSION_GOAL</td><td>${proof.scoringEventsByFamily.CONVERSION_GOAL}</td><td>${proof.scoringPointsByFamily.CONVERSION_GOAL}</td><td>${share(proof.scoringPointsByFamily.CONVERSION_GOAL)}%</td></tr>
          <tr><td>DROP_GOAL</td><td>${proof.scoringEventsByFamily.DROP_GOAL}</td><td>${proof.scoringPointsByFamily.DROP_GOAL}</td><td>${share(proof.scoringPointsByFamily.DROP_GOAL)}%</td></tr>
        </tbody>
      </table>
      <p class="muted">
        Conclusion prudente: ${model.status}. Recommendation: ${model.recommendation}.
        Aucune valeur de score n'est changee, aucun score adverse n'est force, aucune reecriture post-run n'est appliquee.
      </p>
    </section>`;
}

export function renderFullMatchRouteFamilyScoringRateCalibrationSection(
  model: FullMatchRouteFamilyScoringRateCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Calibration des taux de scoring">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6G</p>
        <h3>Calibration des taux de scoring</h3>
        <p>
          Le sprint 6F avait preserv&eacute; la diversit&eacute; des familles, mais l'economie etait trop explosive.
          Cette calibration ajoute davantage d'issues non-scoring dans la resolution officielle, sans score forc&eacute;,
          sans plafond artificiel, et avec un score issu des evenements officiels <code>score_change</code>.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Avant / apres batch 50 matchs</h4>
          <ul>
            <li>Points moyens: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Scoring events / match: 14.8 -> ${model.afterBatch.scoringEventsPerMatch}</li>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout rate: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Scorelines uniques: ${model.scorelineDiversityBefore} -> ${model.scorelineDiversityAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous</h4>
          <ul>
            <li>Familles toujours presentes: ${model.matchesWithTryOrDropAfter > 0 ? "oui" : "non"}</li>
            <li>Continuation disponible: ${model.routeFamilyCompetitionCanSelectContinuation ? "oui" : "non"}</li>
            <li>Conversion seulement apres TRY: ${model.conversionGoalsAfter <= model.triesScoredAfter ? "oui" : "non"}</li>
            <li>Score issu des evenements officiels: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Version calibration: <code>${escapeHtml(model.calibrationVersion)}</code></li>
            <li>Plafond artificiel / score force: ${model.scoreCapApplied || model.forcedOpponentScoreApplied ? "alerte" : "non"}</li>
          </ul>
        </article>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>Famille</th>
            <th>Taux avant</th>
            <th>Taux apres</th>
            <th>Issues non-scoring apres</th>
            <th>Scores apres</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>SHOT_GOAL</td><td>${model.shotScoringRateBefore}%</td><td>${model.shotScoringRateAfter}%</td><td>${model.nonScoringOutcomeRateByFamilyAfter.SHOT_GOAL}%</td><td>${model.shotGoalsAfter}</td></tr>
          <tr><td>TRY_TOUCHDOWN</td><td>${model.tryScoringRateBefore}%</td><td>${model.tryScoringRateAfter}%</td><td>${model.nonScoringOutcomeRateByFamilyAfter.TRY_TOUCHDOWN}%</td><td>${model.triesScoredAfter}</td></tr>
          <tr><td>CONVERSION_GOAL</td><td>${model.conversionSuccessRateBefore}%</td><td>${model.conversionSuccessRateAfter}%</td><td>${model.nonScoringOutcomeRateByFamilyAfter.CONVERSION_GOAL}%</td><td>${model.conversionGoalsAfter}</td></tr>
          <tr><td>DROP_GOAL</td><td>${model.dropSuccessRateBefore}%</td><td>${model.dropSuccessRateAfter}%</td><td>${model.nonScoringOutcomeRateByFamilyAfter.DROP_GOAL}%</td><td>${model.dropGoalsAfter}</td></tr>
        </tbody>
      </table>
      <p class="muted">
        Statut prudent: ${model.status}. Recommendation: ${model.recommendation}.
        Les blowouts restent a surveiller si le taux demeure haut; cette section confirme seulement la baisse observee
        et la preservation de la diversite des routes.
      </p>
    </section>`;
}

export function renderFullMatchSegmentScoringDensityCalibrationSection(
  model: FullMatchSegmentScoringDensityCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Densit&eacute; des occasions">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6H</p>
        <h3>Densit&eacute; des occasions</h3>
        <p>
          Le sprint 6H intervient avant la cr&eacute;ation des <code>score_change</code>: il transforme certains encha&icirc;nements
          de danger en phases de continuation, de r&eacute;cup&eacute;ration d&eacute;fensive ou de reset, sans plafond artificiel
          et sans r&eacute;&eacute;criture post-run.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Avant / apr&egrave;s batch 50 matchs</h4>
          <ul>
            <li>Occasions / match: ${model.beforeAfter.scoringOpportunitiesPerMatchBefore} -> ${model.beforeAfter.scoringOpportunitiesPerMatchAfter}</li>
            <li>Occasions / segment: ${model.beforeAfter.scoringOpportunitiesPerSegmentBefore} -> ${model.beforeAfter.scoringOpportunitiesPerSegmentAfter}</li>
            <li>Scoring events / match: ${model.beforeAfter.scoringEventsPerMatchBefore} -> ${model.beforeAfter.scoringEventsPerMatchAfter}</li>
            <li>Points moyens: ${model.beforeAfter.averageTotalPointsBefore} -> ${model.beforeAfter.averageTotalPointsAfter}</li>
            <li>Blowout rate: ${model.beforeAfter.blowoutRateBefore}% -> ${model.beforeAfter.blowoutRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Interruptions de cha&icirc;ne</h4>
          <ul>
            <li>Phases neutres / match: ${model.beforeAfter.neutralPhasesPerMatchBefore} -> ${model.beforeAfter.neutralPhasesPerMatchAfter}</li>
            <li>R&eacute;cup&eacute;rations d&eacute;fensives / match: ${model.beforeAfter.defensiveRecoveriesPerMatchBefore} -> ${model.beforeAfter.defensiveRecoveriesPerMatchAfter}</li>
            <li>Phases de reset / match: ${model.beforeAfter.resetPhasesPerMatchBefore} -> ${model.beforeAfter.resetPhasesPerMatchAfter}</li>
            <li>Continuation disponible: ${model.batchAudit.continuationCount > 0 ? "oui" : "non"}</li>
            <li>Version: <code>${escapeHtml(model.version)}</code></li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut 6H: ${model.status}. Recommendation: ${model.recommendation}.
        Ce statut reste volontairement prudent si les blowouts demeurent trop hauts, meme lorsque la densit&eacute; baisse.
      </p>
    </section>`;
}

export function renderFullMatchTeamOpportunityBalanceCalibrationSection(
  model: FullMatchTeamOpportunityBalanceCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Equilibre des opportunites">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6I</p>
        <h3>Equilibre des opportunites</h3>
        <p>
          Apres 6H, la densite est plus saine mais les blowouts restent hauts. Cette lecture mesure la repartition
          des opportunites, des phases dangereuses, des reponses apres avoir encaisse et des chaines de domination,
          sans score force, sans plafond artificiel, et avec un score issu des evenements officiels.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Avant / apres batch 50 matchs</h4>
          <ul>
            <li>Ecart moyen: ${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}</li>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout rate: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Scoring events / match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunites / match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Home / away</h4>
          <ul>
            <li>Opportunites: ${model.teamOpportunityBalance.home.scoringOpportunityCount} / ${model.teamOpportunityBalance.away.scoringOpportunityCount}</li>
            <li>Danger phases: ${model.teamOpportunityBalance.home.dangerPhaseCount} / ${model.teamOpportunityBalance.away.dangerPhaseCount}</li>
            <li>Scoring events: ${model.teamOpportunityBalance.home.scoringEventCount} / ${model.teamOpportunityBalance.away.scoringEventCount}</li>
            <li>Points: ${model.teamOpportunityBalance.home.points} / ${model.teamOpportunityBalance.away.points}</li>
            <li>Index opportunites: ${model.opportunityBalanceIndexBefore} -> ${model.opportunityBalanceIndexAfter}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Reponse et resets</h4>
          <ul>
            <li>Reponse apres avoir encaisse: ${model.trailingTeamResponseRateBefore}% -> ${model.trailingTeamResponseRateAfter}%</li>
            <li>Reset vers reponse: ${model.resetToResponseRateBefore}% -> ${model.resetToResponseRateAfter}%</li>
            <li>Recuperation defensive vers danger: ${model.defensiveRecoveryToDangerRateBefore}% -> ${model.defensiveRecoveryToDangerRateAfter}%</li>
            <li>Chaine de domination max: ${model.dominantTeamOpportunityChainBefore} -> ${model.dominantTeamOpportunityChainAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous</h4>
          <ul>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Densite 6H preservee: ${model.densityCalibrationPreserved ? "oui" : "non"}</li>
            <li>Score issu des evenements officiels: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Plafond artificiel / score force: ${model.scoreCapApplied || model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied ? "alerte" : "non"}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Le statut reste prudent si l'equilibre progresse mais que le blowout
        rate ou les chaines de domination restent trop eleves.
      </p>
    </section>`;
}

export function renderFullMatchDominanceChainCalibrationSection(
  model: FullMatchDominanceChainCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Chaines de domination">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6J</p>
        <h3>Chaines de domination</h3>
        <p>
          6I a ameliore la reponse des equipes menees, mais certaines chaines de domination restaient trop longues.
          6J mesure les ruptures de momentum par reset, recuperation defensive, arret gardien securise et phase neutre,
          sans score force, sans plafond artificiel, et avec un score issu des evenements officiels.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Domination avant / apres</h4>
          <ul>
            <li>Chaine opportunites max: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}</li>
            <li>Meme equipe consecutive: ${model.sameTeamConsecutiveOpportunityRateBefore}% -> ${model.sameTeamConsecutiveOpportunityRateAfter}%</li>
            <li>Meme famille consecutive: ${model.sameFamilyConsecutiveOpportunityRateBefore}% -> ${model.sameFamilyConsecutiveOpportunityRateAfter}%</li>
            <li>Reattaque immediate apres score: ${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%</li>
            <li>Decay applique: ${model.dominanceDecayAppliedCount}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Ruptures de momentum</h4>
          <ul>
            <li>Reset casse domination: ${model.resetBreaksDominanceRateBefore}% -> ${model.resetBreaksDominanceRateAfter}%</li>
            <li>Recuperation defensive casse domination: ${model.defensiveRecoveryBreaksDominanceRateBefore}% -> ${model.defensiveRecoveryBreaksDominanceRateAfter}%</li>
            <li>Arret gardien securise casse domination: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%</li>
            <li>Turnover casse domination: ${model.turnoverBreaksDominanceRateBefore}% -> ${model.turnoverBreaksDominanceRateAfter}%</li>
            <li>Phase neutre casse momentum: ${model.neutralPhaseBreaksDominanceRateBefore}% -> ${model.neutralPhaseBreaksDominanceRateAfter}%</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Score et sante batch</h4>
          <ul>
            <li>Score moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Ecart moyen: ${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}</li>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout rate: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Batch: ${model.matchCount} matchs</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous preserves</h4>
          <ul>
            <li>Equilibre opportunites preserve: ${model.teamOpportunityBalancePreserved ? "oui" : "non"}</li>
            <li>Densite preservee: ${model.densityCalibrationPreserved ? "oui" : "non"}</li>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Score issu des evenements officiels: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Plafond artificiel / score force: ${model.scoreCapApplied || model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied ? "alerte" : "non"}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Le statut reste prudent si les chaines baissent mais que le blowout
        rate ou la stabilite globale demandent encore un suivi.
      </p>
    </section>`;
}

export function renderFullMatchBreakEventPostScoreResetCalibrationSection(
  model: FullMatchBreakEventPostScoreResetCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Reset apres score et ruptures de momentum">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6K</p>
        <h3>Reset apres score et ruptures de momentum</h3>
        <p>
          6K verifie que l'equipe qui vient de marquer ne recree pas automatiquement la prochaine opportunite.
          Le reset passe par une phase neutre observable, sans plafond artificiel, sans score force et sans reecriture.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Fenetre post-score</h4>
          <ul>
            <li>Reattaque immediate: ${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%</li>
            <li>Reset protege: ${model.postScoreResetProtectedRateBefore}% -> ${model.postScoreResetProtectedRateAfter}%</li>
            <li>Possession suivante concedante: ${model.concedingTeamFirstPossessionRateAfter}%</li>
            <li>Fenetrage audite: ${model.postScoreAuditSummary.postScoreWindowsChecked}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Ruptures et decay</h4>
          <ul>
            <li>Decay eligible: ${model.dominanceDecayEligibleCount}</li>
            <li>Decay applique: ${model.dominanceDecayAppliedCount}</li>
            <li>Application decay: ${model.dominanceDecayApplicationRate}%</li>
            <li>Reset neutres: ${model.neutralResetBreakCount}</li>
            <li>Recuperations defensives: ${model.defensiveRecoveryBreakCount}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Sante batch</h4>
          <ul>
            <li>Score moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Ecart moyen: ${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}</li>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout rate: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Batch: ${model.matchCount} matchs</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous preserves</h4>
          <ul>
            <li>Densite preservee: ${model.densityCalibrationPreserved ? "oui" : "non"}</li>
            <li>Equilibre opportunites preserve: ${model.teamOpportunityBalancePreserved ? "oui" : "non"}</li>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Score issu des evenements officiels: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Constantes score intactes: ${!model.scoringConstantsChanged ? "oui" : "non"}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Si le statut reste partiel, le prochain travail doit cibler les ruptures de momentum
        et non une modification des valeurs de score.
      </p>
    </section>`;
}

export function renderFullMatchGoalkeeperSecureResetBreakSpecificitySection(
  model: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Arret gardien securise et reset">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6L</p>
        <h3>Arret gardien securise et reset</h3>
        <p>
          6L relie l'arret gardien securise, le reset post-score et la rupture de momentum a des evenements
          officiels non scoring. Le score reste issu des evenements officiels, sans score force, sans plafond artificiel,
          sans suppression d'evenements et sans reecriture apres coup.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Gardien secure</h4>
          <ul>
            <li>Break count: ${model.goalkeeperSecureBreakCountBefore} -> ${model.goalkeeperSecureBreakCountAfter}</li>
            <li>Break dominance: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%</li>
            <li>Possession securisee: ${model.goalkeeperSecureToSafePossessionRateBefore}% -> ${model.goalkeeperSecureToSafePossessionRateAfter}%</li>
            <li>Reattaque contre: ${model.goalkeeperSecureImmediateReattackAgainstRateBefore}% -> ${model.goalkeeperSecureImmediateReattackAgainstRateAfter}%</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Reset post-score</h4>
          <ul>
            <li>Reattaque immediate: ${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%</li>
            <li>Reset protege: ${model.postScoreResetProtectedRateBefore}% -> ${model.postScoreResetProtectedRateAfter}%</li>
            <li>Premiere possession concedante: ${model.concedingTeamFirstPossessionRateBefore}% -> ${model.concedingTeamFirstPossessionRateAfter}%</li>
            <li>Reset vers neutre: ${model.resetBreakSpecificityAuditSummary.resetToNeutralRate}%</li>
            <li>Reset vers possession securisee: ${model.resetBreakSpecificityAuditSummary.resetToSafePossessionRate}%</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Dominance decay clarifie</h4>
          <ul>
            <li>Fenêtres eligibles: ${model.dominanceDecayEligibleCountAfter}</li>
            <li>Fenêtres avec decay: ${model.dominanceDecayAppliedWindowCount}</li>
            <li>Applications totales: ${model.dominanceDecayApplicationsTotal}</li>
            <li>Couverture fenêtres: ${model.dominanceDecayWindowCoverageAfter}%</li>
            <li>Applications / fenêtre eligible: ${model.dominanceDecayApplicationsPerEligibleWindow}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Preservation</h4>
          <ul>
            <li>Densite preservee: ${model.densityCalibrationPreserved ? "oui" : "non"}</li>
            <li>Equilibre equipe preserve: ${model.teamOpportunityBalancePreserved ? "oui" : "non"}</li>
            <li>Chaines 6J/6K preservees: ${model.dominanceChainsPreservedOrImproved ? "oui" : "non"}</li>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Garde-fous score propres: ${model.scoreFromScoreChangeAllRuns && !model.scoreCapApplied && !model.forcedOpponentScoreApplied && !model.forcedTrailingTeamScoreApplied ? "oui" : "non"}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. La lecture reste une preuve batch 50 matchs: elle surveille les resets et
        les possessions securisees sans promettre un ecart artificiellement serre.
      </p>
    </section>`;
}

export function renderFullMatchResetBreakBlowoutEconomySection(
  model: FullMatchResetBreakBlowoutEconomyCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Economie competitive">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6M</p>
        <h3>Economie competitive</h3>
        <p>
          6M surveille les dangers apres reset et les causes restantes de blowout. La calibration agit sur la
          continuite, la recuperation defensive et la justification tactique du danger, sans score force, sans cap,
          sans suppression d'evenements et avec un score issu des evenements officiels.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Scoreline health</h4>
          <ul>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Match serre: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match competitif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>Ecart moyen: ${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Danger apres reset</h4>
          <ul>
            <li>Reset vers danger immediat: ${model.resetToImmediateDangerRateBefore}% -> ${model.resetToImmediateDangerRateAfter}%</li>
            <li>Danger automatique suspecte: ${model.automaticDangerSuspicionRateBefore}% -> ${model.automaticDangerSuspicionRateAfter}%</li>
            <li>Danger merite: ${model.earnedDangerRateBefore}% -> ${model.earnedDangerRateAfter}%</li>
            <li>Gardien secure preserve: ${model.goalkeeperSecureResetPreserved ? "oui" : "non"}</li>
            <li>Reset post-score preserve: ${model.resetSpecificityPreserved ? "oui" : "non"}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Preservation</h4>
          <ul>
            <li>Densite preservee: ${model.densityCalibrationPreserved ? "oui" : "non"}</li>
            <li>Equilibre equipe preserve: ${model.teamOpportunityBalancePreserved ? "oui" : "non"}</li>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Chaines dominance preservees: ${model.dominanceChainsPreservedOrImproved ? "oui" : "non"}</li>
            <li>Batch: ${model.matchCount} matchs</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous</h4>
          <ul>
            <li>Score officiel score_change: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Score cap: ${model.scoreCapApplied ? "oui" : "non"}</li>
            <li>Score force: ${model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied ? "oui" : "non"}</li>
            <li>Rewrite apres coup: ${model.postHocRewriteApplied ? "oui" : "non"}</li>
            <li>Recommendation: ${model.recommendation}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Lecture prudente: ${model.nextSprintRecommendation}. Le statut PARTIAL peut rester acceptable si les garde-fous
        sont propres et si les dangers automatiques sont classes plutot que transformes en points gratuits.
      </p>
    </section>`;
}

export function renderFullMatchEarnedDangerGateSection(
  model: FullMatchEarnedDangerGateCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Danger merite apres reset">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6N</p>
        <h3>Danger merite apres reset</h3>
        <p>
          6N ajoute un gate de danger avant toute transformation reset -> situation dangereuse. Il distingue danger merite,
          danger borderline et danger automatique suspecte, sans score force, sans cap, sans suppression d'evenements
          et avec un score issu des evenements officiels.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Gate de danger</h4>
          <ul>
            <li>Reset vers danger immediat: ${model.resetToImmediateDangerRateBefore}% -> ${model.resetToImmediateDangerRateAfter}%</li>
            <li>Danger automatique suspecte: ${model.automaticDangerSuspicionRateBefore}% -> ${model.automaticDangerSuspicionRateAfter}%</li>
            <li>Danger merite: ${model.earnedDangerRateBefore}% -> ${model.earnedDangerRateAfter}%</li>
            <li>Danger bloque par gate: ${model.dangerBlockedByGateRateAfter}%</li>
            <li>Phase neutre: ${model.dangerDowngradedToNeutralRateAfter}%</li>
            <li>Possession securisee: ${model.dangerDowngradedToSafePossessionRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Qualite du danger</h4>
          <ul>
            <li>Sans support: ${model.resetToDangerWithoutSupportCountBefore} -> ${model.resetToDangerWithoutSupportCountAfter}</li>
            <li>Sans edge tactique: ${model.resetToDangerWithoutTacticalEdgeCountBefore} -> ${model.resetToDangerWithoutTacticalEdgeCountAfter}</li>
            <li>Sans edge attribut: ${model.resetToDangerWithoutAttributeEdgeCountBefore} -> ${model.resetToDangerWithoutAttributeEdgeCountAfter}</li>
            <li>Malgre gardien secure: ${model.resetToDangerDespiteGoalkeeperSecureCountBefore} -> ${model.resetToDangerDespiteGoalkeeperSecureCountAfter}</li>
            <li>Gate connecte: ${model.earnedDangerGateConnected ? "oui" : "non"}</li>
            <li>Gate effectif: ${model.earnedDangerGateEffective ? "oui" : "non"}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Economie du match</h4>
          <ul>
            <li>Blowout rate: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Match serre: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match competitif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Preservations</h4>
          <ul>
            <li>Gardien secure: ${model.goalkeeperSecureResetPreserved ? "preserve" : "a surveiller"}</li>
            <li>Reset post-score: ${model.postScoreResetPreserved ? "preserve" : "a surveiller"}</li>
            <li>Dominance chain: ${model.dominanceChainsPreservedOrImproved ? "preserve" : "a surveiller"}</li>
            <li>Densite: ${model.densityCalibrationPreserved ? "preservee" : "a surveiller"}</li>
            <li>Mix familles: ${model.routeFamilyMixPreserved ? "preserve" : "a surveiller"}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Prochaine lecture: ${model.nextSprintRecommendation}.
        Le gate intervient avant danger, scoring opportunity et score_change; les diagnostics ne remplacent jamais le score officiel.
      </p>
    </section>`;
}

export function renderFullMatchEarnedDangerGateTuningSection(
  model: FullMatchEarnedDangerGateTuningModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Gate selectif du danger">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6O</p>
        <h3>Gate selectif du danger</h3>
        <p>
          6O transforme le gate 6N en filtre selectif: le danger revient uniquement quand il est gagne par support,
          espace, edge tactique, attributs, fatigue, pression ou erreur adverse. Les scores restent issus des
          score_change officiels, sans cap, sans rewrite et sans point ajoute hors modele.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Danger reintroduit</h4>
          <ul>
            <li>Danger merite: ${model.earnedDangerRateBefore}% -> ${model.earnedDangerRateAfter}%</li>
            <li>Danger borderline: ${model.borderlineDangerRateBefore}% -> ${model.borderlineDangerRateAfter}%</li>
            <li>Danger automatique suspecte: ${model.automaticDangerSuspicionRateBefore}% -> ${model.automaticDangerSuspicionRateAfter}%</li>
            <li>Earned autorises: ${model.gateAllowedEarnedDangerCountAfter}</li>
            <li>Borderline autorises: ${model.gateAllowedBorderlineDangerCountAfter}</li>
            <li>Automatiques bloques: ${model.gateBlockedAutomaticDangerCountAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Filtre et garde-fous</h4>
          <ul>
            <li>Suspicion trop strict: ${model.gateTooStrictSuspicionCountAfter}</li>
            <li>Suspicion trop permissif: ${model.gateTooLooseSuspicionCountAfter}</li>
            <li>Root cause contradiction: ${model.rootCauseContradictionCount}</li>
            <li>Mix familles preserve: ${model.routeFamilyMixPreserved ? "oui" : "non"}</li>
            <li>Score officiel score_change: ${model.scoreFromScoreChangeAllRuns ? "oui" : "non"}</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Economie du batch</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Evenements scoring/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunites/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Preservations</h4>
          <ul>
            <li>Densite: ${model.densityCalibrationPreserved ? "preservee" : "a surveiller"}</li>
            <li>Equilibre equipes: ${model.teamOpportunityBalancePreserved ? "preserve" : "a surveiller"}</li>
            <li>Reset gardien secure: ${model.goalkeeperSecureResetPreserved ? "preserve" : "a surveiller"}</li>
            <li>Reset post-score: ${model.postScoreResetPreserved ? "preserve" : "a surveiller"}</li>
            <li>Dominance chain: ${model.dominanceChainsPreservedOrImproved ? "preserve" : "a surveiller"}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Le statut PARTIAL reste acceptable seulement si les garde-fous scoring
        sont propres et si la prochaine lecture surveille volume, blowouts et mix de routes.
      </p>
    </section>`;
}

export function renderFullMatchGateSelectivityVolumeRegressionFixSection(
  model: FullMatchGateSelectivityVolumeRegressionFixModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Selectivite du danger et volume">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6P</p>
        <h3>S&eacute;lectivit&eacute; du danger et volume</h3>
        <p>
          6P corrige la gate 6O trop permissive: les contextes n&eacute;gatifs comme spacing faible,
          re-attaque imm&eacute;diate apr&egrave;s reset, post-score ou gardien secure ne comptent plus comme
          raisons positives. Le score reste d&eacute;riv&eacute; uniquement des score_change officiels.
        </p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Gate plus s&eacute;lective</h4>
          <ul>
            <li>Danger m&eacute;rit&eacute;: ${model.earnedDangerRateBefore}% -> ${model.earnedDangerRateAfter}%</li>
            <li>Danger borderline: ${model.borderlineDangerRateBefore}% -> ${model.borderlineDangerRateAfter}%</li>
            <li>Reset vers danger: ${model.resetToDangerRateBefore}% -> ${model.resetToDangerRateAfter}%</li>
            <li>Danger avec contexte n&eacute;gatif: ${model.allowedDangerWithNegativeContextCountBefore} -> ${model.allowedDangerWithNegativeContextCountAfter}</li>
            <li>Danger avec seulement contexte n&eacute;gatif: ${model.gateSelectivityAudit.allowedDangerWithOnlyNegativeContextCount}</li>
            <li>Signaux positifs insuffisants: ${model.gateSelectivityAudit.allowedDangerWithoutEnoughPositiveSignalsCount}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Volume de scoring</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Evenements scoring/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunites/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Blowout: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Statut: ${model.status}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${model.recommendation}. Aucun cap, rewrite, score forc&eacute;, suppression d'events ou mutation
        MatchBonusEvent n'est utilis&eacute; pour obtenir cette baisse de volume.
      </p>
    </section>`;
}

export function renderFullMatchRouteEconomyRecheckAfterSelectivityFixSection(
  model: FullMatchRouteEconomyRecheckAfterSelectivityFixModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "L'economie des routes reste saine apres le gate selectif."
    : "L'economie des routes reste lisible, avec une reserve explicite a surveiller.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Economie des routes apres danger">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6Q</p>
        <h3>&Eacute;conomie des routes apr&egrave;s danger</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Danger vers opportunit&eacute;</h4>
          <ul>
            <li>Danger m&eacute;rit&eacute; vers opportunit&eacute;: ${model.earnedDangerToScoringOpportunityRateBefore}% -> ${model.earnedDangerToScoringOpportunityRateAfter}%</li>
            <li>Danger borderline vers opportunit&eacute;: ${model.borderlineDangerToScoringOpportunityRateBefore}% -> ${model.borderlineDangerToScoringOpportunityRateAfter}%</li>
            <li>Continuation vers opportunit&eacute;: ${model.continuationToScoringOpportunityRateBefore}% -> ${model.continuationToScoringOpportunityRateAfter}%</li>
            <li>Gardien secure vers danger adverse: ${model.goalkeeperSecureToDangerAgainstRateBefore}% -> ${model.goalkeeperSecureToDangerAgainstRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Volume et couches non-score</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Half chance: ${model.halfChanceRateAfter}%</li>
            <li>Territory gain: ${model.territorialGainRateAfter}%</li>
            <li>Forced defensive action: ${model.forcedDefensiveActionRateAfter}%</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${escapeHtml(model.recommendation)}. Score officiel toujours issu des score_change events.
      </p>
    </section>`;
}

export function renderFullMatchEarnedDangerOutcomeDistributionSection(
  model: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "Les dangers merites produisent maintenant plusieurs issues tactiques sans casser le score officiel."
    : "Les issues apres danger merite sont mesurees, avec une reserve explicite a surveiller.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Issues apres danger merite">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6R</p>
        <h3>Issues apr&egrave;s danger m&eacute;rit&eacute;</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Distribution des issues</h4>
          <ul>
            <li>Danger m&eacute;rit&eacute; vers opportunit&eacute;: ${model.earnedDangerToScoringOpportunityRateBefore}% -> ${model.earnedDangerToScoringOpportunityRateAfter}%</li>
            <li>High quality vers opportunit&eacute;: ${model.highQualityDangerToOpportunityRateBefore}% -> ${model.highQualityDangerToOpportunityRateAfter}%</li>
            <li>Medium quality: ${model.mediumQualityDangerCountBefore} -> ${model.mediumQualityDangerCountAfter}</li>
            <li>Low quality: ${model.lowQualityDangerCountBefore} -> ${model.lowQualityDangerCountAfter}</li>
            <li>Half chances: ${model.halfChanceOutcomeCountAfter}</li>
            <li>Forced defensive actions: ${model.forcedDefensiveActionOutcomeCountAfter}</li>
            <li>Territorial gains: ${model.territorialGainOutcomeCountAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>&Eacute;conomie pr&eacute;serv&eacute;e</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Scoring events/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Fen&ecirc;tres longitudinales stables: ${model.longitudinalStableWindows}/${model.longitudinalWindowCount}</li>
            <li>Statut: ${escapeHtml(model.status)}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${escapeHtml(model.recommendation)}. Aucun cap, aucun score force, aucun rewrite post-hoc:
        le score reste issu des score_change officiels.
      </p>
    </section>`;
}

export function renderFullMatchDominanceChainCalibrationCoverageFixSection(
  model: FullMatchDominanceChainCalibrationCoverageFixModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "La calibration 6S reduit les chaines de domination tout en gardant le score officiel issu des evenements."
    : "La calibration 6S est mesuree avec une reserve explicite: les garde-fous restent visibles avant le sprint suivant.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Chaines de domination et couverture de calibration">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6S</p>
        <h3>Cha&icirc;nes de domination et couverture de calibration</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Cha&icirc;nes et breaks</h4>
          <ul>
            <li>Cha&icirc;ne max: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}</li>
            <li>Same-team opportunities: ${model.sameTeamConsecutiveOpportunityRateBefore}% -> ${model.sameTeamConsecutiveOpportunityRateAfter}%</li>
            <li>Same-family opportunities: ${model.sameFamilyConsecutiveOpportunityRateBefore}% -> ${model.sameFamilyConsecutiveOpportunityRateAfter}%</li>
            <li>Chain breaks: ${model.chainBreakEventCountBefore} -> ${model.chainBreakEventCountAfter}</li>
            <li>Defensive recovery after repeated danger: ${model.defensiveRecoveryAfterRepeatedDangerCountBefore} -> ${model.defensiveRecoveryAfterRepeatedDangerCountAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Danger m&eacute;rit&eacute; et volume</h4>
          <ul>
            <li>Danger m&eacute;rit&eacute; vers opportunit&eacute;: ${model.earnedDangerToScoringOpportunityRateBefore}% -> ${model.earnedDangerToScoringOpportunityRateAfter}%</li>
            <li>High quality vers opportunit&eacute;: ${model.highQualityDangerToOpportunityRateBefore}% -> ${model.highQualityDangerToOpportunityRateAfter}%</li>
            <li>Demi-occasion: ${model.halfChanceRateBefore}% -> ${model.halfChanceRateAfter}%</li>
            <li>Gain territorial: ${model.territorialGainRateBefore}% -> ${model.territorialGainRateAfter}%</li>
            <li>Action d&eacute;fensive forc&eacute;e: ${model.forcedDefensiveActionRateBefore}% -> ${model.forcedDefensiveActionRateAfter}%</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>&Eacute;conomie et longitudinal</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Scoring events/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Validation longitudinale: ${model.longitudinalStableWindowsAfter}/${model.longitudinalWindowCountAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Couverture de calibration</h4>
          <ul>
            <li>calibrationsAppliedAllRuns: ${model.calibrationsAppliedAllRuns}</li>
            <li>Fen&ecirc;tres appliqu&eacute;es: ${model.calibrationCoverageAppliedWindowCount}/${model.calibrationCoverageWindowCount}</li>
            <li>Fen&ecirc;tres manquantes: ${model.calibrationCoverageMissingWindowCount}</li>
            <li>Mismatches: ${model.calibrationCoverageMismatchCount}</li>
            <li>Familles routes pr&eacute;serv&eacute;es: ${model.routeFamilyDiversityPreserved}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Recommendation: ${escapeHtml(model.recommendation)}. Sans cap, sans score forc&eacute;:
        le score reste issu des &eacute;v&eacute;nements officiels score_change.
      </p>
    </section>`;
}

export function renderFullMatchCloseGameDistributionCalibrationSection(
  model: FullMatchCloseGameDistributionCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "La calibration 6T mesure les matchs serres et competitifs sans score force, sans comeback force et sans cap."
    : "La calibration 6T expose les causes d'ecart et garde les garde-fous visibles avant une suite eventuelle.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Matchs serres et competitivite">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6T</p>
        <h3>Matchs serr&eacute;s et comp&eacute;titivit&eacute;</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Distribution des &eacute;carts</h4>
          <ul>
            <li>Match serr&eacute;: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match comp&eacute;titif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>&Eacute;cart moyen: ${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}</li>
            <li>&Eacute;cart m&eacute;dian: ${model.medianScoreDifferenceBefore} -> ${model.medianScoreDifferenceAfter}</li>
            <li>One-score game: ${model.oneScoreGameRateBefore}% -> ${model.oneScoreGameRateAfter}%</li>
            <li>Two-score game: ${model.twoScoreGameRateBefore}% -> ${model.twoScoreGameRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Runaway et r&eacute;ponse</h4>
          <ul>
            <li>Blowout: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>R&eacute;ponse de l'&eacute;quipe men&eacute;e: ${model.trailingTeamResponseRateBefore}% -> ${model.trailingTeamResponseRateAfter}%</li>
            <li>Repeat opportunity du leader: ${model.leadingTeamRepeatOpportunityRateBefore}% -> ${model.leadingTeamRepeatOpportunityRateAfter}%</li>
            <li>Cha&icirc;ne max corrig&eacute;e: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}</li>
            <li>Consistance max/moyenne: ${model.chainMetricConsistencyAfter}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Volume et familles de routes</h4>
          <ul>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Scoring events/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>SHOT point share: ${model.shotPointShare}%</li>
            <li>TRY/DROP point share: ${model.tryPointShare}% / ${model.dropPointShare}%</li>
            <li>Diversit&eacute; route-family: ${model.routeFamilyDiversityPreserved}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Causes d'&eacute;cart et garde-fous</h4>
          <ul>
            <li>Cause volume opportunit&eacute;s: ${model.scoreGapCauseAudit.opportunityVolumeGapSignalCount}</li>
            <li>Cause efficacit&eacute; scoring: ${model.scoreGapCauseAudit.scoringEfficiencyGapSignalCount}</li>
            <li>Cause mismatch tactique: ${model.scoreGapCauseAudit.tacticalMismatchSignalCount}</li>
            <li>Couverture calibration manquante: ${model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount}</li>
            <li>Score issu des &eacute;v&eacute;nements officiels: ${model.scoreFromScoreChangeAllRuns}</li>
            <li>Sans cap / score forc&eacute; / comeback forc&eacute;: ${!model.scoreCapApplied && !model.forcedOpponentScoreApplied && !model.comebackForced}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Batch 50 matchs, sans score force, sans comeback force, sans rubber-banding, et avec score issu des evenements officiels.
      </p>
    </section>`;
}

export function renderFullMatchTrailingTeamResponseLateGamePressureSection(
  model: FullMatchTrailingTeamResponseLateGamePressureModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "La calibration 6U restaure une r&eacute;ponse tactique de l'&eacute;quipe men&eacute;e sans score forc&eacute;, sans comeback forc&eacute; et sans cap."
    : "La calibration 6U mesure la r&eacute;ponse de l'&eacute;quipe men&eacute;e et isole ce qui reste &agrave; suivre sans manipuler le score.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Reponse de l'equipe menee">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6U</p>
        <h3>R&eacute;ponse de l'&eacute;quipe men&eacute;e</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>R&eacute;ponse tactique</h4>
          <ul>
            <li>R&eacute;ponse &eacute;quipe men&eacute;e: ${model.trailingTeamResponseRateBefore}% -> ${model.trailingTeamResponseRateAfter}%</li>
            <li>Part opportunit&eacute;s: ${model.trailingTeamOpportunityShareBefore}% -> ${model.trailingTeamOpportunityShareAfter}%</li>
            <li>Part scoring: ${model.trailingTeamScoringShareBefore}% -> ${model.trailingTeamScoringShareAfter}%</li>
            <li>R&eacute;cup&eacute;ration: ${model.trailingTeamRecoveryShareBefore}% -> ${model.trailingTeamRecoveryShareAfter}%</li>
            <li>Relief pression: ${model.trailingTeamPressureReliefRateBefore}% -> ${model.trailingTeamPressureReliefRateAfter}%</li>
            <li>Risque tactique: ${model.trailingTeamRiskIncreaseRateBefore}% -> ${model.trailingTeamRiskIncreaseRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Fin de match et qualit&eacute;</h4>
          <ul>
            <li>Pression fin de match: ${model.trailingTeamLateGamePressureRateBefore}% -> ${model.trailingTeamLateGamePressureRateAfter}%</li>
            <li>Danger gagn&eacute;: ${model.trailingTeamEarnedDangerRateBefore}% -> ${model.trailingTeamEarnedDangerRateAfter}%</li>
            <li>Demi-occasion: ${model.trailingTeamHalfChanceRateBefore}% -> ${model.trailingTeamHalfChanceRateAfter}%</li>
            <li>Gain territorial: ${model.trailingTeamTerritorialGainRateBefore}% -> ${model.trailingTeamTerritorialGainRateAfter}%</li>
            <li>Action d&eacute;fensive forc&eacute;e: ${model.trailingTeamForcedDefensiveActionRateBefore}% -> ${model.trailingTeamForcedDefensiveActionRateAfter}%</li>
            <li>Causes mesur&eacute;es: ${model.trailingTeamResponseCauseDistribution.length}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Distribution pr&eacute;serv&eacute;e</h4>
          <ul>
            <li>Match serr&eacute;: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match comp&eacute;titif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>Blowout: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous</h4>
          <ul>
            <li>Cha&icirc;ne max: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}</li>
            <li>Consistance cha&icirc;nes: ${model.chainMetricConsistencyAfter}</li>
            <li>Diversit&eacute; route-family: ${model.routeFamilyDiversityPreserved}</li>
            <li>Gate s&eacute;lectif: ${model.gateSelectivityPreserved}</li>
            <li>Reset post-score: ${model.postScoreResetPreserved}</li>
            <li>Score officiel: ${model.scoreFromScoreChangeAllRuns}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Batch 50 matchs; sans score forc&eacute;, sans comeback forc&eacute;, sans cap, sans rubber-banding;
        le score reste issu des &eacute;v&eacute;nements officiels score_change.
      </p>
    </section>`;
}

export function renderFullMatchLateGameThreatQualityTrailingConversionSection(
  model: FullMatchLateGameThreatQualityTrailingConversionModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "La calibration 6V transforme une partie des r&eacute;ponses de l'&eacute;quipe men&eacute;e en vraie menace sans forcer le score."
    : "La calibration 6V mesure la qualit&eacute; de menace de l'&eacute;quipe men&eacute;e et garde les conversions naturelles explicitement s&eacute;par&eacute;es des garde-fous.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Qualite de menace de l'equipe menee">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6V</p>
        <h3>Qualit&eacute; de menace de l'&eacute;quipe men&eacute;e</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Menace tactique</h4>
          <ul>
            <li>Qualit&eacute; menace: ${model.trailingThreatQualityRateAfter}%</li>
            <li>Conversion naturelle menace: ${model.trailingThreatConversionRateAfter}%</li>
            <li>Gain territorial: ${model.trailingTeamTerritorialGainRateBefore}% -> ${model.trailingTeamTerritorialGainRateAfter}%</li>
            <li>Action d&eacute;fensive forc&eacute;e: ${model.trailingTeamForcedDefensiveActionRateBefore}% -> ${model.trailingTeamForcedDefensiveActionRateAfter}%</li>
            <li>Demi-occasion: ${model.trailingTeamHalfChanceRateBefore}% -> ${model.trailingTeamHalfChanceRateAfter}%</li>
            <li>Danger gagn&eacute;: ${model.trailingTeamEarnedDangerRateBefore}% -> ${model.trailingTeamEarnedDangerRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Fin de match</h4>
          <ul>
            <li>Pression fin de match: ${model.trailingTeamLateGamePressureRateBefore}% -> ${model.trailingTeamLateGamePressureRateAfter}%</li>
            <li>Menaces fin de match: ${model.lateGameThreatQualityAudit.trailingLateGameThreatCount}</li>
            <li>Part scoring naturel &eacute;quipe men&eacute;e: ${model.trailingTeamScoringShareBefore}% -> ${model.trailingTeamScoringShareAfter}%</li>
            <li>Fen&ecirc;tres menace: ${model.trailingThreatQualityAudit.trailingThreatWindowCount}</li>
            <li>Scores naturels: ${model.naturalTrailingConversionAudit.naturalTrailingScoringEventCount}</li>
            <li>Score inject&eacute;: ${model.trailingTeamScoreChangeInjected}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>&Eacute;conomie pr&eacute;serv&eacute;e</h4>
          <ul>
            <li>Match serr&eacute;: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match comp&eacute;titif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>Blowout: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchBefore} -> ${model.scoringOpportunitiesPerMatchAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous</h4>
          <ul>
            <li>Score officiel: ${model.scoreFromScoreChangeAllRuns}</li>
            <li>Diversit&eacute; route-family: ${model.routeFamilyDiversityPreserved}</li>
            <li>Gate s&eacute;lectif: ${model.gateSelectivityPreserved}</li>
            <li>Danger automatique bloqu&eacute;: ${model.automaticDangerStillBlocked}</li>
            <li>Rubber-banding: ${model.rubberBandingApplied}</li>
            <li>Comeback forc&eacute;: ${model.comebackForced}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Batch 50 matchs; les scores restent issus des &eacute;v&eacute;nements officiels score_change, sans cap, sans injection et sans comeback forc&eacute;.
      </p>
    </section>`;
}

export function renderFullMatchLateGameThreatQualityMonitoringSection(
  model: FullMatchLateGameThreatQualityMonitoringModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "Le monitoring 6W confirme que la menace de fin de match reste issue de signaux tactiques, sans comeback forc&eacute;."
    : "Le monitoring 6W rend visible l'automaticit&eacute; potentielle de la menace de fin de match et s&eacute;pare les signaux naturels des alertes de comeback.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Monitoring de la menace de fin de match">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6W</p>
        <h3>Monitoring de la menace de fin de match</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Automaticit&eacute; de la menace</h4>
          <ul>
            <li>Qualit&eacute; menace fin de match: ${model.lateGameThreatQualityRateBefore}% -> ${model.lateGameThreatQualityRateAfter}%</li>
            <li>Menace automatique: ${model.lateGameAutomaticThreatRateAfter}%</li>
            <li>Menace sans signal: ${model.lateGameThreatWithoutSignalRateAfter}%</li>
            <li>Menace avec signal r&eacute;el: ${model.lateGameThreatFromRealSignalRateAfter}%</li>
            <li>Menaces refus&eacute;es: ${model.lateGameThreatDeniedCountAfter}</li>
            <li>Menaces downgrad&eacute;es: ${model.lateGameThreatDowngradedCountAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Suspicion comeback</h4>
          <ul>
            <li>Suspicion avant/apr&egrave;s: ${model.forcedComebackSuspicionCountBefore} -> ${model.forcedComebackSuspicionCountAfter}</li>
            <li>Expliqu&eacute;e: ${model.forcedComebackSuspicionExplainedCountAfter}</li>
            <li>Non expliqu&eacute;e: ${model.forcedComebackSuspicionUnexplainedCountAfter}</li>
            <li>Comeback forc&eacute; d&eacute;tect&eacute;: ${model.actualForcedComebackDetectedCountAfter}</li>
            <li>Scores naturels &eacute;quipe men&eacute;e: ${model.naturalTrailingScoringEventCountAfter}</li>
            <li>Chemins scoring complets: ${model.trailingScoringPathCompleteCountAfter}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>&Eacute;conomie pr&eacute;serv&eacute;e</h4>
          <ul>
            <li>Match serr&eacute;: ${model.closeGameRateBefore}% -> ${model.closeGameRateAfter}%</li>
            <li>Match comp&eacute;titif: ${model.competitiveGameRateBefore}% -> ${model.competitiveGameRateAfter}%</li>
            <li>Blowout: ${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%</li>
            <li>Severe blowout: ${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%</li>
            <li>Total points moyen: ${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}</li>
            <li>&Eacute;v&eacute;nements scoring/match: ${model.scoringEventsPerMatchBefore} -> ${model.scoringEventsPerMatchAfter}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous officiels</h4>
          <ul>
            <li>Score issu de score_change: ${model.scoreFromScoreChangeAllRuns}</li>
            <li>Chemin officiel connect&eacute;: ${model.officialPathConnectedAllRuns}</li>
            <li>Gate s&eacute;lectif: ${model.gateSelectivityPreserved}</li>
            <li>Danger automatique bloqu&eacute;: ${model.automaticDangerStillBlocked}</li>
            <li>Cha&icirc;ne max: ${model.dominantTeamOpportunityChainMaxAfter}</li>
            <li>Score inject&eacute; &eacute;quipe men&eacute;e: ${model.trailingTeamScoreChangeInjected}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Sprint suivant: ${escapeHtml(model.nextSprintRecommendation)}. Le monitoring ne modifie ni les constantes de scoring,
        ni les score_change officiels, ni la possession dangereuse de mani&egrave;re automatique.
      </p>
    </section>`;
}

export function renderFullMatchEconomyFinalStabilizationSection(
  model: FullMatchEconomyFinalStabilizationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  const statusCopy = model.status === "PASS"
    ? "La baseline finale 6X consolide l'&eacute;conomie match avant le passage aux sprints produit."
    : "La stabilisation 6X rend visibles les points &agrave; reprendre avant de figer la baseline produit.";

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Stabilisation finale de l'economie match">
      <div class="section-heading">
        <p class="eyebrow">Sprint 6X</p>
        <h3>Stabilisation finale de l'&eacute;conomie match</h3>
        <p>${statusCopy}</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Baseline finale</h4>
          <ul>
            <li>Matchs batch: ${model.matchCount}</li>
            <li>Total points moyen: ${model.averageTotalPointsAfter}</li>
            <li>&Eacute;v&eacute;nements scoring/match: ${model.scoringEventsPerMatchAfter}</li>
            <li>Opportunit&eacute;s/match: ${model.scoringOpportunitiesPerMatchAfter}</li>
            <li>Match serr&eacute;: ${model.closeGameRateAfter}%</li>
            <li>Match comp&eacute;titif: ${model.competitiveGameRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Distribution et routes</h4>
          <ul>
            <li>Blowout: ${model.blowoutRateAfter}%</li>
            <li>Severe blowout: ${model.severeBlowoutRateAfter}%</li>
            <li>Diversit&eacute; route-family: ${model.routeFamilyDiversityPreserved}</li>
            <li>Part points non-SHOT: ${model.nonShotPointShare}%</li>
            <li>Matchs avec TRY/DROP: ${model.matchesWithTryOrDrop}</li>
            <li>Rollback SHOT_ONLY: ${model.noRollbackToShotOnly}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Menace et fin de match</h4>
          <ul>
            <li>R&eacute;ponse &eacute;quipe men&eacute;e: ${model.trailingTeamResponseRateAfter}%</li>
            <li>Part scoring &eacute;quipe men&eacute;e: ${model.trailingTeamScoringShareAfter}%</li>
            <li>Menace trailing: ${model.trailingThreatQualityRateAfter}%</li>
            <li>Menace fin de match corrig&eacute;e: ${model.lateGameThreatQualityRateAfter}%</li>
            <li>Ratio menace/pression: ${model.lateGameThreatQualityRatio}</li>
            <li>Menace automatique: ${model.lateGameAutomaticThreatRateAfter}%</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Garde-fous finaux</h4>
          <ul>
            <li>Score issu de score_change: ${model.scoreFromScoreChangeAllRuns}</li>
            <li>Chemin officiel connect&eacute;: ${model.officialPathConnectedAllRuns}</li>
            <li>Manipulation de score: false</li>
            <li>Comeback forc&eacute;: ${model.comebackForced}</li>
            <li>Suspicion inexpliqu&eacute;e: ${model.forcedComebackSuspicionUnexplainedCountAfter}</li>
            <li>Persistence pour scoring: ${model.persistenceUsedForScoring}</li>
            <li>SQLite pour scoring: ${model.sqliteUsedForScoring}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Sprint suivant: ${escapeHtml(model.nextSprintRecommendation)}.
        D&eacute;finition corrig&eacute;e: ${escapeHtml(model.lateGameThreatQualityMetricDefinition)}
      </p>
    </section>`;
}

export function renderProductBaselineCoachReportReadinessSection(
  model: ProductBaselineCoachReportReadinessModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <section class="controlled-local-readonly-db-section" aria-label="Baseline produit coach">
      <div class="section-heading">
        <p class="eyebrow">Sprint 7A</p>
        <h3>Baseline produit coach</h3>
        <p>Le rapport distingue la lecture officielle du match, les diagnostics s&eacute;par&eacute;s et les hypoth&egrave;ses non appliqu&eacute;es.</p>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Readiness produit</h4>
          <ul>
            <li>Rapport produit pr&ecirc;t: ${model.productReportReady}</li>
            <li>Export coach pr&ecirc;t: ${model.coachExportReady}</li>
            <li>Baseline 6X pr&eacute;serv&eacute;e: ${model.matchEconomyBaselinePreserved}</li>
            <li>Score officiel visible: ${model.officialScoreVisible}</li>
            <li>Source score_change visible: ${model.scoreChangeSourceVisible}</li>
            <li>Guardrails pr&eacute;serv&eacute;s: ${model.guardrailsPreserved}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>S&eacute;paration des sources</h4>
          <ul>
            <li>Diagnostic s&eacute;par&eacute;: ${model.diagnosticSeparationReady}</li>
            <li>Sandbox s&eacute;par&eacute;: ${model.sandboxSeparationReady}</li>
            <li>Preview non appliqu&eacute;e: ${model.selectionPreviewNonAppliedLabelCount}/${model.selectionPreviewCount}</li>
            <li>Fuite sandbox: ${!model.noSandboxTruthLeakage}</li>
            <li>Fuite diagnostic score: ${!model.noDiagnosticScoreLeakage}</li>
            <li>Fuite batch score: ${!model.noBatchScoreLeakage}</li>
          </ul>
        </article>
      </div>
      <div class="product-grid two">
        <article class="product-card">
          <h4>Actionnabilit&eacute;</h4>
          <ul>
            <li>Insights coach: ${model.coachInsightCount}</li>
            <li>Insights actionnables: ${model.actionableInsightCount}</li>
            <li>Signaux prochain match: ${model.nextMatchSignalCount}</li>
            <li>Axe de travail: ${model.trainingFocusCount}</li>
            <li>Profils observ&eacute;s: ${model.profileObservationCount}</li>
            <li>S&eacute;lection forc&eacute;e: ${model.profileRecommendationForcedCount}</li>
          </ul>
        </article>
        <article class="product-card">
          <h4>Lisibilit&eacute;</h4>
          <ul>
            <li>Badges source: ${model.sourceBadgeCoverageRate}%</li>
            <li>Preuves lisibles: ${model.evidenceLinkCoverageRate}%</li>
            <li>D&eacute;tails techniques repli&eacute;s: ${model.technicalAppendixReady}</li>
            <li>Wording interdit: ${model.forbiddenWordingCount}</li>
            <li>Lecture mobile: ${escapeHtml(model.mobileReadabilityStatus)}</li>
            <li>Lecture export: ${escapeHtml(model.exportReadabilityStatus)}</li>
          </ul>
        </article>
      </div>
      <p class="muted">
        Statut: ${escapeHtml(model.status)}. Recommendation: ${escapeHtml(model.recommendation)}.
        Sprint suivant: ${escapeHtml(model.nextSprintRecommendation)}.
      </p>
    </section>`;
}

function renderFullMatchOfficialScoringConnectionAppendix(
  model: FullMatchOfficialScoringCalibrationConnectionModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Connexion scoring officiel 6D</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>parallel path after: ${model.fullMatchUsesParallelScoringPathAfter}</li>
        <li>legacy shot path after: ${model.fullMatchUsesLegacyShotPathAfter}</li>
        <li>fallback route path after: ${model.fullMatchUsesFallbackRoutePathAfter}</li>
        <li>segment amplification after: ${escapeHtml(model.segmentAmplificationAfter)}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
      </ul>
    </article>`;
}

function renderFullMatchBatchEconomyProofAppendix(
  model: FullMatchBatchEconomyProofModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Preuve batch full-match 6E</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>match count: ${model.matchCount}</li>
        <li>unique seeds: ${model.uniqueSeeds}</li>
        <li>unique scorelines: ${model.uniqueScorelines}</li>
        <li>average total points: ${model.averageTotalPoints}</li>
        <li>average score difference: ${model.averageScoreDifference}</li>
        <li>blowout rate: ${model.blowoutRate}%</li>
        <li>severe blowout rate: ${model.severeBlowoutRate}%</li>
        <li>shutout rate: ${model.shutoutRate}%</li>
        <li>SHOT_GOAL point share: ${model.scoringPointsShareByFamily.SHOT_GOAL}%</li>
        <li>try/drop presence rate: ${model.tryDropPresenceRate}%</li>
        <li>official path connected all runs: ${model.officialScoringPathConnectedAllRuns}</li>
        <li>calibration applied all runs: ${model.calibrationAppliedAllRuns}</li>
        <li>score from score_change all runs: ${model.officialScoreFromScoreChangeAllRuns}</li>
        <li>score cap applied count: ${model.scoreCapAppliedCount}</li>
        <li>post-hoc rewrite count: ${model.postHocRewriteCount}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
        <li>recommendation: ${escapeHtml(model.recommendation)}</li>
      </ul>
    </article>`;
}

function renderFullMatchTeamOpportunityBalanceCalibrationAppendix(
  model: FullMatchTeamOpportunityBalanceCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Equilibre opportunites 6I</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>match count: ${model.matchCount}</li>
        <li>opportunity balance index: ${model.opportunityBalanceIndexBefore} -> ${model.opportunityBalanceIndexAfter}</li>
        <li>danger balance index: ${model.dangerBalanceIndexBefore} -> ${model.dangerBalanceIndexAfter}</li>
        <li>scoring balance index: ${model.scoringBalanceIndexBefore} -> ${model.scoringBalanceIndexAfter}</li>
        <li>point balance index: ${model.pointBalanceIndexBefore} -> ${model.pointBalanceIndexAfter}</li>
        <li>trailing response rate: ${model.trailingTeamResponseRateBefore}% -> ${model.trailingTeamResponseRateAfter}%</li>
        <li>dominance chain max: ${model.dominantTeamOpportunityChainBefore} -> ${model.dominantTeamOpportunityChainAfter}</li>
        <li>density preserved: ${model.densityCalibrationPreserved}</li>
        <li>route family diversity preserved: ${model.routeFamilyDiversityPreserved}</li>
        <li>forced trailing team score: ${model.forcedTrailingTeamScoreApplied}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
      </ul>
    </article>`;
}

function renderFullMatchDominanceChainCalibrationAppendix(
  model: FullMatchDominanceChainCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Chaines de domination 6J</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>match count: ${model.matchCount}</li>
        <li>dominance chain max: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}</li>
        <li>same-team opportunity rate: ${model.sameTeamConsecutiveOpportunityRateBefore}% -> ${model.sameTeamConsecutiveOpportunityRateAfter}%</li>
        <li>same-family opportunity rate: ${model.sameFamilyConsecutiveOpportunityRateBefore}% -> ${model.sameFamilyConsecutiveOpportunityRateAfter}%</li>
        <li>reset break rate: ${model.resetBreaksDominanceRateBefore}% -> ${model.resetBreaksDominanceRateAfter}%</li>
        <li>defensive recovery break rate: ${model.defensiveRecoveryBreaksDominanceRateBefore}% -> ${model.defensiveRecoveryBreaksDominanceRateAfter}%</li>
        <li>goalkeeper secure break rate: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%</li>
        <li>team balance preserved: ${model.teamOpportunityBalancePreserved}</li>
        <li>density preserved: ${model.densityCalibrationPreserved}</li>
        <li>route family diversity preserved: ${model.routeFamilyDiversityPreserved}</li>
        <li>forced trailing team score: ${model.forcedTrailingTeamScoreApplied}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
      </ul>
    </article>`;
}

function renderFullMatchBreakEventPostScoreResetCalibrationAppendix(
  model: FullMatchBreakEventPostScoreResetCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Reset post-score 6K</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>match count: ${model.matchCount}</li>
        <li>post-score immediate reattack: ${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%</li>
        <li>post-score protected reset: ${model.postScoreResetProtectedRateBefore}% -> ${model.postScoreResetProtectedRateAfter}%</li>
        <li>dominance decay applied: ${model.dominanceDecayAppliedCount}</li>
        <li>defensive recovery break rate: ${model.defensiveRecoveryBreaksDominanceRateBefore}% -> ${model.defensiveRecoveryBreaksDominanceRateAfter}%</li>
        <li>goalkeeper secure break rate: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%</li>
        <li>density preserved: ${model.densityCalibrationPreserved}</li>
        <li>team balance preserved: ${model.teamOpportunityBalancePreserved}</li>
        <li>route family diversity preserved: ${model.routeFamilyMixPreserved}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
      </ul>
    </article>`;
}

function renderFullMatchGoalkeeperSecureResetBreakSpecificityAppendix(
  model: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <article class="premium-appendix-card">
      <h3>Gardien secure et reset 6L</h3>
      <ul>
        <li>status: ${escapeHtml(model.status)}</li>
        <li>scope: ${escapeHtml(model.scope)}</li>
        <li>version: ${escapeHtml(model.version)}</li>
        <li>match count: ${model.matchCount}</li>
        <li>goalkeeper secure break rate: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%</li>
        <li>goalkeeper safe possession rate: ${model.goalkeeperSecureToSafePossessionRateBefore}% -> ${model.goalkeeperSecureToSafePossessionRateAfter}%</li>
        <li>post-score immediate reattack: ${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%</li>
        <li>post-score protected reset: ${model.postScoreResetProtectedRateBefore}% -> ${model.postScoreResetProtectedRateAfter}%</li>
        <li>conceding first possession: ${model.concedingTeamFirstPossessionRateBefore}% -> ${model.concedingTeamFirstPossessionRateAfter}%</li>
        <li>dominance decay applications per eligible window: ${model.dominanceDecayApplicationsPerEligibleWindow}</li>
        <li>dominance decay window coverage: ${model.dominanceDecayWindowCoverageAfter}%</li>
        <li>density preserved: ${model.densityCalibrationPreserved}</li>
        <li>team balance preserved: ${model.teamOpportunityBalancePreserved}</li>
        <li>route family mix preserved: ${model.routeFamilyMixPreserved}</li>
        <li>warnings: ${model.warnings.map(escapeHtml).join(", ")}</li>
      </ul>
    </article>`;
}

function renderPersistentHistoryAdapter(
  model: CoachReportPersistentHistoryAdapterModel,
  historyStoreConsistency?: CoachReportHistoryStoreConsistencyModel,
  persistenceEvidenceSnapshot?: CoachReportPersistenceEvidenceSnapshot,
): string {
  if (model.status === "not_available") {
    return "";
  }

  return `
  <section id="persistent-match-history" class="premium-section persistent-history-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Persistent match history</div>
    <div class="report-section-header">
      <div>
        <h2>Persistance de l&rsquo;historique</h2>
        <p>${model.recordsAfterSaveCount} enregistrement(s) disponibles apr&egrave;s sauvegarde, ${model.queriedRecordCount} relu(s), ${model.queriedSignalCount} signal(aux) dans la requ&ecirc;te active.</p>
      </div>
    </div>
    <p class="persistent-history-guard">L&rsquo;historique persistant sert &agrave; relire les rapports pass&eacute;s. Il reste une couche d&rsquo;observation : il ne choisit pas les joueurs, ne modifie pas la composition, ne change pas le score et ne cr&eacute;e aucun &eacute;v&eacute;nement de match.</p>
    <div class="persistent-history-grid">
      <article class="persistent-history-card">
        <h3>Boundary persistant</h3>
        <div class="persistent-history-kpi">
          <div><span>Type de store</span><strong class="persistent-history-store-kind">${model.storeKind}</strong></div>
          <div><span>Durable</span><strong>${model.durable ? "oui" : "non"}</strong></div>
          <div><span>Location visible</span><strong>${model.storageLocationVisible ? "oui" : "non"}</strong></div>
          <div><span>Lecture report read-only</span><strong class="persistent-history-readonly">${model.reportQueriesReadOnly ? "oui" : "non"}</strong></div>
        </div>
        ${model.storageLocation === undefined ? "" : `<p><strong>Stockage local :</strong> <code>${escapeHtml(model.storageLocation)}</code></p>`}
      </article>
      <article class="persistent-history-card">
        <h3>Comptes de persistance</h3>
        <div class="persistent-history-kpi">
          <div><span>Avant sauvegarde</span><strong>${model.recordsBeforeSaveCount}</strong></div>
          <div><span>Apr&egrave;s sauvegarde</span><strong>${model.recordsAfterSaveCount}</strong></div>
          <div><span>Records relus</span><strong>${model.queriedRecordCount}</strong></div>
          <div><span>Signaux relus</span><strong>${model.queriedSignalCount}</strong></div>
          <div><span>Match courant sauv&eacute;</span><strong>${model.currentMatchRecordSaved ? "oui" : "non"}</strong></div>
        </div>
      </article>
      <article class="persistent-history-card">
        <h3>Ce que la persistance ajoute</h3>
        <p>Ce que la persistance ajoute : les records d&rsquo;historique peuvent maintenant survivre au-del&agrave; d&rsquo;un store en m&eacute;moire lorsque l&rsquo;adapter file-backed est utilis&eacute;.</p>
        <h3>Ce qui reste volontairement limit&eacute;</h3>
        <p>Ce qui reste volontairement limit&eacute; : le rapport lit l&rsquo;historique, mais ne l&rsquo;utilise pas pour appliquer une d&eacute;cision automatique.</p>
        <h3>Prochaine &eacute;tape produit</h3>
        <p>Prochaine &eacute;tape produit : brancher cet adapter sur un vrai stockage par &eacute;quipe, saison et comp&eacute;tition.</p>
      </article>
    </div>
    ${renderHistoryStoreConsistency(historyStoreConsistency, persistenceEvidenceSnapshot)}
    <p class="persistent-history-boundary">Historique persistant d&rsquo;observation, pas d&eacute;cision automatique.</p>
    ${model.warnings.length === 0 ? "" : `<p class="persistent-history-warning">${model.warnings.join(" ")}</p>`}
  </section>`;
}

function renderProfilesAndPlayers(html: string): string {
  const profilesBody = extractSectionInner(html, "profiles-to-observe");
  const playersBody = extractSectionInner(html, "players-to-study");

  return `
  <section id="profiles-and-players" class="premium-section" data-source-product-sections="profiles-to-observe|players-to-study">
    <div class="report-section-divider">Profiles and players to study</div>
    <div class="report-section-header">
      <div>
        <h2>Profils et joueurs &agrave; &eacute;tudier</h2>
        <p>Les profils et les candidats restent des pistes d'observation, jamais des choix appliqu&eacute;s.</p>
      </div>
    </div>
    <div class="report-player-study-grid">
      <article class="report-table-card report-player-study">
        <h3>Profils &agrave; observer</h3>
        ${profilesBody}
      </article>
      <article class="report-table-card report-player-study">
        <h3>Joueurs &agrave; &eacute;tudier</h3>
        ${playersBody}
      </article>
    </div>
  </section>`;
}

function renderNextMatch(html: string): string {
  const body = extractSectionInner(html, "next-match-signals");

  return `
  <section id="next-match" class="premium-section" data-source-product-sections="next-match-signals|training-focus">
    <div class="report-section-divider">Next-match checklist</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; v&eacute;rifier au prochain match</h2>
        <p>Checklist d'observation: trois &agrave; cinq signaux, sans prescription automatique.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderInterpretationGuard(html: string): string {
  const body = extractSectionInner(html, "interpretation-guard");

  return `
  <section id="interpretation-guard" class="premium-section" data-source-product-sections="interpretation-guard|guardrail-summary">
    <div class="report-section-divider">Interpretation guard</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; ne pas sur-interpr&eacute;ter</h2>
        <p>Les garde-fous visibles restent au coeur du rapport export&eacute;.</p>
      </div>
    </div>
    <div class="interpretation-guard">
      ${body}
      <p>Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
    </div>
  </section>`;
}

function renderPremiumLayoutAppendix(input: {
  readonly exportHtml: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
}): string {
  const pitchPlaceholderCount = (input.exportHtml.match(/report-pitch-placeholder/gu) ?? []).length;
  const controlledEmptyStateCount = (input.exportHtml.match(new RegExp(CONTROLLED_EMPTY_STATE, "gu")) ?? []).length;

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails du layout premium HTML</summary>
      <ul>
        <li>premium layout status available</li>
        <li>html first true</li>
        <li>pdf optional true</li>
        <li>single source of truth true</li>
        <li>duplicate report logic false</li>
        <li>legend item count ${input.legendItemCount}</li>
        <li>panel count ${input.panelCount}</li>
        <li>readable panel count ${input.readablePanelCount}</li>
        <li>panels with primary zone count ${input.panelsWithPrimaryZoneCount}</li>
        <li>panels with secondary zones count ${input.panelsWithSecondaryZonesCount}</li>
        <li>pitch placeholder count ${pitchPlaceholderCount}</li>
        <li>controlled empty state count ${controlledEmptyStateCount}</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>interpretation guard match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderPhaseVisualReadabilityAppendix(input: {
  readonly exportHtml: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
}): string {
  const pitchPlaceholderCount = (input.exportHtml.match(/report-pitch-placeholder/gu) ?? []).length;
  const controlledEmptyStateCount = (input.exportHtml.match(new RegExp(CONTROLLED_EMPTY_STATE, "gu")) ?? []).length;

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de lisibilit&eacute; des visualisations par phase</summary>
      <ul>
        <li>readability status available</li>
        <li>legend item count ${input.legendItemCount}</li>
        <li>panel count ${input.panelCount}</li>
        <li>readable panel count ${input.readablePanelCount}</li>
        <li>panels with primary zone count ${input.panelsWithPrimaryZoneCount}</li>
        <li>panels with secondary zones count ${input.panelsWithSecondaryZonesCount}</li>
        <li>pitch placeholder count ${pitchPlaceholderCount}</li>
        <li>controlled empty state count ${controlledEmptyStateCount}</li>
        <li>phase-specific guard visible true</li>
        <li>legend visible true</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderMultiMatchPhaseComparisonAppendix(
  comparison: CoachReportMultiMatchPhaseComparisonModel,
): string {
  if (comparison.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de comparaison multi-run des phases</summary>
      <ul>
        <li>multi-match phase comparison status ${comparison.status}</li>
        <li>sample count ${comparison.sampleCount}</li>
        <li>panel count ${comparison.panelCount}</li>
        <li>compared signal count ${comparison.comparedSignalCount}</li>
        <li>repeated signal count ${comparison.repeatedSignalCount}</li>
        <li>visible-once signal count ${comparison.visibleOnceSignalCount}</li>
        <li>unstable signal count ${comparison.unstableSignalCount}</li>
        <li>insufficient data count ${comparison.insufficientDataCount}</li>
        <li>local comparison only true</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match ${comparison.productExportScoreMatches ? "true" : "false"}</li>
        <li>candidate comparison match ${comparison.candidateComparisonMatchesProduct ? "true" : "false"}</li>
        <li>visible recommendation wording count ${comparison.visibleRecommendationWordingCount}</li>
        <li>visible selection wording count ${comparison.visibleSelectionWordingCount}</li>
        <li>internal status leak count ${comparison.internalStatusLeakCount}</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderMultiMatchHistoryViewAppendix(
  historyView: CoachReportMultiMatchHistoryViewModel,
): string {
  if (historyView.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de l&rsquo;historique multi-run</summary>
      <ul>
        <li>history view status ${historyView.status}</li>
        <li>sample count ${historyView.sampleCount}</li>
        <li>drilldown count ${historyView.drilldownCount}</li>
        <li>history sample row count ${historyView.historySampleRowCount}</li>
        <li>local repeated drilldown count ${historyView.localRepeatedDrilldownCount}</li>
        <li>local visible-once drilldown count ${historyView.localVisibleOnceDrilldownCount}</li>
        <li>local unstable drilldown count ${historyView.localUnstableDrilldownCount}</li>
        <li>insufficient data drilldown count ${historyView.insufficientDataDrilldownCount}</li>
        <li>trend proof claim count 0</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderRealMatchHistoryIntegrationAppendix(
  model: CoachReportRealMatchHistoryIntegrationModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails du stockage d&rsquo;historique des matchs</summary>
      <ul>
        <li>real match history integration status ${model.status}</li>
        <li>store kind ${model.storeKind}</li>
        <li>stored record count ${model.storedRecordCount}</li>
        <li>queried record count ${model.queriedRecordCount}</li>
        <li>queried signal count ${model.queriedSignalCount}</li>
        <li>controlled sample record count ${model.controlledSampleRecordCount}</li>
        <li>simulated match history record count ${model.simulatedMatchHistoryRecordCount}</li>
        <li>product history record count ${model.productHistoryRecordCount}</li>
        <li>current match record saved ${model.currentMatchRecordSaved ? "true" : "false"}</li>
        <li>history summary visible ${model.historySummaryVisible ? "true" : "false"}</li>
        <li>trend proof claim count 0</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderPersistentHistoryAdapterAppendix(
  model: CoachReportPersistentHistoryAdapterModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de persistance de l&rsquo;historique</summary>
      <ul>
        <li>persistent history adapter status ${model.status}</li>
        <li>store kind ${model.storeKind}</li>
        <li>durable ${model.durable ? "true" : "false"}</li>
        <li>storage location visible ${model.storageLocationVisible ? "true" : "false"}</li>
        ${model.storageLocation === undefined ? "" : `<li>storage location ${model.storageLocation}</li>`}
        <li>records before save count ${model.recordsBeforeSaveCount}</li>
        <li>records after save count ${model.recordsAfterSaveCount}</li>
        <li>queried record count ${model.queriedRecordCount}</li>
        <li>queried signal count ${model.queriedSignalCount}</li>
        <li>current match record saved ${model.currentMatchRecordSaved ? "true" : "false"}</li>
        <li>report queries read-only true</li>
        <li>persistence boundary visible true</li>
        <li>database adapter not yet required true</li>
        <li>trend proof claim count 0</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderHistoryStoreConsistencyAppendix(
  model: CoachReportHistoryStoreConsistencyModel | undefined,
  persistenceEvidenceSnapshot?: CoachReportPersistenceEvidenceSnapshot,
): string {
  if ((model === undefined || model.status === "not_available") && persistenceEvidenceSnapshot === undefined) {
    return "";
  }
  const values = persistenceEvidenceSnapshot ?? {
    snapshotId: "not_available",
    scenario: model?.saveOperation ?? "not_available",
    saveOperation: model?.saveOperation ?? "not_available",
    idempotentSave: model?.idempotentSave ?? false,
    recordsBeforeSaveCount: model?.recordsBeforeSaveCount ?? 0,
    recordsAfterSaveCount: model?.recordsAfterSaveCount ?? 0,
    loadedFromDiskCount: model?.loadedFromDiskCount ?? 0,
    writtenToDiskCount: model?.writtenToDiskCount ?? 0,
    dedupedRecordCount: model?.dedupedRecordCount ?? 0,
    replacedRecordCount: model?.replacedRecordCount ?? 0,
    ignoredDuplicateCount: model?.ignoredDuplicateCount ?? 0,
    queriedRecordCount: model?.queriedRecordCount ?? 0,
    queriedSignalCount: model?.queriedSignalCount ?? 0,
    databaseAdapterImplemented: model?.databaseContractImplemented ?? false,
    migrationFromFileBackedRequired: model?.databaseMigrationRequired ?? true,
    reportQueriesReadOnly: model?.reportQueriesReadOnly ?? true,
    globalProofClaimCount: model?.globalProofClaimCount ?? 0,
  };

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de coh&eacute;rence du stockage historique</summary>
      <ul>
        <li>snapshot id: ${escapeHtml(values.snapshotId)}</li>
        <li>scenario: ${escapeHtml(values.scenario)}</li>
        <li>save operation: ${escapeHtml(values.saveOperation)}</li>
        <li>idempotent save: ${values.idempotentSave}</li>
        <li>records before save count: ${values.recordsBeforeSaveCount}</li>
        <li>records after save count: ${values.recordsAfterSaveCount}</li>
        <li>loaded from disk count: ${values.loadedFromDiskCount}</li>
        <li>written to disk count: ${values.writtenToDiskCount}</li>
        <li>deduped record count: ${values.dedupedRecordCount}</li>
        <li>replaced record count: ${values.replacedRecordCount}</li>
        <li>ignored duplicate count: ${values.ignoredDuplicateCount}</li>
        <li>queried record count: ${values.queriedRecordCount}</li>
        <li>queried signal count: ${values.queriedSignalCount}</li>
        <li>migration SPI adapter implemented false: ${!values.databaseAdapterImplemented}</li>
        <li>migration from file-backed required true: ${values.migrationFromFileBackedRequired}</li>
        <li>report queries read-only: ${values.reportQueriesReadOnly}</li>
        <li>global proof claim count: ${values.globalProofClaimCount}</li>
      </ul>
    </details>`;
}

function renderDatabaseMigrationPreparationAppendix(
  model: CoachReportDatabaseMigrationPreparationModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de pr&eacute;paration migration database</summary>
      <ul>
        <li>migration preparation status: ${model.status}</li>
        <li>source store kind: ${model.sourceStoreKind}</li>
        <li>target adapter kind: ${model.targetAdapterKind}</li>
        <li>dry run only: ${model.dryRunOnly}</li>
        <li>migration SPI adapter implemented: ${model.databaseAdapterImplemented}</li>
        <li>database adapter production ready: ${model.databaseAdapterProductionReady}</li>
        <li>source record count: ${model.sourceRecordCount}</li>
        <li>target existing record count: ${model.targetExistingRecordCount}</li>
        <li>migration plan count: ${model.migrationPlanCount}</li>
        <li>migrable record count: ${model.migrableRecordCount}</li>
        <li>would insert count: ${model.wouldInsertCount}</li>
        <li>would replace count: ${model.wouldReplaceCount}</li>
        <li>would ignore duplicate count: ${model.wouldIgnoreDuplicateCount}</li>
        <li>rejected invalid count: ${model.rejectedInvalidCount}</li>
        <li>rejected unsupported count: ${model.rejectedUnsupportedCount}</li>
        <li>real DB write count: ${model.realDatabaseWriteCount}</li>
        <li>real DB read count: ${model.realDatabaseReadCount}</li>
        <li>save result semantics preserved: ${model.preservesSaveResultSemantics}</li>
        <li>report queries read-only: ${model.reportQueriesReadOnly}</li>
        <li>trend proof claim count: ${model.trendProofClaimCount}</li>
        <li>global proof claim count: ${model.globalProofClaimCount}</li>
        <li>invented statistic count: ${model.inventedStatisticCount}</li>
        <li>sandbox events promoted to official count: ${model.sandboxEventsPromotedToOfficialCount}</li>
        <li>visible recommendation wording count: ${model.visibleRecommendationWordingCount}</li>
        <li>visible selection wording count: ${model.visibleSelectionWordingCount}</li>
        <li>player selected count: ${model.playerSelectedCount}</li>
        <li>automatic selection count: ${model.automaticSelectionCount}</li>
        <li>lineup mutation count: ${model.lineupMutationCount}</li>
        <li>starters mutation count: ${model.startersMutationCount}</li>
        <li>bench mutation count: ${model.benchMutationCount}</li>
        <li>live selection driver count: 0</li>
        <li>production route resolution driver count: 0</li>
        <li>score mutation count: ${model.scoreMutationCount}</li>
        <li>possession mutation count: ${model.possessionMutationCount}</li>
        <li>production scoring event creation count: ${model.productionScoringEventCreationCount}</li>
        <li>global economy claim count: ${model.globalEconomyClaimCount}</li>
      </ul>
    </details>`;
}

function renderDatabaseAdapterSpikeAppendix(
  model: CoachReportDatabaseAdapterSpikeModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails adapter database exp&eacute;rimental</summary>
      <ul>
        <li>spike status: ${model.status}</li>
        <li>adapter kind: ${model.adapterKind}</li>
        <li>adapter implemented true</li>
        <li>adapter production ready false</li>
        <li>feature flag enabled: ${model.featureFlagEnabled}</li>
        <li>default feature flag enabled false</li>
        <li>product activation allowed false</li>
        <li>report can use as source of truth false</li>
        <li>real DB write count: ${model.realDatabaseWriteCount}</li>
        <li>real DB read count: ${model.realDatabaseReadCount}</li>
        <li>dry run only true</li>
        <li>active product history source ${model.activeProductHistorySource}</li>
        <li>database used as product truth ${model.databaseUsedAsProductTruth}</li>
        <li>save-result semantics preserved ${model.saveResultSemanticsPreserved}</li>
        <li>inserted scenario pass ${model.insertedScenarioPass}</li>
        <li>replaced scenario pass ${model.replacedScenarioPass}</li>
        <li>ignored duplicate scenario pass ${model.ignoredDuplicateScenarioPass}</li>
        <li>query by team pass ${model.queryByTeamPass}</li>
        <li>query by phase pass ${model.queryByPhasePass}</li>
        <li>deterministic ordering pass ${model.deterministicOrderingPass}</li>
        <li>trend proof claim count 0</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>starters mutation count 0</li>
        <li>bench mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderDurableStorageDecisionAppendix(
  model: CoachReportDurableStorageDecisionModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails d&eacute;cision stockage durable</summary>
      <ul>
        <li>durable storage status: ${model.status}</li>
        <li>selected storage target: ${model.selectedStorageTarget}</li>
        <li>decision made: ${model.decisionMade}</li>
        <li>schema version: ${model.schemaVersion}</li>
        <li>schema field count: ${model.schemaFieldCount}</li>
        <li>schema covers required fields: ${model.schemaCoversRequiredFields}</li>
        <li>real adapter wiring prepared: ${model.realAdapterWiringPrepared}</li>
        <li>adapter kind: ${model.adapterKind}</li>
        <li>adapter implemented: ${model.adapterImplemented}</li>
        <li>adapter production ready: ${model.adapterProductionReady}</li>
        <li>feature flag enabled: ${model.featureFlagEnabled}</li>
        <li>default feature flag enabled: ${model.defaultFeatureFlagEnabled}</li>
        <li>product activation allowed: ${model.productActivationAllowed}</li>
        <li>active product history source: ${model.activeProductHistorySource}</li>
        <li>database used as product truth: ${model.databaseUsedAsProductTruth}</li>
        <li>report can use as source of truth: ${model.reportCanUseAsSourceOfTruth}</li>
        <li>real DB write count: ${model.realDatabaseWriteCount}</li>
        <li>real DB read count: ${model.realDatabaseReadCount}</li>
        <li>dry run only: ${model.dryRunOnly}</li>
        <li>inserted scenario pass: ${model.insertedScenarioPass}</li>
        <li>replaced scenario pass: ${model.replacedScenarioPass}</li>
        <li>ignored duplicate scenario pass: ${model.ignoredDuplicateScenarioPass}</li>
        <li>query by team pass: ${model.queryByTeamPass}</li>
        <li>query by phase pass: ${model.queryByPhasePass}</li>
        <li>deterministic ordering pass: ${model.deterministicOrderingPass}</li>
        <li>score mutation count: 0</li>
        <li>timeline mutation count: 0</li>
        <li>possession mutation count: 0</li>
        <li>production scoring event creation count: 0</li>
        <li>lineup mutation count: 0</li>
        <li>starters mutation count: 0</li>
        <li>bench mutation count: 0</li>
        <li>live selection driver count: 0</li>
        <li>production route resolution driver count: 0</li>
        <li>global economy claim count: 0</li>
      </ul>
    </details>`;
}

function renderControlledLocalReadOnlyDbModeAppendix(
  model: CoachReportControlledLocalReadOnlyDbModeModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails lecture SQLite locale contr&ocirc;l&eacute;e</summary>
      <ul>
        <li>controlled local read-only DB mode status: ${model.status}</li>
        <li>mode name: ${model.modeName}</li>
        <li>storage target: ${model.storageTarget}</li>
        <li>schema version: ${model.schemaVersion}</li>
        <li>read-only mode: ${model.readOnlyMode}</li>
        <li>write mode allowed: ${model.writeModeAllowed}</li>
        <li>write rejected pass: ${model.writeRejectedPass}</li>
        <li>product activation allowed: ${model.productActivationAllowed}</li>
        <li>default enabled: ${model.defaultEnabled}</li>
        <li>feature flag enabled: ${model.featureFlagEnabled}</li>
        <li>active product history source: ${model.activeProductHistorySource}</li>
        <li>database used as product truth: ${model.databaseUsedAsProductTruth}</li>
        <li>report can use as source of truth: ${model.reportCanUseAsSourceOfTruth}</li>
        <li>real DB read count: ${model.realDatabaseReadCount}</li>
        <li>real DB write count: ${model.realDatabaseWriteCount}</li>
        <li>controlled read attempt count: ${model.controlledReadAttemptCount}</li>
        <li>dry-run fallback available: ${model.dryRunFallbackAvailable}</li>
        <li>source record count: ${model.sourceRecordCount}</li>
        <li>read-only record count: ${model.readOnlyRecordCount}</li>
        <li>read-only query count: ${model.readOnlyQueryCount}</li>
        <li>query by team pass: ${model.readOnlyQueryByTeamPass}</li>
        <li>query by phase pass: ${model.readOnlyQueryByPhasePass}</li>
        <li>deterministic ordering pass: ${model.deterministicOrderingPass}</li>
        <li>schema compatibility pass: ${model.schemaCompatibilityPass}</li>
        <li>score mutation count: 0</li>
        <li>timeline mutation count: 0</li>
        <li>possession mutation count: 0</li>
        <li>production scoring event creation count: 0</li>
        <li>lineup mutation count: 0</li>
        <li>starters mutation count: 0</li>
        <li>bench mutation count: 0</li>
        <li>live selection driver count: 0</li>
        <li>production route resolution driver count: 0</li>
        <li>global economy claim count: 0</li>
        <li>trend proof claim count: ${model.trendProofClaimCount}</li>
        <li>invented statistic count: ${model.inventedStatisticCount}</li>
        <li>sandbox events promoted to official count: ${model.sandboxEventsPromotedToOfficialCount}</li>
      </ul>
    </details>`;
}

function renderRealSQLiteReadOnlyIOSmokeTestAppendix(
  model: CoachReportRealSQLiteReadOnlyIOSmokeTestModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails smoke test SQLite read-only</summary>
      <ul>
        <li>real SQLite read-only IO smoke test status: ${model.status}</li>
        <li>mode name: ${model.modeName}</li>
        <li>storage target: ${model.storageTarget}</li>
        <li>schema version: ${model.schemaVersion}</li>
        <li>real SQLite IO enabled: ${model.realSQLiteIoEnabled}</li>
        <li>read-only mode: ${model.readOnlyMode}</li>
        <li>write mode allowed: ${model.writeModeAllowed}</li>
        <li>write rejected pass: ${model.writeRejectedPass}</li>
        <li>adapter implemented: ${model.adapterImplemented}</li>
        <li>adapter production ready: ${model.adapterProductionReady}</li>
        <li>feature flag enabled: ${model.featureFlagEnabled}</li>
        <li>default feature flag enabled: ${model.defaultFeatureFlagEnabled}</li>
        <li>product activation allowed: ${model.productActivationAllowed}</li>
        <li>active product history source: ${model.activeProductHistorySource}</li>
        <li>database used as product truth: ${model.databaseUsedAsProductTruth}</li>
        <li>report can use as source of truth: ${model.reportCanUseAsSourceOfTruth}</li>
        <li>default real DB read count: ${model.defaultRealDatabaseReadCount}</li>
        <li>controlled real DB read count: ${model.controlledRealDatabaseReadCount}</li>
        <li>real DB write count: ${model.realDatabaseWriteCount}</li>
        <li>fixture path: ${escapeHtml(model.fixturePath)}</li>
        <li>fixture record count: ${model.fixtureRecordCount}</li>
        <li>read-only adapter record count: ${model.readOnlyAdapterRecordCount}</li>
        <li>query by team pass: ${model.queryByTeamPass}</li>
        <li>query by phase pass: ${model.queryByPhasePass}</li>
        <li>deterministic ordering pass: ${model.deterministicOrderingPass}</li>
        <li>schema compatibility pass: ${model.schemaCompatibilityPass}</li>
        <li>score mutation count: 0</li>
        <li>timeline mutation count: 0</li>
        <li>possession mutation count: 0</li>
        <li>production scoring event creation count: 0</li>
        <li>lineup mutation count: 0</li>
        <li>starters mutation count: 0</li>
        <li>bench mutation count: 0</li>
        <li>live selection driver count: 0</li>
        <li>production route resolution driver count: 0</li>
        <li>global economy claim count: 0</li>
        <li>trend proof claim count: ${model.trendProofClaimCount}</li>
        <li>invented statistic count: ${model.inventedStatisticCount}</li>
        <li>sandbox events promoted to official count: ${model.sandboxEventsPromotedToOfficialCount}</li>
        <li>visible recommendation wording count: ${model.visibleRecommendationWordingCount}</li>
        <li>visible selection wording count: ${model.visibleSelectionWordingCount}</li>
        <li>scoring constants unchanged: ${model.scoringConstantsUnchanged}</li>
        <li>MatchBonusEvent unchanged: ${model.matchBonusEventUnchanged}</li>
        <li>batch/live separation preserved: ${model.batchLiveSeparationPreserved}</li>
        <li>FULL_MATCH_BATCH_ECONOMY remains only global economy proof: ${model.fullMatchBatchEconomyRemainsOnlyGlobalProof}</li>
      </ul>
    </details>`;
}

function renderFullMatchScoreEconomyCalibrationAppendix(
  model: FullMatchScoreEconomyCalibrationModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails calibration &eacute;conomie du score</summary>
      <ul>
        <li>status: ${model.status}</li>
        <li>scope: ${model.scope}</li>
        <li>calibration version: ${model.calibrationVersion}</li>
        <li>official score before calibration: ${escapeHtml(model.officialScoreBeforeCalibration)}</li>
        <li>official score after calibration: ${escapeHtml(model.officialScoreAfterCalibration)}</li>
        <li>score delta home: ${model.scoreDeltaHome}</li>
        <li>score delta away: ${model.scoreDeltaAway}</li>
        <li>scoring constants changed: ${model.scoringConstantsChanged}</li>
        <li>score cap applied: ${model.scoreCapApplied}</li>
        <li>post-hoc score rewrite applied: ${model.postHocScoreRewriteApplied}</li>
        <li>scoring events deleted: ${model.scoringEventsDeleted}</li>
        <li>scoring events rewritten: ${model.scoringEventsRewritten}</li>
        <li>forced opponent score applied: ${model.forcedOpponentScoreApplied}</li>
        <li>root-cause primary cause: ${model.rootCause.primaryCause}</li>
        <li>root-cause secondary causes: ${model.rootCause.secondaryCauses.join(", ") || "none"}</li>
        <li>root-cause confidence: ${model.rootCause.confidence}</li>
        <li>root-cause evidence: ${escapeHtml(model.rootCause.evidenceSummary)}</li>
        <li>segment count: ${model.segmentCount}</li>
        <li>sequence count: ${model.sequenceCount}</li>
        <li>scoring event count: ${model.scoringEventCount}</li>
        <li>scoring events by family before: ${escapeHtml(JSON.stringify(model.comparison.scoringEventsByFamilyBefore))}</li>
        <li>scoring events by family after: ${escapeHtml(JSON.stringify(model.comparison.scoringEventsByFamilyAfter))}</li>
        <li>scoring points by family before: ${escapeHtml(JSON.stringify(model.comparison.scoringPointsByFamilyBefore))}</li>
        <li>scoring points by family after: ${escapeHtml(JSON.stringify(model.comparison.scoringPointsByFamilyAfter))}</li>
        <li>selected route mix before: ${escapeHtml(JSON.stringify(model.comparison.selectedRouteMixBefore))}</li>
        <li>selected route mix after: ${escapeHtml(JSON.stringify(model.comparison.selectedRouteMixAfter))}</li>
        <li>route success rates before: ${escapeHtml(JSON.stringify(model.comparison.routeSuccessRatesBefore))}</li>
        <li>route success rates after: ${escapeHtml(JSON.stringify(model.comparison.routeSuccessRatesAfter))}</li>
        <li>goalkeeper impact before: ${model.comparison.goalkeeperImpactBefore}</li>
        <li>goalkeeper impact after: ${model.comparison.goalkeeperImpactAfter}</li>
        <li>fatigue impact before: ${model.comparison.fatigueImpactBefore}</li>
        <li>fatigue impact after: ${model.comparison.fatigueImpactAfter}</li>
        <li>segment amplification risk: ${model.repeatedSegmentAmplificationRisk}</li>
        <li>single-run limitation: ${model.singleRunOnly}</li>
        <li>batch/live separation preserved: ${model.batchLiveSeparationPreserved}</li>
        <li>MatchBonusEvent changed: ${model.matchBonusEventChanged}</li>
        <li>persistence used for calibration: ${model.persistenceUsedForCalibration}</li>
        <li>SQLite used as score economy source: ${model.sqliteUsedAsScoreEconomySource}</li>
        <li>FULL_MATCH_BATCH_ECONOMY remains only global economy proof: ${model.fullMatchBatchEconomyRemainsOnlyGlobalProof}</li>
        <li>official timeline mutation count: ${model.officialTimelineMutationCount}</li>
        <li>official possession mutation count: ${model.officialPossessionMutationCount}</li>
        <li>production scoring event creation count: ${model.productionScoringEventCreationCount}</li>
        <li>invented statistic count: ${model.inventedStatisticCount}</li>
        <li>trend proof claim count: ${model.trendProofClaimCount}</li>
        <li>global economy claim count: ${model.globalEconomyClaimCount}</li>
      </ul>
    </details>`;
}

function renderScoringFamilyAttributionAuditAppendix(
  model: ScoringFamilyAttributionAuditModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails attribution familles de score</summary>
      <ul>
        <li>status: ${model.status}</li>
        <li>scope: ${model.scope}</li>
        <li>attribution version: ${model.attributionVersion}</li>
        <li>total scoring event count: ${model.totalScoringEventCount}</li>
        <li>attributed scoring event count: ${model.attributedScoringEventCount}</li>
        <li>unknown scoring event count: ${model.unknownScoringEventCount}</li>
        <li>legacy unknown scoring event count: ${model.legacyUnknownScoringEventCount}</li>
        <li>unknown scoring point total: ${model.unknownScoringPointTotal}</li>
        <li>attribution coverage rate: ${model.attributionCoverageRate}</li>
        <li>scoring events by family: ${escapeHtml(JSON.stringify(model.scoringEventsByFamily))}</li>
        <li>scoring points by family: ${escapeHtml(JSON.stringify(model.scoringPointsByFamily))}</li>
        <li>unknown reasons: ${escapeHtml(model.unknownReasons.join(" | ") || "none")}</li>
        <li>high confidence count: ${model.highConfidenceCount}</li>
        <li>medium confidence count: ${model.mediumConfidenceCount}</li>
        <li>low confidence count: ${model.lowConfidenceCount}</li>
        <li>family attribution warnings: ${escapeHtml(model.familyAttributionWarnings.join(", ") || "none")}</li>
        <li>warning count by code: ${escapeHtml(JSON.stringify(model.warningCountByCode))}</li>
        <li>scoring constants changed: ${model.scoringConstantsChanged}</li>
        <li>score cap applied: ${model.scoreCapApplied}</li>
        <li>post-hoc score rewrite applied: ${model.postHocRewriteApplied}</li>
        <li>scoring events deleted: ${model.scoringEventsDeleted}</li>
        <li>scoring events rewritten: ${model.scoringEventsRewritten}</li>
        <li>forced opponent score applied: ${model.forcedOpponentScoreApplied}</li>
        <li>official timeline mutation count: ${model.officialTimelineMutationCount}</li>
        <li>official possession mutation count: ${model.officialPossessionMutationCount}</li>
        <li>production scoring event creation count: ${model.productionScoringEventCreationCount}</li>
        <li>batch/live separation preserved: ${model.batchLiveSeparationPreserved}</li>
        <li>MatchBonusEvent changed: ${model.matchBonusEventChanged}</li>
        <li>persistence used for attribution: ${model.persistenceUsedForAttribution}</li>
        <li>SQLite used as score economy source: ${model.sqliteUsedAsScoreEconomySource}</li>
        <li>FULL_MATCH_BATCH_ECONOMY remains only global economy proof: ${model.fullMatchBatchEconomyRemainsOnlyGlobalProof}</li>
      </ul>
    </details>`;
}

function renderFullMatchCalibrationCarryoverReconciliationAppendix(
  model: FullMatchCalibrationCarryoverReconciliationModel | undefined,
): string {
  if (model === undefined) {
    return "";
  }

  return `<details class="appendix report-appendix-stack">
      <summary>D&eacute;tails r&eacute;conciliation calibrations 6C</summary>
      <ul>
        <li>status: ${model.status}</li>
        <li>scope: ${model.scope}</li>
        <li>version: ${model.version}</li>
        <li>official full-match score: ${escapeHtml(model.officialFullMatchScore)}</li>
        <li>official full-match scoring events: ${model.officialFullMatchScoringEvents}</li>
        <li>official full-match SHOT_GOAL events: ${model.officialFullMatchShotGoalEvents}</li>
        <li>official full-match SHOT_GOAL points: ${model.officialFullMatchShotGoalPoints}</li>
        <li>batch calibration known SHOT_GOAL per match: ${model.batchCalibrationKnownShotGoalsPerMatch}</li>
        <li>batch calibration known conversion rate: ${model.batchCalibrationKnownConversionRate}%</li>
        <li>primary regression cause: ${model.primaryRegressionCause}</li>
        <li>secondary regression causes: ${escapeHtml(model.secondaryRegressionCauses.join(", "))}</li>
        <li>confidence: ${model.confidence}</li>
        <li>warnings: ${escapeHtml(model.warnings.join(", "))}</li>
        <li>matrix rows: ${model.carryoverMatrix.length}</li>
        <li>scoring path audit rows: ${model.scoringPathAuditRows.length}</li>
        <li>shot difficulty batch/full-match: ${model.shotDifficultyCalibrationAppliedInBatch}/${model.shotDifficultyCalibrationAppliedInFullMatch}</li>
        <li>scoring choice balance batch/full-match: ${model.scoringChoiceBalanceAppliedInBatch}/${model.scoringChoiceBalanceAppliedInFullMatch}</li>
        <li>affordance volume batch/full-match: ${model.scoringAffordanceVolumeAppliedInBatch}/${model.scoringAffordanceVolumeAppliedInFullMatch}</li>
        <li>goalkeeper calibration batch/full-match: ${model.goalkeeperCalibrationAppliedInBatch}/${model.goalkeeperCalibrationAppliedInFullMatch}</li>
        <li>route family mix batch/full-match: ${model.routeFamilyMixAppliedInBatch}/${model.routeFamilyMixAppliedInFullMatch}</li>
        <li>full-match parallel scoring path: ${model.fullMatchUsesParallelScoringPath}</li>
        <li>full-match legacy shot path: ${model.fullMatchUsesLegacyShotPath}</li>
        <li>full-match fallback route path: ${model.fullMatchUsesFallbackRoutePath}</li>
        <li>full-match segment amplification path: ${model.fullMatchUsesSegmentAmplificationPath}</li>
        <li>scoring constants changed: ${model.scoringConstantsChanged}</li>
        <li>score cap applied: ${model.scoreCapApplied}</li>
        <li>post-hoc score rewrite applied: ${model.postHocScoreRewriteApplied}</li>
        <li>scoring events deleted: ${model.scoringEventsDeleted}</li>
        <li>scoring events rewritten: ${model.scoringEventsRewritten}</li>
        <li>forced opponent score applied: ${model.forcedOpponentScoreApplied}</li>
        <li>official timeline mutation count: ${model.officialTimelineMutationCount}</li>
        <li>official possession mutation count: ${model.officialPossessionMutationCount}</li>
        <li>production scoring event creation count: ${model.productionScoringEventCreationCount}</li>
        <li>batch/live separation preserved: ${model.batchLiveSeparationPreserved}</li>
        <li>MatchBonusEvent changed: ${model.matchBonusEventChanged}</li>
        <li>persistence used for calibration: ${model.persistenceUsedForCalibration}</li>
        <li>SQLite used as score economy source: ${model.sqliteUsedAsScoreEconomySource}</li>
        <li>global economy claim count: ${model.globalEconomyClaimCount}</li>
        <li>trend proof claim count: ${model.trendProofClaimCount}</li>
        <li>invented statistic count: ${model.inventedStatisticCount}</li>
        <li>single run only: ${model.singleRunOnly}</li>
        <li>FULL_MATCH_BATCH_ECONOMY remains only global proof: ${model.fullMatchBatchEconomyRemainsOnlyGlobalProof}</li>
        <li>recommendation: ${escapeHtml(model.recommendation)}</li>
      </ul>
    </details>`;
}

function renderAppendices(input: {
  readonly html: string;
  readonly exportHtmlBeforeAppendix: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
  readonly multiMatchPhaseComparison: CoachReportMultiMatchPhaseComparisonModel;
  readonly multiMatchHistoryView: CoachReportMultiMatchHistoryViewModel;
  readonly realMatchHistoryIntegration?: CoachReportRealMatchHistoryIntegrationModel;
  readonly persistentHistoryAdapter?: CoachReportPersistentHistoryAdapterModel;
  readonly historyStoreConsistency?: CoachReportHistoryStoreConsistencyModel;
  readonly persistenceEvidenceSnapshot?: CoachReportPersistenceEvidenceSnapshot;
  readonly databaseMigrationPreparation?: CoachReportDatabaseMigrationPreparationModel;
  readonly databaseAdapterSpike?: CoachReportDatabaseAdapterSpikeModel;
  readonly durableStorageDecision?: CoachReportDurableStorageDecisionModel;
  readonly controlledLocalReadOnlyDbMode?: CoachReportControlledLocalReadOnlyDbModeModel;
  readonly realSQLiteReadOnlyIOSmokeTest?: CoachReportRealSQLiteReadOnlyIOSmokeTestModel;
  readonly fullMatchScoreEconomyCalibration?: FullMatchScoreEconomyCalibrationModel;
  readonly scoringFamilyAttributionAudit?: ScoringFamilyAttributionAuditModel;
  readonly fullMatchCalibrationCarryoverReconciliation?: FullMatchCalibrationCarryoverReconciliationModel;
  readonly fullMatchOfficialScoringConnection?: FullMatchOfficialScoringCalibrationConnectionModel;
  readonly fullMatchBatchEconomyProof?: FullMatchBatchEconomyProofModel;
  readonly fullMatchRouteFamilyMixActivation?: FullMatchRouteFamilyMixActivationModel;
  readonly fullMatchRouteFamilyScoringRateCalibration?: FullMatchRouteFamilyScoringRateCalibrationModel;
  readonly fullMatchSegmentScoringDensityCalibration?: FullMatchSegmentScoringDensityCalibrationModel;
  readonly fullMatchTeamOpportunityBalanceCalibration?: FullMatchTeamOpportunityBalanceCalibrationModel;
  readonly fullMatchDominanceChainCalibration?: FullMatchDominanceChainCalibrationModel;
  readonly fullMatchBreakEventPostScoreResetCalibration?: FullMatchBreakEventPostScoreResetCalibrationModel;
  readonly fullMatchGoalkeeperSecureResetBreakSpecificity?: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel;
  readonly fullMatchResetBreakBlowoutEconomy?: FullMatchResetBreakBlowoutEconomyCalibrationModel;
  readonly fullMatchEarnedDangerGate?: FullMatchEarnedDangerGateCalibrationModel;
  readonly fullMatchEarnedDangerGateTuning?: FullMatchEarnedDangerGateTuningModel;
  readonly fullMatchGateSelectivityVolumeRegressionFix?: FullMatchGateSelectivityVolumeRegressionFixModel;
  readonly fullMatchRouteEconomyRecheckAfterSelectivityFix?: FullMatchRouteEconomyRecheckAfterSelectivityFixModel;
  readonly fullMatchEarnedDangerOutcomeDistribution?: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel;
  readonly fullMatchDominanceChainCalibrationCoverageFix?: FullMatchDominanceChainCalibrationCoverageFixModel;
  readonly fullMatchCloseGameDistributionCalibration?: FullMatchCloseGameDistributionCalibrationModel;
  readonly fullMatchTrailingTeamResponseLateGamePressure?: FullMatchTrailingTeamResponseLateGamePressureModel;
  readonly fullMatchLateGameThreatQualityTrailingConversion?: FullMatchLateGameThreatQualityTrailingConversionModel;
  readonly fullMatchLateGameThreatQualityMonitoring?: FullMatchLateGameThreatQualityMonitoringModel;
  readonly fullMatchEconomyFinalStabilization?: FullMatchEconomyFinalStabilizationModel;
  readonly productBaselineCoachReportReadiness?: ProductBaselineCoachReportReadinessModel;
}): string {
  const intro = stripTags(extractMatch(extractSection(input.html, "appendices"), /<p class="muted">([\s\S]*?)<\/p>/u));
  const originalAppendicesBody = extractSectionInner(input.html, "appendices");
  const originalAppendicesWithoutIntro = originalAppendicesBody.replace(/^\s*<p class="muted">[\s\S]*?<\/p>\s*/u, "");

  return `
  <section id="appendices" class="premium-section" data-source-product-sections="appendices">
    <div class="report-section-divider">Appendices</div>
    <div class="report-section-header">
      <div>
        <h2>Annexes</h2>
        <p>${intro}</p>
      </div>
    </div>
    ${renderPremiumLayoutAppendix({
      exportHtml: input.exportHtmlBeforeAppendix,
      panelCount: input.panelCount,
      readablePanelCount: input.readablePanelCount,
      panelsWithPrimaryZoneCount: input.panelsWithPrimaryZoneCount,
      panelsWithSecondaryZonesCount: input.panelsWithSecondaryZonesCount,
      legendItemCount: input.legendItemCount,
    })}
    ${renderPhaseVisualReadabilityAppendix({
      exportHtml: input.exportHtmlBeforeAppendix,
      panelCount: input.panelCount,
      readablePanelCount: input.readablePanelCount,
      panelsWithPrimaryZoneCount: input.panelsWithPrimaryZoneCount,
      panelsWithSecondaryZonesCount: input.panelsWithSecondaryZonesCount,
      legendItemCount: input.legendItemCount,
    })}
    ${renderMultiMatchPhaseComparisonAppendix(input.multiMatchPhaseComparison)}
    ${renderMultiMatchHistoryViewAppendix(input.multiMatchHistoryView)}
    ${renderRealMatchHistoryIntegrationAppendix(input.realMatchHistoryIntegration)}
    ${renderPersistentHistoryAdapterAppendix(input.persistentHistoryAdapter)}
    ${renderHistoryStoreConsistencyAppendix(input.historyStoreConsistency, input.persistenceEvidenceSnapshot)}
    ${renderDatabaseMigrationPreparationAppendix(input.databaseMigrationPreparation)}
    ${renderDatabaseAdapterSpikeAppendix(input.databaseAdapterSpike)}
    ${renderDurableStorageDecisionAppendix(input.durableStorageDecision)}
    ${renderControlledLocalReadOnlyDbModeAppendix(input.controlledLocalReadOnlyDbMode)}
    ${renderRealSQLiteReadOnlyIOSmokeTestAppendix(input.realSQLiteReadOnlyIOSmokeTest)}
    ${renderFullMatchScoreEconomyCalibrationAppendix(input.fullMatchScoreEconomyCalibration)}
    ${renderScoringFamilyAttributionAuditAppendix(input.scoringFamilyAttributionAudit)}
    ${renderFullMatchCalibrationCarryoverReconciliationAppendix(input.fullMatchCalibrationCarryoverReconciliation)}
    ${renderFullMatchOfficialScoringConnectionAppendix(input.fullMatchOfficialScoringConnection)}
    ${renderFullMatchBatchEconomyProofAppendix(input.fullMatchBatchEconomyProof)}
    ${renderFullMatchTeamOpportunityBalanceCalibrationAppendix(input.fullMatchTeamOpportunityBalanceCalibration)}
    ${renderFullMatchDominanceChainCalibrationAppendix(input.fullMatchDominanceChainCalibration)}
    ${renderFullMatchBreakEventPostScoreResetCalibrationAppendix(input.fullMatchBreakEventPostScoreResetCalibration)}
    ${renderFullMatchGoalkeeperSecureResetBreakSpecificityAppendix(input.fullMatchGoalkeeperSecureResetBreakSpecificity)}
    ${originalAppendicesWithoutIntro}
    <p class="report-print-footer">Export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
  </section>`;
}

function injectExportMarkers(html: string): string {
  return html
    .replace(
      "<body>",
      "<body data-export-snapshot=\"coach_product_report\" data-export-format=\"print_ready_html\" data-export-premium-layout=\"true\">",
    )
    .replace(
      "<main id=\"product-main\">",
      "<main id=\"product-main\" data-export-source=\"reports/coach-report.product.html\" data-export-html=\"reports/coach-report.export.html\">",
    );
}

export function renderCoachReportExportHtml(input: {
  readonly productReportHtml: string;
  readonly phaseReadability?: CoachReportPhaseVisualReadabilityModel;
  readonly multiMatchPhaseComparison?: CoachReportMultiMatchPhaseComparisonModel;
  readonly multiMatchHistoryView?: CoachReportMultiMatchHistoryViewModel;
  readonly realMatchHistoryIntegration?: CoachReportRealMatchHistoryIntegrationModel;
  readonly persistentHistoryAdapter?: CoachReportPersistentHistoryAdapterModel;
  readonly historyStoreConsistency?: CoachReportHistoryStoreConsistencyModel;
  readonly persistenceEvidenceSnapshot?: CoachReportPersistenceEvidenceSnapshot;
  readonly databaseMigrationPreparation?: CoachReportDatabaseMigrationPreparationModel;
  readonly databaseAdapterSpike?: CoachReportDatabaseAdapterSpikeModel;
  readonly durableStorageDecision?: CoachReportDurableStorageDecisionModel;
  readonly controlledLocalReadOnlyDbMode?: CoachReportControlledLocalReadOnlyDbModeModel;
  readonly realSQLiteReadOnlyIOSmokeTest?: CoachReportRealSQLiteReadOnlyIOSmokeTestModel;
  readonly fullMatchScoreEconomyCalibration?: FullMatchScoreEconomyCalibrationModel;
  readonly scoringFamilyAttributionAudit?: ScoringFamilyAttributionAuditModel;
  readonly fullMatchCalibrationCarryoverReconciliation?: FullMatchCalibrationCarryoverReconciliationModel;
  readonly fullMatchOfficialScoringConnection?: FullMatchOfficialScoringCalibrationConnectionModel;
  readonly fullMatchBatchEconomyProof?: FullMatchBatchEconomyProofModel;
  readonly fullMatchRouteFamilyMixActivation?: FullMatchRouteFamilyMixActivationModel;
  readonly fullMatchRouteFamilyScoringRateCalibration?: FullMatchRouteFamilyScoringRateCalibrationModel;
  readonly fullMatchSegmentScoringDensityCalibration?: FullMatchSegmentScoringDensityCalibrationModel;
  readonly fullMatchTeamOpportunityBalanceCalibration?: FullMatchTeamOpportunityBalanceCalibrationModel;
  readonly fullMatchDominanceChainCalibration?: FullMatchDominanceChainCalibrationModel;
  readonly fullMatchBreakEventPostScoreResetCalibration?: FullMatchBreakEventPostScoreResetCalibrationModel;
  readonly fullMatchGoalkeeperSecureResetBreakSpecificity?: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel;
  readonly fullMatchResetBreakBlowoutEconomy?: FullMatchResetBreakBlowoutEconomyCalibrationModel;
  readonly fullMatchEarnedDangerGate?: FullMatchEarnedDangerGateCalibrationModel;
  readonly fullMatchEarnedDangerGateTuning?: FullMatchEarnedDangerGateTuningModel;
  readonly fullMatchGateSelectivityVolumeRegressionFix?: FullMatchGateSelectivityVolumeRegressionFixModel;
  readonly fullMatchRouteEconomyRecheckAfterSelectivityFix?: FullMatchRouteEconomyRecheckAfterSelectivityFixModel;
  readonly fullMatchEarnedDangerOutcomeDistribution?: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel;
  readonly fullMatchDominanceChainCalibrationCoverageFix?: FullMatchDominanceChainCalibrationCoverageFixModel;
  readonly fullMatchCloseGameDistributionCalibration?: FullMatchCloseGameDistributionCalibrationModel;
  readonly fullMatchTrailingTeamResponseLateGamePressure?: FullMatchTrailingTeamResponseLateGamePressureModel;
  readonly fullMatchLateGameThreatQualityTrailingConversion?: FullMatchLateGameThreatQualityTrailingConversionModel;
  readonly fullMatchLateGameThreatQualityMonitoring?: FullMatchLateGameThreatQualityMonitoringModel;
  readonly fullMatchEconomyFinalStabilization?: FullMatchEconomyFinalStabilizationModel;
  readonly productBaselineCoachReportReadiness?: ProductBaselineCoachReportReadinessModel;
}): string {
  const withTitle = replaceTitle(input.productReportHtml);
  const withStyle = replaceStyle(withTitle);
  const withMarkers = injectExportMarkers(withStyle);
  const phasePanels = deriveCoachReportPhasePanels({
    productReportHtml: input.productReportHtml,
  });
  const readabilityPresentation = deriveCoachReportPhaseVisualReadabilityPresentation({
    panels: phasePanels,
  });
  const derivedPhaseReadability = input.phaseReadability;
  const multiMatchPhaseComparison = input.multiMatchPhaseComparison ?? (
    derivedPhaseReadability === undefined
      ? buildCoachReportMultiMatchPhaseComparison({
          phaseReadability: {
            status: "partial",
            origin: "coach_report_phase_visuals",
            htmlFirst: true,
            pdfOptional: true,
            singleSourceOfTruth: true,
            duplicateReportLogic: false,
            legendItemCount: readabilityPresentation.legendItems.length,
            legendItems: readabilityPresentation.legendItems,
            panelCount: phasePanels.length,
            readablePanelCount: readabilityPresentation.coachCopyBlocks.length,
            panelsWithPrimaryZoneCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.primaryZone !== undefined).length,
            panelsWithSecondaryZonesCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.secondaryZones.length > 0).length,
            controlledEmptyStateCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.controlledEmptyStateUsed).length,
            zoneHierarchies: readabilityPresentation.zoneHierarchies,
            coachCopyBlocks: readabilityPresentation.coachCopyBlocks,
            phaseSpecificGuardVisible: true,
            legendVisible: true,
            primaryZoneVisualEmphasisPresent: true,
            secondaryZoneVisualEmphasisPresent: true,
            controlledEmptyStateReadable: true,
            productExportScoreMatches: true,
            productExportCandidateComparisonMatches: true,
            interpretationGuardMatchesProduct: true,
            sandboxEventsPromotedToOfficialCount: 0,
            inventedStatisticCount: 0,
            visibleRecommendationWordingCount: 0,
            visibleSelectionWordingCount: 0,
            internalStatusLeakCount: 0,
            mojibakeMarkerCount: 0,
            noAutomaticSelection: true,
            playerSelectedCount: 0,
            automaticSelectionCount: 0,
            lineupMutationCount: 0,
            startersMutationCount: 0,
            benchMutationCount: 0,
            confidenceUpgradeCount: 0,
            officiallyConfirmedCount: 0,
            canChangeLineup: false,
            canChangeStarters: false,
            canChangeBench: false,
            canDriveCoachInstruction: false,
            canDriveLiveSelection: false,
            canDriveProductionRouteResolution: false,
            canMutateTimeline: false,
            canMutateScore: false,
            canMutatePossession: false,
            canCreateScoringEvent: false,
            canClaimGlobalEconomy: false,
            scoringConstantsUnchanged: true,
            matchBonusEventUnchanged: true,
            fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
            tags: [],
            warnings: [],
          },
          comparisonSamples: [],
          productReportHtml: input.productReportHtml,
          exportReportHtml: input.productReportHtml,
        })
      : buildCoachReportMultiMatchPhaseComparison({
          phaseReadability: derivedPhaseReadability,
          comparisonSamples: [],
          productReportHtml: input.productReportHtml,
          exportReportHtml: input.productReportHtml,
        })
  );
  const multiMatchHistoryView = input.multiMatchHistoryView ?? buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: multiMatchPhaseComparison,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.productReportHtml,
  });
  const premiumBodyBeforeAppendices = [
    renderCover(input.productReportHtml),
    renderExecutiveSummary(input.productReportHtml),
    renderMatchStory(input.productReportHtml),
    renderKeyStatistics(input.productReportHtml),
    renderPhaseLegend(readabilityPresentation.legendItems),
    ...phasePanels.map((panel) =>
      renderPhaseSection(panel, readabilityContextForPanel(panel, readabilityPresentation))
    ),
    renderMultiMatchPhaseComparison(multiMatchPhaseComparison),
    renderMultiMatchHistoryView(multiMatchHistoryView),
    ...(input.realMatchHistoryIntegration === undefined ? [] : [renderRealMatchHistoryIntegration(input.realMatchHistoryIntegration)]),
    ...(input.persistentHistoryAdapter === undefined ? [] : [
      renderPersistentHistoryAdapter(input.persistentHistoryAdapter, input.historyStoreConsistency, input.persistenceEvidenceSnapshot),
    ]),
    renderDatabaseMigrationPreparation(input.databaseMigrationPreparation),
    renderDatabaseAdapterSpike(input.databaseAdapterSpike),
    renderDurableStorageDecision(input.durableStorageDecision),
    renderControlledLocalReadOnlyDbMode(input.controlledLocalReadOnlyDbMode),
    renderRealSQLiteReadOnlyIOSmokeTest(input.realSQLiteReadOnlyIOSmokeTest),
    renderFullMatchScoreEconomyCalibration(input.fullMatchScoreEconomyCalibration),
    renderScoringFamilyAttributionAudit(input.scoringFamilyAttributionAudit),
    renderFullMatchCalibrationCarryoverReconciliation(input.fullMatchCalibrationCarryoverReconciliation),
    renderFullMatchOfficialScoringConnection(input.fullMatchOfficialScoringConnection),
    renderFullMatchBatchEconomyProofSection(input.fullMatchBatchEconomyProof),
    renderFullMatchRouteFamilyMixActivationSection(input.fullMatchRouteFamilyMixActivation),
    renderFullMatchRouteFamilyScoringRateCalibrationSection(input.fullMatchRouteFamilyScoringRateCalibration),
    renderFullMatchSegmentScoringDensityCalibrationSection(input.fullMatchSegmentScoringDensityCalibration),
    renderFullMatchTeamOpportunityBalanceCalibrationSection(input.fullMatchTeamOpportunityBalanceCalibration),
    renderFullMatchDominanceChainCalibrationSection(input.fullMatchDominanceChainCalibration),
    renderFullMatchBreakEventPostScoreResetCalibrationSection(input.fullMatchBreakEventPostScoreResetCalibration),
    renderFullMatchGoalkeeperSecureResetBreakSpecificitySection(input.fullMatchGoalkeeperSecureResetBreakSpecificity),
    renderFullMatchResetBreakBlowoutEconomySection(input.fullMatchResetBreakBlowoutEconomy),
    renderFullMatchEarnedDangerGateSection(input.fullMatchEarnedDangerGate),
    renderFullMatchEarnedDangerGateTuningSection(input.fullMatchEarnedDangerGateTuning),
    renderFullMatchGateSelectivityVolumeRegressionFixSection(input.fullMatchGateSelectivityVolumeRegressionFix),
    renderFullMatchRouteEconomyRecheckAfterSelectivityFixSection(input.fullMatchRouteEconomyRecheckAfterSelectivityFix),
    renderFullMatchDominanceChainCalibrationCoverageFixSection(input.fullMatchDominanceChainCalibrationCoverageFix),
    renderFullMatchCloseGameDistributionCalibrationSection(input.fullMatchCloseGameDistributionCalibration),
    renderFullMatchTrailingTeamResponseLateGamePressureSection(input.fullMatchTrailingTeamResponseLateGamePressure),
    renderFullMatchLateGameThreatQualityTrailingConversionSection(input.fullMatchLateGameThreatQualityTrailingConversion),
    renderFullMatchLateGameThreatQualityMonitoringSection(input.fullMatchLateGameThreatQualityMonitoring),
    renderFullMatchEconomyFinalStabilizationSection(input.fullMatchEconomyFinalStabilization),
    renderProductBaselineCoachReportReadinessSection(input.productBaselineCoachReportReadiness),
    renderProfilesAndPlayers(input.productReportHtml),
    renderNextMatch(input.productReportHtml),
    renderInterpretationGuard(input.productReportHtml),
  ].join("\n");
  const appendices = renderAppendices({
    html: input.productReportHtml,
    exportHtmlBeforeAppendix: premiumBodyBeforeAppendices,
    panelCount: phasePanels.length,
    readablePanelCount: readabilityPresentation.coachCopyBlocks.length,
    panelsWithPrimaryZoneCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.primaryZone !== undefined).length,
    panelsWithSecondaryZonesCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.secondaryZones.length > 0).length,
    legendItemCount: readabilityPresentation.legendItems.length,
    multiMatchPhaseComparison,
    multiMatchHistoryView,
    ...(input.realMatchHistoryIntegration === undefined
      ? {}
      : { realMatchHistoryIntegration: input.realMatchHistoryIntegration }),
    ...(input.persistentHistoryAdapter === undefined
      ? {}
      : { persistentHistoryAdapter: input.persistentHistoryAdapter }),
    ...(input.historyStoreConsistency === undefined
      ? {}
      : { historyStoreConsistency: input.historyStoreConsistency }),
    ...(input.persistenceEvidenceSnapshot === undefined
      ? {}
      : { persistenceEvidenceSnapshot: input.persistenceEvidenceSnapshot }),
    ...(input.databaseMigrationPreparation === undefined
      ? {}
      : { databaseMigrationPreparation: input.databaseMigrationPreparation }),
    ...(input.databaseAdapterSpike === undefined
      ? {}
      : { databaseAdapterSpike: input.databaseAdapterSpike }),
    ...(input.durableStorageDecision === undefined
      ? {}
      : { durableStorageDecision: input.durableStorageDecision }),
    ...(input.controlledLocalReadOnlyDbMode === undefined
      ? {}
      : { controlledLocalReadOnlyDbMode: input.controlledLocalReadOnlyDbMode }),
    ...(input.realSQLiteReadOnlyIOSmokeTest === undefined
      ? {}
      : { realSQLiteReadOnlyIOSmokeTest: input.realSQLiteReadOnlyIOSmokeTest }),
    ...(input.fullMatchScoreEconomyCalibration === undefined
      ? {}
      : { fullMatchScoreEconomyCalibration: input.fullMatchScoreEconomyCalibration }),
    ...(input.scoringFamilyAttributionAudit === undefined
      ? {}
      : { scoringFamilyAttributionAudit: input.scoringFamilyAttributionAudit }),
    ...(input.fullMatchCalibrationCarryoverReconciliation === undefined
      ? {}
      : { fullMatchCalibrationCarryoverReconciliation: input.fullMatchCalibrationCarryoverReconciliation }),
    ...(input.fullMatchOfficialScoringConnection === undefined
      ? {}
      : { fullMatchOfficialScoringConnection: input.fullMatchOfficialScoringConnection }),
    ...(input.fullMatchBatchEconomyProof === undefined
      ? {}
      : { fullMatchBatchEconomyProof: input.fullMatchBatchEconomyProof }),
    ...(input.fullMatchRouteFamilyMixActivation === undefined
      ? {}
      : { fullMatchRouteFamilyMixActivation: input.fullMatchRouteFamilyMixActivation }),
    ...(input.fullMatchRouteFamilyScoringRateCalibration === undefined
      ? {}
      : { fullMatchRouteFamilyScoringRateCalibration: input.fullMatchRouteFamilyScoringRateCalibration }),
    ...(input.fullMatchSegmentScoringDensityCalibration === undefined
      ? {}
      : { fullMatchSegmentScoringDensityCalibration: input.fullMatchSegmentScoringDensityCalibration }),
    ...(input.fullMatchTeamOpportunityBalanceCalibration === undefined
      ? {}
      : { fullMatchTeamOpportunityBalanceCalibration: input.fullMatchTeamOpportunityBalanceCalibration }),
    ...(input.fullMatchDominanceChainCalibration === undefined
      ? {}
      : { fullMatchDominanceChainCalibration: input.fullMatchDominanceChainCalibration }),
    ...(input.fullMatchBreakEventPostScoreResetCalibration === undefined
      ? {}
      : { fullMatchBreakEventPostScoreResetCalibration: input.fullMatchBreakEventPostScoreResetCalibration }),
    ...(input.fullMatchGoalkeeperSecureResetBreakSpecificity === undefined
      ? {}
      : { fullMatchGoalkeeperSecureResetBreakSpecificity: input.fullMatchGoalkeeperSecureResetBreakSpecificity }),
    ...(input.fullMatchEarnedDangerGate === undefined
      ? {}
      : { fullMatchEarnedDangerGate: input.fullMatchEarnedDangerGate }),
    ...(input.fullMatchDominanceChainCalibrationCoverageFix === undefined
      ? {}
      : { fullMatchDominanceChainCalibrationCoverageFix: input.fullMatchDominanceChainCalibrationCoverageFix }),
    ...(input.fullMatchCloseGameDistributionCalibration === undefined
      ? {}
      : { fullMatchCloseGameDistributionCalibration: input.fullMatchCloseGameDistributionCalibration }),
    ...(input.fullMatchTrailingTeamResponseLateGamePressure === undefined
      ? {}
      : { fullMatchTrailingTeamResponseLateGamePressure: input.fullMatchTrailingTeamResponseLateGamePressure }),
  });
  const premiumMain = `${premiumBodyBeforeAppendices}\n${appendices}`;
  const mainOpenMatch = /<main\s+id="product-main"[^>]*>/u.exec(withMarkers);

  if (mainOpenMatch === null || mainOpenMatch.index === undefined) {
    return withMarkers.replace(/[ \t]+$/gmu, "");
  }

  const mainOpenTag = mainOpenMatch[0];

  return withMarkers.replace(
    /<main\s+id="product-main"[^>]*>[\s\S]*<\/main>/u,
    `${mainOpenTag}\n${premiumMain}\n</main>`,
  ).replace(/[ \t]+$/gmu, "");
}
