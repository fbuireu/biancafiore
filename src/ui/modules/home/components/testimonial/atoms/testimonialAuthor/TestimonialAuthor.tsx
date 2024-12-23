import type { JSX, ReactNode } from "react";
import "./testimonial-author.css";

export interface TestimonialAuthorProps {
	children: ReactNode;
}

export const TestimonialAuthor = ({ children }: TestimonialAuthorProps): JSX.Element => (
	<h4 className="testimonial__author font-serif">{children}</h4>
);
