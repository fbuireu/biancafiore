import "./latest-articles-slider-navigation.css";
import { useSwiper } from "swiper/react";
import { LeftArrow } from "@assets/images/svg-components/leftArrow";
import { useRef } from "react";
import useSliderNavigation from "@ui/hooks/useSliderNavigation/useSliderNavigation.ts";

export const LatestArticlesSliderNavigation = () => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	const swiper = useSwiper();
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className="latest-articles__slider__navigation flex row-nowrap">
			<button
				ref={leftButtonRef}
				className="latest-articles__slider__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<LeftArrow fill="#ffffff" />
			</button>
			<button
				ref={rightButtonRef}
				className="latest-articles__slider__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<LeftArrow fill="#ffffff" />
			</button>
		</div>
	);
};
