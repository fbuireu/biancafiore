import "./testimonials-navigation.css";
import { useSwiper } from "swiper/react";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import useSliderNavigation from "@ui/hooks/useSliderNavigation/useSliderNavigation.ts";
import { useRef } from "react";

export const TestimonialsNavigation = () => {
	const leftButtonRef = useRef<HTMLButtonElement>(null);
	const rightButtonRef = useRef<HTMLButtonElement>(null);
	const swiper = useSwiper();
	useSliderNavigation({ swiper, leftButtonRef, rightButtonRef });

	return (
		<div className="testimonials__navigation flex row-nowrap">
			<button
				ref={leftButtonRef}
				className="testimonials__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<img src={horizontalArrow.src} alt="Previous testimonial" />
			</button>
			<button
				ref={rightButtonRef}
				className="testimonials__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<img src={horizontalArrow.src} alt="Next testimonial" />
			</button>
		</div>
	);
};
