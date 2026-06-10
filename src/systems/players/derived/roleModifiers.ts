import { PlayerRole } from "../../../models/player";
import type { RoleDerivedAttributeModifiers } from "./types";

export const DERIVED_ROLE_MODIFIER_MIN = -12;
export const DERIVED_ROLE_MODIFIER_MAX = 12;

export const NEUTRAL_DERIVED_ROLE_MODIFIERS: RoleDerivedAttributeModifiers = {
  supportTiming: 0,
  tacticalDiscipline: 0,
  spacingQuality: 0,
  pressReading: 0,
  restDefenseReliability: 0,
  contactSurvival: 0,
  longPlayQuality: 0,
  chaosCreation: 0,
  finishingComposure: 0,
  goalkeeperResponse: 0,
  recoveryRange: 0,
  ballSecurity: 0,
  scrambleAbility: 0,
};

function modifiers(input: Partial<RoleDerivedAttributeModifiers>): RoleDerivedAttributeModifiers {
  return { ...NEUTRAL_DERIVED_ROLE_MODIFIERS, ...input };
}

export const DERIVED_ROLE_MODIFIERS: Readonly<Record<PlayerRole, RoleDerivedAttributeModifiers>> = {
  [PlayerRole.TempoHalf]: modifiers({
    supportTiming: 8,
    tacticalDiscipline: 6,
    spacingQuality: 6,
    pressReading: 4,
    chaosCreation: -4,
    ballSecurity: 4,
  }),
  [PlayerRole.HookLink]: modifiers({
    supportTiming: 5,
    contactSurvival: 5,
    ballSecurity: 7,
  }),
  [PlayerRole.ForwardLeader]: modifiers({
    contactSurvival: 8,
    restDefenseReliability: 4,
    ballSecurity: 3,
    scrambleAbility: 3,
  }),
  [PlayerRole.GoalkeeperFreeSafety]: modifiers({
    goalkeeperResponse: 8,
    restDefenseReliability: 6,
    longPlayQuality: 5,
  }),
  [PlayerRole.MobileLock]: modifiers({
    pressReading: 5,
    recoveryRange: 6,
    contactSurvival: 5,
  }),
  [PlayerRole.SpaceHunter]: modifiers({
    chaosCreation: 8,
    recoveryRange: 4,
    finishingComposure: 3,
    tacticalDiscipline: -3,
    supportTiming: -2,
  }),
  [PlayerRole.Playmaker]: modifiers({
    supportTiming: 6,
    spacingQuality: 7,
    chaosCreation: 6,
    finishingComposure: 5,
  }),
  [PlayerRole.Pivot]: modifiers({
    restDefenseReliability: 8,
    tacticalDiscipline: 5,
    spacingQuality: 4,
  }),
  [PlayerRole.LeftPiston]: modifiers({
    recoveryRange: 4,
    spacingQuality: 4,
    supportTiming: 3,
  }),
  [PlayerRole.RightPiston]: modifiers({
    recoveryRange: 4,
    spacingQuality: 4,
    supportTiming: 3,
  }),
  [PlayerRole.LeftAnchor]: modifiers({
    restDefenseReliability: 4,
  }),
  [PlayerRole.RightAnchor]: modifiers({
    restDefenseReliability: 4,
  }),
  [PlayerRole.PowerRunner]: modifiers({
    contactSurvival: 6,
    chaosCreation: 3,
  }),
  [PlayerRole.FreeSafety]: modifiers({
    restDefenseReliability: 4,
    goalkeeperResponse: 2,
  }),
};
