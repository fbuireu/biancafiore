import { isUniqueConstraintViolation } from "@infrastructure/db/constraints";
import { LibsqlError } from "@libsql/client/web";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { describe, expect, it } from "vitest";

const drizzleWrapped = (cause: Error) => new DrizzleQueryError("insert into contact", [], cause);

describe("isUniqueConstraintViolation", () => {
	it("recognises a plain SQLITE_CONSTRAINT rejection", () => {
		expect(isUniqueConstraintViolation(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT"))).toBe(true);
	});

	it("recognises an extended constraint code by its prefix", () => {
		expect(isUniqueConstraintViolation(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT_UNIQUE"))).toBe(
			true,
		);
	});

	it("unwraps the DrizzleQueryError drizzle raises around the driver rejection", () => {
		const cause = drizzleWrapped(
			new LibsqlError("UNIQUE constraint failed: contact.email", "SQLITE_CONSTRAINT_UNIQUE"),
		);

		expect(isUniqueConstraintViolation(cause)).toBe(true);
	});

	it("keeps walking the cause chain past more than one wrapper", () => {
		const cause = drizzleWrapped(
			drizzleWrapped(new LibsqlError("UNIQUE constraint failed", "SQLITE_CONSTRAINT_UNIQUE")),
		);

		expect(isUniqueConstraintViolation(cause)).toBe(true);
	});

	it("leaves any other libsql failure alone", () => {
		expect(isUniqueConstraintViolation(new LibsqlError("database is locked", "SQLITE_BUSY"))).toBe(false);
	});

	it("leaves a wrapped non constraint libsql failure alone", () => {
		expect(isUniqueConstraintViolation(drizzleWrapped(new LibsqlError("database is locked", "SQLITE_BUSY")))).toBe(
			false,
		);
	});

	it("does not mistake a non libsql error that merely mentions a constraint for a violation", () => {
		expect(isUniqueConstraintViolation(new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed"))).toBe(false);
	});

	it("terminates on a cause chain that loops back on itself", () => {
		const outer = new Error("outer");
		const inner = new Error("inner");
		outer.cause = inner;
		inner.cause = outer;

		expect(isUniqueConstraintViolation(outer)).toBe(false);
	});

	it("reads a missing cause as no violation", () => {
		expect(isUniqueConstraintViolation(undefined)).toBe(false);
	});
});
