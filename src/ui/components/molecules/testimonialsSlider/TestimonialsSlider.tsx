import { Swiper, SwiperSlide } from "swiper/react";
import { Testimonial } from "@components/molecules/testimonial";
import type { SwiperOptions } from "swiper/types";
import { TestimonialsNavigation } from "./components/testimonialsNavigation";
import { DEFAULT_SWIPER_CONFIG } from "@const/const.ts";

const SLIDER_CONFIG: SwiperOptions = {
	...DEFAULT_SWIPER_CONFIG,
	centeredSlides: true,
	slidesPerView: 3,
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

export const TestimonialsSlider = () => {
	return (
		<div className="testimonials__slider__wrapper common-wrapper">
			<Swiper {...SLIDER_CONFIG}>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 1</Testimonial.Author>
						<Testimonial.Quote>
							Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
							lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
							Yellow Jack fathom broadside snow clipper quarter.
						</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 2</Testimonial.Author>
						<Testimonial.Quote>Bla bla Bla bla Bla bla Bla bla Bla bla Bla bla Bla bla</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>Role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 3</Testimonial.Author>
						<Testimonial.Quote>
							Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
							lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
							Yellow Jack fathom broadside snow clipper quarter.
						</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>Role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 4</Testimonial.Author>
						<Testimonial.Quote>
							Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
							lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
							Yellow Jack fathom broadside snow clipper quarter.
						</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>Role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 5</Testimonial.Author>
						<Testimonial.Quote>
							Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
							lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
							Yellow Jack fathom broadside snow clipper quarter.
						</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>Role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<SwiperSlide>
					<Testimonial>
						<Testimonial.Author>Ferran Buireu 6</Testimonial.Author>
						<Testimonial.Quote>
							Careen red ensign marooned Pirate Round Buccaneer spirits yard Corsair pink aye. Galleon scuppers gabion
							lanyard trysail fluke to go on account Sea Legs Brethren of the Coast keelhaul. Tender topsail cable cog
							Yellow Jack fathom broadside snow clipper quarter.
						</Testimonial.Quote>
						<Testimonial.Image src="https://via.placeholder.com/150" alt="alt" />
						<Testimonial.Description>Role</Testimonial.Description>
					</Testimonial>
				</SwiperSlide>
				<TestimonialsNavigation />
			</Swiper>
		</div>
	);
};
