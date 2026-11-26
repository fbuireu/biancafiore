import { z } from "@shared/utils/zod";

export const webUrlSchema = z.url({ protocol: /^https?$/ }).brand<"WebUrl">();

export type WebUrl = z.infer<typeof webUrlSchema>;
