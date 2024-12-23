import type { TestimonialAuthorProps } from "@modules/home/components/testimonial/atoms/testimonialAuthor";
import { TestimonialAuthor } from "@modules/home/components/testimonial/atoms/testimonialAuthor";
import type { TestimonialDescriptionProps } from "@modules/home/components/testimonial/atoms/testimonialDescription";
import { TestimonialDescription } from "@modules/home/components/testimonial/atoms/testimonialDescription";
import type { TestimonialImageProps } from "@modules/home/components/testimonial/atoms/testimonialImage";
import { TestimonialImage } from "@modules/home/components/testimonial/atoms/testimonialImage";
import type { TestimonialQuoteProps } from "@modules/home/components/testimonial/atoms/testimonialQuote";
import { TestimonialQuote } from "@modules/home/components/testimonial/atoms/testimonialQuote";
import clsx from "clsx";
import type { JSX, ReactNode } from "react";
import { useSwiperSlide } from "swiper/react";
import "./testimonial.css";

interface TestimonialProps {
	children: ReactNode;
}

export const Testimonial = ({ children }: TestimonialProps): JSX.Element => {
	const { isActive } = useSwiperSlide();

	return <article className={clsx("testimonial__content", { "--is-active": isActive })}>{children}</article>;
};

const Image = (props: TestimonialImageProps): JSX.Element => <TestimonialImage {...props} />;

const Quote = ({ children }: TestimonialQuoteProps): JSX.Element => <TestimonialQuote>{children}</TestimonialQuote>;

const Author = ({ children }: TestimonialAuthorProps): JSX.Element => <TestimonialAuthor>{children}</TestimonialAuthor>;

const Description = ({ children }: TestimonialDescriptionProps): JSX.Element => (
	<TestimonialDescription>{children}</TestimonialDescription>
);

Testimonial.Author = Author;
Testimonial.Quote = Quote;
Testimonial.Description = Description;
Testimonial.Image = Image;
