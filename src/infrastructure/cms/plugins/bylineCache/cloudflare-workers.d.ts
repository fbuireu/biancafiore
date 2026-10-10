declare module "cloudflare:workers" {
	interface CachePurgeOptions {
		tags: string[];
	}

	export const cache: {
		purge(options: CachePurgeOptions): Promise<void>;
	};
}
