import { createHash } from "node:crypto";
import loadDirective from "astro/runtime/client/load.prebuilt.js";
import islandRuntime from "astro/runtime/server/astro-island.prebuilt.js";
import { consentBootstrapScript, type GoogleTagIds } from "../components/cookieConsent/utils/consentGate";
import { SPECULATION_RULES } from "../components/head/utils/speculation";
import { FEATURED_IMAGE_TRANSITION_SCRIPT } from "../components/head/utils/transition";
import { THEME_BOOTSTRAP_SCRIPT } from "../components/themeToggle/utils/preference";

const digest = (source: string): string => createHash("sha256").update(source, "utf8").digest("base64");

const inlineScripts = (googleTagIds: GoogleTagIds): string[] => [
	THEME_BOOTSTRAP_SCRIPT,
	consentBootstrapScript(googleTagIds),
	islandRuntime,
	loadDirective,
	FEATURED_IMAGE_TRANSITION_SCRIPT,
	SPECULATION_RULES,
];

export const inlineScriptHashes = (googleTagIds: GoogleTagIds): string[] => inlineScripts(googleTagIds).map(digest);
