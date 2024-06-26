import "./testimonial-description.css";
import type { ReactNode } from "react";

export interface TestimonialDescriptionProps {
	children: ReactNode;
}

export const TestimonialDescription = ({ children }: TestimonialDescriptionProps) => (
	<p className="testimonial__description">{children}</p>
);
