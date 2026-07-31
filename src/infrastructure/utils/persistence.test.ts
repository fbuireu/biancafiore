import { DatabaseError } from "@infrastructure/errors";
import { checkDuplicatedEntries, saveContact } from "@infrastructure/utils/persistence";
import { LibsqlError } from "@libsql/client/web";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";
import { databaseDouble } from "../../../tests/doubles/contactLayers";

const DUPLICATE_MESSAGE = "You already contacted. Please be patient, I will get back to you ASAP.";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FROZEN_NOW = "2026-07-30T09:15:00.000Z";

const SUBMISSION = {
	name: "Ada",
	email: "ada@example.com",
	message: "Hello there",
	emailId: "sent-1",
};

const failureOf = <E>(exit: Exit.Exit<unknown, E>): E | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

const insertFailingWith = (cause: unknown) =>
	databaseDouble({ failInsertWith: new DatabaseError({ message: "insert rejected", cause }) });

const insertRejectingWith = (driverError: unknown) => databaseDouble({ rejectInsertWith: driverError });

const selectFailingWith = (message: string) => databaseDouble({ failSelectWith: new DatabaseError({ message }) });

const drizzleWrapped = (cause: Error) => new DrizzleQueryError("insert into contact", [], cause);

afterEach(() => {
	vi.useRealTimers();
});

describe("checkDuplicatedEntries", () => {
	it("passes silently when no row holds the address", async () => {
		const database = databaseDouble();

		const exit = await Effect.runPromiseExit(
			checkDuplicatedEntries({ name: "Ada", email: "ada@example.com", message: "Hello there" }).pipe(
				Effect.provide(database.layer),
			),
		);

		expect(exit).toStrictEqual(Exit.succeed(undefined));
	});

	it("fails with the visitor facing duplicate message as soon as one row comes back", async () => {
		const database = databaseDouble({ duplicates: [{ email: "ada@example.com" }] });

		const exit = await Effect.runPromiseExit(
			checkDuplicatedEntries({ name: "Ada", email: "ada@example.com", message: "Hello there" }).pipe(
				Effect.provide(database.layer),
			),
		);

		expect(failureOf(exit)).toMatchObject({ _tag: "DuplicateContactError", message: DUPLICATE_MESSAGE });
	});

	it("asks the Contact table for the email column matching the address it was given, one row at most", async () => {
		const database = databaseDouble();

		await Effect.runPromiseExit(
			checkDuplicatedEntries({ name: "Ada", email: "ada@example.com", message: "Hello there" }).pipe(
				Effect.provide(database.layer),
			),
		);

		expect(database.selected).toStrictEqual([
			{ table: "Contact", column: "email", value: "ada@example.com", limit: 1 },
		]);
	});

	it("propagates a lookup that fails instead of reading the missing answer as no duplicate", async () => {
		const database = selectFailingWith("turso unreachable");

		const exit = await Effect.runPromiseExit(
			checkDuplicatedEntries({ name: "Ada", email: "ada@example.com", message: "Hello there" }).pipe(
				Effect.provide(database.layer),
			),
		);

		expect(failureOf(exit)).toMatchObject({ _tag: "DatabaseError", message: "turso unreachable" });
	});
});

describe("saveContact", () => {
	it("writes the submission with a generated id and the same instant on both date columns", async () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date(FROZEN_NOW));
		const database = databaseDouble();

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(Exit.isSuccess(exit)).toBe(true);
		expect(database.inserted).toHaveLength(1);
		expect(database.inserted[0]).toMatchObject({
			...SUBMISSION,
			createdDate: FROZEN_NOW,
			modifiedDate: FROZEN_NOW,
		});
		expect(database.inserted[0]?.id).toMatch(UUID_PATTERN);
	});

	it("gives every submission its own id", async () => {
		const database = databaseDouble();

		await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));
		await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(database.inserted[0]?.id).not.toBe(database.inserted[1]?.id);
	});

	it("turns a plain SQLITE_CONSTRAINT violation into a DuplicateContactError", async () => {
		const database = insertFailingWith(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DuplicateContactError", message: DUPLICATE_MESSAGE });
	});

	it("recognises an extended constraint code by its prefix", async () => {
		const database = insertFailingWith(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT_UNIQUE"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DuplicateContactError");
	});

	it("leaves any other libsql failure as a DatabaseError", async () => {
		const database = insertFailingWith(new LibsqlError("database is locked", "SQLITE_BUSY"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DatabaseError", message: "insert rejected" });
	});

	it("does not mistake a non libsql cause that merely mentions a constraint for a duplicate", async () => {
		const database = insertFailingWith(new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DatabaseError");
	});

	it("unwraps the DrizzleQueryError drizzle raises around the driver rejection", async () => {
		const database = insertRejectingWith(
			drizzleWrapped(new LibsqlError("UNIQUE constraint failed: contact.email", "SQLITE_CONSTRAINT_UNIQUE")),
		);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DuplicateContactError", message: DUPLICATE_MESSAGE });
	});

	it("keeps walking the cause chain past more than one wrapper", async () => {
		const database = insertRejectingWith(
			drizzleWrapped(drizzleWrapped(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT_UNIQUE"))),
		);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DuplicateContactError");
	});

	it("leaves a wrapped non constraint libsql failure as a DatabaseError", async () => {
		const database = insertRejectingWith(drizzleWrapped(new LibsqlError("database is locked", "SQLITE_BUSY")));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DatabaseError");
	});

	it("terminates on a cause chain that loops back on itself", async () => {
		const outer = new Error("outer");
		const inner = new Error("inner");
		outer.cause = inner;
		inner.cause = outer;

		const database = insertRejectingWith(outer);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DatabaseError");
	});

	it("leaves a DatabaseError carrying no cause at all as a DatabaseError", async () => {
		const database = insertFailingWith(undefined);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DatabaseError");
		expect(database.inserted).toHaveLength(0);
	});
});
