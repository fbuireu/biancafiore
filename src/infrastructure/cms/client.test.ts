import { CmsClient, CmsClientLive, isContentfulConfigured } from "@infrastructure/cms/client";
import { CmsError } from "@infrastructure/errors";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getEntries = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn(() => ({ getEntries })));

vi.mock("contentful", () => ({ createClient }));

const SPACE_SECRET = "CONTENTFUL_SPACE_ID";
const DELIVERY_SECRET = "CONTENTFUL_DELIVERY_TOKEN";
const PREVIEW_SECRET = "CONTENTFUL_PREVIEW_TOKEN";

const build = () => Effect.runPromiseExit(CmsClient.pipe(Effect.provide(CmsClientLive)));

const defectOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.dieOption(exit.cause)) : undefined;

const MISSING_MESSAGE = "CONTENTFUL_SPACE_ID and a Contentful access token must be defined";

const configure = () => {
	setSecret({ name: SPACE_SECRET, value: "a-space" });
	setSecret({ name: DELIVERY_SECRET, value: "a-delivery-token" });
	setSecret({ name: PREVIEW_SECRET, value: "a-preview-token" });
};

const A_QUERY = { content_type: "article", limit: 10 };

beforeEach(() => {
	getEntries.mockReset();
	createClient.mockClear();
});

afterEach(() => {
	resetSecrets();
});

describe("CmsClientLive", () => {
	it("builds a client when the space and a token are configured", async () => {
		setSecret({ name: SPACE_SECRET, value: "a-space" });
		setSecret({ name: DELIVERY_SECRET, value: "a-delivery-token" });
		setSecret({ name: PREVIEW_SECRET, value: "a-preview-token" });

		expect(Exit.isSuccess(await build())).toBe(true);
	});

	it("hands out the one read the site performs rather than the vendor's client", async () => {
		setSecret({ name: SPACE_SECRET, value: "a-space" });
		setSecret({ name: DELIVERY_SECRET, value: "a-delivery-token" });
		setSecret({ name: PREVIEW_SECRET, value: "a-preview-token" });

		const exit = await build();

		expect(Exit.isSuccess(exit) && Object.keys(exit.value).toSorted()).toStrictEqual(["getEntries"]);
	});

	it.each([
		["the space", DELIVERY_SECRET, PREVIEW_SECRET],
		["a token", SPACE_SECRET, SPACE_SECRET],
	])("dies rather than laundering %s past the type system into createClient", async (_missing, first, second) => {
		setSecret({ name: first, value: "configured" });
		setSecret({ name: second, value: "configured" });

		const exit = await build();

		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(true);
		expect((defectOf(exit) as Error).message).toBe(MISSING_MESSAGE);
	});

	it("dies when nothing is configured at all", async () => {
		const exit = await build();

		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(true);
	});

	it("pairs the preview token with the preview host, never one with the other's", async () => {
		configure();

		await build();

		expect(createClient).toHaveBeenCalledWith({
			space: "a-space",
			accessToken: "a-preview-token",
			host: "preview.contentful.com",
		});
	});
});

const getEntriesOf = async (query: typeof A_QUERY) => {
	configure();

	const exit = await build();

	if (!Exit.isSuccess(exit)) throw new Error("the layer refused to build");

	return Effect.runPromiseExit(exit.value.getEntries(query));
};

describe("CmsClient.getEntries", () => {
	it("hands the query to the vendor untouched and answers what came back", async () => {
		const collection = { items: [], total: 0 };
		getEntries.mockResolvedValue(collection);

		const exit = await getEntriesOf(A_QUERY);

		expect(Exit.isSuccess(exit) && exit.value).toBe(collection);
		expect(getEntries).toHaveBeenCalledWith(A_QUERY);
	});

	it("turns a rejected read into a CmsError carrying the vendor's own message", async () => {
		getEntries.mockRejectedValue(new Error("The access token you sent could not be found"));

		const exit = await getEntriesOf(A_QUERY);

		expect(Exit.isFailure(exit)).toBe(true);

		const failure = Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

		expect(failure).toBeInstanceOf(CmsError);
		expect((failure as CmsError).message).toBe("The access token you sent could not be found");
	});

	it("describes a rejection that is not an Error rather than dropping it", async () => {
		getEntries.mockRejectedValue("gateway timeout");

		const exit = await getEntriesOf(A_QUERY);
		const failure = Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

		expect((failure as CmsError).message).toBe("gateway timeout");
		expect((failure as CmsError).cause).toBe("gateway timeout");
	});

	it("fails rather than dying, so a caller can recover from a lost read", async () => {
		getEntries.mockRejectedValue(new Error("network down"));

		const exit = await getEntriesOf(A_QUERY);

		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(false);
	});
});

describe("isContentfulConfigured", () => {
	const originalSpace = process.env.CONTENTFUL_SPACE_ID;

	afterEach(() => {
		if (originalSpace === undefined) {
			delete process.env.CONTENTFUL_SPACE_ID;
			return;
		}

		process.env.CONTENTFUL_SPACE_ID = originalSpace;
	});

	it("reads process.env rather than a secret, because fetchEntries asks before any layer exists", () => {
		process.env.CONTENTFUL_SPACE_ID = "a-space";

		expect(isContentfulConfigured()).toBe(true);
	});

	it("answers false for an absent space", () => {
		delete process.env.CONTENTFUL_SPACE_ID;

		expect(isContentfulConfigured()).toBe(false);
	});

	it("answers false for an empty space rather than letting a blank string configure a build", () => {
		process.env.CONTENTFUL_SPACE_ID = "";

		expect(isContentfulConfigured()).toBe(false);
	});
});
