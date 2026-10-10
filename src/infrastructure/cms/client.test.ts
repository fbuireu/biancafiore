import { failureOf } from "@tests/helpers/exit";
import { Effect } from "effect";
import { getEmDashCollection, getEmDashReferences } from "emdash";
import { getDb } from "emdash/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CmsError } from "../errors";
import { CmsClient, CmsClientLive, itemOf, PUBLISHED_STATUS } from "./client";
import { MEDIA_FILE_PATH } from "./media";

const findById = vi.hoisted(() => vi.fn());

vi.mock("emdash", () => ({
	getEmDashCollection: vi.fn(),
	getEmDashReferences: vi.fn(),
	MediaRepository: class {
		findById = findById;
	},
}));
vi.mock("emdash/runtime", () => ({ getDb: vi.fn() }));

const collection = vi.mocked(getEmDashCollection);
const references = vi.mocked(getEmDashReferences);

const UPDATED = new Date("2026-01-02T00:00:00.000Z");

const ENTRY = {
	id: "an-article",
	data: {
		id: "01ARTICLE",
		slug: "an-article",
		status: "published",
		updatedAt: UPDATED,
		publish_date: new Date("2022-04-13T00:00:00.000Z"),
		title: "An article",
		featured_image: { id: "01MEDIA", provider: "local", meta: { storageKey: "01KEY.jpg" } },
		terms: { tag: [{ id: "01TAG", slug: "climate", label: "Climate", name: "tag", children: [] }] },
	},
};

const client = () => Effect.runPromise(CmsClient.pipe(Effect.provide(CmsClientLive)));

const AVATAR = {
	id: "01AVATAR",
	storageKey: "01FACE.jpg",
	alt: "Bianca",
	width: 400,
	height: 400,
	mimeType: "image/jpeg",
	blurhash: "LXCacDM{RjxuOxogkCR.Dkt7t7Rj",
};

const credit = ({ sortOrder, ...byline }: Record<string, unknown>) => ({ sortOrder, byline });

const CREDITED = {
	id: "credited",
	data: {
		id: "01CREDITED",
		bylines: [
			credit({ sortOrder: 1, id: "01GUEST", slug: "guest", displayName: "A Guest", bio: null }),
			credit({
				sortOrder: 0,
				id: "01BIANCA",
				slug: "bianca-fiore",
				displayName: "Bianca Fiore",
				bio: "Writer",
				avatarMediaId: "01AVATAR",
				customFields: { job_title: "Writer" },
			}),
		],
		byline: { id: "01BIANCA" },
	},
};

beforeEach(() => {
	collection.mockReset();
	references.mockReset();
	findById.mockReset();
	vi.mocked(getDb).mockReset();
});

describe("CmsClientLive", () => {
	it("hands out the reads the site performs rather than EmDash's whole query surface", async () => {
		expect(Object.keys(await client()).toSorted()).toStrictEqual([
			"listEntries",
			"listReferences",
			"readMenu",
			"readSiteSettings",
		]);
	});
});

describe("CmsClient.listEntries", () => {
	it("asks EmDash for published entries only, sorted in the database by the field's stored name", async () => {
		collection.mockResolvedValue({ entries: [] } as never);

		await Effect.runPromise(
			(await client()).listEntries({
				collection: "articles",
				limit: 100,
				cursor: "next",
				orderBy: "publish_date",
				order: "desc",
			}),
		);

		expect(collection).toHaveBeenCalledWith("articles", {
			status: PUBLISHED_STATUS,
			limit: 100,
			cursor: "next",
			orderBy: { publish_date: "desc" },
		});
	});

	it("sorts ascending when a field is named without an order, and leaves the order to EmDash when none is", async () => {
		collection.mockResolvedValue({ entries: [] } as never);
		const cms = await client();

		await Effect.runPromise(cms.listEntries({ collection: "cities", limit: 10, orderBy: "start_date" }));
		await Effect.runPromise(cms.listEntries({ collection: "testimonials", limit: 10 }));

		expect(collection.mock.calls.map(([, filter]) => filter)).toStrictEqual([
			{ status: PUBLISHED_STATUS, limit: 10, cursor: undefined, orderBy: { start_date: "asc" } },
			{ status: PUBLISHED_STATUS, limit: 10, cursor: undefined },
		]);
	});

	it("answers each entry by its database id, with its terms lifted and its media resolved", async () => {
		collection.mockResolvedValue({ entries: [ENTRY], nextCursor: "next" } as never);

		const page = await Effect.runPromise((await client()).listEntries({ collection: "articles", limit: 100 }));

		expect(page.nextCursor).toBe("next");
		expect(page.items).toHaveLength(1);
		expect(page.items[0]).toMatchObject({
			id: "01ARTICLE",
			slug: "an-article",
			updatedAt: "2026-01-02T00:00:00.000Z",
			terms: { tag: [{ id: "01TAG", slug: "climate", label: "Climate" }] },
		});
		expect(page.items[0]?.data).toMatchObject({
			publish_date: "2022-04-13T00:00:00.000Z",
			featured_image: { src: `${MEDIA_FILE_PATH}01KEY.jpg` },
		});
		expect(page.items[0]?.data).not.toHaveProperty("terms");
	});

	it("answers each entry's credited bylines in their credit order, with the avatar read once per media id", async () => {
		collection.mockResolvedValue({ entries: [CREDITED, CREDITED] } as never);
		findById.mockResolvedValue(AVATAR);

		const page = await Effect.runPromise((await client()).listEntries({ collection: "articles", limit: 100 }));

		expect(findById).toHaveBeenCalledTimes(1);
		expect(page.items[0]?.bylines).toStrictEqual([
			{
				id: "01BIANCA",
				slug: "bianca-fiore",
				displayName: "Bianca Fiore",
				bio: "Writer",
				avatar: {
					id: "01AVATAR",
					src: `${MEDIA_FILE_PATH}01FACE.jpg`,
					alt: "Bianca",
					width: 400,
					height: 400,
					mimeType: "image/jpeg",
					blurhash: AVATAR.blurhash,
				},
				customFields: { job_title: "Writer" },
			},
			{ id: "01GUEST", slug: "guest", displayName: "A Guest", bio: null, customFields: {} },
		]);
		expect(page.items[0]?.data).not.toHaveProperty("bylines");
		expect(page.items[0]?.data).not.toHaveProperty("byline");
	});

	it("reads no media when no credited byline has an avatar, and leaves a missing avatar out", async () => {
		collection.mockResolvedValue({ entries: [ENTRY] } as never);

		await Effect.runPromise((await client()).listEntries({ collection: "articles", limit: 100 }));

		expect(findById).not.toHaveBeenCalled();
	});

	it("fails typed when an avatar cannot be read, naming what it was reading", async () => {
		collection.mockResolvedValue({ entries: [CREDITED] } as never);
		findById.mockRejectedValue(new Error("D1 is down"));

		const failure = failureOf(
			await Effect.runPromiseExit((await client()).listEntries({ collection: "articles", limit: 100 })),
		);

		expect(failure).toBeInstanceOf(CmsError);
		expect((failure as CmsError).message).toBe("The byline avatars could not be read: D1 is down");
	});

	it("leaves out the cursor when EmDash hands back none, so a caller knows the collection ended", async () => {
		collection.mockResolvedValue({ entries: [ENTRY] } as never);

		const page = await Effect.runPromise((await client()).listEntries({ collection: "articles", limit: 100 }));

		expect(page).not.toHaveProperty("nextCursor");
	});

	it("fails typed when EmDash answers its error as data, naming the collection", async () => {
		collection.mockResolvedValue({ entries: [], error: new Error("D1 is down") } as never);

		const failure = failureOf(
			await Effect.runPromiseExit((await client()).listEntries({ collection: "articles", limit: 100 })),
		);

		expect(failure).toBeInstanceOf(CmsError);
		expect((failure as CmsError).message).toBe("The articles collection could not be read: D1 is down");
	});

	it("fails typed when the query throws instead, so a page renders the error page rather than dying", async () => {
		collection.mockRejectedValue("not an error");

		const failure = failureOf(
			await Effect.runPromiseExit((await client()).listEntries({ collection: "articles", limit: 100 })),
		);

		expect((failure as CmsError).message).toBe("The articles collection could not be read: not an error");
	});
});

describe("CmsClient.listReferences", () => {
	it("asks EmDash's own reference helper, which serves the published selection to an anonymous render", async () => {
		references.mockResolvedValue({ entries: [ENTRY], nextCursor: "next" } as never);

		const page = await Effect.runPromise(
			(await client()).listReferences({
				collection: "authors",
				id: "01AUTHOR",
				field: "articles",
				limit: 100,
				cursor: "c",
			}),
		);

		expect(references).toHaveBeenCalledWith("authors", "01AUTHOR", "articles", { limit: 100, cursor: "c" });
		expect(page).toStrictEqual({ children: [{ id: "01ARTICLE" }], nextCursor: "next" });
	});

	it("drops a referenced entry that carries no database id, rather than answering a hole", async () => {
		references.mockResolvedValue({ entries: [{ id: "orphan", data: { slug: "orphan" } }] } as never);

		const page = await Effect.runPromise(
			(await client()).listReferences({ collection: "authors", id: "01AUTHOR", field: "articles", limit: 100 }),
		);

		expect(page).toStrictEqual({ children: [] });
	});

	it("fails typed when a reference read fails, naming the field and the entry", async () => {
		references.mockResolvedValue({ entries: [], error: new Error("D1 is down") } as never);

		const failure = failureOf(
			await Effect.runPromiseExit(
				(await client()).listReferences({ collection: "authors", id: "01AUTHOR", field: "articles", limit: 100 }),
			),
		);

		expect((failure as CmsError).message).toBe(
			"The articles references of authors 01AUTHOR could not be read: D1 is down",
		);
	});
});

describe("itemOf", () => {
	it("answers nothing for an entry whose data is not a record, or that carries no database id", () => {
		expect(itemOf({ entry: { id: "x", data: "not a record" } })).toBeUndefined();
		expect(itemOf({ entry: { id: "x", data: { slug: "x" } } })).toBeUndefined();
	});

	it("reads a missing slug and a missing update time as absent rather than inventing either", () => {
		expect(itemOf({ entry: { id: "01X", data: { id: "01X" } } })).toStrictEqual({
			id: "01X",
			slug: null,
			data: { id: "01X" },
			terms: {},
			bylines: [],
			updatedAt: "",
		});
	});

	it("keeps only well-formed terms, labelling one that has no label by its slug", () => {
		const item = itemOf({
			entry: {
				id: "01X",
				data: {
					id: "01X",
					terms: {
						tag: [{ id: "01A", slug: "a" }, { id: "01B" }, "not a term", { slug: "no-id" }],
						category: "not a list",
					},
				},
			},
		});

		expect(item?.terms).toStrictEqual({ tag: [{ id: "01A", slug: "a", label: "a" }], category: [] });
	});

	it("answers no terms when EmDash hydrated none", () => {
		expect(itemOf({ entry: { id: "01X", data: { id: "01X", terms: null } } })?.terms).toStrictEqual({});
	});

	it("turns every date EmDash hydrated, however deep, into the ISO string the mappers parse", () => {
		const item = itemOf({
			entry: { id: "01X", data: { id: "01X", rows: [{ at: new Date("2024-01-01T00:00:00.000Z") }] } },
		});

		expect(item?.data.rows).toStrictEqual([{ at: "2024-01-01T00:00:00.000Z" }]);
	});

	it("drops a credit that carries no byline or no byline id, and reads a missing name as empty", () => {
		const item = itemOf({
			entry: {
				id: "01X",
				data: {
					id: "01X",
					bylines: [
						"not a credit",
						{ byline: "not a byline" },
						{ byline: { slug: "no-id" } },
						{ byline: { id: "01B" } },
					],
				},
			},
		});

		expect(item?.bylines).toStrictEqual([{ id: "01B", slug: null, displayName: "", bio: null, customFields: {} }]);
	});
});
