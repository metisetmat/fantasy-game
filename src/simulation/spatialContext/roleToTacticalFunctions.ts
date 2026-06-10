import { PlayerRole } from "../../models/player";

const ROLE_FUNCTIONS: Readonly<Record<string, readonly string[]>> = {
  [PlayerRole.TempoHalf]: ["tempo_controller", "first_receiver", "pressure_escape_decision_maker"],
  [PlayerRole.HookLink]: ["direct_support", "wall_pass", "small_side_support"],
  [PlayerRole.ForwardLeader]: ["contact_platform", "screen", "carry_platform"],
  [PlayerRole.GoalkeeperFreeSafety]: ["rest_defense_anchor", "safe_recycle", "last_rempart"],
  [PlayerRole.FreeSafety]: ["rest_defense_anchor", "safe_recycle", "last_rempart"],
  [PlayerRole.MobileLock]: ["half_space_recycle", "ball_winner", "pressure_escape_receiver"],
  [PlayerRole.SpaceHunter]: ["depth_threat", "chaos_attacker", "weak_side_runner"],
  [PlayerRole.Playmaker]: ["third_man_connector", "creative_receiver", "tempo_accelerator"],
  [PlayerRole.Pivot]: ["rest_defense_anchor", "central_recycle", "support_balance"],
  [PlayerRole.LeftPiston]: ["wide_support", "press_trigger", "corridor_runner"],
  [PlayerRole.RightPiston]: ["wide_support", "transition_hunter", "corridor_runner"],
  [PlayerRole.LeftAnchor]: ["wide_rest_defense", "support_balance"],
  [PlayerRole.RightAnchor]: ["wide_rest_defense", "support_balance"],
  [PlayerRole.PowerRunner]: ["contact_platform", "carry_platform", "line_break_threat"],
};

export function tacticalFunctionsForRole(role: PlayerRole | string): readonly string[] {
  return ROLE_FUNCTIONS[role] ?? ["unmapped_role_context"];
}

export function hasExplicitTacticalFunctionMapping(role: PlayerRole | string): boolean {
  return ROLE_FUNCTIONS[role] !== undefined;
}
