import { z } from "@shared/utils/zod";

export const portableTextSchema = z.array(z.looseObject({ _type: z.string(), _key: z.string().optional() }));

export type PortableText = z.infer<typeof portableTextSchema>;
