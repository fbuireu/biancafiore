import { CONTACT_COOLDOWN_HOURS } from "@domain/contact/rules";
import { DatabaseError } from "@infrastructure/errors";
import { checkDuplicatedEntries, saveContact } from "@infrastructure/utils/persistence";
import { contactRow, databaseDouble } from "@tests/doubles/contactLayers";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FROZEN_NOW = "2026-07-30T09:15:00.000Z";

const ENQUIRY = { name: "Ada", email: "ada@example.com", message: "Hello there" };

const SUBMISSION = { ...ENQUIRY, emailId: "sent-1" };

const failureOf = <E>(exit: Exit.Exit<unknown, E>): E | undefined =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.failureOption(exit.cause)) : undefined;

const lookupFailingWith = (message: string) => databaseDouble({ failLookupWith: new DatabaseError({ message }) });

const check = (database: ReturnType<typeof databaseDouble>, data = ENQUIRY) =>
	Effect.runPromiseExit(checkDuplicatedEntries(data).pipe(Effect.provide(database.layer)));

afterEach(() => {
	vi.useRealTimers();
});

describe("checkDuplicatedEntries", () => {
	it("passes silently when the address is outside the cooldown and the message is new", async () => {
		const database = databaseDouble();

		expect(await check(database)).toStrictEqual(Exit.succeed(undefined));
	});

	it("refuses a second submission from an address that wrote inside the cooldown", async () => {
		const database = databaseDouble({ contactWithinCooldown: contactRow("ada@example.com") });

		expect(failureOf(await check(database))).toMatchObject({
			_tag: "DuplicateContactError",
			message: expect.stringContaining(`${CONTACT_COOLDOWN_HOURS} hours`),
		});
	});

	it("refuses a message the address has already sent, however long ago", async () => {
		const database = databaseDouble({ contactWithSameMessage: contactRow("ada@example.com") });

		expect(failureOf(await check(database))).toMatchObject({
			_tag: "DuplicateContactError",
			message: expect.stringContaining("this exact message"),
		});
	});

	it("names the repeat rather than the cooldown when a submission is both", async () => {
		const database = databaseDouble({
			contactWithinCooldown: contactRow("ada@example.com"),
			contactWithSameMessage: contactRow("ada@example.com"),
		});

		expect(failureOf(await check(database))?.message).toContain("this exact message");
	});

	it("asks about the normalised address, so an alias cannot escape either check", async () => {
		const database = databaseDouble();

		await check(database, { ...ENQUIRY, email: "  Ada+news@Example.com " });

		expect(database.cooldownLookups.map(({ email }) => email)).toStrictEqual(["ada@example.com"]);
		expect(database.messageLookups.map(({ email }) => email)).toStrictEqual(["ada@example.com"]);
	});

	it("asks for submissions no older than the cooldown window", async () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date(FROZEN_NOW));
		const database = databaseDouble();

		await check(database);

		expect(database.cooldownLookups.at(0)?.since).toBe("2026-07-29T09:15:00.000Z");
	});

	it("asks about the message exactly as it was written, so a different enquiry still gets through", async () => {
		const database = databaseDouble();

		await check(database);

		expect(database.messageLookups.at(0)?.message).toBe("Hello there");
	});

	it("propagates a lookup that fails instead of reading the missing answer as no duplicate", async () => {
		const database = lookupFailingWith("turso unreachable");

		expect(failureOf(await check(database))).toMatchObject({
			_tag: "DatabaseError",
			message: "turso unreachable",
		});
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

	it("stores the normalised address, so the cooldown sees one person once", async () => {
		const database = databaseDouble();

		await Effect.runPromiseExit(
			saveContact({ ...SUBMISSION, email: "  Ada+news@Example.com " }).pipe(Effect.provide(database.layer)),
		);

		expect(database.inserted[0]?.email).toBe("ada@example.com");
	});

	it("gives every submission its own id", async () => {
		const database = databaseDouble();

		await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));
		await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(database.inserted[0]?.id).not.toBe(database.inserted[1]?.id);
	});

	it("leaves a failed insert as the DatabaseError it already was, and writes nothing", async () => {
		const database = databaseDouble({ failInsertWith: new DatabaseError({ message: "insert rejected" }) });

		const exit = await Effect.runPromiseExit(saveContact(SUBMISSION).pipe(Effect.provide(database.layer)));

		expect(failureOf(exit)).toMatchObject({ _tag: "DatabaseError", message: "insert rejected" });
		expect(database.inserted).toHaveLength(0);
	});
});
