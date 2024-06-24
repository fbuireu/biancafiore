import "./testimonial.css";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
	TestimonialAuthor,
	type TestimonialAuthorProps,
} from "src/ui/components/molecules/testimonial/components/testimonialAuthor";
import {
	TestimonialDescription,
	type TestimonialDescriptionProps,
} from "src/ui/components/molecules/testimonial/components/testimonialDescription";
import {
	TestimonialImage,
	type TestimonialImageProps,
} from "src/ui/components/molecules/testimonial/components/testimonialImage";
import {
	TestimonialQuote,
	type TestimonialQuoteProps,
} from "src/ui/components/molecules/testimonial/components/testimonialQuote";
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
