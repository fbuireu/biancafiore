import "./testimonial-author.css";
import type { ReactNode } from "react";

export interface TestimonialAuthorProps {
	children: ReactNode;
}

export const TestimonialAuthor = ({ children }: TestimonialAuthorProps) => (
	<h4 className="testimonial__author font-serif">{children}</h4>
);
