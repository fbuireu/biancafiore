import type { RefObject } from "react";
import { useEffect } from "react";
import type { Swiper } from "swiper";

enum ArrowTypes {
	ARROW_LEFT = "ArrowLeft",
	ARROW_RIGHT = "ArrowRight",
}

interface UseSliderNavigationParams {
	swiper: Swiper;
	leftButtonRef: RefObject<HTMLButtonElement>;
	rightButtonRef: RefObject<HTMLButtonElement>;
}

function useSliderNavigation({ swiper, leftButtonRef, rightButtonRef }: UseSliderNavigationParams) {
	useEffect(() => {
		const controller = new AbortController();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!leftButtonRef.current || !rightButtonRef.current) return;

			if (event.key === ArrowTypes.ARROW_LEFT) {
				swiper.slidePrev();
				leftButtonRef.current.classList.add("--force-clickable");
				setTimeout(() => leftButtonRef.current?.classList.remove("--force-clickable"), 200);
			} else if (event.key === ArrowTypes.ARROW_RIGHT) {
				swiper.slideNext();
				rightButtonRef.current.classList.add("--force-clickable");
				setTimeout(() => rightButtonRef.current?.classList.remove("--force-clickable"), 200);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => controller.abort();
	}, [leftButtonRef, rightButtonRef, swiper]);
}

export default useSliderNavigation;
