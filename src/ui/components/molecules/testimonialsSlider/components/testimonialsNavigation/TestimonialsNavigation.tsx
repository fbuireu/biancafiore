import "./testimonials-navigation.css";
import { useSwiper } from "swiper/react";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";

export const TestimonialsNavigation = () => {
	const swiper = useSwiper();

	return (
		<div className="testimonials__navigation flex row-nowrap">
			<button
				className="testimonials__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<img src={horizontalArrow.src} alt={"Previous testimonial"} />
			</button>
			<button
				className="testimonials__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<img src={horizontalArrow.src} alt={"Next testimonial"} />
			</button>
		</div>
	);
};
