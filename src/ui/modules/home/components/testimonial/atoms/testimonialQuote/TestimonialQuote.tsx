import doubleQuote from "@assets/images/svg/double-quote.svg";
import { Image } from "@modules/core/components/image";
import type { ReactNode } from "react";
import "./testimonial-quote.css";

export interface TestimonialQuoteProps {
	children: ReactNode;
}

export const TestimonialQuote = ({ children }: TestimonialQuoteProps) => (
	<div className="testimonial__quote__wrapper">
		<Image
			classNames="testimonial__quote-symbol"
			src={(doubleQuote as unknown as ProtoImage).src}
			alt="Quote"
			loading="eager"
		/>
		<blockquote className="testimonial__quote">{children}</blockquote>
	</div>
);
