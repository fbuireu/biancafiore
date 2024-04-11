import React, { type ReactNode } from "react";
import "./testimonial.css";
import {
	TestimonialImage,
	type TestimonialImageProps,
} from "src/ui/components/molecules/testimonial/components/testimonialImage";
import {
	TestimonialQuote,
	type TestimonialQuoteProps,
} from "src/ui/components/molecules/testimonial/components/testimonialQuote";
import {
	TestimonialDescription,
	type TestimonialDescriptionProps,
} from "src/ui/components/molecules/testimonial/components/testimonialDescription";
import {
	TestimonialAuthor,
	type TestimonialAuthorProps,
} from "src/ui/components/molecules/testimonial/components/testimonialAuthor";
import { useSwiperSlide } from "swiper/react";

interface TestimonialProps {
	children: ReactNode;
}

export const Testimonial = ({ children }: TestimonialProps) => {
	const { isActive } = useSwiperSlide();

	return (
		<article
			className={`testimonial__content ${isActive ? `--is-active` : ``}`}
		>
			{children}
		</article>
	);
};

const Image = (props: TestimonialImageProps) => <TestimonialImage {...props} />;

const Quote = ({ children }: TestimonialQuoteProps) => (
	<TestimonialQuote>{children}</TestimonialQuote>
);

const Author = ({ children }: TestimonialAuthorProps) => (
	<TestimonialAuthor>{children}</TestimonialAuthor>
);

const Description = ({ children }: TestimonialDescriptionProps) => (
	<TestimonialDescription>{children}</TestimonialDescription>
);

Testimonial.Author = Author;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
