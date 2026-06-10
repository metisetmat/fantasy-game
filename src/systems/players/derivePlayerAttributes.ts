import { derivePlayerAttributesWithDebug } from "./derived";
import type { DerivedPlayerAttributes, PlayerAttributeDerivationContext } from "./derived";
import type { VisiblePlayerAttributes } from "./visibleAttributes";
import type { PlayerRoleArchetype } from "./roleArchetypes";

export function derivePlayerAttributes(input: {
  readonly visible: VisiblePlayerAttributes;
  readonly archetype: PlayerRoleArchetype;
  readonly context: PlayerAttributeDerivationContext;
}): DerivedPlayerAttributes {
  return derivePlayerAttributesWithDebug({
    visible: input.visible,
    role: input.archetype.role,
    context: input.context,
    isGoalkeeper: input.archetype.isGoalkeeper,
  }).attributes;
}

export type { DerivedPlayerAttributes, PlayerAttributeDerivationContext };
