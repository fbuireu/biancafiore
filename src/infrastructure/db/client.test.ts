import { Database, DatabaseLive } from "@infrastructure/db/client";
import { DatabaseError } from "@infrastructure/errors";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DatabaseService = Effect.Effect.Success<typeof Database>;

interface RecordedCall {
	method: string;
	args: unknown[];
}

const calls = vi.hoisted(() => [] as RecordedCall[]);
const answer = vi.hoisted(() => ({ rows: [] as unknown[], rejection: undefined as unknown }));
const createClient = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("@libsql/client/web", () => ({ createClient }));

vi.mock("drizzle-orm/libsql/web", () => {
	const record = (method: string, args: unknown[]) => {
		calls.push({ method, args });
	};

	const settle = () =>
		answer.rejection === undefined ? Promise.resolve(answer.rows) : Promise.reject(answer.rejection);

	const chain = () => {
		const link: Record<string, unknown> = {};

		for (const method of ["from", "where", "orderBy"]) {
			link[method] = (...args: unknown[]) => {
				record(method, args);
				return link;
			};
		}

		for (const method of ["limit", "values"]) {
			link[method] = (...args: unknown[]) => {
				record(method, args);
				return settle();
			};
		}

		return link;
	};

	return { drizzle: () => ({ select: chain, insert: chain }) };
});

const URL_SECRET = "ASTRO_DB_REMOTE_URL";
const TOKEN_SECRET = "ASTRO_DB_APP_TOKEN";

const build = () => Effect.runPromiseExit(Database.pipe(Effect.provide(DatabaseLive)));

const defectOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.dieOption(exit.cause)) : undefined;

const failureOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

afterEach(() => {
	resetSecrets();
});

describe("DatabaseLive", () => {
	it("builds a client when both secrets are configured", async () => {
		setSecret({ name: URL_SECRET, value: "libsql://example.turso.io" });
		setSecret({ name: TOKEN_SECRET, value: "a-token" });

		const exit = await build();

		expect(Exit.isSuccess(exit)).toBe(true);
	});

	it.each([
		["url", TOKEN_SECRET, "a-token"],
		["auth token", URL_SECRET, "libsql://example.turso.io"],
	])("dies rather than failing typed when the %s is missing", async (_missing, present, value) => {
		setSecret({ name: present, value: value });

		const exit = await build();

		expect(failureOf(exit)).toBeUndefined();
		expect(defectOf(exit)).toBeInstanceOf(Error);
		expect((defectOf(exit) as Error).message).toBe(`${URL_SECRET} and ${TOKEN_SECRET} must be defined`);
	});

	it("dies when neither secret is configured", async () => {
		const exit = await build();

		expect(failureOf(exit)).toBeUndefined();
		expect(Exit.isFailure(exit) && Cause.isDie(exit.cause)).toBe(true);
	});

	it("hands out the contact operations rather than the query builder", async () => {
		setSecret({ name: URL_SECRET, value: "libsql://example.turso.io" });
		setSecret({ name: TOKEN_SECRET, value: "a-token" });

		const exit = await build();

		expect(Exit.isSuccess(exit) && Object.keys(exit.value).toSorted()).toStrictEqual([
			"findContactWithMessage",
			"findLatestContactSince",
			"insertContact",
		]);
	});
});

const buildDatabase = async () => {
	setSecret({ name: URL_SECRET, value: "libsql://example.turso.io" });
	setSecret({ name: TOKEN_SECRET, value: "a-token" });

	const exit = await build();
	if (!Exit.isSuccess(exit)) throw new Error("the layer refused to build");

	return exit.value;
};

const A_CONTACT = {
	id: "contact-1",
	name: "A Reader",
	email: "reader@example.com",
	message: "Hello",
	emailId: "email-1",
	createdDate: "2026-08-30T00:00:00.000Z",
	modifiedDate: "2026-08-30T00:00:00.000Z",
};

describe("Database", () => {
	beforeEach(() => {
		answer.rows = [];
		answer.rejection = undefined;
		calls.length = 0;
		createClient.mockClear();
	});

	it("hands the vendor the url and the token it was configured with", async () => {
		await buildDatabase();

		expect(createClient).toHaveBeenCalledWith({ url: "libsql://example.turso.io", authToken: "a-token" });
	});

	it("answers the newest contact in the window rather than the whole list", async () => {
		answer.rows = [A_CONTACT, { ...A_CONTACT, id: "contact-2" }];
		const database = await buildDatabase();

		const found = await Effect.runPromise(
			database.findLatestContactSince({ email: "reader@example.com", since: "2026-08-29T00:00:00.000Z" }),
		);

		expect(found).toStrictEqual(A_CONTACT);
		expect(calls.map(({ method }) => method)).toStrictEqual(["from", "where", "orderBy", "limit"]);
		expect(calls.at(-1)?.args).toStrictEqual([1]);
	});

	it("answers undefined rather than throwing when nothing was sent in the window", async () => {
		const database = await buildDatabase();

		await expect(
			Effect.runPromise(
				database.findLatestContactSince({ email: "reader@example.com", since: "2026-08-29T00:00:00.000Z" }),
			),
		).resolves.toBeUndefined();
	});

	it("answers the one contact carrying the same message", async () => {
		answer.rows = [A_CONTACT];
		const database = await buildDatabase();

		const found = await Effect.runPromise(
			database.findContactWithMessage({ email: "reader@example.com", message: "Hello" }),
		);

		expect(found).toStrictEqual(A_CONTACT);
		expect(calls.map(({ method }) => method)).toStrictEqual(["from", "where", "limit"]);
	});

	it("answers undefined for a message nobody has sent", async () => {
		const database = await buildDatabase();

		await expect(
			Effect.runPromise(database.findContactWithMessage({ email: "reader@example.com", message: "Hello" })),
		).resolves.toBeUndefined();
	});

	it("hands the insert the contact it was given and answers nothing at all", async () => {
		const database = await buildDatabase();

		await expect(Effect.runPromise(database.insertContact(A_CONTACT))).resolves.toBeUndefined();
		expect(calls).toStrictEqual([{ method: "values", args: [A_CONTACT] }]);
	});

	it.each([
		[
			"findLatestContactSince",
			(database: DatabaseService) => database.findLatestContactSince({ email: "a@b.c", since: "x" }),
		],
		[
			"findContactWithMessage",
			(database: DatabaseService) => database.findContactWithMessage({ email: "a@b.c", message: "x" }),
		],
		["insertContact", (database: DatabaseService) => database.insertContact(A_CONTACT)],
	])("turns a rejected %s into a DatabaseError rather than a defect", async (_name, run) => {
		answer.rejection = new Error("connection refused");
		const database = await buildDatabase();

		const exit = await Effect.runPromiseExit(run(database));

		expect(Cause.isDie((exit as Exit.Failure<never, unknown>).cause)).toBe(false);
		expect(failureOf(exit)).toBeInstanceOf(DatabaseError);
		expect((failureOf(exit) as DatabaseError).message).toBe("connection refused");
	});

	it("describes a rejection that is not an Error rather than dropping it", async () => {
		answer.rejection = "gateway timeout";
		const database = await buildDatabase();

		const exit = await Effect.runPromiseExit(
			database.findContactWithMessage({ email: "reader@example.com", message: "Hello" }),
		);

		expect((failureOf(exit) as DatabaseError).message).toBe("gateway timeout");
	});
});
