import { LeftArrow } from "@assets/images/svg-components/leftArrow";
import clsx from "clsx";
import { useRef } from "react";
import type { Swiper as SwiperClass } from "swiper/types";
import { useSliderNavigation } from "../../hooks/useSliderNavigation/useSliderNavigation";
import "./slider-navigation.css";

interface SliderNavigationProps {
	swiper: SwiperClass;
	locationClassName: string;
}

export const SliderNavigation: React.FC<SliderNavigationProps> = ({ swiper, locationClassName }) => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className={clsx(`slider__navigation flex row-nowrap ${locationClassName}`)}>
			<button
				ref={leftButtonRef}
				className={clsx(`slider__navigation__button --is-left --is-clickable ${locationClassName}`)}
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<LeftArrow title="Previous Article" />
			</button>
			<button
				ref={rightButtonRef}
				className={clsx(`slider__navigation__button --is-right --is-clickable ${locationClassName}`)}
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<LeftArrow title="Next Article" />
			</button>
		</div>
	);
};
