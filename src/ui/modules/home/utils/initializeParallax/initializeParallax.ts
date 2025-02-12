import { gsap } from "gsap";
import type { MouseEvent } from "react";

interface ParallaxParams {
	event: globalThis.MouseEvent | MouseEvent;
	target: string;
	movement: number;
}

export function initializeParallax(): void {
	const WELCOME = document.querySelector(".welcome") as HTMLElement;

	if (!(WELCOME instanceof HTMLElement)) {
		return;
	}

	WELCOME.addEventListener("mousemove", (event) => {
		attachParallax({ event, target: ".welcome__image", movement: 30 });
		attachParallax({
			event,
			target: ".welcome__text__section.--left",
			movement: 50,
		});
		attachParallax({
			event,
			target: ".welcome__text__section.--right .welcome__text__title",
			movement: -20,
		});
		attachParallax({
			event,
			target: ".welcome__text__section.--right .welcome__text__body",
			movement: -15,
		});
	});

	const attachParallax = ({ event, target, movement }: ParallaxParams): void => {
		if (!(WELCOME instanceof HTMLElement)) {
			return;
		}

		const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = WELCOME;
		const relativeX = event.pageX - offsetLeft;
		const relativeY = event.pageY - offsetTop;

		gsap.to(target, {
			duration: 1,
			x: ((relativeX - offsetWidth / 2) / offsetWidth) * movement,
			y: ((relativeY - offsetHeight / 2) / offsetHeight) * movement,
		});
	};
}
