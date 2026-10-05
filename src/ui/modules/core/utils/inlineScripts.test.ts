import { createHash } from "node:crypto";
import loadDirective from "astro/runtime/client/load.prebuilt.js";
import islandRuntime from "astro/runtime/server/astro-island.prebuilt.js";
import { describe, expect, it } from "vitest";
import { consentBootstrapScript } from "../components/cookieConsent/utils/consentGate";
import { THEME_BOOTSTRAP_SCRIPT } from "../components/themeToggle/utils/preference";
import { inlineScriptHashes } from "./inlineScripts";

const SHA256_BASE64 = /^[A-Za-z0-9+/]{43}=$/;

const sha256 = (source: string) => createHash("sha256").update(source).digest("base64");

describe("inlineScriptHashes", () => {
	it("hashes every inline script the pages carry: both bootstraps, Astro's island runtime and the load directive", () => {
		expect(inlineScriptHashes("G-TEST")).toStrictEqual(
			[THEME_BOOTSTRAP_SCRIPT, consentBootstrapScript("G-TEST"), islandRuntime, loadDirective].map(sha256),
		);
	});

	it("names each script by the base64 sha256 digest a policy source expects", () => {
		const hashes = inlineScriptHashes("G-TEST");

		expect(hashes.length).toBeGreaterThan(0);
		expect(hashes.filter((hash) => !SHA256_BASE64.test(hash))).toEqual([]);
	});

	it("hashes the consent default that the page renders for the analytics id it is given", () => {
		const [, consent] = inlineScriptHashes("G-ONE");
		const [, other] = inlineScriptHashes("G-TWO");

		expect(consent).toBe(sha256(consentBootstrapScript("G-ONE")));
		expect(other).not.toBe(consent);
	});

	it("hashes the scripts that no analytics id touches the same whichever id it is given", () => {
		const withoutTheConsentDefault = (hashes: string[]) => hashes.filter((_, index) => index !== 1);

		expect(withoutTheConsentDefault(inlineScriptHashes("G-ONE"))).toStrictEqual(
			withoutTheConsentDefault(inlineScriptHashes("G-TWO")),
		);
	});
});
