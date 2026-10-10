import { failureOf } from "@tests/helpers/exit";
import { Effect } from "effect";
import { getEmDashCollection, getEmDashReferences } from "emdash";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CmsError } from "../errors";
import { CmsClient, CmsClientLive, itemOf, PUBLISHED_STATUS } from "./client";
import { MEDIA_FILE_PATH } from "./media";

vi.mock("emdash", () => ({ getEmDashCollection: vi.fn(), getEmDashReferences: vi.fn() }));

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

beforeEach(() => {
	collection.mockReset();
	references.mockReset();
});

describe("CmsClientLive", () => {
	it("hands out the reads the site performs rather than EmDash's whole query surface", async () => {
		expect(Object.keys(await client()).toSorted()).toStrictEqual(["listEntries", "listReferences"]);
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
		await Effect.runPromise(cms.listEntries({ collection: "authors", limit: 10 }));

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
		expect(itemOf({ id: "x", data: "not a record" })).toBeUndefined();
		expect(itemOf({ id: "x", data: { slug: "x" } })).toBeUndefined();
	});

	it("reads a missing slug and a missing update time as absent rather than inventing either", () => {
		expect(itemOf({ id: "01X", data: { id: "01X" } })).toStrictEqual({
			id: "01X",
			slug: null,
			data: { id: "01X" },
			terms: {},
			updatedAt: "",
		});
	});

	it("keeps only well-formed terms, labelling one that has no label by its slug", () => {
		const item = itemOf({
			id: "01X",
			data: {
				id: "01X",
				terms: {
					tag: [{ id: "01A", slug: "a" }, { id: "01B" }, "not a term", { slug: "no-id" }],
					category: "not a list",
				},
			},
		});

		expect(item?.terms).toStrictEqual({ tag: [{ id: "01A", slug: "a", label: "a" }], category: [] });
	});

	it("answers no terms when EmDash hydrated none", () => {
		expect(itemOf({ id: "01X", data: { id: "01X", terms: null } })?.terms).toStrictEqual({});
	});

	it("turns every date EmDash hydrated, however deep, into the ISO string the mappers parse", () => {
		const item = itemOf({ id: "01X", data: { id: "01X", rows: [{ at: new Date("2024-01-01T00:00:00.000Z") }] } });

		expect(item?.data.rows).toStrictEqual([{ at: "2024-01-01T00:00:00.000Z" }]);
	});
});
