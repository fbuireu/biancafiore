import type { citiesSchema } from "@domain/city/schema";
import type { z } from "astro/zod";

export type CityDTO = z.infer<typeof citiesSchema>;
