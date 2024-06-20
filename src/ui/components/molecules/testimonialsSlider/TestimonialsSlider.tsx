import { Testimonial } from "@components/molecules/testimonial";
import type { SwiperOptions } from "swiper/types";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import { Slider } from "@components/organisms/slider";
import { Pagination } from "swiper/modules";

export interface TestimonialEntity {
	author: string;
	quote: string;
	imageSrc: string;
	description: string;
}

interface TestimonialSliderProps extends Slider<TestimonialSliderProps> {
	testimonials: TestimonialEntity[];
}

const SLIDER_CONFIG: SwiperOptions = {
	...DEFAULT_SWIPER_CONFIG,
	modules: [...(DEFAULT_SWIPER_CONFIG.modules ?? []), Pagination],
	centeredSlides: true,
	slidesPerView: 3,
	pagination: {
		clickable: true,
	},
	autoplay: {
		delay: 5000,
		pauseOnMouseEnter: true,
	},
	breakpoints: {
		1024: {
			slidesPerView: 1.85,
			spaceBetween: 150,
		},
		320: {
			slidesPerView: 1,
		},
	},
	containerModifierClass: "testimonials-",
};

export const TestimonialsSlider = ({ testimonials }: TestimonialSliderProps) => {
	return (
		<Slider
			items={testimonials}
			swiperOptions={SLIDER_CONFIG}
			classNames="--is-testimonials-slider"
			renderItem={(testimonial: TestimonialEntity) => (
				<Testimonial>
					<Testimonial.Author>{testimonial.author}</Testimonial.Author>
					<Testimonial.Quote>{testimonial.quote}</Testimonial.Quote>
					<Testimonial.Image src={testimonial.imageSrc} alt="alt" />
					<Testimonial.Description>{testimonial.description}</Testimonial.Description>
				</Testimonial>
			)}
		/>
	);
};
