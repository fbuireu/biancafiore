import type { z } from "@shared/utils/zod";
import type { testimonialSchema } from "./schema";

export type TestimonialDTO = z.infer<typeof testimonialSchema>;
