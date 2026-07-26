# Color tokens are intentionally not registered with @property

Spacing, font-size and layout tokens are registered via `@property` (for typed syntax and `interpolate-size`/animation support), but color tokens are deliberately left unregistered. Registering a color custom property forces a typed `syntax` whose invalid/unset state resolves to `transparent`, which would poison theme fallbacks, and registered properties animate — making theme switches interpolate through intermediate colors instead of flipping instantly.

Leaving color tokens as plain inherited custom properties keeps theme switching instant and fallback-safe. This is a deliberate omission: do not "complete" the token system by adding `@property` blocks for colors.
