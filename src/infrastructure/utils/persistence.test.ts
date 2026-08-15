import { DatabaseError } from "@infrastructure/errors";
import { checkDuplicatedEntries, saveContact } from "@infrastructure/utils/persistence";
import { LibsqlError } from "@libsql/client/web";
import { contactRow, databaseDouble } from "@tests/doubles/contactLayers";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";

const DUPLICATE_MESSAGE = "You already contacted. Please be patient, I will get back to you ASAP.";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FROZEN_NOW = "2026-07-30T09:15:00.000Z";

const ENQUIRY = { name: "Ada", email: "ada@example.com", message: "Hello there" };

const SUBMISSION = { ...ENQUIRY, emailId: "sent-1" };

const failureOf = <E>(exit: Exit.Exit<unknown, E>): E | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

const insertFailingWith = (cause: unknown) =>
	databaseDouble({ failInsertWith: new DatabaseError({ message: "insert rejected", cause }) });

const lookupFailingWith = (message: string) => databaseDouble({ failLookupWith: new DatabaseError({ message }) });

const drizzleWrapped = (cause: Error) => new DrizzleQueryError("insert into contact", [], cause);

afterEach(() => {
	vi.useRealTimers();
});

describe("checkDuplicatedEntries", () => {
	it("passes silently when no row holds the address", async () => {
		const database = databaseDouble();

		const exit = await Effect.runPromiseExit(checkDuplicatedEntries(ENQUIRY).pipe(Effect.provide(database.layer)));

		expect(exit).toStrictEqual(Exit.succeed(undefined));
	});

	it("fails with the visitor facing duplicate message as soon as a row comes back", async () => {
		const database = databaseDouble({ existingContact: contactRow("ada@example.com") });

		const exit = await Effect.runPromiseExit(checkDuplicatedEntries(ENQUIRY).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DuplicateContactError", message: DUPLICATE_MESSAGE });
	});

	it("looks the address up once, exactly as it was given", async () => {
		const database = databaseDouble();

		await Effect.runPromiseExit(checkDuplicatedEntries(ENQUIRY).pipe(Effect.provide(database.layer)));

		expect(database.lookedUp).toStrictEqual(["ada@example.com"]);
	});

	it("propagates a lookup that fails instead of reading the missing answer as no duplicate", async () => {
		const database = lookupFailingWith("turso unreachable");

		const exit = await Effect.runPromiseExit(checkDuplicatedEntries(ENQUIRY).pipe(Effect.provide(database.layer)));

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

	it("turns a constraint violation the insert failed with into a DuplicateContactError", async () => {
		const database = insertFailingWith(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DuplicateContactError", message: DUPLICATE_MESSAGE });
	});

	it("reads through the DrizzleQueryError wrapper the driver rejection arrives in", async () => {
		const database = insertFailingWith(
			drizzleWrapped(new LibsqlError("UNIQUE constraint failed: contact.email", "SQLITE_CONSTRAINT_UNIQUE")),
		);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DuplicateContactError");
	});

	it("leaves any other insert failure as the DatabaseError it already was", async () => {
		const database = insertFailingWith(new LibsqlError("database is locked", "SQLITE_BUSY"));

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DatabaseError", message: "insert rejected" });
	});

	it("leaves a DatabaseError carrying no cause at all as a DatabaseError, and writes nothing", async () => {
		const database = insertFailingWith(undefined);

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)?._tag).toBe("DatabaseError");
		expect(database.inserted).toHaveLength(0);
	});
});
