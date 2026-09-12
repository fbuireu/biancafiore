import { afterEach, describe, expect, it, vi } from "vitest";

interface StubbedScript {
	src?: string;
	async?: boolean;
	crossOrigin?: string;
}

const stubDocument = (): { appendChild: ReturnType<typeof vi.fn>; scripts: StubbedScript[] } => {
	const scripts: StubbedScript[] = [];
	const appendChild = vi.fn();

	vi.stubGlobal("document", {
		createElement: () => {
			const script: StubbedScript = {};

			scripts.push(script);

			return script;
		},
		head: { appendChild },
	});

	return { appendChild, scripts };
};

const withToken = async (token: string) => {
	vi.resetModules();
	vi.doMock("astro:env/client", () => ({ BETTER_STACK_TRACKING_TOKEN: token }));

	return import("@modules/core/utils/telemetry");
};

afterEach(() => {
	vi.unstubAllGlobals();
	vi.doUnmock("astro:env/client");
	vi.resetModules();
});

describe("getTelemetry", () => {
	it("returns the same singleton instance", async () => {
		const { getTelemetry } = await withToken("tok_123");

		expect(getTelemetry()).toBe(getTelemetry());
	});

	it("loads the Better Stack tag from the host its docs name, with the token in the query", async () => {
		const { scripts } = stubDocument();
		vi.stubGlobal("window", { location: { hostname: "biancafiore.me" } });
		const { getTelemetry, BETTER_STACK_TAG_ORIGIN } = await withToken("tok 123");

		getTelemetry().loadBetterStack();

		expect(scripts[0]?.src).toBe(`${BETTER_STACK_TAG_ORIGIN}/b.js?t=tok%20123`);
		expect(scripts[0]?.async).toBe(true);
		expect(scripts[0]?.crossOrigin).toBe("anonymous");
	});

	it("loads it only once, however many times consent is re-applied", async () => {
		const { appendChild } = stubDocument();
		vi.stubGlobal("window", { location: { hostname: "biancafiore.me" } });
		const { getTelemetry } = await withToken("tok_123");

		const telemetry = getTelemetry();
		telemetry.loadBetterStack();
		telemetry.loadBetterStack();

		expect(appendChild).toHaveBeenCalledTimes(1);
	});

	it("loads nothing when no token is configured, which is every local run", async () => {
		const { appendChild } = stubDocument();
		vi.stubGlobal("window", { location: { hostname: "localhost" } });
		const { getTelemetry } = await withToken("");

		getTelemetry().loadBetterStack();

		expect(appendChild).not.toHaveBeenCalled();
	});

	it("queues the environment before the tag has loaded, so the call is not lost", async () => {
		stubDocument();
		const window: { location: { hostname: string }; betterstack?: (...args: unknown[]) => void } = {
			location: { hostname: "biancafiore.me" },
		};
		vi.stubGlobal("window", window);
		const { getTelemetry } = await withToken("tok_123");

		getTelemetry().loadBetterStack();

		expect((window.betterstack as unknown as { q: unknown[][] }).q).toEqual([["init", { environment: "production" }]]);
	});

	it("does not replace a tag that has already installed itself", async () => {
		stubDocument();
		const betterstack = vi.fn();
		vi.stubGlobal("window", { location: { hostname: "biancafiore.me" }, betterstack });
		const { getTelemetry } = await withToken("tok_123");

		getTelemetry().loadBetterStack();

		expect(betterstack).toHaveBeenCalledWith("init", { environment: "production" });
	});
});

describe("trackingEnvironmentFor", () => {
	it("calls localhost and the preview Workers development", async () => {
		const { trackingEnvironmentFor } = await withToken("tok_123");

		expect(trackingEnvironmentFor("localhost")).toBe("development");
		expect(trackingEnvironmentFor("127.0.0.1")).toBe("development");
		expect(trackingEnvironmentFor("pr-12-biancafiore-development.fbuireu.workers.dev")).toBe("development");
	});

	it("calls the real domain production", async () => {
		const { trackingEnvironmentFor } = await withToken("tok_123");

		expect(trackingEnvironmentFor("biancafiore.me")).toBe("production");
		expect(trackingEnvironmentFor("www.biancafiore.me")).toBe("production");
	});
});
