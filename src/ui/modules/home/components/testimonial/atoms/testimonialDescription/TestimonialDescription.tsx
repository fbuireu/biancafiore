import type { JSX, ReactNode } from "react";
import "./testimonial-description.css";

export interface TestimonialDescriptionProps {
	children: ReactNode;
}

export const TestimonialDescription = ({ children }: TestimonialDescriptionProps): JSX.Element => (
	<p className="testimonial__description">{children}</p>
);
