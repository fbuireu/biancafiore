import { writeFileSync } from "node:fs";
import type { AstroIntegration } from "astro";

export function generateStaticHeaders(headers: Record<string, string>): AstroIntegration {
	return {
		name: "generate-static-headers",
		hooks: {
			"astro:build:start": () => {
				const rules = Object.entries(headers)
					.map(([header, value]) => `  ${header}: ${value}`)
					.join("\n");

				writeFileSync("./public/_headers", `/*\n${rules}\n`);
			},
		},
	};
}
