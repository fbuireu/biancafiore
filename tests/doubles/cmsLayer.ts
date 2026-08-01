import type { CmsClient } from "@infrastructure/cms/client";
import type { CmsError } from "@infrastructure/errors";
import { Effect, Layer } from "effect";

type CmsTag = typeof import("@infrastructure/cms/client").CmsClient;

export interface RecordedQuery {
	content_type?: string;
	order?: string[];
	select?: string[];
	limit?: number;
}

const OVERLAP_DEADLINE = 1000;

export const cmsQueries: RecordedQuery[] = [];

let entriesByType: Record<string, unknown[]> = {};
let failure: CmsError | undefined;
let held = 0;
let overlapped = false;
let opened: Promise<void> = Promise.resolve();
let open: (() => void) | undefined;
let deadline: ReturnType<typeof setTimeout> | undefined;

export function cmsAnswers(entries: Record<string, unknown[]>): void {
	entriesByType = entries;
}

export function cmsFailsWith(error: CmsError): void {
	failure = error;
}

export function cmsHoldsUntilQueries(count: number): void {
	held = count;
	overlapped = false;
	opened = new Promise<void>((resolve) => {
		deadline = setTimeout(() => {
			open = undefined;
			resolve();
		}, OVERLAP_DEADLINE);

		open = () => {
			overlapped = true;
			clearTimeout(deadline);
			resolve();
		};
	});
}

export function cmsQueriesOverlapped(): boolean {
	return overlapped;
}

export function resetCms(): void {
	clearTimeout(deadline);
	cmsQueries.length = 0;
	entriesByType = {};
	failure = undefined;
	held = 0;
	overlapped = false;
	opened = Promise.resolve();
	open = undefined;
}

export function cmsClientLayer(tag: CmsTag): Layer.Layer<CmsClient> {
	return Layer.succeed(tag, {
		getEntries: (query: RecordedQuery) =>
			Effect.suspend(() => {
				cmsQueries.push(query);

				if (held > 0 && cmsQueries.length >= held) open?.();

				const answer = failure
					? Effect.fail(failure)
					: Effect.succeed({ items: entriesByType[query.content_type ?? ""] ?? [] });

				return held > 0 ? Effect.promise(() => opened).pipe(Effect.andThen(answer)) : answer;
			}),
	} as never);
}
