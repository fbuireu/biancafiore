import "./testimonial.css";
import clsx from "clsx";
import type { ReactNode } from "react";

import { TestimonialAuthor } from "@modules/home/components/testimonial/atoms/testimonialAuthor";
import type { TestimonialAuthorProps } from "@modules/home/components/testimonial/atoms/testimonialAuthor";
import { TestimonialDescription } from "@modules/home/components/testimonial/atoms/testimonialDescription";
import type { TestimonialDescriptionProps } from "@modules/home/components/testimonial/atoms/testimonialDescription";
import { TestimonialImage } from "@modules/home/components/testimonial/atoms/testimonialImage";
import type { TestimonialImageProps } from "@modules/home/components/testimonial/atoms/testimonialImage";
import { TestimonialQuote } from "@modules/home/components/testimonial/atoms/testimonialQuote";
import type { TestimonialQuoteProps } from "@modules/home/components/testimonial/atoms/testimonialQuote";
import { useSwiperSlide } from "swiper/react";

interface TestimonialProps {
	children: ReactNode;
}

export const Testimonial = ({ children }: TestimonialProps) => {
	const { isActive } = useSwiperSlide();

	return <article className={clsx("testimonial__content", { "--is-active": isActive })}>{children}</article>;
};

const Image = (props: TestimonialImageProps) => <TestimonialImage {...props} />;

const Quote = ({ children }: TestimonialQuoteProps) => <TestimonialQuote>{children}</TestimonialQuote>;

const Author = ({ children }: TestimonialAuthorProps) => <TestimonialAuthor>{children}</TestimonialAuthor>;

const Description = ({ children }: TestimonialDescriptionProps) => (
	<TestimonialDescription>{children}</TestimonialDescription>
);

Testimonial.Author = Author;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
