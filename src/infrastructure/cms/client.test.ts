import { CmsClient, CmsClientLive } from "@infrastructure/cms/client";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { Cause, Effect, Exit, Option } from "effect";
import { afterEach, describe, expect, it } from "vitest";

const SPACE_SECRET = "CONTENTFUL_SPACE_ID";
const DELIVERY_SECRET = "CONTENTFUL_DELIVERY_TOKEN";
const PREVIEW_SECRET = "CONTENTFUL_PREVIEW_TOKEN";

const build = () => Effect.runPromiseExit(CmsClient.pipe(Effect.provide(CmsClientLive)));

const defectOf = (exit: Exit.Exit<unknown, unknown>): unknown =>
	Exit.isFailure(exit) ? Option.getOrUndefined(Cause.dieOption(exit.cause)) : undefined;

const MISSING_MESSAGE = "CONTENTFUL_SPACE_ID and a Contentful access token must be defined";

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
});
