import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import { Image } from "@modules/core/components/image";
import clsx from "clsx";
import { useRef } from "react";
import type { Swiper as SwiperClass } from "swiper/types";
import useSliderNavigation from "../../hooks/useSliderNavigation/useSliderNavigation.ts";
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
				<Image src={(horizontalArrow as unknown as ProtoImage).src} alt="Previous Article" />
			</button>
			<button
				ref={rightButtonRef}
				className={clsx(`slider__navigation__button --right clickable ${baseClassName}`)}
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<Image src={(horizontalArrow as unknown as ProtoImage).src} alt="Next Article" />
			</button>
		</div>
	);
};
