import type { citiesSchema, cityPeriodSchema } from "@domain/city/schema";
import type { z } from "astro/zod";

export type CityDTO = z.infer<typeof citiesSchema>;

export type CityPeriod = z.infer<typeof cityPeriodSchema>;
