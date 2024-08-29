import type { CollectionEntry } from "astro:content";
import { DEFAULT_SWIPER_CONFIG } from "@const/const";
import { Slider } from "@modules/core/components/slider";
import { Testimonial } from "@modules/home/components/testimonial";
import { Pagination } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";

interface TestimonialSliderProps extends Partial<Slider<TestimonialSliderProps>> {
	testimonials: CollectionEntry<"testimonials">[];
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
					<Testimonial.Author>{testimonial.data.author}</Testimonial.Author>
					<Testimonial.Quote>{testimonial.data.quote}</Testimonial.Quote>
					<Testimonial.Image src={testimonial.data.image.url} alt={testimonial.data.author} />
					<Testimonial.Description>{testimonial.data.role}</Testimonial.Description>
				</Testimonial>
			)}
		/>
	);
};
