import { contactRow, databaseDouble, loggerDouble } from "@tests/doubles/contactLayers";
import { failureOf } from "@tests/helpers/exit";
import { Effect, Exit, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseError } from "../errors";
import { checkDuplicateContact, saveContact } from "./persistence";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const FROZEN_NOW = "2026-07-30T09:15:00.000Z";

const ENQUIRY = { name: "Ada", email: "ada@example.com", message: "Hello there" };

const REFUSAL = "I've already received a message from you, and I'll reply as soon as I can.";

const SUBMISSION = { ...ENQUIRY, emailId: "sent-1" };

const log = loggerDouble();

const lookupFailingWith = (message: string) => databaseDouble({ failLookupWith: new DatabaseError({ message }) });

interface CheckParams {
	database: ReturnType<typeof databaseDouble>;
	data?: typeof ENQUIRY;
}

const check = ({ database, data = ENQUIRY }: CheckParams) =>
	Effect.runPromiseExit(checkDuplicateContact(data).pipe(Effect.provide(Layer.merge(database.layer, log.layer))));

beforeEach(() => {
	log.lines.length = 0;
});

afterEach(() => {
	vi.useRealTimers();
});

describe("checkDuplicateContact", () => {
	it("passes silently when the address is outside the cooldown and the message is new", async () => {
		const database = databaseDouble();

		expect(await check({ database })).toStrictEqual(Exit.succeed(undefined));
		expect(log.lines).toEqual([]);
	});

	it("refuses a second submission from an address that wrote inside the cooldown", async () => {
		const database = databaseDouble({ contactWithinCooldown: contactRow({ email: "ada@example.com" }) });

		expect(failureOf(await check({ database }))).toMatchObject({ _tag: "DuplicateContactError", message: REFUSAL });
	});

	it("refuses a message the address has already sent, however long ago, without claiming it arrived recently", async () => {
		const database = databaseDouble({ contactWithSameMessage: contactRow({ email: "ada@example.com" }) });

		expect(failureOf(await check({ database }))).toMatchObject({ _tag: "DuplicateContactError", message: REFUSAL });
	});

	it("answers the two refusals identically, so a caller cannot tell which check fired", async () => {
		const cooldown = databaseDouble({ contactWithinCooldown: contactRow({ email: "ada@example.com" }) });
		const repeat = databaseDouble({ contactWithSameMessage: contactRow({ email: "ada@example.com" }) });
		const both = databaseDouble({
			contactWithinCooldown: contactRow({ email: "ada@example.com" }),
			contactWithSameMessage: contactRow({ email: "ada@example.com" }),
		});

		const answers = [
			failureOf(await check({ database: cooldown })),
			failureOf(await check({ database: repeat })),
			failureOf(await check({ database: both })),
		];

		expect(new Set(answers.map((failure) => failure?.message)).size).toBe(1);
	});

	it("logs which check fired, because the one sentence the caller reads cannot say", async () => {
		await check({ database: databaseDouble({ contactWithinCooldown: contactRow({ email: "ada@example.com" }) }) });
		await check({ database: databaseDouble({ contactWithSameMessage: contactRow({ email: "ada@example.com" }) }) });

		expect(log.lines.map(({ level, context }) => [level, context?.reason])).toStrictEqual([
			["info", "inside the cooldown window"],
			["info", "the same message as a previous submission"],
		]);
	});

	it("asks about the normalised address, so an alias cannot escape either check", async () => {
		const database = databaseDouble();

		await check({ database, data: { ...ENQUIRY, email: "  Ada+news@Example.com " } });

		expect(database.cooldownLookups.map(({ email }) => email)).toStrictEqual(["ada@example.com"]);
		expect(database.messageLookups.map(({ email }) => email)).toStrictEqual(["ada@example.com"]);
	});

	it("asks for submissions no older than the cooldown window", async () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(new Date(FROZEN_NOW));
		const database = databaseDouble();

		await check({ database });

		expect(database.cooldownLookups.at(0)?.since).toBe("2026-07-29T09:15:00.000Z");
	});

	it("asks about the message exactly as it was written, so a different enquiry still gets through", async () => {
		const database = databaseDouble();

		await check({ database });

		expect(database.messageLookups.at(0)?.message).toBe("Hello there");
	});

	it("propagates a lookup that fails instead of reading the missing answer as no duplicate", async () => {
		const database = lookupFailingWith("turso unreachable");

		expect(failureOf(await check({ database }))).toMatchObject({
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
