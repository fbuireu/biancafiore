import { getLocation } from "@modules/core/utils/getLocation";
import clsx from "clsx";
import type { JSX, ReactNode } from "react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass, SwiperOptions } from "swiper/types";
import { SliderNavigation } from "./atoms/SliderNavigation";
import "swiper/css/bundle";

export interface Slider<T> {
	items: T[];
	renderItem: (item: T) => ReactNode;
	swiperOptions: SwiperOptions;
	origin: URL;
}

export const Slider = <T,>({ items, renderItem, swiperOptions, origin }: Slider<T>): JSX.Element => {
	const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
	const location = getLocation(origin);
	const locationClassName = location ? `--is-${location}` : "";

	return (
		<div className={clsx("slider__wrapper common-wrapper", locationClassName)}>
			<Swiper {...swiperOptions} onSwiper={setSwiperInstance}>
				<ul className={clsx("slider__list flex row-wrap justify-space-between", locationClassName)}>
					{items.map((item) => (
						<li key={crypto.randomUUID()} className={clsx("item__wrapper --is-clickable", locationClassName)}>
							<SwiperSlide key={crypto.randomUUID()}>{renderItem(item)}</SwiperSlide>
						</li>
					))}
				</ul>
				{swiperInstance && <SliderNavigation swiper={swiperInstance} locationClassName={locationClassName} />}
			</Swiper>
		</div>
	);
};
