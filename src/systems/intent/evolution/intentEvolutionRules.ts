import { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import { TacticalPhaseState } from "../../tacticalState";
import { IntentOutcome, IntentTransition, IntentType, type PlayerIntent } from "../intentTypes";
import { canTransitionIntent } from "./intentTransitionGraph";

export interface IntentEvolutionRuleResult {
  readonly transition: IntentTransition;
  readonly outcome: IntentOutcome;
  readonly nextType: IntentType | null;
  readonly reason: string;
}

function redZoneOrDanger(input: { readonly tick: number; readonly phaseState?: TacticalPhaseState; readonly eventOutcome?: string }): boolean {
  return (
    input.phaseState === TacticalPhaseState.DangerPhase ||
    /finishing|TRY|DROP|GOAL|danger|red-zone/i.test(input.eventOutcome ?? "") ||
    input.tick >= 20
  );
}

export function evaluateIntentEvolutionRule(input: {
  readonly intent: PlayerIntent;
  readonly tick: number;
  readonly role: PlayerRole;
  readonly tacticalStyle: TacticalStyle;
  readonly phaseState?: TacticalPhaseState;
  readonly eventOutcome?: string;
}): IntentEvolutionRuleResult {
  const age = Math.max(0, input.tick - input.intent.startedTick);
  const eventOutcome = input.eventOutcome ?? "";
  const highChaos = input.phaseState === TacticalPhaseState.BrokenPlay || /rebound|loose|scramble|turnover/i.test(eventOutcome);
  const possessionLost = /possession lost|turnover|intercept/i.test(eventOutcome);
  const danger = redZoneOrDanger(input);
  const styleIsBlitz = input.tacticalStyle === TacticalStyle.Blitz;

  const candidates: readonly [boolean, IntentType, string, IntentOutcome][] = [
    [input.intent.type === IntentType.AttackDepth && danger, IntentType.PrepareFinish, "depth run reached a finishing window", IntentOutcome.PartialSuccess],
    [input.intent.type === IntentType.AttackDepth && highChaos, IntentType.ContestLooseBall, "depth runner reacts to loose-ball chaos", IntentOutcome.Interrupted],
    [input.intent.type === IntentType.AttackDepth && possessionLost, IntentType.RecoverStructure, "possession loss closed the transition window", IntentOutcome.Failure],
    [input.intent.type === IntentType.SupportBall && age >= (styleIsBlitz ? 2 : 4), IntentType.ScreenPressure, "support secured and contact screen becomes useful", IntentOutcome.PartialSuccess],
    [input.intent.type === IntentType.PressBall && (age >= 3 || /press broken|line bypassed/i.test(eventOutcome)), IntentType.RecoverStructure, "pressing lane broke and recovery is required", IntentOutcome.Failure],
    [input.intent.type === IntentType.PrepareFinish && highChaos, IntentType.ContestLooseBall, "finish spilled into a live rebound contest", IntentOutcome.Interrupted],
    [input.intent.type === IntentType.OccupyWidth && (age >= 3 || /weak side|open side|overload/i.test(eventOutcome)), IntentType.AttackWeakSide, "wide occupation uncovered the weak-side lane", IntentOutcome.PartialSuccess],
    [input.intent.type === IntentType.ProtectFrame && highChaos, IntentType.ContestLooseBall, "goalkeeper shifts from frame protection to rebound control", IntentOutcome.Interrupted],
    [input.intent.type === IntentType.ContestLooseBall && possessionLost, IntentType.PressBall, "loose contest becomes immediate counterpress", IntentOutcome.PartialSuccess],
    [input.intent.type === IntentType.ContestLooseBall && age >= 3, IntentType.ResetShape, "scramble window ended and shape must reset", IntentOutcome.PartialSuccess],
  ];

  const match = candidates.find(([condition, nextType]) => condition && canTransitionIntent(input.intent.type, nextType));

  if (match !== undefined) {
    return {
      transition: IntentTransition.Evolve,
      outcome: match[3],
      nextType: match[1],
      reason: match[2],
    };
  }

  if (input.intent.type === IntentType.PrepareFinish && /SCORED|SAVED|MISSED|STOPPED|HELD/.test(eventOutcome)) {
    return {
      transition: IntentTransition.Resolve,
      outcome: IntentOutcome.Success,
      nextType: null,
      reason: "finishing action completed cleanly",
    };
  }

  return {
    transition: IntentTransition.Continue,
    outcome: IntentOutcome.PartialSuccess,
    nextType: null,
    reason:
      input.role === PlayerRole.SpaceHunter && input.intent.type === IntentType.AttackDepth
        ? "runner keeps stretching the defensive line"
        : "intent remains tactically valid",
  };
}
