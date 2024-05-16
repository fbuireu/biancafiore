import "./latest-articles-slider-navigation.css";
import { useSwiper } from "swiper/react";
import { LeftArrow } from '@assets/images/svg-components/leftArrow';

export const LatestArticlesSliderNavigation = () => {
	const swiper = useSwiper();

	return (
		<div className="latest-articles__slider__navigation flex row-nowrap">
			<button
				className="latest-articles__slider__navigation__button --left clickable"
				type="button"
				onClick={() => swiper.slidePrev()}
			>
				<LeftArrow fill="#ffffff"/>
			</button>
			<button
				className="latest-articles__slider__navigation__button --right clickable"
				type="button"
				onClick={() => swiper.slideNext()}
			>
				<LeftArrow fill="#ffffff"/>
			</button>
		</div>
	);
};
