import type { TestimonialDTO } from "@application/dto/testimonial/types.ts";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";
import { Slider } from "@modules/core/components/slider";
import { Testimonial } from "@modules/home/components/testimonial";
import { Pagination } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";

interface TestimonialSliderProps extends Partial<Slider<TestimonialSliderProps>> {
	testimonials: TestimonialDTO[];
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
			renderItem={(testimonial) => (
				<Testimonial>
					<Testimonial.Author>{testimonial.author}</Testimonial.Author>
					<Testimonial.Quote>{testimonial.quote}</Testimonial.Quote>
					<Testimonial.Image src={testimonial.image.url} alt={testimonial.author} />
					<Testimonial.Description>{testimonial.role}</Testimonial.Description>
				</Testimonial>
			)}
		/>
	);
};
