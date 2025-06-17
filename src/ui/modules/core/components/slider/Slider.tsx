import type { ReactNode } from "react";
import { useState } from "react";
import "swiper/css/bundle";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass, SwiperOptions } from "swiper/types";
import { SliderNavigation } from "./atoms/SliderNavigation";

export interface Slider<T> {
	items: T[];
	renderItem: (item: T) => ReactNode;
	swiperOptions: SwiperOptions;
}

export const Slider = <T,>({ items, renderItem, swiperOptions }: Slider<T>) => {
	const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

	return (
		<div className="slider-wrapper common-wrapper">
			<Swiper {...swiperOptions} onSwiper={setSwiperInstance}>
				<ul className="slider__list flex row-wrap justify-space-between">
					{items.map((item) => (
						<li key={crypto.randomUUID()} className="item-wrapper --is-clickable">
							<SwiperSlide key={crypto.randomUUID()}>{renderItem(item)}</SwiperSlide>
						</li>
					))}
				</ul>
				{swiperInstance && <SliderNavigation swiper={swiperInstance} />}
			</Swiper>
		</div>
	);
};
