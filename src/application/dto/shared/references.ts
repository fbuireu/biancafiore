import type { CmsReference } from "@infrastructure/cms/entries";

interface PublishedEntriesOfParams<ENTRY extends { id: string }> {
	references: CmsReference[] | undefined;
	published: ReadonlyArray<ENTRY>;
}

export function publishedEntriesOf<ENTRY extends { id: string }>({
	references,
	published,
}: PublishedEntriesOfParams<ENTRY>): ENTRY[] {
	const byId = new Map(published.map((entry) => [entry.id, entry]));

	return (references ?? []).flatMap(({ id }) => byId.get(id) ?? []);
}
