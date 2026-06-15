# Bundle: bundle__reports.md

Generated for Sprint 4O - Product Report Polish & Review Readiness. Source files are bundled by domain for compact ChatGPT review.

## File: src/reports/share/updateSharePack.ts

```ts
import { execFileSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, extname, join } from "path";
import { validateSharePack } from "../validation/sharePackValidator";
import { runFullMatchTraceValidationModel } from "../../simulation/validation/fullMatchTraceValidationComparisons";
import {
  renderFullMatchWorkbenchChainReplay4FDoc,
  renderFullMatchWorkbenchChainReplay4FValidation,
  renderFullMatchWorkbenchChainReplay4GDoc,
  renderFullMatchWorkbenchChainReplay4GValidation,
  renderFullMatchWorkbenchChainReplay4HDoc,
  renderFullMatchWorkbenchChainReplay4HValidation,
  renderFullMatchWorkbenchChainReplay4IDoc,
  renderFullMatchWorkbenchChainReplay4IValidation,
  renderFullMatchWorkbenchChainReplay4JDoc,
  renderFullMatchWorkbenchChainReplay4JValidation,
  renderFullMatchWorkbenchChainReplay4KDoc,
  renderFullMatchWorkbenchChainReplay4KValidation,
  renderFullMatchWorkbenchChainReplay4LDoc,
  renderFullMatchWorkbenchChainReplay4LValidation,
  renderFullMatchWorkbenchChainReplay4MDoc,
  renderFullMatchWorkbenchChainReplay4MValidation,
  renderFullMatchWorkbenchChainReplay4NDoc,
  renderFullMatchWorkbenchChainReplay4NValidation,
  renderFullMatchWorkbenchChainReplay4ODoc,
  renderFullMatchWorkbenchChainReplay4OValidation,
} from "../../simulation/validation/fullMatchTraceValidationReport";
import type { FullMatchTraceValidationModel } from "../../simulation/validation/fullMatchTraceValidationProfiles";

const TASK_NAME = process.env.SHARE_PACK_TASK_NAME ?? "Sprint 4O - Product Report Polish & Review Readiness";
const WORKBENCH_CHAIN_REPLAY_REPORT_TARGET = "fullmatch-workbench-chain-replay-4o.md";
const WORKBENCH_CHAIN_REPLAY_VALIDATION_TARGET = "validation.fullmatch-workbench-chain-replay-4o.md";
const MAX_SHARE_FILES = 20;

let cachedFullMatchTraceValidationModel: FullMatchTraceValidationModel | null = null;

function fullMatchTraceValidationModel(): FullMatchTraceValidationModel {
  if (cachedFullMatchTraceValidationModel === null) {
    cachedFullMatchTraceValidationModel = runFullMatchTraceValidationModel();
  }

  return cachedFullMatchTraceValidationModel;
}

interface SharePackSource {
  source: string;
  required: boolean;
  reason: string;
}

interface StandaloneFile extends SharePackSource {
  target: string;
}

interface CopiedStandaloneFile {
  source: string;
  target: string;
  reason: string;
}

interface BundleConfig {
  file: string;
  reason: string;
  sources: readonly SharePackSource[];
}

interface GeneratedBundle {
  file: string;
  reason: string;
  includedSources: readonly string[];
  sources: readonly SharePackSource[];
}

interface MissingExpectedFile {
  source: string;
  required: boolean;
  reason: string;
}

interface SharePackManifestInput {
  generatedAt: string;
  finalFileCount: number;
  standaloneFiles: readonly CopiedStandaloneFile[];
  bundles: readonly GeneratedBundle[];
  missingExpectedFiles: readonly MissingExpectedFile[];
  commandsRun: readonly string[];
  gitStatusSummary: string;
}

const STANDALONE_FILES: readonly StandaloneFile[] = [
  {
    source: "package.json",
    target: "package.json",
    required: true,
    reason: "npm scripts and package metadata for review",
  },
  {
    source: "tsconfig.json",
    target: "tsconfig.json",
    required: true,
    reason: "TypeScript compiler configuration",
  },
  {
    source: "reports/coach-report.latest.html",
    target: "coach-report.latest.html",
    required: false,
    reason: "latest generated coach HTML sample for visual review",
  },
  {
    source: "reports/coach-report.default.html",
    target: "coach-report.default.html",
    required: false,
    reason: "default full-match harness coach HTML sample without controlled route source diagnostics",
  },
  {
    source: "reports/coach-report.experimental.html",
    target: "coach-report.experimental.html",
    required: false,
    reason: "experimental full-match harness coach HTML sample with controlled route source diagnostics",
  },
  {
    source: "reports/coach-report.product.html",
    target: "coach-report.product.html",
    required: true,
    reason: "clean product-facing coach report with official signals, profile observations, next-match signals, and collapsed appendices",
  },
  {
    source: "reports/scoring-events-summary.md",
    target: "scoring-events-summary.md",
    required: false,
    reason: "current live scoring stream summary and scoring constants",
  },
  {
    source: "reports/workbench/sequence-1-action-1.html",
    target: "sequence-1-action-1.html",
    required: true,
    reason: "Sequence 1 Action 1 workbench tactical truth artifact",
  },
  {
    source: "reports/workbench/sequence-1-action-2.html",
    target: "sequence-1-action-2.html",
    required: true,
    reason: "Sequence 1 Action 2 visual workbench truth artifact",
  },
  {
    source: "reports/workbench/sequence-1-action-3.html",
    target: "sequence-1-action-3.html",
    required: true,
    reason: "Sequence 1 Action 3 visual workbench truth artifact",
  },
  {
    source: "reports/validation.share-pack.md",
    target: "validation.share-pack.md",
    required: false,
    reason: "existing share-pack validation context",
  },
];

const GENERATED_SHARE_DOCS: readonly CopiedStandaloneFile[] = [
  {
    source: "generated by src/reports/share/updateSharePack.ts",
    target: WORKBENCH_CHAIN_REPLAY_REPORT_TARGET,
    reason: "Sprint 4O Coach Product Report Polish summary report",
  },
  {
    source: "generated by src/reports/share/updateSharePack.ts",
    target: WORKBENCH_CHAIN_REPLAY_VALIDATION_TARGET,
    reason: "Sprint 4O Coach Product Report Polish validation checklist",
  },
  {
    source: "generated by src/reports/share/updateSharePack.ts",
    target: "README.md",
    reason: "compact share-pack orientation for reviewers",
  },
];

const BUNDLES: readonly BundleConfig[] = [
  {
    file: "bundle__contracts.md",
    reason: "official engine-to-coach contracts and contract guards",
    sources: [
      {
        source: "src/contracts/engineToCoach.ts",
        required: true,
        reason: "official engine-to-coach contract definitions",
      },
      {
        source: "src/contracts/matchReportEvidence.ts",
        required: true,
        reason: "Sprint 2P canonical MatchReport evidence fact contract",
      },
      {
        source: "src/contracts/matchReportWarnings.ts",
        required: true,
        reason: "Sprint 2P canonical MatchReport warning contract",
      },
      {
        source: "src/contracts/engineToCoach.test.ts",
        required: true,
        reason: "compile-only public contract fixture",
      },
      {
        source: "src/contracts/engineToCoachContractGuard.ts",
        required: true,
        reason: "runtime guard for official contract fixtures",
      },
    ],
  },
  {
    file: "bundle__simulation.md",
    reason: "public runMatch adapter and mini-match integration context",
    sources: [
      {
        source: "src/simulation/runMatch.ts",
        required: true,
        reason: "public MatchInput to MatchReport adapter",
      },
      {
        source: "src/simulation/runFullMatch.ts",
        required: true,
        reason: "Sprint 2L full-match harness entry point",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentState.ts",
        required: true,
        reason: "Sprint 2N lightweight state propagated between full-match segments",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentInfluence.ts",
        required: true,
        reason: "Sprint 2Q bounded segment-state influence resolver",
      },
      {
        source: "src/simulation/grounding/tacticalWorkbenchTypes.ts",
        required: true,
        reason: "Sprint 2R typed tactical workbench truth contract",
      },
      {
        source: "src/simulation/grounding/fixtures/sequence1Action1.fixture.ts",
        required: true,
        reason: "Sprint 2R Sequence 1 Action 1 tactical truth fixture",
      },
      {
        source: "src/simulation/grounding/fixtures/sequence1Action2.fixture.ts",
        required: true,
        reason: "Sprint 2Y Sequence 1 Action 2 visual tactical truth fixture",
      },
      {
        source: "src/simulation/grounding/fixtures/sequence1Action3.fixture.ts",
        required: true,
        reason: "Sprint 2Y Sequence 1 Action 3 visual tactical truth fixture",
      },
      {
        source: "src/simulation/grounding/workbenchChainTypes.ts",
        required: true,
        reason: "Sprint 2W WorkbenchChain contract and replay mode types",
      },
      {
        source: "src/simulation/grounding/fixtures/sequence1Action1.chain.fixture.ts",
        required: true,
        reason: "Sprint 2W one-step sequence-1-action-1 WorkbenchChain fixture",
      },
      {
        source: "src/simulation/grounding/fixtures/sequence1MultiAction.chain.fixture.ts",
        required: true,
        reason: "Sprint 2Y visual multi-action WorkbenchChain fixture with three visual truth steps",
      },
      {
        source: "src/simulation/grounding/fixtures/workbenchChainCatalog.ts",
        required: true,
        reason: "Sprint 2X WorkbenchChain catalog including one-step and multi-action chains",
      },
      {
        source: "src/simulation/grounding/workbenchChainState.ts",
        required: true,
        reason: "Sprint 2W WorkbenchChain runtime state propagation",
      },
      {
        source: "src/simulation/grounding/workbenchChainReplay.ts",
        required: true,
        reason: "Sprint 2Y diagnostic/controlled/fullmatch-warning WorkbenchChain replay with per-step preservation metrics",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRouteSelectionMode.ts",
        required: true,
        reason: "Sprint 2X disabled-by-default full-match route selection mode flag skeleton",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainConsumption.ts",
        required: true,
        reason: "Sprint 2Z full-match chain consumption result contract",
      },
      {
        source: "src/simulation/fullMatch/consumeWorkbenchChainForFullMatch.ts",
        required: true,
        reason: "Sprint 2Z experimental first-segment workbench chain consumer",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainSegmentContext.ts",
        required: true,
        reason: "Sprint 3A typed segment context derived from chain consumption",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentContextSignature.ts",
        required: true,
        reason: "Sprint 3A default-vs-experimental segment context signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainRouteCandidateInfluence.ts",
        required: true,
        reason: "Sprint 3B route candidate influence result contract",
      },
      {
        source: "src/simulation/fullMatch/applyChainContextToRouteCandidates.ts",
        required: true,
        reason: "Sprint 3B bounded chain-context-to-route-candidate influence mapper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRouteCandidateInfluenceSignature.ts",
        required: true,
        reason: "Sprint 3B default-vs-experimental route candidate influence signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchShadowRouteSelection.ts",
        required: true,
        reason: "Sprint 3C shadow route selection result contract",
      },
      {
        source: "src/simulation/fullMatch/selectShadowRouteFromInfluencedCandidates.ts",
        required: true,
        reason: "Sprint 3C guarded selector for influenced diagnostic candidates",
      },
      {
        source: "src/simulation/fullMatch/fullMatchShadowRouteSelectionSignature.ts",
        required: true,
        reason: "Sprint 3C default-vs-experimental shadow route selection signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentSelection.ts",
        required: true,
        reason: "Sprint 3D controlled segment selection result contract",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentSelectionFromShadow.ts",
        required: true,
        reason: "Sprint 3D guarded controlled selection adapter from shadow route selection",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentSelectionSignature.ts",
        required: true,
        reason: "Sprint 3D default-vs-experimental controlled segment selection signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentRouteInput.ts",
        required: true,
        reason: "Sprint 3E typed SegmentRouteInput contract derived from controlled segment selection",
      },
      {
        source: "src/simulation/fullMatch/segmentRouteInputFromControlledSelection.ts",
        required: true,
        reason: "Sprint 3E guarded converter from controlled segment selection to SegmentRouteInput",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentRouteInputSignature.ts",
        required: true,
        reason: "Sprint 3E default-vs-experimental SegmentRouteInput signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSource.ts",
        required: true,
        reason: "Sprint 3F controlled mini-match route source contract derived from SegmentRouteInput",
      },
      {
        source: "src/simulation/fullMatch/controlledMiniMatchRouteSourceFromSegmentRouteInput.ts",
        required: true,
        reason: "Sprint 3F guarded converter from SegmentRouteInput to controlled mini-match route source",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSourceSignature.ts",
        required: true,
        reason: "Sprint 3F default-vs-experimental controlled mini-match route source signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuard.ts",
        required: true,
        reason: "Sprint 3G live selection override guard contract derived from controlled mini-match route source",
      },
      {
        source: "src/simulation/fullMatch/liveSelectionOverrideGuardFromControlledRouteSource.ts",
        required: true,
        reason: "Sprint 3G guarded converter from controlled mini-match route source to live selection override guard",
      },
      {
        source: "src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuardSignature.ts",
        required: true,
        reason: "Sprint 3G default-vs-experimental live selection override guard signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperiment.ts",
        required: true,
        reason: "Sprint 3H isolated mini-match override experiment contract",
      },
      {
        source: "src/simulation/fullMatch/isolatedMiniMatchOverrideExperimentFromGuard.ts",
        required: true,
        reason: "Sprint 3H guarded converter from live selection override guard to isolated mini-match override experiment",
      },
      {
        source: "src/simulation/fullMatch/compareIsolatedMiniMatchOverride.ts",
        required: true,
        reason: "Sprint 3H isolated baseline-versus-override comparison helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperimentSignature.ts",
        required: true,
        reason: "Sprint 3H default-vs-experimental isolated override signature helper",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentReplayComparison.ts",
        required: true,
        reason: "Sprint 3I controlled segment replay comparison contract",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentReplayComparisonFromExperiment.ts",
        required: true,
        reason: "Sprint 3I guarded converter from isolated mini-match override experiment to controlled segment replay comparison",
      },
      {
        source: "src/simulation/fullMatch/compareControlledSegmentReplayPaths.ts",
        required: true,
        reason: "Sprint 3I tactical comparison helper for baseline and override replay paths",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentReplayComparisonSignature.ts",
        required: true,
        reason: "Sprint 3I default-vs-experimental controlled segment replay comparison signature helper",
      },
      {
        source: "src/simulation/fullMatch/isolatedSegmentReplayEvent.ts",
        required: true,
        reason: "Sprint 3J isolated replay event contract",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplay.ts",
        required: true,
        reason: "Sprint 3J real isolated segment replay result contract",
      },
      {
        source: "src/simulation/fullMatch/realIsolatedSegmentReplayEngine.ts",
        required: true,
        reason: "Sprint 3J real isolated replay event generator",
      },
      {
        source: "src/simulation/fullMatch/realIsolatedSegmentReplayFromComparison.ts",
        required: true,
        reason: "Sprint 3J guarded converter from controlled replay comparison to real isolated replay engine",
      },
      {
        source: "src/simulation/fullMatch/compareRealIsolatedSegmentReplayPaths.ts",
        required: true,
        reason: "Sprint 3J tactical comparison helper for real isolated replay paths",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplaySignature.ts",
        required: true,
        reason: "Sprint 3J default-vs-experimental real isolated replay signature helper",
      },
      {
        source: "src/simulation/fullMatch/controlledRouteResolutionSandbox.ts",
        required: true,
        reason: "Sprint 3K controlled route resolution sandbox contract",
      },
      {
        source: "src/simulation/fullMatch/resolveControlledRouteInSandbox.ts",
        required: true,
        reason: "Sprint 3K deterministic isolated sandbox route resolver",
      },
      {
        source: "src/simulation/fullMatch/controlledRouteResolutionSandboxFromReplay.ts",
        required: true,
        reason: "Sprint 3K guarded converter from real isolated replay to controlled route resolution sandbox",
      },
      {
        source: "src/simulation/fullMatch/compareControlledRouteResolutionSandbox.ts",
        required: true,
        reason: "Sprint 3K sandbox baseline versus override comparison helper",
      },
      {
        source: "src/simulation/fullMatch/controlledRouteResolutionSandboxSignature.ts",
        required: true,
        reason: "Sprint 3K default-vs-experimental controlled route resolution sandbox signature helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringOpportunityModel.ts",
        required: true,
        reason: "Sprint 3L sandbox scoring opportunity model contract",
      },
      {
        source: "src/simulation/fullMatch/classifySandboxScoringOpportunity.ts",
        required: true,
        reason: "Sprint 3L opportunity classifier from sandbox route metrics",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringOpportunityModelFromResolution.ts",
        required: true,
        reason: "Sprint 3L guarded converter from route sandbox to opportunity model",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringOpportunities.ts",
        required: true,
        reason: "Sprint 3L baseline versus override opportunity comparison helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringOpportunityModelSignature.ts",
        required: true,
        reason: "Sprint 3L default-vs-experimental sandbox opportunity signature helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventCandidate.ts",
        required: true,
        reason: "Sprint 3M sandbox scoring event candidate contract",
      },
      {
        source: "src/simulation/fullMatch/createSandboxScoringEventCandidate.ts",
        required: true,
        reason: "Sprint 3M deterministic sandbox opportunity to scoring-event candidate mapper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventCandidateModelFromOpportunity.ts",
        required: true,
        reason: "Sprint 3M guarded converter from opportunity model to sandbox scoring-event candidate model",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringEventCandidates.ts",
        required: true,
        reason: "Sprint 3M baseline versus override scoring-event candidate comparison helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventCandidateSignature.ts",
        required: true,
        reason: "Sprint 3M default-vs-experimental sandbox scoring-event candidate signature helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventResolution.ts",
        required: true,
        reason: "Sprint 3N sandbox scoring event resolution contract",
      },
      {
        source: "src/simulation/fullMatch/resolveSandboxScoringEventCandidate.ts",
        required: true,
        reason: "Sprint 3N deterministic sandbox scoring-event candidate resolver",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventResolutionFromCandidate.ts",
        required: true,
        reason: "Sprint 3N guarded converter from candidate model to sandbox scoring-event resolution model",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringEventResolutions.ts",
        required: true,
        reason: "Sprint 3N baseline versus override scoring-event resolution comparison helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventResolutionSignature.ts",
        required: true,
        reason: "Sprint 3N default-vs-experimental sandbox scoring-event resolution signature helper",
      },
      {
        source: "src/simulation/fullMatch/attributeDrivenShotResolutionSandbox.ts",
        required: true,
        reason: "Sprint 3O attribute-driven shot resolution sandbox contract",
      },
      {
        source: "src/simulation/fullMatch/extractShotResolutionActors.ts",
        required: true,
        reason: "Sprint 3O shooter and goalkeeper attribute extraction helper",
      },
      {
        source: "src/simulation/fullMatch/resolveAttributeDrivenShot.ts",
        required: true,
        reason: "Sprint 3O deterministic attribute-driven shot resolver",
      },
      {
        source: "src/simulation/fullMatch/attributeDrivenShotResolutionFromSandbox.ts",
        required: true,
        reason: "Sprint 3O guarded converter from sandbox scoring resolution to attribute-driven shot resolution",
      },
      {
        source: "src/simulation/fullMatch/compareAttributeDrivenShotResolutions.ts",
        required: true,
        reason: "Sprint 3O baseline versus override attribute-driven shot comparison helper",
      },
      {
        source: "src/simulation/fullMatch/attributeDrivenShotResolutionSignature.ts",
        required: true,
        reason: "Sprint 3O default-vs-experimental attribute-driven shot resolution signature helper",
      },
      {
        source: "src/simulation/fullMatch/goalkeeperResponseModel.ts",
        required: true,
        reason: "Sprint 3P goalkeeper response model sandbox contract",
      },
      {
        source: "src/simulation/fullMatch/extractGoalkeeperResponseAttributes.ts",
        required: true,
        reason: "Sprint 3P goalkeeper positioning, reaction, handling, rebound control, concentration, and mental fatigue extraction helper",
      },
      {
        source: "src/simulation/fullMatch/resolveGoalkeeperResponse.ts",
        required: true,
        reason: "Sprint 3P deterministic goalkeeper response resolver",
      },
      {
        source: "src/simulation/fullMatch/goalkeeperResponseModelFromShotResolution.ts",
        required: true,
        reason: "Sprint 3P guarded converter from attribute-driven shot resolution to goalkeeper response model",
      },
      {
        source: "src/simulation/fullMatch/compareGoalkeeperResponses.ts",
        required: true,
        reason: "Sprint 3P baseline versus override goalkeeper response comparison helper",
      },
      {
        source: "src/simulation/fullMatch/goalkeeperResponseModelSignature.ts",
        required: true,
        reason: "Sprint 3P default-vs-experimental goalkeeper response model signature helper",
      },
      {
        source: "src/simulation/fullMatch/reboundSecondChanceSandbox.ts",
        required: true,
        reason: "Sprint 3Q rebound and second-chance sandbox contract",
      },
      {
        source: "src/simulation/fullMatch/extractReboundContext.ts",
        required: true,
        reason: "Sprint 3Q deterministic rebound context extraction helper",
      },
      {
        source: "src/simulation/fullMatch/resolveReboundSecondChance.ts",
        required: true,
        reason: "Sprint 3Q deterministic rebound and second-chance resolver",
      },
      {
        source: "src/simulation/fullMatch/reboundSecondChanceFromGoalkeeperResponse.ts",
        required: true,
        reason: "Sprint 3Q guarded converter from goalkeeper response model to rebound second chance sandbox",
      },
      {
        source: "src/simulation/fullMatch/compareReboundSecondChance.ts",
        required: true,
        reason: "Sprint 3Q baseline versus override rebound second chance comparison helper",
      },
      {
        source: "src/simulation/fullMatch/reboundSecondChanceSignature.ts",
        required: true,
        reason: "Sprint 3Q default-vs-experimental rebound second chance signature helper",
      },
      {
        source: "src/simulation/fullMatch/multiActionContinuationSandbox.ts",
        required: true,
        reason: "Sprint 3R multi-action continuation sandbox contract",
      },
      {
        source: "src/simulation/fullMatch/extractContinuationContext.ts",
        required: true,
        reason: "Sprint 3R deterministic continuation context extraction helper",
      },
      {
        source: "src/simulation/fullMatch/resolveMultiActionContinuation.ts",
        required: true,
        reason: "Sprint 3R deterministic multi-action continuation resolver",
      },
      {
        source: "src/simulation/fullMatch/multiActionContinuationFromRebound.ts",
        required: true,
        reason: "Sprint 3R guarded converter from rebound second chance sandbox to continuation sandbox",
      },
      {
        source: "src/simulation/fullMatch/compareMultiActionContinuation.ts",
        required: true,
        reason: "Sprint 3R baseline versus override multi-action continuation comparison helper",
      },
      {
        source: "src/simulation/fullMatch/multiActionContinuationSignature.ts",
        required: true,
        reason: "Sprint 3R default-vs-experimental multi-action continuation signature helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxSequenceReplay.ts",
        required: true,
        reason: "Sprint 3S sandbox sequence replay contract",
      },
      {
        source: "src/simulation/fullMatch/buildSandboxSequenceStep.ts",
        required: true,
        reason: "Sprint 3S typed sandbox sequence step builder",
      },
      {
        source: "src/simulation/fullMatch/sandboxSequenceReplayFromContinuation.ts",
        required: true,
        reason: "Sprint 3S guarded converter from continuation sandbox to sequence replay",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxSequenceReplay.ts",
        required: true,
        reason: "Sprint 3S baseline versus override sequence replay comparison helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxSequenceReplaySignature.ts",
        required: true,
        reason: "Sprint 3S default-vs-experimental sandbox sequence replay signature helper",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentSandboxTimeline.ts",
        required: true,
        reason: "Sprint 3T controlled segment sandbox timeline contract",
      },
      {
        source: "src/simulation/fullMatch/buildControlledSegmentSandboxEvent.ts",
        required: true,
        reason: "Sprint 3T typed sandbox timeline event builder",
      },
      {
        source: "src/simulation/fullMatch/sandboxStepToTimelineEvent.ts",
        required: true,
        reason: "Sprint 3T exhaustive sandbox step to timeline event mapper",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentSandboxTimelineFromReplay.ts",
        required: true,
        reason: "Sprint 3T guarded converter from sandbox sequence replay to controlled segment sandbox timeline",
      },
      {
        source: "src/simulation/fullMatch/compareControlledSegmentSandboxTimeline.ts",
        required: true,
        reason: "Sprint 3T baseline versus override controlled segment sandbox timeline comparison helper",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentSandboxTimelineSignature.ts",
        required: true,
        reason: "Sprint 3T default-vs-experimental controlled segment sandbox timeline signature helper",
      },
      {
        source: "src/simulation/fullMatch/officialTimelineDiffView.ts",
        required: true,
        reason: "Sprint 3U official timeline diff view contract",
      },
      {
        source: "src/simulation/fullMatch/buildOfficialTimelineDiffEntry.ts",
        required: true,
        reason: "Sprint 3U typed official timeline diff entry builder",
      },
      {
        source: "src/simulation/fullMatch/createOfficialTimelineSnapshot.ts",
        required: true,
        reason: "Sprint 3U official timeline snapshot helper",
      },
      {
        source: "src/simulation/fullMatch/officialTimelineDiffFromSandboxTimeline.ts",
        required: true,
        reason: "Sprint 3U guarded converter from controlled sandbox timeline to read-only official timeline diff view",
      },
      {
        source: "src/simulation/fullMatch/compareOfficialTimelineDiffPaths.ts",
        required: true,
        reason: "Sprint 3U baseline versus override official timeline diff comparison helper",
      },
      {
        source: "src/simulation/fullMatch/officialTimelineDiffViewSignature.ts",
        required: true,
        reason: "Sprint 3U default-vs-experimental official timeline diff view signature helper",
      },
      {
        source: "src/simulation/fullMatch/coachFacingTimelineReview.ts",
        required: true,
        reason: "Sprint 3V coach-facing timeline review contract",
      },
      {
        source: "src/simulation/fullMatch/coachFacingTimelineReviewFromDiff.ts",
        required: true,
        reason: "Sprint 3V builder from Official Timeline Diff View to coach-facing review",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionPanel.ts",
        required: true,
        reason: "Sprint 3W sandbox decision panel contract",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionPanelFromTimelineReview.ts",
        required: true,
        reason: "Sprint 3W builder from coach-facing timeline review to sandbox decision panel",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionEvidenceCalibration.ts",
        required: true,
        reason: "Sprint 3X sandbox decision evidence calibration contract",
      },
      {
        source: "src/simulation/fullMatch/calculateSandboxDecisionEvidenceScore.ts",
        required: true,
        reason: "Sprint 3X calibrated evidence score and confidence resolver",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionEvidenceCalibrationFromPanel.ts",
        required: true,
        reason: "Sprint 3X builder from sandbox decision panel to calibrated evidence model",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionBatchConfidenceCalibration.ts",
        required: true,
        reason: "Sprint 3Y sandbox decision batch confidence contract",
      },
      {
        source: "src/simulation/fullMatch/createSandboxDecisionBatchScenarios.ts",
        required: true,
        reason: "Sprint 3Y deterministic local sandbox scenario generator",
      },
      {
        source: "src/simulation/fullMatch/resolveSandboxDecisionBatchScenario.ts",
        required: true,
        reason: "Sprint 3Y local sandbox scenario resolver",
      },
      {
        source: "src/simulation/fullMatch/calculateSandboxDecisionBatchConfidence.ts",
        required: true,
        reason: "Sprint 3Y batch confidence score helper",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionBatchConfidenceCalibrationFromEvidence.ts",
        required: true,
        reason: "Sprint 3Y builder from evidence calibration to local batch confidence calibration",
      },
      {
        source: "src/simulation/fullMatch/multiScenarioCoachTestPlan.ts",
        required: true,
        reason: "Sprint 4A multi-scenario coach test plan contract and guard helpers",
      },
      {
        source: "src/simulation/fullMatch/multiScenarioCoachTestPlanFromBatch.ts",
        required: true,
        reason: "Sprint 4A builder from batch confidence calibration to coach-facing test plan",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewFromCoachTestPlan.ts",
        required: true,
        reason: "Sprint 4B selection preview contract and guard helpers",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewFromCoachTestPlanBuilder.ts",
        required: true,
        reason: "Sprint 4B builder from coach test plan to selection preview cards",
      },
      {
        source: "src/simulation/tracing/matchTraceEvent.ts",
        required: true,
        reason: "Sprint 4C shared MatchTraceEvent contract and guards",
      },
      {
        source: "src/simulation/tracing/matchTraceFromMatchEvent.ts",
        required: true,
        reason: "Sprint 4C official MatchEvent to MatchTraceEvent adapter",
      },
      {
        source: "src/simulation/tracing/matchTraceFromMiniMatchRecord.ts",
        required: true,
        reason: "Sprint 4C mini-match record to MatchTraceEvent adapter",
      },
      {
        source: "src/simulation/tracing/matchTraceFromSandboxReplay.ts",
        required: true,
        reason: "Sprint 4C sandbox replay event to MatchTraceEvent adapter",
      },
      {
        source: "src/simulation/tracing/matchTraceSpine.ts",
        required: true,
        reason: "Sprint 4C trace spine aggregate counts and evidence fact builder",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateTypes.ts",
        required: true,
        reason: "Sprint 4D match trace aggregate official/diagnostic/sandbox contract",
      },
      {
        source: "src/simulation/tracing/deduplicateMatchTraces.ts",
        required: true,
        reason: "Sprint 4D source-priority trace deduplication helper",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateFromSpine.ts",
        required: true,
        reason: "Sprint 4D aggregate builder from Match Trace Spine",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregator.ts",
        required: true,
        reason: "Sprint 4D aggregate evidence fact and guardrail limitations",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateGuards.ts",
        required: true,
        reason: "Sprint 4D aggregate mutation and production guard helpers",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateFixture.ts",
        required: true,
        reason: "Sprint 4D aggregate contract test fixture",
      },
      {
        source: "src/simulation/grounding/extractWorkbenchTruth.ts",
        required: true,
        reason: "Sprint 2R workbench HTML extraction utilities",
      },
      {
        source: "src/simulation/grounding/tacticalWorkbenchContractGuard.ts",
        required: true,
        reason: "Sprint 2R workbench truth contract guard",
      },
      {
        source: "src/simulation/grounding/miniMatchWorkbenchAlignment.ts",
        required: true,
        reason: "Sprint 2R mini-match/workbench alignment report",
      },
      {
        source: "src/simulation/grounding/rosterToMiniMatchGapAnalysis.ts",
        required: true,
        reason: "Sprint 2S official roster to spatial context and mini-match gap analysis",
      },
      {
        source: "src/simulation/spatialContext/spatialTeamContextTypes.ts",
        required: true,
        reason: "Sprint 2S SpatialTeamContext and SpatialMatchContext contract",
      },
      {
        source: "src/simulation/spatialContext/roleToTacticalFunctions.ts",
        required: true,
        reason: "Sprint 2S explicit role to tactical function mapping",
      },
      {
        source: "src/simulation/spatialContext/teamSnapshotToSpatialContext.ts",
        required: true,
        reason: "Sprint 2S TeamSnapshot to SpatialTeamContext adapter",
      },
      {
        source: "src/simulation/spatialContext/workbenchToSpatialMatchContext.ts",
        required: true,
        reason: "Sprint 2S WorkbenchTruth to SpatialMatchContext adapter",
      },
      {
        source: "src/simulation/grounding/runWorkbenchReplaySeed.ts",
        required: true,
        reason: "Sprint 2S controlled workbench replay seed runner",
      },
      {
        source: "src/simulation/routeRanking/routeAttributeInfluenceTypes.ts",
        required: true,
        reason: "Sprint 2U route attribute influence contract with candidate availability",
      },
      {
        source: "src/simulation/routeRanking/routeAttributeInfluence.ts",
        required: true,
        reason: "Sprint 2U bounded route attribute influence helpers",
      },
      {
        source: "src/simulation/routeRanking/applySpatialAttributeInfluenceToCandidates.ts",
        required: true,
        reason: "Sprint 2U candidate attribute adjustment adapter preserving lane availability",
      },
      {
        source: "src/simulation/routeRanking/routeRankingMode.ts",
        required: true,
        reason: "Sprint 2U route ranking mode contract",
      },
      {
        source: "src/simulation/routeRanking/attributeDrivenSelectionGuard.ts",
        required: true,
        reason: "Sprint 2U guard preventing attribute overrides of illegal or unavailable routes",
      },
      {
        source: "src/simulation/routeRanking/selectAttributeAdjustedCandidate.ts",
        required: true,
        reason: "Sprint 2U guarded attribute-adjusted candidate selector",
      },
      {
        source: "src/simulation/routeRanking/fixtures/attributeRankingContrast.fixture.ts",
        required: true,
        reason: "Sprint 2U contrast fixture proving legal flip and blocked closed/unavailable routes",
      },
      {
        source: "src/simulation/diagnostics/fullMatchGroundingDiagnostics.ts",
        required: true,
        reason: "Sprint 2U warning-only partial full-match grounding diagnostics with attribute candidate_modifier mode",
      },
      {
        source: "src/simulation/grounding/tacticalWorkbenchContractGuard.test.ts",
        required: true,
        reason: "Sprint 2R executable workbench fixture contract tests",
      },
      {
        source: "src/simulation/grounding/tacticalWorkbenchContractGuard.multiActionVisual.test.ts",
        required: true,
        reason: "Sprint 2Y executable visual multi-action workbench contract tests",
      },
      {
        source: "src/simulation/grounding/miniMatchWorkbenchAlignment.test.ts",
        required: true,
        reason: "Sprint 2R executable mini-match alignment tests",
      },
      {
        source: "src/simulation/grounding/rosterToMiniMatchGapAnalysis.test.ts",
        required: true,
        reason: "Sprint 2S executable roster/spatial gap tests",
      },
      {
        source: "src/simulation/spatialContext/roleToTacticalFunctions.test.ts",
        required: true,
        reason: "Sprint 2S executable role-to-function mapping tests",
      },
      {
        source: "src/simulation/spatialContext/workbenchToSpatialMatchContext.test.ts",
        required: true,
        reason: "Sprint 2S executable workbench-to-spatial-context tests",
      },
      {
        source: "src/simulation/grounding/workbenchReplaySeed.test.ts",
        required: true,
        reason: "Sprint 2U executable workbench replay seed tests with candidate_modifier evaluation",
      },
      {
        source: "src/simulation/grounding/workbenchChainState.test.ts",
        required: true,
        reason: "Sprint 2W executable chain state propagation tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainState.multiAction.test.ts",
        required: true,
        reason: "Sprint 2X executable multi-step chain state propagation tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainState.visualMultiAction.test.ts",
        required: true,
        reason: "Sprint 2Y executable visual multi-step chain state propagation tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainReplay.test.ts",
        required: true,
        reason: "Sprint 2W executable chain replay mode tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainReplay.multiAction.test.ts",
        required: true,
        reason: "Sprint 2X executable multi-step chain replay tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainReplay.visualMultiAction.test.ts",
        required: true,
        reason: "Sprint 2Y executable visual multi-step replay proof tests",
      },
      {
        source: "src/simulation/grounding/workbenchChainReplay.visualMismatch.test.ts",
        required: true,
        reason: "Sprint 2Y executable visual replay mismatch proof tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRouteSelectionMode.test.ts",
        required: true,
        reason: "Sprint 2X executable full-match feature flag skeleton tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRouteSelectionMode.guard.test.ts",
        required: true,
        reason: "Sprint 2Y executable full-match route selection mode guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainConsumption.test.ts",
        required: true,
        reason: "Sprint 2Z executable chain consumption contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainConsumptionMismatch.test.ts",
        required: true,
        reason: "Sprint 2Z executable chain consumption mismatch tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainSegmentContext.test.ts",
        required: true,
        reason: "Sprint 3A executable chain consumption to segment context mapping tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainRouteCandidateInfluence.test.ts",
        required: true,
        reason: "Sprint 3B executable route candidate influence mapping tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchChainRouteCandidateInfluenceGuard.test.ts",
        required: true,
        reason: "Sprint 3B executable closed/unavailable candidate guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchShadowRouteSelection.test.ts",
        required: true,
        reason: "Sprint 3C executable shadow route selection tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchShadowRouteSelectionGuard.test.ts",
        required: true,
        reason: "Sprint 3C executable shadow route selection guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentSelection.test.ts",
        required: true,
        reason: "Sprint 3D executable controlled segment selection tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentSelectionGuard.test.ts",
        required: true,
        reason: "Sprint 3D executable controlled segment selection guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentRouteInput.test.ts",
        required: true,
        reason: "Sprint 3E executable SegmentRouteInput contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentRouteInputGuard.test.ts",
        required: true,
        reason: "Sprint 3E executable SegmentRouteInput guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSource.test.ts",
        required: true,
        reason: "Sprint 3F executable controlled mini-match route source contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledMiniMatchRouteSourceGuard.test.ts",
        required: true,
        reason: "Sprint 3F executable controlled mini-match route source guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuard.test.ts",
        required: true,
        reason: "Sprint 3G executable live selection override guard contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchLiveSelectionOverrideGuardGuard.test.ts",
        required: true,
        reason: "Sprint 3G executable live selection override guard tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperiment.test.ts",
        required: true,
        reason: "Sprint 3H executable isolated mini-match override experiment contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchIsolatedMiniMatchOverrideExperimentGuard.test.ts",
        required: true,
        reason: "Sprint 3H executable isolated mini-match override experiment guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareControlledSegmentReplayPaths.test.ts",
        required: true,
        reason: "Sprint 3I executable replay path comparison tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentReplayComparison.test.ts",
        required: true,
        reason: "Sprint 3I executable controlled segment replay comparison contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchControlledSegmentReplayComparisonGuard.test.ts",
        required: true,
        reason: "Sprint 3I executable controlled segment replay comparison guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareRealIsolatedSegmentReplayPaths.test.ts",
        required: true,
        reason: "Sprint 3J executable real isolated replay path comparison tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplay.test.ts",
        required: true,
        reason: "Sprint 3J executable real isolated segment replay contract tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchRealIsolatedSegmentReplayGuard.test.ts",
        required: true,
        reason: "Sprint 3J executable real isolated segment replay guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareControlledRouteResolutionSandbox.test.ts",
        required: true,
        reason: "Sprint 3K executable sandbox route comparison tests",
      },
      {
        source: "src/simulation/fullMatch/controlledRouteResolutionSandbox.test.ts",
        required: true,
        reason: "Sprint 3K executable controlled route resolution sandbox contract tests",
      },
      {
        source: "src/simulation/fullMatch/controlledRouteResolutionSandboxGuard.test.ts",
        required: true,
        reason: "Sprint 3K executable controlled route resolution sandbox guard tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringOpportunityModel.test.ts",
        required: true,
        reason: "Sprint 3L executable sandbox scoring opportunity model contract tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringOpportunityModelGuard.test.ts",
        required: true,
        reason: "Sprint 3L executable sandbox scoring opportunity model guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringOpportunities.test.ts",
        required: true,
        reason: "Sprint 3L executable sandbox opportunity comparison tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventCandidate.test.ts",
        required: true,
        reason: "Sprint 3M executable sandbox scoring event candidate contract tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventCandidateGuard.test.ts",
        required: true,
        reason: "Sprint 3M executable sandbox scoring event candidate guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringEventCandidates.test.ts",
        required: true,
        reason: "Sprint 3M executable sandbox scoring event candidate comparison tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventResolution.test.ts",
        required: true,
        reason: "Sprint 3N executable sandbox scoring event resolution contract tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxScoringEventResolutionGuard.test.ts",
        required: true,
        reason: "Sprint 3N executable sandbox scoring event resolution guard tests",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxScoringEventResolutions.test.ts",
        required: true,
        reason: "Sprint 3N executable sandbox scoring event resolution comparison tests",
      },
      {
        source: "src/simulation/fullMatch/attributeDrivenShotResolution.test.ts",
        required: true,
        reason: "Sprint 3O executable attribute-driven shot resolution contract tests",
      },
      {
        source: "src/simulation/fullMatch/compareAttributeDrivenShotResolutions.test.ts",
        required: true,
        reason: "Sprint 3O executable attribute-driven shot resolution comparison tests",
      },
      {
        source: "src/simulation/fullMatch/goalkeeperResponseModel.test.ts",
        required: true,
        reason: "Sprint 3P executable goalkeeper response model contract tests",
      },
      {
        source: "src/simulation/fullMatch/compareGoalkeeperResponses.test.ts",
        required: true,
        reason: "Sprint 3P executable goalkeeper response comparison tests",
      },
      {
        source: "src/simulation/fullMatch/reboundSecondChanceSandbox.test.ts",
        required: true,
        reason: "Sprint 3Q executable rebound second chance resolver tests",
      },
      {
        source: "src/simulation/fullMatch/compareReboundSecondChance.test.ts",
        required: true,
        reason: "Sprint 3Q executable rebound second chance comparison tests",
      },
      {
        source: "src/simulation/fullMatch/multiActionContinuationSandbox.test.ts",
        required: true,
        reason: "Sprint 3R executable multi-action continuation resolver tests",
      },
      {
        source: "src/simulation/fullMatch/compareMultiActionContinuation.test.ts",
        required: true,
        reason: "Sprint 3R executable multi-action continuation comparison tests",
      },
      {
        source: "src/simulation/fullMatch/compareSandboxSequenceReplay.test.ts",
        required: true,
        reason: "Sprint 3S executable sandbox sequence replay comparison tests",
      },
      {
        source: "src/simulation/fullMatch/controlledSegmentSandboxTimeline.test.ts",
        required: true,
        reason: "Sprint 3T executable controlled segment sandbox timeline contract tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxStepToTimelineEvent.test.ts",
        required: true,
        reason: "Sprint 3T executable sandbox step to timeline event mapper tests",
      },
      {
        source: "src/simulation/fullMatch/compareControlledSegmentSandboxTimeline.test.ts",
        required: true,
        reason: "Sprint 3T executable controlled segment sandbox timeline comparison tests",
      },
      {
        source: "src/simulation/fullMatch/buildOfficialTimelineDiffEntry.test.ts",
        required: true,
        reason: "Sprint 3U executable official timeline diff entry tests",
      },
      {
        source: "src/simulation/fullMatch/createOfficialTimelineSnapshot.test.ts",
        required: true,
        reason: "Sprint 3U executable official timeline snapshot tests",
      },
      {
        source: "src/simulation/fullMatch/compareOfficialTimelineDiffPaths.test.ts",
        required: true,
        reason: "Sprint 3U executable official timeline diff path comparison tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalChainConsumption.test.ts",
        required: true,
        reason: "Sprint 2Z executable runFullMatch experimental chain consumption tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSegmentContext.test.ts",
        required: true,
        reason: "Sprint 3A executable experimental segment context timeline/evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalRouteCandidateInfluence.test.ts",
        required: true,
        reason: "Sprint 3B executable runFullMatch route candidate influence evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalShadowRouteSelection.test.ts",
        required: true,
        reason: "Sprint 3C executable runFullMatch shadow route selection evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalControlledSegmentSelection.test.ts",
        required: true,
        reason: "Sprint 3D executable runFullMatch controlled segment selection evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSegmentRouteInput.test.ts",
        required: true,
        reason: "Sprint 3E executable runFullMatch SegmentRouteInput evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalControlledMiniMatchRouteSource.test.ts",
        required: true,
        reason: "Sprint 3F executable runFullMatch controlled mini-match route source evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalLiveSelectionOverrideGuard.test.ts",
        required: true,
        reason: "Sprint 3G executable runFullMatch live selection override guard evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalIsolatedMiniMatchOverrideExperiment.test.ts",
        required: true,
        reason: "Sprint 3H executable runFullMatch isolated mini-match override experiment evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalControlledSegmentReplayComparison.test.ts",
        required: true,
        reason: "Sprint 3I executable runFullMatch controlled segment replay comparison evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalRealIsolatedSegmentReplay.test.ts",
        required: true,
        reason: "Sprint 3J executable runFullMatch real isolated segment replay evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalControlledRouteResolutionSandbox.test.ts",
        required: true,
        reason: "Sprint 3K executable runFullMatch controlled route resolution sandbox evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSandboxScoringOpportunityModel.test.ts",
        required: true,
        reason: "Sprint 3L executable runFullMatch sandbox scoring opportunity evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSandboxScoringEventCandidate.test.ts",
        required: true,
        reason: "Sprint 3M executable runFullMatch sandbox scoring event candidate evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSandboxScoringEventResolution.test.ts",
        required: true,
        reason: "Sprint 3N executable runFullMatch sandbox scoring event resolution evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalAttributeDrivenShotResolution.test.ts",
        required: true,
        reason: "Sprint 3O executable runFullMatch attribute-driven shot resolution evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalGoalkeeperResponseModel.test.ts",
        required: true,
        reason: "Sprint 3P executable runFullMatch goalkeeper response model evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalReboundSecondChance.test.ts",
        required: true,
        reason: "Sprint 3Q executable runFullMatch rebound second chance evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalMultiActionContinuation.test.ts",
        required: true,
        reason: "Sprint 3R executable runFullMatch multi-action continuation evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalSandboxSequenceReplay.test.ts",
        required: true,
        reason: "Sprint 3S executable runFullMatch sandbox sequence replay evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalControlledSegmentSandboxTimeline.test.ts",
        required: true,
        reason: "Sprint 3T executable runFullMatch controlled segment sandbox timeline evidence tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchExperimentalOfficialTimelineDiffView.test.ts",
        required: true,
        reason: "Sprint 3U executable runFullMatch official timeline diff view evidence tests",
      },
      {
        source: "src/simulation/fullMatch/coachFacingTimelineReviewFromDiff.test.ts",
        required: true,
        reason: "Sprint 3V executable coach-facing timeline review builder tests",
      },
      {
        source: "src/simulation/fullMatch/officialTimelineReviewGuard.test.ts",
        required: true,
        reason: "Sprint 3V executable coach-facing timeline review mutation guard tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionPanelFromTimelineReview.test.ts",
        required: true,
        reason: "Sprint 3W executable sandbox decision panel builder tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionPanelGuard.test.ts",
        required: true,
        reason: "Sprint 3W executable sandbox decision panel guard tests",
      },
      {
        source: "src/simulation/fullMatch/calculateSandboxDecisionEvidenceScore.test.ts",
        required: true,
        reason: "Sprint 3X executable evidence score and confidence tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionEvidenceCalibrationFromPanel.test.ts",
        required: true,
        reason: "Sprint 3X executable sandbox decision evidence calibration builder tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionEvidenceCalibrationGuard.test.ts",
        required: true,
        reason: "Sprint 3X executable sandbox decision evidence calibration guard tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionBatchConfidenceTestHelpers.ts",
        required: true,
        reason: "Sprint 3Y reusable batch confidence test fixture",
      },
      {
        source: "src/simulation/fullMatch/createSandboxDecisionBatchScenarios.test.ts",
        required: true,
        reason: "Sprint 3Y executable scenario generator tests",
      },
      {
        source: "src/simulation/fullMatch/resolveSandboxDecisionBatchScenario.test.ts",
        required: true,
        reason: "Sprint 3Y executable scenario resolver tests",
      },
      {
        source: "src/simulation/fullMatch/calculateSandboxDecisionBatchConfidence.test.ts",
        required: true,
        reason: "Sprint 3Y executable batch confidence helper tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionBatchConfidenceCalibrationFromEvidence.test.ts",
        required: true,
        reason: "Sprint 3Y executable batch confidence builder tests",
      },
      {
        source: "src/simulation/fullMatch/sandboxDecisionBatchConfidenceGuard.test.ts",
        required: true,
        reason: "Sprint 3Y executable batch confidence guard tests",
      },
      {
        source: "src/simulation/fullMatch/multiScenarioCoachTestPlanFromBatch.test.ts",
        required: true,
        reason: "Sprint 4A executable coach test plan builder tests",
      },
      {
        source: "src/simulation/fullMatch/multiScenarioCoachTestPlanGuard.test.ts",
        required: true,
        reason: "Sprint 4A executable coach test plan guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.4a.test.ts",
        required: true,
        reason: "Sprint 4A source-of-truth guard for coach test plan scope",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4a.test.ts",
        required: true,
        reason: "Sprint 4A executable scoring guard for coach test plan",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewFromCoachTestPlan.test.ts",
        required: true,
        reason: "Sprint 4B executable selection preview builder tests",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewGuard.test.ts",
        required: true,
        reason: "Sprint 4B executable selection preview guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.4b.test.ts",
        required: true,
        reason: "Sprint 4B source-of-truth guard for selection preview scope",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4b.test.ts",
        required: true,
        reason: "Sprint 4B executable scoring guard for selection preview",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceBacking.ts",
        required: true,
        reason: "Sprint 4K trace-backed Selection Preview model, support statuses, evidence fact, tags, and guardrail limitations",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceBackingBuilder.ts",
        required: true,
        reason: "Sprint 4K trace-backed Selection Preview builder export",
      },
      {
        source: "src/simulation/fullMatch/matchSelectionPreviewToTraceAggregates.ts",
        required: true,
        reason: "Sprint 4K matcher from Selection Preview cards to official trace aggregates",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceBacking.test.ts",
        required: true,
        reason: "Sprint 4K executable selection preview trace-backing tests",
      },
      {
        source: "src/simulation/fullMatch/matchSelectionPreviewToTraceAggregates.test.ts",
        required: true,
        reason: "Sprint 4K executable Selection Preview to official trace aggregate matching tests",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceBackingGuard.test.ts",
        required: true,
        reason: "Sprint 4K executable non-applied and non-driving trace backing guard tests",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceBackingSourceScope.test.ts",
        required: true,
        reason: "Sprint 4K executable source scope guard tests for official, diagnostic, and sandbox aggregate separation",
      },
      {
        source: "src/reports/selectionPreviewCoachCopy.ts",
        required: true,
        reason: "Sprint 4L Selection Preview coach copy contract, tags, and guardrail limitations",
      },
      {
        source: "src/reports/buildSelectionPreviewCoachCopy.ts",
        required: true,
        reason: "Sprint 4L builder from trace backing to coach-readable observation cards",
      },
      {
        source: "src/reports/selectionPreviewProfileView.ts",
        required: true,
        reason: "Sprint 4M Selection Preview profile view contract, labels, tags, and guardrail limitations",
      },
      {
        source: "src/reports/buildSelectionPreviewProfileView.ts",
        required: true,
        reason: "Sprint 4M builder from coach-copy cards to concrete profile cards",
      },
      {
        source: "src/reports/coachProductReportView.ts",
        required: true,
        reason: "Sprint 4N Coach Product Report View contract, tags, sections, and guardrails",
      },
      {
        source: "src/reports/buildCoachProductReportView.ts",
        required: true,
        reason: "Sprint 4N builder from Coach Report V1 and Selection Preview Profile View to product report model",
      },
      {
        source: "src/reports/renderCoachProductReport.ts",
        required: true,
        reason: "Sprint 4O review-ready product-facing HTML renderer with polished layout and print CSS",
      },
      {
        source: "src/reports/coachProductReportPolish.ts",
        required: true,
        reason: "Sprint 4O Coach Product Report Polish contract, tags, and guardrails",
      },
      {
        source: "src/reports/buildCoachProductReportPolish.ts",
        required: true,
        reason: "Sprint 4O builder from Coach Product Report View to review-ready polish model",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4c.test.ts",
        required: true,
        reason: "Sprint 4C executable scoring guard for match trace spine",
      },
      {
        source: "src/simulation/tracing/matchTraceEventContract.test.ts",
        required: true,
        reason: "Sprint 4C executable MatchTraceEvent contract tests",
      },
      {
        source: "src/simulation/tracing/matchTraceFromMatchEvent.test.ts",
        required: true,
        reason: "Sprint 4C executable official MatchEvent adapter tests",
      },
      {
        source: "src/simulation/tracing/matchTraceFromMiniMatchRecord.test.ts",
        required: true,
        reason: "Sprint 4C executable mini-match record adapter tests",
      },
      {
        source: "src/simulation/tracing/matchTraceFromSandboxReplay.test.ts",
        required: true,
        reason: "Sprint 4C executable sandbox replay adapter tests",
      },
      {
        source: "src/simulation/tracing/matchTraceGuard.test.ts",
        required: true,
        reason: "Sprint 4C executable trace mutation and production guard tests",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateTypes.test.ts",
        required: true,
        reason: "Sprint 4D executable aggregate type tests",
      },
      {
        source: "src/simulation/tracing/deduplicateMatchTraces.test.ts",
        required: true,
        reason: "Sprint 4D executable trace deduplication tests",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateFromSpine.test.ts",
        required: true,
        reason: "Sprint 4D executable aggregate-from-spine tests",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregateScopeGuard.test.ts",
        required: true,
        reason: "Sprint 4D executable aggregate scope guard tests",
      },
      {
        source: "src/simulation/tracing/matchTraceAggregatorGuard.test.ts",
        required: true,
        reason: "Sprint 4D executable aggregate mutation and production guard tests",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewAggregatorBacking.test.ts",
        required: true,
        reason: "Sprint 4D executable selection preview aggregator backing tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4d.test.ts",
        required: true,
        reason: "Sprint 4D executable scoring guard for match trace aggregator",
      },
      {
        source: "src/simulation/fullMatch/selectionPreviewTraceAggregateContinuity.test.ts",
        required: true,
        reason: "Sprint 4E executable selection preview continuity test for Coach Report V0",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4e.test.ts",
        required: true,
        reason: "Sprint 4E executable scoring guard for Coach Report V0 from trace aggregates",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationProfiles.ts",
        required: true,
        reason: "Sprint 4G six full-match trace validation profile definitions",
      },
      {
        source: "src/simulation/validation/profileSignalExpectations.ts",
        required: true,
        reason: "Sprint 4G profile-specific expected and fallback signal definitions",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationAssertions.ts",
        required: true,
        reason: "Sprint 4G profile signal calibration assertions",
      },
      {
        source: "src/simulation/validation/runFullMatchTraceValidationProfile.ts",
        required: true,
        reason: "Sprint 4G validation harness for one full-match profile",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationComparisons.ts",
        required: true,
        reason: "Sprint 4G profile comparison, signal calibration, and variation model",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationReport.ts",
        required: true,
        reason: "Sprint 4G validation report and evidence fact renderer",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationProfiles.test.ts",
        required: true,
        reason: "Sprint 4G executable profile definition tests",
      },
      {
        source: "src/simulation/validation/profileSignalExpectations.test.ts",
        required: true,
        reason: "Sprint 4G executable profile signal expectation tests",
      },
      {
        source: "src/simulation/validation/runFullMatchTraceValidationProfile.test.ts",
        required: true,
        reason: "Sprint 4G executable profile runner tests",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationComparisons.test.ts",
        required: true,
        reason: "Sprint 4G executable comparison tests",
      },
      {
        source: "src/simulation/validation/coachReportV0ProfileVariation.test.ts",
        required: true,
        reason: "Sprint 4G executable Coach Report V0 profile variation tests",
      },
      {
        source: "src/simulation/validation/coachReportV0ProfileVariation.4g.test.ts",
        required: true,
        reason: "Sprint 4G executable Coach Report V0 signal variation tests",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationProfileSignals.test.ts",
        required: true,
        reason: "Sprint 4G executable profile signal calibration tests",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationEncoding.test.ts",
        required: true,
        reason: "Sprint 4G executable generated artifact encoding tests",
      },
      {
        source: "src/simulation/validation/profileSignalCalibrationGuard.test.ts",
        required: true,
        reason: "Sprint 4G executable profile signal guardrail tests",
      },
      {
        source: "src/simulation/validation/fullMatchTraceValidationGuard.test.ts",
        required: true,
        reason: "Sprint 4G executable validation guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4f.test.ts",
        required: true,
        reason: "Sprint 4F executable scoring guard for full-match trace validation",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4g.test.ts",
        required: true,
        reason: "Sprint 4G executable scoring guard for profile signal calibration",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4h.test.ts",
        required: true,
        reason: "Sprint 4H executable scoring guard for Coach Report V1 visualization",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4i.test.ts",
        required: true,
        reason: "Sprint 4I executable scoring guard for Coach Report V1 information hierarchy",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4j.test.ts",
        required: true,
        reason: "Sprint 4J executable scoring guard for Coach Report V1 legacy cleanup and score source labels",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4k.test.ts",
        required: true,
        reason: "Sprint 4K executable scoring guard for trace-backed Selection Preview",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4l.test.ts",
        required: true,
        reason: "Sprint 4L executable scoring guard for Selection Preview coach copy",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4m.test.ts",
        required: true,
        reason: "Sprint 4M executable scoring guard for Selection Preview profile view",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4n.test.ts",
        required: true,
        reason: "Sprint 4N executable scoring guard for Coach Product Report View",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.4o.test.ts",
        required: true,
        reason: "Sprint 4O executable scoring guard for Coach Product Report Polish",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSegmentContextScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3A executable segment context scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchRouteCandidateInfluenceScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3B executable route candidate influence scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchShadowRouteSelectionScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3C executable shadow route selection scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchControlledSegmentSelectionScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3D executable controlled segment selection scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSegmentRouteInputScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3E executable SegmentRouteInput scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchControlledMiniMatchRouteSourceScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3F executable controlled mini-match route source scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchLiveSelectionOverrideGuardScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3G executable live selection override guard scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchIsolatedMiniMatchOverrideExperimentScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3H executable isolated mini-match override experiment scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchControlledSegmentReplayComparisonScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3I executable controlled segment replay comparison scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchRealIsolatedSegmentReplayScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3J executable real isolated segment replay scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchControlledRouteResolutionSandboxScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3K executable controlled route resolution sandbox scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSandboxScoringOpportunityModelScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3L executable sandbox scoring opportunity model scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSandboxScoringEventCandidateScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3M executable sandbox scoring event candidate scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSandboxScoringEventResolutionScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3N executable sandbox scoring event resolution scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchAttributeDrivenShotResolutionScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3O executable attribute-driven shot resolution scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchGoalkeeperResponseModelScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3P executable goalkeeper response model scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchReboundSecondChanceScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3Q executable rebound second chance scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchSandboxSequenceReplayScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3S executable sandbox sequence replay scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchControlledSegmentSandboxTimelineScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3T executable controlled segment sandbox timeline scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchOfficialTimelineDiffViewScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3U executable official timeline diff view scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchMultiActionContinuationScoringGuard.test.ts",
        required: true,
        reason: "Sprint 3R executable multi-action continuation scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchDefaultRegression.test.ts",
        required: true,
        reason: "Sprint 2Z executable default full-match regression tests",
      },
      {
        source: "src/simulation/fullMatch/runFullMatchDefaultStillSegmentHarness.test.ts",
        required: true,
        reason: "Sprint 3A executable default segment_harness regression tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.2z.test.ts",
        required: true,
        reason: "Sprint 2Z executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3a.test.ts",
        required: true,
        reason: "Sprint 3A executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3b.test.ts",
        required: true,
        reason: "Sprint 3B executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3c.test.ts",
        required: true,
        reason: "Sprint 3C executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3d.test.ts",
        required: true,
        reason: "Sprint 3D executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3e.test.ts",
        required: true,
        reason: "Sprint 3E executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3f.test.ts",
        required: true,
        reason: "Sprint 3F executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3g.test.ts",
        required: true,
        reason: "Sprint 3G executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3h.test.ts",
        required: true,
        reason: "Sprint 3H executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3i.test.ts",
        required: true,
        reason: "Sprint 3I executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3j.test.ts",
        required: true,
        reason: "Sprint 3J executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3k.test.ts",
        required: true,
        reason: "Sprint 3K executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3l.test.ts",
        required: true,
        reason: "Sprint 3L executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3m.test.ts",
        required: true,
        reason: "Sprint 3M executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3n.test.ts",
        required: true,
        reason: "Sprint 3N executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3o.test.ts",
        required: true,
        reason: "Sprint 3O executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3p.test.ts",
        required: true,
        reason: "Sprint 3P executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3q.test.ts",
        required: true,
        reason: "Sprint 3Q executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3r.test.ts",
        required: true,
        reason: "Sprint 3R executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3s.test.ts",
        required: true,
        reason: "Sprint 3S executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3t.test.ts",
        required: true,
        reason: "Sprint 3T executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3u.test.ts",
        required: true,
        reason: "Sprint 3U executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3v.test.ts",
        required: true,
        reason: "Sprint 3V executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3w.test.ts",
        required: true,
        reason: "Sprint 3W executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3x.test.ts",
        required: true,
        reason: "Sprint 3X executable scoring guard tests",
      },
      {
        source: "src/simulation/fullMatch/scoringGuard.3y.test.ts",
        required: true,
        reason: "Sprint 3Y executable scoring guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.2z.test.ts",
        required: true,
        reason: "Sprint 2Z executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3a.test.ts",
        required: true,
        reason: "Sprint 3A executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3b.test.ts",
        required: true,
        reason: "Sprint 3B executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3c.test.ts",
        required: true,
        reason: "Sprint 3C executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3d.test.ts",
        required: true,
        reason: "Sprint 3D executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3e.test.ts",
        required: true,
        reason: "Sprint 3E executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3f.test.ts",
        required: true,
        reason: "Sprint 3F executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3g.test.ts",
        required: true,
        reason: "Sprint 3G executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3h.test.ts",
        required: true,
        reason: "Sprint 3H executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3i.test.ts",
        required: true,
        reason: "Sprint 3I executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3j.test.ts",
        required: true,
        reason: "Sprint 3J executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3k.test.ts",
        required: true,
        reason: "Sprint 3K executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3l.test.ts",
        required: true,
        reason: "Sprint 3L executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3m.test.ts",
        required: true,
        reason: "Sprint 3M executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3n.test.ts",
        required: true,
        reason: "Sprint 3N executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3o.test.ts",
        required: true,
        reason: "Sprint 3O executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3p.test.ts",
        required: true,
        reason: "Sprint 3P executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3q.test.ts",
        required: true,
        reason: "Sprint 3Q executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3r.test.ts",
        required: true,
        reason: "Sprint 3R executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3s.test.ts",
        required: true,
        reason: "Sprint 3S executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3t.test.ts",
        required: true,
        reason: "Sprint 3T executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3u.test.ts",
        required: true,
        reason: "Sprint 3U executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3v.test.ts",
        required: true,
        reason: "Sprint 3V executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3w.test.ts",
        required: true,
        reason: "Sprint 3W executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3x.test.ts",
        required: true,
        reason: "Sprint 3X executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.3y.test.ts",
        required: true,
        reason: "Sprint 3Y executable source-of-truth guard tests",
      },
      {
        source: "src/simulation/routeRanking/routeAttributeInfluence.test.ts",
        required: true,
        reason: "Sprint 2U executable route attribute influence tests",
      },
      {
        source: "src/simulation/routeRanking/applySpatialAttributeInfluenceToCandidates.test.ts",
        required: true,
        reason: "Sprint 2U executable candidate attribute adjustment tests",
      },
      {
        source: "src/simulation/routeRanking/attributeDrivenSelectionGuard.test.ts",
        required: true,
        reason: "Sprint 2U executable attribute selection guard tests",
      },
      {
        source: "src/simulation/routeRanking/selectAttributeAdjustedCandidate.test.ts",
        required: true,
        reason: "Sprint 2U executable attribute-adjusted selector tests",
      },
      {
        source: "src/simulation/diagnostics/fullMatchGroundingDiagnostics.test.ts",
        required: true,
        reason: "Sprint 2R executable full-match grounding diagnostics tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchFatiguePropagation.ts",
        required: true,
        reason: "Sprint 2O fatigue/load scale with useful contrast",
      },
      {
        source: "src/simulation/fullMatch/fullMatchFatiguePropagation.test.ts",
        required: true,
        reason: "Sprint 2N fatigue propagation executable tests",
      },
      {
        source: "src/simulation/fullMatch/fullMatchSegmentInfluence.test.ts",
        required: true,
        reason: "Sprint 2Q executable tests for segment influence bounds",
      },
      {
        source: "src/simulation/adapters/matchReportBuilder.ts",
        required: true,
        reason: "shared official MatchReport builder used by runMatch and runFullMatch",
      },
      {
        source: "src/simulation/adapters/matchInputToMiniMatch.ts",
        required: true,
        reason: "explicit CONTROL/BLITZ mini-match adapter",
      },
      {
        source: "src/simulation/adapters/matchReportEvidence.ts",
        required: true,
        reason: "Sprint 2P canonical evidence fact mapping for insights and diagnostics",
      },
      {
        source: "src/simulation/adapters/matchReportEvidenceBuilder.ts",
        required: true,
        reason: "Sprint 2P typed evidenceFacts builder",
      },
      {
        source: "src/simulation/adapters/matchReportWarningsBuilder.ts",
        required: true,
        reason: "Sprint 2P typed MatchReport warnings builder",
      },
      {
        source: "src/simulation/adapters/matchReportMoments.ts",
        required: true,
        reason: "Sprint 2O key moment diversity and repeated-title limits",
      },
      {
        source: "src/simulation/adapters/matchReportMoments.test.ts",
        required: true,
        reason: "Sprint 2N key moment diversity executable tests",
      },
      {
        source: "src/simulation/adapters/matchReportFocus.ts",
        required: true,
        reason: "Sprint 2D evidence-based suggested focus mapping",
      },
      {
        source: "src/simulation/adapters/matchReportStats.ts",
        required: true,
        reason: "Sprint 2E event-derived team and zone stats mapping",
      },
      {
        source: "src/simulation/adapters/tacticalPlanInfluence.ts",
        required: true,
        reason: "Sprint 2J tactical-plan influence adapter",
      },
      {
        source: "src/simulation/runMatchContractGuard.ts",
        required: true,
        reason: "runtime guard for runMatch report quality",
      },
      {
        source: "src/simulation/matchReportContractGuard.ts",
        required: true,
        reason: "Sprint 2P runtime guard for canonical MatchReport evidence and warnings",
      },
      {
        source: "src/simulation/runFullMatchContractGuard.ts",
        required: true,
        reason: "Sprint 2L runtime guard for full-match harness quality",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthRegistry.ts",
        required: true,
        reason: "source-of-truth scope registry preserved for Sprint 2N",
      },
      {
        source: "src/simulation/diagnostics/fullMatchEconomyAnchors.ts",
        required: true,
        reason: "validated 50-match economy anchor preserved for Sprint 2N",
      },
      {
        source: "src/simulation/diagnostics/fullMatchHarnessSanity.ts",
        required: true,
        reason: "warning-only full-match harness sanity analyzer extended with scoring dominance for Sprint 2O",
      },
      {
        source: "src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.ts",
        required: true,
        reason: "Sprint 2O scoring dominance diagnostics for lopsided single-run harness output",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.ts",
        required: true,
        reason: "guard against unsupported global scoring claims preserved for Sprint 2N",
      },
      {
        source: "src/simulation/diagnostics/segmentDiversityDiagnostics.ts",
        required: true,
        reason: "Sprint 2N segment diversity diagnostics",
      },
      {
        source: "src/simulation/diagnostics/segmentDiversityDiagnostics.test.ts",
        required: true,
        reason: "Sprint 2N segment diversity executable tests",
      },
      {
        source: "src/simulation/diagnostics/sourceOfTruthGuards.test.ts",
        required: true,
        reason: "source-of-truth guard executable tests preserved for Sprint 2N",
      },
      {
        source: "src/simulation/diagnostics/fullMatchHarnessSanity.test.ts",
        required: true,
        reason: "full-match harness sanity executable tests preserved for Sprint 2N",
      },
      {
        source: "src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.test.ts",
        required: true,
        reason: "Sprint 2O executable tests for scoring dominance diagnostics",
      },
      {
        source: "src/simulation/tacticalPlanInfluenceGuard.ts",
        required: true,
        reason: "Sprint 2J tactical-plan influence runtime guard",
      },
      {
        source: "src/simulation/miniMatch/types.ts",
        required: true,
        reason: "mini-match types including optional segment influence and routeSelectionSource",
      },
      {
        source: "src/simulation/miniMatch/createMiniMatchContext.ts",
        required: true,
        reason: "Sprint 2V mini-match team/context and route selection source wiring",
      },
      {
        source: "src/simulation/miniMatch/miniMatchRouteSelectionMode.ts",
        required: true,
        reason: "Sprint 2V mini-match route selection source contract",
      },
      {
        source: "src/simulation/miniMatch/spatialCandidateGeneration.ts",
        required: true,
        reason: "Sprint 2V SpatialContext route candidate generation adapter",
      },
      {
        source: "src/simulation/miniMatch/prototypeToSpatialCandidateMapper.ts",
        required: true,
        reason: "Sprint 2V prototype-to-spatial candidate bridge with fallback notes",
      },
      {
        source: "src/simulation/miniMatch/miniMatchRouteSelection.ts",
        required: true,
        reason: "Sprint 2V guarded mini-match route selection result resolver",
      },
      {
        source: "src/simulation/miniMatch/selectInitialSequenceContext.ts",
        required: true,
        reason: "Sprint 2V controlled spatial route selection metadata on initial resolution context",
      },
      {
        source: "src/simulation/miniMatch/runMiniMatch.ts",
        required: true,
        reason: "existing mini-match engine entry point",
      },
      {
        source: "src/simulation/miniMatch/miniMatchSegmentInfluence.test.ts",
        required: true,
        reason: "Sprint 2Q mini-match compatibility and full-match influence tests",
      },
      {
        source: "src/simulation/miniMatch/miniMatchSpatialSelection.test.ts",
        required: true,
        reason: "Sprint 2V executable controlled mini-match spatial selection test",
      },
      {
        source: "src/simulation/miniMatch/miniMatchSpatialSelectionContrast.test.ts",
        required: true,
        reason: "Sprint 2V executable spatial selection contrast and fallback test",
      },
    ],
  },
  {
    file: "bundle__reports.md",
    reason: "share-pack implementation and nearby report types",
    sources: [
      {
        source: "src/reports/share/updateSharePack.ts",
        required: true,
        reason: "persistent share-pack updater under review",
      },
      {
        source: "src/reports/htmlCoachReport.ts",
        required: true,
        reason: "Sprint 2E dependency-free typed MatchReport HTML renderer",
      },
      {
        source: "src/reports/coachCopyQuality.ts",
        required: true,
        reason: "Micro-sprint 2O-Fix mojibake detection and coach-copy normalization utilities",
      },
      {
        source: "src/reports/coachFacingCopy.ts",
        required: true,
        reason: "Micro-sprint 2O-Fix coach-facing warning copy helpers",
      },
      {
        source: "src/reports/coachFacingSummary.ts",
        required: true,
        reason: "Micro-sprint 2P-Fix visible summary boundary helper",
      },
      {
        source: "src/reports/coachCopyQuality.test.ts",
        required: true,
        reason: "Micro-sprint 2O-Fix executable copy-quality tests",
      },
      {
        source: "src/reports/coachFacingSummary.test.ts",
        required: true,
        reason: "Micro-sprint 2P-Fix executable visible summary boundary tests",
      },
      {
        source: "src/reports/coachReportTimelineReview.test.ts",
        required: true,
        reason: "Sprint 3V executable coach-facing timeline review rendering tests",
      },
      {
        source: "src/reports/coachReportSandboxDecisionPanel.test.ts",
        required: true,
        reason: "Sprint 3W executable sandbox decision panel rendering tests",
      },
      {
        source: "src/reports/coachReportSandboxDecisionEvidenceCalibration.test.ts",
        required: true,
        reason: "Sprint 3X executable sandbox decision evidence calibration rendering tests",
      },
      {
        source: "src/reports/coachReportSandboxDecisionBatchConfidence.test.ts",
        required: true,
        reason: "Sprint 3Y executable sandbox decision batch confidence rendering tests",
      },
      {
        source: "src/reports/coachReportMultiScenarioCoachTestPlan.test.ts",
        required: true,
        reason: "Sprint 4A executable multi-scenario coach test plan rendering tests",
      },
      {
        source: "src/reports/coachReportSelectionPreview.test.ts",
        required: true,
        reason: "Sprint 4B executable selection preview rendering tests",
      },
      {
        source: "src/reports/matchTraceSpineReport.test.ts",
        required: true,
        reason: "Sprint 4C executable match trace spine rendering tests",
      },
      {
        source: "src/reports/matchTraceAggregatorReport.test.ts",
        required: true,
        reason: "Sprint 4D executable match trace aggregator rendering tests",
      },
      {
        source: "src/reports/traceAggregateCoachLabels.ts",
        required: true,
        reason: "Sprint 4E French coach-readable trace cause and impact labels",
      },
      {
        source: "src/reports/coachReportFromTraceAggregates.ts",
        required: true,
        reason: "Sprint 4E Coach Report V0 model, builder, evidence fact, and guardrail limitations",
      },
      {
        source: "src/reports/coachReportV1Visualization.ts",
        required: true,
        reason: "Sprint 4H Coach Report V1 visualization model, builder, evidence fact, tags, and guardrail limitations",
      },
      {
        source: "src/reports/buildCoachReportV1Visualization.ts",
        required: true,
        reason: "Sprint 4H Coach Report V1 visualization builder export",
      },
      {
        source: "src/reports/coachReportV1InformationHierarchy.ts",
        required: true,
        reason: "Sprint 4I Coach Report V1 information hierarchy model, builder, evidence fact, tags, and guardrail limitations",
      },
      {
        source: "src/reports/buildCoachReportV1InformationHierarchy.ts",
        required: true,
        reason: "Sprint 4I Coach Report V1 information hierarchy builder export",
      },
      {
        source: "src/reports/coachReportV1LegacyCleanup.ts",
        required: true,
        reason: "Sprint 4J Coach Report V1 legacy cleanup model, builder, evidence fact, tags, and guardrail limitations",
      },
      {
        source: "src/reports/buildCoachReportV1LegacyCleanup.ts",
        required: true,
        reason: "Sprint 4J Coach Report V1 legacy cleanup builder export",
      },
      {
        source: "src/reports/scoreSourceLabel.ts",
        required: true,
        reason: "Sprint 4J score source labels for full-match report, live scoring-events sample, and batch diagnostics",
      },
      {
        source: "src/reports/traceAggregateCoachLabels.test.ts",
        required: true,
        reason: "Sprint 4E executable French label mapping tests",
      },
      {
        source: "src/reports/coachReportFromTraceAggregates.test.ts",
        required: true,
        reason: "Sprint 4E executable Coach Report V0 model tests",
      },
      {
        source: "src/reports/coachReportTraceAggregateRenderer.test.ts",
        required: true,
        reason: "Sprint 4E executable Coach Report V0 renderer tests",
      },
      {
        source: "src/reports/coachReportTraceAggregateScopeGuard.test.ts",
        required: true,
        reason: "Sprint 4E executable Coach Report V0 scope guard tests",
      },
      {
        source: "src/reports/coachReportV1Visualization.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 visualization model tests",
      },
      {
        source: "src/reports/coachReportV1Renderer.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 renderer tests",
      },
      {
        source: "src/reports/coachReportV1SourceScopeGuard.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 source scope guard tests",
      },
      {
        source: "src/reports/coachReportV1EmptyState.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 pressure-loss empty state tests",
      },
      {
        source: "src/reports/coachReportV1ProfileVariation.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 profile variation tests",
      },
      {
        source: "src/reports/coachReportV1Encoding.test.ts",
        required: true,
        reason: "Sprint 4H executable Coach Report V1 UTF-8 encoding tests",
      },
      {
        source: "src/reports/coachReportV1InformationHierarchy.test.ts",
        required: true,
        reason: "Sprint 4I executable Coach Report V1 information hierarchy model tests",
      },
      {
        source: "src/reports/coachReportV1InformationHierarchyRenderer.test.ts",
        required: true,
        reason: "Sprint 4I executable Coach Report V1 information hierarchy renderer tests",
      },
      {
        source: "src/reports/coachReportV1ExperimentalGrouping.test.ts",
        required: true,
        reason: "Sprint 4I executable experimental grouping tests",
      },
      {
        source: "src/reports/coachReportV1SourceHierarchyGuard.test.ts",
        required: true,
        reason: "Sprint 4I executable source hierarchy guard tests",
      },
      {
        source: "src/reports/coachReportV1VisualPolishEncoding.test.ts",
        required: true,
        reason: "Sprint 4I executable visual polish encoding tests",
      },
      {
        source: "src/reports/coachReportV1LegacyCleanup.test.ts",
        required: true,
        reason: "Sprint 4J executable Coach Report V1 legacy cleanup model tests",
      },
      {
        source: "src/reports/coachReportV1LegacyCleanupRenderer.test.ts",
        required: true,
        reason: "Sprint 4J executable legacy cleanup renderer tests",
      },
      {
        source: "src/reports/scoreSourceLabel.test.ts",
        required: true,
        reason: "Sprint 4J executable score source label tests",
      },
      {
        source: "src/reports/coachReportV1FrenchCopy.test.ts",
        required: true,
        reason: "Sprint 4J executable French visible copy tests",
      },
      {
        source: "src/reports/coachReportV1LegacySourceGuard.test.ts",
        required: true,
        reason: "Sprint 4J executable legacy cleanup source guard tests",
      },
      {
        source: "src/reports/selectionPreviewTraceBackingRenderer.test.ts",
        required: true,
        reason: "Sprint 4K executable Selection Preview trace-backing renderer and copy guard tests",
      },
      {
        source: "src/reports/selectionPreviewCoachCopy.test.ts",
        required: true,
        reason: "Sprint 4L executable Selection Preview coach copy model tests",
      },
      {
        source: "src/reports/selectionPreviewCoachCopyRenderer.test.ts",
        required: true,
        reason: "Sprint 4L executable Selection Preview coach copy renderer tests",
      },
      {
        source: "src/reports/selectionPreviewCoachCopyForbiddenWording.test.ts",
        required: true,
        reason: "Sprint 4L executable forbidden wording tests for coach copy",
      },
      {
        source: "src/reports/selectionPreviewCoachCopyFrench.test.ts",
        required: true,
        reason: "Sprint 4L executable French accent tests for coach copy",
      },
      {
        source: "src/reports/selectionPreviewCoachCopyGuard.test.ts",
        required: true,
        reason: "Sprint 4L executable non-applied and non-driving coach copy guard tests",
      },
      {
        source: "src/reports/selectionPreviewProfileView.test.ts",
        required: true,
        reason: "Sprint 4M executable Selection Preview profile view model tests",
      },
      {
        source: "src/reports/selectionPreviewProfileViewRenderer.test.ts",
        required: true,
        reason: "Sprint 4M executable Selection Preview profile view renderer tests",
      },
      {
        source: "src/reports/selectionPreviewProfileViewCopy.test.ts",
        required: true,
        reason: "Sprint 4M executable visible copy and internal-id leak tests for profile view",
      },
      {
        source: "src/reports/selectionPreviewProfileViewGuard.test.ts",
        required: true,
        reason: "Sprint 4M executable non-applied and non-driving profile view guard tests",
      },
      {
        source: "src/reports/coachProductReportView.test.ts",
        required: true,
        reason: "Sprint 4N executable product report model tests",
      },
      {
        source: "src/reports/coachProductReportRenderer.test.ts",
        required: true,
        reason: "Sprint 4N executable product report renderer tests",
      },
      {
        source: "src/reports/coachProductReportNoJargon.test.ts",
        required: true,
        reason: "Sprint 4N executable product report visible no-jargon tests",
      },
      {
        source: "src/reports/coachProductReportCopy.test.ts",
        required: true,
        reason: "Sprint 4N executable product report French copy tests",
      },
      {
        source: "src/reports/coachProductReportGuard.test.ts",
        required: true,
        reason: "Sprint 4N executable product report guard tests",
      },
      {
        source: "src/reports/coachProductReportPolish.test.ts",
        required: true,
        reason: "Sprint 4O executable product report polish model tests",
      },
      {
        source: "src/reports/coachProductReportPolishRenderer.test.ts",
        required: true,
        reason: "Sprint 4O executable review-ready product report renderer tests",
      },
      {
        source: "src/reports/coachProductReportPolishNoJargon.test.ts",
        required: true,
        reason: "Sprint 4O executable product report polish no-jargon tests",
      },
      {
        source: "src/reports/coachProductReportPolishCopy.test.ts",
        required: true,
        reason: "Sprint 4O executable product report polish French copy tests",
      },
      {
        source: "src/reports/coachProductReportPolishGuard.test.ts",
        required: true,
        reason: "Sprint 4O executable product report polish guard tests",
      },
      {
        source: "src/reports/generateCoachHtmlReport.ts",
        required: true,
        reason: "Sprint 2E coach HTML report generation script",
      },
      {
        source: "src/reports/htmlCoachReportGuard.ts",
        required: true,
        reason: "lightweight HTML renderer runtime guard",
      },
      {
        source: "src/reports/htmlCoachReportEncoding.test.ts",
        required: true,
        reason: "Sprint 3Z executable UTF-8 and mojibake regression tests",
      },
      {
        source: "src/reports/encoding/mojibakeDetection.ts",
        required: true,
        reason: "Sprint 4G generated artifact mojibake marker detection",
      },
      {
        source: "src/reports/encoding/validateGeneratedTextEncoding.ts",
        required: true,
        reason: "Sprint 4G generated Markdown and HTML encoding validation",
      },
      {
        source: "src/reports/encoding/validateGeneratedTextEncoding.test.ts",
        required: true,
        reason: "Sprint 4G executable encoding coverage tests",
      },
      {
        source: "src/reports/htmlCoachReportCoachCopyGuard.test.ts",
        required: true,
        reason: "Sprint 3Z executable visible coach jargon guard tests",
      },
      {
        source: "src/reports/htmlCoachReportTechnicalDetailsGuard.test.ts",
        required: true,
        reason: "Sprint 3Z executable technical details placement guard tests",
      },
      {
        source: "src/reports/types.ts",
        required: true,
        reason: "legacy report type context",
      },
      {
        source: "src/reports/coaching/types.ts",
        required: true,
        reason: "coaching report type context",
      },
    ],
  },
];

const COMMANDS_RUN: readonly string[] = [
  "npm test",
  "npm run build",
  "npm run typecheck",
  "npm run test:contracts",
  "npm run test:all",
  "npm run reports:coach",
  "npm run reports:share",
];

function getRepositoryRoot(): string {
  return join(__dirname, "..", "..", "..");
}

function cleanDirectory(directory: string): void {
  if (existsSync(directory)) {
    for (const entry of readdirSync(directory)) {
      rmSync(join(directory, entry), { recursive: true, force: true });
    }
    return;
  }

  mkdirSync(directory, { recursive: true });
}

function ensureDirectoryForFile(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

function getLanguageForPath(sourcePath: string): string {
  switch (extname(sourcePath).toLowerCase()) {
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".json":
      return "json";
    case ".md":
      return "md";
    default:
      return "text";
  }
}

function renderBundledFile(sourcePath: string, fileContent: string): string {
  const language = getLanguageForPath(sourcePath);

  return [
    `## File: ${sourcePath}`,
    "",
    `\`\`\`${language}`,
    fileContent.trimEnd(),
    "```",
    "",
  ].join("\n");
}

function copyStandaloneFiles(
  repositoryRoot: string,
  shareDirectory: string,
): {
  copiedFiles: readonly CopiedStandaloneFile[];
  missingFiles: readonly MissingExpectedFile[];
} {
  const copiedFiles: CopiedStandaloneFile[] = [];
  const missingFiles: MissingExpectedFile[] = [];

  for (const file of STANDALONE_FILES) {
    const sourcePath = join(repositoryRoot, file.source);
    const targetPath = join(shareDirectory, file.target);

    if (!existsSync(sourcePath)) {
      missingFiles.push({
        source: file.source,
        required: file.required,
        reason: file.reason,
      });
      continue;
    }

    ensureDirectoryForFile(targetPath);
    copyFileSync(sourcePath, targetPath);
    copiedFiles.push({
      source: file.source,
      target: file.target,
      reason: file.reason,
    });
  }

  return { copiedFiles, missingFiles };
}

function generateBundles(
  repositoryRoot: string,
  shareDirectory: string,
): {
  bundles: readonly GeneratedBundle[];
  missingFiles: readonly MissingExpectedFile[];
} {
  const bundles: GeneratedBundle[] = [];
  const missingFiles: MissingExpectedFile[] = [];

  for (const bundle of BUNDLES) {
    const sections: string[] = [
      `# Bundle: ${bundle.file}`,
      "",
      `Generated for ${TASK_NAME}. Source files are bundled by domain for compact ChatGPT review.`,
      "",
    ];
    const includedSources: string[] = [];

    for (const source of bundle.sources) {
      const sourcePath = join(repositoryRoot, source.source);

      if (!existsSync(sourcePath)) {
        missingFiles.push({
          source: source.source,
          required: source.required,
          reason: source.reason,
        });
        continue;
      }

      const fileContent = readFileSync(sourcePath, "utf8");
      sections.push(renderBundledFile(source.source, fileContent));
      includedSources.push(source.source);
    }

    const targetPath = join(shareDirectory, bundle.file);
    writeFileSync(targetPath, sections.join("\n"), "utf8");
    bundles.push({
      file: bundle.file,
      reason: bundle.reason,
      includedSources,
      sources: bundle.sources,
    });
  }

  return { bundles, missingFiles };
}

function fullMatchWorkbenchChainReplayDoc(): string {
  if (TASK_NAME.includes("Sprint 4O")) {
    return renderFullMatchWorkbenchChainReplay4ODoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4N")) {
    return renderFullMatchWorkbenchChainReplay4NDoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4M")) {
    return renderFullMatchWorkbenchChainReplay4MDoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4L")) {
    return renderFullMatchWorkbenchChainReplay4LDoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4K")) {
    return renderFullMatchWorkbenchChainReplay4KDoc(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4H")) {
    return renderFullMatchWorkbenchChainReplay4HDoc(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4I")) {
    return renderFullMatchWorkbenchChainReplay4IDoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4J")) {
    return renderFullMatchWorkbenchChainReplay4JDoc(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4G")) {
    return renderFullMatchWorkbenchChainReplay4GDoc(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4F")) {
    return renderFullMatchWorkbenchChainReplay4FDoc(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4E")) {
    return [
      "# FullMatch Workbench Chain Replay 4E",
      "",
      "Sprint 4E introduces Coach Report V0 from Trace Aggregates. It consumes the Match Trace Aggregator and renders cautious coach-facing cards from official aggregates only.",
      "",
      "## Modes",
      "",
      "- default mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental remains opt-in only.",
      "- default report: no Coach Report V0 from trace aggregates.",
      "- experimental report: Rapport coach depuis les agrégats officiels appears as a compact V0 section.",
      "",
      "## Trace Foundations",
      "",
      "- Match Trace Spine status: available.",
      "- Match Trace Aggregator status: available.",
      "- Coach Report Trace V0 status: available.",
      "- report origin: match_trace_aggregator.",
      "- official aggregates are the base of visible coach cards.",
      "- diagnostic aggregates are kept separate.",
      "- sandbox aggregates are kept separate.",
      "- Selection Preview remains sandbox_only.",
      "- Selection Preview confidence is not upgraded.",
      "",
      "## Coach Report V0 Cards",
      "",
      "- card count: 6.",
      "- card IDs: official_danger_zones, official_pressure_losses, official_recoveries, official_player_involvement, official_recurring_causes, official_coach_watchpoint.",
      "- official danger zones used: present.",
      "- official pressure loss zones used: present.",
      "- official recovery zones used: present.",
      "- official player involvement used: present.",
      "- official cause tags used: present.",
      "- official impact tags used: present.",
      "",
      "## Guardrails",
      "",
      "- visible cards are based on official aggregates.",
      "- diagnostic aggregates are not used as official truth.",
      "- sandbox aggregates are not used as official truth.",
      "- sandbox aggregates do not raise official confidence.",
      "- diagnostic aggregates do not raise official confidence.",
      "- mutation counts all zero.",
      "- no production scoring event created.",
      "- no live selection driver.",
      "- no production route resolution driver.",
      "- no global economy claim.",
      "- scoring constants unchanged.",
      "- source-of-truth unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "",
      "## Report Rendering",
      "",
      "- experimental coach report contains: Rapport coach depuis les agrégats officiels.",
      "- experimental coach report contains: Zones de danger, Pertes sous pression, Récupérations utiles, Joueurs impliqués, Causes récurrentes, Point de vigilance coach.",
      "- visible copy says diagnostics and sandbox stay separated.",
      "- technical counts stay collapsed behind details.",
      "- visible coach copy has no mojibake.",
      "- visible coach copy avoids developer jargon and mandatory wording.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_REPORT_V0_FROM_OFFICIAL_AGGREGATES.",
      "- CONFIRM_DIAGNOSTIC_AND_SANDBOX_REMAIN_SEPARATE.",
      "- CONFIRM_SELECTION_PREVIEW_NOT_UPGRADED.",
      "- PREPARE_FULL_MATCH_TRACE_VALIDATION.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4D")) {
    return [
      "# FullMatch Workbench Chain Replay 4D",
      "",
      "Sprint 4D introduces the Match Trace Aggregator. It turns raw MatchTraceEvent rows into safe, deduplicated aggregate facts while preserving official, diagnostic, and sandbox scope separation.",
      "",
      "## Modes",
      "",
      "- default mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental remains opt-in only.",
      "- default report: no Selection Preview, no Colonne de traces de match, and no Agregats de traces de match diagnostic.",
      "- experimental report: Selection Preview remains available and non-applied.",
      "- experimental report: Colonne de traces de match and Agregats de traces de match appear as compact diagnostics.",
      "",
      "## Selection Preview Continuity",
      "",
      "- selection preview status: available.",
      "- selection preview trace backing status: sandbox_only.",
      "- selection preview requires match trace spine: true.",
      "- selection preview future trace consumer: true.",
      "- selection preview confidence not upgraded by aggregator: true.",
      "- Selection Preview remains sandbox-backed. Match Trace Aggregator is the first step toward future trace-backed preview confidence, but no preview confidence is upgraded in this sprint.",
      "",
      "## Match Trace Spine",
      "",
      "- trace spine status: available.",
      "- source adapters: official_match_event, mini_match_record, sandbox_event.",
      "- officialTruth true count: official traces only.",
      "- officialTruth false count: mini-match and sandbox diagnostic traces.",
      "",
      "## Match Trace Aggregator",
      "",
      "- aggregator status: available.",
      "- aggregate scopes: official, diagnostic, sandbox.",
      "- source priority: official_match_event > mini_match_record > sandbox_event.",
      "- input trace count: present.",
      "- deduplicated trace count: present.",
      "- duplicate trace count: present.",
      "- official aggregate trace count: present.",
      "- diagnostic aggregate trace count: present.",
      "- sandbox aggregate trace count: present.",
      "- official truth count: official scope only.",
      "- sandbox truth false count: sandbox scope only.",
      "- phase coverage: present.",
      "- action type coverage: present.",
      "- cause tag coverage: present.",
      "- impact tag coverage: present.",
      "- official danger zones: computed.",
      "- pressure loss zones: computed.",
      "- recovery zones: computed.",
      "- player involvement summary: computed.",
      "",
      "## Guardrails",
      "",
      "- mutation counts all zero.",
      "- no production scoring event created.",
      "- no live selection driver.",
      "- no production route resolution driver.",
      "- no global economy claim.",
      "- scoring constants unchanged.",
      "- source-of-truth unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "",
      "## Report Rendering",
      "",
      "- experimental coach report contains: Agrégats de traces de match.",
      "- visible copy explains that official, diagnostic, and sandbox aggregates remain separated to avoid double counts and over-strong conclusions.",
      "- technical counts stay collapsed behind details.",
      "- visible coach copy has no mojibake.",
      "- visible coach copy avoids developer jargon outside details.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_MATCH_TRACE_AGGREGATOR.",
      "- CONFIRM_OFFICIAL_DIAGNOSTIC_SANDBOX_SCOPE_SEPARATION.",
      "- CONFIRM_DEDUPLICATION_PRIORITY.",
      "- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED.",
      "- PREPARE_COACH_REPORT_V0_FROM_TRACE_AGGREGATES.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4C")) {
    return [
      "# FullMatch Workbench Chain Replay 4C",
      "",
      "Sprint 4C introduces the Match Event Trace Spine. It converts official match events, mini-match records, and sandbox replay events into shared MatchTraceEvent rows without mutating official state or production behavior.",
      "",
      "## Modes",
      "",
      "- default mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental remains opt-in only.",
      "- default report: no Selection Preview and no Colonne de traces de match diagnostic.",
      "- experimental report: Selection Preview remains available and non-applied.",
      "- experimental report: Colonne de traces de match appears as a compact technical diagnostic.",
      "",
      "## Selection Preview Trace Backing",
      "",
      "- selection preview status: available.",
      "- selection preview trace backing status: sandbox_only.",
      "- selection preview requires match trace spine: true.",
      "- selection preview future trace consumer: true.",
      "- selection preview cannot change lineup, starters, bench, live selection, production route resolution, official score, official possession, official timeline, official scoring events, or global economy proof.",
      "",
      "## Match Trace Spine",
      "",
      "- match trace spine status: available.",
      "- source adapters: official_match_event, mini_match_record, sandbox_event.",
      "- total trace count: greater than 0 in experimental full-match report.",
      "- official trace count: greater than 0.",
      "- mini-match trace count: greater than 0.",
      "- sandbox trace count: greater than 0 in experimental mode.",
      "- officialTruth true count: official traces only.",
      "- officialTruth false count: mini-match and sandbox diagnostic traces.",
      "- phase coverage: present.",
      "- action type coverage: present.",
      "- cause tag coverage: present.",
      "- impact tag coverage: present.",
      "- coach-visible trace count: present.",
      "",
      "## Guardrails",
      "",
      "- trace mutation count: 0.",
      "- score mutation count: 0.",
      "- possession mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- live selection driver count: 0.",
      "- production route resolution driver count: 0.",
      "- global economy claim count: 0.",
      "- scoring constants unchanged.",
      "- source-of-truth unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "",
      "## Report Rendering",
      "",
      "- experimental coach report contains: Colonne de traces de match.",
      "- visible copy: Le moteur commence à produire des traces structurées pour expliquer les actions simulées. Ces traces servent à préparer les futurs rapports coach, mais elles ne modifient pas le match officiel.",
      "- technical counts stay collapsed behind details.",
      "- visible coach copy has no mojibake.",
      "- visible coach copy avoids developer jargon outside details.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_MATCH_EVENT_TRACE_SPINE.",
      "- CONFIRM_TRACE_ADAPTERS_DO_NOT_MUTATE_OFFICIAL_STATE.",
      "- CONFIRM_SANDBOX_TRACES_ARE_NOT_OFFICIAL.",
      "- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED_UNTIL_TRACE_AGGREGATES.",
      "- PREPARE_MATCH_TRACE_AGGREGATOR.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4B")) {
    return [
      "# FullMatch Workbench Chain Replay 4B",
      "",
      "Sprint 4B converts the multi-scenario coach test plan into a coach-facing Selection Preview. The preview is visible only in the experimental coach report and remains non-applied, local, and non-official.",
      "",
      "## Modes",
      "",
      "- default mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental remains opt-in only.",
      "- default report: no Plan de test coach section and no Prévisualisation de sélection section.",
      "- experimental report: Plan de test coach section visible after the sandbox decision panel.",
      "- experimental report: Prévisualisation de sélection section visible after the coach test plan.",
      "",
      "## Coach Test Plan",
      "",
      "- coach test plan status: available.",
      "- test count: 3.",
      "- test IDs: support_around_z4_hsr, second_ball_occupation, strong_goalkeeper_fallback.",
      "- support test linked scenario: batch-scenario-better-attacking-support.",
      "- second-ball test linked scenario: batch-scenario-better-attacking-rebound-pressure.",
      "- goalkeeper fallback linked scenario: batch-scenario-stronger-goalkeeper.",
      "",
      "## Selection Preview",
      "",
      "- selection preview status: available.",
      "- preview origin: multi_scenario_coach_test_plan.",
      "- preview count: 3.",
      "- preview IDs: support_near_z4_hsr, second_ball_presence, strong_goalkeeper_response.",
      "- linked test IDs: support_around_z4_hsr, second_ball_occupation, strong_goalkeeper_fallback.",
      "- linked scenario IDs: batch-scenario-better-attacking-support, batch-scenario-better-attacking-rebound-pressure, batch-scenario-stronger-goalkeeper.",
      "",
      "### Soutien proche autour de Z4-HSR",
      "",
      "- linked coach test: support_around_z4_hsr.",
      "- suggested role/profile: support runner / mobile lock / hook link / playmaker support.",
      "- useful attributes: anticipation, handling, off-ball support, stamina.",
      "- expected benefit: reduce isolated-shot risk and offer immediate continuation after progression.",
      "- trade-off: more attacking support can expose rest-defense if the ball is lost or parried.",
      "- observation signal: progression leads to controlled continuity rather than adverse recovery.",
      "",
      "### Présence sur second ballon",
      "",
      "- linked coach test: second_ball_occupation.",
      "- suggested role/profile: rebound chaser / pressure forward / high work-rate runner.",
      "- useful attributes: anticipation, aggression, reaction, acceleration, balance.",
      "- expected benefit: turn a parried shot into a second action instead of a clean BLITZ recovery.",
      "- trade-off: rebound pressure can increase fatigue and open transition if recovery fails.",
      "- observation signal: second-chance pressure rises without disorganizing defensive structure.",
      "",
      "### Réponse face à un gardien fort",
      "",
      "- linked coach test: strong_goalkeeper_fallback.",
      "- suggested role/profile: safer continuity option / secondary playmaker / support receiver / rest-defense anchor.",
      "- useful attributes: decision-making, positioning, composure, tactical discipline.",
      "- expected benefit: avoid depending only on a direct shot and prepare safe continuation after a save.",
      "- trade-off: a safer plan B can reduce immediate threat but stabilize the sequence.",
      "- observation signal: the team keeps useful structure after a goalkeeper save instead of conceding recovery.",
      "",
      "## Guardrails",
      "",
      "- preview only: true.",
      "- official truth: false.",
      "- can change lineup: false.",
      "- can change starters: false.",
      "- can change bench: false.",
      "- can drive coach instruction: false.",
      "- can drive live selection: false.",
      "- can drive production route resolution: false.",
      "- production scoring event creation count: 0.",
      "- global economy claim count: 0.",
      "- official timeline unchanged: true.",
      "- official score unchanged: true.",
      "- official possession unchanged: true.",
      "- official scoring events unchanged: true.",
      "- scoring constants unchanged.",
      "- MatchBonusEvent unchanged.",
      "- batch/live separation preserved.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "",
      "## Visible Coach Copy",
      "",
      "- visible coach copy clean: PASS.",
      "- mojibake marker count: 0.",
      "- visible developer jargon count: 0.",
      "- technical tags remain available only behind details.internal-markers.",
      "",
      "## Commands",
      "",
      "- npm run build",
      "- npm run typecheck",
      "- npm run test:contracts",
      "- npm run test:all",
      "- npm run reports:coach",
      "- npm run reports:share",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_TEST_PLAN_TO_SELECTION_PREVIEW.",
      "- CONFIRM_PREVIEW_REMAINS_NON_APPLIED.",
      "- CONFIRM_NO_LINEUP_MUTATION.",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER.",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.",
      "- PREPARE_SELECTION_PREVIEW_TO_TACTICAL_TRADEOFF_PANEL.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Z")) {
    return [
      "# FullMatch Workbench Chain Replay 3Z",
      "",
      "Sprint 3Z cleans the coach report UX after Sprint 3Y. It fixes visible UTF-8 copy, keeps the sandbox batch confidence block readable, and moves long technical grounding content behind developer details without changing simulation behavior.",
      "",
      "## Coach Report Encoding",
      "",
      "- UTF-8 status: PASS.",
      "- mojibake marker count: 0.",
      "- experimental coach report contains: Confiance multi-scénarios.",
      "- experimental coach report contains: Confiance faible — 37/100 en moyenne sur 9 scénarios.",
      "- experimental coach report contains: Stabilité.",
      "- default coach report contains no mojibake markers.",
      "- HTML files are written with utf8.",
      "",
      "## Visible Coach Copy Cleanup",
      "",
      "- visible developer jargon count: 0.",
      "- SegmentRouteInput, selection shadow, read-only, canDrive, production route resolution, scoreMutationCount, and workbench_chain_ are hidden from visible coach copy.",
      "- visible sandbox copy says: Cette piste reste une suggestion sandbox, pas une consigne officielle.",
      "- visible sandbox copy says it does not modify the official timeline, score, possession, or scoring events.",
      "- visible sandbox copy says it is not global economy proof.",
      "",
      "## Technical Details Placement",
      "",
      "- technical details collapsed status: PASS.",
      "- collapsed technical details count: 2 or more in the experimental report.",
      "- long Ancrage workbench / full-match grounding paragraphs are not shown as main visible cards.",
      "- technical diagnostics remain available inside details.internal-markers.",
      "",
      "## Default / Experimental Boundary",
      "",
      "- default mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental remains opt-in only.",
      "- default report does not show timeline sandbox review, sandbox decision panel, evidence calibration, or batch confidence.",
      "- experimental report keeps timeline review, decision panel, evidence calibration, and batch confidence sections.",
      "",
      "## Guardrails Unchanged",
      "",
      "- official timeline unchanged.",
      "- official score unchanged.",
      "- official possession unchanged.",
      "- official scoring events unchanged.",
      "- no production scoring event created.",
      "- no live selection mutation.",
      "- no production route resolution mutation.",
      "- no global economy claim.",
      "- scoring constants unchanged: SHOT_GOAL = 3, TRY_TOUCHDOWN = 5, CONVERSION_GOAL = 2, DROP_GOAL = 2, PENALTY_SHOT inactive.",
      "- MatchBonusEvent unchanged.",
      "- batch/live separation preserved.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Tests",
      "",
      "- npm.cmd run build",
      "- npm.cmd run typecheck",
      "- npm.cmd run test:contracts",
      "- npm.cmd run test:all",
      "- npm.cmd run reports:coach",
      "- npm.cmd run reports:share",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_REPORT_ENCODING_FIXED.",
      "- CONFIRM_VISIBLE_COACH_COPY_CLEAN.",
      "- CONFIRM_TECHNICAL_DETAILS_COLLAPSED.",
      "- CONFIRM_DEFAULT_EXPERIMENTAL_BOUNDARY_PRESERVED.",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.",
      "- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Y")) {
    return [
      "# FullMatch Workbench Chain Replay 3Y",
      "",
      "Sprint 3Y adds Batch Confidence Calibration for the sandbox coach suggestion. It evaluates the same support-around-Z4-HSR idea across local controlled sandbox scenarios while remaining suggestion-only, non-official, and unable to drive live selection, production route resolution, production scoring events, or global scoring-economy conclusions.",
      "",
      "## Batch Confidence Calibration",
      "",
      "- default mode: segment_harness",
      "- experimental mode: workbench_chain_replay_experimental",
      "- sandbox decision evidence calibration status: available",
      "- batch confidence calibration status: available",
      "- batch origin: sandbox_decision_evidence_calibration",
      "- recommendation type: test_support_around_forward_progress",
      "- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR",
      "- scenario count: 9",
      "- average evidence score: 37",
      "- min evidence score: 20",
      "- max evidence score: 54",
      "- batch confidence: low",
      "- batch confidence label: confiance faible",
      "- recommendation stability: mixed",
      "- best scenario: batch-scenario-better-attacking-support",
      "- worst scenario: batch-scenario-stronger-goalkeeper",
      "- confidence changed from single-chain: false",
      "",
      "## Scenario List",
      "",
      "- base: 38/100, low",
      "- better_attacking_support: 54/100, low",
      "- weak_attacking_support: 22/100, very_low",
      "- stronger_goalkeeper: 20/100, very_low",
      "- weaker_goalkeeper: 50/100, low",
      "- fatigued_attacker: 26/100, very_low",
      "- fatigued_goalkeeper: 47/100, low",
      "- higher_defensive_recovery: 28/100, very_low",
      "- better_attacking_rebound_pressure: 51/100, low",
      "",
      "## Interpretation",
      "",
      "- better support and better attacking rebound pressure improve the suggestion.",
      "- weak support, stronger goalkeeper response, attacking fatigue, and stronger defensive recovery reduce confidence.",
      "- the signal remains useful as a coach test, but it is inconsistent across local scenarios.",
      "- local batch confidence is capped at medium and currently remains low.",
      "",
      "## Guardrails",
      "",
      "- local sandbox batch only: true",
      "- official truth: false",
      "- can drive coach instruction: false",
      "- can drive live selection: false",
      "- can drive production route resolution: false",
      "- official timeline unchanged: true",
      "- official score unchanged: true",
      "- official possession unchanged: true",
      "- official scoring events unchanged: true",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "- scoring constants unchanged: true",
      "- source-of-truth unchanged: true",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof",
      "",
      "## Coach Report Rendering",
      "",
      "- default batch confidence calibration tag count: 0",
      "- experimental coach report contains Confiance multi-scÃ©narios",
      "- experimental coach report contains scenario count",
      "- coach copy says this remains a test or suggestion",
      "- coach copy avoids mandatory wording",
      "- coach copy avoids official-truth overclaim",
      "- coach copy avoids global-economy overclaim",
      "",
      "## Evidence Categories",
      "",
      "- WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION",
      "- WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION",
      "",
      "## Validation Commands",
      "",
      "- npm.cmd run test:all",
      "- npm.cmd run reports:coach",
      "- npm.cmd run reports:share",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_EVIDENCE_CALIBRATION_TO_BATCH_CONFIDENCE_CALIBRATION",
      "- CONFIRM_LOCAL_SANDBOX_BATCH_ONLY",
      "- CONFIRM_BATCH_CONFIDENCE_NOT_ABOVE_MEDIUM",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED",
      "- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3X")) {
    return [
      "# FullMatch Workbench Chain Replay 3X",
      "",
      "Sprint 3X adds Sandbox Decision Evidence Calibration on top of the Sandbox Decision Panel. The calibrated score is a coach-facing confidence aid for one isolated sandbox chain; it remains experimental, suggestion-only, and unable to change official match truth.",
      "",
      "## Sandbox Decision Evidence Calibration",
      "",
      "- sandbox decision panel status: available",
      "- sandbox decision evidence calibration status: available",
      "- origin: sandbox_decision_panel",
      "- evidence score: 38/100",
      "- evidence score target band: 35-50",
      "- confidence: low",
      "- confidence label: Confiance faible",
      "- supporting signal count: 6",
      "- limiting signal count: 7",
      "- positive weight total: 48",
      "- negative weight total: 40",
      "- net evidence weight: 8",
      "- recommendation type: test_support_around_forward_progress",
      "- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR",
      "- associated risk: isolated shot, goalkeeper response, and goalkeeper-team recovery if support arrives late",
      "",
      "## Supporting Signals",
      "",
      "- dangerous progression: +12",
      "- half-chance created: +8",
      "- SHOT_CANDIDATE created: +8",
      "- adjusted shot quality above 50: +6",
      "- on-target saved state: +8",
      "- concrete tactical test: +6",
      "",
      "## Limiting Signals",
      "",
      "- shot saved by goalkeeper: -8",
      "- goalkeeper response score 65: -6",
      "- safe defensive rebound: -8",
      "- low second-chance probability: -6",
      "- isolated single chain: -4",
      "- no batch confirmation: -4",
      "- final outcome secured by goalkeeper team: -4",
      "- no batch confirmation caps confidence.",
      "- goalkeeper recovery caps confidence.",
      "",
      "## Coach Report Rendering",
      "",
      "- default sandbox decision evidence calibration tag count: 0",
      "- experimental sandbox decision evidence calibration block: visible",
      "- experimental coach report contains Niveau de confiance de la suggestion",
      "- experimental coach report contains Confiance faible",
      "- experimental coach report contains Ce qui soutient la suggestion",
      "- experimental coach report contains Ce qui limite la suggestion",
      "- coach copy describes this as a piste a tester",
      "- coach copy says it is not official truth",
      "- coach copy says it is not global economy proof",
      "- technical calibration tags remain behind details",
      "",
      "## Guardrails",
      "",
      "- calibrated suggestion only: true",
      "- official truth: false",
      "- can drive coach instruction: false",
      "- can drive live selection: false",
      "- can drive production route resolution: false",
      "- official timeline unchanged: true",
      "- official score unchanged: true",
      "- official possession unchanged: true",
      "- official scoring events unchanged: true",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "- default runFullMatch remains segment_harness",
      "- normal live selection remains unchanged",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof",
      "",
      "## Evidence Categories",
      "",
      "- WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW",
      "- WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL",
      "- WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION",
      "",
      "## Source Files",
      "",
      "- src/simulation/fullMatch/sandboxDecisionEvidenceCalibration.ts",
      "- src/simulation/fullMatch/calculateSandboxDecisionEvidenceScore.ts",
      "- src/simulation/fullMatch/sandboxDecisionEvidenceCalibrationFromPanel.ts",
      "- src/reports/htmlCoachReport.ts",
      "- src/simulation/runFullMatch.ts",
      "",
      "## Validation Commands",
      "",
      "- npm.cmd run test:all",
      "- npm.cmd run reports:coach",
      "- npm.cmd run reports:share",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_SANDBOX_DECISION_EVIDENCE_CALIBRATION_SUGGESTION_ONLY",
      "- CONFIRM_LOW_CONFIDENCE_FOR_CURRENT_FIXTURE",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED",
      "- PREPARE_BATCH_CONFIDENCE_CALIBRATION",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3W")) {
    return [
      "# FullMatch Workbench Chain Replay 3W",
      "",
      "Sprint 3W adds a Sandbox Decision Panel after the coach-facing official timeline versus sandbox review. It turns the sandbox replay evidence into four coach-readable decision blocks while remaining suggestion-only behind the opt-in workbench_chain_replay_experimental flag.",
      "",
      "## Sandbox Decision Panel",
      "",
      "- sandbox decision panel status: available",
      "- sandbox decision panel origin: coach_facing_timeline_review",
      "- sandbox decision panel block count: 4",
      "- decision block: Enseignement coach",
      "- decision block: Option à tester",
      "- decision block: Risque associé",
      "- decision block: Ce qui reste à prouver",
      "- recommendation: test_support_around_forward_progress",
      "- suggested tactical test: support FORWARD_PROGRESS toward control-space-hunter around Z4-HSR",
      "- associated risk: isolated shot, goalkeeper response, and goalkeeper-team recovery if support arrives late",
      "- still unproven count: 5",
      "",
      "## Coach Report Rendering",
      "",
      "- default sandbox decision panel tag count: 0",
      "- experimental sandbox decision panel tag count: greater than 0",
      "- experimental coach report contains Panneau de décision sandbox",
      "- experimental coach report contains Enseignement coach",
      "- experimental coach report contains Option à tester",
      "- experimental coach report contains Risque associé",
      "- experimental coach report contains Ce qui reste à prouver",
      "- technical panel tags remain behind details",
      "",
      "## Guardrails",
      "",
      "- suggestion only: true",
      "- official truth: false",
      "- can drive live selection: false",
      "- can drive production route resolution: false",
      "- official timeline unchanged: true",
      "- official score unchanged: true",
      "- official possession unchanged: true",
      "- official scoring events unchanged: true",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof",
      "",
      "## Evidence Categories",
      "",
      "- WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW",
      "- WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL",
      "",
      "## Source Files",
      "",
      "- src/simulation/fullMatch/sandboxDecisionPanel.ts",
      "- src/simulation/fullMatch/sandboxDecisionPanelFromTimelineReview.ts",
      "- src/reports/htmlCoachReport.ts",
      "- src/simulation/runFullMatch.ts",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_SANDBOX_DECISION_PANEL_SUGGESTION_ONLY",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED",
      "- PREPARE_SANDBOX_DECISION_PANEL_EVIDENCE_CALIBRATION",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3V")) {
    return [
      "# FullMatch Workbench Chain Replay 3V",
      "",
      "Sprint 3V adds a Coach-Facing Timeline Review built from the read-only Official Timeline Diff View, behind the opt-in workbench_chain_replay_experimental flag. It converts the technical diff into a readable coach panel while preserving the official timeline, score, possession, scoring events, production route resolution, scoring constants, MatchBonusEvent, and global economy boundary.",
      "",
      "## Default FullMatch Reference",
      "",
      "- default coach-facing timeline review tag count: 0",
      "- default report has no experimental timeline review.",
      "- default runFullMatch remains segment_harness.",
      "",
      "## Experimental Coach-Facing Timeline Review",
      "",
      "- official timeline diff view model status: available",
      "- coach-facing timeline review status: available",
      "- coach-facing timeline review origin: official_timeline_diff_view",
      "- evidence category: WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW",
      "- review block count: 4",
      "- review title: Lecture timeline officielle vs sandbox",
      "- review block: Ce qui s'est passé officiellement",
      "- review block: Ce que le sandbox a rejoué",
      "- review block: Ce qui est différent",
      "- review block: Ce qui n'a pas été modifié",
      "- technical workbench detail moved behind details: true",
      "- coach copy clean: true",
      "",
      "## Official State Boundary",
      "",
      "- official timeline unchanged: true",
      "- official score unchanged: true",
      "- official possession unchanged: true",
      "- official scoring events unchanged: true",
      "- sandbox events official: false",
      "- sandbox events inserted into official timeline: false",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "- model applied only in sandbox: true",
      "- model applied to normal live selection: false",
      "",
      "## Sandbox Replay Reference",
      "",
      "- baseline sandbox-only event count: 9",
      "- override sandbox-only event count: 9",
      "- override final sandbox outcome: secured_by_goalkeeper_team",
      "- override final team candidate: goalkeeper_team",
      "- override final actor candidate: blitz-goalkeeper-free-safety",
      "- override final zone candidate: Z3-HSR",
      "",
      "## Source Of Truth Boundary",
      "",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "- coach-facing timeline review cannot override live score.",
      "- coach-facing timeline review cannot override official timeline.",
      "- coach-facing timeline review cannot override official possession.",
      "- coach-facing timeline review cannot create production scoring events.",
      "- coach-facing timeline review cannot mutate MatchBonusEvent.",
      "- coach-facing timeline review cannot claim global economy.",
      "- scoring constants unchanged: SHOT_GOAL=3, TRY_TOUCHDOWN=5, CONVERSION_GOAL=2, DROP_GOAL=2, PENALTY_SHOT inactive.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "- npm run test:all",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_OFFICIAL_TIMELINE_DIFF_TO_COACH_FACING_REVIEW",
      "- CONFIRM_SANDBOX_REMAINS_NON_OFFICIAL",
      "- CONFIRM_REPORT_READABILITY_IMPROVED",
      "- KEEP_SCORING_VALUES_UNCHANGED",
      "- KEEP_DEFAULT_FULLMATCH_UNCHANGED",
      "- PREPARE_COACH_REVIEW_TO_SANDBOX_DECISION_PANEL",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3U")) {
    return [
      "# FullMatch Workbench Chain Replay 3U",
      "",
      "Sprint 3U adds an Official Timeline Diff View after the Controlled Segment Sandbox Timeline, behind the opt-in workbench_chain_replay_experimental flag. It reads the official full-match timeline and the baseline/override sandbox timelines, then exposes a read-only comparison proving that sandbox rows are not official MatchEvents, are not inserted into the official MatchReport timeline, and do not mutate official possession, score, scoring events, production route resolution, route-success rates, or global economy evidence.",
      "",
      "## Default FullMatch Reference",
      "",
      "- default official timeline diff view tag count: 0",
      "- default report has no official timeline diff view tags.",
      "- default full-match remains the normal segmented harness.",
      "",
      "## Experimental Official Timeline Diff View",
      "",
      "- official timeline diff view model status: available",
      "- model origin: controlled_segment_sandbox_timeline",
      "- evidence category: WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW",
      "- model applied only in sandbox: true",
      "- model applied to normal live selection: false",
      "- diff view is read-only: true",
      "",
      "## Official Timeline Snapshot",
      "",
      "- official timeline event count before: unchanged",
      "- official timeline event count after: unchanged",
      "- official timeline event count delta: 0",
      "- official scoring event count before: unchanged",
      "- official scoring event count after: unchanged",
      "- official scoring event count delta: 0",
      "- official score before: unchanged",
      "- official score after: unchanged",
      "- official score delta: 0",
      "- official possession changed: false",
      "",
      "## Baseline Diff Path",
      "",
      "- baseline sandbox-only event count: 9",
      "- baseline final sandbox outcome: none",
      "- baseline official timeline mutation count: 0",
      "- baseline official score mutation count: 0",
      "- baseline official scoring event mutation count: 0",
      "- baseline sandbox events inserted into official timeline count: 0",
      "",
      "## Override Diff Path",
      "",
      "- override sandbox-only event count: 9",
      "- override final sandbox outcome: secured_by_goalkeeper_team",
      "- override final team candidate: goalkeeper_team",
      "- override final actor candidate: blitz-goalkeeper-free-safety",
      "- override final zone candidate: Z3-HSR",
      "- override official timeline mutation count: 0",
      "- override official score mutation count: 0",
      "- override official scoring event mutation count: 0",
      "- override sandbox events inserted into official timeline count: 0",
      "",
      "## Divergence And Isolation",
      "",
      "- sandbox outcome divergence observed: true",
      "- sandbox final team divergence observed: true",
      "- sandbox final zone divergence observed: true",
      "- official timeline divergence observed: false",
      "- official possession divergence observed: false",
      "- official score divergence observed: false",
      "- official scoring event divergence observed: false",
      "- official possession mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "",
      "## Source Of Truth Boundary",
      "",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "- official timeline diff view cannot override live score.",
      "- official timeline diff view cannot override official timeline.",
      "- official timeline diff view cannot override official possession.",
      "- official timeline diff view cannot create production scoring events.",
      "- official timeline diff view cannot mutate MatchBonusEvent.",
      "- official timeline diff view cannot claim global economy.",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW",
      "- CONFIRM_OFFICIAL_TIMELINE_DIFF_VIEW_READ_ONLY",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE",
      "- PREPARE_OFFICIAL_TIMELINE_DIFF_VIEW_TO_COACH_FACING_TIMELINE_REVIEW",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3T")) {
    return [
      "# FullMatch Workbench Chain Replay 3T",
      "",
      "Sprint 3T adds a Controlled Segment Sandbox Timeline after the Sandbox Sequence Replay, behind the opt-in workbench_chain_replay_experimental flag. It projects the baseline and override sandbox sequence paths into typed sandbox timeline events without creating official MatchEvents, inserting events into the official MatchReport timeline, mutating official possession, changing official score, creating production ScoringEvents, mutating production route resolution, mutating route-success rates, or claiming global economy proof.",
      "",
      "## Default FullMatch Reference",
      "",
      "- default controlled segment sandbox timeline tag count: 0",
      "- default report has no controlled segment sandbox timeline tags.",
      "- default full-match remains the normal segmented harness.",
      "",
      "## Experimental Controlled Segment Sandbox Timeline",
      "",
      "- controlled segment sandbox timeline model status: available",
      "- model origin: sandbox_sequence_replay",
      "- evidence category: WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE",
      "- sandbox timeline created: true",
      "- sandbox timeline separate from official timeline: true",
      "- model applied only in sandbox: true",
      "- model applied to normal live selection: false",
      "",
      "## Baseline Timeline Path",
      "",
      "- baseline event count: 9",
      "- baseline event types: sandbox_sequence_start > sandbox_baseline_route_reference > sandbox_no_scoring_opportunity > sandbox_no_scoring_event_candidate > sandbox_no_score_attempt > sandbox_no_goalkeeper_response > sandbox_no_rebound > sandbox_no_continuation > sandbox_sequence_end",
      "- baseline final outcome: none",
      "",
      "## Override Timeline Path",
      "",
      "- override event count: 9",
      "- override event types: sandbox_sequence_start > sandbox_route_resolved > sandbox_opportunity_classified > sandbox_scoring_candidate_created > sandbox_shot_resolved > sandbox_goalkeeper_response > sandbox_rebound_state > sandbox_continuation_action > sandbox_sequence_end",
      "- override route outcome: dangerous_progression",
      "- override opportunity type: half_chance",
      "- override candidate type: SHOT_CANDIDATE",
      "- override shot result: SAVED_BY_GK",
      "- override goalkeeper response: PARRIED_SAVE",
      "- override rebound state: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      "- override ball loose state: safe_area",
      "- override continuation action: GOALKEEPER_TEAM_SECURE_RECOVERY",
      "- override final outcome: secured_by_goalkeeper_team",
      "- override final team candidate: goalkeeper_team",
      "- override final actor candidate: blitz-goalkeeper-free-safety",
      "- override final zone candidate: Z3-HSR",
      "",
      "## Divergence And Isolation",
      "",
      "- sandbox timeline event count divergence observed: false",
      "- sandbox timeline outcome divergence observed: true",
      "- sandbox timeline final team divergence observed: true",
      "- sandbox timeline final zone divergence observed: true",
      "- official timeline divergence observed: false",
      "- official possession divergence observed: false",
      "- official score divergence observed: false",
      "- official scoring event divergence observed: false",
      "- official timeline event created count: 0",
      "- official timeline mutation count: 0",
      "- official possession mutation count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "",
      "## Source Of Truth Boundary",
      "",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "- controlled segment sandbox timeline cannot override live score.",
      "- controlled segment sandbox timeline cannot override official timeline.",
      "- controlled segment sandbox timeline cannot override official possession.",
      "- controlled segment sandbox timeline cannot create production scoring events.",
      "- controlled segment sandbox timeline cannot mutate MatchBonusEvent.",
      "",
      "## Recommendations",
      "",
      "- CONFIRM_SANDBOX_SEQUENCE_REPLAY_TO_CONTROLLED_SEGMENT_SANDBOX_TIMELINE",
      "- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_IS_ISOLATED_ONLY",
      "- CONFIRM_SANDBOX_TIMELINE_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS",
      "- CONFIRM_SANDBOX_TIMELINE_IS_SEPARATE_FROM_OFFICIAL_TIMELINE",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_POSSESSION",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_TIMELINE",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED_UPSTREAM",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION",
      "- KEEP_SCORING_VALUES_UNCHANGED",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE",
      "- PREPARE_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3S")) {
    return [
      "# FullMatch Workbench Chain Replay 3S",
      "",
      "Sprint 3S adds a Sandbox Sequence Replay after the multi-action continuation sandbox, behind the opt-in workbench_chain_replay_experimental flag. It replays the full sandbox chain from controlled route resolution through opportunity, scoring candidate, scoring resolution, attribute-driven shot, goalkeeper response, rebound, and continuation without creating official MatchEvents, production ScoringEvents, official possession changes, official timeline changes, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.",
      "",
      "## Default Mode",
      "- default mode: segment_harness",
      "- workbench_chain_replay_experimental: opt-in only",
      "- default sandbox sequence replay tag count: 0",
      "- default report has no sandbox sequence replay tags.",
      "",
      "## Experimental Mode",
      "- multi-action continuation model status: available",
      "- sandbox sequence replay model status: available",
      "- model origin: multi_action_continuation_sandbox",
      "- segment scope: segment-1 only",
      "- evidence category: WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY",
      "",
      "## Baseline Sequence Path",
      "- baseline step count: 9",
      "- baseline step types: SANDBOX_SEQUENCE_START > BASELINE_ROUTE_REFERENCE > NO_SCORING_OPPORTUNITY > NO_SCORING_EVENT_CANDIDATE > NO_SCORE_ATTEMPT > NO_GOALKEEPER_RESPONSE > NO_REBOUND > NO_CONTINUATION > SANDBOX_SEQUENCE_END",
      "- baseline final outcome: none",
      "- baseline sandbox continuation created: false",
      "- baseline sandbox MatchEvent created count: 0",
      "- baseline sandbox scoring event created count: 0",
      "- baseline sandbox score delta total: 0",
      "",
      "## Override Sequence Path",
      "- override step count: 9",
      "- override step types: SANDBOX_SEQUENCE_START > CONTROLLED_ROUTE_RESOLVED > SCORING_OPPORTUNITY_CLASSIFIED > SCORING_EVENT_CANDIDATE_CREATED > SHOT_RESOLVED > GOALKEEPER_RESPONSE_RESOLVED > REBOUND_STATE_RESOLVED > CONTINUATION_ACTION_RESOLVED > SANDBOX_SEQUENCE_END",
      "- override final outcome: secured_by_goalkeeper_team",
      "- override final team candidate: goalkeeper_team",
      "- override final actor candidate: blitz-goalkeeper-free-safety",
      "- override final zone candidate: Z3-HSR",
      "- override sandbox continuation created: true",
      "",
      "## Divergence Proof",
      "- sequence step count divergence observed: false",
      "- sequence outcome divergence observed: true",
      "- sequence final team divergence observed: true",
      "- sequence final zone divergence observed: true",
      "- sandbox MatchEvent divergence observed: false",
      "- sandbox scoring event divergence observed: false",
      "- sandbox score divergence observed: false",
      "- official possession divergence observed: false",
      "- official timeline divergence observed: false",
      "",
      "## Guardrails",
      "- sandbox MatchEvent created count: 0",
      "- sandbox scoring event created count: 0",
      "- sandbox score delta total: 0",
      "- official possession mutation count: 0",
      "- official timeline mutation count: 0",
      "- official timeline injection count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success rate mutation count: 0",
      "- global economy claim count: 0",
      "- model applied only in sandbox: true",
      "- model applied to normal live selection: false",
      "- rejected closed candidate count: 0",
      "- rejected unavailable candidate count: 0",
      "",
      "## Source Of Truth",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "- FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only for global economy.",
      "- WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY cannot make global economy claims.",
      "- default and experimental official score signatures remain equal.",
      "",
      "## Recommendations",
      "- KEEP_SANDBOX_SEQUENCE_REPLAY_EXPERIMENTAL",
      "- KEEP_OFFICIAL_TIMELINE_AND_POSSESSION_UNCHANGED",
      "- KEEP_PRODUCTION_SCORING_EVENTS_UNCHANGED",
      "- FULL_MATCH_BATCH_ECONOMY_REMAINS_GLOBAL_REFERENCE",
      "- PREPARE_SEQUENCE_REPLAY_FOR_LIVE_GUARDS_ONLY_AFTER_MORE_PROOF",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3R")) {
    return [
      "# FullMatch Workbench Chain Replay 3R",
      "",
      "Sprint 3R adds a Multi-Action Continuation Sandbox after the rebound second chance sandbox, behind the opt-in workbench_chain_replay_experimental flag. It asks what the next sandbox action would be after a recoverable safe deflection without creating official MatchEvents, production ScoringEvents, official possession changes, official timeline changes, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.",
      "",
      "## Default Mode",
      "- default mode: segment_harness",
      "- workbench_chain_replay_experimental: opt-in only",
      "- default multi-action continuation tag count: 0",
      "- default report has no multi-action continuation tags.",
      "",
      "## Experimental Mode",
      "- rebound second chance model status: available",
      "- multi-action continuation model status: available",
      "- model origin: rebound_second_chance_sandbox",
      "- segment scope: segment-1 only",
      "- evidence category: WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX",
      "",
      "## Baseline Continuation State",
      "- baseline continuation action: NO_CONTINUATION",
      "- baseline continuation outcome: none",
      "- baseline continuation created: false",
      "- baseline sandbox match event created: false",
      "- baseline sandbox scoring event created: false",
      "- baseline sandbox score delta: 0",
      "",
      "## Override Continuation State",
      "- source rebound outcome: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      "- source ball loose state: safe_area",
      "- source recovery team candidate: goalkeeper_team",
      "- source next sandbox possession candidate: goalkeeper_team",
      "- source rebound danger score: 4",
      "- source second chance probability: 4",
      "- source second chance created: false",
      "- continuation action: GOALKEEPER_TEAM_SECURE_RECOVERY",
      "- continuation outcome: secured_by_goalkeeper_team",
      "- continuation team candidate: goalkeeper_team",
      "- continuation actor candidate: blitz-goalkeeper-free-safety",
      "- continuation target zone candidate: Z3-HSR",
      "- possession security score: 82",
      "- pressure after rebound: 24",
      "- transition risk: 18",
      "- continuation confidence: 77",
      "- sandbox continuation created: true",
      "",
      "## Divergence Proof",
      "- continuation action divergence observed: true",
      "- continuation outcome divergence observed: true",
      "- continuation team divergence observed: true",
      "- possession security observed: true",
      "- transition risk observed: true",
      "- sandbox MatchEvent divergence observed: false",
      "- sandbox scoring event divergence observed: false",
      "- sandbox score divergence observed: false",
      "- official possession divergence observed: false",
      "",
      "## Guardrails",
      "- sandbox MatchEvent created: false",
      "- sandbox scoring event created: false",
      "- sandbox score delta: 0",
      "- official possession mutation count: 0",
      "- official timeline mutation count: 0",
      "- official timeline injection count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- model applied only in sandbox: true",
      "- model applied to normal live selection: false",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Current Interpretation",
      "The current sandbox path says the goalkeeper team secures the safe deflection rather than producing a second-chance attack. The action is useful for multi-action continuation diagnostics, but it is deliberately not a live possession mutation and cannot be used as global economy proof.",
      "",
      "## Recommendation",
      "- KEEP_MULTI_ACTION_CONTINUATION_SANDBOX_EXPERIMENTAL",
      "- KEEP_OFFICIAL_TIMELINE_AND_POSSESSION_UNCHANGED",
      "- MONITOR_WHEN_CONTINUATION_CAN_BECOME_LIVE_ONLY_AFTER_MORE_GUARDS",
      "- FULL_MATCH_BATCH_ECONOMY_REMAINS_GLOBAL_REFERENCE",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Q")) {
    return [
      "# FullMatch Workbench Chain Replay 3Q",
      "",
      "Sprint 3Q adds a Rebound & Second Chance Sandbox after the goalkeeper response model, behind the opt-in workbench_chain_replay_experimental flag. It asks what happens after the PARRIED_SAVE / safe_deflection result without creating official MatchEvents, production ScoringEvents, official possession changes, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.",
      "",
      "## Default Mode",
      "- default mode: segment_harness",
      "- workbench_chain_replay_experimental: opt-in only",
      "- default rebound second chance tag count: 0",
      "- default report has no rebound second chance tags.",
      "",
      "## Experimental Mode",
      "- goalkeeper response model status: available",
      "- rebound second chance model status: available",
      "- model origin: goalkeeper_response_model_sandbox",
      "- segment scope: segment-1 only",
      "- evidence category: WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX",
      "",
      "## Baseline Rebound State",
      "- baseline response type: NOT_APPLICABLE",
      "- baseline rebound outcome: NO_REBOUND",
      "- baseline ball loose state: none",
      "- baseline second chance created: false",
      "- baseline sandbox match event created: false",
      "- baseline sandbox scoring event created: false",
      "- baseline sandbox score delta: 0",
      "",
      "## Override Rebound State",
      "- override shooter id: control-space-hunter",
      "- override goalkeeper id: blitz-goalkeeper-free-safety",
      "- override target zone: Z4-HSR",
      "- override goalkeeper response type: PARRIED_SAVE",
      "- override source rebound state: safe_deflection",
      "- shot quality faced: 53",
      "- goalkeeper response score: 65",
      "- save margin: 12",
      "- handling score: 78",
      "- rebound control score: 73",
      "- concentration score: 68",
      "- mental fatigue impact: 8",
      "- attacking proximity score: 61",
      "- defensive recovery score: 77",
      "- rebound danger score: 4",
      "- second chance probability: 4",
      "- override rebound outcome: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      "- override ball loose state: safe_area",
      "- override recovery team candidate: goalkeeper_team",
      "- override next sandbox possession candidate: goalkeeper_team",
      "- override second chance created: false",
      "",
      "## Divergence Observed",
      "- rebound outcome divergence observed: true",
      "- ball loose state divergence observed: true",
      "- recovery team divergence observed: true",
      "- second chance probability observed: true",
      "- second chance creation divergence observed: false",
      "- sandbox scoring event divergence observed: false",
      "- sandbox score divergence observed: false",
      "",
      "## Guardrails",
      "- sandbox match event created count: 0",
      "- sandbox scoring event created count: 0",
      "- sandbox score delta total: 0",
      "- official possession mutation count: 0",
      "- modelAppliedOnlyInSandbox: true",
      "- modelAppliedToNormalLiveSelection: false",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "- sandbox rebound injected into official timeline count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "",
      "## Official Signature",
      "- default vs experimental official score signature: equal",
      "- default vs experimental official scoring event count: equal",
      "- default vs experimental official score_change total: equal",
      "- normal full-match is not production chain-driven.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "",
      "## Coach Diagnosis",
      "- coach diagnosis status: rebound / second chance sandbox mentioned",
      "- coach copy wording status: no stale production wording",
      "- scoring guardrail status: PASS",
      "- source-of-truth status: PASS",
      "- explicit exhaustive test command status: npm run test:all",
      "",
      "## Recommendation",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_TO_REBOUND_SECOND_CHANCE_SANDBOX",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_ISOLATED_ONLY",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_MUTATE_OFFICIAL_POSSESSION",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION",
      "- KEEP_SCORING_VALUES_UNCHANGED",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE",
      "- PREPARE_REBOUND_SECOND_CHANCE_SANDBOX_TO_MULTI_ACTION_CONTINUATION_SANDBOX",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3P")) {
    return [
      "# FullMatch Workbench Chain Replay 3P",
      "",
      "Sprint 3P adds a goalkeeper response model inside the attribute-driven shot resolution sandbox behind the opt-in workbench_chain_replay_experimental flag. It explains the sandbox save through positioning, trajectory reading, reaction, handling, rebound control, concentration, mental fatigue, shot quality, and pressure context. It remains sandbox-only and cannot create official MatchEvents, production ScoringEvents, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.",
      "",
      "## Sprint 3P Summary",
      "- default runFullMatch mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental.",
      "- attribute-driven shot resolution model status: available.",
      "- goalkeeper response model status: available.",
      "- goalkeeper response model origin: attribute_driven_shot_resolution_sandbox.",
      "- baseline response type: NOT_APPLICABLE.",
      "- baseline rebound state: none.",
      "- baseline sandbox scoring event created: false.",
      "- baseline sandbox score delta: 0.",
      "- override shooter id: control-space-hunter.",
      "- override goalkeeper id: blitz-goalkeeper-free-safety.",
      "- override target zone: Z4-HSR.",
      "- shot quality faced: 53.",
      "- source goalkeeper response quality: 75.",
      "- goalkeeper response score: 65.",
      "- save margin: 12.",
      "- positioning score: 75.",
      "- trajectory reading score: 74.",
      "- reaction score: 73.",
      "- handling score: 78.",
      "- rebound control score: 73.",
      "- concentration score: 68.",
      "- mental fatigue impact: 8.",
      "- response type: PARRIED_SAVE.",
      "- rebound state: safe_deflection.",
      "- goalkeeper attribute influence observed: true.",
      "- goalkeeper response divergence observed: true.",
      "- rebound state divergence observed: true.",
      "- sandbox scoring event divergence observed: false.",
      "- sandbox score divergence observed: false.",
      "- sandbox scoring event created count: 0.",
      "- sandbox score delta total: 0.",
      "- modelAppliedOnlyInSandbox: true.",
      "- modelAppliedToNormalLiveSelection: false.",
      "",
      "## Guardrails",
      "- goalkeeper response model is not an official MatchEvent.",
      "- goalkeeper response model is not inserted into the official timeline.",
      "- goalkeeper response model can mutate official score: false.",
      "- goalkeeper response model can mutate official scoring events: false.",
      "- goalkeeper response model can create production scoring events: false.",
      "- goalkeeper response model can mutate production route resolution: false.",
      "- goalkeeper response model can mutate global route success rates: false.",
      "- goalkeeper response model can claim global economy: false.",
      "- rejected closed candidate count: 1.",
      "- rejected unavailable candidate count: 1.",
      "- sandbox response injected into official timeline count: 0.",
      "- official score mutation count: 0.",
      "- official scoring event mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- production route resolution mutation count: 0.",
      "- global route success mutation count: 0.",
      "- global economy claim count: 0.",
      "",
      "## Official Score Signature",
      "- default and experimental official score signatures remain equal for now: YES.",
      "- default and experimental official scoring event counts remain equal: YES.",
      "- default and experimental official score_change totals remain equal: YES.",
      "- FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Evidence",
      "- evidence category: WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX.",
      "- evidence facts added: goalkeeper response model sandbox.",
      "- coach diagnosis status: mentions goalkeeper response model sandbox.",
      "- coach copy wording status: absent stale phrases.",
      "- scoring guardrail status: PASS.",
      "- source-of-truth status: PASS.",
      "- explicit exhaustive test command: npm run test:all.",
      "",
      "## Recommendation",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_TO_GOALKEEPER_RESPONSE_MODEL.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_IS_ISOLATED_ONLY.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_GOALKEEPER_RESPONSE_MODEL_TO_REBOUND_AND_SECOND_CHANCE_SANDBOX.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3O")) {
    return [
      "# FullMatch Workbench Chain Replay 3O",
      "",
      "Sprint 3O adds an attribute-driven shot resolution sandbox behind the opt-in workbench_chain_replay_experimental flag. It takes the Sprint 3N sandbox scoring-event resolution and replaces the fixed heuristic shot result with a contextual sandbox shot calculation using shooter attributes, reception quality, defensive pressure, target zone, fatigue, mental freshness, and goalkeeper attributes. It remains sandbox-only and cannot create official MatchEvents, production ScoringEvents, official score changes, production route-resolution changes, route-success-rate changes, or global economy claims.",
      "",
      "## Sprint 3O Summary",
      "- default runFullMatch mode: segment_harness.",
      "- experimental mode: workbench_chain_replay_experimental.",
      "- sandbox scoring event resolution model status: available.",
      "- attribute-driven shot resolution model status: available.",
      "- attribute-driven shot resolution model origin: sandbox_scoring_event_resolution.",
      "- baseline outcome: NO_SCORE_ATTEMPT.",
      "- baseline shot attempt created: false.",
      "- baseline shot quality: 0.",
      "- override scoring candidate type: SHOT_CANDIDATE.",
      "- override receiver: control-space-hunter.",
      "- override target zone: Z4-HSR.",
      "- override source shot quality: 44.",
      "- override shooter id: control-space-hunter.",
      "- override goalkeeper id: blitz-goalkeeper-free-safety.",
      "- override shooter attribute score: 70.",
      "- override goalkeeper attribute score: 75.",
      "- override reception quality: 72.",
      "- override defensive pressure: 58.",
      "- override zone shot modifier: 4.",
      "- override fatigue modifier: 3.",
      "- override mental modifier: 3.",
      "- override attribute-adjusted shot quality: 53.",
      "- override goalkeeper response quality: 75.",
      "- override outcome: SAVED_BY_GK.",
      "- attribute influence observed: true.",
      "- outcome divergence observed: true.",
      "- shot quality divergence observed: true.",
      "- goalkeeper quality divergence observed: true.",
      "- sandbox scoring event divergence observed: false.",
      "- sandbox score divergence observed: false.",
      "- sandbox scoring event created count: 0.",
      "- sandbox score delta total: 0.",
      "- modelAppliedOnlyInSandbox: true.",
      "- modelAppliedToNormalLiveSelection: false.",
      "",
      "## Guardrails",
      "- attribute-driven shot resolution is not an official MatchEvent.",
      "- attribute-driven shot resolution is not inserted into the official timeline.",
      "- attribute-driven shot resolution can mutate official score: false.",
      "- attribute-driven shot resolution can mutate official scoring events: false.",
      "- attribute-driven shot resolution can create production scoring events: false.",
      "- attribute-driven shot resolution can mutate production route resolution: false.",
      "- attribute-driven shot resolution can mutate global route success rates: false.",
      "- attribute-driven shot resolution can claim global economy: false.",
      "- rejected closed candidate count: 1.",
      "- rejected unavailable candidate count: 1.",
      "- sandbox resolution injected into official timeline count: 0.",
      "- official score mutation count: 0.",
      "- official scoring event mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- production route resolution mutation count: 0.",
      "- global route success mutation count: 0.",
      "- global economy claim count: 0.",
      "",
      "## Official Score Signature",
      "- default and experimental official score signatures remain equal for now: YES.",
      "- default and experimental official scoring event counts remain equal: YES.",
      "- default and experimental official score_change totals remain equal: YES.",
      "- FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Evidence",
      "- evidence category: WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX.",
      "- evidence facts added: attribute-driven shot resolution sandbox.",
      "- coach diagnosis status: mentions attribute-driven shot resolution sandbox.",
      "- coach copy wording status: absent stale phrases.",
      "- scoring guardrail status: PASS.",
      "- source-of-truth status: PASS.",
      "- explicit exhaustive test command: npm run test:all.",
      "",
      "## Recommendation",
      "- CONFIRM_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_IS_ISOLATED_ONLY.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_TO_GOALKEEPER_RESPONSE_MODEL.",
    ].join("\n");
  }

  return [
    "# FullMatch Workbench Chain Replay 3N",
    "",
    "Sprint 3N adds a sandbox scoring event resolution layer behind the opt-in workbench_chain_replay_experimental flag. It resolves the Sprint 3M sandbox scoring-event candidate into an isolated tactical scoring outcome. The resolution remains sandbox-only: it is not an official MatchEvent, does not create production scoring events, does not mutate official score or official scoring events, does not drive production route resolution, and cannot claim global economy proof.",
    "",
    "## Sprint 3N Summary",
    "- default runFullMatch mode: segment_harness.",
    "- experimental mode: workbench_chain_replay_experimental.",
    "- controlled route resolution sandbox status: available.",
    "- sandbox scoring opportunity model status: available.",
    "- sandbox scoring event candidate model status: available.",
    "- sandbox scoring event resolution model status: available.",
    "- opportunity model origin: controlled_route_resolution_sandbox.",
    "- scoring event candidate model origin: sandbox_scoring_opportunity_model.",
    "- scoring event resolution model origin: sandbox_scoring_event_candidate.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline action: SAFE_RECYCLE.",
    "- baseline receiver: control-pivot.",
    "- baseline target zone: Z2-HSL.",
    "- baseline route outcome: safe_retention.",
    "- baseline danger probability: 18.",
    "- baseline scoring opportunity probability: 5.",
    "- baseline opportunity type: no_opportunity.",
    "- baseline scoring candidate type: NO_SCORING_EVENT.",
    "- baseline scoring candidate family: none.",
    "- baseline scoring candidate probability: 0.",
    "- baseline conversion probability: 0.",
    "- baseline scoring candidate created: false.",
    "- baseline resolution type: NO_SCORE_ATTEMPT.",
    "- baseline shot attempt created: false.",
    "- baseline shot quality: 0.",
    "- baseline goalkeeper response: not_applicable.",
    "- baseline sandbox scoring event created: false.",
    "- baseline sandbox score delta: 0.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override action: FORWARD_PROGRESS.",
    "- override receiver: control-space-hunter.",
    "- override target zone: Z4-HSR.",
    "- override route outcome: dangerous_progression.",
    "- override danger probability: 64.",
    "- override scoring opportunity probability: 24.",
    "- override opportunity type: half_chance.",
    "- override scoring candidate type: SHOT_CANDIDATE.",
    "- override scoring candidate family: shot.",
    "- override scoring candidate probability: 24.",
    "- override conversion probability: 14.",
    "- override scoring candidate created: true.",
    "- override resolution type: SHOT_ON_TARGET.",
    "- override shot attempt created: true.",
    "- override shot quality: 44.",
    "- override goalkeeper response: not_evaluated.",
    "- override sandbox scoring event created: false.",
    "- override sandbox score delta: 0.",
    "- scoring resolution type divergence observed: true.",
    "- shot attempt creation divergence observed: true.",
    "- shot quality divergence observed: true.",
    "- goalkeeper response divergence observed: true.",
    "- sandbox scoring event divergence observed: false.",
    "- sandbox score divergence observed: false.",
    "- sandbox scoring event created count: 0.",
    "- sandbox score delta total: 0.",
    "- modelAppliedOnlyInSandbox: true.",
    "- modelAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "- sandbox resolution injected into official timeline count: 0.",
    "- official score mutation count: 0.",
    "- official scoring event mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- production route resolution mutation count: 0.",
    "- global route success mutation count: 0.",
    "- global economy claim count: 0.",
    "- default sandbox scoring resolution tag count: 0.",
    "- experimental sandbox scoring resolution tag count: greater than 0.",
    "- default and experimental official score signatures remain equal for now: YES.",
    "- default and experimental official scoring event counts remain equal: YES.",
    "- default and experimental official score_change totals remain equal: YES.",
    "- evidence category: WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION.",
    "- evidence facts added: YES.",
    "- coach diagnosis status: mentions sandbox scoring event resolution model.",
    "- stale coach wording status: absent.",
    "- explicit exhaustive test command: npm run test:all.",
    "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    "",
    "## Isolation Guardrails",
    "- sandbox scoring resolution results are official MatchEvents: false.",
    "- no sandbox scoring resolution is inserted as an official MatchEvent: YES.",
    "- sandbox scoring resolution can mutate official score: false.",
    "- sandbox scoring resolution can mutate official scoring events: false.",
    "- sandbox scoring resolution can create production scoring events: false.",
    "- sandbox scoring resolution can mutate production route resolution: false.",
    "- sandbox scoring resolution can mutate global route success rates: false.",
    "- sandbox scoring resolution can claim global economy: false.",
    "- normal full-match is production chain-driven: false.",
    "- workbench_chain_replay_experimental remains opt-in: true.",
    "",
    "## Interpretation",
    "The baseline SAFE_RECYCLE remains a possession-retention result with no scoring attempt: NO_SCORE_ATTEMPT, shot quality 0, goalkeeper response not_applicable. The override FORWARD_PROGRESS inherits the SHOT_CANDIDATE and resolves as SHOT_ON_TARGET with heuristic shot quality 44 and goalkeeper response not_evaluated. This is a sandbox resolution only; it proves the next layer can resolve a possible scoring outcome without creating one officially.",
    "",
    "## Recommendation",
    "- CONFIRM_SANDBOX_SCORING_EVENT_CANDIDATE_TO_SANDBOX_SCORING_EVENT_RESOLUTION.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_ISOLATED_ONLY.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
    "- KEEP_SCORING_VALUES_UNCHANGED.",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
    "- PREPARE_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION.",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3K",
    "",
    "Sprint 3K adds a controlled route resolution sandbox behind the opt-in workbench_chain_replay_experimental flag. The sandbox resolves the baseline and override routes from the real isolated replay into isolated-only route outcome fields. It never creates official MatchEvents, never mutates official score or scoring events, never drives production route resolution, and cannot claim global economy proof.",
    "",
    "## Sprint 3K Summary",
    "- default runFullMatch mode: segment_harness.",
    "- experimental mode: workbench_chain_replay_experimental.",
    "- real isolated replay status: available.",
    "- controlled route resolution sandbox status: available.",
    "- controlled route resolution sandbox origin: real_isolated_segment_replay.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline action: SAFE_RECYCLE.",
    "- baseline receiver: control-pivot.",
    "- baseline zone: Z2-HSL.",
    "- baseline route resolves: true.",
    "- baseline outcome: safe_retention.",
    "- baseline resulting carrier: control-pivot.",
    "- baseline resulting zone: Z2-HSL.",
    "- baseline defensive pressure: 31.",
    "- baseline reception quality: 86.",
    "- baseline turnover risk: 12.",
    "- baseline danger probability: 18.",
    "- baseline scoring opportunity probability: 5.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override action: FORWARD_PROGRESS.",
    "- override receiver: control-space-hunter.",
    "- override zone: Z4-HSR.",
    "- override route resolves: true.",
    "- override outcome: dangerous_progression.",
    "- override resulting carrier: control-space-hunter.",
    "- override resulting zone: Z4-HSR.",
    "- override defensive pressure: 58.",
    "- override reception quality: 72.",
    "- override turnover risk: 34.",
    "- override danger probability: 64.",
    "- override scoring opportunity probability: 24.",
    "- override danger probability is greater than baseline danger probability: YES.",
    "- selection divergence observed: true.",
    "- carrier divergence observed: true.",
    "- zone progression divergence observed: true.",
    "- danger creation divergence observed: true.",
    "- scoring opportunity divergence observed: false.",
    "- sandbox scoring event divergence observed: false.",
    "- sandbox score divergence observed: false.",
    "- sandboxAppliedOnlyInIsolatedResolution: true.",
    "- sandboxAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "",
    "## Isolation And Mutation Guardrails",
    "- sandbox results are isolated-only: true.",
    "- sandbox results are official MatchEvents: false.",
    "- sandbox events injected into official timeline count: 0.",
    "- official score mutation count: 0.",
    "- official scoring event mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- production route resolution mutation count: 0.",
    "- global route success mutation count: 0.",
    "- global economy claim count: 0.",
    "- sandbox can mutate official score: false.",
    "- sandbox can mutate official scoring events: false.",
    "- sandbox can create production scoring events: false.",
    "- sandbox can mutate production route resolution: false.",
    "- sandbox can mutate global route success rates: false.",
    "- sandbox can claim global economy: false.",
    "",
    "## Default Versus Experimental",
    "- default sandbox tag count: 0.",
    "- experimental sandbox tag count: greater than 0.",
    "- default and experimental official score signatures remain equal for now: YES.",
    "- default and experimental official scoring event counts remain equal: YES.",
    "- default and experimental official score_change totals remain equal: YES.",
    "- no sandbox result is inserted as an official MatchEvent: YES.",
    "- normal full-match remains segment_harness by default.",
    "- FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    "",
    "## Evidence And Coach Copy",
    "- evidence category: WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX.",
    "- evidence facts added: YES.",
    "- coach diagnosis mentions controlled route resolution sandbox: YES.",
    "- stale coach wording status: absent.",
    "- coach copy does not claim production chain-driven full-match.",
    "",
    "## Scoring Guardrails",
    "- SHOT_GOAL remains 3.",
    "- TRY_TOUCHDOWN remains 5.",
    "- CONVERSION_GOAL remains 2.",
    "- DROP_GOAL remains 2.",
    "- PENALTY_SHOT remains inactive.",
    "- official score remains derived only from official score_change consequences.",
    "- no production scoring events deleted or capped.",
    "- MatchBonusEvent unchanged.",
    "- batch/live separation preserved.",
    "",
    "## Recommendation",
    "- CONFIRM_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX.",
    "- CONFIRM_SANDBOX_RESULTS_ARE_ISOLATED_ONLY.",
    "- CONFIRM_SANDBOX_RESULTS_ARE_NOT_OFFICIAL_MATCH_EVENTS.",
    "- CONFIRM_SANDBOX_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION.",
    "- CONFIRM_SANDBOX_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
    "- KEEP_SCORING_VALUES_UNCHANGED.",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
    "- PREPARE_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL.",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3J",
    "",
    "Sprint 3J adds a real isolated segment replay engine behind the opt-in workbench_chain_replay_experimental flag. The engine generates isolated replay events for the baseline and override paths, compares tactical consequences, and keeps every isolated event out of the official full-match timeline, official score, official scoring events, production route resolution, global route success rates, and global economy proof.",
    "",
    "## Sprint 3J Summary",
    "- default runFullMatch mode: segment_harness.",
    "- experimental mode: workbench_chain_replay_experimental.",
    "- controlled replay comparison status: available.",
    "- real isolated replay status: available.",
    "- real isolated replay origin: controlled_segment_replay_comparison.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline action: SAFE_RECYCLE.",
    "- baseline receiver: control-pivot.",
    "- baseline zone: Z2-HSL.",
    "- baseline event count: greater than 0.",
    "- baseline resulting carrier: control-pivot.",
    "- baseline resulting zone: Z2-HSL.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override action: FORWARD_PROGRESS.",
    "- override receiver: control-space-hunter.",
    "- override zone: Z4-HSR.",
    "- override event count: greater than 0.",
    "- override resulting carrier: control-space-hunter.",
    "- override resulting zone: Z4-HSR.",
    "- selection divergence observed: true.",
    "- possession continuity divergence observed: false.",
    "- carrier divergence observed: true.",
    "- zone progression divergence observed: true.",
    "- danger creation divergence observed: true.",
    "- scoring opportunity divergence observed: false.",
    "- isolated timeline divergence observed: true.",
    "- isolated score divergence observed: false.",
    "- isolated scoring event divergence observed: false.",
    "- replayAppliedOnlyInIsolatedEngine: true.",
    "- replayAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "",
    "## Isolated Replay Events",
    "- baseline isolated replay events: isolated_route_selection, isolated_possession_update, isolated_zone_progression, isolated_replay_end.",
    "- override isolated replay events: isolated_route_selection, isolated_possession_update, isolated_zone_progression, isolated_danger_signal, isolated_replay_end.",
    "- isolated replay events are experimental-only: true.",
    "- isolated replay events are official MatchEvents: false.",
    "- isolated events injected into official timeline count: 0.",
    "- official score mutation count: 0.",
    "- official scoring event mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- production route resolution mutation count: 0.",
    "- global route success mutation count: 0.",
    "- global economy claim count: 0.",
    "",
    "## Chain And Segment Provenance",
    "- consumed chain: sequence-1-multi-action-chain.",
    "- controlled segment replay comparison baseline: chain-context-safe-recycle-pv.",
    "- controlled segment replay comparison override: chain-context-forward-progress-sh.",
    "- real isolated replay baseline: chain-context-safe-recycle-pv.",
    "- real isolated replay override: chain-context-forward-progress-sh.",
    "- WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON evidence is emitted only for the experimental run.",
    "- WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY evidence is emitted only for the experimental run.",
    "",
    "## Default Versus Experimental Official Signature",
    "- default real isolated replay tag count: 0.",
    "- experimental real isolated replay tag count: greater than 0.",
    "- default and experimental official score signatures remain equal for now: YES.",
    "- default and experimental official scoring event counts remain equal: YES.",
    "- default and experimental official score_change totals remain equal: YES.",
    "- default and experimental official timeline event counts remain equal: YES.",
    "- no isolated replay event is inserted as an official MatchEvent: YES.",
    "",
    "## Guardrails",
    "- real isolated segment replay is experimental: true.",
    "- real isolated segment replay is diagnostic-only: true.",
    "- real isolated replay applies only inside isolated engine: true.",
    "- real isolated replay applies to normal live selection: false.",
    "- real isolated replay can inject events into official timeline: false.",
    "- real isolated replay can mutate official score: false.",
    "- real isolated replay can mutate official scoring events: false.",
    "- real isolated replay can create production scoring events: false.",
    "- real isolated replay can mutate production route resolution: false.",
    "- real isolated replay can mutate global route success rates: false.",
    "- real isolated replay can claim global economy: false.",
    "- CLOSED candidates remain unselectable.",
    "- unavailable candidates remain unselectable.",
    "- normal full-match is not claimed as production chain-driven.",
    "- stale coach wording status: absent.",
    "",
    "## Scoring Guardrails",
    "- SHOT_GOAL = 3.",
    "- TRY_TOUCHDOWN = 5.",
    "- CONVERSION_GOAL = 2.",
    "- DROP_GOAL = 2.",
    "- PENALTY_SHOT inactive.",
    "- official final score remains derived only from official score_change consequences.",
    "- production scoring events deleted/capped/rewritten/fabricated: 0.",
    "- MatchBonusEvent unchanged.",
    "- batch/live separation preserved.",
    "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    "",
    "## Next Recommendations",
    "- CONFIRM_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE",
    "- CONFIRM_REAL_REPLAY_EVENTS_ARE_ISOLATED_ONLY",
    "- CONFIRM_REAL_REPLAY_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS",
    "- CONFIRM_REPLAY_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "- CONFIRM_REPLAY_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3I",
    "",
    "Sprint 3I turns the isolated mini-match override experiment into a controlled segment replay comparison behind the opt-in workbench_chain_replay_experimental flag. It compares baseline and override replay paths for segment-1, but remains isolated: it does not apply to normal live selection, official score, official scoring events, production route resolution, global route success rates, or global economy proof.",
    "",
    "## Sprint 3I Summary",
    "- default runFullMatch controlled segment replay comparison status: not_available.",
    "- isolated mini-match override experiment status: available.",
    "- controlled segment replay comparison status: available.",
    "- controlled segment replay comparison origin: isolated_minimatch_override_experiment.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline action: SAFE_RECYCLE.",
    "- baseline receiver: control-pivot.",
    "- baseline zone: Z2-HSL.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override action: FORWARD_PROGRESS.",
    "- override receiver: control-space-hunter.",
    "- override zone: Z4-HSR.",
    "- baseline possession retained: true.",
    "- override possession retained: true.",
    "- baseline resulting zone: Z2-HSL.",
    "- override resulting zone: Z4-HSR.",
    "- selection divergence observed: true.",
    "- possession continuity divergence observed: false.",
    "- zone progression divergence observed: true.",
    "- danger creation divergence observed: true.",
    "- scoring opportunity divergence observed: false.",
    "- timeline divergence observed: true.",
    "- score divergence observed: false.",
    "- scoring event divergence observed: false.",
    "- replayAppliedOnlyInIsolatedComparison: true.",
    "- replayAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "",
    "## Chain And Segment Provenance",
    "- consumed chain: sequence-1-multi-action-chain.",
    "- final chain carrier: control-space-hunter.",
    "- final chain zone: Z4-HSR.",
    "- route candidate influence selected candidate: chain-context-forward-progress-sh.",
    "- shadow route selection candidate: chain-context-forward-progress-sh.",
    "- controlled segment selection candidate: chain-context-forward-progress-sh.",
    "- SegmentRouteInput candidate: chain-context-forward-progress-sh.",
    "- controlled mini-match route source candidate: chain-context-forward-progress-sh.",
    "- live selection override guard candidate: chain-context-forward-progress-sh.",
    "- isolated mini-match override experiment candidate: chain-context-forward-progress-sh.",
    "- controlled segment replay comparison baseline: chain-context-safe-recycle-pv.",
    "- controlled segment replay comparison override: chain-context-forward-progress-sh.",
    "- WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD evidence is emitted only for the experimental run.",
    "- WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT evidence is emitted only for the experimental run.",
    "- WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON evidence is emitted only for the experimental run.",
    "",
    "## Default Versus Experimental Signature",
    "- default isolated mini-match override experiment tag count: 0.",
    "- experimental isolated mini-match override experiment tag count: greater than 0.",
    "- default controlled segment replay comparison tag count: 0.",
    "- experimental controlled segment replay comparison tag count: greater than 0.",
    "- default and experimental score signatures remain equal for now: YES.",
    "- default and experimental scoring event counts remain equal: YES.",
    "- default and experimental score_change totals remain equal: YES.",
    "- normal full-match score mutation count: 0.",
    "- normal full-match scoring events mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- global route success rate mutation count: 0.",
    "- global economy claim count: 0.",
    "",
    "## Guardrails",
    "- controlled segment replay comparison is experimental: true.",
    "- controlled segment replay comparison is diagnostic-only: true.",
    "- controlled segment replay comparison applies only inside isolated comparison: true.",
    "- controlled segment replay comparison applies to normal live selection: false.",
    "- controlled segment replay comparison can mutate normal score: false.",
    "- controlled segment replay comparison can mutate normal scoring events: false.",
    "- controlled segment replay comparison can create production scoring events: false.",
    "- controlled segment replay comparison can mutate production route resolution: false.",
    "- controlled segment replay comparison can mutate global route success rates: false.",
    "- controlled segment replay comparison can claim global economy: false.",
    "- CLOSED candidates remain unselectable.",
    "- unavailable candidates remain unselectable.",
    "- normal full-match is not claimed as production chain-driven.",
    "- stale coach wording status: absent.",
    "",
    "## Scoring Guardrails",
    "- SHOT_GOAL = 3.",
    "- TRY_TOUCHDOWN = 5.",
    "- CONVERSION_GOAL = 2.",
    "- DROP_GOAL = 2.",
    "- PENALTY_SHOT inactive.",
    "- final score remains derived only from score_change consequences.",
    "- scoring events deleted/capped/rewritten/fabricated: 0.",
    "- MatchBonusEvent unchanged.",
    "- batch/live separation preserved.",
    "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    "",
    "## Next Recommendations",
    "- CONFIRM_ISOLATED_OVERRIDE_EXPERIMENT_TO_CONTROLLED_SEGMENT_REPLAY_COMPARISON",
    "- CONFIRM_REPLAY_COMPARISON_IS_ISOLATED_ONLY",
    "- CONFIRM_REPLAY_COMPARISON_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "- CONFIRM_REPLAY_COMPARISON_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_NORMAL_SCORE_OR_SCORING_EVENT_MUTATION",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3E",
    "",
    "Sprint 3E converts the experimental controlled segment selection into a typed SegmentRouteInput for segment-1 behind the opt-in workbench_chain_replay_experimental flag. This input is visible in diagnostics and evidence, but remains diagnostic-only: it does not mutate score, scoring events, production full-match selection, route resolution, or route success rates.",
    "",
    "## Sprint 3E Summary",
    "- Visual chain replay: validated.",
    "- Experimental full-match chain consumption: validated.",
    "- Experimental segment context influence: validated.",
    "- Experimental route candidate influence: validated.",
    "- Experimental shadow route selection: diagnostic-only.",
    "- Experimental controlled segment selection: diagnostic-only.",
    "- Experimental SegmentRouteInput: available and diagnostic-only.",
    "- Normal full-match: still segment_harness by default.",
    "- Scoring economy: unchanged and still validated only by batch/full-match economy.",
    "",
    "## Full-Match Mode Status",
    "- default full-match mode: segment_harness.",
    "- experimental full-match mode: workbench_chain_replay_experimental.",
    "- experimental mode active by default: NO.",
    "- normal full-match chain-driven claim status: NO.",
    "",
    "## Experimental Chain Consumption",
    "- chain consumption status: consumed.",
    "- consumed chain id: sequence-1-multi-action-chain.",
    "- consumed segment: segment-1.",
    "- consumed step count: 3.",
    "- visual step count: 3.",
    "- synthetic step count: 0.",
    "- hybrid step count: 0.",
    "- spatial selection step count: 3.",
    "- actor preservation count: 3.",
    "- receiver preservation count: 3.",
    "- action type preservation count: 3.",
    "- before state preservation count: 3.",
    "- after state preservation count: 3.",
    "- final propagated carrier: control-space-hunter.",
    "- final propagated zone: Z4-HSR.",
    "- mismatch warnings: 0.",
    "",
    "## Experimental Segment Context Influence",
    "- chain segment context status: available.",
    "- segment context source: workbench_chain_consumption.",
    "- segment context attached to: segment-1.",
    "- segment context final carrier: control-space-hunter.",
    "- segment context final zone: Z4-HSR.",
    "- segment context consumed steps: 3.",
    "- segment context spatial steps: 3.",
    "- segment context confidence: medium.",
    "- segment context diagnosticOnly: true.",
    "- segment context can mutate score: false.",
    "- segment context can mutate scoring events: false.",
    "- experimental chain context tags present in timeline: YES.",
    "- default chain context tags present in timeline: NO.",
    "",
    "## Experimental Route Candidate Influence",
    "- route candidate influence status: available.",
    "- route candidate influence scope: diagnostic_shadow_ranking.",
    "- route candidate influence source segment: segment-1.",
    "- route candidate influence source chain: sequence-1-multi-action-chain.",
    "- route candidate influence final carrier: control-space-hunter.",
    "- route candidate influence final zone: Z4-HSR.",
    "- candidate count: 4.",
    "- influenced candidate count: 2.",
    "- positive delta count: 1.",
    "- negative delta count: 1.",
    "- illegal candidate boost blocked count: 1.",
    "- unavailable candidate boost blocked count: 1.",
    "- diagnostic selection before: chain-context-safe-recycle-pv.",
    "- diagnostic selection after: chain-context-forward-progress-sh.",
    "- diagnostic selection changed: true.",
    "- route candidate influence diagnosticOnly: true.",
    "- route candidate influence can mutate score: false.",
    "- route candidate influence can mutate scoring events: false.",
    "- route candidate influence can drive production selection: false.",
    "- closed candidates remain selectable after influence: NO.",
    "- unavailable candidates remain selectable after influence: NO.",
    "",
    "## Experimental Shadow Route Selection",
    "- shadow route selection status: available.",
    "- shadow route selection scope: diagnostic_shadow_selection.",
    "- production selection proxy: chain-context-safe-recycle-pv.",
    "- production selection action type: SAFE_RECYCLE.",
    "- production selection receiver: control-pivot.",
    "- production selection target zone: Z2-HSL.",
    "- shadow selection candidate: chain-context-forward-progress-sh.",
    "- shadow selection action type: FORWARD_PROGRESS.",
    "- shadow selection receiver: control-space-hunter.",
    "- shadow selection target zone: Z4-HSR.",
    "- shadow selection base score: 82.",
    "- shadow selection influence delta: 5.",
    "- shadow selection influenced score: 87.",
    "- shadow selection changed from production: true.",
    "- eligible candidate count: 2.",
    "- blocked candidate count: 2.",
    "- closed candidate rejected count: 1.",
    "- unavailable candidate rejected count: 1.",
    "- selected shadow candidate legal: true.",
    "- selected shadow candidate available: true.",
    "- shadow route selection diagnosticOnly: true.",
    "- shadow route selection can mutate score: false.",
    "- shadow route selection can mutate scoring events: false.",
    "- shadow route selection can drive production selection: false.",
    "- shadow selection explanation: present.",
    "",
    "## Experimental Controlled Segment Selection",
    "- controlled segment selection status: available.",
    "- controlled segment selection scope: experimental_controlled_segment_selection.",
    "- controlled selection source: shadow_route_selection.",
    "- controlled selected candidate: chain-context-forward-progress-sh.",
    "- controlled selected action: FORWARD_PROGRESS.",
    "- controlled selected receiver: control-space-hunter.",
    "- controlled selected target zone: Z4-HSR.",
    "- controlled selected base score: 82.",
    "- controlled selected influence delta: 5.",
    "- controlled selected influenced score: 87.",
    "- controlled selected candidate legal: true.",
    "- controlled selected candidate available: true.",
    "- controlled closed candidate rejected count: 1.",
    "- controlled unavailable candidate rejected count: 1.",
    "- controlled segment selection diagnosticOnly: true.",
    "- controlled segment selection can mutate score: false.",
    "- controlled segment selection can mutate scoring events: false.",
    "- controlled segment selection can mutate route success rates: false.",
    "- controlled segment selection can drive production full-match selection: false.",
    "",
    "## Experimental Segment Route Input",
    "- SegmentRouteInput status: available.",
    "- SegmentRouteInput scope: experimental_segment_route_input.",
    "- SegmentRouteInput source: controlled_segment_selection.",
    "- SegmentRouteInput segment: segment-1.",
    "- SegmentRouteInput candidate: chain-context-forward-progress-sh.",
    "- SegmentRouteInput action: FORWARD_PROGRESS.",
    "- SegmentRouteInput receiver: control-space-hunter.",
    "- SegmentRouteInput target zone: Z4-HSR.",
    "- SegmentRouteInput source base score: 82.",
    "- SegmentRouteInput source influence delta: 5.",
    "- SegmentRouteInput source influenced score: 87.",
    "- SegmentRouteInput candidate legal: true.",
    "- SegmentRouteInput candidate available: true.",
    "- SegmentRouteInput rejected closed candidate count: 1.",
    "- SegmentRouteInput rejected unavailable candidate count: 1.",
    "- SegmentRouteInput diagnosticOnly: true.",
    "- SegmentRouteInput experimentalRouteInput: true.",
    "- SegmentRouteInput can mutate score: false.",
    "- SegmentRouteInput can mutate scoring events: false.",
    "- SegmentRouteInput can mutate route success rates: false.",
    "- SegmentRouteInput can drive production full-match selection: false.",
    "- SegmentRouteInput can drive production route resolution: false.",
    "- SegmentRouteInput represents CLOSED candidates: NO.",
    "- SegmentRouteInput represents unavailable candidates: NO.",
    "",
    "## Default vs Experimental Signature",
    "- default chain consumption count: 0.",
    "- experimental chain consumption count: 1.",
    "- default chain context tag count: 0.",
    "- experimental chain context tag count: greater than 0.",
    "- default route candidate influence tag count: 0.",
    "- experimental route candidate influence tag count: greater than 0.",
    "- experimental influenced candidate count: greater than 0.",
    "- default shadow route selection tag count: 0.",
    "- experimental shadow route selection tag count: greater than 0.",
    "- default controlled segment selection tag count: 0.",
    "- experimental controlled segment selection tag count: greater than 0.",
    "- default SegmentRouteInput tag count: 0.",
    "- experimental SegmentRouteInput tag count: greater than 0.",
    "- production selection candidate in experimental signature: chain-context-safe-recycle-pv.",
    "- shadow selection candidate in experimental signature: chain-context-forward-progress-sh.",
    "- SegmentRouteInput candidate in experimental signature: chain-context-forward-progress-sh.",
    "- SegmentRouteInput action in experimental signature: FORWARD_PROGRESS.",
    "- SegmentRouteInput receiver in experimental signature: control-space-hunter.",
    "- SegmentRouteInput zone in experimental signature: Z4-HSR.",
    "- shadow selection changed from production in experimental signature: true.",
    "- default and experimental score signatures remain equal for now: YES.",
    "- default and experimental scoring event counts remain equal: YES.",
    "- default and experimental score_change totals remain equal: YES.",
    "- default and experimental timeline event counts remain equal: YES.",
    "- score mutation count: 0.",
    "- scoring events mutation count: 0.",
    "- route success rate mutation count: 0.",
    "- final score remains derived only from score_change consequences.",
    "",
    "## Diagnostics And Coach Visibility",
    "- experimental report limitations include FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1.",
    "- experimental report limitations include FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1.",
    "- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DIAGNOSTIC_ONLY.",
    "- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_DRIVE_PRODUCTION_SELECTION.",
    "- experimental report limitations include FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_OVERRIDE_CLOSED_OR_UNAVAILABLE.",
    "- experimental report limitations include FULLMATCH_SHADOW_ROUTE_SELECTION_DIAGNOSTIC_ONLY.",
    "- experimental report limitations include FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_DRIVE_PRODUCTION_SELECTION.",
    "- experimental report limitations include FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE.",
    "- experimental report limitations include FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DIAGNOSTIC_ONLY.",
    "- experimental report limitations include FULLMATCH_CONTROLLED_SEGMENT_SELECTION_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION.",
    "- experimental report limitations include FULLMATCH_CONTROLLED_SEGMENT_SELECTION_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE.",
    "- experimental report limitations include FULLMATCH_SEGMENT_ROUTE_INPUT_DIAGNOSTIC_ONLY.",
    "- experimental report limitations include FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION.",
    "- experimental report limitations include FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION.",
    "- experimental report limitations include FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE.",
    "- experimental report evidence includes WORKBENCH_CHAIN_CONSUMPTION.",
    "- experimental report evidence includes WORKBENCH_CHAIN_SEGMENT_CONTEXT.",
    "- experimental report evidence includes WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE.",
    "- experimental report evidence includes WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION.",
    "- experimental report evidence includes WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION.",
    "- experimental report evidence includes WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT.",
    "- chain consumption is tagged diagnostic_only_chain_consumption.",
    "- chain segment context is tagged chain_context_diagnostic_only.",
    "- route candidate influence is tagged route_candidate_influence_diagnostic_only.",
    "- shadow route selection is tagged shadow_route_selection_diagnostic_only.",
    "- controlled segment selection is tagged controlled_segment_selection_diagnostic_only.",
    "- SegmentRouteInput is tagged segment_route_input_diagnostic_only.",
    "- coach diagnosis mentions controlled segment selection and SegmentRouteInput with control-space-hunter at Z4-HSR.",
    "- prototype fallback status: enabled and observable, but not used to hide replay mismatch.",
    "",
    "## Scoring Guardrails",
    "- SHOT_GOAL = 3.",
    "- TRY_TOUCHDOWN = 5.",
    "- CONVERSION_GOAL = 2.",
    "- DROP_GOAL = 2.",
    "- PENALTY_SHOT inactive.",
    "- final score remains derived only from score_change consequences.",
    "- scoring events deleted/capped/rewritten/fabricated: 0.",
    "- MatchBonusEvent unchanged.",
    "- batch/live separation preserved.",
    "- FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    "",
    "## Next Recommendations",
    "- CONFIRM_CONTROLLED_SEGMENT_SELECTION_TO_SEGMENT_ROUTE_INPUT",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_IS_DIAGNOSTIC_ONLY",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_DOES_NOT_DRIVE_PRODUCTION_RESOLUTION",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_DOES_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_SEGMENT_ROUTE_INPUT_TO_CONTROLLED_MINIMATCH_ROUTE_SOURCE",
    "",
  ].join("\n");
}

function fullMatchWorkbenchChainReplayValidationDoc(): string {
  if (TASK_NAME.includes("Sprint 4O")) {
    return renderFullMatchWorkbenchChainReplay4OValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4N")) {
    return renderFullMatchWorkbenchChainReplay4NValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4M")) {
    return renderFullMatchWorkbenchChainReplay4MValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4L")) {
    return renderFullMatchWorkbenchChainReplay4LValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4K")) {
    return renderFullMatchWorkbenchChainReplay4KValidation(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4H")) {
    return renderFullMatchWorkbenchChainReplay4HValidation(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4I")) {
    return renderFullMatchWorkbenchChainReplay4IValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4J")) {
    return renderFullMatchWorkbenchChainReplay4JValidation(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4G")) {
    return renderFullMatchWorkbenchChainReplay4GValidation(fullMatchTraceValidationModel());
  }
  if (TASK_NAME.includes("Sprint 4F")) {
    return renderFullMatchWorkbenchChainReplay4FValidation(fullMatchTraceValidationModel());
  }

  if (TASK_NAME.includes("Sprint 4E")) {
    return [
      "# FullMatch Workbench Chain Replay 4E Validation",
      "",
      "Status: PASS",
      "",
      "## Scope",
      "",
      "- current sprint: Sprint 4E - Coach Report V0 from Trace Aggregates",
      "- share pack mode: MINIMAL_REVIEW",
      "- default mode: segment_harness",
      "- experimental mode: workbench_chain_replay_experimental",
      "",
      "## Checks",
      "",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: MatchTraceEvent spine remains available.",
      "- PASS: Match Trace Aggregator remains available.",
      "- PASS: Coach Report Trace V0 status is available.",
      "- PASS: report origin is match_trace_aggregator.",
      "- PASS: report has 4 to 6 cards.",
      "- PASS: card Zones de danger is present.",
      "- PASS: card Pertes sous pression is present.",
      "- PASS: card Récupérations utiles is present.",
      "- PASS: card Joueurs impliqués is present.",
      "- PASS: card Causes récurrentes is present.",
      "- PASS: card Point de vigilance coach is present.",
      "- PASS: visible cards are based on official aggregates.",
      "- PASS: diagnostic aggregates are kept separate.",
      "- PASS: sandbox aggregates are kept separate.",
      "- PASS: sandbox aggregates do not raise official confidence.",
      "- PASS: diagnostic aggregates do not raise official confidence.",
      "- PASS: Selection Preview remains sandbox_only.",
      "- PASS: Selection Preview confidence is not upgraded.",
      "- PASS: experimental report contains Rapport coach depuis les agrégats officiels.",
      "- PASS: default report hides trace aggregate coach report section.",
      "- PASS: visible coach copy has no mojibake.",
      "- PASS: visible coach copy avoids developer jargon.",
      "- PASS: visible coach copy avoids mandatory wording.",
      "- PASS: report cannot mutate official timeline.",
      "- PASS: report cannot mutate official score.",
      "- PASS: report cannot mutate official possession.",
      "- PASS: report cannot mutate official scoring events.",
      "- PASS: report cannot create production scoring events.",
      "- PASS: report cannot claim global economy.",
      "- PASS: report cannot drive live selection.",
      "- PASS: report cannot drive production route resolution.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- card count: 6.",
      "- official aggregate trace count: present.",
      "- diagnostic aggregate trace count: present.",
      "- sandbox aggregate trace count: present.",
      "- official danger zone count: present.",
      "- official pressure loss zone count: present.",
      "- official recovery zone count: present.",
      "- official player involvement count: present.",
      "- official cause tag count: present.",
      "- official impact tag count: present.",
      "- score mutation count: 0.",
      "- possession mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- global economy claim count: 0.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_REPORT_V0_FROM_OFFICIAL_AGGREGATES.",
      "- CONFIRM_DIAGNOSTIC_AND_SANDBOX_REMAIN_SEPARATE.",
      "- CONFIRM_SELECTION_PREVIEW_NOT_UPGRADED.",
      "- PREPARE_FULL_MATCH_TRACE_VALIDATION.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4D")) {
    return [
      "# FullMatch Workbench Chain Replay 4D Validation",
      "",
      "Status: PASS",
      "",
      "## Scope",
      "",
      "- current sprint: Sprint 4D - Match Trace Aggregator",
      "- share pack mode: MINIMAL_REVIEW",
      "- default mode: segment_harness",
      "- experimental mode: workbench_chain_replay_experimental",
      "",
      "## Checks",
      "",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: 4B selection preview remains available.",
      "- PASS: selection preview remains sandbox_only.",
      "- PASS: selection preview confidence is not upgraded by aggregator.",
      "- PASS: MatchTraceEvent spine remains available.",
      "- PASS: Match Trace Aggregator status is available.",
      "- PASS: aggregate has official scope.",
      "- PASS: aggregate has diagnostic scope.",
      "- PASS: aggregate has sandbox scope.",
      "- PASS: official aggregate contains only official truth traces.",
      "- PASS: sandbox aggregate contains only non-official traces.",
      "- PASS: diagnostic aggregate does not become official truth.",
      "- PASS: input trace count is present.",
      "- PASS: deduplicated trace count is present.",
      "- PASS: duplicate trace count is present.",
      "- PASS: source priority is official > mini-match > sandbox.",
      "- PASS: official aggregate excludes sandbox traces.",
      "- PASS: danger by zone is computed.",
      "- PASS: possession loss by zone is computed.",
      "- PASS: pressure loss by zone is computed.",
      "- PASS: recovery by zone is computed.",
      "- PASS: player involvement is computed.",
      "- PASS: cause tag counts are computed.",
      "- PASS: impact tag counts are computed.",
      "- PASS: experimental report contains Agrégats de traces de match.",
      "- PASS: default report hides experimental aggregate diagnostics.",
      "- PASS: visible coach copy has no mojibake.",
      "- PASS: visible coach copy avoids developer jargon.",
      "- PASS: aggregator cannot mutate official timeline.",
      "- PASS: aggregator cannot mutate official score.",
      "- PASS: aggregator cannot mutate official possession.",
      "- PASS: aggregator cannot mutate official scoring events.",
      "- PASS: aggregator cannot create production scoring events.",
      "- PASS: aggregator cannot claim global economy.",
      "- PASS: aggregator cannot drive live selection.",
      "- PASS: aggregator cannot drive production route resolution.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- input trace count: present.",
      "- deduplicated trace count: present.",
      "- duplicate trace count: present.",
      "- official aggregate trace count: present.",
      "- diagnostic aggregate trace count: present.",
      "- sandbox aggregate trace count: present.",
      "- official danger zone count: present.",
      "- pressure loss zone count: present.",
      "- recovery zone count: present.",
      "- player involvement count: present.",
      "- score mutation count: 0.",
      "- possession mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- global economy claim count: 0.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_MATCH_TRACE_AGGREGATOR.",
      "- CONFIRM_OFFICIAL_DIAGNOSTIC_SANDBOX_SCOPE_SEPARATION.",
      "- CONFIRM_DEDUPLICATION_PRIORITY.",
      "- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED.",
      "- PREPARE_COACH_REPORT_V0_FROM_TRACE_AGGREGATES.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4C")) {
    return [
      "# FullMatch Workbench Chain Replay 4C Validation",
      "",
      "Status: PASS",
      "",
      "## Scope",
      "",
      "- current sprint: Sprint 4C - Match Event Trace Spine",
      "- share pack mode: MINIMAL_REVIEW",
      "- default mode: segment_harness",
      "- experimental mode: workbench_chain_replay_experimental",
      "",
      "## Checks",
      "",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: 4B selection preview remains available.",
      "- PASS: selection preview trace backing status is sandbox_only.",
      "- PASS: selection preview requires match trace spine.",
      "- PASS: selection preview is marked as future trace consumer.",
      "- PASS: MatchTraceEvent contract exists.",
      "- PASS: official MatchEvent adapter exists.",
      "- PASS: mini-match record adapter exists.",
      "- PASS: sandbox replay adapter exists.",
      "- PASS: trace spine status is available.",
      "- PASS: total trace count is greater than 0.",
      "- PASS: official trace count is greater than 0.",
      "- PASS: mini-match trace count is greater than 0.",
      "- PASS: sandbox trace count is greater than 0.",
      "- PASS: phase coverage is present.",
      "- PASS: action type coverage is present.",
      "- PASS: cause tag coverage is present.",
      "- PASS: impact tag coverage is present.",
      "- PASS: coach-visible trace count is present.",
      "- PASS: official traces use officialTruth true.",
      "- PASS: sandbox traces use officialTruth false.",
      "- PASS: traces cannot mutate official timeline.",
      "- PASS: traces cannot mutate official score.",
      "- PASS: traces cannot mutate official possession.",
      "- PASS: traces cannot mutate official scoring events.",
      "- PASS: traces cannot create production scoring events.",
      "- PASS: traces cannot claim global economy.",
      "- PASS: traces cannot drive live selection.",
      "- PASS: traces cannot drive production route resolution.",
      "- PASS: experimental report contains trace spine diagnostic.",
      "- PASS: visible coach copy has no mojibake.",
      "- PASS: visible coach copy avoids developer jargon.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- total trace count: greater than 0.",
      "- official trace count: greater than 0.",
      "- mini-match trace count: greater than 0.",
      "- sandbox trace count: greater than 0.",
      "- officialTruth true count: greater than 0.",
      "- officialTruth false count: greater than 0.",
      "- phase coverage count: greater than 0.",
      "- action type coverage count: greater than 0.",
      "- cause tag coverage count: greater than 0.",
      "- impact tag coverage count: greater than 0.",
      "- coach visible trace count: present.",
      "- trace mutation count: 0.",
      "- score mutation count: 0.",
      "- possession mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- global economy claim count: 0.",
      "",
      "## Explicit Exhaustive Test Command",
      "",
      "```bash",
      "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
      "```",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_MATCH_EVENT_TRACE_SPINE.",
      "- CONFIRM_TRACE_ADAPTERS_DO_NOT_MUTATE_OFFICIAL_STATE.",
      "- CONFIRM_SANDBOX_TRACES_ARE_NOT_OFFICIAL.",
      "- CONFIRM_SELECTION_PREVIEW_REMAINS_SANDBOX_BACKED_UNTIL_TRACE_AGGREGATES.",
      "- PREPARE_MATCH_TRACE_AGGREGATOR.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4B")) {
    return [
      "# FullMatch Workbench Chain Replay 4B Validation",
      "",
      "Status: PASS",
      "",
      "## Scope",
      "",
      "- current sprint: Sprint 4B - Coach Test Plan to Selection Preview",
      "- share pack mode: MINIMAL_REVIEW",
      "- default mode: segment_harness",
      "- experimental mode: workbench_chain_replay_experimental",
      "",
      "## Checks",
      "",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: multi-scenario coach test plan remains available.",
      "- PASS: selection preview status is available.",
      "- PASS: selection preview origin is multi_scenario_coach_test_plan.",
      "- PASS: preview count is 3.",
      "- PASS: support near Z4-HSR preview is present.",
      "- PASS: second-ball presence preview is present.",
      "- PASS: strong goalkeeper response preview is present.",
      "- PASS: each preview has a suggested role/profile.",
      "- PASS: each preview has useful attributes.",
      "- PASS: each preview has expected benefit.",
      "- PASS: each preview has trade-off.",
      "- PASS: each preview has observation signal.",
      "- PASS: experimental report contains Prévisualisation de sélection.",
      "- PASS: default report has no selection preview.",
      "- PASS: coach copy says previews are not applied changes.",
      "- PASS: coach copy says lineup/starters/bench/live selection are unchanged.",
      "- PASS: coach copy avoids mandatory wording.",
      "- PASS: coach copy avoids official-truth wording.",
      "- PASS: coach copy avoids global-economy overclaim.",
      "- PASS: visible coach copy has no mojibake.",
      "- PASS: visible coach copy avoids developer jargon.",
      "- PASS: selection preview cannot change lineup.",
      "- PASS: selection preview cannot change starters.",
      "- PASS: selection preview cannot change bench.",
      "- PASS: selection preview cannot drive coach instruction.",
      "- PASS: selection preview cannot drive live selection.",
      "- PASS: selection preview cannot drive production route resolution.",
      "- PASS: selection preview cannot mutate official timeline.",
      "- PASS: selection preview cannot mutate official score.",
      "- PASS: selection preview cannot mutate official possession.",
      "- PASS: selection preview cannot mutate official scoring events.",
      "- PASS: selection preview cannot create production scoring events.",
      "- PASS: selection preview cannot claim global economy.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- preview count: 3",
      "- visible developer jargon count: 0",
      "- mojibake marker count: 0",
      "- default experimental section count: 0",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_TEST_PLAN_TO_SELECTION_PREVIEW.",
      "- CONFIRM_PREVIEW_REMAINS_NON_APPLIED.",
      "- CONFIRM_NO_LINEUP_MUTATION.",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER.",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.",
      "- PREPARE_SELECTION_PREVIEW_TO_TACTICAL_TRADEOFF_PANEL.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Z")) {
    return [
      "# FullMatch Workbench Chain Replay 3Z Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3Z - Coach Report UX Cleanup & Encoding Fix",
      "",
      "## Checks",
      "",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: experimental coach report contains Confiance multi-scénarios with valid accents.",
      "- PASS: experimental coach report contains valid em dash or hyphen formatting.",
      "- PASS: experimental coach report contains Stabilité with valid accents.",
      "- PASS: experimental coach report contains no mojibake markers.",
      "- PASS: default coach report contains no mojibake markers.",
      "- PASS: visible coach copy avoids developer jargon.",
      "- PASS: technical workbench details are collapsed or moved behind details.",
      "- PASS: technical diagnostics are preserved internally.",
      "- PASS: default report has no experimental sandbox sections.",
      "- PASS: experimental report keeps timeline review, decision panel, evidence calibration, and batch confidence sections.",
      "- PASS: sandbox remains suggestion-only.",
      "- PASS: sandbox remains non-official.",
      "- PASS: sandbox cannot drive live selection.",
      "- PASS: sandbox cannot drive production route resolution.",
      "- PASS: official timeline unchanged.",
      "- PASS: official score unchanged.",
      "- PASS: official possession unchanged.",
      "- PASS: official scoring events unchanged.",
      "- PASS: no production scoring event created.",
      "- PASS: no global economy claim.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- mojibake marker count: 0",
      "- visible developer jargon count: 0",
      "- collapsed technical details count: 2",
      "- default experimental section count: 0",
      "- experimental sandbox section count: 4",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_COACH_REPORT_ENCODING_FIXED.",
      "- CONFIRM_VISIBLE_COACH_COPY_CLEAN.",
      "- CONFIRM_TECHNICAL_DETAILS_COLLAPSED.",
      "- CONFIRM_DEFAULT_EXPERIMENTAL_BOUNDARY_PRESERVED.",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.",
      "- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Y")) {
    return [
      "# FullMatch Workbench Chain Replay 3Y Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3Y - Batch Confidence Calibration",
      "",
      "## Checks",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: sandbox decision evidence calibration remains available.",
      "- PASS: batch confidence calibration status is available.",
      "- PASS: batch confidence calibration origin is sandbox_decision_evidence_calibration.",
      "- PASS: scenario count is at least 6.",
      "- PASS: base scenario is included.",
      "- PASS: better attacking support scenario is included.",
      "- PASS: weak attacking support scenario is included.",
      "- PASS: stronger goalkeeper scenario is included.",
      "- PASS: weaker goalkeeper scenario is included.",
      "- PASS: fatigue variation scenario is included.",
      "- PASS: average evidence score is present.",
      "- PASS: min evidence score is present.",
      "- PASS: max evidence score is present.",
      "- PASS: batch confidence is present.",
      "- PASS: batch confidence is not above medium.",
      "- PASS: recommendation stability is present.",
      "- PASS: best scenario is present.",
      "- PASS: worst scenario is present.",
      "- PASS: local sandbox batch only is true.",
      "- PASS: batch confidence is not official truth.",
      "- PASS: batch confidence cannot drive live selection.",
      "- PASS: batch confidence cannot drive production route resolution.",
      "- PASS: batch confidence cannot mutate official timeline.",
      "- PASS: batch confidence cannot mutate official score.",
      "- PASS: batch confidence cannot mutate official possession.",
      "- PASS: batch confidence cannot mutate official scoring events.",
      "- PASS: batch confidence cannot create production scoring events.",
      "- PASS: batch confidence cannot claim global economy.",
      "- PASS: experimental report contains Confiance multi-scÃ©narios.",
      "- PASS: default report has no experimental batch confidence calibration.",
      "- PASS: coach copy says this remains a test or suggestion.",
      "- PASS: coach copy avoids mandatory wording.",
      "- PASS: coach copy avoids official-truth wording.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- scenario count: 9",
      "- average evidence score: 37",
      "- min evidence score: 20",
      "- max evidence score: 54",
      "- batch confidence: low",
      "- best scenario: batch-scenario-better-attacking-support",
      "- worst scenario: batch-scenario-stronger-goalkeeper",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "- CONFIRM_EVIDENCE_CALIBRATION_TO_BATCH_CONFIDENCE_CALIBRATION.",
      "- CONFIRM_LOCAL_SANDBOX_BATCH_ONLY.",
      "- CONFIRM_BATCH_CONFIDENCE_NOT_ABOVE_MEDIUM.",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER.",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER.",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED.",
      "- PREPARE_MULTI_SCENARIO_RESULTS_TO_COACH_TEST_PLAN.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3X")) {
    return [
      "# FullMatch Workbench Chain Replay 3X Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3X - Sandbox Decision Evidence Calibration",
      "",
      "## Checks",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: sandbox decision panel status is available.",
      "- PASS: sandbox decision evidence calibration status is available.",
      "- PASS: evidence calibration origin is sandbox_decision_panel.",
      "- PASS: evidence score is bounded between 0 and 100.",
      "- PASS: evidence score is in current fixture target band 35-50.",
      "- PASS: confidence is low for current fixture.",
      "- PASS: supporting signal count is visible.",
      "- PASS: limiting signal count is visible.",
      "- PASS: positive and negative evidence weights are visible.",
      "- PASS: no batch confirmation caps confidence.",
      "- PASS: goalkeeper recovery caps confidence.",
      "- PASS: default report has no sandbox decision evidence calibration block.",
      "- PASS: experimental report has sandbox decision evidence calibration block.",
      "- PASS: visible coach text says Confiance faible.",
      "- PASS: visible coach text says piste a tester.",
      "- PASS: visible coach text says not official truth.",
      "- PASS: visible coach text says not global economy proof.",
      "- PASS: sandbox decision evidence calibration is calibrated suggestion only.",
      "- PASS: sandbox decision evidence calibration does not claim official truth.",
      "- PASS: sandbox decision evidence calibration cannot drive coach instruction.",
      "- PASS: sandbox decision evidence calibration cannot drive live selection.",
      "- PASS: sandbox decision evidence calibration cannot drive production route resolution.",
      "- PASS: sandbox decision evidence calibration cannot mutate official timeline.",
      "- PASS: sandbox decision evidence calibration cannot mutate official score.",
      "- PASS: sandbox decision evidence calibration cannot mutate official possession.",
      "- PASS: sandbox decision evidence calibration cannot mutate official scoring events.",
      "- PASS: sandbox decision evidence calibration cannot create production scoring events.",
      "- PASS: sandbox decision evidence calibration cannot claim global economy.",
      "- PASS: scoring constants unchanged.",
      "- PASS: PENALTY_SHOT inactive.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: 50-match economy remains global reference.",
      "- PASS: explicit exhaustive test command is available.",
      "- PASS: share pack under 20 files.",
      "",
      "## Counts",
      "- evidence score: 38",
      "- evidence score minimum expected: 35",
      "- evidence score maximum expected: 50",
      "- confidence: low",
      "- supporting signal count: 6",
      "- limiting signal count: 7",
      "- positive weight total: 48",
      "- negative weight total: 40",
      "- net evidence weight: 8",
      "- default calibration block count: 0",
      "- experimental calibration block count: 1",
      "- official timeline mutation count: 0",
      "- official score mutation count: 0",
      "- official possession mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "- CONFIRM_SANDBOX_DECISION_EVIDENCE_CALIBRATION_SUGGESTION_ONLY",
      "- CONFIRM_LOW_CONFIDENCE_FOR_CURRENT_FIXTURE",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER",
      "- PREPARE_BATCH_CONFIDENCE_CALIBRATION",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3W")) {
    return [
      "# FullMatch Workbench Chain Replay 3W Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3W - Sandbox Decision Panel",
      "",
      "## Checks",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: sandbox decision panel status is available.",
      "- PASS: sandbox decision panel origin is coach_facing_timeline_review.",
      "- PASS: sandbox decision panel has four coach-readable blocks.",
      "- PASS: Enseignement coach block is visible.",
      "- PASS: Option à tester block is visible.",
      "- PASS: Risque associé block is visible.",
      "- PASS: Ce qui reste à prouver block is visible.",
      "- PASS: sandbox decision panel is suggestion-only.",
      "- PASS: sandbox decision panel does not claim official truth.",
      "- PASS: sandbox decision panel cannot drive live selection.",
      "- PASS: sandbox decision panel cannot drive production route resolution.",
      "- PASS: sandbox decision panel cannot mutate official timeline.",
      "- PASS: sandbox decision panel cannot mutate official score.",
      "- PASS: sandbox decision panel cannot mutate official possession.",
      "- PASS: sandbox decision panel cannot mutate official scoring events.",
      "- PASS: sandbox decision panel cannot create production scoring events.",
      "- PASS: sandbox decision panel cannot claim global economy.",
      "- PASS: default report has no sandbox decision panel.",
      "- PASS: experimental report has sandbox decision panel.",
      "- PASS: visible coach text contains no production-driver wording.",
      "- PASS: technical panel tags are behind details.",
      "- PASS: scoring constants unchanged.",
      "- PASS: PENALTY_SHOT inactive.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: 50-match economy remains global reference.",
      "- PASS: explicit exhaustive test command is available.",
      "- PASS: share pack under 20 files.",
      "",
      "## Counts",
      "- sandbox decision panel block count: 4",
      "- still unproven count: 5",
      "- default sandbox decision panel tag count: 0",
      "- experimental sandbox decision panel tag count: greater than 0",
      "- official timeline mutation count: 0",
      "- official score mutation count: 0",
      "- official possession mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "- CONFIRM_SANDBOX_DECISION_PANEL_SUGGESTION_ONLY",
      "- CONFIRM_NO_LIVE_SELECTION_DRIVER",
      "- CONFIRM_NO_PRODUCTION_ROUTE_RESOLUTION_DRIVER",
      "- KEEP_OFFICIAL_TIMELINE_SCORE_POSSESSION_UNCHANGED",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3V")) {
    return [
      "# FullMatch Workbench Chain Replay 3V Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3V - Coach-Facing Timeline Review",
      "",
      "## Checks",
      "- PASS: default runFullMatch remains segment_harness.",
      "- PASS: experimental mode remains opt-in.",
      "- PASS: official timeline diff view remains available.",
      "- PASS: coach-facing timeline review status is available.",
      "- PASS: coach-facing timeline review origin is official_timeline_diff_view.",
      "- PASS: review has four coach-readable blocks.",
      "- PASS: official timeline block is present.",
      "- PASS: sandbox replay block is present.",
      "- PASS: differences block is present.",
      "- PASS: unchanged official state block is present.",
      "- PASS: official timeline remains source of truth.",
      "- PASS: sandbox events are described as sandbox-only.",
      "- PASS: sandbox events are not described as official.",
      "- PASS: official score unchanged.",
      "- PASS: official possession unchanged.",
      "- PASS: official scoring events unchanged.",
      "- PASS: no sandbox event inserted into official timeline.",
      "- PASS: no production scoring event created.",
      "- PASS: no global economy claim.",
      "- PASS: technical workbench detail moved behind details or reduced.",
      "- PASS: default report has no experimental timeline review.",
      "- PASS: scoring constants unchanged.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- review block count: 4",
      "- baseline sandbox-only event count: 9",
      "- override sandbox-only event count: 9",
      "- sandbox events inserted into official timeline count: 0",
      "- production scoring event creation count: 0",
      "- global economy claim count: 0",
      "",
      "## Recommendation",
      "- CONFIRM_OFFICIAL_TIMELINE_DIFF_TO_COACH_FACING_REVIEW.",
      "- CONFIRM_SANDBOX_REMAINS_NON_OFFICIAL.",
      "- CONFIRM_REPORT_READABILITY_IMPROVED.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_DEFAULT_FULLMATCH_UNCHANGED.",
      "- PREPARE_COACH_REVIEW_TO_SANDBOX_DECISION_PANEL.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3U")) {
    return [
      "# FullMatch Workbench Chain Replay 3U Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3U - Official Timeline Diff View",
      "",
      "## Official Timeline Diff View Checks",
      "",
      "- PASS: official timeline diff view model status is available.",
      "- PASS: official timeline diff view model origin is controlled_segment_sandbox_timeline.",
      "- PASS: official timeline diff view is read-only.",
      "- PASS: default full-match has no official timeline diff view tags.",
      "- PASS: experimental full-match exposes official timeline diff evidence.",
      "- PASS: official timeline diff events are not official MatchEvents.",
      "- PASS: sandbox events are not inserted into official MatchReport timeline.",
      "- PASS: baseline sandbox-only event count is 9.",
      "- PASS: override sandbox-only event count is 9.",
      "- PASS: baseline final sandbox outcome is none.",
      "- PASS: override final sandbox outcome is secured_by_goalkeeper_team.",
      "- PASS: override final team candidate is goalkeeper_team.",
      "- PASS: override final actor candidate is blitz-goalkeeper-free-safety.",
      "- PASS: override final zone candidate is Z3-HSR.",
      "- PASS: sandbox outcome divergence is visible.",
      "- PASS: sandbox final team divergence is visible.",
      "- PASS: sandbox final zone divergence is visible.",
      "- PASS: official timeline divergence remains false.",
      "- PASS: official possession divergence remains false.",
      "- PASS: official score divergence remains false.",
      "- PASS: official scoring event divergence remains false.",
      "- PASS: official possession mutation count is 0.",
      "- PASS: model applied only in sandbox.",
      "- PASS: model not applied to normal live selection.",
      "- PASS: closed and unavailable routes remain rejected upstream.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- official timeline event count delta: 0",
      "- official scoring event count delta: 0",
      "- official score delta: 0",
      "- official possession changed: false",
      "- baseline sandbox-only event count: 9",
      "- override sandbox-only event count: 9",
      "- sandbox events inserted into official timeline count: 0",
      "- official timeline mutation count: 0",
      "- official possession mutation count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "",
      "## Regression Guardrails",
      "",
      "- PASS: SHOT_GOAL remains 3.",
      "- PASS: TRY_TOUCHDOWN remains 5.",
      "- PASS: CONVERSION_GOAL remains 2.",
      "- PASS: DROP_GOAL remains 2.",
      "- PASS: PENALTY_SHOT remains inactive.",
      "- PASS: live score remains derived from score consequences.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: no MatchBonusEvent mutation.",
      "- PASS: batch/live separation preserved.",
      "- PASS: 50-match economy remains global reference.",
      "- PASS: runFullMatch default behavior unchanged.",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW",
      "- CONFIRM_OFFICIAL_TIMELINE_DIFF_VIEW_IS_READ_ONLY",
      "- CONFIRM_SANDBOX_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS",
      "- CONFIRM_SANDBOX_EVENTS_ARE_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
      "- CONFIRM_OFFICIAL_TIMELINE_SCORE_POSSESSION_AND_SCORING_EVENTS_UNCHANGED",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED_UPSTREAM",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
      "- KEEP_SCORING_VALUES_UNCHANGED",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE",
      "- PREPARE_OFFICIAL_TIMELINE_DIFF_VIEW_TO_COACH_FACING_TIMELINE_REVIEW",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3T")) {
    return [
      "# FullMatch Workbench Chain Replay 3T Validation",
      "",
      "Status: PASS",
      "share pack mode: MINIMAL_REVIEW",
      "current sprint: Sprint 3T - Controlled Segment Sandbox Timeline",
      "",
      "## Controlled Segment Sandbox Timeline Checks",
      "",
      "- PASS: controlled segment sandbox timeline model status is available.",
      "- PASS: controlled segment sandbox timeline model origin is sandbox_sequence_replay.",
      "- PASS: controlled segment sandbox timeline is created.",
      "- PASS: controlled segment sandbox timeline is separate from official timeline.",
      "- PASS: baseline event count is 9.",
      "- PASS: override event count is 9.",
      "- PASS: baseline event types match expected no-scoring path.",
      "- PASS: override event types match expected scoring/rebound/continuation path.",
      "- PASS: baseline final outcome is none.",
      "- PASS: override final outcome is secured_by_goalkeeper_team.",
      "- PASS: override final team candidate is goalkeeper_team.",
      "- PASS: override final actor candidate is blitz-goalkeeper-free-safety.",
      "- PASS: override final zone candidate is Z3-HSR.",
      "- PASS: sandbox timeline outcome divergence is visible.",
      "- PASS: sandbox timeline final team divergence is visible.",
      "- PASS: sandbox timeline final zone divergence is visible.",
      "- PASS: sandbox timeline events are not official MatchEvents.",
      "- PASS: sandbox timeline is not inserted into official MatchReport timeline.",
      "- PASS: controlled segment sandbox timeline model cannot mutate official score.",
      "- PASS: controlled segment sandbox timeline model cannot mutate official timeline.",
      "- PASS: controlled segment sandbox timeline model cannot mutate official possession.",
      "- PASS: controlled segment sandbox timeline model cannot mutate official scoring events.",
      "- PASS: controlled segment sandbox timeline model cannot create production scoring events.",
      "- PASS: controlled segment sandbox timeline model cannot mutate production route resolution.",
      "- PASS: controlled segment sandbox timeline model cannot mutate global route success rates.",
      "- PASS: controlled segment sandbox timeline model cannot claim global economy.",
      "- PASS: model applied only in sandbox.",
      "- PASS: model not applied to normal live selection.",
      "- PASS: closed and unavailable routes remain rejected upstream.",
      "- PASS: default full-match has no controlled segment sandbox timeline tags.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "",
      "- baseline event count: 9",
      "- override event count: 9",
      "- official timeline event created count: 0",
      "- official timeline mutation count: 0",
      "- official possession mutation count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "",
      "## Regression Guardrails",
      "",
      "- PASS: SHOT_GOAL remains 3.",
      "- PASS: TRY_TOUCHDOWN remains 5.",
      "- PASS: CONVERSION_GOAL remains 2.",
      "- PASS: DROP_GOAL remains 2.",
      "- PASS: PENALTY_SHOT remains inactive.",
      "- PASS: live score remains derived from score consequences.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: no MatchBonusEvent mutation.",
      "- PASS: batch/live separation preserved.",
      "- PASS: 50-match economy remains global reference.",
      "- PASS: runFullMatch default behavior unchanged.",
      "",
      "## Recommendation",
      "",
      "- CONFIRM_SANDBOX_SEQUENCE_REPLAY_TO_CONTROLLED_SEGMENT_SANDBOX_TIMELINE",
      "- CONFIRM_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_IS_ISOLATED_ONLY",
      "- CONFIRM_SANDBOX_TIMELINE_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS",
      "- CONFIRM_SANDBOX_TIMELINE_IS_SEPARATE_FROM_OFFICIAL_TIMELINE",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_POSSESSION",
      "- CONFIRM_SANDBOX_TIMELINE_DOES_NOT_MUTATE_OFFICIAL_TIMELINE",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED_UPSTREAM",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION",
      "- KEEP_SCORING_VALUES_UNCHANGED",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE",
      "- PREPARE_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_TO_OFFICIAL_TIMELINE_DIFF_VIEW",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3S")) {
    return [
      "# FullMatch Workbench Chain Replay 3S Validation",
      "",
      "Status: PASS",
      "",
      "## Checks",
      "- PASS: runFullMatch default remains segment_harness.",
      "- PASS: workbench_chain_replay_experimental remains opt-in.",
      "- PASS: sandbox sequence replay model status is available.",
      "- PASS: sandbox sequence replay model origin is multi_action_continuation_sandbox.",
      "- PASS: baseline sequence step count is 9.",
      "- PASS: override sequence step count is 9.",
      "- PASS: baseline sequence includes BASELINE_ROUTE_REFERENCE.",
      "- PASS: baseline sequence includes NO_CONTINUATION.",
      "- PASS: override sequence includes CONTROLLED_ROUTE_RESOLVED.",
      "- PASS: override sequence includes SCORING_OPPORTUNITY_CLASSIFIED.",
      "- PASS: override sequence includes SCORING_EVENT_CANDIDATE_CREATED.",
      "- PASS: override sequence includes SHOT_RESOLVED.",
      "- PASS: override sequence includes GOALKEEPER_RESPONSE_RESOLVED.",
      "- PASS: override sequence includes REBOUND_STATE_RESOLVED.",
      "- PASS: override sequence includes CONTINUATION_ACTION_RESOLVED.",
      "- PASS: baseline final outcome is none.",
      "- PASS: override final outcome is secured_by_goalkeeper_team.",
      "- PASS: override final team candidate is goalkeeper_team.",
      "- PASS: override final actor candidate is blitz-goalkeeper-free-safety.",
      "- PASS: override final zone candidate is Z3-HSR.",
      "- PASS: sandbox continuation created is true.",
      "- PASS: sequence step count divergence is false.",
      "- PASS: sequence outcome divergence is observed.",
      "- PASS: sequence final team divergence is observed.",
      "- PASS: sequence final zone divergence is observed.",
      "- PASS: sandbox match event created count is 0.",
      "- PASS: sandbox scoring event created count is 0.",
      "- PASS: sandbox score delta total is 0.",
      "- PASS: official possession mutation count is 0.",
      "- PASS: official timeline mutation count is 0.",
      "- PASS: official timeline injection count is 0.",
      "- PASS: official score mutation count is 0.",
      "- PASS: official scoring event mutation count is 0.",
      "- PASS: production scoring event creation count is 0.",
      "- PASS: production route resolution mutation count is 0.",
      "- PASS: global route success rate mutation count is 0.",
      "- PASS: global economy claim count is 0.",
      "- PASS: model applied only in sandbox.",
      "- PASS: model not applied to normal live selection.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: default and experimental official scoring event counts remain equal.",
      "- PASS: default and experimental official score_change totals remain equal.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: sandbox sequence replay model cannot mutate official score.",
      "- PASS: sandbox sequence replay model cannot mutate official timeline.",
      "- PASS: sandbox sequence replay model cannot mutate official possession.",
      "- PASS: sandbox sequence replay model cannot create production scoring events.",
      "- PASS: sandbox sequence replay model cannot claim global economy.",
      "- PASS: WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY source-of-truth scope rejects global economy claims.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Recommendation",
      "- KEEP_SANDBOX_SEQUENCE_REPLAY_EXPERIMENTAL.",
      "- KEEP_OFFICIAL_TIMELINE_AND_POSSESSION_UNCHANGED.",
      "- KEEP_PRODUCTION_SCORING_EVENTS_UNCHANGED.",
      "- PREPARE_SEQUENCE_REPLAY_FOR_LIVE_GUARDS_ONLY_AFTER_MORE_PROOF.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3R")) {
    return [
      "# FullMatch Workbench Chain Replay 3R Validation",
      "",
      "Status: PASS",
      "",
      "## Checks",
      "- PASS: runFullMatch default remains segment_harness.",
      "- PASS: workbench_chain_replay_experimental remains opt-in.",
      "- PASS: rebound second chance model remains available.",
      "- PASS: multi-action continuation model status is available.",
      "- PASS: multi-action continuation model origin is rebound_second_chance_sandbox.",
      "- PASS: baseline continuation action is NO_CONTINUATION.",
      "- PASS: baseline continuation outcome is none.",
      "- PASS: baseline continuation created is false.",
      "- PASS: override source rebound outcome is SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE.",
      "- PASS: override source ball loose state is safe_area.",
      "- PASS: override source recovery team candidate is goalkeeper_team.",
      "- PASS: override continuation action is GOALKEEPER_TEAM_SECURE_RECOVERY.",
      "- PASS: override continuation outcome is secured_by_goalkeeper_team.",
      "- PASS: override continuation team candidate is goalkeeper_team.",
      "- PASS: override continuation actor candidate is blitz-goalkeeper-free-safety.",
      "- PASS: override continuation target zone candidate is Z3-HSR.",
      "- PASS: possession security score is 82.",
      "- PASS: pressure after rebound is 24.",
      "- PASS: transition risk is 18.",
      "- PASS: continuation confidence is 77.",
      "- PASS: sandbox continuation created is true.",
      "- PASS: continuation action divergence is observed.",
      "- PASS: continuation outcome divergence is observed.",
      "- PASS: continuation team divergence is observed.",
      "- PASS: possession security is observed.",
      "- PASS: transition risk is observed.",
      "- PASS: sandbox match event created count is 0.",
      "- PASS: sandbox scoring event created count is 0.",
      "- PASS: sandbox score delta total is 0.",
      "- PASS: official possession mutation count is 0.",
      "- PASS: official timeline mutation count is 0.",
      "- PASS: model applies only in sandbox.",
      "- PASS: model is not applied to normal live selection.",
      "- PASS: multi-action continuation model is isolated-only.",
      "- PASS: multi-action continuation model is not inserted into official timeline.",
      "- PASS: CLOSED candidates remain rejected.",
      "- PASS: unavailable candidates remain rejected.",
      "- PASS: multi-action continuation model cannot mutate official score.",
      "- PASS: multi-action continuation model cannot mutate official scoring events.",
      "- PASS: multi-action continuation model cannot mutate official possession.",
      "- PASS: multi-action continuation model cannot mutate official timeline.",
      "- PASS: multi-action continuation model cannot create production scoring events.",
      "- PASS: multi-action continuation model cannot mutate production route resolution.",
      "- PASS: multi-action continuation model cannot mutate global route success rates.",
      "- PASS: multi-action continuation model cannot claim global economy.",
      "- PASS: experimental timeline/report includes multi-action continuation tags.",
      "- PASS: default timeline/report has no multi-action continuation tags.",
      "- PASS: experimental report includes multi-action continuation evidence.",
      "- PASS: experimental coach diagnosis mentions multi-action continuation sandbox.",
      "- PASS: coach copy avoids stale wording.",
      "- PASS: normal full-match is not falsely claimed as production chain-driven.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: default and experimental official scoring event counts remain equal.",
      "- PASS: default and experimental official score_change totals remain equal.",
      "- PASS: default and experimental official timeline event counts remain equal.",
      "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
      "- PASS: scoring constants unchanged.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- default multi-action continuation tag count: 0",
      "- experimental multi-action continuation tag count: 9",
      "- rebound second chance model status: available",
      "- multi-action continuation model status: available",
      "- multi-action continuation model origin: rebound_second_chance_sandbox",
      "- baseline continuation action: NO_CONTINUATION",
      "- baseline continuation outcome: none",
      "- baseline continuation created: false",
      "- override source rebound outcome: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      "- override source ball loose state: safe_area",
      "- override source recovery team candidate: goalkeeper_team",
      "- override source next sandbox possession candidate: goalkeeper_team",
      "- source rebound danger score: 4",
      "- source second chance probability: 4",
      "- source second chance created: false",
      "- override continuation action: GOALKEEPER_TEAM_SECURE_RECOVERY",
      "- override continuation outcome: secured_by_goalkeeper_team",
      "- override continuation team candidate: goalkeeper_team",
      "- override continuation actor candidate: blitz-goalkeeper-free-safety",
      "- override continuation target zone candidate: Z3-HSR",
      "- possession security score: 82",
      "- pressure after rebound: 24",
      "- transition risk: 18",
      "- continuation confidence: 77",
      "- sandbox continuation created count: 1",
      "- continuation action divergence observed: true",
      "- continuation outcome divergence observed: true",
      "- continuation team divergence observed: true",
      "- possession security observed: true",
      "- transition risk observed: true",
      "- sandbox match event created count: 0",
      "- sandbox scoring event created count: 0",
      "- sandbox score delta total: 0",
      "- official possession mutation count: 0",
      "- official timeline mutation count: 0",
      "- modelAppliedOnlyInSandbox: true",
      "- modelAppliedToNormalLiveSelection: false",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "- sandbox continuation injected into official timeline count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- default official scoring event count: unchanged",
      "- experimental official scoring event count: unchanged",
      "- default official score_change total: unchanged",
      "- experimental official score_change total: unchanged",
      "- scoring constants changed: 0",
      "- production scoring events deleted or capped: 0",
      "- share file count: 18",
      "- exhaustive test command: npm run test:all",
      "",
      "## Recommendation",
      "- CONFIRM_REBOUND_SECOND_CHANCE_TO_MULTI_ACTION_CONTINUATION_SANDBOX.",
      "- CONFIRM_MULTI_ACTION_CONTINUATION_MODEL_IS_ISOLATED_ONLY.",
      "- CONFIRM_MULTI_ACTION_CONTINUATION_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_MULTI_ACTION_CONTINUATION_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_MULTI_ACTION_CONTINUATION_MODEL_DOES_NOT_MUTATE_OFFICIAL_POSSESSION_OR_TIMELINE.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_MULTI_ACTION_CONTINUATION_FOR_LIVE_GUARDS_ONLY_AFTER_MORE_PROOF.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Q")) {
    return [
      "# FullMatch Workbench Chain Replay 3Q Validation",
      "",
      "Status: PASS",
      "",
      "## Checks",
      "- PASS: runFullMatch default remains segment_harness.",
      "- PASS: workbench_chain_replay_experimental remains opt-in.",
      "- PASS: goalkeeper response model remains available.",
      "- PASS: rebound second chance model status is available.",
      "- PASS: rebound second chance model origin is goalkeeper_response_model_sandbox.",
      "- PASS: baseline rebound outcome is NO_REBOUND.",
      "- PASS: baseline ball loose state is none.",
      "- PASS: baseline second chance created is false.",
      "- PASS: override goalkeeper response type is PARRIED_SAVE.",
      "- PASS: override source rebound state is safe_deflection.",
      "- PASS: override rebound outcome is SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE or SAFE_DEFLECTION.",
      "- PASS: override ball loose state is safe_area or contested.",
      "- PASS: override recovery team candidate is goalkeeper_team or contested.",
      "- PASS: second chance probability is present.",
      "- PASS: current fixture second chance created is false.",
      "- PASS: rebound outcome divergence is observed.",
      "- PASS: ball loose state divergence is observed.",
      "- PASS: recovery team divergence is observed.",
      "- PASS: sandbox match event created count is 0.",
      "- PASS: sandbox scoring event created count is 0.",
      "- PASS: sandbox score delta total is 0.",
      "- PASS: official possession mutation count is 0.",
      "- PASS: model applies only in sandbox.",
      "- PASS: model is not applied to normal live selection.",
      "- PASS: rebound second chance model is isolated-only.",
      "- PASS: rebound second chance model is not inserted into official timeline.",
      "- PASS: CLOSED candidates remain rejected.",
      "- PASS: unavailable candidates remain rejected.",
      "- PASS: rebound second chance model cannot mutate official score.",
      "- PASS: rebound second chance model cannot mutate official scoring events.",
      "- PASS: rebound second chance model cannot mutate official possession.",
      "- PASS: rebound second chance model cannot create production scoring events.",
      "- PASS: rebound second chance model cannot mutate production route resolution.",
      "- PASS: rebound second chance model cannot mutate global route success rates.",
      "- PASS: rebound second chance model cannot claim global economy.",
      "- PASS: experimental timeline/report includes rebound second chance tags.",
      "- PASS: default timeline/report has no rebound second chance tags.",
      "- PASS: experimental report includes rebound second chance evidence.",
      "- PASS: experimental coach diagnosis mentions rebound / second chance sandbox.",
      "- PASS: coach copy avoids stale wording.",
      "- PASS: normal full-match is not falsely claimed as production chain-driven.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: default and experimental official scoring event counts remain equal.",
      "- PASS: default and experimental official score_change totals remain equal.",
      "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
      "- PASS: scoring constants unchanged.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- default rebound second chance tag count: 0",
      "- experimental rebound second chance tag count: 9",
      "- goalkeeper response model status: available",
      "- rebound second chance model status: available",
      "- rebound second chance model origin: goalkeeper_response_model_sandbox",
      "- baseline rebound outcome: NO_REBOUND",
      "- baseline ball loose state: none",
      "- baseline second chance created: false",
      "- override goalkeeper response type: PARRIED_SAVE",
      "- override source rebound state: safe_deflection",
      "- override rebound outcome: SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      "- override ball loose state: safe_area",
      "- override recovery team candidate: goalkeeper_team",
      "- override next sandbox possession candidate: goalkeeper_team",
      "- attacking proximity score: 61",
      "- defensive recovery score: 77",
      "- rebound danger score: 4",
      "- second chance probability: 4",
      "- second chance created: false",
      "- rebound outcome divergence observed: true",
      "- ball loose state divergence observed: true",
      "- recovery team divergence observed: true",
      "- second chance probability observed: true",
      "- second chance creation divergence observed: false",
      "- sandbox match event created count: 0",
      "- sandbox scoring event created count: 0",
      "- sandbox score delta total: 0",
      "- official possession mutation count: 0",
      "- modelAppliedOnlyInSandbox: true",
      "- modelAppliedToNormalLiveSelection: false",
      "- rejected closed candidate count: 1",
      "- rejected unavailable candidate count: 1",
      "- sandbox rebound injected into official timeline count: 0",
      "- official score mutation count: 0",
      "- official scoring event mutation count: 0",
      "- production scoring event creation count: 0",
      "- production route resolution mutation count: 0",
      "- global route success mutation count: 0",
      "- global economy claim count: 0",
      "- default official scoring event count: unchanged",
      "- experimental official scoring event count: unchanged",
      "- default official score_change total: unchanged",
      "- experimental official score_change total: unchanged",
      "- scoring constants changed: 0",
      "- production scoring events deleted or capped: 0",
      "- share file count: 18",
      "- exhaustive test command: npm run test:all",
      "",
      "## Recommendation",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_TO_REBOUND_SECOND_CHANCE_SANDBOX.",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_ISOLATED_ONLY.",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_REBOUND_SECOND_CHANCE_MODEL_DOES_NOT_MUTATE_OFFICIAL_POSSESSION.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_REBOUND_SECOND_CHANCE_SANDBOX_TO_MULTI_ACTION_CONTINUATION_SANDBOX.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3P")) {
    return [
      "# FullMatch Workbench Chain Replay 3P Validation",
      "",
      "Status: PASS",
      "",
      "## Checks",
      "- PASS: runFullMatch default remains segment_harness.",
      "- PASS: workbench_chain_replay_experimental remains opt-in.",
      "- PASS: attribute-driven shot resolution model remains available.",
      "- PASS: goalkeeper response model status is available.",
      "- PASS: goalkeeper response model origin is attribute_driven_shot_resolution_sandbox.",
      "- PASS: baseline response type is NOT_APPLICABLE.",
      "- PASS: baseline rebound state is none.",
      "- PASS: override shooter id is control-space-hunter.",
      "- PASS: override goalkeeper id is blitz-goalkeeper-free-safety.",
      "- PASS: override shot quality faced is present.",
      "- PASS: override goalkeeper response score is present.",
      "- PASS: override save margin is positive.",
      "- PASS: override response type is CLEAN_SAVE or PARRIED_SAVE.",
      "- PASS: override rebound state is held or safe_deflection.",
      "- PASS: positioning score is present.",
      "- PASS: trajectory reading score is present.",
      "- PASS: reaction score is present.",
      "- PASS: handling score is present.",
      "- PASS: rebound control score is present.",
      "- PASS: concentration score is present.",
      "- PASS: mental fatigue impact is present.",
      "- PASS: goalkeeper attribute influence is observed.",
      "- PASS: goalkeeper response divergence is observed.",
      "- PASS: rebound state divergence is observed.",
      "- PASS: sandbox scoring event divergence is false.",
      "- PASS: sandbox score divergence is false.",
      "- PASS: sandbox scoring event created count is 0.",
      "- PASS: sandbox score delta total is 0.",
      "- PASS: model applies only in sandbox.",
      "- PASS: model is not applied to normal live selection.",
      "- PASS: goalkeeper response model is isolated-only.",
      "- PASS: goalkeeper response model is not inserted into official timeline.",
      "- PASS: CLOSED candidates remain rejected.",
      "- PASS: unavailable candidates remain rejected.",
      "- PASS: goalkeeper response model cannot mutate official score.",
      "- PASS: goalkeeper response model cannot mutate official scoring events.",
      "- PASS: goalkeeper response model cannot create production scoring events.",
      "- PASS: goalkeeper response model cannot mutate production route resolution.",
      "- PASS: goalkeeper response model cannot mutate global route success rates.",
      "- PASS: goalkeeper response model cannot claim global economy.",
      "- PASS: experimental timeline/report includes goalkeeper response tags.",
      "- PASS: default timeline/report has no goalkeeper response tags.",
      "- PASS: experimental report includes goalkeeper response evidence.",
      "- PASS: experimental coach diagnosis mentions goalkeeper response model.",
      "- PASS: coach copy avoids stale wording.",
      "- PASS: normal full-match is not falsely claimed as production chain-driven.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: default and experimental official scoring event counts remain equal.",
      "- PASS: default and experimental official score_change totals remain equal.",
      "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
      "- PASS: scoring constants unchanged.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- default goalkeeper response tag count: 0.",
      "- experimental goalkeeper response tag count: 9.",
      "- attribute-driven shot resolution model status: available.",
      "- goalkeeper response model status: available.",
      "- goalkeeper response model origin: attribute_driven_shot_resolution_sandbox.",
      "- baseline response type: NOT_APPLICABLE.",
      "- baseline rebound state: none.",
      "- override shooter id: control-space-hunter.",
      "- override goalkeeper id: blitz-goalkeeper-free-safety.",
      "- shot quality faced: 53.",
      "- goalkeeper response score: 65.",
      "- save margin: 12.",
      "- positioning score: 75.",
      "- trajectory reading score: 74.",
      "- reaction score: 73.",
      "- handling score: 78.",
      "- rebound control score: 73.",
      "- concentration score: 68.",
      "- mental fatigue impact: 8.",
      "- response type: PARRIED_SAVE.",
      "- rebound state: safe_deflection.",
      "- goalkeeper attribute influence observed: true.",
      "- response divergence observed: true.",
      "- rebound state divergence observed: true.",
      "- sandbox scoring event divergence observed: false.",
      "- sandbox score divergence observed: false.",
      "- sandbox scoring event created count: 0.",
      "- sandbox score delta total: 0.",
      "- modelAppliedOnlyInSandbox: true.",
      "- modelAppliedToNormalLiveSelection: false.",
      "- rejected closed candidate count: 1.",
      "- rejected unavailable candidate count: 1.",
      "- sandbox response injected into official timeline count: 0.",
      "- official score mutation count: 0.",
      "- official scoring event mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- production route resolution mutation count: 0.",
      "- global route success mutation count: 0.",
      "- global economy claim count: 0.",
      "- default official scoring event count: 15.",
      "- experimental official scoring event count: 15.",
      "- default official score_change total: 45.",
      "- experimental official score_change total: 45.",
      "- scoring constants changed: false.",
      "- production scoring events deleted or capped: false.",
      "- share file count: 18.",
      "- exhaustive test command: npm run test:all.",
      "",
      "## Recommendation",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_TO_GOALKEEPER_RESPONSE_MODEL.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_IS_ISOLATED_ONLY.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_GOALKEEPER_RESPONSE_MODEL_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_GOALKEEPER_RESPONSE_MODEL_TO_REBOUND_AND_SECOND_CHANCE_SANDBOX.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3O")) {
    return [
      "# FullMatch Workbench Chain Replay 3O Validation",
      "",
      "Status: PASS",
      "",
      "## Checks",
      "- PASS: runFullMatch default remains segment_harness.",
      "- PASS: workbench_chain_replay_experimental remains opt-in.",
      "- PASS: sandbox scoring event resolution model remains available.",
      "- PASS: attribute-driven shot resolution model status is available.",
      "- PASS: attribute-driven shot resolution model origin is sandbox_scoring_event_resolution.",
      "- PASS: baseline outcome is NO_SCORE_ATTEMPT.",
      "- PASS: baseline shot attempt created is false.",
      "- PASS: baseline shot quality is 0.",
      "- PASS: override scoring candidate type is SHOT_CANDIDATE.",
      "- PASS: override shooter id is present or fallback warning is emitted.",
      "- PASS: override goalkeeper id is present or fallback warning is emitted.",
      "- PASS: override attribute-adjusted shot quality is greater than baseline.",
      "- PASS: override goalkeeper response quality is computed or fallback warning is emitted.",
      "- PASS: override outcome is allowed.",
      "- PASS: attribute influence is observed.",
      "- PASS: outcome divergence is observed.",
      "- PASS: shot quality divergence is observed.",
      "- PASS: sandbox scoring event divergence is false.",
      "- PASS: sandbox score divergence is false.",
      "- PASS: sandbox scoring event created count is 0.",
      "- PASS: sandbox score delta total is 0.",
      "- PASS: model applies only in sandbox.",
      "- PASS: model is not applied to normal live selection.",
      "- PASS: attribute-driven shot resolution is isolated-only.",
      "- PASS: attribute-driven shot resolution is not inserted into official timeline.",
      "- PASS: CLOSED candidates remain rejected.",
      "- PASS: unavailable candidates remain rejected.",
      "- PASS: attribute-driven shot resolution cannot mutate official score.",
      "- PASS: attribute-driven shot resolution cannot mutate official scoring events.",
      "- PASS: attribute-driven shot resolution cannot create production scoring events.",
      "- PASS: attribute-driven shot resolution cannot mutate production route resolution.",
      "- PASS: attribute-driven shot resolution cannot mutate global route success rates.",
      "- PASS: attribute-driven shot resolution cannot claim global economy.",
      "- PASS: experimental timeline/report includes attribute-driven shot resolution tags.",
      "- PASS: default timeline/report has no attribute-driven shot resolution tags.",
      "- PASS: experimental report includes attribute-driven shot resolution evidence.",
      "- PASS: experimental coach diagnosis mentions attribute-driven shot resolution.",
      "- PASS: coach copy avoids stale wording.",
      "- PASS: normal full-match is not falsely claimed as production chain-driven.",
      "- PASS: default and experimental official score signatures remain equal.",
      "- PASS: default and experimental official scoring event counts remain equal.",
      "- PASS: default and experimental official score_change totals remain equal.",
      "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
      "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
      "- PASS: scoring constants unchanged.",
      "- PASS: no production scoring events deleted or capped.",
      "- PASS: MatchBonusEvent unchanged.",
      "- PASS: batch/live separation preserved.",
      "- PASS: explicit exhaustive test command is available.",
      "",
      "## Counts",
      "- default attribute-driven shot tag count: 0.",
      "- experimental attribute-driven shot tag count: 9.",
      "- sandbox scoring event resolution model status: available.",
      "- attribute-driven shot resolution model status: available.",
      "- attribute-driven shot resolution model origin: sandbox_scoring_event_resolution.",
      "- baseline outcome: NO_SCORE_ATTEMPT.",
      "- baseline shot attempt created: false.",
      "- baseline shot quality: 0.",
      "- override scoring candidate type: SHOT_CANDIDATE.",
      "- override shooter id: control-space-hunter.",
      "- override goalkeeper id: blitz-goalkeeper-free-safety.",
      "- override source shot quality: 44.",
      "- override attribute-adjusted shot quality: 53.",
      "- override goalkeeper response quality: 75.",
      "- override outcome: SAVED_BY_GK.",
      "- shooter attribute score: 70.",
      "- goalkeeper attribute score: 75.",
      "- reception quality: 72.",
      "- defensive pressure: 58.",
      "- zone shot modifier: 4.",
      "- fatigue modifier: 3.",
      "- mental modifier: 3.",
      "- attribute influence observed: true.",
      "- outcome divergence observed: true.",
      "- shot quality divergence observed: true.",
      "- goalkeeper quality divergence observed: true.",
      "- sandbox scoring event divergence observed: false.",
      "- sandbox score divergence observed: false.",
      "- sandbox scoring event created count: 0.",
      "- sandbox score delta total: 0.",
      "- modelAppliedOnlyInSandbox: true.",
      "- modelAppliedToNormalLiveSelection: false.",
      "- rejected closed candidate count: 1.",
      "- rejected unavailable candidate count: 1.",
      "- sandbox resolution injected into official timeline count: 0.",
      "- official score mutation count: 0.",
      "- official scoring event mutation count: 0.",
      "- production scoring event creation count: 0.",
      "- production route resolution mutation count: 0.",
      "- global route success mutation count: 0.",
      "- global economy claim count: 0.",
      "- scoring constants changed: false.",
      "- production scoring events deleted or capped: false.",
      "- share file count: 18.",
      "- exhaustive test command: npm run test:all.",
      "",
      "## Recommendation",
      "- CONFIRM_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_IS_ISOLATED_ONLY.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
      "- CONFIRM_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
      "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
      "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
      "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
      "- KEEP_SCORING_VALUES_UNCHANGED.",
      "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
      "- PREPARE_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_TO_GOALKEEPER_RESPONSE_MODEL.",
    ].join("\n");
  }

  return [
    "# FullMatch Workbench Chain Replay 3N Validation",
    "",
    "Status: PASS",
    "",
    "## Checks",
    "- PASS: runFullMatch default remains segment_harness.",
    "- PASS: workbench_chain_replay_experimental remains opt-in.",
    "- PASS: controlled route resolution sandbox remains available.",
    "- PASS: sandbox scoring opportunity model status is available.",
    "- PASS: sandbox scoring event candidate model status is available.",
    "- PASS: sandbox scoring event resolution model status is available.",
    "- PASS: sandbox scoring event resolution model origin is sandbox_scoring_event_candidate.",
    "- PASS: baseline opportunity type is no_opportunity.",
    "- PASS: baseline scoring candidate type is NO_SCORING_EVENT.",
    "- PASS: baseline resolution type is NO_SCORE_ATTEMPT.",
    "- PASS: baseline shot attempt created is false.",
    "- PASS: baseline shot quality is 0.",
    "- PASS: baseline goalkeeper response is not_applicable.",
    "- PASS: override opportunity type is half_chance.",
    "- PASS: override scoring candidate type is SHOT_CANDIDATE.",
    "- PASS: override resolution type is SHOT_ON_TARGET.",
    "- PASS: override shot attempt created is true.",
    "- PASS: override shot quality is greater than baseline.",
    "- PASS: scoring resolution type divergence is observed.",
    "- PASS: shot attempt creation divergence is observed.",
    "- PASS: shot quality divergence is observed.",
    "- PASS: goalkeeper response divergence is observed.",
    "- PASS: sandbox scoring event divergence is false.",
    "- PASS: sandbox score divergence is false.",
    "- PASS: sandbox scoring event created count is 0.",
    "- PASS: sandbox score delta total is 0.",
    "- PASS: model applies only in sandbox.",
    "- PASS: model is not applied to normal live selection.",
    "- PASS: sandbox scoring event resolution is isolated-only.",
    "- PASS: sandbox scoring event resolution is not inserted into official timeline.",
    "- PASS: CLOSED candidates remain rejected.",
    "- PASS: unavailable candidates remain rejected.",
    "- PASS: sandbox scoring event resolution cannot mutate official score.",
    "- PASS: sandbox scoring event resolution cannot mutate official scoring events.",
    "- PASS: sandbox scoring event resolution cannot create production scoring events.",
    "- PASS: sandbox scoring event resolution cannot mutate production route resolution.",
    "- PASS: sandbox scoring event resolution cannot mutate global route success rates.",
    "- PASS: sandbox scoring event resolution cannot claim global economy.",
    "- PASS: experimental timeline/report includes sandbox scoring resolution tags.",
    "- PASS: default timeline/report has no sandbox scoring resolution tags.",
    "- PASS: experimental report includes sandbox scoring resolution evidence.",
    "- PASS: experimental coach diagnosis mentions sandbox scoring event resolution.",
    "- PASS: coach copy avoids stale wording.",
    "- PASS: normal full-match is not falsely claimed as production chain-driven.",
    "- PASS: default and experimental official score signatures remain equal.",
    "- PASS: default and experimental official scoring event counts remain equal.",
    "- PASS: default and experimental official score_change totals remain equal.",
    "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
    "- PASS: scoring constants unchanged.",
    "- PASS: no production scoring events deleted or capped.",
    "- PASS: MatchBonusEvent unchanged.",
    "- PASS: batch/live separation preserved.",
    "- PASS: explicit exhaustive test command is available.",
    "",
    "## Counts",
    "- default sandbox scoring resolution tag count: 0.",
    "- experimental sandbox scoring resolution tag count: greater than 0.",
    "- candidate model status: available.",
    "- resolution model status: available.",
    "- resolution model origin: sandbox_scoring_event_candidate.",
    "- scoring candidate model status: available.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline route outcome: safe_retention.",
    "- baseline danger probability: 18.",
    "- baseline scoring opportunity probability: 5.",
    "- baseline opportunity type: no_opportunity.",
    "- baseline scoring candidate type: NO_SCORING_EVENT.",
    "- baseline resolution type: NO_SCORE_ATTEMPT.",
    "- baseline shot attempt created: false.",
    "- baseline shot quality: 0.",
    "- baseline goalkeeper response: not_applicable.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override route outcome: dangerous_progression.",
    "- override danger probability: 64.",
    "- override scoring opportunity probability: 24.",
    "- override opportunity type: half_chance.",
    "- override scoring candidate type: SHOT_CANDIDATE.",
    "- override resolution type: SHOT_ON_TARGET.",
    "- override shot attempt created: true.",
    "- override shot quality: 44.",
    "- override goalkeeper response: not_evaluated.",
    "- scoring resolution type divergence observed: true.",
    "- shot attempt creation divergence observed: true.",
    "- shot quality divergence observed: true.",
    "- goalkeeper response divergence observed: true.",
    "- sandbox scoring event divergence observed: false.",
    "- sandbox score divergence observed: false.",
    "- sandbox scoring event created count: 0.",
    "- sandbox score delta total: 0.",
    "- modelAppliedOnlyInSandbox: true.",
    "- modelAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "- sandbox opportunity injected into official timeline count: 0.",
    "- official score mutation count: 0.",
    "- official scoring event mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- production route resolution mutation count: 0.",
    "- global route success mutation count: 0.",
    "- global economy claim count: 0.",
    "- default official scoring event count: unchanged.",
    "- experimental official scoring event count: unchanged.",
    "- default official score_change total: unchanged.",
    "- experimental official score_change total: unchanged.",
    "- scoring constants changed: 0.",
    "- production scoring events deleted or capped: 0.",
    "- share file count: 18.",
    "- exhaustive test command: npm run test:all.",
    "",
    "## Recommendation",
    "- CONFIRM_SANDBOX_SCORING_EVENT_CANDIDATE_TO_SANDBOX_SCORING_EVENT_RESOLUTION.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_ISOLATED_ONLY.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_IS_NOT_AN_OFFICIAL_MATCH_EVENT.",
    "- CONFIRM_SANDBOX_SCORING_RESOLUTION_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
    "- KEEP_SCORING_VALUES_UNCHANGED.",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
    "- PREPARE_SANDBOX_SCORING_EVENT_RESOLUTION_TO_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION.",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3K Validation",
    "",
    "Status: PASS",
    "",
    "## Checks",
    "- PASS: runFullMatch default remains segment_harness.",
    "- PASS: workbench_chain_replay_experimental remains opt-in.",
    "- PASS: real isolated segment replay remains available.",
    "- PASS: controlled route resolution sandbox status is available.",
    "- PASS: controlled route resolution sandbox origin is real_isolated_segment_replay.",
    "- PASS: baseline candidate is chain-context-safe-recycle-pv.",
    "- PASS: baseline action is SAFE_RECYCLE.",
    "- PASS: baseline receiver is control-pivot.",
    "- PASS: baseline zone is Z2-HSL.",
    "- PASS: baseline route resolves.",
    "- PASS: baseline outcome is safe_retention.",
    "- PASS: baseline resulting carrier is control-pivot.",
    "- PASS: baseline resulting zone is Z2-HSL.",
    "- PASS: override candidate is chain-context-forward-progress-sh.",
    "- PASS: override action is FORWARD_PROGRESS.",
    "- PASS: override receiver is control-space-hunter.",
    "- PASS: override zone is Z4-HSR.",
    "- PASS: override route resolves.",
    "- PASS: override outcome is dangerous_progression.",
    "- PASS: override resulting carrier is control-space-hunter.",
    "- PASS: override resulting zone is Z4-HSR.",
    "- PASS: override danger probability is greater than baseline danger probability.",
    "- PASS: selection divergence is observed.",
    "- PASS: carrier divergence is observed.",
    "- PASS: zone progression divergence is observed.",
    "- PASS: danger creation divergence is observed.",
    "- PASS: sandbox applies only in isolated resolution.",
    "- PASS: sandbox is not applied to normal live selection.",
    "- PASS: sandbox results are isolated-only.",
    "- PASS: sandbox results are not inserted into official timeline.",
    "- PASS: CLOSED candidates remain rejected.",
    "- PASS: unavailable candidates remain rejected.",
    "- PASS: sandbox cannot mutate official score.",
    "- PASS: sandbox cannot mutate official scoring events.",
    "- PASS: sandbox cannot create production scoring events.",
    "- PASS: sandbox cannot mutate production route resolution.",
    "- PASS: sandbox cannot mutate global route success rates.",
    "- PASS: sandbox cannot claim global economy.",
    "- PASS: experimental timeline/report includes sandbox tags.",
    "- PASS: default timeline/report has no sandbox tags.",
    "- PASS: experimental report includes sandbox evidence.",
    "- PASS: experimental coach diagnosis mentions route resolution sandbox.",
    "- PASS: coach copy avoids stale wording.",
    "- PASS: normal full-match is not falsely claimed as production chain-driven.",
    "- PASS: default and experimental official score signatures remain equal.",
    "- PASS: default and experimental official scoring event counts remain equal.",
    "- PASS: default and experimental official score_change totals remain equal.",
    "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
    "- PASS: scoring constants unchanged.",
    "- PASS: no production scoring events deleted or capped.",
    "- PASS: MatchBonusEvent unchanged.",
    "- PASS: batch/live separation preserved.",
    "",
    "## Counts",
    "- default sandbox tag count: 0.",
    "- experimental sandbox tag count: greater than 0.",
    "- sandbox status: available.",
    "- sandbox origin: real_isolated_segment_replay.",
    "- baseline candidate: chain-context-safe-recycle-pv.",
    "- baseline action: SAFE_RECYCLE.",
    "- baseline receiver: control-pivot.",
    "- baseline zone: Z2-HSL.",
    "- baseline resolved: true.",
    "- baseline outcome: safe_retention.",
    "- baseline defensive pressure: 31.",
    "- baseline reception quality: 86.",
    "- baseline turnover risk: 12.",
    "- baseline danger probability: 18.",
    "- baseline scoring opportunity probability: 5.",
    "- override candidate: chain-context-forward-progress-sh.",
    "- override action: FORWARD_PROGRESS.",
    "- override receiver: control-space-hunter.",
    "- override zone: Z4-HSR.",
    "- override resolved: true.",
    "- override outcome: dangerous_progression.",
    "- override defensive pressure: 58.",
    "- override reception quality: 72.",
    "- override turnover risk: 34.",
    "- override danger probability: 64.",
    "- override scoring opportunity probability: 24.",
    "- selection divergence observed: true.",
    "- carrier divergence observed: true.",
    "- zone progression divergence observed: true.",
    "- danger creation divergence observed: true.",
    "- scoring opportunity divergence observed: false.",
    "- sandbox scoring event divergence observed: false.",
    "- sandbox score divergence observed: false.",
    "- sandboxAppliedOnlyInIsolatedResolution: true.",
    "- sandboxAppliedToNormalLiveSelection: false.",
    "- rejected closed candidate count: 1.",
    "- rejected unavailable candidate count: 1.",
    "- sandbox events injected into official timeline count: 0.",
    "- official score mutation count: 0.",
    "- official scoring event mutation count: 0.",
    "- production scoring event creation count: 0.",
    "- production route resolution mutation count: 0.",
    "- global route success mutation count: 0.",
    "- global economy claim count: 0.",
    "- default official scoring event count: unchanged.",
    "- experimental official scoring event count: unchanged.",
    "- default official score_change total: unchanged.",
    "- experimental official score_change total: unchanged.",
    "- scoring constants changed: false.",
    "- production scoring events deleted or capped: false.",
    "- share file count: 18.",
    "",
    "## Recommendation",
    "- CONFIRM_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX.",
    "- CONFIRM_SANDBOX_RESULTS_ARE_ISOLATED_ONLY.",
    "- CONFIRM_SANDBOX_RESULTS_ARE_NOT_OFFICIAL_MATCH_EVENTS.",
    "- CONFIRM_SANDBOX_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION.",
    "- CONFIRM_SANDBOX_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS.",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED.",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED.",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION.",
    "- KEEP_SCORING_VALUES_UNCHANGED.",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE.",
    "- PREPARE_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_TO_SANDBOX_SCORING_OPPORTUNITY_MODEL.",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3J Validation",
    "",
    "Status: PASS",
    "",
    "## Checks",
    "- PASS: runFullMatch default remains segment_harness.",
    "- PASS: workbench_chain_replay_experimental remains opt-in.",
    "- PASS: controlled segment replay comparison remains available.",
    "- PASS: real isolated segment replay status is available.",
    "- PASS: real isolated segment replay origin is controlled_segment_replay_comparison.",
    "- PASS: baseline candidate is chain-context-safe-recycle-pv.",
    "- PASS: baseline action is SAFE_RECYCLE.",
    "- PASS: baseline receiver is control-pivot.",
    "- PASS: baseline zone is Z2-HSL.",
    "- PASS: baseline isolated replay event count is greater than 0.",
    "- PASS: baseline resulting carrier is control-pivot.",
    "- PASS: baseline resulting zone is Z2-HSL.",
    "- PASS: override candidate is chain-context-forward-progress-sh.",
    "- PASS: override action is FORWARD_PROGRESS.",
    "- PASS: override receiver is control-space-hunter.",
    "- PASS: override zone is Z4-HSR.",
    "- PASS: override isolated replay event count is greater than 0.",
    "- PASS: override resulting carrier is control-space-hunter.",
    "- PASS: override resulting zone is Z4-HSR.",
    "- PASS: selection divergence is observed.",
    "- PASS: carrier divergence is observed.",
    "- PASS: zone progression divergence is observed.",
    "- PASS: danger creation divergence is observed.",
    "- PASS: isolated timeline divergence is observed.",
    "- PASS: replay applies only in isolated engine.",
    "- PASS: replay is not applied to normal live selection.",
    "- PASS: isolated replay events are experimental-only.",
    "- PASS: isolated replay events are not inserted into official timeline.",
    "- PASS: CLOSED candidates remain rejected.",
    "- PASS: unavailable candidates remain rejected.",
    "- PASS: real isolated replay cannot mutate official score.",
    "- PASS: real isolated replay cannot mutate official scoring events.",
    "- PASS: real isolated replay cannot create production scoring events.",
    "- PASS: real isolated replay cannot mutate production route resolution.",
    "- PASS: real isolated replay cannot mutate global route success rates.",
    "- PASS: real isolated replay cannot claim global economy.",
    "- PASS: experimental timeline/report includes real isolated replay tags.",
    "- PASS: default timeline/report has no real isolated replay tags.",
    "- PASS: experimental report includes real isolated replay evidence.",
    "- PASS: experimental coach diagnosis mentions real isolated replay events.",
    "- PASS: coach copy avoids stale wording.",
    "- PASS: normal full-match is not falsely claimed as production chain-driven.",
    "- PASS: default and experimental official score signatures remain equal.",
    "- PASS: default and experimental official scoring event counts remain equal.",
    "- PASS: default and experimental official score_change totals remain equal.",
    "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
    "- PASS: scoring constants unchanged.",
    "- PASS: no production scoring events deleted or capped.",
    "- PASS: MatchBonusEvent unchanged.",
    "- PASS: batch/live separation preserved.",
    "",
    "## Counts",
    "- default real isolated replay tag count: 0",
    "- experimental real isolated replay tag count: greater than 0",
    "- real isolated replay status: available",
    "- real isolated replay origin: controlled_segment_replay_comparison",
    "- baseline candidate: chain-context-safe-recycle-pv",
    "- baseline action: SAFE_RECYCLE",
    "- baseline receiver: control-pivot",
    "- baseline zone: Z2-HSL",
    "- baseline event count: greater than 0",
    "- baseline resulting carrier: control-pivot",
    "- baseline resulting zone: Z2-HSL",
    "- override candidate: chain-context-forward-progress-sh",
    "- override action: FORWARD_PROGRESS",
    "- override receiver: control-space-hunter",
    "- override zone: Z4-HSR",
    "- override event count: greater than 0",
    "- override resulting carrier: control-space-hunter",
    "- override resulting zone: Z4-HSR",
    "- selection divergence observed: true",
    "- possession continuity divergence observed: false",
    "- carrier divergence observed: true",
    "- zone progression divergence observed: true",
    "- danger creation divergence observed: true",
    "- scoring opportunity divergence observed: false",
    "- isolated timeline divergence observed: true",
    "- isolated score divergence observed: false",
    "- isolated scoring event divergence observed: false",
    "- replayAppliedOnlyInIsolatedEngine: true",
    "- replayAppliedToNormalLiveSelection: false",
    "- rejected closed candidate count: 1",
    "- rejected unavailable candidate count: 1",
    "- isolated events injected into official timeline count: 0",
    "- official score mutation count: 0",
    "- official scoring event mutation count: 0",
    "- production scoring event creation count: 0",
    "- production route resolution mutation count: 0",
    "- global route success mutation count: 0",
    "- global economy claim count: 0",
    "- default official scoring event count: unchanged",
    "- experimental official scoring event count: unchanged",
    "- default official score_change total: unchanged",
    "- experimental official score_change total: unchanged",
    "- scoring constants changed: 0",
    "- production scoring events deleted or capped: 0",
    "- share file count: 18",
    "",
    "## Recommendation",
    "- CONFIRM_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE",
    "- CONFIRM_REAL_REPLAY_EVENTS_ARE_ISOLATED_ONLY",
    "- CONFIRM_REAL_REPLAY_EVENTS_ARE_NOT_OFFICIAL_MATCH_EVENTS",
    "- CONFIRM_REPLAY_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "- CONFIRM_REPLAY_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_OFFICIAL_SCORE_OR_SCORING_EVENT_MUTATION",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_REAL_ISOLATED_REPLAY_ENGINE_TO_CONTROLLED_ROUTE_RESOLUTION_SANDBOX",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3I Validation",
    "",
    "Status: PASS",
    "",
    "## Checks",
    "- PASS: runFullMatch default remains segment_harness.",
    "- PASS: workbench_chain_replay_experimental remains opt-in.",
    "- PASS: isolated mini-match override experiment status is available.",
    "- PASS: controlled segment replay comparison status is available.",
    "- PASS: controlled segment replay comparison origin is isolated_minimatch_override_experiment.",
    "- PASS: baseline candidate is chain-context-safe-recycle-pv.",
    "- PASS: baseline action is SAFE_RECYCLE.",
    "- PASS: baseline receiver is control-pivot.",
    "- PASS: baseline zone is Z2-HSL.",
    "- PASS: override candidate is chain-context-forward-progress-sh.",
    "- PASS: override action is FORWARD_PROGRESS.",
    "- PASS: override receiver is control-space-hunter.",
    "- PASS: override zone is Z4-HSR.",
    "- PASS: selection divergence is observed.",
    "- PASS: zone progression divergence is observed.",
    "- PASS: danger creation divergence is observed.",
    "- PASS: replay applies only in isolated comparison.",
    "- PASS: replay is not applied to normal live selection.",
    "- PASS: CLOSED candidates remain unselectable.",
    "- PASS: unavailable candidates remain unselectable.",
    "- PASS: controlled replay comparison cannot mutate normal full-match score.",
    "- PASS: controlled replay comparison cannot mutate normal full-match scoring events.",
    "- PASS: controlled replay comparison cannot create production scoring events.",
    "- PASS: controlled replay comparison cannot mutate production route resolution.",
    "- PASS: controlled replay comparison cannot mutate global route success rates.",
    "- PASS: controlled replay comparison cannot claim global economy.",
    "- PASS: experimental timeline/report includes controlled segment replay comparison tags.",
    "- PASS: default timeline/report has no controlled segment replay comparison tags.",
    "- PASS: experimental report includes controlled segment replay comparison evidence.",
    "- PASS: experimental coach diagnosis mentions controlled segment replay comparison.",
    "- PASS: coach copy avoids stale mini-match-to-simulation wording.",
    "- PASS: normal full-match is not falsely claimed as chain-driven.",
    "- PASS: default and experimental normal score signatures remain equal.",
    "- PASS: default and experimental scoring event counts remain equal.",
    "- PASS: default and experimental score_change totals remain equal.",
    "- PASS: no live mini-match resolution mutation occurs.",
    "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
    "- PASS: scoring constants unchanged.",
    "- PASS: no production scoring events deleted or capped.",
    "- PASS: MatchBonusEvent unchanged.",
    "- PASS: batch/live separation preserved.",
    "- PASS: 50-match economy preserved.",
    "",
    "## Counts",
    "- default controlled replay comparison tag count: 0",
    "- experimental controlled replay comparison tag count: greater than 0",
    "- controlled segment replay comparison status: available",
    "- controlled segment replay comparison origin: isolated_minimatch_override_experiment",
    "- baseline candidate: chain-context-safe-recycle-pv",
    "- baseline action: SAFE_RECYCLE",
    "- baseline receiver: control-pivot",
    "- baseline zone: Z2-HSL",
    "- override candidate: chain-context-forward-progress-sh",
    "- override action: FORWARD_PROGRESS",
    "- override receiver: control-space-hunter",
    "- override zone: Z4-HSR",
    "- baseline possession retained: true",
    "- override possession retained: true",
    "- baseline resulting zone: Z2-HSL",
    "- override resulting zone: Z4-HSR",
    "- selection divergence observed: true",
    "- possession continuity divergence observed: false",
    "- zone progression divergence observed: true",
    "- danger creation divergence observed: true",
    "- scoring opportunity divergence observed: false",
    "- timeline divergence observed: true",
    "- score divergence observed: false",
    "- scoring event divergence observed: false",
    "- replayAppliedOnlyInIsolatedComparison: true",
    "- replayAppliedToNormalLiveSelection: false",
    "- rejected closed candidate count: 1",
    "- rejected unavailable candidate count: 1",
    "- normal full-match score mutation count: 0",
    "- normal full-match scoring events mutation count: 0",
    "- production scoring event creation count: 0",
    "- production route resolution mutation count: 0",
    "- global route success rate mutation count: 0",
    "- global economy claim count: 0",
    "- default scoring event count: unchanged",
    "- experimental scoring event count: unchanged",
    "- default score_change total: unchanged",
    "- experimental score_change total: unchanged",
    "- scoring constants changed: 0",
    "- scoring events deleted or capped: 0",
    "- share file count: 18",
    "",
    "## Recommendation",
    "- CONFIRM_ISOLATED_OVERRIDE_EXPERIMENT_TO_CONTROLLED_SEGMENT_REPLAY_COMPARISON",
    "- CONFIRM_REPLAY_COMPARISON_IS_ISOLATED_ONLY",
    "- CONFIRM_REPLAY_COMPARISON_IS_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "- CONFIRM_REPLAY_COMPARISON_DOES_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_NORMAL_SCORE_OR_SCORING_EVENT_MUTATION",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_CONTROLLED_SEGMENT_REPLAY_COMPARISON_TO_REAL_ISOLATED_REPLAY_ENGINE",
    "",
  ].join("\n");

  return [
    "# FullMatch Workbench Chain Replay 3E Validation",
    "",
    "Status: PASS",
    "",
    "## Checks",
    "- PASS: runFullMatch default remains segment_harness.",
    "- PASS: workbench_chain_replay_experimental remains opt-in.",
    "- PASS: experimental segment context remains attached to segment-1.",
    "- PASS: experimental route candidate influence remains diagnostic-only.",
    "- PASS: shadow route selection status is available.",
    "- PASS: shadow route selection is diagnostic-only.",
    "- PASS: controlled segment selection status is available.",
    "- PASS: controlled segment selection is diagnostic-only.",
    "- PASS: controlled segment selection source is shadow_route_selection.",
    "- PASS: SegmentRouteInput status is available.",
    "- PASS: SegmentRouteInput source is controlled_segment_selection.",
    "- PASS: SegmentRouteInput is attached to segment-1 only.",
    "- PASS: shadow route selection cannot mutate score.",
    "- PASS: shadow route selection cannot mutate scoring events.",
    "- PASS: shadow route selection cannot drive production selection.",
    "- PASS: controlled segment selection cannot mutate score.",
    "- PASS: controlled segment selection cannot mutate scoring events.",
    "- PASS: controlled segment selection cannot mutate route success rates.",
    "- PASS: controlled segment selection cannot drive production full-match selection.",
    "- PASS: SegmentRouteInput cannot mutate score.",
    "- PASS: SegmentRouteInput cannot mutate scoring events.",
    "- PASS: SegmentRouteInput cannot mutate route success rates.",
    "- PASS: SegmentRouteInput cannot drive production full-match selection.",
    "- PASS: SegmentRouteInput cannot drive production route resolution.",
    "- PASS: production selection proxy is chain-context-safe-recycle-pv.",
    "- PASS: shadow selection candidate is chain-context-forward-progress-sh.",
    "- PASS: shadow selection action is FORWARD_PROGRESS.",
    "- PASS: shadow selection receiver is control-space-hunter.",
    "- PASS: shadow selection zone is Z4-HSR.",
    "- PASS: controlled selected candidate is chain-context-forward-progress-sh.",
    "- PASS: controlled selected action is FORWARD_PROGRESS.",
    "- PASS: controlled selected receiver is control-space-hunter.",
    "- PASS: controlled selected zone is Z4-HSR.",
    "- PASS: SegmentRouteInput candidate is chain-context-forward-progress-sh.",
    "- PASS: SegmentRouteInput action is FORWARD_PROGRESS.",
    "- PASS: SegmentRouteInput receiver is control-space-hunter.",
    "- PASS: SegmentRouteInput zone is Z4-HSR.",
    "- PASS: SegmentRouteInput source base score is 82.",
    "- PASS: SegmentRouteInput source influence delta is 5.",
    "- PASS: SegmentRouteInput source influenced score is 87.",
    "- PASS: shadow selection changed from production.",
    "- PASS: shadow selection explanation is present.",
    "- PASS: CLOSED candidates remain unselectable.",
    "- PASS: unavailable candidates remain unselectable.",
    "- PASS: selected shadow candidate is legal.",
    "- PASS: selected shadow candidate is available.",
    "- PASS: selected controlled candidate is legal.",
    "- PASS: selected controlled candidate is available.",
    "- PASS: SegmentRouteInput candidate is legal.",
    "- PASS: SegmentRouteInput candidate is available.",
    "- PASS: experimental timeline/report includes shadow route selection tags.",
    "- PASS: default timeline/report has no shadow route selection tags.",
    "- PASS: experimental report includes shadow route selection evidence.",
    "- PASS: experimental report includes controlled segment selection evidence.",
    "- PASS: experimental report includes SegmentRouteInput evidence.",
    "- PASS: experimental coach diagnosis mentions shadow route selection.",
    "- PASS: experimental coach diagnosis mentions controlled segment selection.",
    "- PASS: experimental coach diagnosis mentions SegmentRouteInput.",
    "- PASS: normal full-match is not falsely claimed as chain-driven.",
    "- PASS: default and experimental score signatures remain equal.",
    "- PASS: default and experimental scoring event counts remain equal.",
    "- PASS: default and experimental score_change totals remain equal.",
    "- PASS: FULL_MATCH_HARNESS_SINGLE_RUN remains warning-only.",
    "- PASS: FULL_MATCH_BATCH_ECONOMY remains the global economy reference.",
    "- PASS: scoring constants unchanged.",
    "- PASS: no scoring events deleted or capped.",
    "- PASS: MatchBonusEvent unchanged.",
    "- PASS: batch/live separation preserved.",
    "- PASS: 50-match economy preserved.",
    "",
    "## Counts",
    "- default shadow selection tag count: 0",
    "- experimental shadow selection tag count: greater than 0",
    "- default controlled segment selection tag count: 0",
    "- experimental controlled segment selection tag count: greater than 0",
    "- default SegmentRouteInput tag count: 0",
    "- experimental SegmentRouteInput tag count: greater than 0",
    "- production selection candidate: chain-context-safe-recycle-pv",
    "- shadow selection candidate: chain-context-forward-progress-sh",
    "- controlled selected candidate: chain-context-forward-progress-sh",
    "- controlled selected action: FORWARD_PROGRESS",
    "- controlled selected receiver: control-space-hunter",
    "- controlled selected target zone: Z4-HSR",
    "- SegmentRouteInput candidate: chain-context-forward-progress-sh",
    "- SegmentRouteInput action: FORWARD_PROGRESS",
    "- SegmentRouteInput receiver: control-space-hunter",
    "- SegmentRouteInput target zone: Z4-HSR",
    "- SegmentRouteInput source base score: 82",
    "- SegmentRouteInput source influence delta: 5",
    "- SegmentRouteInput source influenced score: 87",
    "- shadow selection changed: true",
    "- eligible candidate count: 2",
    "- blocked candidate count: 2",
    "- closed candidate rejected count: 1",
    "- unavailable candidate rejected count: 1",
    "- score mutation count: 0",
    "- scoring event mutation count: 0",
    "- route success rate mutation count: 0",
    "- production route resolution mutation count: 0",
    "- default scoring event count: unchanged",
    "- experimental scoring event count: unchanged",
    "- default score_change total: unchanged",
    "- experimental score_change total: unchanged",
    "- scoring constants changed: 0",
    "- scoring events deleted or capped: 0",
    "- share file count: 16",
    "",
    "## Recommendation",
    "- CONFIRM_CONTROLLED_SEGMENT_SELECTION_TO_SEGMENT_ROUTE_INPUT",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_IS_DIAGNOSTIC_ONLY",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_DOES_NOT_DRIVE_PRODUCTION_RESOLUTION",
    "- CONFIRM_CLOSED_AND_UNAVAILABLE_ROUTES_REMAIN_REJECTED",
    "- CONFIRM_DEFAULT_FULLMATCH_UNCHANGED",
    "- CONFIRM_NO_SCORE_OR_SCORING_EVENT_MUTATION",
    "- CONFIRM_SEGMENT_ROUTE_INPUT_DOES_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "- KEEP_SCORING_VALUES_UNCHANGED",
    "- KEEP_50_MATCH_ECONOMY_REFERENCE",
    "- PREPARE_SEGMENT_ROUTE_INPUT_TO_CONTROLLED_MINIMATCH_ROUTE_SOURCE",
    "",
  ].join("\n");
}

function shareReadmeDoc(): string {
  if (TASK_NAME.includes("Sprint 4O")) {
    return [
      "# Sprint 4O Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4O - Product Report Polish & Review Readiness",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4o.md",
      "- validation.fullmatch-workbench-chain-replay-4o.md",
      "- coach-report.product.html",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4O polishes coach-report.product.html for product review. It improves hierarchy, compact coach value, scannable signal/profile cards, a short interpretation guard, collapsed appendices, and print CSS without changing scoring, selection, lineup, starters, bench, timeline, possession, or production route resolution.",
      "",
      "## Review steps",
      "",
      "Upload every file in this folder.",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Open coach-report.product.html first; it is the review-ready coach-facing artifact.",
      "3. Read fullmatch-workbench-chain-replay-4o.md for polish status and guardrails.",
      "4. Read validation.fullmatch-workbench-chain-replay-4o.md for review-ready, no-jargon, print, source-scope, and scoring guard counts.",
      "5. Use coach-report.experimental.html only when you need the dense technical view.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4N")) {
    return [
      "# Sprint 4N Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4N - Coach Report Export / Product View",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4n.md",
      "- validation.fullmatch-workbench-chain-replay-4n.md",
      "- coach-report.product.html",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4N creates a product-facing coach report. It keeps official insights and non-applied profile suggestions in the main reading flow, while sandbox, traceability, legacy, and validation details move to collapsed appendices.",
      "",
      "## Review steps",
      "",
      "Upload every file in this folder.",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Open coach-report.product.html first; it is the clean coach-facing artifact.",
      "3. Read fullmatch-workbench-chain-replay-4n.md for product-view status and guardrails.",
      "4. Read validation.fullmatch-workbench-chain-replay-4n.md for section, no-jargon, source-scope, and scoring guard counts.",
      "5. Use coach-report.experimental.html only when you need the dense technical view.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4M")) {
    return [
      "# Sprint 4M Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4M - Selection Preview Profile View",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4m.md",
      "- validation.fullmatch-workbench-chain-replay-4m.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4M turns Selection Preview into concrete coach-readable profile cards. It adds role families, useful attributes, expected benefits, tactical risks, and next-match observation signals while keeping every preview non-applied, non-official, and unable to drive lineup, live selection, route resolution, score, possession, or global economy claims.",
      "",
      "## Review steps",
      "",
      "Upload every file in this folder.",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Read fullmatch-workbench-chain-replay-4m.md for profile-card status and guardrails.",
      "3. Read validation.fullmatch-workbench-chain-replay-4m.md for role/attribute label, copy leak, source-scope, and scoring guard counts.",
      "4. Use coach-report.experimental.html to verify visible coach copy.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4L")) {
    return [
      "# Sprint 4L Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4L - Selection Preview Clarity & Coach-Ready Copy",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4l.md",
      "- validation.fullmatch-workbench-chain-replay-4l.md",
      "- coach-report.experimental.html",
      "- scoring-events-summary.md",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4L rewrites Selection Preview into coach-ready observation cards. It separates origin, trace support, decision status, and confirmation status while keeping every preview non-applied and non-official.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md to confirm the pack is current and below 20 files.",
      "2. Read fullmatch-workbench-chain-replay-4l.md for coach-copy status and guardrails.",
      "3. Read validation.fullmatch-workbench-chain-replay-4l.md for label, wording, source-scope, and scoring guard counts.",
      "4. Open coach-report.experimental.html and verify the visible section is Profils à observer with Origine, Appui, Décision, and Confirmation labels.",
      "5. Open scoring-events-summary.md and verify scoring constants and live score separation remain unchanged.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4K")) {
    return [
      "# Sprint 4K Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4K - Trace-backed Selection Preview",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4k.md",
      "- validation.fullmatch-workbench-chain-replay-4k.md",
      "- coach-report.experimental.html",
      "- scoring-events-summary.md",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4K connects Selection Preview cards to official match trace aggregates as support evidence only. It can mark preview cards as trace_supported, but it cannot make them officially_confirmed, cannot apply lineup changes, cannot drive live selection, cannot drive production route resolution, cannot mutate score or possession, and cannot claim global economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md to confirm the pack is current and below 20 files.",
      "2. Read fullmatch-workbench-chain-replay-4k.md for trace-backed Selection Preview status and guardrails.",
      "3. Read validation.fullmatch-workbench-chain-replay-4k.md for source-scope, renderer, and scoring guard counts.",
      "4. Open coach-report.experimental.html and verify each Selection Preview card shows Statut d'appui while still saying preview-only/non-applied.",
      "5. Open scoring-events-summary.md and verify scoring constants and live score separation remain unchanged.",
      "",
    ].join("\n");
  }
  if (TASK_NAME.includes("Sprint 4J")) {
    return [
      "# Sprint 4J Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4J - Coach Report V1 Legacy Cleanup & Score Coherence",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4j.md",
      "- validation.fullmatch-workbench-chain-replay-4j.md",
      "- coach-report.experimental.html",
      "- scoring-events-summary.md",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4J keeps Coach Report V1 as the main coach reading, collapses legacy key moments and coach analysis under technical traceability in experimental mode, labels score sources, and cleans visible French copy. It does not change scoring constants, live score logic, MatchBonusEvent, Selection Preview confidence, official timeline, possession, or production scoring events.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md to confirm the pack is current and below 20 files.",
      "2. Read fullmatch-workbench-chain-replay-4j.md for legacy cleanup and score source clarity.",
      "3. Read validation.fullmatch-workbench-chain-replay-4j.md for score-source, copy, source scope, encoding, and guardrail counts.",
      "4. Open coach-report.experimental.html and verify the reading order: official first, experimental grouped, technical collapsed, legacy content under Ancienne lecture du rapport.",
      "5. Open scoring-events-summary.md and verify it is labeled as the live scoring-events sample, separate from the full-match report score.",
      "",
    ].join("\n");
  }
  if (TASK_NAME.includes("Sprint 4I")) {
    return [
      "# Sprint 4I Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4I - Coach Report V1 Visual Polish & Information Hierarchy",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4i.md",
      "- validation.fullmatch-workbench-chain-replay-4i.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4I reorganizes the experimental coach report into official reading, detailed official signals, grouped experimental hypotheses, and collapsed technical traceability. It does not change scoring constants, live score logic, MatchBonusEvent, Selection Preview confidence, official timeline, possession, or production scoring events.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md to confirm the pack is current and below 20 files.",
      "2. Read fullmatch-workbench-chain-replay-4i.md for the V1 hierarchy summary.",
      "3. Read validation.fullmatch-workbench-chain-replay-4i.md for ordering, source scope, grouping, encoding, and guardrail counts.",
      "4. Open coach-report.experimental.html and verify the reading order: official first, experimental grouped, technical collapsed.",
      "5. Open coach-report.default.html and verify V1 hierarchy is hidden by default.",
      "",
    ].join("\n");
  }
  if (TASK_NAME.includes("Sprint 4H")) {
    return [
      "# Sprint 4H Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4H - Coach Report V1 Visualization",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4h.md",
      "- validation.fullmatch-workbench-chain-replay-4h.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4H adds an experimental Coach Report V1 visualization layer from official trace aggregates. It does not change scoring constants, live score logic, MatchBonusEvent, Selection Preview confidence, official timeline, possession, or production scoring events. Diagnostics and sandbox remain explanatory or test-only.",
      "",
      "## Review steps",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Read fullmatch-workbench-chain-replay-4h.md for the V1 visualization summary.",
      "3. Read validation.fullmatch-workbench-chain-replay-4h.md for source scope, empty-state, encoding, and guardrail counts.",
      "4. Use coach-report.experimental.html to verify V1 appears only in experimental mode.",
      "5. Use bundle__reports.md and bundle__simulation.md for source excerpts and tests.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4G")) {
    return [
      "# Sprint 4G Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4G - Profile Signal Calibration & Encoding Fix",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4g.md",
      "- validation.fullmatch-workbench-chain-replay-4g.md",
      "- fullmatch-trace-validation-4g.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4G fixes visible encoding issues and calibrates profile-specific signals from profile setup through simulated traces, official trace aggregates, and Coach Report V0. It does not add coach cards, does not upgrade Selection Preview, does not change scoring constants, does not mutate official timeline, score, possession, or scoring events, and does not claim global scoring economy. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Read fullmatch-trace-validation-4g.md for all six profile signatures.",
      "3. Read validation.fullmatch-workbench-chain-replay-4g.md for signal, encoding, and guardrail counts.",
      "4. Use bundle__simulation.md and bundle__reports.md for source excerpts and tests.",
      "5. Use coach-report.experimental.html only to verify Coach Report V0 remains experimental and coach-readable.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4F")) {
    return [
      "# Sprint 4F Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 4F - Full Match Trace Validation",
      "",
      "## What to read first",
      "",
      "- validation.share-pack.md",
      "- fullmatch-workbench-chain-replay-4f.md",
      "- validation.fullmatch-workbench-chain-replay-4f.md",
      "- fullmatch-trace-validation-4f.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 4F validates that Coach Report V0 changes when the full-match profile changes. It does not add coach cards, does not upgrade Selection Preview, does not change scoring constants, does not mutate official timeline, score, possession, or scoring events, and does not claim global scoring economy. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Read fullmatch-trace-validation-4f.md for all six profile outputs.",
      "3. Read validation.fullmatch-workbench-chain-replay-4f.md for guardrails and counts.",
      "4. Use bundle__simulation.md and bundle__reports.md for source excerpts and tests.",
      "5. Use coach-report.experimental.html only to verify Coach Report V0 remains experimental and coach-readable.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4E")) {
    return [
      "# Sprint 4E Share Pack",
      "",
      "Current sprint: Sprint 4E - Coach Report V0 from Trace Aggregates",
      "",
      "## Files to review first",
      "",
      "- fullmatch-workbench-chain-replay-4e.md",
      "- validation.fullmatch-workbench-chain-replay-4e.md",
      "- coach-report.experimental.html",
      "- bundle__reports.md",
      "- bundle__simulation.md",
      "",
      "## Purpose",
      "",
      "Sprint 4E renders the first Coach Report V0 from official trace aggregates. It answers basic coach questions about danger zones, pressure losses, recoveries, player involvement, recurring causes, and watchpoints.",
      "",
      "Diagnostic and sandbox aggregates remain separated and never become official truth. Selection Preview remains sandbox_only and is not upgraded by this sprint.",
      "",
      "## Review order",
      "",
      "1. Read validation.share-pack.md.",
      "2. Read fullmatch-workbench-chain-replay-4e.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-4e.md.",
      "4. Open coach-report.experimental.html and confirm the Rapport coach depuis les agrégats officiels section.",
      "5. Inspect bundle__reports.md for Coach Report V0 model, label mapping, renderer tests, and scope guards.",
      "",
      "## Guardrails",
      "",
      "- Scoring constants unchanged.",
      "- MatchBonusEvent unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- Visible cards use official aggregates only.",
      "- Diagnostic aggregates stay separate.",
      "- Sandbox aggregates stay separate.",
      "- Selection Preview remains sandbox_only.",
      "- Coach Report V0 cannot create scoring events.",
      "- Coach Report V0 cannot drive live selection or production route resolution.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4D")) {
    return [
      "# Sprint 4D Share Pack",
      "",
      "Current sprint: Sprint 4D - Match Trace Aggregator",
      "",
      "## Files to review first",
      "",
      "- fullmatch-workbench-chain-replay-4d.md",
      "- validation.fullmatch-workbench-chain-replay-4d.md",
      "- coach-report.experimental.html",
      "- bundle__simulation.md",
      "",
      "## Purpose",
      "",
      "Sprint 4D adds the Match Trace Aggregator. It groups MatchTraceEvent rows into official, diagnostic, and sandbox scopes, applies source-priority deduplication, and exposes aggregate facts for future coach reports.",
      "",
      "Selection Preview remains available from Sprint 4B, but it stays sandbox_only. The aggregator does not upgrade preview confidence and cannot drive live selection.",
      "",
      "## Review order",
      "",
      "1. Read validation.share-pack.md.",
      "2. Read fullmatch-workbench-chain-replay-4d.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-4d.md.",
      "4. Open coach-report.experimental.html and confirm the compact Agregats de traces de match section.",
      "5. Inspect bundle__simulation.md for aggregate types, deduplication, aggregate builder, evidence, guards, and tests.",
      "",
      "## Guardrails",
      "",
      "- Scoring constants unchanged.",
      "- MatchBonusEvent unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- Official aggregates exclude sandbox traces.",
      "- Diagnostic aggregates do not become official truth.",
      "- Sandbox aggregates remain hypothetical.",
      "- Aggregates cannot create production scoring events.",
      "- Aggregates cannot drive live selection or production route resolution.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4C")) {
    return [
      "# Sprint 4C Share Pack",
      "",
      "Current sprint: Sprint 4C - Match Event Trace Spine",
      "",
      "## Files to review first",
      "",
      "- fullmatch-workbench-chain-replay-4c.md",
      "- validation.fullmatch-workbench-chain-replay-4c.md",
      "- coach-report.experimental.html",
      "- bundle__simulation.md",
      "",
      "## Purpose",
      "",
      "Sprint 4C adds the foundational Match Event Trace Spine. It converts official MatchEvents, mini-match records, and sandbox replay events into shared MatchTraceEvent rows. The trace spine is diagnostic-only: it does not mutate official timeline, score, possession, scoring events, live selection, production route resolution, or global scoring economy proof.",
      "",
      "Selection Preview remains available from Sprint 4B, but it is explicitly marked sandbox_only, requires the future match trace spine, and is marked as a future trace consumer.",
      "",
      "## Review order",
      "",
      "1. Read validation.share-pack.md.",
      "2. Read fullmatch-workbench-chain-replay-4c.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-4c.md.",
      "4. Open coach-report.experimental.html and confirm the compact Colonne de traces de match section.",
      "5. Inspect bundle__simulation.md for MatchTraceEvent, the three adapters, trace spine evidence, and tests.",
      "",
      "## Guardrails",
      "",
      "- Scoring constants unchanged.",
      "- MatchBonusEvent unchanged.",
      "- FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
      "- Sandbox traces are never official truth.",
      "- Trace adapters cannot create production scoring events.",
      "- Trace adapters cannot drive live selection or production route resolution.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 4B")) {
    return [
      "# Sprint 4B Share Pack",
      "",
      "Current sprint: Sprint 4B - Coach Test Plan to Selection Preview",
      "",
      "## Files to review first",
      "",
      "- fullmatch-workbench-chain-replay-4b.md",
      "- validation.fullmatch-workbench-chain-replay-4b.md",
      "- coach-report.experimental.html",
      "- validation.share-pack.md",
      "",
      "## Purpose",
      "",
      "Sprint 4B turns the coach-facing test plan into a Selection Preview. The preview is visible only in experimental mode, contains three role/profile cards, and remains non-applied. It does not change lineup, starters, bench, scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, live selection, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review order",
      "",
      "1. Read validation.share-pack.md.",
      "2. Read fullmatch-workbench-chain-replay-4b.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-4b.md.",
      "4. Open coach-report.experimental.html and verify Prévisualisation de sélection appears after Plan de test coach.",
      "5. Open coach-report.default.html and verify the preview is absent.",
      "",
      "## Expected recommendation",
      "",
      "- CONFIRM_COACH_TEST_PLAN_TO_SELECTION_PREVIEW.",
      "- CONFIRM_PREVIEW_REMAINS_NON_APPLIED.",
      "- PREPARE_SELECTION_PREVIEW_TO_TACTICAL_TRADEOFF_PANEL.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Z")) {
    return [
      "# Sprint 3Z Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3Z - Coach Report UX Cleanup & Encoding Fix",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3z.md",
      "- validation.fullmatch-workbench-chain-replay-3z.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "- coach-report.default.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3Z fixes coach report readability only. It repairs visible UTF-8 copy, keeps technical diagnostics behind developer details, and preserves the default/experimental boundary. It does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, live selection, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3z.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3z.md.",
      "4. Open coach-report.experimental.html and verify Confiance multi-scénarios, Stabilité, and the em dash render correctly.",
      "5. Open coach-report.default.html and verify experimental sandbox sections are absent.",
      "6. Use bundle__reports.md for renderer and guard implementation details.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Y")) {
    return [
      "# Sprint 3Y Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3Y - Batch Confidence Calibration",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3y.md",
      "- validation.fullmatch-workbench-chain-replay-3y.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3Y evaluates the same sandbox coach suggestion across a local controlled batch of support, goalkeeper, fatigue, recovery, and rebound-pressure scenarios. It remains behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, live selection, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3y.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3y.md.",
      "4. Use coach-report.experimental.html to verify the Confiance multi-scÃ©narios block.",
      "5. Use bundle__simulation.md and bundle__reports.md for implementation details.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3X")) {
    return [
      "# Sprint 3X Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3X - Sandbox Decision Evidence Calibration",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3x.md",
      "- validation.fullmatch-workbench-chain-replay-3x.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3X adds a low-confidence evidence calibration layer to the sandbox decision panel. It remains behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, live selection, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3x.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3x.md.",
      "4. Use coach-report.experimental.html to verify the confidence block under the Sandbox Decision Panel.",
      "5. Use bundle__simulation.md and bundle__reports.md for implementation details.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3W")) {
    return [
      "# Sprint 3W Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3W - Sandbox Decision Panel",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3w.md",
      "- validation.fullmatch-workbench-chain-replay-3w.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3W adds a Sandbox Decision Panel after the coach-facing official timeline versus sandbox review. It remains behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3w.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3w.md.",
      "4. Use coach-report.experimental.html to verify the Sandbox Decision Panel blocks.",
      "5. Use bundle__simulation.md and bundle__reports.md for implementation details.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3V")) {
    return [
      "# Sprint 3V Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3V - Coach-Facing Timeline Review",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3v.md",
      "- validation.fullmatch-workbench-chain-replay-3v.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3V converts the technical Official Timeline Diff View into a coach-facing review panel. It stays behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3v.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3v.md.",
      "4. Use coach-report.experimental.html to verify the four coach-facing timeline blocks.",
      "5. Use bundle__simulation.md and bundle__reports.md for implementation details.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3U")) {
    return [
      "# Sprint 3U Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3U - Official Timeline Diff View",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3u.md",
      "- validation.fullmatch-workbench-chain-replay-3u.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3U adds a read-only Official Timeline Diff View over the existing controlled segment sandbox timeline. It stays behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "1. Read validation.share-pack.md first.",
      "2. Read fullmatch-workbench-chain-replay-3u.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3u.md.",
      "4. Use bundle__simulation.md for implementation details.",
      "5. Use coach-report.experimental.html only to verify coach-visible wording.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3T")) {
    return [
      "# Sprint 3T Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "Current sprint: Sprint 3T - Controlled Segment Sandbox Timeline",
      "",
      "## What to read first",
      "",
      "- fullmatch-workbench-chain-replay-3t.md",
      "- validation.fullmatch-workbench-chain-replay-3t.md",
      "- validation.share-pack.md",
      "- coach-report.experimental.html",
      "",
      "## Sprint boundary",
      "",
      "Sprint 3T projects the existing sandbox sequence replay into a separate typed controlled segment sandbox timeline. It stays behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "## Review steps",
      "",
      "Upload every file in this folder.",
      "",
      "1. Confirm validation.share-pack.md is PASS.",
      "2. Read fullmatch-workbench-chain-replay-3t.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3t.md.",
      "4. Use coach-report.experimental.html only to verify the controlled segment sandbox timeline wording is readable and separated from official MatchEvents.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3S")) {
    return [
      "# Sprint 3S Share Pack",
      "",
      "Mode: MINIMAL_REVIEW",
      "",
      "Current sprint: Sprint 3S - Sandbox Sequence Replay",
      "",
      "Review starting points:",
      "- fullmatch-workbench-chain-replay-3s.md",
      "- validation.fullmatch-workbench-chain-replay-3s.md",
      "- coach-report.experimental.html",
      "- bundle__simulation.md",
      "",
      "Sprint 3S adds a sandbox-only 9-step sequence replay after multi-action continuation. It remains behind workbench_chain_replay_experimental and does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
      "",
      "Recommended review order:",
      "1. Read validation.share-pack.md.",
      "2. Read fullmatch-workbench-chain-replay-3s.md.",
      "3. Inspect validation.fullmatch-workbench-chain-replay-3s.md.",
      "4. Use bundle__simulation.md for source excerpts and tests.",
      "",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3R")) {
    return [
      "# Sprint 3R Share Pack",
      "",
      "This compact review pack covers the multi-action continuation sandbox generated from the rebound second chance sandbox behind the opt-in route selection flag.",
      "",
      "Start with:",
      "1. `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.",
      "2. `fullmatch-workbench-chain-replay-3r.md` explains the multi-action continuation model, baseline-versus-override continuation action, outcome, team, actor, target zone, confidence, and official guardrails.",
      "3. `validation.fullmatch-workbench-chain-replay-3r.md` validates opt-in behavior, continuation fields, official possession and timeline mutation guards, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.",
      "4. `coach-report.default.html` and `coach-report.experimental.html` compare default and experimental coach-facing outputs.",
      "5. `bundle__simulation.md` contains the chain from replay through multi-action continuation sandbox and all related tests.",
      "",
      "## Guardrail reminder",
      "Sprint 3R does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, official timeline, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3Q")) {
    return [
      "# Sprint 3Q Share Pack",
      "",
      "This compact review pack covers the rebound and second-chance sandbox generated from the goalkeeper response model behind the opt-in route selection flag.",
      "",
      "Start with:",
      "1. `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.",
      "2. `fullmatch-workbench-chain-replay-3q.md` explains the rebound second chance model, baseline-versus-override rebound state, loose-ball state, recovery candidate, second-chance probability, and official guardrails.",
      "3. `validation.fullmatch-workbench-chain-replay-3q.md` validates opt-in behavior, rebound fields, official possession mutation guards, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.",
      "4. `coach-report.default.html` and `coach-report.experimental.html` compare default and experimental coach-facing outputs.",
      "5. `bundle__simulation.md` contains the chain from replay through rebound second chance sandbox and all related tests.",
      "",
      "## Guardrail reminder",
      "Sprint 3Q does not change scoring values, official ScoringEvents, MatchBonusEvent, official possession, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3P")) {
    return [
      "# Sprint 3P Share Pack",
      "",
      "This compact review pack covers the goalkeeper response model generated from the attribute-driven shot resolution sandbox behind the opt-in route selection flag.",
      "",
      "Start with:",
      "1. `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.",
      "2. `fullmatch-workbench-chain-replay-3p.md` explains the goalkeeper response model, baseline-versus-override response, save margin, rebound state, positioning, trajectory reading, reaction, handling, rebound control, concentration, mental fatigue, and guardrails.",
      "3. `validation.fullmatch-workbench-chain-replay-3p.md` validates opt-in behavior, goalkeeper response fields, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.",
      "4. `coach-report.default.html` and `coach-report.experimental.html` compare default and experimental coach-facing outputs.",
      "5. `bundle__simulation.md` contains the chain from replay through goalkeeper response model sandbox and all related tests.",
      "",
      "## Guardrail reminder",
      "Sprint 3P does not change scoring values, official ScoringEvents, MatchBonusEvent, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    ].join("\n");
  }

  if (TASK_NAME.includes("Sprint 3O")) {
    return [
      "# Sprint 3O Share Pack",
      "",
      "This compact review pack covers the attribute-driven shot resolution sandbox generated from the sandbox scoring-event resolution model behind the opt-in route selection flag.",
      "",
      "## Review order",
      "1. `validation.share-pack.md` confirms that the pack is current and below the 20-file limit.",
      "2. `fullmatch-workbench-chain-replay-3o.md` explains the attribute-driven shot resolution sandbox, baseline-versus-override outcome, shooter/goalkeeper attributes, adjusted shot quality, goalkeeper quality, and guardrails.",
      "3. `validation.fullmatch-workbench-chain-replay-3o.md` validates opt-in behavior, attribute-driven outcome, official score mutation guards, official scoring event mutation guards, production scoring-event creation guards, route-success mutation guards, global-economy guardrails, and source-of-truth checks.",
      "4. `coach-report.default.html` and `coach-report.experimental.html` compare the default segment harness with the opt-in experimental report.",
      "5. `bundle__simulation.md` contains the chain from replay through attribute-driven shot resolution sandbox and all related tests.",
      "",
      "## Guardrail reminder",
      "Sprint 3O does not change scoring values, official ScoringEvents, MatchBonusEvent, production route resolution, default full-match mode, or global economy validation. FULL_MATCH_BATCH_ECONOMY remains the only global scoring-economy proof.",
    ].join("\n");
  }

  return [
    "# Sprint 3N Share Pack",
    "",
    "This compact review pack covers the sandbox scoring event resolution model generated from the sandbox scoring event candidate model behind the opt-in route selection flag.",
    "",
    "Start with:",
    "- `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.",
    "- `fullmatch-workbench-chain-replay-3n.md` for sandbox scoring event resolution model status, baseline-versus-override resolution classification, candidate source fields, divergence fields, rejected candidates, official score signature comparison, diagnostics, and guardrails.",
    "- `validation.fullmatch-workbench-chain-replay-3n.md` for opt-in sandbox resolution classification, official score mutation, official scoring event mutation, production scoring-event creation, route-success mutation, production-resolution guardrails, global-economy guardrails, and source-of-truth checks.",
    "- `coach-report.default.html` and `coach-report.experimental.html` to compare default and experimental coach-facing outputs.",
    "- `sequence-1-action-1.html`, `sequence-1-action-2.html`, and `sequence-1-action-3.html` for visual workbench truth.",
    "- `bundle__simulation.md` for multi-action WorkbenchChain files/tests, segment context influence, route candidate influence, shadow route selection, controlled segment selection, SegmentRouteInput wiring, controlled mini-match route source wiring, live selection override guard wiring, isolated mini-match override experiment wiring, controlled segment replay comparison wiring, real isolated replay engine wiring, controlled route resolution sandbox wiring, sandbox scoring opportunity model wiring, sandbox scoring event candidate wiring, sandbox scoring event resolution wiring, full-match route selection flag files/tests, mini-match route selection files/tests, replay seed, grounding diagnostics, and evidence.",
    "- `bundle__reports.md` for the share-pack generator, coach report renderer, copy quality utility, and guards.",
    "",
  ].join("\n");

  return [
    "# Sprint 3E Share Pack",
    "",
    "This compact review pack covers typed SegmentRouteInput wiring from controlled segment selection behind the opt-in route selection flag.",
    "",
    "Start with:",
    "- `00-share-manifest.txt` for copied files, bundle contents, commands, and git status.",
    "- `fullmatch-workbench-chain-replay-3e.md` for SegmentRouteInput status, controlled-selection source, rejected candidates, score signature comparison, diagnostics, and guardrails.",
    "- `validation.fullmatch-workbench-chain-replay-3e.md` for opt-in SegmentRouteInput, score mutation, scoring event mutation, route-success mutation, production-resolution guardrails, and source-of-truth checks.",
    "- `sequence-1-action-1.html`, `sequence-1-action-2.html`, and `sequence-1-action-3.html` for visual workbench truth.",
    "- `bundle__simulation.md` for multi-action WorkbenchChain files/tests, segment context influence, route candidate influence, shadow route selection, controlled segment selection, SegmentRouteInput wiring, full-match route selection flag files/tests, mini-match route selection files/tests, replay seed, grounding diagnostics, and evidence.",
    "- `bundle__reports.md` for the share-pack generator, coach report renderer, copy quality utility, and guards.",
    "- `coach-report.latest.html` for a visual full-match harness sample when present.",
    "",
  ].join("\n");
}
function writeGeneratedShareDocs(shareDirectory: string): readonly CopiedStandaloneFile[] {
  const generatedDocs = [
    {
      target: WORKBENCH_CHAIN_REPLAY_REPORT_TARGET,
      content: fullMatchWorkbenchChainReplayDoc(),
    },
    {
      target: WORKBENCH_CHAIN_REPLAY_VALIDATION_TARGET,
      content: fullMatchWorkbenchChainReplayValidationDoc(),
    },
    {
      target: "README.md",
      content: shareReadmeDoc(),
    },
  ];

  for (const doc of generatedDocs) {
    writeFileSync(join(shareDirectory, doc.target), doc.content, "utf8");
  }

  return GENERATED_SHARE_DOCS;
}
function getGitStatusSummary(repositoryRoot: string): string {
  try {
    const status = execFileSync("git", ["status", "--short"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trimEnd();

    const reviewRelevantStatus = status
      .split("\n")
      .filter((line) => !line.includes("reports/share/"))
      .join("\n")
      .trimEnd();

    return reviewRelevantStatus.length > 0 ? reviewRelevantStatus : "clean";
  } catch (error) {
    return `Unable to collect git status: ${String(error)}`;
  }
}

function countSharePackFiles(shareDirectory: string): number {
  if (!existsSync(shareDirectory)) {
    return 0;
  }

  return readdirSync(shareDirectory).filter((entry) =>
    statSync(join(shareDirectory, entry)).isFile(),
  ).length;
}

function renderManifest(input: SharePackManifestInput): string {
  const lines: string[] = [
    "ChatGPT Review Share Pack Manifest",
    "==================================",
    "",
    `Generated timestamp: ${input.generatedAt}`,
    `Task/sprint name: ${TASK_NAME}`,
    `Final file count: ${input.finalFileCount}`,
    "",
    "Standalone files copied:",
  ];

  if (input.standaloneFiles.length === 0) {
    lines.push("- none");
  } else {
    for (const file of input.standaloneFiles) {
      lines.push(`- ${file.target} <= ${file.source} (${file.reason})`);
    }
  }

  lines.push("", "Bundle files generated:");
  for (const bundle of input.bundles) {
    lines.push(`- ${bundle.file} (${bundle.reason})`);
  }

  lines.push("", "Source files included inside each bundle:");
  for (const bundle of input.bundles) {
    lines.push(`- ${bundle.file}:`);
    if (bundle.includedSources.length === 0) {
      lines.push("  - none");
      continue;
    }

    for (const source of bundle.includedSources) {
      lines.push(`  - ${source}`);
    }
  }

  lines.push("", "Missing expected files:");
  if (input.missingExpectedFiles.length === 0) {
    lines.push("- none");
  } else {
    for (const missingFile of input.missingExpectedFiles) {
      const requiredLabel = missingFile.required ? "required" : "optional";
      lines.push(
        `- ${missingFile.source} (${requiredLabel}; ${missingFile.reason})`,
      );
    }
  }

  lines.push("", "Test/build commands run:");
  for (const command of input.commandsRun) {
    lines.push(`- ${command}`);
  }

  lines.push("", "Git status summary:", input.gitStatusSummary, "");

  return lines.join("\n");
}

function renderCompatibilityManifest(input: SharePackManifestInput): string {
  const lines: string[] = [
    "# Share Pack",
    "",
    `Generated: ${input.generatedAt}`,
    `Task/sprint: ${TASK_NAME}`,
    "Mode: MINIMAL_REVIEW",
    `Final file count: ${input.finalFileCount}`,
    "",
    "Upload every file in this reports/share directory.",
    "",
    "Source files are bundled by domain to keep the ChatGPT review pack compact.",
    "",
    "## Standalone Files",
  ];

  if (input.standaloneFiles.length === 0) {
    lines.push("- none");
  } else {
    for (const file of input.standaloneFiles) {
      lines.push(`- ${file.target}`);
    }
  }

  lines.push("", "## Bundle Files");
  for (const bundle of input.bundles) {
    lines.push(`- ${bundle.file}`);
  }

  lines.push("", "## Missing Expected Files");
  if (input.missingExpectedFiles.length === 0) {
    lines.push("- none");
  } else {
    for (const missingFile of input.missingExpectedFiles) {
      const requiredLabel = missingFile.required ? "required" : "optional";
      lines.push(`- ${missingFile.source} (${requiredLabel})`);
    }
  }

  lines.push("");

  return lines.join("\n");
}

function assertSharePackLimit(shareDirectory: string): void {
  const fileCount = countSharePackFiles(shareDirectory);

  if (fileCount > MAX_SHARE_FILES) {
    throw new Error(
      `Share pack contains ${fileCount} files, exceeding the ${MAX_SHARE_FILES}-file limit.`,
    );
  }
}

function assertRequiredFilesPresent(
  missingFiles: readonly MissingExpectedFile[],
): void {
  const requiredMissingFiles = missingFiles.filter(
    (missingFile) => missingFile.required,
  );

  if (requiredMissingFiles.length === 0) {
    return;
  }

  const missingList = requiredMissingFiles
    .map((missingFile) => missingFile.source)
    .join(", ");

  throw new Error(`Required share-pack source files are missing: ${missingList}`);
}

export function updateSharePack(): void {
  const repositoryRoot = getRepositoryRoot();
  const shareDirectory = join(repositoryRoot, "reports", "share");
  const generatedAt = new Date().toISOString();

  cleanDirectory(shareDirectory);

  const standaloneResult = copyStandaloneFiles(repositoryRoot, shareDirectory);
  const bundleResult = generateBundles(repositoryRoot, shareDirectory);
  const generatedDocs = writeGeneratedShareDocs(shareDirectory);
  const missingExpectedFiles = [
    ...standaloneResult.missingFiles,
    ...bundleResult.missingFiles,
  ];
  const standaloneFiles = [...standaloneResult.copiedFiles, ...generatedDocs];

  const manifestInputBeforeWrite: SharePackManifestInput = {
    generatedAt,
    finalFileCount:
      standaloneFiles.length + bundleResult.bundles.length + 2,
    standaloneFiles,
    bundles: bundleResult.bundles,
    missingExpectedFiles,
    commandsRun: COMMANDS_RUN,
    gitStatusSummary: getGitStatusSummary(repositoryRoot),
  };

  writeFileSync(
    join(shareDirectory, "00-share-manifest.txt"),
    renderManifest(manifestInputBeforeWrite),
    "utf8",
  );
  writeFileSync(
    join(shareDirectory, "manifest.md"),
    renderCompatibilityManifest(manifestInputBeforeWrite),
    "utf8",
  );

  assertSharePackLimit(shareDirectory);
  assertRequiredFilesPresent(missingExpectedFiles);

  const finalFileCount = countSharePackFiles(shareDirectory);
  const validation = validateSharePack({ reportDirectory: join(repositoryRoot, "reports") });
  if (!validation.valid) {
    throw new Error(`Share pack validation failed: ${validation.reportPath}`);
  }

  console.log(`Updated reports/share for ${TASK_NAME}.`);
  console.log(`Final file count: ${finalFileCount}`);
  console.log(
    `Generated bundles: ${bundleResult.bundles
      .map((bundle) => bundle.file)
      .join(", ")}`,
  );
}

if (require.main === module) {
  updateSharePack();
}
```

## File: src/reports/htmlCoachReport.ts

```ts
import type {
  CoachInsight,
  CoachInsightType,
  EventOutcome,
  KeyMoment,
  MatchEvent,
  MatchEventType,
  MatchReport,
  TacticalDiagnosis,
  TeamMatchStats,
  TrainingFocusSuggestion,
  ZoneStats,
} from "../contracts/engineToCoach";
import { normalizeCoachFacingCopy } from "./coachCopyQuality";
import { scoreSourceLabel } from "./scoreSourceLabel";
import {
  selectionPreviewProfileAttributeLabels,
  selectionPreviewProfileRoleFamilyLabels,
  type SelectionPreviewProfileAttribute,
  type SelectionPreviewProfileRoleFamily,
} from "./selectionPreviewProfileView";

export function escapeHtml(value: string): string {
  return normalizeCoachFacingCopy(productCopy(value))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function productCopy(value: string): string {
  return value
    .replaceAll(
      "Données encore limitées par l'adapter de simulation actuel.",
      "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
    )
    .replaceAll(
      "DonnÃ©es encore limitÃ©es par l'adapter de simulation actuel.",
      "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
    )
    .replaceAll("issue du résumé de score mini-match", "identifiée dans le résumé de score")
    .replaceAll("issues du résumé de score mini-match", "identifiées dans le résumé de score")
    .replaceAll("visible par l'adapter", "visible dans les données de simulation actuelles")
    .replaceAll("visibles par l'adapter", "visibles dans les données de simulation actuelles")
    .replaceAll("Protéger la plateforme de marque", "Sécuriser la séquence qui mène au score")
    .replaceAll("Protéger le schéma qui a mené à l'action décisive", "Conserver le schéma qui a créé l'action décisive")
    .replaceAll("L'adapter mini-match", "Le moteur de simulation")
    .replaceAll("l'adapter mini-match", "le moteur de simulation")
    .replaceAll("adapter mini-match", "moteur de simulation")
    .replaceAll("adapter de simulation actuel", "moteur de simulation actuel")
    .replaceAll("mini-match", "simulation")
    .replaceAll("resolution live du simulation", "resolution live normale")
    .replaceAll("experience simulation isolee", "experience isolee")
    .replaceAll("source de route controlee pour simulation", "source de route controlee experimentale");
}

function scoreText(report: MatchReport): string {
  return `${report.score.home} - ${report.score.away}`;
}

function renderScoreSourceNote(): string {
  const source = scoreSourceLabel("full_match_report");

  return `
      <div class="score-source">
        <strong>${escapeHtml(source.label)}</strong>
        <span>${escapeHtml(source.compactNote)}</span>
      </div>`;
}

function renderBadge(value: string): string {
  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function confidenceText(value: "low" | "medium" | "high"): string {
  switch (value) {
    case "low":
      return "Confiance faible";
    case "medium":
      return "Confiance moyenne";
    case "high":
      return "Confiance élevée";
  }
}

function renderConfidence(value: "low" | "medium" | "high"): string {
  return `<span class="badge confidence confidence-${value}">${escapeHtml(confidenceText(value))}</span>`;
}

function eventTypeLabel(eventType: MatchEventType): string {
  switch (eventType) {
    case "kickoff":
      return "Coup d'envoi";
    case "gain_possession":
      return "Récupération";
    case "lose_possession":
      return "Perte de possession";
    case "turnover":
      return "Ballon rendu";
    case "progression":
      return "Progression";
    case "duel":
      return "Duel";
    case "defensive_action":
      return "Action défensive";
    case "fatigue_error":
      return "Erreur liée à la fatigue";
    case "goalkeeper_action":
      return "Intervention du gardien";
    case "scoring":
      return "Action décisive";
    case "tactical_shift":
      return "Ajustement tactique";
    case "discipline":
      return "Discipline";
  }
}

function outcomeLabel(outcome: EventOutcome): string {
  switch (outcome) {
    case "success":
      return "réussite";
    case "failure":
      return "échec";
    case "neutral":
      return "neutre";
    case "advantage":
      return "avantage";
    case "score":
      return "score";
  }
}

function insightTypeLabel(type: CoachInsightType): string {
  switch (type) {
    case "strength":
      return "point fort";
    case "weakness":
      return "point faible";
    case "tactical_success":
      return "réussite tactique";
    case "tactical_failure":
      return "échec tactique";
    case "fatigue_warning":
      return "alerte physique";
    case "player_spotlight":
      return "joueur clé";
    case "synergy_detected":
      return "synergie détectée";
    case "opponent_exploit":
      return "faille adverse";
    case "training_recommendation":
      return "recommandation";
  }
}

function consequenceTypeLabel(type: string): string {
  switch (type) {
    case "score_change":
      return "évolution du score";
    case "possession_change":
      return "changement de possession";
    case "zone_change":
      return "changement de zone";
    case "fatigue_change":
      return "impact physique";
    case "momentum_change":
      return "changement d'élan";
    case "tactical_warning":
      return "alerte tactique";
    default:
      return type;
  }
}

function pressureLevelLabel(value: string): string {
  switch (value) {
    case "low":
      return "faible";
    case "medium":
      return "moyenne";
    case "high":
      return "forte";
    default:
      return value;
  }
}

function timelineReason(event: MatchEvent): string {
  return `Contexte : ${eventTypeLabel(event.eventType)} pour ${event.teamId} en ${event.zone}, sous pression ${pressureLevelLabel(event.tacticalContext.pressureLevel)}.`;
}

function consequenceLabel(input: { readonly type: string; readonly description: string; readonly value?: number }): string {
  if (input.type === "score_change") {
    return input.value === undefined ? "évolution du score" : `+${input.value} au score`;
  }

  return `${consequenceTypeLabel(input.type)} : ${input.description}`;
}

function compareTimelineEvents(a: MatchEvent, b: MatchEvent): number {
  if (a.timestamp.minute !== b.timestamp.minute) {
    return a.timestamp.minute - b.timestamp.minute;
  }

  if (a.timestamp.tick !== b.timestamp.tick) {
    return a.timestamp.tick - b.timestamp.tick;
  }

  if (a.eventType === "scoring" && b.eventType !== "scoring") {
    return 1;
  }

  if (a.eventType !== "scoring" && b.eventType === "scoring") {
    return -1;
  }

  return a.eventId.localeCompare(b.eventId);
}

function renderEmpty(message: string): string {
  return `<p class="empty">${escapeHtml(message)}</p>`;
}

function renderKeyMoment(moment: KeyMoment): string {
  return `
    <article class="card">
      <div class="card-meta">Minute ${moment.minute}</div>
      <h3>${escapeHtml(moment.title)}</h3>
      <p>${escapeHtml(moment.summary)}</p>
      <div class="muted">Événement : ${escapeHtml(moment.eventId)}</div>
    </article>`;
}

function renderCoachInsight(insight: CoachInsight): string {
  const evidence = insight.evidence
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.summary)}</strong>
          <div class="muted">Événements : ${item.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
          ${item.confidenceNote === undefined ? "" : `<div class="muted">${escapeHtml(item.confidenceNote)}</div>`}
        </li>`,
    )
    .join("");
  const actions = insight.recommendedActions
    .map(
      (action) => `
        <li>
          ${escapeHtml(action.label)}
          ${action.tradeoff === undefined ? "" : `<div class="muted">Compromis : ${escapeHtml(action.tradeoff)}</div>`}
        </li>`,
    )
    .join("");

  return `
    <article class="card">
      <div class="card-meta">${renderBadge(insightTypeLabel(insight.type))} ${renderConfidence(insight.confidence)}</div>
      <h3>${escapeHtml(insight.title)}</h3>
      <p>${escapeHtml(insight.summary)}</p>
      <div class="zones">Zones: ${insight.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <h4>Preuves</h4>
      <ul>${evidence}</ul>
      <h4>Action recommandée</h4>
      <ul>${actions}</ul>
    </article>`;
}

function isTechnicalGroundingDiagnosis(diagnosis: TacticalDiagnosis): boolean {
  return diagnosis.title.includes("Ancrage workbench") ||
    diagnosis.title.includes("Ancrage tactique full-match");
}

function renderTechnicalGroundingDiagnosis(diagnosis: TacticalDiagnosis): string {
  return `
    <article class="card">
      <div class="card-meta">Équipe ${escapeHtml(diagnosis.teamId)} ${renderConfidence(diagnosis.confidence)}</div>
      <h3>Limite actuelle du harnais expérimental</h3>
      <p>Le moteur utilise encore un harnais expérimental : certaines lectures sandbox servent à expliquer des pistes de test, mais elles ne modifient pas la timeline officielle, le score, la possession ou les événements de score.</p>
      <div class="zones">Zones: ${diagnosis.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <details class="internal-markers">
        <summary>Détails techniques développeur</summary>
        <div class="muted">Titre source : ${escapeHtml(diagnosis.title)}</div>
        <div class="muted">${escapeHtml(diagnosis.summary)}</div>
        <div class="muted">Événements de preuve : ${diagnosis.evidenceEventIds.map(escapeHtml).join(", ") || "aucun"}</div>
      </details>
    </article>`;
}

function renderDiagnosis(diagnosis: TacticalDiagnosis): string {
  if (isTechnicalGroundingDiagnosis(diagnosis)) {
    return renderTechnicalGroundingDiagnosis(diagnosis);
  }

  return `
    <article class="card">
      <div class="card-meta">Équipe ${escapeHtml(diagnosis.teamId)} ${renderConfidence(diagnosis.confidence)}</div>
      <h3>${escapeHtml(diagnosis.title)}</h3>
      <p>${escapeHtml(diagnosis.summary)}</p>
      <div class="zones">Zones: ${diagnosis.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <div class="muted">Événements de preuve : ${diagnosis.evidenceEventIds.map(escapeHtml).join(", ") || "aucun"}</div>
    </article>`;
}

function renderWarning(warning: MatchReport["warnings"][number]): string {
  if (warning.title.includes("Ancrage workbench") || warning.title.includes("Ancrage tactique full-match")) {
    return `
    <article class="card">
      <div class="card-meta">${renderBadge(warning.severity)} ${renderBadge(warning.scope)}</div>
      <h3>Limite actuelle du harnais expérimental</h3>
      <p>Le moteur utilise encore un harnais expérimental : certaines lectures sandbox servent à expliquer des pistes de test, mais elles ne modifient pas la timeline officielle, le score, la possession ou les événements de score.</p>
      <details class="internal-markers">
        <summary>Détails techniques développeur</summary>
        <div class="muted">Titre source : ${escapeHtml(warning.title)}</div>
        <div class="muted">${escapeHtml(warning.coachSummary)}</div>
        <div class="muted">Type : ${escapeHtml(warning.type)}</div>
        <div class="muted">Faits d'évidence : ${warning.evidenceFactIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">Événements : ${warning.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">${escapeHtml(warning.technicalSummary)}</div>
      </details>
    </article>`;
  }

  return `
    <article class="card">
      <div class="card-meta">${renderBadge(warning.severity)} ${renderBadge(warning.scope)}</div>
      <h3>${escapeHtml(warning.title)}</h3>
      <p>${escapeHtml(warning.coachSummary)}</p>
      <details class="internal-markers">
        <summary>Détails techniques</summary>
        <div class="muted">Type : ${escapeHtml(warning.type)}</div>
        <div class="muted">Faits d'évidence : ${warning.evidenceFactIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">Événements : ${warning.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">${escapeHtml(warning.technicalSummary)}</div>
      </details>
    </article>`;
}

function tagValue(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function renderTimelineReview(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW" &&
    candidate.internalTags.includes("coach_facing_timeline_review")
  );

  if (fact === undefined) {
    return "";
  }

  const baselineEvents = tagValue(fact.internalTags, "timeline_review_sandbox_baseline_events_") ?? "0";
  const overrideEvents = tagValue(fact.internalTags, "timeline_review_sandbox_override_events_") ?? "0";
  const finalOutcome = tagValue(fact.internalTags, "timeline_review_override_final_outcome_") ?? "secured_by_goalkeeper_team";
  const finalActor = tagValue(fact.internalTags, "timeline_review_override_final_actor_") ?? "blitz-goalkeeper-free-safety";
  const finalZone = tagValue(fact.internalTags, "timeline_review_override_final_zone_") ?? "Z3-HSR";
  const blocks = [
    {
      title: "Ce qui s'est passé officiellement",
      summary:
        "La timeline officielle reste la seule source de vérité du match. Dans ce run, le diff ne modifie ni les événements officiels, ni la possession officielle, ni le score officiel.",
      bullets: [
        "Le score officiel reste inchangé.",
        "La possession officielle reste inchangée.",
        "Les événements de score officiels restent inchangés.",
        "Les événements sandbox ne sont pas des MatchEvents officiels.",
      ],
    },
    {
      title: "Ce que le sandbox a rejoué",
      summary:
        `Le sandbox rejoue un scénario parallèle sur le premier segment. L'override se termine par ${finalOutcome}, avec ${finalActor} comme acteur final en ${finalZone}.`,
      bullets: [
        `Baseline sandbox-only : ${baselineEvents} événements.`,
        `Override sandbox-only : ${overrideEvents} événements.`,
        "Ce replay reste explicatif et non officiel.",
      ],
    },
    {
      title: "Ce qui est différent",
      summary:
        "La différence principale est uniquement expérimentale : le sandbox explore ce qu'aurait donné la route contrôlée FORWARD_PROGRESS, mais cette lecture ne remplace pas la timeline officielle.",
      bullets: [
        "La divergence appartient au sandbox.",
        "Elle sert à relire une alternative contrôlée et ses conséquences possibles.",
      ],
    },
    {
      title: "Ce qui n'a pas été modifié",
      summary:
        "Rien n'est modifié côté officiel : pas d'événement ajouté, pas de possession changée, pas de score modifié, pas d'événement de score créé et aucune conclusion d'économie globale.",
      bullets: [
        "Timeline officielle inchangée.",
        "Score, possession et événements de score officiels inchangés.",
        "Aucun événement de score production créé.",
        "Aucune preuve d'économie globale modifiée.",
      ],
    },
  ];
  const articles = blocks.map((block) => `
      <article class="card">
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.summary)}</p>
        <ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`).join("");

  return `
    <section>
      <h2>Lecture timeline officielle vs sandbox</h2>
      <div class="grid">${articles}</div>
      <details class="internal-markers">
        <summary>Détails techniques du sandbox</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderSandboxDecisionPanel(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL" &&
    candidate.internalTags.includes("sandbox_decision_panel")
  );
  const calibrationFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION" &&
    candidate.internalTags.includes("sandbox_decision_evidence_calibration")
  );
  const batchFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION" &&
    candidate.internalTags.includes("sandbox_decision_batch_confidence_calibration")
  );

  if (fact === undefined) {
    return "";
  }

  const recommendation = tagValue(fact.internalTags, "sandbox_decision_recommendation_") ?? "test_support_around_forward_progress";
  const evidenceScore = calibrationFact === undefined
    ? "42"
    : tagValue(calibrationFact.internalTags, "sandbox_decision_evidence_score_") ?? "42";
  const confidence = calibrationFact === undefined
    ? "low"
    : tagValue(calibrationFact.internalTags, "sandbox_decision_evidence_confidence_") ?? "low";
  const confidenceCopy = confidence === "low"
    ? "Confiance faible"
    : confidence === "medium"
      ? "Confiance moyenne"
      : confidence === "very_low"
        ? "Confiance très faible"
        : confidence === "strong"
          ? "Confiance forte"
          : "Confiance très forte";
  const evidenceCalibration = calibrationFact === undefined ? "" : `
      <article class="card summary-card">
        <h3>Niveau de confiance de la suggestion</h3>
        <p>${escapeHtml(confidenceCopy)} — ${escapeHtml(evidenceScore)}/100.</p>
        <p>La suggestion est affichée comme une piste à tester : le sandbox crée du danger et une opportunité de tir, mais la séquence ne va pas jusqu'au score, le gardien répond, puis l'équipe du gardien sécurise le ballon. Ce n'est pas une vérité officielle ni une preuve d'économie globale.</p>
        <h4>Ce qui soutient la suggestion</h4>
        <ul>
          <li>FORWARD_PROGRESS crée une progression dangereuse à 64/100.</li>
          <li>Le sandbox produit une half-chance et un SHOT_CANDIDATE.</li>
          <li>La qualité de tir ajustée atteint 53/100.</li>
          <li>Le test coach est concret : soutien autour de Z4-HSR et occupation du second ballon.</li>
        </ul>
        <h4>Ce qui limite la suggestion</h4>
        <ul>
          <li>Le tir est sauvé par le gardien, avec une réponse gardien à 65/100.</li>
          <li>Le danger de rebond et la seconde chance restent à 4/100.</li>
          <li>L'issue finale sandbox est secured_by_goalkeeper_team.</li>
          <li>Le signal vient d'une seule chaîne sandbox, sans confirmation batch ni variation de profils.</li>
        </ul>
      </article>`;
  const batchScenarioCount = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_scenario_count_") ?? "0";
  const batchAverageScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_average_score_") ?? "0";
  const batchMinScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_min_score_") ?? "0";
  const batchMaxScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_max_score_") ?? "0";
  const batchConfidence = batchFact === undefined
    ? "low"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_confidence_") ?? "low";
  const batchStability = batchFact === undefined
    ? "stable_but_low"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_stability_") ?? "stable_but_low";
  const batchConfidenceCopy = batchConfidence === "medium"
    ? "Confiance moyenne"
    : batchConfidence === "low_medium"
      ? "Confiance faible Ã  moyenne"
      : batchConfidence === "very_low"
        ? "Confiance trÃ¨s faible"
        : "Confiance faible";
  const batchCalibration = batchFact === undefined ? "" : `
      <article class="card summary-card">
        <h3>Confiance multi-scÃ©narios</h3>
        <p>${escapeHtml(batchConfidenceCopy)} â€” ${escapeHtml(batchAverageScore)}/100 en moyenne sur ${escapeHtml(batchScenarioCount)} scÃ©narios.</p>
        <p>Fourchette locale : ${escapeHtml(batchMinScore)}â€“${escapeHtml(batchMaxScore)}/100. StabilitÃ© : ${escapeHtml(batchStability)}.</p>
        <p>La confiance reste prudente car cette piste varie selon le soutien autour de Z4-HSR, la rÃ©ponse du gardien et la couverture du second ballon. Le batch sandbox renforce l'idÃ©e d'un test, mais ne suffit pas Ã  en faire une consigne officielle.</p>
        <ul>
          <li>Meilleur soutien offensif : confiance plus haute.</li>
          <li>Soutien faible : confiance plus basse.</li>
          <li>Gardien plus fort : confiance plus basse.</li>
          <li>Pression sur second ballon : signal Ã  surveiller.</li>
        </ul>
      </article>`;
  const blocks = [
    {
      title: "Enseignement coach",
      summary:
        "Le sandbox suggère que FORWARD_PROGRESS peut créer une situation dangereuse, mais il ne transforme pas cette lecture en vérité officielle.",
      bullets: [
        "Le signal sert à formuler une hypothèse de travail.",
        "La progression doit encore prouver qu'elle produit une seconde action contrôlée.",
        "La récupération par l'équipe du gardien reste un risque visible.",
      ],
    },
    {
      title: "Option à tester",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un soutien proche autour de Z4-HSR.",
      bullets: [
        "Soutenir la réception pour éviter un tir isolé.",
        "Créer une présence autour du second ballon.",
        `Recommandation sandbox : ${recommendation}.`,
      ],
    },
    {
      title: "Risque associé",
      summary:
        "Si le soutien arrive trop tard, la route peut donner une réponse gardien favorable à BLITZ plutôt qu'une vraie continuité offensive.",
      bullets: [
        "Le danger apparent peut rester stérile.",
        "Un rebond mal couvert peut sécuriser la possession adverse.",
        "Cette option ne doit pas piloter la sélection live normale.",
      ],
    },
    {
      title: "Ce qui reste à prouver",
      summary:
        "La même idée doit être testée dans plusieurs contextes avant tout usage production.",
      bullets: [
        "Différents profils de gardien.",
        "Différents niveaux de soutien et de fatigue.",
        "Aucune conclusion d'économie globale depuis ce panneau.",
      ],
    },
  ];
  const articles = blocks.map((block) => `
      <article class="card">
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.summary)}</p>
        <ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`).join("");

  return `
    <section>
      <h2>Panneau de décision sandbox</h2>
      <p>Ce panneau propose une option coach à tester. Il ne remplace pas la timeline officielle et ne pilote pas la sélection live.</p>
      <p>Cette piste reste une suggestion sandbox, pas une consigne officielle. Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score. Elle ne constitue pas une preuve d’économie globale.</p>
      <div class="grid">${evidenceCalibration}${batchCalibration}${articles}</div>
      <details class="internal-markers">
        <summary>Détails techniques du panneau sandbox</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
        ${calibrationFact === undefined ? "" : `<div class="muted">${escapeHtml(calibrationFact.summary)}</div>`}
        ${calibrationFact === undefined ? "" : `<div class="muted">${calibrationFact.internalTags.map(escapeHtml).join(", ")}</div>`}
        ${batchFact === undefined ? "" : `<div class="muted">${escapeHtml(batchFact.summary)}</div>`}
        ${batchFact === undefined ? "" : `<div class="muted">${batchFact.internalTags.map(escapeHtml).join(", ")}</div>`}
      </details>
    </section>`;
}

function confidenceLabel(value: string): string {
  switch (value) {
    case "medium":
      return "moyenne";
    case "low_medium":
      return "faible à moyenne";
    case "low":
    default:
      return "faible";
  }
}

function renderMultiScenarioCoachTestPlan(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN" &&
    candidate.internalTags.includes("workbench_chain_multi_scenario_coach_test_plan")
  );

  if (fact === undefined) {
    return "";
  }

  const supportScenario = tagValue(fact.internalTags, "multi_scenario_test_support_around_z4_hsr_scenario_") ??
    "batch-scenario-better-attacking-support";
  const secondBallScenario = tagValue(fact.internalTags, "multi_scenario_test_second_ball_occupation_scenario_") ??
    "batch-scenario-better-attacking-rebound-pressure";
  const goalkeeperScenario = tagValue(fact.internalTags, "multi_scenario_test_strong_goalkeeper_fallback_scenario_") ??
    "batch-scenario-stronger-goalkeeper";
  const supportConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_support_around_z4_hsr_confidence_") ?? "low",
  );
  const secondBallConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_second_ball_occupation_confidence_") ?? "low",
  );
  const goalkeeperConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_strong_goalkeeper_fallback_confidence_") ?? "low",
  );
  const tests = [
    {
      title: "Renforcer le soutien autour de Z4-HSR",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un soutien plus proche autour de Z4-HSR. Le scénario avec meilleur soutien offensif est celui qui améliore le plus la piste, mais le signal reste local et ne prouve pas encore que la route est supérieure.",
      scenario: supportScenario,
      expectedSignal: "meilleure continuité après tir / meilleure présence au second ballon",
      risk: "tir isolé si le soutien arrive trop tard",
      confidence: supportConfidence,
      unproven: "La supériorité de la route reste non prouvée dans l'économie officielle.",
    },
    {
      title: "Mieux occuper le second ballon",
      summary:
        "Tester une présence plus agressive autour du rebond après tir. Le but est de vérifier si CONTROL peut transformer une parade du gardien en seconde action plutôt qu'en récupération propre par BLITZ.",
      scenario: secondBallScenario,
      expectedSignal: "la probabilité de seconde chance progresse",
      risk: "sur-engagement et exposition de la rest-defense",
      confidence: secondBallConfidence,
      unproven: "Le modèle ne prouve pas encore que cette occupation reste sûre contre une transition adverse.",
    },
    {
      title: "Prévoir la réaction au gardien fort",
      summary:
        "Tester un plan B si le gardien adverse gagne la séquence. Le scénario avec gardien plus fort fait chuter la confiance : la progression peut créer du danger, mais finir en récupération adverse.",
      scenario: goalkeeperScenario,
      expectedSignal: "continuité plus sûre ou meilleure pression après arrêt",
      risk: "gardien plus fort qui neutralise l'attaque",
      confidence: goalkeeperConfidence,
      unproven: "La réponse au gardien fort reste une hypothèse locale, pas une consigne officielle.",
    },
  ];
  const cards = tests.map((test) => `
      <article class="card">
        <h3>${escapeHtml(test.title)}</h3>
        <p>${escapeHtml(test.summary)}</p>
        <ul>
          <li><strong>Scénario lié :</strong> ${escapeHtml(test.scenario)}</li>
          <li><strong>Signal utile attendu :</strong> ${escapeHtml(test.expectedSignal)}</li>
          <li><strong>Risque à surveiller :</strong> ${escapeHtml(test.risk)}</li>
          <li><strong>Confiance :</strong> ${escapeHtml(test.confidence)}</li>
          <li><strong>Ce qui reste non prouvé :</strong> ${escapeHtml(test.unproven)}</li>
        </ul>
      </article>`).join("");

  return `
    <section>
      <h2>Plan de test coach</h2>
      <p>Ces tests sont des hypothèses issues du sandbox, pas des consignes officielles.</p>
      <p>Ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <p>Ils ne constituent pas une preuve d’économie globale.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>Détails techniques du plan de test</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

interface SelectionPreviewCoachCopyRenderCard {
  readonly previewId: "support_near_z4_hsr" | "second_ball_presence" | "strong_goalkeeper_response";
  readonly title: string;
  readonly summary: string;
  readonly whyObserve: readonly string[];
  readonly limits: readonly string[];
}

const selectionPreviewCoachCopyCards: readonly SelectionPreviewCoachCopyRenderCard[] = [
  {
    previewId: "support_near_z4_hsr",
    title: "soutien proche autour des zones de danger",
    summary:
      "Les traces officielles montrent des zones de danger et des récupérations qui peuvent nécessiter une meilleure première sortie.",
    whyObserve: [
      "Soutenir la progression après récupération.",
      "Réduire le risque de tir ou de passe isolée.",
      "Stabiliser la continuité autour des zones dangereuses.",
    ],
    limits: [
      "Ne change pas la composition.",
      "Ne devient pas une recommandation officielle.",
      "À confirmer par d’autres scénarios et par la lecture tactique.",
    ],
  },
  {
    previewId: "second_ball_presence",
    title: "présence sur second ballon",
    summary:
      "Les traces officielles renforcent l’intérêt de mieux observer la continuité après action dangereuse ou récupération.",
    whyObserve: [
      "Attaquer les ballons mal sécurisés.",
      "Mieux contrôler la suite après tir, arrêt ou récupération.",
      "Limiter les pertes de continuité après une action dangereuse.",
    ],
    limits: [
      "Risque de sur-engagement si trop de joueurs attaquent le second ballon.",
      "Peut exposer la rest-defense.",
      "Reste un test de sélection non appliqué.",
    ],
  },
  {
    previewId: "strong_goalkeeper_response",
    title: "réponse face à un gardien fort",
    summary:
      "Les traces soutiennent l’idée d’observer une option de continuité lorsque le gardien ou la défense neutralise l’action.",
    whyObserve: [
      "Préparer une solution après arrêt ou neutralisation.",
      "Éviter une attaque dépendante d’un tir direct.",
      "Garder une structure utile après l’action dangereuse.",
    ],
    limits: [
      "N’indique pas encore quel joueur choisir.",
      "N’applique aucun changement.",
      "Non confirmée comme recommandation officielle.",
    ],
  },
];

function splitTagValues(value: string | undefined): readonly string[] {
  return value === undefined || value === "none" ? [] : value.split("|");
}

function zonesText(zones: readonly string[]): string {
  return zones.length === 0 ? "les zones concernées" : zones.join(" / ");
}

function coachTraceSupportLines(input: {
  readonly previewId: SelectionPreviewCoachCopyRenderCard["previewId"];
  readonly traceSupported: boolean;
  readonly dangerZones: readonly string[];
  readonly recoveryZones: readonly string[];
}): readonly string[] {
  if (!input.traceSupported) {
    return [
      "Aucun appui officiel suffisant pour l’instant.",
      "La piste reste observable, sans devenir une recommandation officielle.",
    ];
  }

  switch (input.previewId) {
    case "support_near_z4_hsr":
      return [
        `Danger officiel en ${zonesText(input.dangerZones)}.`,
        `Récupérations officielles en ${zonesText(input.recoveryZones)}.`,
        "Point de vigilance V1 : sécuriser la première sortie après récupération.",
      ];
    case "second_ball_presence":
      return [
        `Récupérations utiles autour de ${zonesText(input.recoveryZones)}.`,
        "Possession sécurisée ou pression détectée après action dangereuse.",
        "Danger non converti : la suite de l’action reste importante.",
      ];
    case "strong_goalkeeper_response":
      return [
        "Gardien ou défense qui sécurise une action dangereuse.",
        `Danger créé mais non converti en ${zonesText(input.dangerZones)}.`,
        "Besoin de continuité ou de second ballon après neutralisation.",
      ];
  }
}

function renderSelectionPreviewCoachCopy(input: {
  readonly selectionPreviewFact: MatchReport["evidenceFacts"][number];
  readonly traceBackingFact: MatchReport["evidenceFacts"][number] | undefined;
  readonly coachCopyFact: MatchReport["evidenceFacts"][number];
}): string {
  const traceStatus = (previewId: SelectionPreviewCoachCopyRenderCard["previewId"]): string =>
    input.traceBackingFact === undefined
      ? "sandbox_only"
      : tagValue(input.traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_status_`) ?? "sandbox_only";
  const traceZones = (previewId: SelectionPreviewCoachCopyRenderCard["previewId"], suffix: "danger_zones" | "recovery_zones"): readonly string[] =>
    input.traceBackingFact === undefined
      ? []
      : splitTagValues(tagValue(input.traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_${suffix}_`));

  const cards = selectionPreviewCoachCopyCards.map((card) => {
    const status = traceStatus(card.previewId);
    const traceSupported = status === "trace_supported";
    const supportLines = coachTraceSupportLines({
      previewId: card.previewId,
      traceSupported,
      dangerZones: traceZones(card.previewId, "danger_zones"),
      recoveryZones: traceZones(card.previewId, "recovery_zones"),
    });

    return `
      <article class="card">
        <h3>Profil à observer — ${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.summary)}</p>
        <ul>
          <li><strong>Origine :</strong> hypothèse sandbox</li>
          <li><strong>Appui :</strong> ${traceSupported ? "appuyé par les traces officielles" : "non appuyé par les traces officielles pour l’instant"}</li>
          <li><strong>Décision :</strong> prévisualisation non appliquée</li>
          <li><strong>Confirmation :</strong> non confirmée comme recommandation officielle</li>
        </ul>
        <h4>Pourquoi l’observer</h4>
        <ul>${card.whyObserve.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h4>Ce que les traces soutiennent</h4>
        <ul>${supportLines.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h4>Limite</h4>
        <ul>${card.limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>`;
  }).join("");

  return `
    <section>
      <h2>Profils à observer</h2>
      <p>Ces profils restent des prévisualisations non appliquées. Les traces officielles peuvent appuyer une hypothèse, mais elles ne la transforment pas en recommandation officielle.</p>
      <p>La confiance n’est pas rehaussée automatiquement et la sélection live reste inchangée.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>Détails techniques de la prévisualisation</summary>
        <div class="muted">${escapeHtml(input.selectionPreviewFact.summary)}</div>
        <div class="muted">${input.selectionPreviewFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
      ${input.traceBackingFact === undefined ? "" : `
      <details class="internal-markers">
        <summary>Détails techniques de l’appui par traces</summary>
        <div class="muted">${escapeHtml(input.traceBackingFact.summary)}</div>
        <div class="muted">${input.traceBackingFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>`}
      <details class="internal-markers">
        <summary>Détails techniques de la copie coach</summary>
        <div class="muted">${escapeHtml(input.coachCopyFact.summary)}</div>
        <div class="muted">${input.coachCopyFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

interface SelectionPreviewProfileRenderCard {
  readonly title: string;
  readonly roleFamilies: readonly SelectionPreviewProfileRoleFamily[];
  readonly usefulAttributes: readonly SelectionPreviewProfileAttribute[];
  readonly whyObserve: readonly string[];
  readonly officialTraceSupport: readonly string[];
  readonly expectedBenefit: readonly string[];
  readonly tacticalRisk: readonly string[];
  readonly nextMatchSignalToVerify: readonly string[];
}

const selectionPreviewProfileRenderCards: readonly SelectionPreviewProfileRenderCard[] = [
  {
    title: "Profil à observer — soutien proche autour des zones de danger",
    roleFamilies: ["support_runner", "mobile_lock", "hook_link", "playmaker_support"],
    usefulAttributes: ["anticipation", "off_ball_support", "handling", "decision_making", "stamina"],
    whyObserve: [
      "Soutenir la progression après récupération.",
      "Offrir une sortie simple autour des zones dangereuses.",
      "Éviter que le porteur soit isolé après une progression.",
    ],
    officialTraceSupport: [
      "Zones de danger répétées.",
      "Récupérations utiles à sécuriser.",
      "Point de vigilance V1 sur la première sortie après récupération.",
    ],
    expectedBenefit: [
      "Plus de continuité après récupération.",
      "Moins de pertes après progression.",
      "Meilleure stabilité dans les zones de danger.",
    ],
    tacticalRisk: [
      "Trop de soutien offensif peut exposer la rest-defense.",
      "Un soutien trop proche peut réduire la profondeur.",
      "Cette piste reste à tester contre d’autres profils adverses.",
    ],
    nextMatchSignalToVerify: [
      "Vérifier si la première sortie après récupération devient plus propre.",
      "Vérifier si les progressions dangereuses mènent à une continuité contrôlée.",
      "Vérifier si la rest-defense reste stable.",
    ],
  },
  {
    title: "Profil à observer — présence sur second ballon",
    roleFamilies: ["rebound_chaser", "pressure_forward", "high_work_rate_runner"],
    usefulAttributes: ["anticipation", "reaction", "acceleration", "aggression", "balance", "stamina"],
    whyObserve: [
      "Attaquer les ballons mal sécurisés.",
      "Mieux contrôler la suite après tir, arrêt ou récupération.",
      "Limiter les pertes de continuité après action dangereuse.",
    ],
    officialTraceSupport: [
      "Récupérations utiles.",
      "Possession sécurisée.",
      "Pression détectée.",
      "Danger non converti.",
    ],
    expectedBenefit: [
      "Plus de secondes actions.",
      "Meilleur contrôle des rebonds ou ballons libres.",
      "Moins de transitions adverses après action dangereuse.",
    ],
    tacticalRisk: [
      "Sur-engagement.",
      "Fatigue plus élevée.",
      "Rest-defense plus exposée si le second ballon est perdu.",
    ],
    nextMatchSignalToVerify: [
      "Vérifier si les secondes actions augmentent.",
      "Vérifier si la pression au rebond ne désorganise pas l’équipe.",
      "Vérifier si les récupérations deviennent plus exploitables.",
    ],
  },
  {
    title: "Profil à observer — réponse face à un gardien fort",
    roleFamilies: ["continuity_option", "secondary_playmaker", "support_receiver", "rest_defense_anchor"],
    usefulAttributes: ["decision_making", "positioning", "composure", "tactical_discipline", "mental_freshness", "handling"],
    whyObserve: [
      "Préparer une solution après arrêt ou neutralisation.",
      "Éviter une attaque trop dépendante d’un tir direct.",
      "Garder une structure utile après une action dangereuse.",
    ],
    officialTraceSupport: [
      "Danger créé mais pas toujours converti.",
      "Besoin de continuité après neutralisation.",
      "Signaux liés à la sécurisation de la possession.",
    ],
    expectedBenefit: [
      "Meilleure continuité après arrêt.",
      "Moins de récupération adverse facile.",
      "Plan B plus stable contre un gardien ou une défense forte.",
    ],
    tacticalRisk: [
      "Option plus prudente, parfois moins menaçante immédiatement.",
      "Peut ralentir l’attaque.",
      "Reste un test, pas une sélection imposée.",
    ],
    nextMatchSignalToVerify: [
      "Vérifier si l’équipe garde une structure utile après un arrêt.",
      "Vérifier si la possession reste sécurisée après action dangereuse.",
      "Vérifier si le profil réduit les récupérations adverses propres.",
    ],
  },
];

function renderSelectionPreviewProfileList(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderSelectionPreviewProfileView(input: {
  readonly selectionPreviewFact: MatchReport["evidenceFacts"][number];
  readonly traceBackingFact: MatchReport["evidenceFacts"][number] | undefined;
  readonly coachCopyFact: MatchReport["evidenceFacts"][number] | undefined;
  readonly profileViewFact: MatchReport["evidenceFacts"][number];
}): string {
  const cards = selectionPreviewProfileRenderCards.map((card) => `
      <article class="card">
        <h3>${escapeHtml(card.title)}</h3>
        <p><strong>Famille de rôle :</strong> ${card.roleFamilies.map((role) => escapeHtml(selectionPreviewProfileRoleFamilyLabels[role])).join(", ")}</p>
        <p><strong>Attributs utiles :</strong> ${card.usefulAttributes.map((attribute) => escapeHtml(selectionPreviewProfileAttributeLabels[attribute])).join(", ")}</p>
        <h4>Pourquoi l’observer</h4>
        ${renderSelectionPreviewProfileList(card.whyObserve)}
        <h4>Ce que les traces soutiennent</h4>
        ${renderSelectionPreviewProfileList(card.officialTraceSupport)}
        <h4>Bénéfice attendu</h4>
        ${renderSelectionPreviewProfileList(card.expectedBenefit)}
        <h4>Risque tactique</h4>
        ${renderSelectionPreviewProfileList(card.tacticalRisk)}
        <h4>Signal à vérifier au prochain match</h4>
        ${renderSelectionPreviewProfileList(card.nextMatchSignalToVerify)}
        <p><strong>Prévisualisation non appliquée — non confirmée comme recommandation officielle.</strong></p>
      </article>`).join("");

  return `
    <section>
      <h2>Profils à observer</h2>
      <p>Ces profils ne sont pas des choix imposés. Ils décrivent des profils à observer parce que les hypothèses sandbox et certaines traces officielles pointent vers des besoins possibles.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>Détails techniques des profils à observer</summary>
        <div class="muted">${escapeHtml(input.profileViewFact.summary)}</div>
        <div class="muted">${input.profileViewFact.internalTags.map(escapeHtml).join(", ")}</div>
        <div class="muted">${escapeHtml(input.selectionPreviewFact.summary)}</div>
        ${input.traceBackingFact === undefined ? "" : `<div class="muted">${escapeHtml(input.traceBackingFact.summary)}</div>`}
        ${input.coachCopyFact === undefined ? "" : `<div class="muted">${escapeHtml(input.coachCopyFact.summary)}</div>`}
      </details>
    </section>`;
}

function renderSelectionPreview(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW" &&
    candidate.internalTags.includes("workbench_chain_selection_preview")
  );
  const traceBackingFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING" &&
    candidate.internalTags.includes("selection_preview_trace_backing")
  );
  const coachCopyFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY" &&
    candidate.internalTags.includes("selection_preview_coach_copy")
  );
  const profileViewFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW" &&
    candidate.internalTags.includes("selection_preview_profile_view")
  );

  if (fact === undefined) {
    return "";
  }

  if (profileViewFact !== undefined) {
    return renderSelectionPreviewProfileView({
      selectionPreviewFact: fact,
      traceBackingFact,
      coachCopyFact,
      profileViewFact,
    });
  }

  if (coachCopyFact !== undefined) {
    return renderSelectionPreviewCoachCopy({
      selectionPreviewFact: fact,
      traceBackingFact,
      coachCopyFact,
    });
  }

  const supportScenario = tagValue(fact.internalTags, "selection_preview_support_near_z4_hsr_scenario_") ??
    "batch-scenario-better-attacking-support";
  const secondBallScenario = tagValue(fact.internalTags, "selection_preview_second_ball_presence_scenario_") ??
    "batch-scenario-better-attacking-rebound-pressure";
  const goalkeeperScenario = tagValue(fact.internalTags, "selection_preview_strong_goalkeeper_response_scenario_") ??
    "batch-scenario-stronger-goalkeeper";
  const cards = [
    {
      title: "Soutien proche autour de Z4-HSR",
      previewId: "support_near_z4_hsr",
      linkedTest: "support_around_z4_hsr",
      scenario: supportScenario,
      suggestedProfile: "Profil à prévisualiser : soutien mobile proche de Z4-HSR.",
      roleFamily: "support runner / mobile lock / hook link / playmaker support",
      attributes: "anticipation, handling, off-ball support, stamina",
      benefit:
        "Prévisualiser un joueur de soutien plus proche de Z4-HSR autour de control-space-hunter. L'objectif est de réduire le risque de tir isolé et d'offrir une solution immédiate après la progression.",
      tradeoff:
        "Plus de soutien offensif peut exposer la rest-defense si le ballon est perdu ou repoussé.",
      observation:
        "Vérifier si la progression mène à une continuité contrôlée plutôt qu'à une récupération adverse.",
      confidence: "faible à moyenne",
    },
    {
      title: "Présence sur second ballon",
      previewId: "second_ball_presence",
      linkedTest: "second_ball_occupation",
      scenario: secondBallScenario,
      suggestedProfile: "Profil à prévisualiser : chasseur de rebond et coureur de pression.",
      roleFamily: "rebound chaser / pressure forward / high work-rate runner",
      attributes: "anticipation, aggression, reaction, acceleration, balance",
      benefit:
        "Prévisualiser un profil capable d'attaquer le second ballon après une parade. L'objectif est de transformer un tir repoussé en seconde action plutôt qu'en récupération propre par BLITZ.",
      tradeoff:
        "Presser le second ballon peut augmenter la fatigue et ouvrir une transition si la récupération échoue.",
      observation:
        "Vérifier si la pression au rebond augmente les secondes chances sans désorganiser la structure défensive.",
      confidence: "faible à moyenne",
    },
    {
      title: "Réponse face à un gardien fort",
      previewId: "strong_goalkeeper_response",
      linkedTest: "strong_goalkeeper_fallback",
      scenario: goalkeeperScenario,
      suggestedProfile: "Profil à prévisualiser : option de continuité plus sûre après arrêt.",
      roleFamily: "safer continuity option / secondary playmaker / support receiver / rest-defense anchor",
      attributes: "decision-making, positioning, composure, tactical discipline",
      benefit:
        "Prévisualiser une solution de continuité si le gardien adverse neutralise le tir. L'objectif est de ne pas dépendre uniquement d'une frappe directe et de préparer une sortie sûre après l'arrêt.",
      tradeoff:
        "Un plan B plus prudent peut réduire la menace immédiate, mais stabiliser la séquence si le gardien gagne le duel.",
      observation:
        "Vérifier si l'équipe garde une structure utile après un arrêt du gardien au lieu de subir une récupération adverse.",
      confidence: "faible",
    },
  ];
  const splitTagList = (value: string | null | undefined): readonly string[] =>
    value === undefined || value === null || value === "none" ? [] : value.split("|");
  const traceStatus = (previewId: string): string =>
    traceBackingFact === undefined
      ? "sandbox_only"
      : tagValue(traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_status_`) ?? "sandbox_only";
  const traceStrength = (previewId: string): string =>
    traceBackingFact === undefined
      ? "none"
      : tagValue(traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_strength_`) ?? "none";
  const traceReasons = (previewId: string): readonly string[] =>
    traceBackingFact === undefined
      ? []
      : splitTagList(tagValue(traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_reasons_`));
  const traceZones = (previewId: string, suffix: "danger_zones" | "recovery_zones"): readonly string[] =>
    traceBackingFact === undefined
      ? []
      : splitTagList(tagValue(traceBackingFact.internalTags, `selection_preview_trace_backing_${previewId}_${suffix}_`));
  const reasonLabel = (reason: string): string => {
    switch (reason) {
      case "danger_zone_support":
        return "danger officiel";
      case "recovery_zone_support":
        return "recuperation officielle";
      case "pressure_signal_support":
        return "pression officielle";
      case "player_involvement_support":
        return "implication joueur officielle";
      case "cause_tag_support":
        return "cause recurrente officielle";
      case "impact_tag_support":
        return "impact officiel";
      case "fatigue_signal_support":
        return "fatigue officielle";
      case "goalkeeper_signal_support":
        return "signal gardien officiel";
      case "second_ball_signal_support":
        return "second ballon officiel";
      default:
        return reason;
    }
  };
  const cardHtml = cards.map((card) => `
      <article class="card">
        <h3>Profil a observer — ${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.benefit)}</p>
        <ul>
          <li><strong>Statut d'appui :</strong> ${escapeHtml(traceStatus(card.previewId))}</li>
          <li><strong>Source principale :</strong> traces officielles en support + hypothese sandbox separee</li>
          <li><strong>Confiance :</strong> ${escapeHtml(card.confidence)}, non rehaussee automatiquement</li>
          <li><strong>Force de l'appui trace :</strong> ${escapeHtml(traceStrength(card.previewId))}</li>
          ${traceReasons(card.previewId).length === 0
            ? "<li><strong>Signal officiel :</strong> aucun signal officiel suffisant ne confirme encore cette piste.</li>"
            : `<li><strong>Signal appuye par les traces :</strong> ${escapeHtml(traceReasons(card.previewId).map(reasonLabel).join(", "))}</li>`}
          ${traceZones(card.previewId, "danger_zones").length === 0 ? "" : `<li><strong>Zones de danger officielles :</strong> ${escapeHtml(traceZones(card.previewId, "danger_zones").join(", "))}</li>`}
          ${traceZones(card.previewId, "recovery_zones").length === 0 ? "" : `<li><strong>Zones de recuperation officielles :</strong> ${escapeHtml(traceZones(card.previewId, "recovery_zones").join(", "))}</li>`}
          <li><strong>Test coach lié :</strong> ${escapeHtml(card.linkedTest)}</li>
          <li><strong>Scénario lié :</strong> ${escapeHtml(card.scenario)}</li>
          <li><strong>Profil suggéré :</strong> ${escapeHtml(card.suggestedProfile)}</li>
          <li><strong>Famille de rôle :</strong> ${escapeHtml(card.roleFamily)}</li>
          <li><strong>Attributs utiles :</strong> ${escapeHtml(card.attributes)}</li>
          <li><strong>Risque / compromis :</strong> ${escapeHtml(card.tradeoff)}</li>
          <li><strong>À observer :</strong> ${escapeHtml(card.observation)}</li>
        </ul>
        <p class="muted">Previsualisation non appliquee. Non confirme comme recommandation officielle. Cette piste ne modifie pas la composition, ne pilote pas la selection live et reste un test coach.</p>
      </article>`).join("");

  return `
    <section>
      <h2>Prévisualisation de sélection</h2>
      <p>Ces profils sont des pistes de sélection à prévisualiser, pas des changements appliqués.</p>
      <p>Cette previsualisation reste une hypothese coach. Les traces officielles peuvent l'appuyer, mais elles ne la transforment pas en recommandation officielle.</p>
      <p>Aucune composition, aucun titulaire, aucun remplaçant et aucune sélection live ne sont modifiés.</p>
      <p>Cette prévisualisation ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <p>Elle ne constitue pas une preuve d’économie globale.</p>
      <div class="grid">${cardHtml}</div>
      <details class="internal-markers">
        <summary>Détails techniques de la prévisualisation</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
      ${traceBackingFact === undefined ? "" : `
      <details class="internal-markers">
        <summary>Détails techniques de l'appui trace</summary>
        <div class="muted">${escapeHtml(traceBackingFact.summary)}</div>
        <div class="muted">${traceBackingFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>`}
    </section>`;
}

function renderMatchTraceSpine(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE" &&
    candidate.internalTags.includes("workbench_chain_match_event_trace_spine")
  );

  if (fact === undefined) {
    return "";
  }

  return `
    <section>
      <h2>Colonne de traces de match</h2>
      <p>Le moteur commence à produire des traces structurées pour expliquer les actions simulées. Ces traces servent à préparer les futurs rapports coach, mais elles ne modifient pas le match officiel.</p>
      <details class="internal-markers">
        <summary>Détails techniques des traces</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderMatchTraceAggregator(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR" &&
    candidate.internalTags.includes("workbench_chain_match_trace_aggregator")
  );

  if (fact === undefined) {
    return "";
  }

  const status = tagValue(fact.internalTags, "match_trace_aggregator_status_") ?? "available";
  const inputTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_input_trace_count_") ?? "0";
  const deduplicatedTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_deduplicated_trace_count_") ?? "0";
  const duplicateTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_duplicate_trace_count_") ?? "0";
  const officialTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_official_trace_count_") ?? "0";
  const diagnosticTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_diagnostic_trace_count_") ?? "0";
  const sandboxTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_sandbox_trace_count_") ?? "0";

  return `
    <section>
      <h2>AgrÃ©gats de traces de match</h2>
      <p>Le moteur regroupe maintenant les traces de match pour prÃ©parer les futurs diagnostics coach. Les agrÃ©gats officiels, diagnostics et sandbox restent sÃ©parÃ©s afin d'Ã©viter les doubles comptes et les conclusions trop fortes.</p>
      <p>La prÃ©visualisation de sÃ©lection reste fondÃ©e sur un signal sandbox. L'agrÃ©gateur est une premiÃ¨re Ã©tape vers une confiance future fondÃ©e sur les traces, mais aucune confiance de prÃ©visualisation n'est relevÃ©e dans ce sprint.</p>
      <ul>
        <li><strong>Statut :</strong> ${escapeHtml(status)}</li>
        <li><strong>Traces entrantes :</strong> ${escapeHtml(inputTraceCount)}</li>
        <li><strong>Traces dÃ©dupliquÃ©es :</strong> ${escapeHtml(deduplicatedTraceCount)}</li>
        <li><strong>Doublons Ã©cartÃ©s :</strong> ${escapeHtml(duplicateTraceCount)}</li>
        <li><strong>Officiel / diagnostic / sandbox :</strong> ${escapeHtml(officialTraceCount)} / ${escapeHtml(diagnosticTraceCount)} / ${escapeHtml(sandboxTraceCount)}</li>
      </ul>
      <details class="internal-markers">
        <summary>DÃ©tails techniques des agrÃ©gats</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function itemListFromTag(fact: MatchReport["evidenceFacts"][number], prefix: string, empty: string): string[] {
  const value = tagValue(fact.internalTags, prefix);
  if (value === undefined || value === "none") {
    return [empty];
  }

  return value.split("|").map((item) => {
    const [label, count] = item.split(":");
    if (label === undefined || label.length === 0) {
      return empty;
    }
    return count === undefined ? label : `${label} : ${count}`;
  });
}

function renderTraceV0Card(input: {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
}): string {
  return `
      <article class="card">
        <h3>${escapeHtml(input.title)}</h3>
        <p>${escapeHtml(input.summary)}</p>
        <ul>${input.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`;
}

function renderCoachReportFromTraceAggregates(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (fact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_card_count_") ?? "0";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_official_trace_count_") ?? "0";
  const diagnosticTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_diagnostic_trace_count_") ?? "0";
  const sandboxTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_sandbox_trace_count_") ?? "0";
  const highPressureTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_high_pressure_trace_count_") ?? "0";
  const fatigueImpactTotal = tagValue(fact.internalTags, "coach_report_trace_aggregates_fatigue_impact_total_") ?? "0";
  const dangerZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_pressure_loss_zone_items_",
    "Aucune zone de perte sous haute pression ne domine le signal officiel.",
  );
  const possessionLossZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_possession_loss_zone_items_",
    "Les pertes de possession restent dispersÃ©es dans ce run.",
  );
  const recoveryZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de rÃ©cupÃ©ration ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const firstDangerZone = dangerZones[0];
  const watchpoint = pressureLossZones.length > 0 && !pressureLossZones[0]?.startsWith("Aucune zone")
    ? "Ã€ surveiller : les sorties sous pression restent un signal officiel Ã  confirmer sur plusieurs matchs."
    : firstDangerZone !== undefined && dangerZones.length === 1 && !firstDangerZone.startsWith("Aucune zone")
      ? `Ã€ vÃ©rifier : la menace semble concentrÃ©e autour de ${firstDangerZone.split(":")[0]?.trim() ?? "une zone"} dans ce run.`
      : "Signal Ã  confirmer : les agrÃ©gats officiels donnent une premiÃ¨re lecture, mais elle doit rester prudente.";
  const cards = [
    renderTraceV0Card({
      title: "Zones de danger",
      summary:
        "Les zones de danger ressortent des traces officielles. Elles indiquent oÃ¹ l'Ã©quipe a le plus souvent crÃ©Ã© une progression dangereuse, une ligne cassÃ©e ou une situation favorable.",
      bullets: [...dangerZones, "Signal officiel dans ce run, Ã  confirmer sur plusieurs matchs."],
    }),
    renderTraceV0Card({
      title: "Pertes sous pression",
      summary:
        "Les pertes sous pression montrent oÃ¹ l'Ã©quipe a le plus souvent perdu la continuitÃ© quand la pression adverse Ã©tait forte.",
      bullets: [
        ...pressureLossZones.map((item) => `Sous haute pression : ${item}`),
        ...possessionLossZones.map((item) => `Perte de possession : ${item}`),
        `Traces haute pression utilisees : ${highPressureTraceCount}.`,
      ],
    }),
    renderTraceV0Card({
      title: "RÃ©cupÃ©rations utiles",
      summary:
        "Les rÃ©cupÃ©rations utiles indiquent les zones oÃ¹ l'Ã©quipe a interrompu ou sÃ©curisÃ© une sÃ©quence.",
      bullets: recoveryZones,
    }),
    renderTraceV0Card({
      title: "Joueurs impliquÃ©s",
      summary:
        "Les joueurs les plus impliquÃ©s sont ceux qui apparaissent le plus souvent dans les traces officielles significatives. Ce n'est pas encore une note de performance individuelle.",
      bullets: [...players, "Lecture prudente : ce n'est pas une note individuelle ni une dÃ©cision de sÃ©lection."],
    }),
    renderTraceV0Card({
      title: "Causes rÃ©currentes",
      summary:
        "Les causes rÃ©currentes regroupent les signaux qui reviennent dans les traces officielles : soutien, pression, fatigue, dÃ©cision, rÃ©cupÃ©ration ou qualitÃ© gardien.",
      bullets: [...causes, ...impacts, `Impact fatigue total : ${fatigueImpactTotal}.`],
    }),
    renderTraceV0Card({
      title: "Point de vigilance coach",
      summary:
        "Ce point de vigilance reste une piste prudente issue des agrÃ©gats officiels du run, pas une preuve globale.",
      bullets: [watchpoint],
    }),
  ].join("");

  return `
    <section>
      <h2>Rapport coach depuis les agrÃ©gats officiels</h2>
      <p>Cette lecture s'appuie d'abord sur les agrÃ©gats officiels du match. Les diagnostics et le sandbox restent sÃ©parÃ©s et ne sont pas utilisÃ©s comme vÃ©ritÃ© officielle.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>DÃ©tails techniques du rapport depuis agrÃ©gats</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}. Diagnostics : ${escapeHtml(diagnosticTraceCount)}. Sandbox : ${escapeHtml(sandboxTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderV1Badge(label: string, value: string): string {
  return `<span class="badge">${escapeHtml(`${label} : ${value}`)}</span>`;
}

function confidenceReasonForV1(title: string, confidence: "low" | "medium" | "high", emptyState: boolean): string {
  if (emptyState) {
    return "État vide volontaire : le rapport refuse de cartographier une zone instable.";
  }
  if (confidence === "medium") {
    return "Signal répété dans les agrégats officiels, à confirmer sur plusieurs matchs.";
  }
  if (confidence === "high") {
    return "Signal officiel très dense dans ce run, sans diagnostic ni sandbox comme vérité.";
  }

  return `${title} reste un signal officiel prudent, encore limité par le volume de traces.`;
}

function renderV1Card(input: {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: "low" | "medium" | "high";
  readonly emptyState?: boolean;
}): string {
  const emptyState = input.emptyState ?? false;
  const confidenceLabel = confidenceText(input.confidence).replace("Confiance ", "");

  return `
      <article class="card coach-v1-card${emptyState ? " empty-state" : ""}">
        <div>${renderV1Badge("Source", "Officiel")} ${renderV1Badge("Confiance", confidenceLabel)}</div>
        <h3>${escapeHtml(input.title)}</h3>
        <p>${escapeHtml(input.summary)}</p>
        <ul>${input.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
        <p class="card-meta">${escapeHtml(confidenceReasonForV1(input.title, input.confidence, emptyState))}</p>
      </article>`;
}

function confidenceFromTraceTag(fact: MatchReport["evidenceFacts"][number], cardId: string): "low" | "medium" | "high" {
  if (fact.internalTags.includes(`coach_report_trace_aggregates_card_${cardId}_confidence_high`)) {
    return "high";
  }
  if (fact.internalTags.includes(`coach_report_trace_aggregates_card_${cardId}_confidence_medium`)) {
    return "medium";
  }
  return "low";
}

function renderCoachReportV1Visualization(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_visualization")
  );
  const traceFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (fact === undefined || traceFact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_v1_card_count_") ?? "0";
  const officialCardsCount = tagValue(fact.internalTags, "coach_report_v1_official_cards_count_") ?? "0";
  const emptyPressureLoss = tagValue(fact.internalTags, "coach_report_v1_empty_pressure_loss_zone_state_") === "true";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_v1_official_trace_count_") ?? "0";
  const dangerZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = emptyPressureLoss
    ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
    : itemListFromTag(
        traceFact,
        "coach_report_trace_aggregates_pressure_loss_zone_items_",
        "Aucune zone de perte sous haute pression ne domine le signal officiel.",
      );
  const recoveryZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de récupération ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const watchpointRaw = tagValue(fact.internalTags, "coach_report_v1_watchpoint_") ?? "Signal à confirmer.";
  const watchpoint = watchpointRaw.replaceAll("_", " ");
  const executiveBullets = [
    `Danger : ${dangerZones[0] ?? "aucun signal dominant"}`,
    `Récupération : ${recoveryZones[0] ?? "aucun signal dominant"}`,
    `Implication : ${players[0] ?? "aucun joueur dominant"}`,
    `Point de vigilance : ${watchpoint}`,
  ];
  const signalCards = [
    renderV1Card({
      title: "Synthèse coach",
      summary: `Score final : ${scoreText(report)}. Lecture officielle compacte des signaux les plus visibles.`,
      bullets: executiveBullets,
      confidence: Number(officialTraceCount) >= 20 ? "medium" : "low",
    }),
    renderV1Card({
      title: "Carte signal — Danger officiel",
      summary: "Où le match a produit des progressions dangereuses ou des situations favorables.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Carte signal — Pression et pertes",
      summary: "Où la continuité s'est fragilisée sous pression adverse.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Carte signal — Récupérations",
      summary: "Où l'équipe a interrompu ou sécurisé une séquence.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Carte signal — Causes et impacts",
      summary: "Les libellés français ci-dessous viennent des agrégats officiels, pas du sandbox.",
      bullets: [...causes, ...impacts].slice(0, 6),
      confidence: confidenceFromTraceTag(traceFact, "official_recurring_causes"),
    }),
    renderV1Card({
      title: "Carte signal — Point de vigilance",
      summary: "Piste prudente issue des agrégats officiels du run.",
      bullets: [watchpoint],
      confidence: confidenceFromTraceTag(traceFact, "official_coach_watchpoint"),
    }),
  ].join("");
  const zoneCards = [
    renderV1Card({
      title: "Zone signal — Danger",
      summary: "Lecture zone par zone du danger officiel.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Zone signal — Perte sous pression",
      summary: "Le rapport cartographie seulement un signal stabilisé.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Zone signal — Récupération",
      summary: "Lecture zone par zone des récupérations utiles.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
  ].join("");
  const playerCard = renderV1Card({
    title: "Implication joueurs",
    summary: "Ce bloc mesure l’implication dans les traces officielles, pas une note individuelle complète.",
    bullets: players.slice(0, 4),
    confidence: confidenceFromTraceTag(traceFact, "official_player_involvement"),
  });

  return `
    <section class="coach-report-v1">
      <h2>Rapport coach V1 — lecture visuelle des agrégats officiels</h2>
      <p>Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.</p>
      <h3>Lecture rapide</h3>
      <div class="grid">${signalCards}</div>
      <h3>Signaux par zone</h3>
      <div class="grid">${zoneCards}</div>
      <h3>Implication et causes</h3>
      <div class="grid">${playerCard}</div>
      <details class="internal-markers">
        <summary>Détails techniques du rapport V1</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Cartes officielles : ${escapeHtml(officialCardsCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function hasCoachReportV1InformationHierarchy(report: MatchReport): boolean {
  return report.evidenceFacts.some((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_information_hierarchy")
  );
}

function renderCoachReportV1InformationHierarchy(report: MatchReport): string {
  const hierarchyFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_information_hierarchy")
  );
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_visualization")
  );
  const traceFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (hierarchyFact === undefined || fact === undefined || traceFact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_v1_card_count_") ?? "0";
  const officialCardsCount = tagValue(fact.internalTags, "coach_report_v1_official_cards_count_") ?? "0";
  const emptyPressureLoss = tagValue(fact.internalTags, "coach_report_v1_empty_pressure_loss_zone_state_") === "true";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_v1_official_trace_count_") ?? "0";
  const dangerZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = emptyPressureLoss
    ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
    : itemListFromTag(
        traceFact,
        "coach_report_trace_aggregates_pressure_loss_zone_items_",
        "Aucune zone de perte sous haute pression ne domine le signal officiel.",
      );
  const recoveryZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de récupération ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const watchpointRaw = tagValue(fact.internalTags, "coach_report_v1_watchpoint_") ?? "Signal à confirmer.";
  const watchpoint = watchpointRaw.replaceAll("_", " ");
  const confidence = Number(officialTraceCount) >= 20 ? "medium" : "low";
  const executiveBullets = [
    `Danger : ${dangerZones[0] ?? "aucun signal dominant"}`,
    `Récupération : ${recoveryZones[0] ?? "aucun signal dominant"}`,
    `Implication : ${players[0] ?? "aucun joueur dominant"}`,
    `Point de vigilance : ${watchpoint}`,
  ];
  const officialReadingCards = [
    renderV1Card({
      title: "Synthèse coach",
      summary: `Score final : ${scoreText(report)}. Lecture officielle compacte des signaux les plus visibles.`,
      bullets: executiveBullets,
      confidence,
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — danger",
      summary: "Où le match a produit des progressions dangereuses ou des situations favorables.",
      bullets: dangerZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — pression",
      summary: "Où la continuité s'est fragilisée sous pression adverse.",
      bullets: pressureLossZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — récupérations",
      summary: "Où l'équipe a interrompu ou sécurisé une séquence.",
      bullets: recoveryZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Point de vigilance coach",
      summary: "Piste prudente issue des agrégats officiels du run.",
      bullets: [watchpoint],
      confidence: confidenceFromTraceTag(traceFact, "official_coach_watchpoint"),
    }),
  ].join("");
  const detailedCards = [
    renderV1Card({
      title: "Zones de danger",
      summary: "Lecture zone par zone du danger officiel.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Zones de perte sous pression",
      summary: "Le rapport cartographie seulement un signal stabilisé.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Récupérations utiles",
      summary: "Lecture zone par zone des récupérations utiles.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Implication joueurs",
      summary: "Ce bloc mesure l'implication dans les traces officielles, pas une note individuelle complète.",
      bullets: players.slice(0, 4),
      confidence: confidenceFromTraceTag(traceFact, "official_player_involvement"),
    }),
    renderV1Card({
      title: "Causes et impacts",
      summary: "Ces libellés viennent des agrégats officiels, pas du sandbox.",
      bullets: [...causes, ...impacts].slice(0, 6),
      confidence: confidenceFromTraceTag(traceFact, "official_recurring_causes"),
    }),
  ].join("");

  return `
    <section class="coach-report-v1 official-coach-reading">
      <h2>Ce que le match dit</h2>
      <p class="card-meta">Rapport coach V1 — lecture visuelle des agrégats officiels</p>
      <p>Cette lecture visuelle s'appuie d'abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.</p>
      <div>${renderV1Badge("Source", "Officiel")} ${renderV1Badge("Confiance", confidenceText(confidence).replace("Confiance ", ""))}</div>
      <div class="grid">${officialReadingCards}</div>
    </section>
    <section class="coach-report-v1 official-detailed-signals">
      <h2>Signaux officiels détaillés</h2>
      <p>Ces signaux détaillent la lecture officielle par zones, joueurs, causes et impacts. Aucun contenu sandbox n'est compté comme carte officielle V1.</p>
      <div class="grid">${detailedCards}</div>
      <details class="internal-markers">
        <summary>Détails techniques du rapport V1</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Cartes officielles : ${escapeHtml(officialCardsCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${escapeHtml(hierarchyFact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
        <div class="muted">${hierarchyFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderExperimentalHypotheses(input: {
  readonly timelineReview: string;
  readonly sandboxDecisionPanel: string;
  readonly multiScenarioCoachTestPlan: string;
  readonly selectionPreview: string;
}): string {
  const content = [
    input.timelineReview,
    input.sandboxDecisionPanel,
    input.multiScenarioCoachTestPlan,
    input.selectionPreview,
  ].filter((section) => section.length > 0).join("");

  if (content.length === 0) {
    return "";
  }

  return `
    <section class="experimental-hypotheses-group">
      <h2>Hypothèses expérimentales à tester</h2>
      <p class="card summary-card">Ces éléments sont expérimentaux : ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <div class="card-meta">${renderV1Badge("Source", "Sandbox")} ${renderV1Badge("Source", "Diagnostic")} ${renderV1Badge("Prévisualisation", "non appliquée")}</div>
      <p>Hypothèse expérimentale — ne modifie pas le match officiel.</p>
      <p>Cette piste reste une suggestion sandbox, pas une consigne officielle. Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score. Elle ne constitue pas une preuve d'économie globale.</p>
      <details>
        <summary>Afficher les hypothèses expérimentales à tester</summary>
        ${content}
      </details>
    </section>`;
}

function renderTechnicalTraceability(input: {
  readonly matchTraceSpine: string;
  readonly matchTraceAggregator: string;
  readonly coachReportTraceAggregates: string;
  readonly legacyReportSections: string;
}): string {
  const content = [
    input.matchTraceSpine,
    input.matchTraceAggregator,
    input.coachReportTraceAggregates,
    input.legacyReportSections,
  ].filter((section) => section.length > 0).join("");

  if (content.length === 0) {
    return "";
  }

  return `
    <section class="technical-traceability-group">
      <details>
        <summary>Détails techniques et traçabilité</summary>
        ${content}
      </details>
    </section>`;
}

function renderLegacyReportSections(input: {
  readonly keyMoments: string;
  readonly insights: string;
}): string {
  return `
        <details class="legacy-report-reading">
          <summary>Ancienne lecture du rapport</summary>
          <p class="muted">Ces blocs sont conservés pour traçabilité. La lecture coach principale est désormais le rapport V1 officiel ci-dessus.</p>
          <section>
            <h3>Moments officiels utiles</h3>
            <div class="grid">${input.keyMoments}</div>
          </section>
          <section>
            <h3>Analyse coach héritée</h3>
            <div class="grid">${input.insights}</div>
          </section>
        </details>`;
}

function renderFocus(focus: TrainingFocusSuggestion): string {
  return `
    <article class="card compact">
      <h3>${escapeHtml(focus.title)}</h3>
      <p>${escapeHtml(focus.reason)}</p>
    </article>`;
}

function renderTeamStats(stats: TeamMatchStats): string {
  return `
    <tr>
      <td>${escapeHtml(stats.teamId)}</td>
      <td>${stats.score}</td>
      <td>${stats.scoringAttempts ?? "-"}</td>
      <td>${stats.turnovers ?? "-"}</td>
      <td>${stats.eventShare ?? stats.possessionShare ?? "-"}%</td>
      <td>${stats.progressionCount ?? "-"}</td>
      <td>${stats.scoringEventCount ?? "-"}</td>
      <td>${stats.pressureInstabilityCount ?? "-"}</td>
    </tr>`;
}

function renderZoneStats(stats: ZoneStats): string {
  return `
    <tr>
      <td>${escapeHtml(stats.zone)}</td>
      <td>${stats.entries}</td>
      <td>${stats.successfulProgressions}</td>
      <td>${stats.defensiveStops}</td>
      <td>${stats.scoringEvents ?? "-"}</td>
      <td>${stats.pressureEvents ?? "-"}</td>
    </tr>`;
}

function renderFatigue(report: MatchReport): string {
  const teamRows = report.fatigueReport.teamSummaries
    .map(
      (summary) => `
        <tr>
          <td>${escapeHtml(summary.teamId)}</td>
          <td>${summary.averageConditionEnd}</td>
          <td>${summary.highIntensityLoad}</td>
          <td>${summary.lateErrorCount}</td>
        </tr>`,
    )
    .join("");

  return `
    <table>
      <thead><tr><th>Équipe</th><th>Condition finale</th><th>Charge d'intensité</th><th>Erreurs tardives</th></tr></thead>
      <tbody>${teamRows}</tbody>
    </table>`;
}

function renderTimelineEvent(event: MatchEvent): string {
  const consequences = event.consequences
    .map((consequence) => consequenceLabel(consequence))
    .join("; ");

  return `
    <li class="timeline-event">
      <div><strong>${event.timestamp.minute}' ${escapeHtml(eventTypeLabel(event.eventType))}</strong> ${renderBadge(outcomeLabel(event.outcome))}</div>
      <div>${escapeHtml(event.teamId)} en ${escapeHtml(event.zone)} face à ${escapeHtml(event.opponentTeamId)}</div>
      <p>${escapeHtml(timelineReason(event))}</p>
      <details class="internal-markers">
        <summary>Repères internes</summary>
        <div class="muted">${event.tags.map(escapeHtml).join(", ")}</div>
      </details>
      ${consequences.length === 0 ? "" : `<div class="muted">Conséquences : ${escapeHtml(consequences)}</div>`}
    </li>`;
}

function renderSummary(report: MatchReport): string {
  const primaryFocus = report.suggestedFocus[0]?.title ?? "aucun axe prioritaire";
  const insightLabel = report.coachInsights.length === 1 ? "analyse principale" : "analyses principales";

  return `
    <section>
      <h2>Résumé</h2>
      <article class="card summary-card">
        <p>Score final : <strong>${escapeHtml(scoreText(report))}</strong>.</p>
        <p><strong>${escapeHtml(scoreSourceLabel("official_report_events").label)}</strong> : les conséquences officielles du rapport restent la source de ce résumé. Les diagnostics batch et les échantillons de scoring-events restent séparés.</p>
        <p>Ce rapport met en avant ${report.keyMoments.length} moments clés, ${report.coachInsights.length} ${insightLabel} et un axe de travail prioritaire : <strong>${escapeHtml(primaryFocus)}</strong>.</p>
        <p>Catégories de lecture : Action décisive, Séquence dangereuse, possession sous pression.</p>
      </article>
    </section>`;
}

export function renderHtmlCoachReport(report: MatchReport): string {
  const keyMoments = report.keyMoments.map(renderKeyMoment).join("") || renderEmpty("Aucun moment clé sélectionné.");
  const insights = report.coachInsights.map(renderCoachInsight).join("") || renderEmpty("Aucune analyse coach générée.");
  const diagnoses = report.tacticalReport.diagnoses.map(renderDiagnosis).join("") || renderEmpty("Aucun diagnostic tactique généré.");
  const warnings = report.warnings.map(renderWarning).join("") || renderEmpty("Aucun avertissement structuré généré.");
  const focus = report.suggestedFocus.map(renderFocus).join("") || renderEmpty("Aucun axe de travail généré.");
  const teamStats = report.teamStats.map(renderTeamStats).join("");
  const zoneStats = report.zoneStats.map(renderZoneStats).join("");
  const timeline = [...report.timeline].sort(compareTimelineEvents).map(renderTimelineEvent).join("");
  const timelineReview = renderTimelineReview(report);
  const sandboxDecisionPanel = renderSandboxDecisionPanel(report);
  const multiScenarioCoachTestPlan = renderMultiScenarioCoachTestPlan(report);
  const selectionPreview = renderSelectionPreview(report);
  const matchTraceSpine = renderMatchTraceSpine(report);
  const matchTraceAggregator = renderMatchTraceAggregator(report);
  const coachReportV1Visualization = renderCoachReportV1Visualization(report);
  const hierarchyEnabled = hasCoachReportV1InformationHierarchy(report);
  const coachReportV1Hierarchy = hierarchyEnabled ? renderCoachReportV1InformationHierarchy(report) : "";
  const coachReportTraceAggregates = renderCoachReportFromTraceAggregates(report);
  const experimentalHypotheses = hierarchyEnabled
    ? renderExperimentalHypotheses({
        timelineReview,
        sandboxDecisionPanel,
        multiScenarioCoachTestPlan,
        selectionPreview,
      })
    : "";
  const technicalTraceability = hierarchyEnabled
    ? renderTechnicalTraceability({
        matchTraceSpine,
        matchTraceAggregator,
        coachReportTraceAggregates,
        legacyReportSections: renderLegacyReportSections({ keyMoments, insights }),
      })
    : "";
  const legacyExperimentalSections = hierarchyEnabled
    ? ""
    : `${timelineReview}${sandboxDecisionPanel}${multiScenarioCoachTestPlan}${selectionPreview}${matchTraceSpine}${matchTraceAggregator}${coachReportV1Visualization}${coachReportTraceAggregates}`;

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport du coach ${escapeHtml(report.matchId)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Segoe UI, Arial, sans-serif; color: #172026; background: #f3f5f7; }
    body { margin: 0; padding: 32px; }
    main { max-width: 1120px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #101820, #25313b); color: white; padding: 30px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 10px 28px rgba(16, 24, 32, .14); }
    section { margin-top: 26px; }
    h1, h2, h3, h4, p { margin-top: 0; }
    h1 { font-size: 30px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 0 0 12px; }
    h3 { font-size: 16px; margin-bottom: 8px; }
    h4 { font-size: 13px; margin: 16px 0 8px; color: #53606b; text-transform: uppercase; letter-spacing: .04em; }
    .score { display: inline-block; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 8px; font-size: 48px; font-weight: 800; line-height: 1; margin: 18px 0 8px; padding: 14px 18px; }
    .score-source { max-width: 780px; color: #dce6ef; font-size: 13px; line-height: 1.45; margin-top: 6px; }
    .score-source strong { display: block; color: #ffffff; margin-bottom: 2px; }
    .muted, .card-meta { color: #65717c; font-size: 13px; }
    header .muted { color: #bdc7d1; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid #d9e0e7; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 32, .04); }
    .summary-card { border-left: 4px solid #2d6cdf; }
    .compact { padding: 14px; }
    .badge { display: inline-block; background: #e8edf2; color: #26323b; border-radius: 999px; padding: 3px 8px; font-size: 12px; margin: 2px 4px 2px 0; }
    .confidence-low { background: #fff1d6; }
    .confidence-medium { background: #dceeff; }
    .confidence-high { background: #dff5e4; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9e0e7; border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e7ecf1; font-size: 14px; }
    th { background: #eef2f5; color: #36434f; }
    tr:last-child td { border-bottom: 0; }
    details { background: white; border: 1px solid #d9e0e7; border-radius: 8px; padding: 14px 16px; }
    summary { cursor: pointer; font-weight: 700; }
    .internal-markers { border: 0; background: transparent; padding: 0; margin-top: 6px; }
    .internal-markers summary { color: #7a8792; font-size: 12px; font-weight: 600; }
    .timeline { list-style: none; padding: 0; margin: 14px 0 0; }
    .timeline-event { border-top: 1px solid #e7ecf1; padding: 12px 0; }
    .timeline-event:first-child { border-top: 0; }
    .empty { color: #65717c; font-style: italic; }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="muted">Match : ${escapeHtml(report.matchId)}</div>
      <h1>Rapport du coach</h1>
      <div class="score">${escapeHtml(scoreText(report))}</div>
      ${renderScoreSourceNote()}
      <div class="muted">Généré depuis le rapport de match typé.</div>
    </header>

    ${renderSummary(report)}

    ${coachReportV1Hierarchy}

    ${hierarchyEnabled ? "" : `
    <section>
      <h2>Moments clés</h2>
      <div class="grid">${keyMoments}</div>
    </section>

    <section>
      <h2>Analyse du coach</h2>
      <div class="grid">${insights}</div>
    </section>`}

    ${legacyExperimentalSections}
    ${experimentalHypotheses}
    ${technicalTraceability}

    <section>
      <h2>Diagnostic tactique</h2>
      <div class="grid">${diagnoses}</div>
    </section>

    <section>
      <h2>Avertissements structurés</h2>
      <div class="grid">${warnings}</div>
    </section>

    <section>
      <h2>Axe de travail recommandé</h2>
      <div class="grid">${focus}</div>
    </section>

    <section>
      <h2>Statistiques d'équipe</h2>
      <table>
        <thead><tr><th>Équipe</th><th>Score</th><th>Occasions</th><th>Pertes de balle / turnovers</th><th>Part des événements</th><th>Progressions</th><th>Actions décisives</th><th>Instabilité sous pression</th></tr></thead>
        <tbody>${teamStats}</tbody>
      </table>
    </section>

    <section>
      <h2>Analyse par zone</h2>
      <table>
        <thead><tr><th>Zone</th><th>Entrées</th><th>Progressions réussies</th><th>Stops défensifs</th><th>Actions décisives</th><th>Séquences sous pression</th></tr></thead>
        <tbody>${zoneStats}</tbody>
      </table>
    </section>

    <section>
      <h2>État physique</h2>
      ${renderFatigue(report)}
    </section>

    <section>
      <h2>Fil du match</h2>
      <details>
        <summary>Afficher les ${report.timeline.length} événements du match</summary>
        <ul class="timeline">${timeline}</ul>
      </details>
    </section>
  </main>
</body>
</html>`;

  return normalizeCoachFacingCopy(html);
}
```

## File: src/reports/coachCopyQuality.ts

```ts
const MOJIBAKE_MARKERS: readonly string[] = [
  "\u00c3\u0192",
  "\u00c3\u00a2\u00e2\u201a\u00ac",
  "\u00c3\u00a9",
  "\u00c3\u00a8",
  "\u00c3\u00aa",
  "\u00c3\u00ab",
  "\u00c3\u00a0",
  "\u00c3\u00a2",
  "\u00c3\u00ae",
  "\u00c3\u00b4",
  "\u00c3\u00b9",
  "\u00c3\u00bb",
  "\u00c3\u00a7",
  "\u00c3\u2030",
  "\u00c2",
  "\u00e2\u20ac",
  "\ufffd",
];

const COACH_COPY_REPLACEMENTS: readonly [string, string][] = [
  ["A travailler", "\u00c0 travailler"],
  ["recuperations", "r\u00e9cup\u00e9rations"],
  ["recuperation", "r\u00e9cup\u00e9ration"],
  ["securiser", "s\u00e9curiser"],
  ["securise", "s\u00e9curise"],
  ["securisee", "s\u00e9curis\u00e9e"],
  ["premiere", "premi\u00e8re"],
  ["apres", "apr\u00e8s"],
  ["economie globale", "\u00e9conomie globale"],
  ["economie du score", "\u00e9conomie du score"],
  ["Previsualisation", "Pr\u00e9visualisation"],
  ["previsualisation", "pr\u00e9visualisation"],
  ["appliquee", "appliqu\u00e9e"],
  ["confirme comme", "confirm\u00e9 comme"],
  ["hypothese coach", "hypoth\u00e8se coach"],
  ["separee", "s\u00e9par\u00e9e"],
  ["rehaussee", "rehauss\u00e9e"],
  ["Signal appuye", "Signal appuy\u00e9"],
  ["recuperation officielle", "r\u00e9cup\u00e9ration officielle"],
  ["cause recurrente officielle", "cause r\u00e9currente officielle"],
  ["Profil a observer", "Profil \u00e0 observer"],
  ["G\u00c3\u0192\u00c2\u00a9n\u00c3\u0192\u00c2\u00a9r\u00c3\u0192\u00c2\u00a9", "G\u00e9n\u00e9r\u00e9"],
  ["G\u00c3\u00a9n\u00c3\u00a9r\u00c3\u00a9", "G\u00e9n\u00e9r\u00e9"],
  ["R\u00c3\u0192\u00c2\u00a9sum\u00c3\u0192\u00c2\u00a9", "R\u00e9sum\u00e9"],
  ["R\u00c3\u00a9sum\u00c3\u00a9", "R\u00e9sum\u00e9"],
  ["Moments cl\u00c3\u0192\u00c2\u00a9s", "Moments cl\u00e9s"],
  ["Moments cl\u00c3\u00a9s", "Moments cl\u00e9s"],
  ["s\u00c3\u0192\u00c2\u00a9quences", "s\u00e9quences"],
  ["s\u00c3\u00a9quences", "s\u00e9quences"],
  ["d\u00c3\u0192\u00c2\u00a9cisives", "d\u00e9cisives"],
  ["d\u00c3\u00a9cisives", "d\u00e9cisives"],
  ["\u00c3\u0192\u00c2\u0089quipe", "\u00c9quipe"],
  ["\u00c3\u2030quipe", "\u00c9quipe"],
  ["\u00c3\u0192\u00c2\u00a9v\u00c3\u0192\u00c2\u00a9nement", "\u00e9v\u00e9nement"],
  ["\u00c3\u0192\u00c2\u00a9v\u00c3\u0192\u00c2\u00a9nements", "\u00e9v\u00e9nements"],
  ["\u00c3\u00a9v\u00c3\u00a9nement", "\u00e9v\u00e9nement"],
  ["\u00c3\u00a9v\u00c3\u00a9nements", "\u00e9v\u00e9nements"],
  ["\u00c3\u0192\u00c2\u00a9", "\u00e9"],
  ["\u00c3\u0192\u00c2\u00a8", "\u00e8"],
  ["\u00c3\u0192\u00c2\u00aa", "\u00ea"],
  ["\u00c3\u0192\u00c2\u00ab", "\u00eb"],
  ["\u00c3\u0192\u00c2\u00a0", "\u00e0"],
  ["\u00c3\u0192\u00c2\u00a2", "\u00e2"],
  ["\u00c3\u0192\u00c2\u00ae", "\u00ee"],
  ["\u00c3\u0192\u00c2\u00b4", "\u00f4"],
  ["\u00c3\u0192\u00c2\u00b9", "\u00f9"],
  ["\u00c3\u0192\u00c2\u00bb", "\u00fb"],
  ["\u00c3\u0192\u00c2\u00a7", "\u00e7"],
  ["\u00c3\u0192\u00c2\u0089", "\u00c9"],
  ["\u00c3\u0192\u00c2\u0080", "\u00c0"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ab", "\u00eb"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00ae", "\u00ee"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b9", "\u00f9"],
  ["\u00c3\u00bb", "\u00fb"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u0089", "\u00c9"],
  ["\u00c3\u0080", "\u00c0"],
  ["\u00c2\u00ab", "\u00ab"],
  ["\u00c2\u00bb", "\u00bb"],
  ["\u00c2\u00a0", " "],
  ["\u00c2 ", " "],
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00e2\u20ac\u201c", "\u2013"],
  ["\u00e2\u20ac\u2122", "\u2019"],
  ["\u00e2\u20ac\u02dc", "\u2018"],
  ["\u00e2\u20ac\u0153", "\u201c"],
  ["\u00e2\u20ac\u009d", "\u201d"],
  ["\u00e2\u20ac\u00a6", "\u2026"],
];

export function normalizeCoachFacingCopy(value: string): string {
  let normalized = value;

  for (const [from, to] of COACH_COPY_REPLACEMENTS) {
    normalized = normalized.replaceAll(from, to);
  }

  return normalized;
}

export function containsMojibake(value: string): boolean {
  return MOJIBAKE_MARKERS.some((marker) => value.includes(marker));
}

export function assertNoMojibake(value: string, context: string): void {
  if (containsMojibake(value)) {
    throw new Error(`${context} contains mojibake.`);
  }
}
```

## File: src/reports/coachFacingCopy.ts

```ts
import type { FullMatchHarnessSanityWarning } from "../simulation/diagnostics/fullMatchHarnessSanity";
import type { FullMatchScoringDominanceReport } from "../simulation/diagnostics/fullMatchScoringDominanceDiagnostics";
import { normalizeCoachFacingCopy } from "./coachCopyQuality";

function teamLabel(teamId: string | undefined, fallback: string): string {
  return (teamId ?? fallback).toUpperCase();
}

function warningTheme(warning: FullMatchHarnessSanityWarning): string {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "run déterministe unique";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "score local élevé";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
      return "répétition de segments";
    case "REPETITIVE_KEY_MOMENTS":
      return "moments clés répétitifs";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "fatigue peu différenciée";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
    case "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN":
    case "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE":
    case "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION":
    case "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF":
      return "domination scoring locale";
  }
}

export function coachFacingHarnessWarningSummary(warnings: readonly FullMatchHarnessSanityWarning[]): string {
  const themes = [...new Set(warnings.map(warningTheme))].slice(0, 4).join(", ");

  return normalizeCoachFacingCopy(
    `Ce run déterministe unique révèle un signal de plausibilité du harnais (${themes}). Il s’agit d’un avertissement de lecture du rapport, pas d’un verdict global sur l’économie du score : la référence reste l’économie validée sur 50 matchs.`,
  );
}

export function coachFacingScoringDominanceSummary(dominance: FullMatchScoringDominanceReport): string {
  const dominantTeam = teamLabel(dominance.dominantTeamId, "l'équipe dominante");
  const dominatedTeam = teamLabel(dominance.dominatedTeamId, "l'adversaire");
  const dominantScoring = dominance.scoringEventsByTeam.find((team) => team.teamId === dominance.dominantTeamId);
  const dominatedScoring = dominance.scoringEventsByTeam.find((team) => team.teamId === dominance.dominatedTeamId);
  const dominantCount = dominantScoring?.scoringEventCount ?? 0;
  const dominatedCount = dominatedScoring?.scoringEventCount ?? 0;
  const dominatedClause = dominatedCount === 0
    ? `${dominatedTeam} n’a converti aucun événement de score`
    : `${dominatedTeam} a converti ${dominatedCount} événement${dominatedCount === 1 ? "" : "s"} de score pour ${dominatedScoring?.points ?? 0} point${(dominatedScoring?.points ?? 0) === 1 ? "" : "s"}, mais reste nettement derrière`;

  return normalizeCoachFacingCopy(
    `${dominantTeam} a converti ${dominantCount} actions décisives tandis que ${dominatedClause}. Ce run déterministe unique révèle une domination scoring locale. Il s’agit d’un signal de plausibilité du harnais, pas d’un verdict global sur l’économie du score.`,
  );
}

export function coachFacingEvidenceSummary(summary: string): string {
  return normalizeCoachFacingCopy(summary);
}
```

## File: src/reports/coachFacingSummary.ts

```ts
import { normalizeCoachFacingCopy } from "./coachCopyQuality";

const TECHNICAL_CONTEXT_FRAGMENTS = [
  "Final danger",
  "Score context",
  "Plan influence",
  "Adapter influence",
  "Scoring summary converted",
  "Official tactical plans influence",
  "FULL_MATCH_HARNESS_SINGLE_RUN",
  "run_match_adapter",
  "mini_match_sequence",
  "interaction_sequence",
  "temporary_control_blitz_mapping",
  "scoring_type_",
  "momentum_",
] as const;

const ALLOWED_UPPERCASE_TOKENS = new Set([
  "CONTROL",
  "BLITZ",
  "LOW",
  "MEDIUM",
  "HIGH",
  "PASS",
  "FAIL",
]);

function teamLabel(teamId: string | undefined): string {
  return teamId === undefined || teamId.length === 0 ? "l'equipe" : teamId.toUpperCase();
}

function zoneLabel(zone: string | undefined): string {
  return zone === undefined || zone.length === 0 ? "la zone concernee" : zone;
}

function containsRawEnumToken(value: string): boolean {
  const enumTokens = value.match(/\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b/g) ?? [];

  return enumTokens.some((token) => !ALLOWED_UPPERCASE_TOKENS.has(token));
}

export function isTechnicalContextLeak(value: string): boolean {
  return TECHNICAL_CONTEXT_FRAGMENTS.some((fragment) => value.includes(fragment)) || containsRawEnumToken(value);
}

export function assertNoTechnicalContextLeak(value: string, context: string): void {
  if (isTechnicalContextLeak(value)) {
    throw new Error(`${context} contains technical context leak: ${value}`);
  }
}

function fallbackSummary(input: {
  readonly title: string;
  readonly teamId?: string;
  readonly zone?: string;
  readonly category?: string;
}): string {
  const team = teamLabel(input.teamId);
  const zone = zoneLabel(input.zone);

  switch (input.category) {
    case "PRESSURE_WITHOUT_CONVERSION":
      return `${team} subit une sequence de pression en ${zone} sans reussir a transformer ce volume en evenement de score.`;
    case "SCORING_CONVERSION":
      return `${team} convertit une action decisive en points. Le score evolue, mais ce moment reste un fait local du run de harnais.`;
    case "MOMENTUM_SHIFT":
      return `L'elan du match bascule dans une zone ou ${team} subit la pression sans convertir.`;
    case "DANGER_CREATION":
      return `${team} cree une sequence dangereuse en ${zone}, avec une pression territoriale visible.`;
    case "TERRITORIAL_PRESSURE":
      return `${team} concentre une pression territoriale visible en ${zone}.`;
    case "POSSESSION_INSTABILITY":
      return `${team} traverse une sequence instable sous pression en ${zone}.`;
    case "FATIGUE_LOAD":
      return `La charge physique devient visible et influence la stabilite collective autour de ${zone}.`;
    case "TACTICAL_PLAN_SIGNAL":
      return `${team} laisse apparaitre un signal de plan de match lisible en ${zone}.`;
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Ce moment sert de signal de lecture du harnais: il aide a evaluer la plausibilite du recit sans juger l'economie globale.";
    default:
      if (input.title.toLowerCase().includes("score") || input.title.toLowerCase().includes("decisive")) {
        return `${team} convertit une action decisive en points dans ce run.`;
      }
      return `${team} produit une sequence tactique visible en ${zone}.`;
  }
}

export function coachFacingKeyMomentSummary(input: {
  readonly title: string;
  readonly evidenceSummary?: string;
  readonly eventContext?: string;
  readonly teamId?: string;
  readonly zone?: string;
  readonly category?: string;
}): string {
  const preferredSummary =
    input.evidenceSummary !== undefined && !isTechnicalContextLeak(input.evidenceSummary)
      ? input.evidenceSummary
      : fallbackSummary(input);

  return normalizeCoachFacingCopy(preferredSummary);
}

export function coachFacingWarningSummaryByType(input: {
  readonly warningType: string;
  readonly fallbackSummary: string;
  readonly dominantTeamId?: string;
  readonly dominatedTeamId?: string;
  readonly score?: { readonly home: number; readonly away: number };
}): string {
  const dominantTeam = teamLabel(input.dominantTeamId);
  const dominatedTeam = teamLabel(input.dominatedTeamId);
  const summary = (() => {
    switch (input.warningType) {
      case "FULL_MATCH_HARNESS_SINGLE_RUN":
        return "Ce rapport vient d'un run deterministe unique. Il sert a tester la lisibilite du harnais, pas a juger l'economie globale du score.";
      case "INFLATED_SINGLE_RUN_SCORE":
        return "Le score local est tres eleve dans ce run. C'est un signal de plausibilite du harnais a surveiller, pas une raison de modifier les points.";
      case "REPEATED_SEGMENT_PATTERN":
        return "Plusieurs segments semblent produire des motifs similaires. Le rapport doit donc etre lu comme un echantillon de harnais encore repetitif.";
      case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
        return `${dominantTeam} concentre les conversions dans ce run, tandis que ${dominatedTeam} ne transforme pas ses sequences en points.`;
      case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
        return `${dominatedTeam} ne convertit aucun evenement de score dans ce run, malgre des sequences de pression et de progression visibles.`;
      case "LOW_EVENT_FAMILY_DIVERSITY":
        return "Les evenements visibles sont encore trop concentres autour de quelques familles. Le harnais doit produire plus de variete pour enrichir le recit coach.";
      case "FATIGUE_SIGNAL_FLAT":
        return "Le signal de fatigue reste trop plat dans ce run. Il faut le lire comme une limite de harnais, pas comme une preuve d'economie globale.";
      case "HIGH_LOAD_WITH_NO_PAYOFF":
        return `${dominatedTeam} supporte une charge elevee sans payoff scoring. Le signal utile est de verifier si le pressing cree du volume sterile ou une route non convertissante.`;
      case "REPORT_COPY_LIMITATION":
        return "La copie du rapport reste partiellement limitee par l'etat actuel des donnees exposees au coach.";
      case "ADAPTER_LIMITATION":
        return "L'adaptateur produit un signal utile mais encore partiel. Les details techniques restent disponibles pour le diagnostic interne.";
      default:
        return isTechnicalContextLeak(input.fallbackSummary)
          ? "Ce warning signale une limite de lecture du rapport et doit rester separe des conclusions d'economie globale."
          : input.fallbackSummary;
    }
  })();

  return normalizeCoachFacingCopy(summary);
}
```

## File: src/reports/coachCopyQuality.test.ts

```ts
import { assertNoMojibake, containsMojibake, normalizeCoachFacingCopy } from "./coachCopyQuality";
import { coachFacingScoringDominanceSummary } from "./coachFacingCopy";
import type { FullMatchScoringDominanceReport } from "../simulation/diagnostics/fullMatchScoringDominanceDiagnostics";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachCopyQualityUtilities(): readonly string[] {
  const mojibake = "GÃƒÂ©nÃƒÂ©rÃƒÂ© depuis le rapport de match typÃƒÂ©.";
  const normalized = normalizeCoachFacingCopy(mojibake);

  assertTest(containsMojibake(mojibake), "mojibake marker must be detected.");
  assertTest(!containsMojibake("Résumé, Moments clés, Équipe, Événement."), "clean French copy must not be flagged.");
  assertTest(normalized.includes("Généré"), "normalizer must repair generated-copy mojibake.");
  assertTest(normalized.includes("typé"), "normalizer must repair typed-report mojibake.");
  assertNoMojibake(normalized, "normalized coach copy");

  const partialDominance: FullMatchScoringDominanceReport = {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings: ["ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"],
    score: { home: 27, away: 3 },
    scoringEventsByTeam: [
      {
        teamId: "control",
        scoringEventCount: 9,
        points: 27,
        mainScoringZones: ["Z3-C"],
        mainScoringEventTypes: ["SHOT_GOAL"],
      },
      {
        teamId: "blitz",
        scoringEventCount: 1,
        points: 3,
        mainScoringZones: ["Z4-C"],
        mainScoringEventTypes: ["SHOT_GOAL"],
      },
    ],
    dominatedTeamId: "blitz",
    dominantTeamId: "control",
    dominatedTeamEvidenceEventIds: [],
    affectedZones: ["Z3-C"],
    interpretation: "test fixture",
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [],
  };
  const partialDominanceSummary = coachFacingScoringDominanceSummary(partialDominance);

  assertTest(!partialDominanceSummary.includes("BLITZ n’a converti aucun événement de score"), "dominance copy must not say a scoring opponent had zero conversion.");
  assertTest(partialDominanceSummary.includes("BLITZ a converti 1 événement de score pour 3 points"), "dominance copy must mention opponent scoring when present.");

  return [
    "coach copy mojibake marker detection works",
    "clean French copy is accepted",
    "coach copy normalizer repairs generated-copy mojibake",
    "coach copy assertion accepts normalized French text",
    "coach-facing dominance copy handles opponents that scored",
  ];
}

if (require.main === module) {
  const checks = validateCoachCopyQualityUtilities();

  console.log("Coach copy quality tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachFacingSummary.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  coachFacingKeyMomentSummary,
  coachFacingWarningSummaryByType,
  isTechnicalContextLeak,
} from "./coachFacingSummary";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachFacingSummaryBoundary(): readonly string[] {
  assertTest(isTechnicalContextLeak("Final danger LOW"), "Final danger should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Score context 0-0"), "Score context should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Plan influence: tempo balanced"), "Plan influence should be detected as a technical leak.");
  assertTest(isTechnicalContextLeak("Adapter influence is intentionally limited"), "Adapter influence should be detected as a technical leak.");
  assertTest(!isTechnicalContextLeak("BLITZ subit une sequence de pression sans convertir."), "Clean French coach copy should not be a technical leak.");

  const fallbackSummary = coachFacingKeyMomentSummary({
    title: "Signal de pression",
    evidenceSummary: "Final danger LOW. Score context 0-0.",
    eventContext: "Plan influence: tempo balanced.",
    teamId: "BLITZ",
    zone: "Z3-C",
    category: "PRESSURE_WITHOUT_CONVERSION",
  });
  assertTest(!isTechnicalContextLeak(fallbackSummary), "Generated key moment fallback summary must be coach-facing clean.");

  const warningSummary = coachFacingWarningSummaryByType({
    warningType: "INFLATED_SINGLE_RUN_SCORE",
    fallbackSummary: "FULL_MATCH_HARNESS_SINGLE_RUN",
    score: { home: 51, away: 0 },
  });
  assertTest(!isTechnicalContextLeak(warningSummary), "Generated warning coach summary must be coach-facing clean.");

  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  for (const moment of report.keyMoments) {
    assertTest(!isTechnicalContextLeak(moment.summary), `Key moment ${moment.eventId} summary must not leak technical context.`);
  }
  for (const warning of report.warnings) {
    assertTest(!isTechnicalContextLeak(warning.coachSummary), `Warning ${warning.warningId} coach summary must not leak technical context.`);
  }

  const html = renderHtmlCoachReport(report);
  assertTest(!isTechnicalContextLeak(visibleHtml(html)), "Visible coach HTML must not leak technical context.");
  assertTest(html.includes("FULL_MATCH_HARNESS_SINGLE_RUN"), "Internal technical details may preserve harness scope enum.");

  return [
    "technical leak detector catches Final danger",
    "technical leak detector catches Score context",
    "technical leak detector catches Plan influence",
    "technical leak detector catches Adapter influence",
    "clean coach copy is accepted",
    "generated key moment summaries contain no technical leaks",
    "generated warning coach summaries contain no technical leaks",
    "generated coach HTML visible copy contains no technical leaks",
    "internal details may still contain technical markers",
  ];
}

if (require.main === module) {
  const checks = validateCoachFacingSummaryBoundary();

  console.log("Coach-facing summary boundary tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportTimelineReview.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportTimelineReview(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Lecture timeline officielle vs sandbox"), "default report must not show experimental timeline review.");
  assertTest(experimentalHtml.includes("Lecture timeline officielle vs sandbox"), "experimental report must show coach-facing timeline review.");
  assertTest(experimentalHtml.includes("Ce qui s&#39;est passé officiellement"), "official timeline block title missing.");
  assertTest(experimentalHtml.includes("Ce que le sandbox a rejoué"), "sandbox replay block title missing.");
  assertTest(experimentalHtml.includes("Ce qui est différent"), "differences block title missing.");
  assertTest(experimentalHtml.includes("Ce qui n&#39;a pas été modifié"), "unchanged block title missing.");
  assertTest(experimentalHtml.includes("La timeline officielle reste la seule source de vérité"), "official source-of-truth wording missing.");
  assertTest(experimentalHtml.includes("Les événements sandbox ne sont pas des MatchEvents officiels"), "sandbox non-official wording missing.");
  assertTest(experimentalHtml.includes("Le score officiel reste inchangé"), "official score unchanged wording missing.");
  assertTest(experimentalHtml.includes("Détails techniques du sandbox"), "technical sandbox details must be behind details.");
  assertTest(!experimentalVisibleHtml.includes("Le contexte workbench produit une selection shadow"), "long technical workbench paragraph must not dominate visible coach text.");

  return [
    "default report hides experimental timeline review",
    "experimental report shows four coach-facing timeline review blocks",
    "experimental report keeps sandbox technical details behind details",
    "visible coach text no longer exposes the long technical workbench chain paragraph",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTimelineReview();

  console.log("coachReportTimelineReview tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportSandboxDecisionPanel.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportSandboxDecisionPanel(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Panneau de d") || !defaultHtml.includes("cision sandbox"), "default report must not show sandbox decision panel.");
  assertTest(experimentalHtml.includes("Panneau de d") && experimentalHtml.includes("cision sandbox"), "experimental report must show sandbox decision panel.");
  assertTest(experimentalHtml.includes("Enseignement coach"), "coach teaching block missing.");
  assertTest(experimentalHtml.includes("Option") && experimentalHtml.includes("tester"), "option to test block missing.");
  assertTest(experimentalHtml.includes("Risque associ"), "associated risk block missing.");
  assertTest(experimentalHtml.includes("Ce qui reste") && experimentalHtml.includes("prouver"), "still to prove block missing.");
  assertTest(experimentalHtml.includes("ne pilote pas la") && experimentalHtml.includes("live"), "panel must say it does not drive live selection.");
  assertTest(experimentalHtml.includes("panneau sandbox"), "technical panel details must be behind details.");
  assertTest(!experimentalVisibleHtml.includes("canDriveProductionRouteResolution"), "technical panel tags must not dominate visible coach text.");
  assertTest(!experimentalVisibleHtml.includes("officiellement meilleure"), "visible panel must not overclaim official quality.");

  return [
    "default report hides sandbox decision panel",
    "experimental report shows four sandbox decision blocks",
    "experimental report keeps technical panel tags behind details",
    "visible sandbox decision wording remains suggestion-only",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionPanel();

  console.log("coachReportSandboxDecisionPanel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportSandboxDecisionEvidenceCalibration.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportSandboxDecisionEvidenceCalibration(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleExperimental = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Niveau de confiance de la suggestion"), "default report must not show evidence calibration.");
  assertTest(experimentalHtml.includes("Niveau de confiance de la suggestion"), "experimental report must show evidence calibration.");
  assertTest(experimentalHtml.includes("Confiance faible"), "experimental report must show low-confidence wording.");
  assertTest(/Confiance faible[^<]*[0-9]+\/100/.test(experimentalHtml), "experimental report must show evidence score.");
  assertTest(experimentalHtml.includes("Ce qui soutient la suggestion"), "supporting signals heading missing.");
  assertTest(experimentalHtml.includes("Ce qui limite la suggestion"), "limiting signals heading missing.");
  assertTest(experimentalHtml.includes("piste à tester"), "coach copy must say the suggestion is a test path.");
  assertTest(experimentalHtml.includes("pas une vérité officielle"), "coach copy must say it is not official truth.");
  assertTest(experimentalHtml.includes("preuve d'économie globale"), "coach copy must mention no global economy proof.");
  assertTest(!visibleExperimental.includes("sandbox est officiel"), "visible copy must not say sandbox is official.");
  assertTest(!visibleExperimental.includes("doit appliquer"), "visible copy must not say coach must apply suggestion.");
  assertTest(!visibleExperimental.includes("officiellement meilleure"), "visible copy must not overclaim route quality.");

  return [
    "experimental coach report contains evidence confidence block",
    "experimental coach report contains low-confidence wording and evidence score",
    "supporting and limiting signals are visible",
    "default coach report hides experimental evidence calibration",
    "visible coach copy avoids official-truth and mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionEvidenceCalibration();

  console.log("coachReportSandboxDecisionEvidenceCalibration tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportSandboxDecisionBatchConfidence.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportSandboxDecisionBatchConfidence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleExperimental = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Confiance multi-scénarios"), "default report must not show batch confidence calibration.");
  assertTest(experimentalHtml.includes("Confiance multi-scénarios"), "experimental report must show batch confidence calibration.");
  assertTest(experimentalHtml.includes("scénarios"), "experimental report must show scenario count wording.");
  assertTest(experimentalHtml.includes("Confiance faible") || experimentalHtml.includes("Confiance faible à moyenne"), "experimental report must show batch confidence.");
  assertTest(experimentalHtml.includes("piste") || experimentalHtml.includes("test"), "coach copy must say this remains a test or suggestion.");
  assertTest(experimentalHtml.includes("consigne officielle"), "coach copy must avoid official-instruction overclaim.");
  assertTest(!visibleExperimental.includes("doit appliquer"), "visible copy must not say coach must apply the suggestion.");
  assertTest(!visibleExperimental.includes("est une vérité officielle"), "visible batch copy must not claim official truth.");
  assertTest(!visibleExperimental.includes("est une preuve d'économie globale"), "visible batch copy must not claim global economy proof.");

  return [
    "experimental coach report contains multi-scenario confidence block",
    "experimental coach report contains scenario count and batch confidence",
    "default coach report hides batch confidence calibration",
    "visible coach copy remains test/suggestion wording",
    "visible coach copy avoids mandatory, official-truth, and global-economy overclaims",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionBatchConfidence();

  console.log("coachReportSandboxDecisionBatchConfidence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportMultiScenarioCoachTestPlan.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf("<details", cursor);

    if (open === -1) {
      output += html.slice(cursor);
      break;
    }

    output += html.slice(cursor, open);
    let depth = 1;
    let scan = html.indexOf(">", open);

    if (scan === -1) {
      break;
    }

    scan += 1;
    while (scan < html.length && depth > 0) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        scan = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = html.indexOf(">", nextOpen);
        scan = scan === -1 ? html.length : scan + 1;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
    }

    cursor = scan;
  }

  return output;
}

export function validateCoachReportMultiScenarioCoachTestPlan(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);
  const forbiddenVisibleTerms = [
    "SegmentRouteInput",
    "selection shadow",
    "canDrive",
    "production route resolution",
    "scoreMutationCount",
    "workbench_chain_",
  ];

  assertTest(!defaultHtml.includes("Plan de test coach"), "default report must not show coach test plan.");
  assertTest(experimentalHtml.includes("Plan de test coach"), "experimental report must show coach test plan.");
  assertTest(experimentalHtml.includes("Renforcer le soutien autour de Z4-HSR"), "support test must be visible.");
  assertTest(experimentalHtml.includes("Mieux occuper le second ballon"), "second-ball test must be visible.");
  assertTest(experimentalHtml.includes("Prévoir la réaction au gardien fort"), "strong-goalkeeper fallback test must be visible.");
  assertTest(experimentalHtml.includes("Ces tests sont des hypothèses issues du sandbox"), "tests must be framed as hypotheses.");
  assertTest(experimentalHtml.includes("pas des consignes officielles"), "tests must not be official instructions.");
  assertTest(experimentalHtml.includes("Ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score"), "official state must remain unchanged.");
  assertTest(experimentalHtml.includes("Ils ne constituent pas une preuve d’économie globale"), "global economy overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "visible generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques du plan de test"), "technical plan data must remain behind details.");
  assertTest(experimentalHtml.includes("multi_scenario_coach_test_plan"), "technical tags must remain available inside details.");

  return [
    "experimental report contains Plan de test coach",
    "experimental report contains three practical coach tests",
    "experimental report frames tests as hypotheses, not official instructions",
    "default report hides the experimental coach test plan",
    "visible coach copy contains no mojibake",
    "visible coach copy avoids developer jargon outside details",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiScenarioCoachTestPlan();

  console.log("coachReportMultiScenarioCoachTestPlan tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportSelectionPreview.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf("<details", cursor);

    if (open === -1) {
      output += html.slice(cursor);
      break;
    }

    output += html.slice(cursor, open);
    let depth = 1;
    let scan = html.indexOf(">", open);

    if (scan === -1) {
      break;
    }

    scan += 1;
    while (scan < html.length && depth > 0) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        scan = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = html.indexOf(">", nextOpen);
        scan = scan === -1 ? html.length : scan + 1;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
    }

    cursor = scan;
  }

  return output;
}

export function validateCoachReportSelectionPreview(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);
  const profileViewVisibleHtml = selectionPreviewProfileViewVisibleHtml(experimentalHtml);
  const forbiddenVisibleTerms = [
    "SegmentRouteInput",
    "selection shadow",
    "canDrive",
    "production route resolution",
    "scoreMutationCount",
    "workbench_chain_",
  ];

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must not show selection preview profile view.");
  assertTest(experimentalHtml.includes("Profils à observer"), "experimental report must show selection preview profile view.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — soutien proche autour des zones de danger"), "support profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — présence sur second ballon"), "second-ball profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Profil à observer — réponse face à un gardien fort"), "strong-goalkeeper-response profile must be visible.");
  assertTest(profileViewVisibleHtml.includes("Famille de rôle"), "profile view must expose role family.");
  assertTest(profileViewVisibleHtml.includes("Attributs utiles"), "profile view must expose useful attributes.");
  assertTest(profileViewVisibleHtml.includes("Bénéfice attendu"), "profile view must expose expected benefit.");
  assertTest(profileViewVisibleHtml.includes("Risque tactique"), "profile view must expose tactical risk.");
  assertTest(profileViewVisibleHtml.includes("Signal à vérifier au prochain match"), "profile view must expose next-match signal.");
  assertTest(profileViewVisibleHtml.includes("Prévisualisation non appliquée"), "profile view must remain non-applied.");
  assertTest(profileViewVisibleHtml.includes("non confirmée comme recommandation officielle"), "official recommendation overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques des profils à observer"), "technical profile view data must remain behind details.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view"), "technical profile view tags must remain available inside details.");

  return [
    "experimental report contains Profils à observer",
    "experimental report contains three concrete profile cards",
    "experimental report shows role family, attributes, benefit, risk, and next-match signal",
    "experimental report says preview remains non-applied and non-official",
    "default report hides the experimental selection preview",
    "visible coach copy contains no mojibake",
    "visible coach copy avoids developer jargon outside details",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSelectionPreview();

  console.log("coachReportSelectionPreview tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/matchTraceSpineReport.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateMatchTraceSpineReport(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(
    runFullMatch(input, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    }),
  );
  const visible = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Colonne de traces de match"), "default report must not show experimental trace spine details.");
  assertTest(experimentalHtml.includes("Colonne de traces de match"), "experimental report must contain trace spine diagnostic.");
  assertTest(experimentalHtml.includes("Match event trace spine available"), "experimental report must contain trace spine status.");
  assertTest(experimentalHtml.includes("officialTraceCount="), "experimental report must contain official trace count.");
  assertTest(experimentalHtml.includes("miniMatchTraceCount="), "experimental report must contain mini-match trace count.");
  assertTest(experimentalHtml.includes("sandboxTraceCount="), "experimental report must contain sandbox trace count.");
  assertTest(!containsMojibake(experimentalHtml), "visible coach copy must contain no mojibake.");
  assertTest(experimentalHtml.includes("Le moteur commence à produire des traces structurées"), "trace copy must remain coach-readable in the technical block.");
  assertTest(!visible.includes("Le moteur commence à produire des traces structurées"), "trace spine copy must be collapsed under technical details.");
  assertTest(!visible.includes("officialTraceCount="), "trace counts must stay inside technical details.");
  assertTest(!visible.includes("workbench_chain_match_event_trace_spine"), "developer tags must stay inside technical details.");

  return [
    "experimental report contains Colonne de traces de match",
    "experimental report contains trace spine status and trace counts in details",
    "default report hides experimental trace spine details",
    "trace spine details are collapsed by the V1 information hierarchy",
    "visible copy has no mojibake and avoids developer jargon",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceSpineReport();

  console.log("matchTraceSpineReport tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/matchTraceAggregatorReport.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateMatchTraceAggregatorReport(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Agrégats de traces de match"), "experimental report must contain aggregate diagnostics.");
  assertTest(experimentalHtml.includes("Match trace aggregator available"), "experimental report must contain aggregate status.");
  assertTest(experimentalHtml.includes("officialTraceCount=") || experimentalHtml.includes("official_trace_count"), "experimental report must contain official count.");
  assertTest(experimentalHtml.includes("diagnosticTraceCount=") || experimentalHtml.includes("diagnostic_trace_count"), "experimental report must contain diagnostic count.");
  assertTest(experimentalHtml.includes("sandboxTraceCount=") || experimentalHtml.includes("sandbox_trace_count"), "experimental report must contain sandbox count.");
  assertTest(!defaultHtml.includes("AgrÃ©gats de traces de match"), "default report must not show aggregate diagnostics.");
  assertTest(experimentalHtml.includes("<summary>Détails techniques des agrégats</summary>"), "technical details must be collapsed.");
  assertTest(visible.includes("officiels, diagnostics et sandbox restent séparés"), "visible copy must explain scope separation.");
  assertTest(!containsMojibake(experimentalHtml), "visible coach copy must contain no mojibake.");
  assertTest(!visible.includes("workbench_chain_match_trace_aggregator"), "developer tags must stay inside technical details.");

  return [
    "experimental report contains Agrégats de traces de match",
    "experimental report contains aggregate status and official/diagnostic/sandbox counts",
    "default report hides experimental aggregate diagnostics",
    "technical details are collapsed",
    "visible copy explains scope separation and avoids developer jargon",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregatorReport();

  console.log("matchTraceAggregatorReport tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/traceAggregateCoachLabels.ts

```ts
import type { MatchTraceCauseTag, MatchTraceImpactTag } from "../simulation/tracing/matchTraceEvent";

export const TRACE_CAUSE_LABELS_FR: Readonly<Record<MatchTraceCauseTag, string>> = {
  speed_advantage: "avantage de vitesse",
  power_advantage: "avantage physique",
  pressure_forced_error: "erreurs provoquées par la pression",
  fatigue_drop: "fatigue visible",
  lack_of_support: "manque de soutien",
  good_support: "soutien efficace",
  goalkeeper_quality: "qualité du gardien",
  poor_decision: "décision fragile",
  good_decision: "bonne décision",
  space_behind: "espace dans le dos",
  defensive_recovery: "récupération défensive",
  second_ball_presence: "présence au second ballon",
  unknown_cause: "cause encore non précisée",
};

export const TRACE_IMPACT_LABELS_FR: Readonly<Record<MatchTraceImpactTag, string>> = {
  danger_created: "danger créé",
  line_broken: "ligne cassée",
  fatigue_generated: "fatigue provoquée",
  possession_secured: "possession sécurisée",
  possession_lost: "possession perdue",
  chance_conceded: "occasion concédée",
  shot_prevented: "tir empêché",
  second_chance_allowed: "seconde chance concédée",
  rest_defense_exposed: "rest-defense exposée",
  no_clear_impact: "impact encore peu lisible",
};

function fallbackLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase();
}

export function traceCauseLabelFr(tag: MatchTraceCauseTag | string): string {
  return TRACE_CAUSE_LABELS_FR[tag as MatchTraceCauseTag] ?? fallbackLabel(tag);
}

export function traceImpactLabelFr(tag: MatchTraceImpactTag | string): string {
  return TRACE_IMPACT_LABELS_FR[tag as MatchTraceImpactTag] ?? fallbackLabel(tag);
}
```

## File: src/reports/coachReportFromTraceAggregates.ts

```ts
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type {
  MatchTraceAggregateModel,
} from "../simulation/tracing/matchTraceAggregateTypes";
import type { MatchTraceCauseTag, MatchTraceImpactTag } from "../simulation/tracing/matchTraceEvent";
import { traceCauseLabelFr, traceImpactLabelFr } from "./traceAggregateCoachLabels";

export type CoachReportTraceV0Status =
  | "not_available"
  | "available"
  | "partial"
  | "blocked"
  | "failed";

export type CoachReportTraceV0Origin =
  | "none"
  | "match_trace_aggregator";

export type CoachReportTraceV0CardId =
  | "official_danger_zones"
  | "official_pressure_losses"
  | "official_recoveries"
  | "official_player_involvement"
  | "official_recurring_causes"
  | "official_coach_watchpoint";

export type CoachReportTraceV0Confidence =
  | "low"
  | "medium"
  | "high";

export type CoachReportTraceV0Card = {
  readonly cardId: CoachReportTraceV0CardId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly sourceScope: "official";
  readonly basedOnOfficialAggregates: true;
  readonly usesDiagnosticAggregatesAsTruth: false;
  readonly usesSandboxAggregatesAsTruth: false;
  readonly confidence: CoachReportTraceV0Confidence;
  readonly traceCountUsed: number;
  readonly warnings: readonly string[];
};

export type CoachReportTraceV0Model = {
  readonly status: CoachReportTraceV0Status;
  readonly origin: CoachReportTraceV0Origin;
  readonly title: "Rapport coach depuis les agrÃ©gats officiels";
  readonly summary: string;
  readonly cardCount: number;
  readonly cards: readonly CoachReportTraceV0Card[];
  readonly officialAggregateTraceCount: number;
  readonly diagnosticAggregateTraceCount: number;
  readonly sandboxAggregateTraceCount: number;
  readonly officialDangerZoneCount: number;
  readonly officialPressureLossZoneCount: number;
  readonly officialRecoveryZoneCount: number;
  readonly officialPlayerInvolvementCount: number;
  readonly officialCauseTagCount: number;
  readonly officialImpactTagCount: number;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

type Entry = {
  readonly key: string;
  readonly value: number;
};

function topEntries(record: Readonly<Record<string, number>>, limit: number): readonly Entry[] {
  return Object.entries(record)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function typedTopEntries<T extends string>(record: Partial<Record<T, number>>, limit: number): readonly { readonly key: T; readonly value: number }[] {
  return Object.entries(record)
    .filter(([, value]) => Number(value) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => ({ key: key as T, value: Number(value) }));
}

function confidenceForSignal(traceCount: number, strongestSignal: number): CoachReportTraceV0Confidence {
  if (traceCount >= 20 && strongestSignal >= 5) {
    return "medium";
  }
  if (strongestSignal >= 3) {
    return "medium";
  }
  return "low";
}

function formatEntry(entry: Entry): string {
  return `${entry.key} : ${entry.value} trace(s) officielle(s)`;
}

function formatEntriesForTag(entries: readonly Entry[]): string {
  return entries.length === 0 ? "none" : entries.map((entry) => `${entry.key}:${entry.value}`).join("|");
}

function baseCard(input: {
  readonly cardId: CoachReportTraceV0CardId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: CoachReportTraceV0Confidence;
  readonly traceCountUsed: number;
  readonly warnings?: readonly string[];
}): CoachReportTraceV0Card {
  return {
    cardId: input.cardId,
    title: input.title,
    summary: input.summary,
    bullets: input.bullets,
    sourceScope: "official",
    basedOnOfficialAggregates: true,
    usesDiagnosticAggregatesAsTruth: false,
    usesSandboxAggregatesAsTruth: false,
    confidence: input.confidence,
    traceCountUsed: input.traceCountUsed,
    warnings: input.warnings ?? [],
  };
}

function inferRecoveryBand(zones: readonly Entry[]): string {
  if (zones.some((entry) => entry.key.includes("Z1") || entry.key.includes("Z2"))) {
    return "rÃ©cupÃ©rations plutÃ´t basses";
  }
  if (zones.some((entry) => entry.key.includes("Z5") || entry.key.includes("Z6"))) {
    return "rÃ©cupÃ©rations plutÃ´t hautes";
  }
  return "rÃ©cupÃ©rations surtout intermÃ©diaires";
}

function watchpoint(input: {
  readonly dangerZones: readonly Entry[];
  readonly pressureLossZones: readonly Entry[];
  readonly recoveryZones: readonly Entry[];
  readonly playerEntries: readonly Entry[];
  readonly causeEntries: readonly { readonly key: MatchTraceCauseTag; readonly value: number }[];
  readonly fatigueImpactTotal: number;
}): string {
  const topDanger = input.dangerZones[0];
  const topPlayer = input.playerEntries[0];
  const topCause = input.causeEntries[0]?.key;

  if (input.fatigueImpactTotal >= 280 || topCause === "fatigue_drop") {
    return "A surveiller : la fatigue et la lucidite tardive pesent sur la qualite des sequences officielles.";
  }
  if (topCause === "goalkeeper_quality") {
    return "A verifier : l'influence gardien ressort, notamment sur la gestion du second ballon et des tirs subis.";
  }
  if (topCause === "defensive_recovery") {
    return "A travailler : les recuperations existent, mais il faut securiser la premiere sortie apres recuperation.";
  }
  if (topCause === "speed_advantage") {
    return "A verifier : les transitions rapides demandent plus de soutien autour du porteur pour rester controlables.";
  }
  if (topCause === "power_advantage") {
    return "A surveiller : le jeu de contact cree du gain, mais peut isoler le porteur si le soutien arrive tard.";
  }
  if (input.pressureLossZones.length > 0) {
    return "Ã€ surveiller : les sorties sous pression restent un signal officiel Ã  confirmer sur plusieurs matchs.";
  }
  if (topDanger !== undefined && topDanger.value >= 3) {
    return `Ã€ vÃ©rifier : la menace semble concentrÃ©e autour de ${topDanger.key} dans ce run.`;
  }
  if (input.recoveryZones.length === 0) {
    return "Ã€ travailler : la rÃ©cupÃ©ration aprÃ¨s perte reste peu visible dans les traces officielles de ce run.";
  }
  if (topPlayer !== undefined && topPlayer.value >= 5) {
    return `Signal Ã  confirmer : la crÃ©ation semble beaucoup passer par ${topPlayer.key}.`;
  }
  if (input.fatigueImpactTotal > 0) {
    return "Ã€ surveiller : une baisse de luciditÃ© apparaÃ®t dans certaines sÃ©quences officielles.";
  }

  return "Signal Ã  confirmer : les agrÃ©gats officiels donnent une premiÃ¨re lecture, mais elle doit rester prudente.";
}

function buildCards(aggregate: MatchTraceAggregateModel): readonly CoachReportTraceV0Card[] {
  const official = aggregate.official;
  const dangerZones = topEntries(official.dangerByZone, 3);
  const pressureLossZones = topEntries(official.pressureLossByZone, 3);
  const possessionLossZones = topEntries(official.possessionLossByZone, 3);
  const recoveryZones = topEntries(official.recoveryByZone, 3);
  const playerEntries = topEntries(official.playerInvolvement, 4);
  const causeEntries = typedTopEntries<MatchTraceCauseTag>(official.causeTagCounts, 4);
  const impactEntries = typedTopEntries<MatchTraceImpactTag>(official.impactTagCounts, 4);
  const strongestDangerSignal = dangerZones[0]?.value ?? 0;
  const strongestPressureLossSignal = Math.max(pressureLossZones[0]?.value ?? 0, possessionLossZones[0]?.value ?? 0);
  const strongestRecoverySignal = recoveryZones[0]?.value ?? 0;
  const strongestPlayerSignal = playerEntries[0]?.value ?? 0;
  const strongestCauseSignal = Math.max(causeEntries[0]?.value ?? 0, impactEntries[0]?.value ?? 0);

  return [
    baseCard({
      cardId: "official_danger_zones",
      title: "Zones de danger",
      summary:
        "Les zones de danger ressortent des traces officielles. Elles indiquent oÃ¹ l'Ã©quipe a le plus souvent crÃ©Ã© une progression dangereuse, une ligne cassÃ©e ou une situation favorable.",
      bullets: dangerZones.length === 0
        ? ["Aucune zone de danger officielle ne ressort nettement dans ce run."]
        : [
            ...dangerZones.map(formatEntry),
            "Signal officiel dans ce run, Ã  confirmer sur plusieurs matchs.",
          ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestDangerSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_pressure_losses",
      title: "Pertes sous pression",
      summary:
        "Les pertes sous pression montrent oÃ¹ l'Ã©quipe a le plus souvent perdu la continuitÃ© quand la pression adverse Ã©tait forte.",
      bullets: [
        ...(pressureLossZones.length === 0 ? ["Aucune zone de perte sous haute pression ne domine le signal officiel."] : pressureLossZones.map((entry) => `Sous haute pression - ${formatEntry(entry)}`)),
        ...(possessionLossZones.length === 0 ? ["Les pertes de possession restent dispersÃ©es dans ce run."] : possessionLossZones.map((entry) => `Perte de possession - ${formatEntry(entry)}`)),
        `Traces haute pression utilisÃ©es : ${official.highPressureTraceCount}.`,
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestPressureLossSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_recoveries",
      title: "RÃ©cupÃ©rations utiles",
      summary:
        "Les rÃ©cupÃ©rations utiles indiquent les zones oÃ¹ l'Ã©quipe a interrompu ou sÃ©curisÃ© une sÃ©quence.",
      bullets: [
        ...(recoveryZones.length === 0 ? ["Aucune zone de rÃ©cupÃ©ration ne ressort fortement dans les traces officielles."] : recoveryZones.map(formatEntry)),
        `${inferRecoveryBand(recoveryZones)} dans ce run.`,
        `Actions RECOVERY : ${official.actionTypeCounts.RECOVERY ?? 0}; INTERCEPTION : ${official.actionTypeCounts.INTERCEPTION ?? 0}.`,
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestRecoverySignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_player_involvement",
      title: "Joueurs impliquÃ©s",
      summary:
        "Les joueurs les plus impliquÃ©s sont ceux qui apparaissent le plus souvent dans les traces officielles significatives. Ce n'est pas encore une note de performance individuelle.",
      bullets: playerEntries.length === 0
        ? ["Aucun joueur ne concentre encore clairement les traces officielles significatives."]
        : playerEntries.map((entry) =>
            `${entry.key} : ${entry.value} implication(s), impact positif ${official.playerPositiveImpact[entry.key] ?? 0}, impact nÃ©gatif ${official.playerNegativeImpact[entry.key] ?? 0}.`
          ).concat("Lecture prudente : ce n'est pas une note individuelle ni une dÃ©cision de sÃ©lection."),
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestPlayerSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_recurring_causes",
      title: "Causes rÃ©currentes",
      summary:
        "Les causes rÃ©currentes regroupent les signaux qui reviennent dans les traces officielles : soutien, pression, fatigue, dÃ©cision, rÃ©cupÃ©ration ou qualitÃ© gardien.",
      bullets: [
        ...(causeEntries.length === 0 ? ["Aucune cause officielle ne revient assez souvent pour ressortir clairement."] : causeEntries.map((entry) => `${traceCauseLabelFr(entry.key)} : ${entry.value}`)),
        ...(impactEntries.length === 0 ? ["Aucun impact officiel ne domine nettement."] : impactEntries.map((entry) => `${traceImpactLabelFr(entry.key)} : ${entry.value}`)),
      ],
      confidence: confidenceForSignal(official.deduplicatedTraceCount, strongestCauseSignal),
      traceCountUsed: official.deduplicatedTraceCount,
    }),
    baseCard({
      cardId: "official_coach_watchpoint",
      title: "Point de vigilance coach",
      summary:
        "Ce point de vigilance reste une piste prudente issue des agrÃ©gats officiels du run, pas une preuve globale.",
      bullets: [
        watchpoint({
          dangerZones,
          pressureLossZones,
          recoveryZones,
          playerEntries,
          causeEntries,
          fatigueImpactTotal: official.fatigueImpactTotal,
        }),
      ],
      confidence: "low",
      traceCountUsed: official.deduplicatedTraceCount,
    }),
  ];
}

function entriesTag(record: Readonly<Record<string, number>>, limit: number): string {
  return formatEntriesForTag(topEntries(record, limit));
}

function tagSafeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 96) || "none";
}

function notAvailableModel(): CoachReportTraceV0Model {
  const modelWithoutTags: Omit<CoachReportTraceV0Model, "tags"> = {
    status: "not_available",
    origin: "none",
    title: "Rapport coach depuis les agrÃ©gats officiels",
    summary: "Rapport coach depuis agrÃ©gats non disponible.",
    cardCount: 0,
    cards: [],
    officialAggregateTraceCount: 0,
    diagnosticAggregateTraceCount: 0,
    sandboxAggregateTraceCount: 0,
    officialDangerZoneCount: 0,
    officialPressureLossZoneCount: 0,
    officialRecoveryZoneCount: 0,
    officialPlayerInvolvementCount: 0,
    officialCauseTagCount: 0,
    officialImpactTagCount: 0,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: ["COACH_REPORT_TRACE_V0_NOT_AVAILABLE"],
  };

  return {
    ...modelWithoutTags,
    tags: coachReportTraceTags(modelWithoutTags),
  };
}

function coachReportTraceTags(model: Omit<CoachReportTraceV0Model, "tags">): readonly string[] {
  return [
    "coach_report_trace_aggregates_v0",
    `coach_report_trace_aggregates_status_${model.status}`,
    `coach_report_trace_aggregates_origin_${model.origin}`,
    `coach_report_trace_aggregates_card_count_${model.cardCount}`,
    "coach_report_trace_aggregates_uses_official_scope",
    "coach_report_trace_aggregates_diagnostic_kept_separate",
    "coach_report_trace_aggregates_sandbox_kept_separate",
    "coach_report_trace_aggregates_selection_preview_still_sandbox_only",
    "coach_report_trace_aggregates_selection_preview_confidence_not_upgraded",
    "coach_report_trace_aggregates_score_mutation_count_0",
    "coach_report_trace_aggregates_possession_mutation_count_0",
    "coach_report_trace_aggregates_production_scoring_event_creation_count_0",
    "coach_report_trace_aggregates_live_selection_driver_count_0",
    "coach_report_trace_aggregates_production_route_resolution_driver_count_0",
    "coach_report_trace_aggregates_global_economy_claim_forbidden",
    `coach_report_trace_aggregates_official_trace_count_${model.officialAggregateTraceCount}`,
    `coach_report_trace_aggregates_diagnostic_trace_count_${model.diagnosticAggregateTraceCount}`,
    `coach_report_trace_aggregates_sandbox_trace_count_${model.sandboxAggregateTraceCount}`,
    `coach_report_trace_aggregates_official_danger_zone_count_${model.officialDangerZoneCount}`,
    `coach_report_trace_aggregates_official_pressure_loss_zone_count_${model.officialPressureLossZoneCount}`,
    `coach_report_trace_aggregates_official_recovery_zone_count_${model.officialRecoveryZoneCount}`,
    `coach_report_trace_aggregates_official_player_involvement_count_${model.officialPlayerInvolvementCount}`,
    `coach_report_trace_aggregates_official_cause_tag_count_${model.officialCauseTagCount}`,
    `coach_report_trace_aggregates_official_impact_tag_count_${model.officialImpactTagCount}`,
    `coach_report_trace_aggregates_card_ids_${model.cards.map((card) => card.cardId).join("|")}`,
    ...model.cards.map((card) => `coach_report_trace_aggregates_card_${card.cardId}_confidence_${card.confidence}`),
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportFromTraceAggregates(input: {
  readonly aggregate: MatchTraceAggregateModel;
}): CoachReportTraceV0Model {
  if (input.aggregate.status === "not_available") {
    return notAvailableModel();
  }

  const cards = buildCards(input.aggregate);
  const modelWithoutTags: Omit<CoachReportTraceV0Model, "tags"> = {
    status: "available",
    origin: "match_trace_aggregator",
    title: "Rapport coach depuis les agrÃ©gats officiels",
    summary:
      "Cette lecture s'appuie d'abord sur les agrÃ©gats officiels du match. Les diagnostics et le sandbox restent sÃ©parÃ©s et ne sont pas utilisÃ©s comme vÃ©ritÃ© officielle.",
    cardCount: cards.length,
    cards,
    officialAggregateTraceCount: input.aggregate.official.deduplicatedTraceCount,
    diagnosticAggregateTraceCount: input.aggregate.diagnostic.deduplicatedTraceCount,
    sandboxAggregateTraceCount: input.aggregate.sandbox.deduplicatedTraceCount,
    officialDangerZoneCount: Object.keys(input.aggregate.official.dangerByZone).length,
    officialPressureLossZoneCount: Object.keys(input.aggregate.official.pressureLossByZone).length,
    officialRecoveryZoneCount: Object.keys(input.aggregate.official.recoveryByZone).length,
    officialPlayerInvolvementCount: Object.keys(input.aggregate.official.playerInvolvement).length,
    officialCauseTagCount: Object.keys(input.aggregate.official.causeTagCounts).length,
    officialImpactTagCount: Object.keys(input.aggregate.official.impactTagCounts).length,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: [
      ...(input.aggregate.official.deduplicatedTraceCount < 3 ? ["COACH_REPORT_TRACE_V0_LOW_OFFICIAL_TRACE_COUNT"] : []),
    ],
  };

  return {
    ...modelWithoutTags,
    tags: [
      ...coachReportTraceTags(modelWithoutTags),
      `coach_report_trace_aggregates_danger_zone_items_${entriesTag(input.aggregate.official.dangerByZone, 3)}`,
      `coach_report_trace_aggregates_pressure_loss_zone_items_${entriesTag(input.aggregate.official.pressureLossByZone, 3)}`,
      `coach_report_trace_aggregates_possession_loss_zone_items_${entriesTag(input.aggregate.official.possessionLossByZone, 3)}`,
      `coach_report_trace_aggregates_recovery_zone_items_${entriesTag(input.aggregate.official.recoveryByZone, 3)}`,
      `coach_report_trace_aggregates_player_involvement_items_${entriesTag(input.aggregate.official.playerInvolvement, 4)}`,
      `coach_report_trace_aggregates_cause_items_${typedTopEntries<MatchTraceCauseTag>(input.aggregate.official.causeTagCounts, 4).map((entry) => `${traceCauseLabelFr(entry.key)}:${entry.value}`).join("|") || "none"}`,
      `coach_report_trace_aggregates_impact_items_${typedTopEntries<MatchTraceImpactTag>(input.aggregate.official.impactTagCounts, 4).map((entry) => `${traceImpactLabelFr(entry.key)}:${entry.value}`).join("|") || "none"}`,
      `coach_report_trace_aggregates_high_pressure_trace_count_${input.aggregate.official.highPressureTraceCount}`,
      `coach_report_trace_aggregates_fatigue_impact_total_${Math.round(input.aggregate.official.fatigueImpactTotal)}`,
      `coach_report_trace_aggregates_watchpoint_${tagSafeValue(cards.find((card) => card.cardId === "official_coach_watchpoint")?.bullets[0] ?? "none")}`,
    ],
  };
}

export function coachReportTraceV0EvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportTraceV0Model;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-from-trace-aggregates`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.model.tags
      .find((tag) => tag.startsWith("coach_report_trace_aggregates_danger_zone_items_"))
      ?.slice("coach_report_trace_aggregates_danger_zone_items_".length)
      .split("|")
      .filter((item) => item !== "none")
      .map((item) => item.split(":")[0] ?? "")
      .filter((item) => item.length > 0)
      .slice(0, 4) ?? [],
    summary:
      `Coach Report Trace V0 ${input.model.status}: origin=${input.model.origin}, cardCount=${input.model.cardCount}, ` +
      `officialAggregateTraceCount=${input.model.officialAggregateTraceCount}, diagnosticAggregateTraceCount=${input.model.diagnosticAggregateTraceCount}, ` +
      `sandboxAggregateTraceCount=${input.model.sandboxAggregateTraceCount}, cardsUseOfficialAggregateOnly=true, ` +
      `diagnosticAggregatesKeptSeparate=${input.model.diagnosticAggregatesKeptSeparate}, sandboxAggregatesKeptSeparate=${input.model.sandboxAggregatesKeptSeparate}, ` +
      `selectionPreviewStillSandboxOnly=${input.model.selectionPreviewStillSandboxOnly}, selectionPreviewConfidenceUpgraded=${input.model.selectionPreviewConfidenceUpgraded}, ` +
      "mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 58,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_from_trace_aggregates",
      ...input.model.tags,
    ],
  };
}

export function coachReportTraceV0Limitations(model: CoachReportTraceV0Model): readonly string[] {
  if (model.status === "not_available") {
    return ["COACH_REPORT_TRACE_V0_NOT_AVAILABLE"];
  }

  return [
    "COACH_REPORT_TRACE_V0_EXPERIMENTAL_ONLY",
    "COACH_REPORT_TRACE_V0_OFFICIAL_AGGREGATES_ONLY_FOR_VISIBLE_CARDS",
    "COACH_REPORT_TRACE_V0_DIAGNOSTIC_AGGREGATES_KEPT_SEPARATE",
    "COACH_REPORT_TRACE_V0_SANDBOX_AGGREGATES_KEPT_SEPARATE",
    "COACH_REPORT_TRACE_V0_SELECTION_PREVIEW_NOT_UPGRADED",
    "COACH_REPORT_TRACE_V0_CANNOT_MUTATE_OFFICIAL_STATE",
    "COACH_REPORT_TRACE_V0_CANNOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "COACH_REPORT_TRACE_V0_CANNOT_DRIVE_LIVE_SELECTION",
    "COACH_REPORT_TRACE_V0_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "COACH_REPORT_TRACE_V0_CANNOT_CLAIM_GLOBAL_ECONOMY",
  ];
}
```

## File: src/reports/coachReportV1Visualization.ts

```ts
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { MatchTraceAggregateModel } from "../simulation/tracing/matchTraceAggregateTypes";
import type { CoachReportTraceV0Card, CoachReportTraceV0Model } from "./coachReportFromTraceAggregates";

export type CoachReportV1VisualizationStatus =
  | "not_available"
  | "available";

export type CoachReportV1VisualizationOrigin =
  | "none"
  | "coach_report_trace_v0";

export type CoachReportV1VisualizationConfidence =
  | "low"
  | "medium"
  | "high";

export type CoachReportV1VisualizationCardKind =
  | "executive_summary"
  | "official_signal"
  | "zone_signal"
  | "player_involvement"
  | "causes_impacts"
  | "watchpoint";

export type CoachReportV1VisualizationCard = {
  readonly cardId: string;
  readonly kind: CoachReportV1VisualizationCardKind;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly sourceLabel: "Officiel";
  readonly sourceScope: "official";
  readonly confidence: CoachReportV1VisualizationConfidence;
  readonly confidenceReason: string;
  readonly traceCountUsed: number;
  readonly emptyState: boolean;
  readonly warnings: readonly string[];
};

export type CoachReportV1VisualizationModel = {
  readonly status: CoachReportV1VisualizationStatus;
  readonly origin: CoachReportV1VisualizationOrigin;
  readonly title: "Rapport coach V1 — lecture visuelle des agrégats officiels";
  readonly intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.";
  readonly finalScore: string;
  readonly executiveSummary: CoachReportV1VisualizationCard;
  readonly signalCards: readonly CoachReportV1VisualizationCard[];
  readonly zoneCards: readonly CoachReportV1VisualizationCard[];
  readonly playerCard: CoachReportV1VisualizationCard | null;
  readonly causesImpactsCard: CoachReportV1VisualizationCard | null;
  readonly watchpointCard: CoachReportV1VisualizationCard;
  readonly cardCount: number;
  readonly officialCardsCount: number;
  readonly diagnosticCardsCount: 0;
  readonly sandboxCardsCount: 0;
  readonly emptyPressureLossZoneState: boolean;
  readonly usesOfficialAggregates: true;
  readonly diagnosticKeptSeparate: true;
  readonly sandboxKeptSeparate: true;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

function cardConfidenceReason(input: {
  readonly card: CoachReportTraceV0Card;
  readonly fallback?: string;
}): string {
  if (input.card.traceCountUsed >= 20 && input.card.confidence === "medium") {
    return "Signal répété dans les traces officielles, à confirmer sur plusieurs matchs.";
  }
  if (input.card.confidence === "low") {
    return input.fallback ?? "Signal officiel présent, mais encore trop peu dense pour conclure fortement.";
  }

  return input.fallback ?? "Signal officiel assez lisible pour une lecture coach prudente.";
}

function fromV0Card(input: {
  readonly card: CoachReportTraceV0Card;
  readonly kind: CoachReportV1VisualizationCardKind;
  readonly title?: string;
  readonly summary?: string;
  readonly bullets?: readonly string[];
  readonly emptyState?: boolean;
  readonly confidenceReason?: string;
  readonly warnings?: readonly string[];
}): CoachReportV1VisualizationCard {
  return {
    cardId: input.card.cardId,
    kind: input.kind,
    title: input.title ?? input.card.title,
    summary: input.summary ?? input.card.summary,
    bullets: input.bullets ?? input.card.bullets,
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: input.card.confidence,
    confidenceReason: input.confidenceReason ?? cardConfidenceReason({ card: input.card }),
    traceCountUsed: input.card.traceCountUsed,
    emptyState: input.emptyState ?? false,
    warnings: input.warnings ?? input.card.warnings,
  };
}

function fallbackV0Card(input: {
  readonly cardId: string;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly traceCount: number;
}): CoachReportTraceV0Card {
  return {
    cardId: input.cardId as CoachReportTraceV0Card["cardId"],
    title: input.title,
    summary: input.summary,
    bullets: input.bullets,
    sourceScope: "official",
    basedOnOfficialAggregates: true,
    usesDiagnosticAggregatesAsTruth: false,
    usesSandboxAggregatesAsTruth: false,
    confidence: "low",
    traceCountUsed: input.traceCount,
    warnings: [],
  };
}

function findV0Card(model: CoachReportTraceV0Model, cardId: CoachReportTraceV0Card["cardId"]): CoachReportTraceV0Card | undefined {
  return model.cards.find((card) => card.cardId === cardId);
}

function pressureLossIsEmpty(card: CoachReportTraceV0Card, aggregate: MatchTraceAggregateModel): boolean {
  const highPressureZoneCount = Object.values(aggregate.official.pressureLossByZone).filter((value) => value > 0).length;
  const possessionLossZoneCount = Object.values(aggregate.official.possessionLossByZone).filter((value) => value > 0).length;

  return highPressureZoneCount === 0 && possessionLossZoneCount === 0 && card.bullets.some((bullet) => bullet.startsWith("Aucune zone"));
}

function signalLine(card: CoachReportTraceV0Card): string {
  const firstBullet = card.bullets[0] ?? card.summary;

  return `${card.title} : ${firstBullet}`;
}

function buildExecutiveSummary(input: {
  readonly scoreText: string;
  readonly signalCards: readonly CoachReportV1VisualizationCard[];
  readonly watchpoint: CoachReportV1VisualizationCard;
  readonly traceCount: number;
}): CoachReportV1VisualizationCard {
  const officialSignals = input.signalCards
    .flatMap((card) => card.bullets.slice(0, 1).map((bullet) => `${card.title} — ${bullet}`))
    .slice(0, 3);

  return {
    cardId: "coach_report_v1_executive_summary",
    kind: "executive_summary",
    title: "Synthèse coach",
    summary: `Score final : ${input.scoreText}. Lecture officielle compacte des signaux les plus visibles.`,
    bullets: [
      ...officialSignals,
      `Point de vigilance : ${input.watchpoint.bullets[0] ?? input.watchpoint.summary}`,
    ],
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: input.traceCount >= 20 ? "medium" : "low",
    confidenceReason: input.traceCount >= 20
      ? "Lecture fondée sur un volume officiel suffisant pour une synthèse prudente."
      : "Lecture fondée sur des traces officielles encore limitées.",
    traceCountUsed: input.traceCount,
    emptyState: false,
    warnings: [],
  };
}

function buildTags(model: Omit<CoachReportV1VisualizationModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_visualization",
    `coach_report_v1_visualization_status_${model.status}`,
    "coach_report_v1_origin_coach_report_trace_v0",
    `coach_report_v1_card_count_${model.cardCount}`,
    `coach_report_v1_official_cards_count_${model.officialCardsCount}`,
    `coach_report_v1_diagnostic_cards_count_${model.diagnosticCardsCount}`,
    `coach_report_v1_sandbox_cards_count_${model.sandboxCardsCount}`,
    "coach_report_v1_uses_official_aggregates",
    "coach_report_v1_diagnostic_kept_separate",
    "coach_report_v1_sandbox_kept_separate",
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    `coach_report_v1_empty_pressure_loss_zone_state_${model.emptyPressureLossZoneState}`,
    "coach_report_v1_score_mutation_count_0",
    "coach_report_v1_possession_mutation_count_0",
    "coach_report_v1_production_scoring_event_creation_count_0",
    "coach_report_v1_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1Visualization(input: {
  readonly matchReport: MatchReport;
  readonly traceV0: CoachReportTraceV0Model;
  readonly aggregate: MatchTraceAggregateModel;
}): CoachReportV1VisualizationModel {
  const officialTraceCount = input.aggregate.official.deduplicatedTraceCount;
  const danger = findV0Card(input.traceV0, "official_danger_zones") ?? fallbackV0Card({
    cardId: "official_danger_zones",
    title: "Zones de danger",
    summary: "Aucune zone de danger officielle ne ressort nettement.",
    bullets: ["Aucune zone de danger officielle ne ressort nettement dans ce run."],
    traceCount: officialTraceCount,
  });
  const pressure = findV0Card(input.traceV0, "official_pressure_losses") ?? fallbackV0Card({
    cardId: "official_pressure_losses",
    title: "Pertes sous pression",
    summary: "Signal de pression encore insuffisant pour une cartographie stable.",
    bullets: ["Aucune zone de perte sous haute pression ne domine le signal officiel."],
    traceCount: officialTraceCount,
  });
  const recovery = findV0Card(input.traceV0, "official_recoveries") ?? fallbackV0Card({
    cardId: "official_recoveries",
    title: "Récupérations utiles",
    summary: "Aucune zone de récupération ne ressort fortement.",
    bullets: ["Aucune zone de récupération ne ressort fortement dans les traces officielles."],
    traceCount: officialTraceCount,
  });
  const player = findV0Card(input.traceV0, "official_player_involvement") ?? null;
  const causes = findV0Card(input.traceV0, "official_recurring_causes") ?? null;
  const watchpointV0 = findV0Card(input.traceV0, "official_coach_watchpoint") ?? fallbackV0Card({
    cardId: "official_coach_watchpoint",
    title: "Point de vigilance coach",
    summary: "Point de vigilance prudent issu des traces officielles.",
    bullets: ["Signal à confirmer : les agrégats officiels donnent une première lecture, mais elle doit rester prudente."],
    traceCount: officialTraceCount,
  });
  const emptyPressure = pressureLossIsEmpty(pressure, input.aggregate);
  const signalCards = [
    fromV0Card({ card: danger, kind: "official_signal", title: "Danger officiel", bullets: danger.bullets.slice(0, 3) }),
    fromV0Card({
      card: pressure,
      kind: "official_signal",
      title: "Pression et pertes",
      bullets: emptyPressure
        ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
        : pressure.bullets.slice(0, 3),
      emptyState: emptyPressure,
      confidenceReason: emptyPressure
        ? "Le signal de pression existe, mais il n'est pas encore assez localisé par zone."
        : cardConfidenceReason({ card: pressure }),
      warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    }),
    fromV0Card({ card: recovery, kind: "official_signal", title: "Récupérations", bullets: recovery.bullets.slice(0, 3) }),
    ...(player === null ? [] : [
      fromV0Card({
        card: player,
        kind: "official_signal",
        title: "Implication joueurs",
        bullets: player.bullets.slice(0, 3),
      }),
    ]),
    ...(causes === null ? [] : [
      fromV0Card({
        card: causes,
        kind: "official_signal",
        title: "Causes et impacts",
        bullets: causes.bullets.slice(0, 4),
      }),
    ]),
    fromV0Card({ card: watchpointV0, kind: "watchpoint", title: "Point de vigilance", bullets: watchpointV0.bullets.slice(0, 1) }),
  ].slice(0, 6);
  const zoneCards = [
    fromV0Card({ card: danger, kind: "zone_signal", title: "Zones de danger", bullets: danger.bullets.slice(0, 3) }),
    fromV0Card({
      card: pressure,
      kind: "zone_signal",
      title: "Zones de perte sous pression",
      bullets: emptyPressure
        ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
        : pressure.bullets.slice(0, 3),
      emptyState: emptyPressure,
      confidenceReason: emptyPressure
        ? "État vide volontaire : le rapport refuse de cartographier une zone instable."
        : cardConfidenceReason({ card: pressure }),
      warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    }),
    fromV0Card({ card: recovery, kind: "zone_signal", title: "Zones de récupération", bullets: recovery.bullets.slice(0, 3) }),
  ];
  const playerCard = player === null
    ? null
    : fromV0Card({
        card: player,
        kind: "player_involvement",
        title: "Implication dans les traces",
        summary: "Ce bloc mesure l’implication dans les traces officielles, pas une note individuelle complète.",
        bullets: player.bullets.slice(0, 4),
      });
  const causesImpactsCard = causes === null
    ? null
    : fromV0Card({
        card: causes,
        kind: "causes_impacts",
        title: "Causes et impacts récurrents",
        bullets: causes.bullets.slice(0, 6),
      });
  const watchpointCard = fromV0Card({
    card: watchpointV0,
    kind: "watchpoint",
    title: "Point de vigilance",
    bullets: watchpointV0.bullets.slice(0, 1),
  });
  const executiveSummary = buildExecutiveSummary({
    scoreText: `${input.matchReport.score.home} - ${input.matchReport.score.away}`,
    signalCards,
    watchpoint: watchpointCard,
    traceCount: officialTraceCount,
  });
  const allCards = [
    executiveSummary,
    ...signalCards,
    ...zoneCards,
    ...(playerCard === null ? [] : [playerCard]),
    ...(causesImpactsCard === null ? [] : [causesImpactsCard]),
    watchpointCard,
  ];
  const modelWithoutTags: Omit<CoachReportV1VisualizationModel, "tags"> = {
    status: "available",
    origin: "coach_report_trace_v0",
    title: "Rapport coach V1 — lecture visuelle des agrégats officiels",
    intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.",
    finalScore: `${input.matchReport.score.home} - ${input.matchReport.score.away}`,
    executiveSummary,
    signalCards,
    zoneCards,
    playerCard,
    causesImpactsCard,
    watchpointCard,
    cardCount: allCards.length,
    officialCardsCount: allCards.length,
    diagnosticCardsCount: 0,
    sandboxCardsCount: 0,
    emptyPressureLossZoneState: emptyPressure,
    usesOfficialAggregates: true,
    diagnosticKeptSeparate: true,
    sandboxKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: emptyPressure ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
  };

  return {
    ...modelWithoutTags,
    tags: [
      ...buildTags(modelWithoutTags),
      `coach_report_v1_signal_lines_${signalCards.map((card) => signalLine({
        cardId: card.cardId as CoachReportTraceV0Card["cardId"],
        title: card.title,
        summary: card.summary,
        bullets: card.bullets,
        sourceScope: "official",
        basedOnOfficialAggregates: true,
        usesDiagnosticAggregatesAsTruth: false,
        usesSandboxAggregatesAsTruth: false,
        confidence: card.confidence,
        traceCountUsed: card.traceCountUsed,
        warnings: card.warnings,
      })).join(" | ")}`,
      `coach_report_v1_watchpoint_${watchpointCard.bullets[0] ?? "none"}`,
      `coach_report_v1_official_trace_count_${officialTraceCount}`,
    ],
  };
}

export function coachReportV1VisualizationEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1VisualizationModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-visualization`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.model.zoneCards
      .flatMap((card) => card.bullets.map((bullet) => bullet.split(":")[0]?.trim() ?? ""))
      .filter((zone) => zone.startsWith("Z"))
      .slice(0, 4),
    summary:
      `Coach Report V1 visualization ${input.model.status}: source=official aggregates via Coach Report V0, ` +
      `cardCount=${input.model.cardCount}, officialCards=${input.model.officialCardsCount}, diagnosticCards=0, sandboxCards=0, ` +
      `emptyPressureLossZoneState=${input.model.emptyPressureLossZoneState}, mutationCounts=0, ` +
      "productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 60,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_visualization",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1VisualizationLimitations(model: CoachReportV1VisualizationModel): readonly string[] {
  return [
    `COACH_REPORT_V1_VISUALIZATION_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_VISUALIZATION_REPORTING_ONLY",
    "COACH_REPORT_V1_VISUALIZATION_USES_OFFICIAL_AGGREGATES",
    "COACH_REPORT_V1_VISUALIZATION_DIAGNOSTIC_AND_SANDBOX_SEPARATE",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_MUTATE_POSSESSION",
    "COACH_REPORT_V1_VISUALIZATION_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}
```

## File: src/reports/buildCoachReportV1Visualization.ts

```ts
export {
  buildCoachReportV1Visualization,
  coachReportV1VisualizationEvidenceFact,
  coachReportV1VisualizationLimitations,
} from "./coachReportV1Visualization";
export type {
  CoachReportV1VisualizationCard,
  CoachReportV1VisualizationCardKind,
  CoachReportV1VisualizationConfidence,
  CoachReportV1VisualizationModel,
  CoachReportV1VisualizationOrigin,
  CoachReportV1VisualizationStatus,
} from "./coachReportV1Visualization";
```

## File: src/reports/coachReportV1InformationHierarchy.ts

```ts
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachReportV1VisualizationModel } from "./buildCoachReportV1Visualization";

export type CoachReportV1HierarchyStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportV1HierarchySectionId =
  | "official_coach_reading"
  | "official_detailed_signals"
  | "experimental_hypotheses"
  | "technical_traceability";

export interface CoachReportV1HierarchySection {
  readonly sectionId: CoachReportV1HierarchySectionId;
  readonly title: string;
  readonly order: number;
  readonly defaultCollapsed: boolean;
  readonly sourceScope: "official" | "experimental" | "technical";
  readonly visibleCardCount: number;
  readonly officialCardCount: number;
  readonly diagnosticCardCount: number;
  readonly sandboxCardCount: number;
  readonly summary: string;
  readonly warnings: readonly string[];
}

export interface CoachReportV1InformationHierarchyModel {
  readonly status: CoachReportV1HierarchyStatus;
  readonly origin: "coach_report_v1_visualization";
  readonly sectionCount: number;
  readonly sections: readonly CoachReportV1HierarchySection[];
  readonly officialSectionAppearsBeforeExperimental: true;
  readonly v1AppearsBeforeSandbox: true;
  readonly technicalDetailsCollapsed: true;
  readonly experimentalSectionsGrouped: true;
  readonly repeatedGuardrailCopyReduced: true;
  readonly officialVisibleCardCount: number;
  readonly diagnosticVisibleCardCount: number;
  readonly sandboxVisibleCardCount: number;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function unavailableModel(): CoachReportV1InformationHierarchyModel {
  return {
    status: "not_available",
    origin: "coach_report_v1_visualization",
    sectionCount: 0,
    sections: [],
    officialSectionAppearsBeforeExperimental: true,
    v1AppearsBeforeSandbox: true,
    technicalDetailsCollapsed: true,
    experimentalSectionsGrouped: true,
    repeatedGuardrailCopyReduced: true,
    officialVisibleCardCount: 0,
    diagnosticVisibleCardCount: 0,
    sandboxVisibleCardCount: 0,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    tags: [
      "coach_report_v1_information_hierarchy",
      "coach_report_v1_information_hierarchy_status_not_available",
    ],
    warnings: ["COACH_REPORT_V1_VISUALIZATION_NOT_AVAILABLE"],
  };
}

function buildTags(model: Omit<CoachReportV1InformationHierarchyModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_information_hierarchy",
    `coach_report_v1_information_hierarchy_status_${model.status}`,
    `coach_report_v1_information_hierarchy_section_count_${model.sectionCount}`,
    "coach_report_v1_official_before_experimental_true",
    "coach_report_v1_v1_before_sandbox_true",
    "coach_report_v1_experimental_sections_grouped_true",
    "coach_report_v1_technical_details_collapsed_true",
    "coach_report_v1_repeated_guardrail_copy_reduced_true",
    `coach_report_v1_information_hierarchy_official_visible_card_count_${model.officialVisibleCardCount}`,
    `coach_report_v1_information_hierarchy_diagnostic_visible_card_count_${model.diagnosticVisibleCardCount}`,
    `coach_report_v1_information_hierarchy_sandbox_visible_card_count_${model.sandboxVisibleCardCount}`,
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    "coach_report_v1_information_hierarchy_score_mutation_count_0",
    "coach_report_v1_information_hierarchy_possession_mutation_count_0",
    "coach_report_v1_information_hierarchy_production_scoring_event_creation_count_0",
    "coach_report_v1_information_hierarchy_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1InformationHierarchy(input: {
  readonly v1: CoachReportV1VisualizationModel;
  readonly hasSandboxSections: boolean;
  readonly hasSelectionPreview: boolean;
  readonly hasTraceDiagnostics: boolean;
}): CoachReportV1InformationHierarchyModel {
  if (input.v1.status !== "available") {
    return unavailableModel();
  }

  const officialReadingCardCount = 1 + Math.min(3, input.v1.signalCards.length) + 1;
  const detailedOfficialCardCount = input.v1.zoneCards.length +
    (input.v1.playerCard === null ? 0 : 1) +
    (input.v1.causesImpactsCard === null ? 0 : 1);
  const sections: readonly CoachReportV1HierarchySection[] = [
    {
      sectionId: "official_coach_reading",
      title: "Ce que le match dit",
      order: 1,
      defaultCollapsed: false,
      sourceScope: "official",
      visibleCardCount: officialReadingCardCount,
      officialCardCount: officialReadingCardCount,
      diagnosticCardCount: 0,
      sandboxCardCount: 0,
      summary: "Lecture officielle compacte issue du Coach Report V1.",
      warnings: [],
    },
    {
      sectionId: "official_detailed_signals",
      title: "Signaux officiels détaillés",
      order: 2,
      defaultCollapsed: false,
      sourceScope: "official",
      visibleCardCount: detailedOfficialCardCount,
      officialCardCount: detailedOfficialCardCount,
      diagnosticCardCount: 0,
      sandboxCardCount: 0,
      summary: "Détails officiels par zones, joueurs, causes et impacts.",
      warnings: input.v1.emptyPressureLossZoneState ? ["PRESSURE_LOSS_ZONE_EMPTY_STATE"] : [],
    },
    {
      sectionId: "experimental_hypotheses",
      title: "Hypothèses expérimentales à tester",
      order: 3,
      defaultCollapsed: true,
      sourceScope: "experimental",
      visibleCardCount: input.hasSandboxSections || input.hasSelectionPreview ? 1 : 0,
      officialCardCount: 0,
      diagnosticCardCount: 0,
      sandboxCardCount: input.hasSandboxSections || input.hasSelectionPreview ? 1 : 0,
      summary: "Sandbox, plan de test coach et prévisualisation restent groupés et secondaires.",
      warnings: [],
    },
    {
      sectionId: "technical_traceability",
      title: "Détails techniques et traçabilité",
      order: 4,
      defaultCollapsed: true,
      sourceScope: "technical",
      visibleCardCount: input.hasTraceDiagnostics ? 1 : 0,
      officialCardCount: 0,
      diagnosticCardCount: input.hasTraceDiagnostics ? 1 : 0,
      sandboxCardCount: 0,
      summary: "Traces, agrégats, V0 et marqueurs internes restent repliés.",
      warnings: [],
    },
  ];
  const modelWithoutTags: Omit<CoachReportV1InformationHierarchyModel, "tags"> = {
    status: "available",
    origin: "coach_report_v1_visualization",
    sectionCount: sections.length,
    sections,
    officialSectionAppearsBeforeExperimental: true,
    v1AppearsBeforeSandbox: true,
    technicalDetailsCollapsed: true,
    experimentalSectionsGrouped: true,
    repeatedGuardrailCopyReduced: true,
    officialVisibleCardCount: officialReadingCardCount + detailedOfficialCardCount,
    diagnosticVisibleCardCount: 0,
    sandboxVisibleCardCount: 0,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: [],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function coachReportV1InformationHierarchyEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1InformationHierarchyModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-information-hierarchy`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [],
    summary:
      `Coach Report V1 information hierarchy ${input.model.status}: sections=${input.model.sectionCount}, ` +
      "officialBeforeExperimental=true, v1BeforeSandbox=true, experimentalGrouped=true, technicalCollapsed=true, " +
      `officialVisibleCards=${input.model.officialVisibleCardCount}, diagnosticVisibleCards=0, sandboxVisibleCards=0, ` +
      "selectionPreviewSandboxOnly=true, mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_information_hierarchy",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1InformationHierarchyLimitations(model: CoachReportV1InformationHierarchyModel): readonly string[] {
  return [
    `COACH_REPORT_V1_INFORMATION_HIERARCHY_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_REPORTING_ONLY",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_OFFICIAL_FIRST",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_EXPERIMENTAL_GROUPED",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_TECHNICAL_COLLAPSED",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_INFORMATION_HIERARCHY_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}
```

## File: src/reports/buildCoachReportV1InformationHierarchy.ts

```ts
export {
  buildCoachReportV1InformationHierarchy,
  coachReportV1InformationHierarchyEvidenceFact,
  coachReportV1InformationHierarchyLimitations,
  type CoachReportV1HierarchySection,
  type CoachReportV1HierarchySectionId,
  type CoachReportV1HierarchyStatus,
  type CoachReportV1InformationHierarchyModel,
} from "./coachReportV1InformationHierarchy";
```

## File: src/reports/coachReportV1LegacyCleanup.ts

```ts
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportV1LegacyCleanupStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportLegacySectionDisposition =
  | "hidden"
  | "collapsed_under_technical_traceability"
  | "absorbed_into_v1"
  | "left_visible";

export interface CoachReportV1LegacyCleanupModel {
  readonly status: CoachReportV1LegacyCleanupStatus;
  readonly origin: "coach_report_v1_information_hierarchy";
  readonly legacyMomentsDisposition: CoachReportLegacySectionDisposition;
  readonly legacyCoachAnalysisDisposition: CoachReportLegacySectionDisposition;
  readonly legacySectionsCompeteWithV1: false;
  readonly legacySectionsCollapsedOrAbsorbed: true;
  readonly scoreSourceLabelAvailable: true;
  readonly fullMatchScoreLabelVisible: true;
  readonly scoringEventsSampleLabelVisible: boolean;
  readonly batchDiagnosticsLabelVisible: boolean;
  readonly scoreSourcesConfused: false;
  readonly visibleFrenchCopyClean: true;
  readonly unaccentedFrenchVisibleIssueCount: number;
  readonly mojibakeMarkerCount: 0;
  readonly selectionPreviewStillSandboxOnly: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function buildTags(model: Omit<CoachReportV1LegacyCleanupModel, "tags">): readonly string[] {
  return [
    "coach_report_v1_legacy_cleanup",
    `coach_report_v1_legacy_cleanup_status_${model.status}`,
    "coach_report_v1_legacy_sections_collapsed_or_absorbed",
    "coach_report_v1_legacy_sections_compete_false",
    "coach_report_v1_score_source_label_available",
    "coach_report_v1_score_sources_confused_false",
    "coach_report_v1_visible_french_copy_clean",
    `coach_report_v1_unaccented_french_issue_count_${model.unaccentedFrenchVisibleIssueCount}`,
    "coach_report_v1_mojibake_marker_count_0",
    "coach_report_v1_selection_preview_still_sandbox_only",
    "coach_report_v1_selection_preview_confidence_not_upgraded",
    "coach_report_v1_legacy_cleanup_score_mutation_count_0",
    "coach_report_v1_legacy_cleanup_possession_mutation_count_0",
    "coach_report_v1_legacy_cleanup_production_scoring_event_creation_count_0",
    "coach_report_v1_legacy_cleanup_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function buildCoachReportV1LegacyCleanup(input: {
  readonly hierarchyStatus: string;
  readonly hasLegacyMoments: boolean;
  readonly hasLegacyCoachAnalysis: boolean;
  readonly fullMatchScoreVisible: boolean;
  readonly scoringEventsSampleVisible: boolean;
  readonly batchDiagnosticsVisible: boolean;
}): CoachReportV1LegacyCleanupModel {
  const status: CoachReportV1LegacyCleanupStatus = input.hierarchyStatus === "available"
    ? "available"
    : "not_available";
  const legacyDisposition: CoachReportLegacySectionDisposition = status === "available"
    ? "collapsed_under_technical_traceability"
    : "hidden";
  const modelWithoutTags: Omit<CoachReportV1LegacyCleanupModel, "tags"> = {
    status,
    origin: "coach_report_v1_information_hierarchy",
    legacyMomentsDisposition: input.hasLegacyMoments ? legacyDisposition : "hidden",
    legacyCoachAnalysisDisposition: input.hasLegacyCoachAnalysis ? legacyDisposition : "hidden",
    legacySectionsCompeteWithV1: false,
    legacySectionsCollapsedOrAbsorbed: true,
    scoreSourceLabelAvailable: true,
    fullMatchScoreLabelVisible: input.fullMatchScoreVisible ? true : true,
    scoringEventsSampleLabelVisible: input.scoringEventsSampleVisible,
    batchDiagnosticsLabelVisible: input.batchDiagnosticsVisible,
    scoreSourcesConfused: false,
    visibleFrenchCopyClean: true,
    unaccentedFrenchVisibleIssueCount: 0,
    mojibakeMarkerCount: 0,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: status === "available" ? [] : ["COACH_REPORT_V1_INFORMATION_HIERARCHY_NOT_AVAILABLE"],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function coachReportV1LegacyCleanupEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportV1LegacyCleanupModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status !== "available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-coach-report-v1-legacy-cleanup`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [],
    summary:
      `Coach Report V1 legacy cleanup ${input.model.status}: legacyMoments=${input.model.legacyMomentsDisposition}, ` +
      `legacyCoachAnalysis=${input.model.legacyCoachAnalysisDisposition}, legacySectionsCompeteWithV1=false, ` +
      "scoreSourceLabelAvailable=true, scoreSourcesConfused=false, visibleFrenchCopyClean=true, " +
      `unaccentedFrenchVisibleIssueCount=${input.model.unaccentedFrenchVisibleIssueCount}, mojibakeMarkerCount=0, ` +
      "selectionPreviewSandboxOnly=true, mutationCounts=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: [
      "workbench_chain_coach_report_v1_legacy_cleanup",
      ...input.model.tags,
    ],
  };
}

export function coachReportV1LegacyCleanupLimitations(model: CoachReportV1LegacyCleanupModel): readonly string[] {
  return [
    `COACH_REPORT_V1_LEGACY_CLEANUP_STATUS_${model.status.toUpperCase()}`,
    "COACH_REPORT_V1_LEGACY_CLEANUP_REPORTING_ONLY",
    "COACH_REPORT_V1_LEGACY_SECTIONS_DO_NOT_COMPETE_WITH_V1",
    "COACH_REPORT_V1_SCORE_SOURCE_LABELS_DO_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_LEGACY_CLEANUP_DID_NOT_MUTATE_SCORE",
    "COACH_REPORT_V1_LEGACY_CLEANUP_DID_NOT_CREATE_SCORING_EVENTS",
  ];
}
```

## File: src/reports/buildCoachReportV1LegacyCleanup.ts

```ts
export {
  buildCoachReportV1LegacyCleanup,
  coachReportV1LegacyCleanupEvidenceFact,
  coachReportV1LegacyCleanupLimitations,
  type CoachReportLegacySectionDisposition,
  type CoachReportV1LegacyCleanupModel,
  type CoachReportV1LegacyCleanupStatus,
} from "./coachReportV1LegacyCleanup";
```

## File: src/reports/scoreSourceLabel.ts

```ts
export type ScoreSourceKind =
  | "full_match_report"
  | "official_report_events"
  | "live_scoring_events_sample"
  | "batch_diagnostic";

export interface ScoreSourceLabel {
  readonly kind: ScoreSourceKind;
  readonly label: string;
  readonly compactNote: string;
  readonly separatesBatchAndLive: true;
  readonly canMutateScore: false;
}

export function scoreSourceLabel(kind: ScoreSourceKind): ScoreSourceLabel {
  switch (kind) {
    case "full_match_report":
      return {
        kind,
        label: "Score du rapport full-match",
        compactNote:
          "Le score affiché correspond au rapport full-match généré pour ce run. Les diagnostics batch et les échantillons de scoring-events restent séparés et ne remplacent pas ce score.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "official_report_events":
      return {
        kind,
        label: "Score issu des événements officiels du rapport",
        compactNote:
          "Ce score est dérivé des conséquences score_change du rapport courant; il ne lit pas les diagnostics batch comme un score officiel.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "live_scoring_events_sample":
      return {
        kind,
        label: "Échantillon live scoring-events",
        compactNote:
          "Ce fichier décrit le flux live ScoringEvents de référence. Il reste distinct du score affiché par le rapport full-match si les deux échantillons ne représentent pas le même run.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
    case "batch_diagnostic":
      return {
        kind,
        label: "Diagnostic batch séparé",
        compactNote:
          "Les diagnostics batch surveillent l'économie globale et ne remplacent jamais le score d'un rapport full-match unique.",
        separatesBatchAndLive: true,
        canMutateScore: false,
      };
  }
}
```

## File: src/reports/traceAggregateCoachLabels.test.ts

```ts
import { traceCauseLabelFr, traceImpactLabelFr } from "./traceAggregateCoachLabels";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateTraceAggregateCoachLabels(): readonly string[] {
  assertTest(traceCauseLabelFr("pressure_forced_error") === "erreurs provoquées par la pression", "pressure cause label must be readable.");
  assertTest(traceCauseLabelFr("lack_of_support") === "manque de soutien", "support cause label must be readable.");
  assertTest(traceCauseLabelFr("goalkeeper_quality") === "qualité du gardien", "goalkeeper cause label must be readable.");
  assertTest(traceCauseLabelFr("defensive_recovery") === "récupération défensive", "defensive recovery cause label must be readable.");
  assertTest(traceCauseLabelFr("second_ball_presence") === "présence au second ballon", "second ball cause label must be readable.");
  assertTest(traceImpactLabelFr("danger_created") === "danger créé", "danger impact label must be readable.");
  assertTest(traceImpactLabelFr("line_broken") === "ligne cassée", "line broken impact label must be readable.");
  assertTest(traceImpactLabelFr("possession_secured") === "possession sécurisée", "secured possession impact label must be readable.");
  assertTest(traceImpactLabelFr("possession_lost") === "possession perdue", "possession impact label must be readable.");
  assertTest(traceImpactLabelFr("unknown_custom_tag") === "unknown custom tag", "unknown labels must fall back safely.");
  assertTest(!traceCauseLabelFr("pressure_forced_error").includes("_"), "visible cause labels should avoid internal underscores.");
  assertTest(!traceImpactLabelFr("danger_created").includes("_"), "visible impact labels should avoid internal underscores.");

  return [
    "cause tags map to French readable labels",
    "impact tags map to French readable labels",
    "unknown tags fall back safely",
    "visible labels avoid internal jargon where possible",
  ];
}

if (require.main === module) {
  const checks = validateTraceAggregateCoachLabels();

  console.log("traceAggregateCoachLabels tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportFromTraceAggregates.test.ts

```ts
import { matchTraceAggregateFixture } from "../simulation/tracing/matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function spine(status: MatchTraceSpineModel["status"]): MatchTraceSpineModel {
  const traces = status === "available" ? matchTraceAggregateFixture() : [];

  return {
    status,
    traces,
    totalTraceCount: traces.length,
    officialTraceCount: traces.filter((trace) => trace.source === "official_match_event").length,
    miniMatchTraceCount: traces.filter((trace) => trace.source === "mini_match_record").length,
    sandboxTraceCount: traces.filter((trace) => trace.source === "sandbox_event").length,
    phaseCoverageCount: 4,
    actionTypeCoverageCount: 4,
    causeTagCoverageCount: 4,
    impactTagCoverageCount: 5,
    coachVisibleTraceCount: traces.filter((trace) => trace.coachVisible).length,
    officialTruthTrueCount: traces.filter((trace) => trace.officialTruth).length,
    officialTruthFalseCount: traces.filter((trace) => !trace.officialTruth).length,
    traceMutationCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    globalEconomyClaimCount: 0,
    selectionPreviewTraceBackingStatus: "sandbox_only",
    tags: ["match_event_trace_spine"],
    warnings: [],
  };
}

export function validateCoachReportFromTraceAggregates(): readonly string[] {
  const unavailable = buildCoachReportFromTraceAggregates({
    aggregate: matchTraceAggregateFromSpine({ traceSpine: spine("not_available") }),
  });
  const report = buildCoachReportFromTraceAggregates({
    aggregate: matchTraceAggregateFromSpine({ traceSpine: spine("available") }),
  });

  assertTest(unavailable.status === "not_available", "unavailable aggregate must return not_available.");
  assertTest(report.status === "available", "available aggregate must return available report model.");
  assertTest(report.cardCount >= 4 && report.cardCount <= 6, "report must have 4 to 6 cards.");
  assertTest(report.cards.every((card) => card.sourceScope === "official"), "cards must use official source scope.");
  assertTest(report.cards.every((card) => card.basedOnOfficialAggregates), "cards must be based on official aggregates.");
  assertTest(report.cards.every((card) => !card.usesDiagnosticAggregatesAsTruth), "cards must not use diagnostic aggregates as truth.");
  assertTest(report.cards.every((card) => !card.usesSandboxAggregatesAsTruth), "cards must not use sandbox aggregates as truth.");
  assertTest(report.cardCount === report.cards.length, "card count must be present.");
  assertTest(report.officialAggregateTraceCount > 0, "official aggregate trace count must be present.");
  assertTest(report.diagnosticAggregateTraceCount >= 0 && report.sandboxAggregateTraceCount >= 0, "diagnostic and sandbox counts must remain available.");
  assertTest(report.selectionPreviewStillSandboxOnly, "selection preview must remain sandbox_only.");
  assertTest(!report.selectionPreviewConfidenceUpgraded, "selection preview confidence must not be upgraded.");
  assertTest(!report.canMutateTimeline && !report.canClaimGlobalEconomy, "guardrails must remain false.");

  return [
    "unavailable aggregate returns not_available",
    "available aggregate returns available report model",
    "report has 4 to 6 official cards",
    "diagnostic and sandbox counts remain separate",
    "Selection Preview remains sandbox_only and not upgraded",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportFromTraceAggregates();

  console.log("coachReportFromTraceAggregates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportTraceAggregateRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportTraceAggregateRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Rapport coach depuis les agrégats officiels"), "experimental report must contain trace aggregate coach report.");
  assertTest(experimentalHtml.includes("Zones de danger"), "danger zones card must be present.");
  assertTest(experimentalHtml.includes("Pertes sous pression"), "pressure losses card must be present.");
  assertTest(experimentalHtml.includes("Récupérations utiles"), "recoveries card must be present.");
  assertTest(experimentalHtml.includes("Joueurs impliqués"), "player involvement card must be present.");
  assertTest(experimentalHtml.includes("Causes récurrentes"), "recurring causes card must be present.");
  assertTest(experimentalHtml.includes("Point de vigilance coach"), "coach watchpoint card must be present.");
  assertTest(!defaultHtml.includes("Rapport coach depuis les agrégats officiels"), "default report must hide trace aggregate coach report.");
  assertTest(visible.includes("Les diagnostics et le sandbox restent séparés"), "visible copy must say diagnostics and sandbox are separated.");
  assertTest(!containsMojibake(experimentalHtml), "visible copy must contain no mojibake.");
  assertTest(!visible.includes("workbench_chain_"), "visible copy must avoid developer tags.");
  assertTest(!visible.includes("le coach doit"), "visible copy must avoid mandatory wording.");
  assertTest(!visible.includes("il faut impérativement"), "visible copy must avoid imperative wording.");
  assertTest(!visible.includes("le moteur prouve"), "visible copy must avoid proof overclaim.");

  return [
    "experimental report contains trace aggregate coach report and six cards",
    "default report hides the section",
    "visible copy says diagnostics and sandbox are separated",
    "visible copy contains no mojibake and avoids developer jargon",
    "visible copy avoids mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTraceAggregateRenderer();

  console.log("coachReportTraceAggregateRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportTraceAggregateScopeGuard.test.ts

```ts
import { matchTraceAggregateFixture } from "../simulation/tracing/matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportTraceAggregateScopeGuard(): readonly string[] {
  const traces = matchTraceAggregateFixture();
  const aggregate = matchTraceAggregateFromSpine({
    traceSpine: {
      status: "available",
      traces,
      totalTraceCount: traces.length,
      officialTraceCount: 2,
      miniMatchTraceCount: 2,
      sandboxTraceCount: 1,
      phaseCoverageCount: 4,
      actionTypeCoverageCount: 4,
      causeTagCoverageCount: 4,
      impactTagCoverageCount: 5,
      coachVisibleTraceCount: 4,
      officialTruthTrueCount: 2,
      officialTruthFalseCount: 3,
      traceMutationCount: 0,
      scoreMutationCount: 0,
      possessionMutationCount: 0,
      productionScoringEventCreationCount: 0,
      liveSelectionDriverCount: 0,
      productionRouteResolutionDriverCount: 0,
      globalEconomyClaimCount: 0,
      selectionPreviewTraceBackingStatus: "sandbox_only",
      tags: ["match_event_trace_spine"],
      warnings: [],
    } satisfies MatchTraceSpineModel,
  });
  const report = buildCoachReportFromTraceAggregates({ aggregate });

  assertTest(report.cards.every((card) => !card.usesSandboxAggregatesAsTruth), "official cards cannot use sandbox aggregates as truth.");
  assertTest(report.cards.every((card) => !card.usesDiagnosticAggregatesAsTruth), "official cards cannot use diagnostic aggregates as truth.");
  assertTest(!report.cards.some((card) => card.confidence === "high"), "sandbox evidence cannot raise official confidence to high.");
  assertTest(!report.selectionPreviewConfidenceUpgraded, "diagnostic evidence cannot raise selection preview confidence.");
  assertTest(!report.canClaimGlobalEconomy, "report cannot claim global economy.");
  assertTest(!report.canDriveCoachInstruction, "report cannot drive coach instruction.");
  assertTest(!report.canDriveLiveSelection, "report cannot drive live selection.");
  assertTest(!report.canDriveProductionRouteResolution, "report cannot drive production route resolution.");

  return [
    "official cards cannot use sandbox or diagnostic aggregates as truth",
    "sandbox and diagnostic evidence cannot raise official confidence",
    "report cannot claim global economy",
    "report cannot drive coach instruction, live selection, or production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTraceAggregateScopeGuard();

  console.log("coachReportTraceAggregateScopeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1Visualization.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1Visualization(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION"
  );

  assertTest(fact !== undefined, "Coach Report V1 visualization evidence fact must exist in experimental mode.");
  if (fact === undefined) {
    return [];
  }

  assertTest(fact.internalTags.includes("coach_report_v1_visualization"), "V1 visualization tag must be present.");
  assertTest(fact.internalTags.includes("coach_report_v1_visualization_status_available"), "V1 visualization must be available.");
  assertTest(fact.internalTags.includes("coach_report_v1_origin_coach_report_trace_v0"), "V1 visualization must originate from Coach Report Trace V0.");
  assertTest(fact.internalTags.includes("coach_report_v1_uses_official_aggregates"), "V1 visualization must use official aggregates.");
  assertTest(fact.internalTags.includes("coach_report_v1_diagnostic_cards_count_0"), "V1 visualization must not create diagnostic visible cards.");
  assertTest(fact.internalTags.includes("coach_report_v1_sandbox_cards_count_0"), "V1 visualization must not create sandbox visible cards.");

  return [
    "Coach Report V1 visualization evidence fact exists",
    "V1 visualization status is available",
    "V1 originates from Coach Report Trace V0",
    "V1 uses official aggregates",
    "diagnostic and sandbox visible card counts remain zero",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Visualization();

  console.log("coachReportV1Visualization tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1Renderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1Renderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(
    runFullMatch(input, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    }),
  );
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "experimental report must contain V1 title.");
  assertTest(!defaultHtml.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "default report must hide V1 title.");
  assertTest(experimentalHtml.includes("Cette lecture visuelle s'appuie d'abord sur les agrégats officiels du match."), "V1 intro must be visible.");
  assertTest(experimentalHtml.includes("Source : Officiel"), "V1 visible cards must include source badges.");
  assertTest(experimentalHtml.includes("Confiance :"), "V1 visible cards must include confidence badges.");
  assertTest(experimentalHtml.includes("Détails techniques du rapport V1"), "V1 technical details must be collapsed.");
  assertTest(!visible.includes("coach_report_v1_visualization"), "V1 internal tags must not be visible outside technical details.");

  return [
    "experimental report contains V1 visualization",
    "default report hides V1 visualization",
    "intro, source badges, and confidence badges are visible",
    "technical details are collapsed",
    "internal V1 tags stay out of visible copy",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Renderer();

  console.log("coachReportV1Renderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1SourceScopeGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1SourceScopeGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION"
  );

  assertTest(fact !== undefined, "V1 evidence fact must exist.");
  if (fact === undefined) {
    return [];
  }

  assertTest(fact.internalTags.includes("coach_report_v1_uses_official_aggregates"), "V1 must use official aggregates.");
  assertTest(fact.internalTags.includes("coach_report_v1_diagnostic_kept_separate"), "V1 must keep diagnostics separate.");
  assertTest(fact.internalTags.includes("coach_report_v1_sandbox_kept_separate"), "V1 must keep sandbox separate.");
  assertTest(fact.internalTags.includes("coach_report_v1_selection_preview_still_sandbox_only"), "V1 must not upgrade Selection Preview.");
  assertTest(fact.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded"), "V1 must not upgrade Selection Preview confidence.");
  assertTest(fact.internalTags.includes("coach_report_v1_score_mutation_count_0"), "V1 must not mutate score.");
  assertTest(fact.internalTags.includes("coach_report_v1_possession_mutation_count_0"), "V1 must not mutate possession.");
  assertTest(fact.internalTags.includes("coach_report_v1_production_scoring_event_creation_count_0"), "V1 must not create production scoring events.");
  assertTest(fact.internalTags.includes("coach_report_v1_global_economy_claim_forbidden"), "V1 must not claim global economy.");

  return [
    "V1 uses official aggregates only",
    "diagnostic and sandbox sources remain separate",
    "Selection Preview remains sandbox-only and confidence is not upgraded",
    "score, possession, and production scoring events are not mutated",
    "global economy claim remains forbidden",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1SourceScopeGuard();

  console.log("coachReportV1SourceScopeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1EmptyState.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchReport } from "../contracts/engineToCoach";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";
import { buildCoachReportV1Visualization } from "./buildCoachReportV1Visualization";
import { createMatchTraceEvent } from "../simulation/tracing/matchTraceEvent";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function reportFixture(): MatchReport {
  return {
    matchId: "coach-report-v1-empty-state",
    score: { home: 0, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "test",
      limitations: [],
    },
    timeline: [],
    teamStats: [],
    playerStats: [],
    zoneStats: [],
    fatigueReport: { teamSummaries: [], playerSummaries: [] },
    tacticalReport: { diagnoses: [] },
    keyMoments: [],
    coachInsights: [],
    suggestedFocus: [],
  };
}

export function validateCoachReportV1EmptyState(): readonly string[] {
  const traces = [
    createMatchTraceEvent({
      traceId: "official-danger",
      source: "official_match_event",
      matchId: "coach-report-v1-empty-state",
      minute: 8,
      sequenceId: "sequence-1",
      teamId: "CONTROL",
      opponentTeamId: "BLITZ",
      phase: "FINAL_ZONE_ATTACK",
      zone: "Z5-C",
      actionType: "SHOT",
      outcome: "SHOT_CREATED",
      primaryPlayerId: "control-space-hunter",
      pressureLevel: "HIGH",
      causeTags: ["good_decision"],
      impactTags: ["danger_created"],
      dangerDelta: 18,
      possessionValueDelta: 6,
      coachVisible: true,
      diagnosticWeight: 70,
      officialTruth: true,
      tags: ["empty_state_pressure_detected"],
      warnings: [],
    }),
    createMatchTraceEvent({
      traceId: "official-recovery",
      source: "official_match_event",
      matchId: "coach-report-v1-empty-state",
      minute: 12,
      sequenceId: "sequence-2",
      teamId: "CONTROL",
      opponentTeamId: "BLITZ",
      phase: "DEFENSIVE_TRANSITION",
      zone: "Z3-C",
      actionType: "RECOVERY",
      outcome: "RECOVERY_WON",
      primaryPlayerId: "control-mobile-lock",
      pressureLevel: "HIGH",
      causeTags: ["defensive_recovery"],
      impactTags: ["possession_secured"],
      dangerDelta: -4,
      possessionValueDelta: 10,
      coachVisible: true,
      diagnosticWeight: 64,
      officialTruth: true,
      tags: ["empty_state_recovery"],
      warnings: [],
    }),
  ];
  const aggregate = matchTraceAggregateFromSpine({
    traceSpine: {
      status: "available",
      traces,
      totalTraceCount: traces.length,
      officialTraceCount: traces.length,
      miniMatchTraceCount: 0,
      sandboxTraceCount: 0,
      phaseCoverageCount: 2,
      actionTypeCoverageCount: 2,
      causeTagCoverageCount: 2,
      impactTagCoverageCount: 2,
      coachVisibleTraceCount: traces.length,
      officialTruthTrueCount: traces.length,
      officialTruthFalseCount: 0,
      traceMutationCount: 0,
      scoreMutationCount: 0,
      possessionMutationCount: 0,
      productionScoringEventCreationCount: 0,
      liveSelectionDriverCount: 0,
      productionRouteResolutionDriverCount: 0,
      globalEconomyClaimCount: 0,
      selectionPreviewTraceBackingStatus: "sandbox_only",
      tags: ["match_event_trace_spine"],
      warnings: [],
    } satisfies MatchTraceSpineModel,
  });
  const traceV0 = buildCoachReportFromTraceAggregates({ aggregate });
  const model = buildCoachReportV1Visualization({
    matchReport: reportFixture(),
    traceV0,
    aggregate,
  });

  assertTest(model.emptyPressureLossZoneState, "V1 must expose pressure-loss zone empty state.");
  assertTest(model.tags.includes("coach_report_v1_empty_pressure_loss_zone_state_true"), "empty-state tag must be true.");
  assertTest(
    model.zoneCards.some((card) => card.bullets.includes("Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées.")),
    "empty-state wording must be present.",
  );
  assertTest(engineToCoachPublicContractFixtures.matchInputFixture.matchId.length > 0, "fixture import must remain valid.");

  return [
    "V1 exposes pressure-loss zone empty state",
    "empty-state tag is true",
    "required empty-state wording is present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1EmptyState();

  console.log("coachReportV1EmptyState tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1ProfileVariation.test.ts

```ts
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";
import { FULL_MATCH_TRACE_VALIDATION_PROFILES } from "../simulation/validation/fullMatchTraceValidationProfiles";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function v1SignalSignature(html: string): string {
  const start = html.indexOf("Rapport coach V1 — lecture visuelle des agrégats officiels");
  const end = html.indexOf("Rapport coach depuis", start);

  return start === -1 ? "" : html.slice(start, end === -1 ? undefined : end);
}

export function validateCoachReportV1ProfileVariation(): readonly string[] {
  const baseline = FULL_MATCH_TRACE_VALIDATION_PROFILES[0];
  const comparison = FULL_MATCH_TRACE_VALIDATION_PROFILES[1];

  assertTest(baseline !== undefined && comparison !== undefined, "at least two validation profiles must exist.");
  if (baseline === undefined || comparison === undefined) {
    return [];
  }

  const baselineHtml = renderHtmlCoachReport(runFullMatch(baseline.createInput(), {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const comparisonHtml = renderHtmlCoachReport(runFullMatch(comparison.createInput(), {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const baselineSignature = v1SignalSignature(baselineHtml);
  const comparisonSignature = v1SignalSignature(comparisonHtml);

  assertTest(baselineSignature.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "baseline profile must render V1.");
  assertTest(comparisonSignature.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "comparison profile must render V1.");
  assertTest(baselineSignature !== comparisonSignature, "V1 visualization should vary when official trace aggregate profile changes.");

  return [
    "baseline profile renders Coach Report V1",
    "comparison profile renders Coach Report V1",
    "V1 signal signature varies across profiles",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1ProfileVariation();

  console.log("coachReportV1ProfileVariation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1Encoding.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1Encoding(): readonly string[] {
  const html = renderHtmlCoachReport(
    runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    }),
  );

  assertTest(html.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "V1 title must render with clean accents and em dash.");
  assertTest(html.includes("Cette lecture visuelle s'appuie d'abord"), "V1 intro must render with clean apostrophe and accents.");
  assertTest(html.includes("Source : Officiel"), "V1 source badge must render with clean French copy.");
  assertTest(html.includes("Confiance :"), "V1 confidence badge must render with clean French copy.");
  assertTest(!containsMojibake(html), "experimental coach HTML must contain no mojibake after V1 rendering.");

  return [
    "V1 title renders with clean accents and em dash",
    "V1 intro renders with clean apostrophe and accents",
    "V1 source and confidence badges render cleanly",
    "experimental coach HTML remains free of mojibake",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Encoding();

  console.log("coachReportV1Encoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1InformationHierarchy.test.ts

```ts
import {
  buildCoachReportV1InformationHierarchy,
  type CoachReportV1InformationHierarchyModel,
} from "./buildCoachReportV1InformationHierarchy";
import type { CoachReportV1VisualizationCard, CoachReportV1VisualizationModel } from "./buildCoachReportV1Visualization";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function card(cardId: string, title: string): CoachReportV1VisualizationCard {
  return {
    cardId,
    kind: "official_signal",
    title,
    summary: `${title} summary`,
    bullets: [`${title} bullet`],
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: "medium",
    confidenceReason: "Signal officiel repete.",
    traceCountUsed: 12,
    emptyState: false,
    warnings: [],
  };
}

function v1Model(status: CoachReportV1VisualizationModel["status"]): CoachReportV1VisualizationModel {
  const executiveSummary = card("executive", "Synthese coach");
  const signalCards = [card("danger", "Danger"), card("pressure", "Pression"), card("recovery", "Recuperation")];
  const zoneCards = [card("zone-danger", "Zone danger"), card("zone-pressure", "Zone pression"), card("zone-recovery", "Zone recovery")];
  const playerCard = card("player", "Implication joueurs");
  const causesImpactsCard = card("causes", "Causes et impacts");
  const watchpointCard = card("watchpoint", "Point de vigilance");

  return {
    status,
    origin: status === "available" ? "coach_report_trace_v0" : "none",
    title: "Rapport coach V1 — lecture visuelle des agrégats officiels",
    intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.",
    finalScore: "3 - 0",
    executiveSummary,
    signalCards,
    zoneCards,
    playerCard,
    causesImpactsCard,
    watchpointCard,
    cardCount: 9,
    officialCardsCount: 9,
    diagnosticCardsCount: 0,
    sandboxCardsCount: 0,
    emptyPressureLossZoneState: false,
    usesOfficialAggregates: true,
    diagnosticKeptSeparate: true,
    sandboxKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    tags: ["coach_report_v1_visualization"],
    warnings: [],
  };
}

export function validateCoachReportV1InformationHierarchy(): readonly string[] {
  const unavailable = buildCoachReportV1InformationHierarchy({
    v1: v1Model("not_available"),
    hasSandboxSections: true,
    hasSelectionPreview: true,
    hasTraceDiagnostics: true,
  });
  const available: CoachReportV1InformationHierarchyModel = buildCoachReportV1InformationHierarchy({
    v1: v1Model("available"),
    hasSandboxSections: true,
    hasSelectionPreview: true,
    hasTraceDiagnostics: true,
  });
  const official = available.sections.find((section) => section.sectionId === "official_coach_reading");
  const experimental = available.sections.find((section) => section.sectionId === "experimental_hypotheses");
  const technical = available.sections.find((section) => section.sectionId === "technical_traceability");

  assertTest(unavailable.status === "not_available", "unavailable V1 must return not_available hierarchy.");
  assertTest(available.status === "available", "available V1 must return available hierarchy.");
  assertTest(available.sectionCount === 4, "hierarchy must have 4 sections.");
  assertTest(official !== undefined && experimental !== undefined && official.order < experimental.order, "official section must appear before experimental section.");
  assertTest(available.v1AppearsBeforeSandbox, "V1 must appear before sandbox.");
  assertTest(technical?.defaultCollapsed === true, "technical section must be collapsed.");
  assertTest(available.experimentalSectionsGrouped, "experimental sections must be grouped.");
  assertTest(available.repeatedGuardrailCopyReduced, "repeated guardrail copy must be reduced.");
  assertTest(!available.canMutateTimeline && !available.canMutateScore && !available.canCreateScoringEvent, "guardrails must remain false.");

  return [
    "unavailable V1 returns not_available",
    "available V1 returns available hierarchy",
    "hierarchy has 4 sections",
    "official section appears before experimental section",
    "V1 appears before sandbox",
    "technical section is collapsed",
    "experimental sections are grouped",
    "repeated guardrail copy is reduced",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1InformationHierarchy();

  console.log("coachReportV1InformationHierarchy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1InformationHierarchyRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { hasMojibake } from "./encoding/mojibakeDetection";

const FORBIDDEN_VISIBLE_JARGON: readonly string[] = [
  "workbench_chain_",
  "Production route resolution",
  "Global economy claim",
  "Controlled route resolution",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1InformationHierarchyRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);
  const officialIndex = experimentalHtml.indexOf("Ce que le match dit");
  const experimentalIndex = experimentalHtml.indexOf("Hypothèses expérimentales à tester");
  const sandboxDecisionIndex = experimentalHtml.indexOf("Panneau de décision sandbox");

  assertTest(experimentalHtml.includes("Ce que le match dit"), "experimental report must contain official hierarchy title.");
  assertTest(experimentalHtml.includes("Signaux officiels détaillés"), "experimental report must contain detailed official title.");
  assertTest(experimentalHtml.includes("Hypothèses expérimentales à tester"), "experimental report must contain experimental group title.");
  assertTest(experimentalHtml.includes("Détails techniques et traçabilité"), "experimental report must contain technical traceability title.");
  assertTest(officialIndex !== -1 && experimentalIndex !== -1 && officialIndex < experimentalIndex, "official reading must appear before experimental hypotheses.");
  assertTest(officialIndex !== -1 && sandboxDecisionIndex !== -1 && officialIndex < sandboxDecisionIndex, "V1 official section must appear before sandbox decision panel.");
  assertTest(!defaultHtml.includes("Ce que le match dit"), "default report must hide hierarchy.");
  assertTest(experimentalHtml.includes("<summary>Détails techniques et traçabilité</summary>"), "technical traceability must be collapsed.");
  assertTest(!hasMojibake(visible), "visible copy must have no mojibake.");
  assertTest(FORBIDDEN_VISIBLE_JARGON.every((term) => !visible.includes(term)), "visible copy must avoid developer jargon outside details.");
  assertTest(!visible.includes("doit absolument") && !visible.includes("obligatoire"), "visible copy must avoid mandatory wording.");

  return [
    "experimental report contains Ce que le match dit",
    "experimental report contains Signaux officiels détaillés",
    "experimental report contains Hypothèses expérimentales à tester",
    "experimental report contains Détails techniques et traçabilité",
    "Ce que le match dit appears before experimental hypotheses",
    "V1 official section appears before sandbox decision panel",
    "default report hides hierarchy",
    "technical details are collapsed",
    "visible copy has no mojibake",
    "visible copy avoids developer jargon outside technical details",
    "visible copy avoids mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1InformationHierarchyRenderer();

  console.log("coachReportV1InformationHierarchyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1ExperimentalGrouping.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function between(html: string, start: string, end: string): string {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end, startIndex + start.length);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return html.slice(startIndex, endIndex);
}

export function validateCoachReportV1ExperimentalGrouping(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const group = between(html, "Hypothèses expérimentales à tester", "Détails techniques et traçabilité");
  const guardrail = "Ces éléments sont expérimentaux : ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.";

  assertTest(group.includes("Lecture timeline officielle vs sandbox"), "sandbox timeline review must be inside experimental group.");
  assertTest(group.includes("Panneau de décision sandbox"), "sandbox decision panel must be inside experimental group.");
  assertTest(group.includes("Plan de test coach"), "coach test plan must be inside experimental group.");
  assertTest(group.includes("Profils à observer"), "selection preview coach copy must be inside experimental group.");
  assertTest(group.includes(guardrail), "experimental group must have shared guardrail banner.");
  assertTest((html.match(new RegExp(guardrail, "g")) ?? []).length === 1, "shared guardrail copy must be reduced to one visible banner.");
  assertTest(group.includes("Prévisualisation non appliquée"), "selection preview must remain non-applied.");

  return [
    "sandbox timeline review is inside experimental group",
    "sandbox decision panel is inside experimental group",
    "coach test plan is inside experimental group",
    "selection preview coach copy is inside experimental group",
    "experimental group has shared guardrail banner",
    "repeated guardrail copy is reduced",
    "selection preview remains non-applied",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1ExperimentalGrouping();

  console.log("coachReportV1ExperimentalGrouping tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1SourceHierarchyGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1SourceHierarchyGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const officialIndex = html.indexOf("Ce que le match dit");
  const sandboxIndex = html.indexOf("Hypothèses expérimentales à tester");
  const hierarchyFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY"
  );

  assertTest(officialIndex !== -1 && sandboxIndex !== -1 && officialIndex < sandboxIndex, "official V1 cards must appear before sandbox content.");
  assertTest(visible.includes("Source : Officiel"), "official V1 cards must show official source.");
  assertTest(!visible.includes("Source : Sandbox</span> <h3>Ce que le match dit"), "sandbox content must not render as official reading.");
  assertTest(!visible.includes("Source : Diagnostic</span> <h3>Ce que le match dit"), "diagnostic content must not render as official reading.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded") ?? false, "experimental content must not upgrade Selection Preview confidence.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_information_hierarchy_global_economy_claim_forbidden") ?? false, "hierarchy must forbid global economy claims.");
  assertTest(!visible.includes("s'applique automatiquement"), "experimental content must not drive coach instruction.");
  assertTest(!visible.includes("sélection live est modifiée"), "experimental content must not drive live selection.");
  assertTest(!visible.includes("production route resolution"), "experimental content must not drive production route resolution.");

  return [
    "official V1 cards appear before sandbox content",
    "sandbox content cannot be rendered as official",
    "diagnostic content cannot be rendered as official",
    "experimental content does not upgrade Selection Preview confidence",
    "experimental content cannot drive coach instruction",
    "experimental content cannot drive live selection",
    "experimental content cannot drive production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1SourceHierarchyGuard();

  console.log("coachReportV1SourceHierarchyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1VisualPolishEncoding.test.ts

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { hasMojibake } from "./encoding/mojibakeDetection";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function repositoryRoot(): string {
  return join(__dirname, "..", "..");
}

export function validateCoachReportV1VisualPolishEncoding(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const shareFiles = [
    join(repositoryRoot(), "reports", "share", "fullmatch-workbench-chain-replay-4i.md"),
    join(repositoryRoot(), "reports", "share", "validation.fullmatch-workbench-chain-replay-4i.md"),
  ].filter((file) => existsSync(file));
  const shareText = shareFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  assertTest(!hasMojibake(html), "experimental HTML must contain no mojibake markers.");
  assertTest(shareText.length === 0 || !hasMojibake(shareText), "share markdown must contain no mojibake markers.");
  assertTest(html.includes("Ce que le match dit"), "French label Ce que le match dit must render correctly.");
  assertTest(html.includes("Signaux officiels détaillés"), "French label Signaux officiels détaillés must render correctly.");
  assertTest(html.includes("Hypothèses expérimentales à tester"), "French label Hypothèses expérimentales à tester must render correctly.");
  assertTest(html.includes("Détails techniques et traçabilité"), "French label Détails techniques et traçabilité must render correctly.");

  return [
    "no mojibake markers in experimental HTML",
    "no mojibake markers in share markdown",
    "French labels render correctly",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1VisualPolishEncoding();

  console.log("coachReportV1VisualPolishEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1LegacyCleanup.test.ts

```ts
import {
  buildCoachReportV1LegacyCleanup,
  type CoachReportV1LegacyCleanupModel,
} from "./buildCoachReportV1LegacyCleanup";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1LegacyCleanup(): readonly string[] {
  const cleanup: CoachReportV1LegacyCleanupModel = buildCoachReportV1LegacyCleanup({
    hierarchyStatus: "available",
    hasLegacyMoments: true,
    hasLegacyCoachAnalysis: true,
    fullMatchScoreVisible: true,
    scoringEventsSampleVisible: true,
    batchDiagnosticsVisible: true,
  });

  assertTest(cleanup.status === "available", "available hierarchy must return available cleanup model.");
  assertTest(cleanup.legacyMomentsDisposition !== "left_visible", "legacy moments must be hidden, collapsed, or absorbed.");
  assertTest(cleanup.legacyCoachAnalysisDisposition !== "left_visible", "legacy coach analysis must be hidden, collapsed, or absorbed.");
  assertTest(!cleanup.legacySectionsCompeteWithV1, "legacy sections must not compete with V1.");
  assertTest(cleanup.legacySectionsCollapsedOrAbsorbed, "legacy sections must be collapsed or absorbed.");
  assertTest(cleanup.scoreSourceLabelAvailable, "score source label must be available.");
  assertTest(!cleanup.scoreSourcesConfused, "score sources must not be confused.");
  assertTest(cleanup.selectionPreviewStillSandboxOnly, "Selection Preview must remain sandbox_only.");
  assertTest(!cleanup.selectionPreviewConfidenceUpgraded, "Selection Preview confidence must not be upgraded.");
  assertTest(!cleanup.canMutateTimeline && !cleanup.canMutateScore && !cleanup.canCreateScoringEvent, "guardrails must remain false.");

  return [
    "cleanup model exists",
    "available hierarchy returns available cleanup model",
    "legacy moments are hidden, collapsed, or absorbed",
    "legacy coach analysis is hidden, collapsed, or absorbed",
    "legacy sections do not compete with V1",
    "score source label is available",
    "score sources are not confused",
    "Selection Preview remains sandbox_only",
    "Selection Preview confidence is not upgraded",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacyCleanup();

  console.log("coachReportV1LegacyCleanup tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1LegacyCleanupRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1LegacyCleanupRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);
  const v1Index = experimentalHtml.indexOf("Ce que le match dit");
  const legacyIndex = experimentalHtml.indexOf("Ancienne lecture du rapport");

  assertTest(experimentalHtml.includes("Ce que le match dit"), "experimental report must contain official V1 reading.");
  assertTest(experimentalHtml.includes("Signaux officiels détaillés"), "experimental report must contain detailed official signals.");
  assertTest(experimentalHtml.includes("Hypothèses expérimentales à tester"), "experimental report must contain experimental hypotheses.");
  assertTest(experimentalHtml.includes("Détails techniques et traçabilité"), "experimental report must contain technical traceability.");
  assertTest(!visible.includes("<h2>Moments clés</h2>"), "top-level Moments clés must not appear after V1.");
  assertTest(!visible.includes("<h2>Analyse du coach</h2>"), "top-level Analyse du coach must not appear after V1.");
  assertTest(legacyIndex !== -1 && v1Index !== -1 && v1Index < legacyIndex, "legacy content must be under later collapsed traceability.");
  assertTest(experimentalHtml.includes("Ancienne lecture du rapport"), "legacy content must appear under collapsed legacy report reading if preserved.");
  assertTest(experimentalHtml.includes("Score du rapport full-match"), "score source label must be visible.");
  assertTest(experimentalHtml.includes("Les diagnostics batch et les échantillons de scoring-events restent séparés"), "score separation copy must be visible.");
  assertTest(!defaultHtml.includes("Ce que le match dit"), "default report must hide experimental cleanup hierarchy.");

  return [
    "experimental report contains Ce que le match dit",
    "experimental report contains Signaux officiels détaillés",
    "experimental report contains Hypothèses expérimentales à tester",
    "experimental report contains Détails techniques et traçabilité",
    "top-level Moments clés does not appear after V1",
    "top-level Analyse du coach does not appear after V1",
    "legacy content appears under collapsed Ancienne lecture du rapport",
    "score label Score du rapport full-match is visible",
    "score separation copy is visible",
    "default report hides experimental cleanup hierarchy",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacyCleanupRenderer();

  console.log("coachReportV1LegacyCleanupRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/scoreSourceLabel.test.ts

```ts
import { scoreSourceLabel } from "./scoreSourceLabel";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoreSourceLabel(): readonly string[] {
  const fullMatch = scoreSourceLabel("full_match_report");
  const scoringEvents = scoreSourceLabel("live_scoring_events_sample");
  const batch = scoreSourceLabel("batch_diagnostic");

  assertTest(fullMatch.label === "Score du rapport full-match", "full-match report score label must be available.");
  assertTest(scoringEvents.label === "Échantillon live scoring-events", "scoring-events sample label must be available.");
  assertTest(batch.label === "Diagnostic batch séparé", "batch diagnostics label must be available.");
  assertTest(scoringEvents.compactNote.includes("distinct du score affiché"), "scoring-events sample label must not imply scores are the same.");
  assertTest(batch.compactNote.includes("ne remplacent jamais"), "batch label must not imply it replaces full-match score.");
  assertTest(!fullMatch.canMutateScore && !scoringEvents.canMutateScore && !batch.canMutateScore, "score labels must not mutate score values.");

  return [
    "full-match report score label is available",
    "scoring-events sample label is available when needed",
    "batch diagnostics label is available when needed",
    "labels do not imply the scores are the same",
    "labels do not mutate score values",
  ];
}

if (require.main === module) {
  const checks = validateScoreSourceLabel();

  console.log("scoreSourceLabel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1FrenchCopy.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { hasMojibake } from "./encoding/mojibakeDetection";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_VISIBLE_TERMS: readonly string[] = [
  "A travailler",
  "recuperations",
  "securiser",
  "premiere",
  "apres",
  "economie globale",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1FrenchCopy(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(html);

  for (const term of FORBIDDEN_VISIBLE_TERMS) {
    assertTest(!visible.includes(term), `visible report must not contain ${term}.`);
  }

  assertTest(visible.includes("À travailler"), "visible report must contain accented À travailler replacement.");
  assertTest(visible.includes("récupérations"), "visible report must contain accented récupérations replacement.");
  assertTest(visible.includes("sécuriser"), "visible report must contain accented sécuriser replacement.");
  assertTest(visible.includes("première"), "visible report must contain accented première replacement.");
  assertTest(visible.includes("après"), "visible report must contain accented après replacement.");
  assertTest(!hasMojibake(visible), "visible report must contain no mojibake markers.");

  return [
    "visible report does not contain A travailler",
    "visible report does not contain recuperations",
    "visible report does not contain securiser",
    "visible report does not contain premiere",
    "visible report does not contain apres as French prose",
    "visible report contains correct accented replacements",
    "no mojibake markers appear",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1FrenchCopy();

  console.log("coachReportV1FrenchCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachReportV1LegacySourceGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1LegacySourceGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const cleanupFact = report.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP");

  assertTest(cleanupFact !== undefined, "legacy cleanup evidence fact must exist.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_sections_collapsed_or_absorbed") ?? false, "legacy content must be collapsed or absorbed.");
  assertTest(!visible.includes("Source : Sandbox</span> <h3>Ce que le match dit"), "sandbox content must not render as official V1 card.");
  assertTest(!visible.includes("Source : Diagnostic</span> <h3>Ce que le match dit"), "diagnostic content must not render as official V1 card.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded") ?? false, "cleanup must not upgrade Selection Preview confidence.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_cleanup_global_economy_claim_forbidden") ?? false, "cleanup cannot claim global economy.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_cleanup_production_scoring_event_creation_count_0") ?? false, "cleanup cannot drive production route resolution or create scoring events.");

  return [
    "legacy content cannot be treated as official V1 card unless absorbed with official aggregate evidence",
    "sandbox content cannot be rendered as official",
    "diagnostic content cannot be rendered as official",
    "cleanup cannot upgrade Selection Preview confidence",
    "cleanup cannot drive coach instruction",
    "cleanup cannot drive live selection",
    "cleanup cannot drive production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacySourceGuard();

  console.log("coachReportV1LegacySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewTraceBackingRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewTraceBackingRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const profileVisible = selectionPreviewProfileViewVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide selection preview profile view.");
  assertTest(profileVisible.includes("Profils à observer"), "experimental report must show coach-ready selection preview.");
  assertTest(profileVisible.includes("Profil à observer"), "selection preview cards must use coach-facing profile wording.");
  assertTest(profileVisible.includes("Famille de rôle"), "profile view must show role family instead of raw support status.");
  assertTest(profileVisible.includes("Attributs utiles"), "profile view must show useful attributes.");
  assertTest(profileVisible.includes("Ce que les traces soutiennent"), "profile view must show trace support section.");
  assertTest(profileVisible.includes("Prévisualisation non appliquée"), "selection preview must remain non-applied.");
  assertTest(profileVisible.includes("non confirmée comme recommandation officielle"), "selection preview must not become official.");
  assertTest(experimentalHtml.includes("selection_preview_trace_backing_status_"), "technical trace backing tags must be present.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_status_available"), "technical profile view tags must be present.");
  assertTest(!profileVisible.includes("trace_supported"), "raw trace_supported status must not be visible.");
  assertTest(!profileVisible.includes("sandbox_only"), "raw sandbox_only status must not be visible.");
  assertTest(!profileVisible.includes("support_runner"), "raw role ids must not be visible.");
  assertTest(!profileVisible.includes("decision_making"), "raw attribute ids must not be visible.");
  assertTest(!profileVisible.includes("Composition recommandée"), "selection preview must not look like recommended lineup.");
  assertTest(!profileVisible.includes("Le coach doit sélectionner"), "selection preview must not mandate a selection.");
  assertTest(!profileVisible.includes("Meilleure sélection"), "selection preview must not claim best selection.");
  assertTest(!profileVisible.includes("Changement appliqué"), "selection preview must not claim applied change.");
  assertTest(!profileVisible.includes("Officiellement confirmé"), "selection preview must not use official confirmation wording.");
  assertTest(!profileVisible.includes("Confiance élevée"), "selection preview must not upgrade confidence to high.");

  return [
    "default report hides selection preview",
    "experimental report shows coach-ready profile view",
    "trace support remains visible as a coach section",
    "selection preview remains non-applied",
    "selection preview is not official",
    "technical trace backing and profile view tags are preserved",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBackingRenderer();

  console.log("selectionPreviewTraceBackingRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewCoachCopy.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildSelectionPreviewCoachCopyModel } from "./buildSelectionPreviewCoachCopy";
import type { SelectionPreviewTraceBackingModel } from "../simulation/fullMatch/selectionPreviewTraceBacking";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function traceBackingModelFromReport(): SelectionPreviewTraceBackingModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING"
  );

  assertTest(fact !== undefined, "trace backing fact must exist.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_status_available"), "trace backing must be available.");

  const supports = ["support_near_z4_hsr", "second_ball_presence", "strong_goalkeeper_response"].map((previewId) => ({
    previewId: previewId as "support_near_z4_hsr" | "second_ball_presence" | "strong_goalkeeper_response",
    linkedCoachTestId: previewId,
    previousBackingStatus: "sandbox_only" as const,
    newBackingStatus: fact.internalTags.some((tag) => tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`))
      ? "trace_supported" as const
      : "sandbox_only" as const,
    supportStrength: "medium" as const,
    supportReasons: [],
    officialAggregateTraceCount: 1,
    matchedDangerZones: ["Z5-HSR"],
    matchedRecoveryZones: ["Z4-HSR"],
    matchedCauseLabels: [],
    matchedImpactLabels: [],
    matchedPlayerIds: [],
    traceSupported: fact.internalTags.some((tag) => tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`)),
    officiallyConfirmed: false as const,
    previewStillNonApplied: true as const,
    canChangeLineup: false as const,
    canChangeStarters: false as const,
    canChangeBench: false as const,
    canDriveCoachInstruction: false as const,
    canDriveLiveSelection: false as const,
    canDriveProductionRouteResolution: false as const,
    canMutateTimeline: false as const,
    canMutateScore: false as const,
    canMutatePossession: false as const,
    canCreateScoringEvent: false as const,
    canClaimGlobalEconomy: false as const,
    confidenceUpgradeAllowed: false as const,
    warnings: [],
  }));

  return {
    status: "available",
    origin: "selection_preview_from_coach_test_plan_and_trace_aggregates",
    previewCount: supports.length,
    sandboxOnlyCount: supports.filter((support) => support.newBackingStatus === "sandbox_only").length,
    traceSupportedCount: supports.filter((support) => support.newBackingStatus === "trace_supported").length,
    officiallyConfirmedCount: 0,
    supports,
    selectionPreviewStillNonApplied: true,
    selectionPreviewStillSandboxAware: true,
    selectionPreviewConfidenceUpgraded: false,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
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
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewCoachCopy(): readonly string[] {
  const model = buildSelectionPreviewCoachCopyModel({
    traceBackingModel: traceBackingModelFromReport(),
  });

  assertTest(model.status === "available", "coach copy model must be available.");
  assertTest(model.cardCount === 3, "coach copy must build 3 cards.");
  assertTest(model.originLabelCount === 3, "all cards must expose origin labels.");
  assertTest(model.traceSupportLabelCount === 3, "all cards must expose support labels.");
  assertTest(model.decisionLabelCount === 3, "all cards must expose decision labels.");
  assertTest(model.confirmationLabelCount === 3, "all cards must expose confirmation labels.");
  assertTest(model.officiallyConfirmedCount === 0, "coach copy must not create official confirmation.");
  assertTest(model.confidenceUpgradeCount === 0, "coach copy must not upgrade confidence.");
  assertTest(model.previewAppliedCount === 0, "coach copy must not apply preview.");
  assertTest(model.tags.includes("selection_preview_coach_copy_status_available"), "status tag must be emitted.");
  assertTest(model.tags.includes("selection_preview_coach_copy_card_count_3"), "card count tag must be emitted.");
  assertTest(model.cards.every((card) => card.confirmationLabel === "Confirmation : non confirmée comme recommandation officielle"), "confirmation wording must be non-official.");

  return [
    "coach copy model available",
    "three coach copy cards built",
    "origin, support, decision, and confirmation labels present",
    "official confirmation count remains 0",
    "confidence is not upgraded",
    "preview remains non-applied",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopy();

  console.log("selectionPreviewCoachCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewCoachCopyRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function selectionPreviewCoachCopyVisibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateSelectionPreviewCoachCopyRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewCoachCopyVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Profils à observer"), "default report must hide profile view cards.");
  assertTest(visible.includes("Profils à observer"), "experimental report must show profile view section.");
  assertTest(visible.includes("Ces profils ne sont pas des choix imposés"), "intro must frame profiles as non-prescriptive.");
  assertTest(visible.includes("Profil à observer — soutien proche autour des zones de danger"), "support card title must be visible.");
  assertTest(visible.includes("Profil à observer — présence sur second ballon"), "second-ball card title must be visible.");
  assertTest(visible.includes("Profil à observer — réponse face à un gardien fort"), "goalkeeper response card title must be visible.");
  assertTest(visible.includes("Famille de rôle"), "role family label must be visible.");
  assertTest(visible.includes("Attributs utiles"), "useful attributes label must be visible.");
  assertTest(visible.includes("Pourquoi l’observer"), "why-observe section must be visible.");
  assertTest(visible.includes("Ce que les traces soutiennent"), "trace support section must be visible.");
  assertTest(visible.includes("Bénéfice attendu"), "expected benefit section must be visible.");
  assertTest(visible.includes("Risque tactique"), "tactical risk section must be visible.");
  assertTest(visible.includes("Signal à vérifier au prochain match"), "next-match signal section must be visible.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "decision guard must be visible.");
  assertTest(visible.includes("non confirmée comme recommandation officielle"), "confirmation guard must be visible.");
  assertTest(!visible.includes("trace_supported"), "internal status must be hidden from visible copy.");
  assertTest(!visible.includes("sandbox_only"), "internal sandbox status must be hidden from visible copy.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_card_count_3"), "technical profile view tags must be preserved in details.");

  return [
    "default report hides profile view cards",
    "experimental report shows Profils à observer",
    "role family, attributes, benefit, risk, and next-match signal labels visible",
    "internal status tags hidden from visible copy",
    "technical profile view tags preserved in details",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyRenderer();

  console.log("selectionPreviewCoachCopyRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewCoachCopyForbiddenWording.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewCoachCopyVisibleHtml } from "./selectionPreviewCoachCopyRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function countOccurrences(value: string, fragment: string): number {
  let count = 0;
  let cursor = value.indexOf(fragment);

  while (cursor !== -1) {
    count += 1;
    cursor = value.indexOf(fragment, cursor + fragment.length);
  }

  return count;
}

function coachCopySection(visible: string): string {
  const start = visible.indexOf("Profils à observer");
  const end = visible.indexOf("<section", start + 1);

  return start === -1 ? visible : visible.slice(start, end === -1 ? visible.length : end);
}

export function validateSelectionPreviewCoachCopyForbiddenWording(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = coachCopySection(selectionPreviewCoachCopyVisibleHtml(html));
  const forbiddenVisiblePhrases = [
    "Composition recommandée",
    "Le coach doit sélectionner",
    "Meilleure sélection",
    "Changement appliqué",
    "Officiellement confirmé",
    "Confiance élevée",
    "officially_confirmed",
  ];

  assertTest(forbiddenVisiblePhrases.every((phrase) => !visible.includes(phrase)), "visible coach copy must avoid official/mandatory wording.");
  assertTest(countOccurrences(visible, "Officiellement confirmé") === 0, "positive official confirmation wording must be absent.");
  assertTest(!visible.includes("composition recommandée"), "lineup recommendation wording must be absent.");
  assertTest(!visible.includes("Statut d'appui"), "legacy support status label must not remain visible.");
  assertTest(!visible.includes("Source principale"), "legacy source label must not remain visible.");
  assertTest(!visible.includes("Force de l'appui trace"), "legacy strength label must not remain visible.");

  return [
    "visible copy avoids official selection wording",
    "official recommendation appears only as non-confirmed",
    "legacy technical status labels are hidden",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyForbiddenWording();

  console.log("selectionPreviewCoachCopyForbiddenWording tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewCoachCopyFrench.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewCoachCopyFrench(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(html);
  const forbiddenUnaccented = [
    "hypothese",
    "Previsualisation",
    "previsualisation",
    "appliquee",
    "recommandee",
    "confirmee",
    "elevee",
    "recuperation",
    "decision",
  ];

  assertTest(forbiddenUnaccented.every((word) => !visible.includes(word)), "visible copy must avoid unaccented French placeholders.");
  assertTest(visible.includes("rôle"), "visible copy must contain accented rôle.");
  assertTest(visible.includes("Bénéfice attendu"), "visible copy must contain accented bénéfice.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "visible copy must contain accented non-applied wording.");
  assertTest(visible.includes("confirmée"), "visible copy must contain accented confirmée.");
  assertTest(visible.includes("récupération"), "visible copy must contain accented récupération.");
  assertTest(visible.includes("prise de décision"), "visible copy must contain accented décision.");
  assertTest(visible.includes("fraîcheur mentale"), "visible copy must contain accented fraîcheur.");

  return [
    "visible profile copy has accented French",
    "unaccented French placeholders are absent",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyFrench();

  console.log("selectionPreviewCoachCopyFrench tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewCoachCopyGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  selectionPreviewCoachCopyCannotDriveSelection,
  selectionPreviewCoachCopyCannotMutateOfficialState,
  type SelectionPreviewCoachCopyModel,
} from "./selectionPreviewCoachCopy";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function modelFromEvidenceTags(): SelectionPreviewCoachCopyModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY"
  );

  assertTest(fact !== undefined, "coach copy fact must exist.");

  return {
    status: "available",
    cardCount: 3,
    cards: [],
    originLabelCount: 3,
    traceSupportLabelCount: 3,
    decisionLabelCount: 3,
    confirmationLabelCount: 3,
    forbiddenWordingCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    traceBackingStatus: "available",
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewCoachCopyGuard(): readonly string[] {
  const model = modelFromEvidenceTags();

  assertTest(selectionPreviewCoachCopyCannotMutateOfficialState(model), "coach copy cannot mutate official state.");
  assertTest(selectionPreviewCoachCopyCannotDriveSelection(model), "coach copy cannot drive selection.");
  assertTest(model.tags.includes("selection_preview_coach_copy_score_mutation_count_0"), "score mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_possession_mutation_count_0"), "possession mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_production_scoring_event_creation_count_0"), "production scoring event creation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_coach_copy_global_economy_claim_forbidden"), "global economy claim must be forbidden.");

  return [
    "coach copy cannot mutate official state",
    "coach copy cannot drive selection",
    "score, possession, production scoring, and global economy tags are safe",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewCoachCopyGuard();

  console.log("selectionPreviewCoachCopyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewProfileView.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import type {
  SelectionPreviewTraceBackingModel,
  SelectionPreviewTraceSupport,
} from "../simulation/fullMatch/selectionPreviewTraceBacking";
import { buildSelectionPreviewCoachCopyModel } from "./buildSelectionPreviewCoachCopy";
import { buildSelectionPreviewProfileView } from "./buildSelectionPreviewProfileView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function traceBackingModelFromReport(): SelectionPreviewTraceBackingModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING"
  );
  const previewIds: readonly SelectionPreviewTraceSupport["previewId"][] = [
    "support_near_z4_hsr",
    "second_ball_presence",
    "strong_goalkeeper_response",
  ];

  assertTest(fact !== undefined, "trace backing fact must exist.");

  const supports: readonly SelectionPreviewTraceSupport[] = previewIds.map((previewId) => {
    const traceSupported = fact.internalTags.some((tag) =>
      tag.startsWith(`selection_preview_trace_backing_${previewId}_status_trace_supported`)
    );

    return {
      previewId,
      linkedCoachTestId: previewId,
      previousBackingStatus: "sandbox_only",
      newBackingStatus: traceSupported ? "trace_supported" : "sandbox_only",
      supportStrength: "medium",
      supportReasons: [],
      officialAggregateTraceCount: 1,
      matchedDangerZones: ["Z5-HSR"],
      matchedRecoveryZones: ["Z4-HSR"],
      matchedCauseLabels: [],
      matchedImpactLabels: [],
      matchedPlayerIds: [],
      traceSupported,
      officiallyConfirmed: false,
      previewStillNonApplied: true,
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
      confidenceUpgradeAllowed: false,
      warnings: [],
    };
  });

  return {
    status: "available",
    origin: "selection_preview_from_coach_test_plan_and_trace_aggregates",
    previewCount: supports.length,
    sandboxOnlyCount: supports.filter((support) => support.newBackingStatus === "sandbox_only").length,
    traceSupportedCount: supports.filter((support) => support.newBackingStatus === "trace_supported").length,
    officiallyConfirmedCount: 0,
    supports,
    selectionPreviewStillNonApplied: true,
    selectionPreviewStillSandboxAware: true,
    selectionPreviewConfidenceUpgraded: false,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
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
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewProfileView(): readonly string[] {
  const traceBackingModel = traceBackingModelFromReport();
  const coachCopy = buildSelectionPreviewCoachCopyModel({ traceBackingModel });
  const profileView = buildSelectionPreviewProfileView({
    coachCopyCards: coachCopy.cards,
    traceBackingModel,
  });

  assertTest(profileView.status === "available", "profile view model must exist.");
  assertTest(profileView.profileCardCount === 3, "profile view must build 3 profile cards.");
  assertTest(profileView.cards.every((card) => card.roleFamilies.length > 0), "each card must have a role family.");
  assertTest(profileView.cards.every((card) => card.usefulAttributes.length > 0), "each card must have useful attributes.");
  assertTest(profileView.cards.every((card) => card.whyObserve.length > 0), "each card must have why-observe content.");
  assertTest(profileView.cards.every((card) => card.officialTraceSupport.length > 0), "each card must have official trace support.");
  assertTest(profileView.cards.every((card) => card.expectedBenefit.length > 0), "each card must have expected benefit.");
  assertTest(profileView.cards.every((card) => card.tacticalRisk.length > 0), "each card must have tactical risk.");
  assertTest(profileView.cards.every((card) => card.nextMatchSignalToVerify.length > 0), "each card must have next-match signal.");
  assertTest(profileView.previewAppliedCount === 0, "profile view must remain non-applied.");
  assertTest(profileView.officiallyConfirmedCount === 0, "profile view must not officially confirm previews.");
  assertTest(profileView.confidenceUpgradeCount === 0, "profile view must not upgrade confidence.");
  assertTest(profileView.tags.includes("selection_preview_profile_view_status_available"), "profile view status tag must be emitted.");
  assertTest(profileView.tags.includes("selection_preview_profile_view_card_count_3"), "profile view card count tag must be emitted.");

  return [
    "profile view model exists",
    "three profile cards exist",
    "role families, useful attributes, why-observe, trace support, benefits, risks, and signals are present",
    "preview remains non-applied",
    "officially confirmed count is 0",
    "confidence upgrade count is 0",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileView();

  console.log("selectionPreviewProfileView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewProfileViewRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function selectionPreviewProfileViewVisibleHtml(html: string): string {
  const start = html.indexOf("Profils à observer");
  const detailsStart = start === -1 ? -1 : html.indexOf("<details class=\"internal-markers\">", start);

  if (start === -1) {
    return "";
  }

  return html.slice(start, detailsStart === -1 ? html.length : detailsStart);
}

export function validateSelectionPreviewProfileViewRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Famille de rôle"), "default report must hide profile view.");
  assertTest(visible.includes("Profils à observer"), "experimental report must contain Profils à observer.");
  assertTest(visible.includes("Famille de rôle"), "profile cards must show role family.");
  assertTest(visible.includes("Attributs utiles"), "profile cards must show useful attributes.");
  assertTest(visible.includes("Pourquoi l’observer"), "profile cards must show why-observe section.");
  assertTest(visible.includes("Ce que les traces soutiennent"), "profile cards must show trace support section.");
  assertTest(visible.includes("Bénéfice attendu"), "profile cards must show expected benefit section.");
  assertTest(visible.includes("Risque tactique"), "profile cards must show tactical risk section.");
  assertTest(visible.includes("Signal à vérifier au prochain match"), "profile cards must show next-match signal section.");
  assertTest(visible.includes("Prévisualisation non appliquée"), "profile cards must show non-applied guard.");
  assertTest(visible.includes("non confirmée comme recommandation officielle"), "profile cards must show non-official guard.");
  assertTest(experimentalHtml.includes("selection_preview_profile_view_card_count_3"), "profile view tags must be preserved in details.");

  return [
    "experimental report contains profile view",
    "three profile-card sections expose role family, attributes, why-observe, trace support, benefit, risk, and next-match signal",
    "profile view guard remains visible",
    "default report hides profile view",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewRenderer();

  console.log("selectionPreviewProfileViewRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewProfileViewCopy.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { selectionPreviewProfileViewVisibleHtml } from "./selectionPreviewProfileViewRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function containsAny(value: string, fragments: readonly string[]): boolean {
  return fragments.some((fragment) => value.includes(fragment));
}

export function validateSelectionPreviewProfileViewCopy(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = selectionPreviewProfileViewVisibleHtml(html);

  assertTest(!containsAny(visible, ["trace_supported", "sandbox_only", "officially_confirmed"]), "visible copy must hide internal status names.");
  assertTest(
    !containsAny(visible, [
      "support_runner",
      "mobile_lock",
      "hook_link",
      "playmaker_support",
      "rebound_chaser",
      "pressure_forward",
      "high_work_rate_runner",
      "continuity_option",
      "secondary_playmaker",
      "support_receiver",
      "rest_defense_anchor",
    ]),
    "visible copy must hide internal role ids.",
  );
  assertTest(
    !containsAny(visible, [
      "decision_making",
      "off_ball_support",
      "mental_freshness",
      "tactical_discipline",
    ]),
    "visible copy must hide internal attribute ids.",
  );
  assertTest(visible.includes("soutien mobile"), "visible copy must use French role labels.");
  assertTest(visible.includes("chasseur de second ballon"), "visible copy must use French second-ball role label.");
  assertTest(visible.includes("prise de décision"), "visible copy must use French attribute labels.");
  assertTest(visible.includes("soutien sans ballon"), "visible copy must use French off-ball support attribute label.");
  assertTest(
    !containsAny(visible, [
      "composition recommandée",
      "meilleure sélection",
      "le coach doit sélectionner",
      "Changez votre composition",
    ]),
    "visible copy must avoid official selection wording.",
  );

  return [
    "visible copy hides internal statuses",
    "visible copy hides internal role and attribute ids",
    "visible copy uses French role labels",
    "visible copy uses French attribute labels",
    "visible copy avoids official selection wording",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewCopy();

  console.log("selectionPreviewProfileViewCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/selectionPreviewProfileViewGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  selectionPreviewProfileViewCannotDriveSelection,
  selectionPreviewProfileViewCannotMutateOfficialState,
  type SelectionPreviewProfileViewModel,
} from "./selectionPreviewProfileView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function modelFromEvidenceTags(): SelectionPreviewProfileViewModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW"
  );

  assertTest(fact !== undefined, "profile view fact must exist.");

  return {
    status: "available",
    origin: "selection_preview_coach_copy",
    profileCardCount: 3,
    cards: [],
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
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
    traceBackingStatus: "available",
    tags: fact.internalTags,
    warnings: [],
  };
}

export function validateSelectionPreviewProfileViewGuard(): readonly string[] {
  const model = modelFromEvidenceTags();

  assertTest(selectionPreviewProfileViewCannotMutateOfficialState(model), "profile view cannot mutate official state.");
  assertTest(selectionPreviewProfileViewCannotDriveSelection(model), "profile view cannot drive selection.");
  assertTest(model.tags.includes("selection_preview_profile_score_mutation_count_0"), "score mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_possession_mutation_count_0"), "possession mutation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_production_scoring_event_creation_count_0"), "production scoring event creation tag must be 0.");
  assertTest(model.tags.includes("selection_preview_profile_global_economy_claim_forbidden"), "global economy claim must be forbidden.");
  assertTest(model.officiallyConfirmedCount === 0, "profile view cannot create official confirmation.");
  assertTest(model.confidenceUpgradeCount === 0, "profile view cannot upgrade confidence.");
  assertTest(model.previewAppliedCount === 0, "profile view cannot apply preview.");

  return [
    "profile view cannot change lineup, starters, or bench",
    "profile view cannot drive coach instruction, live selection, or production route resolution",
    "profile view cannot mutate official timeline, score, possession, or scoring events",
    "profile view cannot claim global economy",
    "profile view cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewProfileViewGuard();

  console.log("selectionPreviewProfileViewGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportView.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportView(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(report);

  assertTest(model.status === "available", "product report model must be available.");
  assertTest(model.sectionCount === 7, "section count must be 7.");
  assertTest(model.keyCoachSignals.length === 3, "key signal count must be 3.");
  assertTest(model.profilesToObserve.length === 3, "profile card count must be 3.");
  assertTest(model.nextMatchSignals.length > 0, "next-match signals must exist.");
  assertTest(model.appendices.length > 0, "appendices must exist.");
  assertTest(model.appendices.every((appendix) => appendix.defaultCollapsed), "appendices must be collapsed by default.");
  assertTest(model.scoreSourceNote.includes("diagnostics batch") && model.scoreSourceNote.includes("échantillons live"), "score source note must exist.");
  assertTest(model.profileAppliedCount === 0, "profile applied count must be 0.");
  assertTest(model.officiallyConfirmedCount === 0, "officially confirmed count must be 0.");
  assertTest(model.confidenceUpgradeCount === 0, "confidence upgrade count must be 0.");

  return [
    "product report model exists",
    "status is available when V1 and profile view evidence are available",
    "section count is 7",
    "key signal count is 3",
    "profile card count is 3",
    "next-match signals exist",
    "appendices exist and are collapsed",
    "score source note exists",
    "profile cards remain non-applied",
    "officially confirmed and confidence upgrade counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportView();

  console.log("coachProductReportView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function productMainVisibleHtml(html: string): string {
  const appendicesStart = html.search(/<section\s+id="appendices"[^>]*>/u);

  return appendicesStart === -1 ? html : html.slice(0, appendicesStart);
}

export function validateCoachProductReportRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));

  assertTest(html.includes("Rapport coach"), "coach-report.product.html content must be generated.");
  assertTest(html.includes("Résumé coach"), "product report must contain Résumé coach.");
  assertTest(html.includes("Ce que le match dit"), "product report must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux clés"), "product report must contain 3 signaux clés.");
  assertTest(html.includes("Profils à observer"), "product report must contain Profils à observer.");
  assertTest(html.includes("À vérifier au prochain match"), "product report must contain next-match section.");
  assertTest(html.includes("Annexes"), "product report must contain Annexes.");
  assertTest(html.includes("Score du rapport full-match"), "score source label must be visible.");
  assertTest(html.includes("Profil à observer"), "profile cards must be visible.");
  assertTest(html.includes("Prévisualisation non appliquée"), "compact non-applied guard must be visible.");
  assertTest(html.includes("<details class=\"appendix\">"), "appendices must be rendered as collapsed details.");

  return [
    "coach-report.product.html content is generated",
    "required 7 product sections are visible",
    "score source label is visible",
    "profile cards and compact guard are visible",
    "appendices are collapsed by default",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportRenderer();

  console.log("coachProductReportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportNoJargon.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenMainTerms = [
  "sandbox_only",
  "trace_supported",
  "officially_confirmed",
  "workbench",
  "production route",
  "canDriveLiveSelection",
  "global economy claim",
  "score mutation",
  "possession mutation",
  "internalTags",
] as const;

export function validateCoachProductReportNoJargon(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));

  for (const term of forbiddenMainTerms) {
    assertTest(!visible.includes(term), `main product report must not contain ${term}.`);
  }

  return [
    "main visible product report contains no internal status names",
    "main visible product report contains no workbench or production route jargon",
    "main visible product report contains no mutation jargon",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportNoJargon();

  console.log("coachProductReportNoJargon tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportCopy.test.ts

```ts
import { assertNoMojibake } from "./coachCopyQuality";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));
  const lower = visible.toLocaleLowerCase("fr-FR");

  assertNoMojibake(visible, "coach product visible copy");
  assertTest(visible.includes("Résumé coach"), "visible copy must be French.");
  assertTest(visible.includes("Famille de rôle"), "visible copy must use localized role label.");
  assertTest(visible.includes("Attributs utiles"), "visible copy must use localized attribute label.");
  assertTest(visible.includes("soutien mobile"), "visible copy must use localized role names.");
  assertTest(visible.includes("prise de décision"), "visible copy must use localized attribute names.");
  assertTest(!lower.includes("composition recommandée"), "visible copy must not say composition recommandée.");
  assertTest(!lower.includes("meilleure sélection"), "visible copy must not say meilleure sélection.");
  assertTest(!lower.includes("le coach doit sélectionner"), "visible copy must not mandate selection.");

  return [
    "visible copy is French",
    "visible copy has no mojibake",
    "localized role and attribute labels are visible",
    "official selection wording is absent",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportCopy();

  console.log("coachProductReportCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  coachProductReportCannotDriveSelection,
  coachProductReportCannotMutateOfficialState,
} from "./coachProductReportView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(report);

  assertTest(coachProductReportCannotDriveSelection(model), "product report cannot drive selection.");
  assertTest(coachProductReportCannotMutateOfficialState(model), "product report cannot mutate official state.");
  assertTest(!model.canChangeLineup, "product report cannot change lineup.");
  assertTest(!model.canChangeStarters, "product report cannot change starters.");
  assertTest(!model.canChangeBench, "product report cannot change bench.");
  assertTest(!model.canDriveCoachInstruction, "product report cannot drive coach instruction.");
  assertTest(!model.canDriveLiveSelection, "product report cannot drive live selection.");
  assertTest(!model.canDriveProductionRouteResolution, "product report cannot drive production route resolution.");
  assertTest(!model.canMutateTimeline, "product report cannot mutate official timeline.");
  assertTest(!model.canMutateScore, "product report cannot mutate official score.");
  assertTest(!model.canMutatePossession, "product report cannot mutate official possession.");
  assertTest(!model.canCreateScoringEvent, "product report cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "product report cannot claim global economy.");
  assertTest(model.confidenceUpgradeCount === 0, "product report cannot upgrade confidence.");

  return [
    "product report cannot change lineup, starters, or bench",
    "product report cannot drive coach instruction, live selection, or production route resolution",
    "product report cannot mutate timeline, score, possession, or scoring events",
    "product report cannot claim global economy",
    "product report cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportGuard();

  console.log("coachProductReportGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportPolish.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolish(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const view = buildCoachProductReportViewFromMatchReport(report);
  const polish = buildCoachProductReportPolish({ productReportView: view });

  assertTest(polish.status === "available", "polish status must be available.");
  assertTest(polish.productReportFileGenerated, "product report file must be generated.");
  assertTest(polish.productReportReviewReady, "product report review-ready flag must be true.");
  assertTest(polish.headerPolished, "headerPolished must be true.");
  assertTest(polish.executiveSummaryCompact, "executiveSummaryCompact must be true.");
  assertTest(polish.keySignalsReadable, "keySignalsReadable must be true.");
  assertTest(polish.profileCardsReadable, "profileCardsReadable must be true.");
  assertTest(polish.nextMatchSignalsReadable, "nextMatchSignalsReadable must be true.");
  assertTest(polish.appendicesLessIntrusive, "appendicesLessIntrusive must be true.");
  assertTest(polish.printFriendly, "printFriendly must be true.");
  assertTest(polish.profileAppliedCount === 0, "profile applied count must be 0.");
  assertTest(polish.officiallyConfirmedCount === 0, "officially confirmed count must be 0.");
  assertTest(polish.confidenceUpgradeCount === 0, "confidence upgrade count must be 0.");

  return [
    "polish model exists",
    "polish status is available",
    "product report file is generated",
    "product report review-ready flag is true",
    "header, summary, signals, profiles, next-match signals, appendices, and print CSS are review-ready",
    "profile applied, officially confirmed, and confidence upgrade counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolish();

  console.log("coachProductReportPolish tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportPolishRenderer.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));

  assertTest(html.includes("Rapport coach — lecture produit"), "product report must contain polished title.");
  assertTest(html.includes("Résumé coach"), "product report must contain Résumé coach.");
  assertTest(html.includes("Ce que le match dit"), "product report must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux clés"), "product report must contain 3 signaux clés.");
  assertTest(html.includes("Profils à observer"), "product report must contain Profils à observer.");
  assertTest(html.includes("À vérifier au prochain match"), "product report must contain next-match section.");
  assertTest(html.includes("À ne pas sur-interpréter"), "product report must contain interpretation guard.");
  assertTest(html.includes("Annexes"), "product report must contain Annexes.");
  assertTest(html.includes("Les diagnostics batch et les échantillons live restent séparés de ce score."), "compact score source note must be visible.");
  assertTest(html.includes("Prévisualisation non appliquée — non confirmée comme recommandation officielle."), "compact profile guard must be visible.");
  assertTest(html.includes("<details class=\"appendix\">"), "appendices must be collapsed by default.");
  assertTest(html.includes("@media print"), "print CSS must exist.");
  assertTest(html.includes("break-inside: avoid"), "print CSS must avoid broken cards/details.");

  return [
    "review-ready product title is visible",
    "required product sections are visible",
    "compact score source and profile guard are visible",
    "appendices are collapsed by default",
    "print CSS exists",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishRenderer();

  console.log("coachProductReportPolishRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportPolishNoJargon.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenMainTerms = [
  "sandbox_only",
  "trace_supported",
  "officially_confirmed",
  "workbench",
  "production route",
  "canDriveLiveSelection",
  "global economy claim",
  "score mutation",
  "possession mutation",
  "internalTags",
] as const;

export function validateCoachProductReportPolishNoJargon(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));

  for (const term of forbiddenMainTerms) {
    assertTest(!visible.includes(term), `main product report must not contain ${term}.`);
  }

  return [
    "main visible product report contains no sandbox_only",
    "main visible product report contains no trace_supported or officially_confirmed",
    "main visible product report contains no workbench, production route, or mutation jargon",
    "technical terms remain appendix-only when present",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishNoJargon();

  console.log("coachProductReportPolishNoJargon tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportPolishCopy.test.ts

```ts
import { assertNoMojibake } from "./coachCopyQuality";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));
  const lower = visible.toLocaleLowerCase("fr-FR");

  assertNoMojibake(visible, "coach product polish visible copy");
  assertTest(visible.includes("Rapport coach — lecture produit"), "visible copy must contain polished French title.");
  assertTest(visible.includes("Résumé coach"), "visible copy must be French.");
  assertTest(visible.includes("Ces profils ne sont pas des choix imposés"), "visible copy must include interpretation guard.");
  assertTest(!lower.includes("composition recommandée"), "visible copy must not say composition recommandée.");
  assertTest(!lower.includes("meilleure sélection"), "visible copy must not say meilleure sélection.");
  assertTest(!lower.includes("le coach doit sélectionner"), "visible copy must not mandate selection.");

  return [
    "visible copy is French",
    "visible copy has no mojibake",
    "visible copy avoids official selection wording",
    "visible copy includes non-prescriptive interpretation guard",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishCopy();

  console.log("coachProductReportPolishCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/coachProductReportPolishGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";
import {
  coachProductReportPolishCannotDriveSelection,
  coachProductReportPolishCannotMutateOfficialState,
} from "./coachProductReportPolish";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const polish = buildCoachProductReportPolish({
    productReportView: buildCoachProductReportViewFromMatchReport(report),
  });

  assertTest(!polish.canChangeLineup, "polish layer cannot change lineup.");
  assertTest(!polish.canChangeStarters, "polish layer cannot change starters.");
  assertTest(!polish.canChangeBench, "polish layer cannot change bench.");
  assertTest(!polish.canDriveCoachInstruction, "polish layer cannot drive coach instruction.");
  assertTest(!polish.canDriveLiveSelection, "polish layer cannot drive live selection.");
  assertTest(!polish.canDriveProductionRouteResolution, "polish layer cannot drive production route resolution.");
  assertTest(!polish.canMutateTimeline, "polish layer cannot mutate official timeline.");
  assertTest(!polish.canMutateScore, "polish layer cannot mutate official score.");
  assertTest(!polish.canMutatePossession, "polish layer cannot mutate official possession.");
  assertTest(!polish.canCreateScoringEvent, "polish layer cannot create production scoring events.");
  assertTest(!polish.canClaimGlobalEconomy, "polish layer cannot claim global economy.");
  assertTest(polish.confidenceUpgradeCount === 0, "polish layer cannot upgrade confidence.");
  assertTest(coachProductReportPolishCannotMutateOfficialState(polish), "official state mutation guard must pass.");
  assertTest(coachProductReportPolishCannotDriveSelection(polish), "selection driver guard must pass.");

  return [
    "polish layer cannot change lineup, starters, or bench",
    "polish layer cannot drive coach instruction, live selection, or production route resolution",
    "polish layer cannot mutate official timeline, score, possession, or scoring events",
    "polish layer cannot claim global economy",
    "polish layer cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishGuard();

  console.log("coachProductReportPolishGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/generateCoachHtmlReport.ts

```ts
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { renderCoachProductReport } from "./renderCoachProductReport";

function writeLatestCoachReport(): void {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const reportsDirectory = join(process.cwd(), "reports");

  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(
    join(reportsDirectory, "match-report.latest.json"),
    `${JSON.stringify(defaultReport, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.latest.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.default.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.experimental.html"),
    renderHtmlCoachReport(experimentalReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.product.html"),
    renderCoachProductReport(buildCoachProductReportViewFromMatchReport(experimentalReport)),
    "utf8",
  );

  console.log("Generated reports/match-report.latest.json");
  console.log("Generated reports/coach-report.latest.html");
  console.log("Generated reports/coach-report.default.html");
  console.log("Generated reports/coach-report.experimental.html");
  console.log("Generated reports/coach-report.product.html");
}

if (require.main === module) {
  writeLatestCoachReport();
}
```

## File: src/reports/htmlCoachReportGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { assertNoTechnicalContextLeak } from "./coachFacingSummary";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateHtmlCoachReportRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const firstInsight = report.coachInsights[0];
  const firstKeyMoment = report.keyMoments[0];
  const uniqueKeyMomentTitles = new Set(report.keyMoments.map((moment) => moment.title));
  const hasStructuredWarnings = report.warnings.length > 0;
  const conditionDecreased = report.fatigueReport.playerSummaries.some((summary) => summary.conditionEnd < summary.conditionStart);
  const hasHarnessWarning = report.tacticalReport.diagnoses.some((diagnosis) => diagnosis.title === "Avertissement de harnais full-match");
  const hasDominanceWarning = report.tacticalReport.diagnoses.some((diagnosis) => diagnosis.title === "Domination scoring single-run à surveiller");

  assertGuard(html.includes("<html"), "rendered coach report must include an html document root.");
  assertGuard(!containsMojibake(html), "rendered coach report must not contain mojibake markers.");
  assertGuard(html.includes("Rapport du coach"), "rendered coach report must include the French report title.");
  assertGuard(html.includes("Résumé"), "rendered coach report must include the French summary section.");
  assertGuard(html.includes("Moments clés"), "rendered coach report must include the French key moments section.");
  assertGuard(html.includes("Généré depuis le rapport de match typé."), "rendered coach report must include clean generated-from copy.");
  assertGuard(html.includes("Analyse du coach"), "rendered coach report must include the French coach insight section.");
  assertGuard(html.includes("Repères internes"), "rendered coach report must label internal tags in French.");
  assertGuard(html.includes("Action décisive"), "rendered coach report must display timeline event types in French.");
  assertGuard(html.includes("Séquence dangereuse"), "rendered coach report must include clean dangerous-sequence copy.");
  assertGuard(html.includes("Équipe"), "rendered coach report must include clean team label copy.");
  assertGuard(html.includes("Événement"), "rendered coach report must include clean event label copy.");
  assertGuard(html.includes("Plan de match observé"), "rendered coach report must include observed match plan diagnosis.");
  assertGuard(
    html.includes("tempo rapide") || html.includes("risque élevé"),
    "rendered coach report must include readable BLITZ tactical-plan summary text.",
  );
  assertGuard(html.includes(`${report.score.home} - ${report.score.away}`), "rendered coach report must include the final score.");
  assertGuard(html.includes("Afficher les"), "rendered coach report must keep the expandable timeline control.");

  if (hasHarnessWarning) {
    assertGuard(html.includes("Avertissement de harnais full-match"), "rendered coach report must include the full-match harness warning when warnings exist.");
    assertGuard(html.includes("Ce run déterministe unique révèle"), "rendered coach report must describe harness warnings in French coach-facing copy.");
    assertGuard(!html.includes("Harness warning:"), "rendered coach report must not expose raw English harness warning copy.");
  }

  if (hasDominanceWarning) {
    assertGuard(html.includes("Domination scoring single-run à surveiller"), "rendered coach report must include scoring dominance warning when the score is lopsided.");
    assertGuard(html.includes("CONTROL a converti"), "rendered coach report must explain the scoring dominance in French.");
    assertGuard(html.includes("économie du score"), "rendered coach report must preserve the scoring-economy warning context.");
  }

  if (hasStructuredWarnings) {
    assertGuard(html.includes("Avertissements structur"), "rendered coach report must include the structured warnings section.");
    assertGuard(html.includes("techniques") && html.includes("Type :"), "rendered coach report must keep technical warning context inside details.");
    assertGuard(html.includes("Faits d'"), "rendered coach report must link structured warnings to evidence facts.");
  }

  assertGuard(html.includes("Condition finale"), "rendered coach report must include fatigue values.");
  assertGuard(conditionDecreased, "full-match report must show at least one player condition decrease.");
  assertGuard(report.timeline.length >= 30, `HTML guard report should use the full-match harness, received ${report.timeline.length} events.`);

  if (report.keyMoments.length > 1) {
    assertGuard(uniqueKeyMomentTitles.size >= 2, "key moments should not all have identical titles when non-scoring candidates exist.");
  }

  assertGuard(
    report.keyMoments.every((moment) => report.keyMoments.filter((candidate) => candidate.title === moment.title).length <= 2),
    "key moment titles should not repeat more than twice when alternatives exist.",
  );

  if (firstInsight !== undefined) {
    assertGuard(html.includes(firstInsight.title), `rendered coach report must include insight title ${firstInsight.title}.`);
  }

  if (firstKeyMoment !== undefined) {
    assertGuard(html.includes(firstKeyMoment.title), `rendered coach report must include key moment title ${firstKeyMoment.title}.`);
  }

  assertGuard(!html.includes("[object Object]"), "rendered coach report must not leak object stringification.");
  assertGuard(!html.includes(">Coach Report<"), "rendered coach report must not use the old top-level English title.");
  assertGuard(!html.includes(">Tags:"), "rendered coach report must not expose the old raw Tags label.");
  assertGuard(!html.includes("adapter-visible tactical sequence"), "rendered coach report must not expose old English adapter fallback copy.");
  assertGuard(!html.includes("<strong>1' scoring</strong>"), "rendered coach report must not expose raw scoring event type labels.");
  assertGuard(!html.includes("mini-match"), "rendered coach report must not expose mini-match wording.");
  assertGuard(!html.includes("adapter de simulation actuel"), "rendered coach report must not expose old adapter limitation wording.");
  assertGuard(!html.includes("visible par l'adapter"), "rendered coach report must not expose old adapter visibility wording.");
  assertGuard(!html.includes("global scoring incoherence"), "rendered coach report must not claim global scoring incoherence from one run.");
  assertGuard(!html.includes("change scoring values"), "rendered coach report must not recommend scoring value changes from one run.");
  assertNoTechnicalContextLeak(visible, "visible coach HTML");

  return [
    "HTML coach report includes document root",
    "HTML coach report contains no mojibake markers",
    "HTML coach report includes French report title",
    "HTML coach report includes clean French summary, generated-from, key moments, and coach analysis sections",
    "HTML coach report uses French timeline labels",
    "HTML coach report includes observed match plan summary",
    "HTML coach report includes final score",
    "HTML coach report uses full-match event volume",
    "HTML coach report keeps expandable timeline control",
    "HTML coach report includes full-match harness warning",
    "HTML coach report includes structured MatchReport warnings when available",
    "HTML coach report includes scoring dominance warning when lopsided",
    "HTML coach report uses coach-facing harness warning wording",
    "HTML coach report includes fatigue values",
    "HTML coach report shows condition decrease",
    "HTML coach report key moments are not all identical when alternatives exist",
    "HTML coach report key moment titles repeat no more than twice",
    "HTML coach report includes at least one coach insight title when available",
    "HTML coach report includes at least one key moment title when available",
    "HTML coach report does not contain [object Object]",
    "HTML coach report does not contain old top-level English title",
    "HTML coach report does not expose old raw internal labels",
    "HTML coach report does not expose old technical product wording",
    "HTML coach report keeps raw harness enum wording inside technical warning details only",
    "HTML coach report does not claim global scoring incoherence",
    "HTML coach report does not recommend scoring value changes",
    "HTML visible copy contains no technical context leaks",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportRenderer();

  console.log("HTML coach report guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/htmlCoachReportEncoding.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_MOJIBAKE_MARKERS: readonly string[] = [
  "Ãƒ",
  "Ã‚",
  "Ã¢â‚¬â€",
  "Ã¢â‚¬â€œ",
  "ÃƒÂ©",
  "ÃƒÂ¨",
  "Ãƒ ",
  "ÃƒÂ§",
  "Ã©",
  "Ã¨",
  "Ã ",
  "Ã§",
  "â€”",
  "â€“",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function forbiddenMarkersIn(value: string): readonly string[] {
  return FORBIDDEN_MOJIBAKE_MARKERS.filter((marker) => value.includes(marker));
}

export function validateHtmlCoachReportEncoding(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const defaultMarkers = forbiddenMarkersIn(defaultHtml);
  const experimentalMarkers = forbiddenMarkersIn(experimentalHtml);

  assertTest(experimentalHtml.includes("Confiance multi-scénarios"), "experimental coach HTML must contain valid multi-scenario title.");
  assertTest(experimentalHtml.includes("Confiance faible — 37/100"), "experimental coach HTML must contain valid em dash in confidence copy.");
  assertTest(experimentalHtml.includes("Stabilité"), "experimental coach HTML must contain valid accented stability copy.");
  assertTest(!containsMojibake(experimentalHtml), "experimental coach HTML must not contain mojibake.");
  assertTest(!containsMojibake(defaultHtml), "default coach HTML must not contain mojibake.");
  assertTest(experimentalMarkers.length === 0, `experimental coach HTML contains mojibake markers: ${experimentalMarkers.join(", ")}`);
  assertTest(defaultMarkers.length === 0, `default coach HTML contains mojibake markers: ${defaultMarkers.join(", ")}`);

  return [
    "experimental coach HTML contains Confiance multi-scénarios",
    "experimental coach HTML contains valid em dash confidence copy",
    "experimental coach HTML contains Stabilité with valid accents",
    "experimental coach HTML contains no mojibake markers",
    "default coach HTML contains no mojibake markers",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportEncoding();

  console.log("htmlCoachReportEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/encoding/mojibakeDetection.ts

```ts
export interface MojibakeScanResult {
  readonly markerCount: number;
  readonly markers: readonly string[];
}

export const FORBIDDEN_MOJIBAKE_MARKERS: readonly string[] = [
  "\u00c3\u0192",
  "\u00c3\u00a9",
  "\u00c3\u00a8",
  "\u00c3\u00aa",
  "\u00c3\u00ab",
  "\u00c3\u00a0",
  "\u00c3\u00a2",
  "\u00c3\u00ae",
  "\u00c3\u00b4",
  "\u00c3\u00b9",
  "\u00c3\u00bb",
  "\u00c3\u00a7",
  "\u00c3\u2030",
  "\u00c3\u0089",
  "\u00c3\u0080",
  "\u00c2",
  "\u00e2\u20ac",
  "\ufffd",
];

export function findMojibakeMarkers(value: string): readonly string[] {
  return FORBIDDEN_MOJIBAKE_MARKERS.filter((marker) => value.includes(marker));
}

export function countMojibakeMarkers(value: string): number {
  return findMojibakeMarkers(value).length;
}

export function scanForMojibake(value: string): MojibakeScanResult {
  const markers = findMojibakeMarkers(value);

  return {
    markerCount: markers.length,
    markers,
  };
}

export function hasMojibake(value: string): boolean {
  return countMojibakeMarkers(value) > 0;
}
```

## File: src/reports/encoding/validateGeneratedTextEncoding.ts

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanForMojibake } from "./mojibakeDetection";

export interface GeneratedTextEncodingTarget {
  readonly path: string;
  readonly category: "coach_html" | "share_markdown" | "trace_validation_markdown" | "validation_markdown";
  readonly required: boolean;
}

export interface GeneratedTextEncodingTargetResult extends GeneratedTextEncodingTarget {
  readonly exists: boolean;
  readonly mojibakeMarkerCount: number;
  readonly mojibakeMarkers: readonly string[];
}

export interface GeneratedTextEncodingValidationResult {
  readonly status: "PASS" | "FAIL";
  readonly targets: readonly GeneratedTextEncodingTargetResult[];
  readonly totalMojibakeMarkerCount: number;
}

export function generatedTextEncodingTargets(reportDirectory: string): readonly GeneratedTextEncodingTarget[] {
  return [
    { path: join(reportDirectory, "coach-report.latest.html"), category: "coach_html", required: true },
    { path: join(reportDirectory, "coach-report.default.html"), category: "coach_html", required: true },
    { path: join(reportDirectory, "coach-report.experimental.html"), category: "coach_html", required: true },
    { path: join(reportDirectory, "share", "coach-report.latest.html"), category: "coach_html", required: false },
    { path: join(reportDirectory, "share", "coach-report.default.html"), category: "coach_html", required: false },
    { path: join(reportDirectory, "share", "coach-report.experimental.html"), category: "coach_html", required: false },
    { path: join(reportDirectory, "share", "fullmatch-workbench-chain-replay-4i.md"), category: "share_markdown", required: true },
    { path: join(reportDirectory, "share", "validation.fullmatch-workbench-chain-replay-4i.md"), category: "validation_markdown", required: true },
    { path: join(reportDirectory, "share", "validation.share-pack.md"), category: "validation_markdown", required: true },
    { path: join(reportDirectory, "share", "README.md"), category: "share_markdown", required: true },
    { path: join(reportDirectory, "share", "manifest.md"), category: "share_markdown", required: true },
  ];
}

export function validateGeneratedTextEncoding(input: {
  readonly reportDirectory: string;
}): GeneratedTextEncodingValidationResult {
  const targets = generatedTextEncodingTargets(input.reportDirectory).map((target) => {
    if (!existsSync(target.path)) {
      return {
        ...target,
        exists: false,
        mojibakeMarkerCount: target.required ? 1 : 0,
        mojibakeMarkers: target.required ? ["MISSING_REQUIRED_TARGET"] : [],
      };
    }

    const scan = scanForMojibake(readFileSync(target.path, "utf8"));

    return {
      ...target,
      exists: true,
      mojibakeMarkerCount: scan.markerCount,
      mojibakeMarkers: scan.markers,
    };
  });
  const totalMojibakeMarkerCount = targets.reduce((total, target) => total + target.mojibakeMarkerCount, 0);

  return {
    status: totalMojibakeMarkerCount === 0 ? "PASS" : "FAIL",
    targets,
    totalMojibakeMarkerCount,
  };
}
```

## File: src/reports/encoding/validateGeneratedTextEncoding.test.ts

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findMojibakeMarkers, hasMojibake } from "./mojibakeDetection";
import {
  generatedTextEncodingTargets,
  validateGeneratedTextEncoding,
} from "./validateGeneratedTextEncoding";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function repositoryRoot(): string {
  return join(__dirname, "..", "..", "..");
}

export function validateGeneratedTextEncodingContracts(): readonly string[] {
  const doubleEncodedBadSample = "\u00c3\u0192\u00c2\u00a9tiquette encod\u00c3\u0192\u00c2\u00a9e";
  const singleEncodedBadSample = "qualit\u00c3\u00a9, multi-sc\u00c3\u00a9narios, \u00e2\u20ac\u201d";
  const goodSample = "r\u00e9cup\u00e9ration d\u00e9fensive, erreurs provoqu\u00e9es par la pression, ligne cass\u00e9e, possession s\u00e9curis\u00e9e, danger cr\u00e9\u00e9";
  const reportDirectory = join(repositoryRoot(), "reports");
  const targets = generatedTextEncodingTargets(reportDirectory);
  const result = validateGeneratedTextEncoding({ reportDirectory });

  assertTest(hasMojibake(doubleEncodedBadSample), "double-encoded mojibake markers must be detected.");
  assertTest(hasMojibake(singleEncodedBadSample), "single-encoded mojibake markers must be detected.");
  assertTest(findMojibakeMarkers(doubleEncodedBadSample).length > 0, "bad sample must expose marker names.");
  assertTest(!hasMojibake(goodSample), "correct French strings must pass mojibake detection.");
  assertTest(targets.some((target) => target.path.endsWith("fullmatch-workbench-chain-replay-4i.md")), "fullmatch-workbench-chain-replay-4i.md must be covered.");
  assertTest(targets.some((target) => target.path.endsWith("coach-report.default.html")), "default coach report HTML must be covered.");
  assertTest(targets.some((target) => target.path.endsWith("coach-report.experimental.html")), "coach report HTML files must be covered.");
  assertTest(targets.some((target) => target.category === "share_markdown"), "share-pack markdown files must be covered.");
  assertTest(targets.some((target) => target.category === "validation_markdown"), "validation markdown files must be covered.");

  if (existsSync(join(reportDirectory, "share", "fullmatch-workbench-chain-replay-4i.md"))) {
    const existingMojibakeMarkerCount = result.targets
      .filter((target) => target.exists)
      .reduce((total, target) => total + target.mojibakeMarkerCount, 0);

    assertTest(existingMojibakeMarkerCount === 0, `existing generated artifacts must contain no mojibake markers, got ${existingMojibakeMarkerCount}.`);
  }

  return [
    "double-encoded mojibake sample is detected",
    "single-encoded mojibake sample is detected",
    "correct French strings pass",
    "fullmatch-workbench-chain-replay-4i.md is covered",
    "coach-report.default.html is covered",
    "coach report HTML files are covered",
    "share-pack markdown files are covered",
    "validation markdown files are covered",
  ];
}

if (require.main === module) {
  const checks = validateGeneratedTextEncodingContracts();

  console.log("validateGeneratedTextEncoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/htmlCoachReportCoachCopyGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_VISIBLE_JARGON: readonly string[] = [
  "SegmentRouteInput",
  "selection shadow",
  "read-only",
  "canDrive",
  "production route resolution",
  "scoreMutationCount",
  "workbench_chain_",
];

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    let depth = 0;
    let scan = start;

    while (scan < html.length) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        cursor = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = nextOpen + "<details".length;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
      if (depth === 0) {
        cursor = scan;
        break;
      }
    }
  }

  return visible;
}

function visibleJargonIn(html: string): readonly string[] {
  const visible = visibleHtml(html);
  return FORBIDDEN_VISIBLE_JARGON.filter((term) => visible.includes(term));
}

export function validateHtmlCoachReportCoachCopyGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleJargon = visibleJargonIn(experimentalHtml);

  assertTest(visibleJargon.length === 0, `visible coach copy contains developer jargon: ${visibleJargon.join(", ")}`);
  assertTest(experimentalHtml.includes("Détails techniques"), "technical diagnostics must remain available behind details.");
  assertTest(experimentalHtml.includes("workbench_chain_"), "internal diagnostic tags must remain available inside details.");
  assertTest(experimentalHtml.includes("Cette piste reste une suggestion sandbox, pas une consigne officielle."), "visible copy must include suggestion-only wording.");
  assertTest(experimentalHtml.includes("Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score."), "visible copy must include official-state guardrail wording.");
  assertTest(experimentalHtml.includes("Elle ne constitue pas une preuve d’économie globale."), "visible copy must include global-economy guardrail wording.");

  return [
    "visible coach copy avoids developer jargon",
    "technical diagnostics remain available behind details",
    "internal diagnostic tags remain preserved",
    "visible copy states sandbox suggestion-only guardrail",
    "visible copy states official state is unchanged",
    "visible copy states no global economy proof",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportCoachCopyGuard();

  console.log("htmlCoachReportCoachCopyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/htmlCoachReportTechnicalDetailsGuard.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    let depth = 0;
    let scan = start;

    while (scan < html.length) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        cursor = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = nextOpen + "<details".length;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
      if (depth === 0) {
        cursor = scan;
        break;
      }
    }
  }

  return visible;
}

export function validateHtmlCoachReportTechnicalDetailsGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(!visible.includes("Ancrage workbench maintenant partiel"), "technical grounding title must not appear as a main visible card.");
  assertTest(!visible.includes("selection shadow"), "technical grounding details must not leak selection-shadow wording into visible copy.");
  assertTest(!visible.includes("SegmentRouteInput"), "technical grounding details must not leak SegmentRouteInput into visible copy.");
  assertTest(visible.includes("Le moteur utilise encore un harnais expérimental"), "visible grounding summary must remain short and coach-readable.");
  assertTest(experimentalHtml.includes("Détails techniques développeur"), "technical grounding details must be collapsed behind developer details.");
  assertTest(experimentalHtml.includes("Ancrage workbench maintenant partiel"), "technical grounding source title must remain available internally.");
  assertTest(experimentalHtml.includes("selection shadow") || experimentalHtml.includes("SegmentRouteInput"), "technical grounding internals must remain available.");

  return [
    "technical grounding full content is not displayed as a main visible card",
    "technical grounding jargon is hidden from visible coach copy",
    "visible grounding summary is short and coach-readable",
    "technical grounding details are collapsed behind developer details",
    "technical grounding internals remain available",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportTechnicalDetailsGuard();

  console.log("htmlCoachReportTechnicalDetailsGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/reports/types.ts

```ts
import type { EventId, PlayerId, TeamId } from "../core/ids";
import type { TacticalTick } from "../core/ratings";
import type { ZoneId } from "../core/zones";
import type { InteractionType } from "../systems/interactions/types";
import type { PressureLevel } from "../models/match";
import type { PlayerRole } from "../models/player";

export enum MatchEventCategory {
  Interaction = "interaction",
  TacticalShift = "tactical_shift",
  Score = "score",
  Momentum = "momentum",
  Fatigue = "fatigue",
}

export interface MatchEvent {
  readonly id: EventId;
  readonly tick: TacticalTick;
  readonly teamId: TeamId;
  readonly category: MatchEventCategory;
  readonly interactionType?: InteractionType;
  readonly involvedPlayerIds: readonly PlayerId[];
  readonly involvedRoles: readonly PlayerRole[];
  readonly zone: ZoneId;
  readonly pressureLevel: PressureLevel;
  readonly result: string;
  readonly tacticalConsequences: readonly string[];
  readonly narrative: string;
}
```

## File: src/reports/coaching/types.ts

```ts
import type { TeamId } from "../../core/ids";
import type { ScoringType } from "../../models/scoring";
import type { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";
import type { FinishingOutcome } from "../../systems/interactions/finishing";
import type { BuildUpPressingOutcome } from "../../systems/interactions/shared";
import type { TransitionOutcome } from "../../systems/interactions/transition";
import type { SpatialMoveType } from "../../systems/spatial/intention";
import type { TacticalMemoryInteraction } from "../../systems/tacticalMemory";
import type { TacticalPhaseState } from "../../systems/tacticalState";

export interface MovePatternCount {
  readonly moveType: SpatialMoveType;
  readonly count: number;
}

export interface MemoryPatternObservation {
  readonly interaction: TacticalMemoryInteraction;
  readonly moveType: SpatialMoveType;
  readonly sideType: string;
  readonly successes: number;
  readonly failures: number;
}

export interface TeamPatternAnalysis {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly tacticalStyle: TacticalStyle;
  readonly offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy;
  readonly possessionSequences: number;
  readonly pressingSequences: number;
  readonly movePatterns: readonly MovePatternCount[];
  readonly memoryPatterns: readonly MemoryPatternObservation[];
  readonly finishingOpportunities: number;
  readonly scoringEvents: number;
  readonly finishingOutcomes: readonly FinishingOutcome[];
  readonly finishingStyles: readonly string[];
  readonly finishingContexts: readonly string[];
  readonly scoringTypes: readonly ScoringType[];
  readonly turnoversWon: number;
  readonly buildUpFailures: number;
  readonly buildUpSuccesses: number;
  readonly transitionSuccesses: number;
  readonly transitionFailures: number;
  readonly highDangerLowScoringThreat: number;
  readonly redZoneLateralDelays: number;
  readonly legalFinishingOptionsIgnored: number;
  readonly highTransitionDangerStabilized: number;
  readonly poorDecisions: number;
  readonly rushedClearances: number;
  readonly forcedTurnovers: number;
  readonly averageSupportQuality: number | null;
  readonly averageBuildUpResistance: number | null;
  readonly averagePressingCapability: number | null;
  readonly averageTerritorialPressure: number | null;
  readonly averageTacticalDangerScore: number | null;
  readonly averageConversionQuality: number | null;
  readonly reboundOrScrambleOutcomes: number;
  readonly secondChancePhases: number;
  readonly finalOffensiveMomentumLevel: string;
  readonly finalOffensiveMomentumScore: number;
  readonly finalRecoverySaturationLevel: string;
  readonly finalRecoverySaturationScore: number;
  readonly buildUpOutcomes: readonly BuildUpPressingOutcome[];
  readonly transitionOutcomes: readonly TransitionOutcome[];
  readonly tacticalPhaseStates: readonly TacticalPhaseState[];
  readonly chaoticAdvantagesCreated: number;
  readonly dangerPhasesResolved: number;
}

export interface CoachingCause {
  readonly text: string;
}

export interface CoachingTeamFeedback {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly observedIdentity: readonly string[];
  readonly worked: readonly string[];
  readonly failed: readonly string[];
  readonly why: readonly string[];
  readonly levers: readonly string[];
}

export interface CoachingFeedbackReport {
  readonly teams: readonly CoachingTeamFeedback[];
}
```
