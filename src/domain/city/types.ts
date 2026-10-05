import type { z } from "@shared/utils/zod";
import type { cityPeriodSchema, citySchema } from "./schema";

export type CityDTO = z.infer<typeof citySchema>;

export type CityPeriod = z.infer<typeof cityPeriodSchema>;
