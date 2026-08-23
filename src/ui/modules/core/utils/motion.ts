const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
	return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const COLLAPSED_TIME_SCALE = 1000;

export function motionTimeScale(): number {
	return prefersReducedMotion() ? COLLAPSED_TIME_SCALE : 1;
}

export function successDelay(animatedMilliseconds: number): number {
	return prefersReducedMotion() ? 0 : animatedMilliseconds;
}

export function scrollBehavior(): ScrollBehavior {
	return prefersReducedMotion() ? "auto" : "smooth";
}
