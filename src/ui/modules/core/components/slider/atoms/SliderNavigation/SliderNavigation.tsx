import { LeftArrow } from "@assets/images/svg-components/leftArrow";
import clsx from "clsx";
import { useRef } from "react";
import type { Swiper as SwiperClass } from "swiper/types";
import useSliderNavigation from "../../hooks/useSliderNavigation/useSliderNavigation";
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
				className={clsx(`slider__navigation__button --is-left --is-clickable ${baseClassName}`)}
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<LeftArrow title="Previous Article" />
			</button>
			<button
				ref={rightButtonRef}
				className={clsx(`slider__navigation__button --is-right --is-clickable ${baseClassName}`)}
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<LeftArrow title="Next Article" />
			</button>
		</div>
	);
};
