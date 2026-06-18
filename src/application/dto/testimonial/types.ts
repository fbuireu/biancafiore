import type { testimonialsSchema } from "@application/entities/testimonials";
import type { EmDashImageField } from "@shared/application/types";
import type { z } from "astro/zod";

/** `data` payload of an EmDash `testimonials` entry. */
export interface RawTestimonial {
	author: string;
	quote: string;
	image?: EmDashImageField;
	role: string;
}

export type TestimonialDTO = z.infer<typeof testimonialsSchema>;
