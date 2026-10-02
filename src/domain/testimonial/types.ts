import type { z } from "astro/zod";
import type { testimonialSchema } from "./schema";

export type TestimonialDTO = z.infer<typeof testimonialSchema>;
