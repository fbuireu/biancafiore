import type { ReactNode } from "react";
import "./testimonial-author.css";

export interface TestimonialAuthorProps {
	children: ReactNode;
}

export const TestimonialAuthor = ({ children }: TestimonialAuthorProps) => (
	<h5 className="testimonial__author font-serif">{children}</h5>
);
