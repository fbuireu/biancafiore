import "./about-latest-articles-slider-navigation.css";
import { useSwiper } from "swiper/react";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import { useRef } from "react";
import useSliderNavigation from "@ui/hooks/useSliderNavigation/useSliderNavigation.ts";

export const AboutLatestArticlesSliderNavigation = () => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	const swiper = useSwiper();
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className="about__latest-articles__slider__navigation flex row-nowrap">
			<button
				ref={leftButtonRef}
				className="about__latest-articles__slider__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<img src={horizontalArrow.src} alt={"Previous Article"} loading="lazy" decoding="async" />
			</button>
			<button
				ref={rightButtonRef}
				className="about__latest-articles__slider__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<img src={horizontalArrow.src} alt={"Next Article"} loading="lazy" decoding="async" />
			</button>
		</div>
	);
};
