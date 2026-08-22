const SELECTORS = {
	TRACK: ".slider__track",
	SLIDE: ".slider__slide",
	PREVIOUS: ".slider__btn--prev",
	NEXT: ".slider__btn--next",
	DOT: ".slider__dot",
} as const;

const ACTIVE_DOT_CLASS = "slider__dot--active";
const SCROLL_END_TOLERANCE = 1;

const distanceToCentre = (track: HTMLElement, slide: HTMLElement): number => {
	const trackBox = track.getBoundingClientRect();
	const slideBox = slide.getBoundingClientRect();

	return Math.abs(slideBox.left + slideBox.width / 2 - (trackBox.left + trackBox.width / 2));
};

export function activeSlideIndex(track: HTMLElement, slides: HTMLElement[]): number {
	return slides.reduce(
		(closest, slide, index) =>
			distanceToCentre(track, slide) < distanceToCentre(track, slides[closest] as HTMLElement) ? index : closest,
		0,
	);
}

export function initSlider(wrapper: HTMLElement): void {
	const track = wrapper.querySelector<HTMLElement>(SELECTORS.TRACK);
	const previous = wrapper.querySelector<HTMLButtonElement>(SELECTORS.PREVIOUS);
	const next = wrapper.querySelector<HTMLButtonElement>(SELECTORS.NEXT);

	if (!track || !previous || !next) return;

	const slides = [...track.querySelectorAll<HTMLElement>(SELECTORS.SLIDE)];
	const dots = [...wrapper.querySelectorAll<HTMLButtonElement>(SELECTORS.DOT)];

	const update = (): void => {
		previous.disabled = track.scrollLeft <= 0;
		next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - SCROLL_END_TOLERANCE;

		if (dots.length === 0) return;

		const active = activeSlideIndex(track, slides);

		dots.forEach((dot, index) => {
			dot.classList.toggle(ACTIVE_DOT_CLASS, index === active);
		});
	};

	const page = (direction: number): void => track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });

	previous.addEventListener("click", () => page(-1));
	next.addEventListener("click", () => page(1));
	track.addEventListener("scroll", update, { passive: true });

	dots.forEach((dot, index) => {
		dot.addEventListener("click", () =>
			slides.at(index)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }),
		);
	});

	update();
}
