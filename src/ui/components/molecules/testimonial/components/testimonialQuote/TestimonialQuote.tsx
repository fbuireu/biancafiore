import "./testimonial-quote.css";
import doubleQuote from "@assets/images/svg/double-quote.svg";
import { Image } from "@components/atoms/Image";
import type { ReactNode } from "react";

export interface TestimonialQuoteProps {
	children: ReactNode;
}

export const TestimonialQuote = ({ children }: TestimonialQuoteProps) => (
	<div className="testimonial__quote__wrapper">
		<Image classNames="testimonial__quote-symbol" src={(doubleQuote as unknown as ProtoImage).src} alt={"Quote"} />
		<blockquote className="testimonial__quote">{children}</blockquote>
	</div>
);
