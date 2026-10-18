import { PAGES_ROUTES } from "@const/index";
import { z } from "@shared/utils/zod";

const WARM_STATE_KEY = "cache-warm";
const WARM_PROBE = "/sitemap.xml?warm";
const CACHE_STATUS_HEADER = "cf-cache-status";
const CACHE_HIT = "HIT";
const SITEMAP_LOCATION = /<loc>([^<]+)<\/loc>/g;
const SKIPPED_PATHS = new Set<string>([PAGES_ROUTES.CONTACT]);

export const WARM_BATCH = 40;
export const WARM_CONCURRENCY = 4;
export const WARM_FALLBACK_INTERVAL = 15 * 60 * 1_000;

const warmState = z.object({
	paths: z.array(z.string()),
	next: z.number().int().nonnegative(),
	startedAt: z.number(),
});

type WarmState = z.infer<typeof warmState>;

export interface WarmStore {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
}

type WarmFetch = (request: Request) => Promise<Response>;

interface WarmCacheParams {
	fetch: WarmFetch;
	store: WarmStore;
	origin: string;
	now: number;
}

interface WarmPathsParams {
	fetch: WarmFetch;
	origin: string;
	paths: string[];
}

interface HasRestartedParams {
	status: string | null;
	state: WarmState | undefined;
	now: number;
}

interface RequestForParams {
	path: string;
	origin: string;
}

const requestFor = ({ path, origin }: RequestForParams): Request =>
	new Request(new URL(path, origin), { headers: { accept: "text/html" } });

const isDone = (state: WarmState): boolean => state.next >= state.paths.length;

export const sitemapPaths = (sitemap: string): string[] => [
	...new Set(
		[...sitemap.matchAll(SITEMAP_LOCATION)]
			.map(([, location]) => new URL(location).pathname)
			.filter((path) => !SKIPPED_PATHS.has(path)),
	),
];

const readState = async (store: WarmStore): Promise<WarmState | undefined> => {
	const saved = await store.get(WARM_STATE_KEY);

	if (!saved) return undefined;

	try {
		const { success, data } = warmState.safeParse(JSON.parse(saved));

		return success ? data : undefined;
	} catch {
		return undefined;
	}
};

const hasRestarted = ({ status, state, now }: HasRestartedParams): boolean => {
	if (status) return status !== CACHE_HIT;

	return !state || (isDone(state) && now - state.startedAt >= WARM_FALLBACK_INTERVAL);
};

const warmPaths = async ({ fetch, origin, paths }: WarmPathsParams): Promise<void> => {
	for (let start = 0; start < paths.length; start += WARM_CONCURRENCY) {
		await Promise.allSettled(
			paths.slice(start, start + WARM_CONCURRENCY).map(async (path) => {
				const response = await fetch(requestFor({ path, origin }));

				await response.body?.cancel();
			}),
		);
	}
};

export async function warmCache({ fetch, store, origin, now }: WarmCacheParams): Promise<void> {
	const probe = await fetch(requestFor({ path: WARM_PROBE, origin }));
	const saved = await readState(store);
	const restarted = hasRestarted({ status: probe.headers.get(CACHE_STATUS_HEADER), state: saved, now });
	const state = restarted ? { paths: sitemapPaths(await probe.text()), next: 0, startedAt: now } : saved;

	if (!restarted) await probe.body?.cancel();
	if (!state || isDone(state)) return;

	const batch = state.paths.slice(state.next, state.next + WARM_BATCH);

	await warmPaths({ fetch, origin, paths: batch });
	await store.put(WARM_STATE_KEY, JSON.stringify({ ...state, next: state.next + batch.length }));
}
