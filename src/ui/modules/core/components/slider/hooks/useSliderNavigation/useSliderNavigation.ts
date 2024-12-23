import type { RefObject } from "react";
import { useEffect } from "react";
import type { Swiper } from "swiper";

enum ArrowTypes {
	ARROW_LEFT = "ArrowLeft",
	ARROW_RIGHT = "ArrowRight",
}

interface UseSliderNavigationParams {
	swiper: Swiper;
	leftButtonRef: RefObject<HTMLButtonElement | null>;
	rightButtonRef: RefObject<HTMLButtonElement | null>;
}

const CLASSNAME = "--is-force-clickable";

export function useSliderNavigation({ swiper, leftButtonRef, rightButtonRef }: UseSliderNavigationParams): void {
	useEffect(() => {
		const controller = new AbortController();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!leftButtonRef.current || !rightButtonRef.current) return;

			if (event.key === ArrowTypes.ARROW_LEFT) {
				swiper.slidePrev();
				leftButtonRef.current.classList.add(CLASSNAME);
				setTimeout(() => leftButtonRef.current?.classList.remove(CLASSNAME), 200);
			} else if (event.key === ArrowTypes.ARROW_RIGHT) {
				swiper.slideNext();
				rightButtonRef.current.classList.add(CLASSNAME);
				setTimeout(() => rightButtonRef.current?.classList.remove(CLASSNAME), 200);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => controller.abort();
	}, [leftButtonRef, rightButtonRef, swiper]);
}
