import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import { useRef } from "react";
import useSliderNavigation from "@ui/hooks/useSliderNavigation/useSliderNavigation.ts";
import type { Swiper as SwiperClass } from "swiper/types";
import clsx from "clsx";
import "./slider-navigation.css";

interface SliderNavigationProps {
	swiper: SwiperClass;
	baseClassName: string;
}

export const SliderNavigation: React.FC<SliderNavigationProps> = ({ swiper, baseClassName }) => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className={clsx(`slider__navigation flex row-nowrap ${baseClassName}`)}>
			<button
				ref={leftButtonRef}
				className={clsx(`slider__navigation__button --left clickable ${baseClassName}`)}
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<img src={horizontalArrow.src} alt="Previous Article" loading="lazy" decoding="async" />
			</button>
			<button
				ref={rightButtonRef}
				className={clsx(`slider__navigation__button --right clickable ${baseClassName}`)}
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<img src={horizontalArrow.src} alt="Next Article" loading="lazy" decoding="async" />
			</button>
		</div>
	);
};
