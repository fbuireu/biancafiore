import { Database, DatabaseLive } from "@infrastructure/db/client";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it } from "vitest";

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
