interface CachePurgeOptions {
	tags: string[];
}

export const purgedTags: string[][] = [];

export const cache = {
	purge: async ({ tags }: CachePurgeOptions): Promise<void> => {
		purgedTags.push(tags);
	},
};
