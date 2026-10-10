import { z } from "@shared/utils/zod";

export interface Reference<T> {
	id: string;
	collection: T;
}

export const referenceSchema = <COLLECTION extends string>(collection: COLLECTION) =>
	z.object({ id: z.string(), collection: z.literal(collection) });
