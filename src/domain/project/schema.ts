import { z } from "@shared/utils/zod";
import { imageSchema } from "../shared/image";
import { portableTextSchema } from "../shared/portableText";

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: portableTextSchema,
	image: imageSchema,
});
