import "./about-latest-articles-slider-navigation.css";
import { useSwiper } from "swiper/react";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";

export const AboutLatestArticlesSliderNavigation = () => {
	const swiper = useSwiper();

	return (
		<div className="about__latest-articles__slider__navigation flex row-nowrap">
			<button
				className="about__latest-articles__slider__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<img src={horizontalArrow.src} alt={"Previous Article"} />
			</button>
			<button
				className="about__latest-articles__slider__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<img src={horizontalArrow.src} alt={"Next Article"} />
			</button>
		</div>
	);
};
