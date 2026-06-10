# Derived Attributes

V0.1 stores 9 visible player attributes as source data and derives tactical values deterministically.

Derived values are calibration V1. They are not hidden primary data. The formal implementation lives in `src/systems/players/derived/`.

Every derived attribute:
- outputs 0-100;
- uses normalized formula weights;
- applies explicit clamping;
- supports role modifiers;
- supports tactical philosophy modifiers;
- can emit debug output showing inputs, modifiers, and final value.

Official scale interpretation is defined in `docs/gameplay/attribute_ranges.md`.

## Official Derived Attributes

- supportTiming
- tacticalDiscipline
- spacingQuality
- pressReading
- restDefenseReliability
- contactSurvival
- longPlayQuality
- chaosCreation
- finishingComposure
- goalkeeperResponse
- recoveryRange
- ballSecurity
- scrambleAbility

## Formula Rules

Formula weights are normalized by their total weight before modifiers are applied.

```text
normalizedBase = weightedInputTotal / totalWeight
rawModifier = roleModifier + philosophyModifier
modifierImpact = compressPositiveModifierNearCap(normalizedBase, rawModifier)
derivedValue = clampDerivedValue(normalizedBase + modifierImpact)
```

Role modifiers are bounded calibration nudges, not hidden attributes. They should normally stay between -12 and +12.
Positive modifiers compress near the top of the 0-100 scale so elite players do not produce unstable spikes of repeated 100 values.

Philosophy modifiers express tactical context:
- CONTROL / collective structured progression slightly improves support, spacing, and discipline.
- BLITZ / long-play progression slightly improves long-play quality, recovery range, and chaos creation.
- Individual rupture improves chaos and scramble ability while reducing discipline.
- Territorial survival improves rest defense and ball security while reducing chaos.

## Example Debug Output

```text
Tempo Half derived attribute debug:
- support timing:
  - inputs: vision 97 * 0.45 / composure 97 * 0.35 / handPlay 90 * 0.12 / endurance 84 * 0.08
  - role modifier: +8
  - philosophy modifier: +4
  - normalized result: 100
```

Creativity can raise chaos creation while reducing structural discipline through the `inverseCreativity` discipline term.
