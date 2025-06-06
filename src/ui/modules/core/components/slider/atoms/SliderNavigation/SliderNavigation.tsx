import { LeftArrow } from "@assets/images/svg-components/leftArrow";
import { useRef } from "react";
import type { Swiper } from "swiper/types";
import { useSliderNavigation } from "../../hooks/useSliderNavigation/useSliderNavigation";
import "./slider-navigation.css";

interface SliderNavigationProps {
	swiper: Swiper;
}

export const SliderNavigation = ({ swiper }: SliderNavigationProps) => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className="slider__navigation flex row-nowrap">
			<button
				ref={leftButtonRef}
				className="slider__navigation__button --is-left --is-clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<LeftArrow title="Previous Article" />
			</button>
			<button
				ref={rightButtonRef}
				className="slider__navigation__button --is-right --is-clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<LeftArrow title="Next Article" />
			</button>
		</div>
	);
};
