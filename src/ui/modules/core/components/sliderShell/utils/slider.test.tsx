import { activeSlideIndex, initSlider } from "@modules/core/components/sliderShell/utils/slider";
import { beforeEach, describe, expect, it, vi } from "vitest";

const boxOf = (left: number, width: number) => () => ({ left, width, right: left + width }) as DOMRect;

interface RenderParams {
	slides: number;
	dots?: boolean;
}

const render = ({ slides, dots = false }: RenderParams) => {
	document.body.innerHTML = `
		<div class="slider-wrapper" data-has-buttons="true">
			<button class="slider__btn slider__btn--prev" disabled></button>
			<ul class="slider__track">
				${Array.from({ length: slides }, () => '<li class="slider__slide"></li>').join("")}
			</ul>
			<button class="slider__btn slider__btn--next"></button>
			${
				dots
					? `<nav class="slider__nav">${Array.from(
							{ length: slides },
							(_, index) => `<button class="slider__dot" data-index="${index}"></button>`,
						).join("")}</nav>`
					: ""
			}
		</div>`;

	const wrapper = document.querySelector<HTMLElement>(".slider-wrapper") as HTMLElement;
	const track = document.querySelector<HTMLElement>(".slider__track") as HTMLElement;

	Object.defineProperty(track, "clientWidth", { value: 300, configurable: true });
	Object.defineProperty(track, "scrollWidth", { value: 300 * slides, configurable: true });
	track.scrollBy = vi.fn();
	track.getBoundingClientRect = boxOf(0, 300);

	[...track.querySelectorAll<HTMLElement>(".slider__slide")].forEach((slide, index) => {
		slide.getBoundingClientRect = boxOf(index * 300, 300);
		slide.scrollIntoView = vi.fn();
	});

	return {
		wrapper,
		track,
		previous: wrapper.querySelector<HTMLButtonElement>(".slider__btn--prev") as HTMLButtonElement,
		next: wrapper.querySelector<HTMLButtonElement>(".slider__btn--next") as HTMLButtonElement,
		slides: [...track.querySelectorAll<HTMLElement>(".slider__slide")],
		dots: [...wrapper.querySelectorAll<HTMLButtonElement>(".slider__dot")],
	};
};

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("activeSlideIndex", () => {
	it("names the slide nearest the track's centre, not the one nearest its start", () => {
		const { track, slides } = render({ slides: 3 });

		expect(activeSlideIndex(track, slides)).toBe(0);

		slides.forEach((slide, index) => {
			slide.getBoundingClientRect = boxOf(index * 300 - 300, 300);
		});

		expect(activeSlideIndex(track, slides)).toBe(1);
	});
});

describe("initSlider", () => {
	it("pages by the width of the track, so a slider showing four moves four", () => {
		const { wrapper, track, next } = render({ slides: 5 });

		initSlider(wrapper);
		next.click();

		expect(track.scrollBy).toHaveBeenCalledWith({ left: 300, behavior: "smooth" });
	});

	it("pages backwards by the same width once there is somewhere to go back to", () => {
		const { wrapper, track, previous } = render({ slides: 5 });

		track.scrollLeft = 300;
		initSlider(wrapper);
		previous.click();

		expect(track.scrollBy).toHaveBeenCalledWith({ left: -300, behavior: "smooth" });
	});

	it("disables the previous button at the start rather than wrapping to the end", () => {
		const { wrapper, previous, next } = render({ slides: 5 });

		initSlider(wrapper);

		expect(previous.disabled).toBe(true);
		expect(next.disabled).toBe(false);
	});

	it("disables the next button once the track has run out", () => {
		const { wrapper, track, next } = render({ slides: 2 });

		track.scrollLeft = 300;
		initSlider(wrapper);

		expect(next.disabled).toBe(true);
	});

	it("marks the first dot active on load", () => {
		const { wrapper, dots } = render({ slides: 3, dots: true });

		initSlider(wrapper);

		expect(dots.map((dot) => dot.classList.contains("slider__dot--active"))).toEqual([true, false, false]);
	});

	it("centres the slide a dot addresses rather than paging towards it", () => {
		const { wrapper, slides, dots } = render({ slides: 3, dots: true });

		initSlider(wrapper);
		dots[2]?.click();

		expect(slides[2]?.scrollIntoView).toHaveBeenCalledWith({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
	});

	it("follows the track's own scrolling, so dragging updates the active dot", () => {
		const { wrapper, track, slides, dots } = render({ slides: 3, dots: true });

		initSlider(wrapper);
		slides.forEach((slide, index) => {
			slide.getBoundingClientRect = boxOf(index * 300 - 300, 300);
		});
		track.dispatchEvent(new Event("scroll"));

		expect(dots.map((dot) => dot.classList.contains("slider__dot--active"))).toEqual([false, true, false]);
	});

	it("leaves a wrapper with no track alone rather than throwing", () => {
		document.body.innerHTML = '<div class="slider-wrapper"></div>';

		expect(() => initSlider(document.querySelector(".slider-wrapper") as HTMLElement)).not.toThrow();
	});
});
