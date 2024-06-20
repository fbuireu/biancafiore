import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass, SwiperOptions } from 'swiper/types';
import  {useState } from 'react';
import  type {ReactNode } from 'react';
import { SliderNavigation } from 'src/ui/components/organisms/slider/components/SliderNavigation';
import clsx from 'clsx';

export interface Slider<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  swiperOptions: SwiperOptions;
  classNames: string;
}

export const Slider = <T,>({ items, renderItem, swiperOptions, classNames }: Slider<T>) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

  return (
    <div className={clsx(`slider__wrapper common-wrapper ${classNames}`)}>
      <Swiper {...swiperOptions} onSwiper={setSwiperInstance}>
        <ul className={clsx(`slider__list flex row-wrap justify-space-between ${classNames}`)}>
          {items.map((item, index) => (
            <li key={`${index}-${classNames}`} className={clsx(`item__wrapper clickable ${classNames}`)}>
              <SwiperSlide>{renderItem(item, index)}</SwiperSlide>
            </li>
          ))}
        </ul>
        {swiperInstance && <SliderNavigation swiper={swiperInstance} baseClassName={classNames} />}
      </Swiper>
    </div>
  );
};
