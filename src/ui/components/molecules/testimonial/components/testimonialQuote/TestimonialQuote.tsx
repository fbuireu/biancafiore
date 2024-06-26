import "./testimonial-quote.css";
import doubleQuote from "@assets/images/svg/double-quote.svg";
import type { ReactNode } from "react";

export interface TestimonialQuoteProps {
	children: ReactNode;
}

export const TestimonialQuote = ({ children }: TestimonialQuoteProps) => (
	<div className="testimonial__quote__wrapper">
		<img className="testimonial__quote-symbol" src={doubleQuote.src} alt={"Quote"} loading="lazy" decoding="async" />
		<blockquote className="testimonial__quote">{children}</blockquote>
	</div>
);
