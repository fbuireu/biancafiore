import { scrollBehavior } from "../../../utils/motion";
import {
	SLIDER_DOT_ACTIVE_CLASS,
	SLIDER_DOT_CLASS,
	SLIDER_LOOPING_ATTRIBUTE,
	SLIDER_NEXT_CLASS,
	SLIDER_PREVIOUS_CLASS,
	SLIDER_SLIDE_CLASS,
	SLIDER_TRACK_CLASS,
} from "../const";

const SELECTORS = {
	TRACK: `.${SLIDER_TRACK_CLASS}`,
	SLIDE: `.${SLIDER_SLIDE_CLASS}`,
	PREVIOUS: `.${SLIDER_PREVIOUS_CLASS}`,
	NEXT: `.${SLIDER_NEXT_CLASS}`,
	DOT: `.${SLIDER_DOT_CLASS}`,
} as const;

const SCROLL_END_TOLERANCE = 1;

interface DistanceToCentreParams {
	track: HTMLElement;
	slide: HTMLElement;
}

const distanceToCentre = ({ track, slide }: DistanceToCentreParams): number => {
	const trackBox = track.getBoundingClientRect();
	const slideBox = slide.getBoundingClientRect();

	return Math.abs(slideBox.left + slideBox.width / 2 - (trackBox.left + trackBox.width / 2));
};

interface ActiveSlideIndexParams {
	track: HTMLElement;
	slides: HTMLElement[];
}

export function activeSlideIndex({ track, slides }: ActiveSlideIndexParams): number {
	return slides.reduce(
		(closest, slide, index) =>
			distanceToCentre({ track, slide }) < distanceToCentre({ track, slide: slides[closest] as HTMLElement })
				? index
				: closest,
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
	const isLooping = wrapper.getAttribute(SLIDER_LOOPING_ATTRIBUTE) === "true";

	const centre = (index: number): void => {
		slides.at(index)?.scrollIntoView({ behavior: scrollBehavior(), block: "nearest", inline: "center" });
	};

	const update = (): void => {
		previous.disabled = !isLooping && track.scrollLeft <= 0;
		next.disabled = !isLooping && track.scrollLeft >= track.scrollWidth - track.clientWidth - SCROLL_END_TOLERANCE;

		if (dots.length === 0) return;

		const active = activeSlideIndex({ track, slides });

		dots.forEach((dot, index) => {
			dot.classList.toggle(SLIDER_DOT_ACTIVE_CLASS, index === active);
			dot.setAttribute("aria-current", String(index === active));
		});
	};

	const step = (direction: number): void => {
		if (!isLooping) {
			track.scrollBy({ left: direction * track.clientWidth, behavior: scrollBehavior() });

			return;
		}

		centre((activeSlideIndex({ track, slides }) + direction + slides.length) % slides.length);
	};

	previous.addEventListener("click", () => step(-1));
	next.addEventListener("click", () => step(1));
	track.addEventListener("scroll", update, { passive: true });

	dots.forEach((dot, index) => {
		dot.addEventListener("click", () => centre(index));
	});

	update();
}
