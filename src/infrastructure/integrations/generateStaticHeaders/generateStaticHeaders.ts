import { writeFileSync } from "node:fs";
import type { AstroIntegration } from "astro";
import { SECURITY_HEADERS } from "../../../const/securityHeaders";

export function generateStaticHeaders(): AstroIntegration {
	return {
		name: "generate-static-headers",
		hooks: {
			"astro:build:start": () => {
				const rules = Object.entries(SECURITY_HEADERS)
					.map(([header, value]) => `  ${header}: ${value}`)
					.join("\n");

				writeFileSync("./public/_headers", `/*\n${rules}\n`);
			},
		},
	};
}
