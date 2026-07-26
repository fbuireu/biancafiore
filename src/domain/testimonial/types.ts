import type { testimonialsSchema } from "@domain/testimonial/schema";
import type { z } from "astro/zod";

export type TestimonialDTO = z.infer<typeof testimonialsSchema>;
