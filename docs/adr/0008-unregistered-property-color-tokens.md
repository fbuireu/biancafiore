# 8. Color tokens are intentionally not registered with @property

Date: 2026-07-26

## Status

Accepted.

## Context

Spacing, font-size and layout tokens are registered via `@property`, for typed syntax and `interpolate-size`/animation support. Applying the same treatment to colour tokens looks like the obvious way to finish the token system, and it is wrong twice: a registered custom property forces a typed `syntax` whose invalid/unset state resolves to `transparent`, which poisons theme fallbacks, and registered properties animate, so a theme switch interpolates through intermediate colours instead of flipping.

## Decision

Colour tokens stay plain inherited custom properties, unregistered. This is a deliberate omission, not an oversight: do not "complete" the token system by adding `@property` blocks for colours.

## Consequences

- Theme switching stays instant and fallback-safe ([ADR 0005](./0005-theme-token-families-and-inline-bootstrap.md)).
- Colour tokens get no type checking and cannot be transitioned, which is the accepted cost.
- The asymmetry is invisible in the stylesheet, so it is called out in the styles guide as well as here: an editor who registers colours "for consistency" reintroduces both bugs at once.
