import { isAbsolute } from "node:path";
import { CONTACT_DETAILS } from "@const/const";
import { resetSecrets, setSecret } from "@tests/doubles/astroEnvServer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMAIL_DELIVERY } from "./const";
import { emailDelivery } from "./descriptor";
import { createPlugin, deliver } from "./plugin";

const send = vi.hoisted(() => vi.fn());

vi.mock("emdash", () => ({ definePlugin: (definition: unknown) => definition }));
vi.mock("resend", () => ({
	Resend: class {
		emails = { send };
	},
}));

const INVITE = {
	to: "bianca@example.com",
	subject: "You've been invited",
	text: "Open the link",
	html: "<p>Open the link</p>",
};

beforeEach(() => {
	send.mockReset();
	setSecret({ name: "RESEND_API_KEY", value: "re_test_key" });
});

afterEach(() => {
	resetSecrets();
});

describe("the email delivery plugin", () => {
	it("is the one exclusive email:deliver provider, so EmDash can send invitations and magic links", () => {
		const plugin = createPlugin() as unknown as {
			capabilities: string[];
			hooks: Record<string, { exclusive: boolean }>;
		};

		expect(plugin.capabilities).toStrictEqual(["email:provide"]);
		expect(plugin.hooks["email:deliver"]?.exclusive).toBe(true);
	});

	it("names its entrypoint by an absolute path with forward slashes", () => {
		const { entrypoint, id } = emailDelivery();

		expect(id).toBe(EMAIL_DELIVERY.ID);
		expect(isAbsolute(entrypoint)).toBe(true);
		expect(entrypoint).not.toContain("\\");
	});

	it("sends EmDash's message through Resend, from the site's sender and tagged as the CMS's", async () => {
		send.mockResolvedValue({ data: { id: "email-1" }, error: null });

		await deliver({ message: INVITE, source: "emdash" });

		const [payload] = send.mock.calls[0] as [Record<string, unknown>];

		expect(payload).toMatchObject(INVITE);
		expect(payload.from).toContain(atob(CONTACT_DETAILS.ENCODED_EMAIL_FROM));
		expect(payload.tags).toStrictEqual([{ name: "category", value: "cms" }]);
		expect(payload).not.toHaveProperty("cc");
		expect(payload).not.toHaveProperty("replyTo");
	});

	it("rejects when Resend refuses, so EmDash reports the invitation as not sent", async () => {
		send.mockResolvedValue({ data: null, error: { message: "domain not verified" } });

		await expect(deliver({ message: INVITE, source: "emdash" })).rejects.toThrow("domain not verified");
	});
});
