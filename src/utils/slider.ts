export const initArticleSlider = (slider: HTMLElement): void => {
	const track = slider.querySelector<HTMLElement>("[data-slider-track]");
	if (!track) return;

	const prev = slider.querySelector<HTMLButtonElement>("[data-slider-prev]");
	const next = slider.querySelector<HTMLButtonElement>("[data-slider-next]");
	const delay = Number(slider.dataset.sliderDelay ?? 10000);

	const getSlideStep = (): number => {
		const slide = track.querySelector<HTMLElement>("[data-slider-slide]");
		if (!slide) return 0;
		return (
			slide.getBoundingClientRect().width +
			parseFloat(getComputedStyle(track).columnGap || "0")
		);
	};

	const advance = (dir: 1 | -1): void => {
		const step = getSlideStep();
		const { scrollLeft, scrollWidth, clientWidth } = track;
		if (dir > 0 && scrollLeft + clientWidth >= scrollWidth - 1) {
			track.scrollTo({ left: 0, behavior: "smooth" });
		} else if (dir < 0 && scrollLeft <= 1) {
			track.scrollTo({ left: scrollWidth - clientWidth, behavior: "smooth" });
		} else {
			track.scrollBy({ left: dir * step, behavior: "smooth" });
		}
	};

	prev?.addEventListener("click", () => advance(-1));
	next?.addEventListener("click", () => advance(1));

	track.setAttribute("tabindex", "0");
	track.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			advance(-1);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			advance(1);
		}
	});

	let timer = setInterval(() => advance(1), delay);
	slider.addEventListener("mouseenter", () => clearInterval(timer));
	slider.addEventListener("mouseleave", () => {
		timer = setInterval(() => advance(1), delay);
	});
};
