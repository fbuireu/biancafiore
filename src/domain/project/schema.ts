import { z } from "@shared/utils/zod";
import { imageSchema } from "../shared/image";

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	image: imageSchema,
});
