import type { LiveLoader } from "astro/loaders";

interface ContentLoaderParams<DATA extends Record<string, unknown>> {
	name: string;
	load: () => Promise<DATA[]>;
	identify: (data: DATA) => string;
	loadOne?: (id: string) => Promise<DATA | undefined>;
	loadPrerendered?: (id: string) => DATA | undefined;
}

interface EntryFilter {
	id: string;
	prerendered?: boolean;
}

const asError = (cause: unknown): Error => (cause instanceof Error ? cause : new Error(String(cause)));

export function contentLoader<DATA extends Record<string, unknown>>({
	name,
	load,
	identify,
	loadOne,
	loadPrerendered,
}: ContentLoaderParams<DATA>): LiveLoader<DATA, EntryFilter> {
	const findOne = async (id: string): Promise<DATA | undefined> =>
		loadOne ? loadOne(id) : (await load()).find((data) => identify(data) === id);

	return {
		name,
		loadCollection: async () => {
			try {
				return { entries: (await load()).map((data) => ({ id: identify(data), data })) };
			} catch (cause) {
				return { error: asError(cause) };
			}
		},
		loadEntry: async ({ filter }) => {
			try {
				const data = filter.prerendered && loadPrerendered ? loadPrerendered(filter.id) : await findOne(filter.id);

				return data ? { id: identify(data), data } : undefined;
			} catch (cause) {
				return { error: asError(cause) };
			}
		},
	};
}
