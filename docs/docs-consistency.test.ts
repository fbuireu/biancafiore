import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const SKIPPED_DIRECTORIES = new Set([
	".astro",
	".git",
	".history",
	".idea",
	".vscode",
	".wrangler",
	"coverage",
	"dist",
	"node_modules",
	"playwright-report",
	"test-results",
]);

const INDEXED_DIRECTORIES = [".github", "docs", "drizzle", "src"];

const DOCUMENTED_PATH_EXTENSIONS = [".ts", ".tsx", ".astro", ".css", ".md", ".json", ".toml"];

const SCRIPTS_INTENTIONALLY_UNDOCUMENTED = new Set([
	"prepare",
	"sync",
	"format",
	"format:changed",
	"lint",
	"lint:changed",
	"lint:all:fix",
	"test:ut:changed",
	"test:e2e:ui",
	"test:e2e:changed",
]);

const CONCEPTS_OUTSIDE_THE_GLOSSARY = new Set(["breadcrumb", "contact", "shared"]);

const DOCUMENTED_PATH_EXAMPLES = new Set(["file.ts:123", "NNNN-kebab-title.md"]);

const ADR_TEMPLATE_SECTIONS = ["Status", "Context", "Decision", "Consequences"];

const ADR_STATUSES = new Set(["Template", "Proposed", "Accepted", "Superseded", "Deprecated"]);

const DOCUMENTED_PACKAGE_VERSIONS: Record<string, string> = {
	Astro: "astro",
	Effect: "effect",
	React: "react",
};

const toPosix = (value: string) => value.split("\\").join("/");
const read = (relativePath: string) => readFileSync(join(ROOT, relativePath), "utf8").split("\r\n").join("\n");
const readJson = (relativePath: string) => JSON.parse(read(relativePath));
const exists = (relativePath: string) => existsSync(join(ROOT, relativePath));

const walk = (relativeDirectory: string): string[] =>
	readdirSync(join(ROOT, relativeDirectory), { withFileTypes: true }).flatMap((entry) => {
		const entryPath = `${relativeDirectory}/${entry.name}`;

		if (!entry.isDirectory()) return [entryPath];

		return SKIPPED_DIRECTORIES.has(entry.name) ? [] : walk(entryPath);
	});

const directoriesIn = (relativeDirectory: string) =>
	readdirSync(join(ROOT, relativeDirectory), { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !SKIPPED_DIRECTORIES.has(entry.name))
		.map((entry) => entry.name)
		.sort();

const populatedDirectoriesIn = (relativeDirectory: string) =>
	directoriesIn(relativeDirectory).filter((name) => walk(`${relativeDirectory}/${name}`).length > 0);

const isTracked = (relativePath: string) =>
	exists(relativePath) && (statSync(join(ROOT, relativePath)).isFile() || walk(relativePath).length > 0);

const PROJECT_FILES = [
	...readdirSync(ROOT, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name),
	...INDEXED_DIRECTORIES.filter(exists).flatMap(walk),
];

const stripFences = (markdown: string) => markdown.replace(/```[\s\S]*?```/g, "");

const inlineCode = (markdown: string) => [...stripFences(markdown).matchAll(/`([^`\n]+)`/g)].map(([, code]) => code);

const fences = (markdown: string) =>
	[...markdown.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map(([, language, body]) => ({ language, body }));

const section = (markdown: string, heading: string) => {
	const lines = markdown.split("\n");
	const start = lines.findIndex((line) => line.startsWith(`## ${heading}`));

	if (start === -1) return "";

	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith("## "));

	return (end === -1 ? rest : rest.slice(0, end)).join("\n");
};

const CLAUDE_MD = read("CLAUDE.md");
const CONTEXT_MD = read("CONTEXT.md");
const PACKAGE_JSON = readJson("package.json");
const TSCONFIG = readJson("tsconfig.json");
const BIOME_JSON = readJson("biome.json");
const ASTRO_CONFIG = read("astro.config.ts");
const WRANGLER_TOML = read("wrangler.toml");

const NESTED_GUIDES = walk("src").filter((file) => file.endsWith("CLAUDE.md"));
const ADR_FILES = walk("docs").filter((file) => file.endsWith(".md") && file.startsWith("docs/adr/"));
const DOCS = ["CLAUDE.md", "CONTEXT.md", ...NESTED_GUIDES, ...ADR_FILES];

const SOURCE_FILES = walk("src").filter((file) => /\.(ts|tsx|astro)$/.test(file));

const namesIn = ({ text, pattern }: { text: string; pattern: RegExp }) =>
	[...(text.match(pattern)?.[1] ?? "").matchAll(/`\.?([\w-]+)`/g)].map(([, name]) => name);

const ALIAS_TARGETS = Object.entries(TSCONFIG.compilerOptions.paths as Record<string, string[]>).map(
	([alias, [target]]) => [alias.replace(/\*$/, ""), target.replace(/^\.\//, "").replace(/\*$/, "")] as const,
);

describe("commands and versions", () => {
	const documentedScripts = fences(section(CLAUDE_MD, "Commands"))
		.flatMap(({ body }) => body.split("\n"))
		.flatMap((line) => line.match(/^pnpm\s+([a-z0-9:._-]+)/)?.[1] ?? []);

	it("documents only scripts that exist in package.json", () => {
		expect(documentedScripts.filter((script) => !(script in PACKAGE_JSON.scripts))).toEqual([]);
	});

	it("documents every package script that is not deliberately left out", () => {
		const undocumented = Object.keys(PACKAGE_JSON.scripts).filter(
			(script) => !documentedScripts.includes(script) && !SCRIPTS_INTENTIONALLY_UNDOCUMENTED.has(script),
		);

		expect(undocumented).toEqual([]);
	});

	it("pins the same Node and pnpm versions the guide claims", () => {
		const versions = section(CLAUDE_MD, "Versions");

		expect(versions.match(/Node \*\*([\d.]+)\*\*/)?.[1]).toBe(PACKAGE_JSON.engines.node);
		expect(`pnpm@${versions.match(/pnpm \*\*([\d.]+)\*\*/)?.[1]}`).toBe(PACKAGE_JSON.packageManager);
		expect(read(".nvmrc").trim()).toBe(PACKAGE_JSON.engines.node);
	});

	it("names stack versions that match the installed dependencies", () => {
		const claimed = [...section(CLAUDE_MD, "Stack").matchAll(/\*\*([A-Z][\w.]*) ([\d][\d.]*)\*\*/g)]
			.filter(([, name]) => name in DOCUMENTED_PACKAGE_VERSIONS)
			.map(([, name, version]) => ({ name, version }));

		expect(claimed.length).toBeGreaterThan(0);

		for (const { name, version } of claimed) {
			const installed = PACKAGE_JSON.dependencies[DOCUMENTED_PACKAGE_VERSIONS[name]];

			expect(`${name} ${installed}`).toBe(`${name} ${installed.startsWith(version) ? installed : version}`);
		}
	});
});

describe("structure and aliases", () => {
	const aliasLine = CLAUDE_MD.split("\n").find((line) => line.startsWith("Path aliases")) ?? "";
	const documentedAliases = [...aliasLine.matchAll(/@([a-z]+)\/\*(?:\s*\(→\s*([^)]+)\))?/g)].map(
		([, name, target]) => ({ alias: `@${name}/`, target: target ?? `src/${name}` }),
	);

	const structureFence = fences(section(CLAUDE_MD, "Structure & aliases"))[0]?.body ?? "";

	const treeEntries = (() => {
		const stack: { indent: number; path: string }[] = [];
		const entries: string[] = [];

		for (const line of structureFence.split("\n")) {
			if (!line.trim()) continue;

			const indent = line.length - line.trimStart().length;
			const names = line.trim().split("#")[0].trim().split(/\s+/);

			while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();

			const parent = stack[stack.length - 1]?.path ?? "";

			for (const name of names) {
				const bare = name.replace(/\/$/, "");
				const path = parent ? `${parent}/${bare}` : bare;

				entries.push(path);

				if (names.length === 1 && name.endsWith("/")) stack.push({ indent, path });
			}
		}

		return entries;
	})();

	it("documents the aliases declared in tsconfig, and nothing else", () => {
		expect(documentedAliases.map(({ alias }) => alias).sort()).toEqual(ALIAS_TARGETS.map(([alias]) => alias).sort());
	});

	it("documents each alias against the folder tsconfig maps it to", () => {
		const targets = new Map(ALIAS_TARGETS);

		for (const { alias, target } of documentedAliases) {
			expect(`${alias} → ${targets.get(alias)?.replace(/\/$/, "")}`).toBe(`${alias} → ${target}`);
		}
	});

	it("describes a folder tree that exists on disk", () => {
		expect(treeEntries.filter((entry) => !isTracked(entry))).toEqual([]);
	});

	it("lists every populated folder under src and src/ui", () => {
		const missing = [
			...populatedDirectoriesIn("src").map((name) => `src/${name}`),
			...populatedDirectoriesIn("src/ui").map((name) => `src/ui/${name}`),
		].filter((directory) => !treeEntries.includes(directory));

		expect(missing).toEqual([]);
	});

	it("lists every route under src/pages", () => {
		const documentedRoutes = (structureFence.match(/pages\/\s*#\s*routes \(([^)]+)\)/)?.[1] ?? "")
			.split(",")
			.map((route) => route.trim())
			.map((route) => `src/pages/${/\.\w+$/.test(route) ? route : `${route}.astro`}`);

		const actualRoutes = walk("src/pages").filter(
			(file) => !file.split("/").pop()?.startsWith("_") && /\.(astro|ts)$/.test(file),
		);

		expect(documentedRoutes.filter((route) => !exists(route))).toEqual([]);
		expect(actualRoutes.filter((route) => !documentedRoutes.includes(route))).toEqual([]);
	});

	it("links a nested guide for every CLAUDE.md under src", () => {
		const linked = [...section(CLAUDE_MD, "Structure & aliases").matchAll(/\]\(\.\/(src\/[\w/-]*CLAUDE\.md)\)/g)].map(
			([, target]) => target,
		);

		expect([...new Set(linked)].sort()).toEqual(NESTED_GUIDES.sort());
	});
});

describe("environment", () => {
	const schemaVariables = [...ASTRO_CONFIG.matchAll(/(\w+): envField\./g)].map(([, name]) => name).sort();
	const exampleVariables = [...read(".env.example").matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(([, name]) => name).sort();

	it("declares the same variables in .env.example and the astro.config env schema", () => {
		expect(exampleVariables).toEqual(schemaVariables);
	});
});

describe("documented paths", () => {
	const documentedPaths = DOCS.flatMap((doc) =>
		inlineCode(read(doc))
			.filter((token) => DOCUMENTED_PATH_EXTENSIONS.some((extension) => token.endsWith(extension)))
			.filter((token) => !/[<>*…(),\s]/.test(token) && !token.startsWith("node:"))
			.filter((token) => !DOCUMENTED_PATH_EXAMPLES.has(token))
			.map((token) => ({ doc, token })),
	);

	const resolves = ({ doc, token }: { doc: string; token: string }) => {
		const aliased = ALIAS_TARGETS.find(([alias]) => token.startsWith(alias));
		const candidate = aliased ? token.replace(aliased[0], aliased[1]) : token.replace(/^\.\//, "").replace(/^\//, "");
		const guideDirectory = toPosix(dirname(doc));

		return (
			exists(candidate) ||
			(guideDirectory !== "." && exists(`${guideDirectory}/${candidate}`)) ||
			PROJECT_FILES.some((file) => file === candidate || file.endsWith(`/${candidate}`))
		);
	};

	it("only cites files that exist", () => {
		expect(documentedPaths.length).toBeGreaterThan(0);
		expect(documentedPaths.filter((entry) => !resolves(entry)).map(({ doc, token }) => `${doc}: ${token}`)).toEqual([]);
	});

	it("never cites a line number, which rots as soon as anything above it moves", () => {
		const citations = DOCS.flatMap((doc) =>
			inlineCode(read(doc))
				.filter((token) => /\.(ts|tsx|astro|css):\d+/.test(token) && !DOCUMENTED_PATH_EXAMPLES.has(token))
				.map((token) => `${doc}: ${token}`),
		);

		expect(citations).toEqual([]);
	});
});

describe("cross-document links", () => {
	it("resolves every relative markdown link", () => {
		const broken = DOCS.flatMap((doc) =>
			[...read(doc).matchAll(/\]\(([^)#][^)]*)\)/g)]
				.map(([, target]) => target.split("#")[0])
				.filter((target) => target.length > 0 && !/^[a-z]+:/.test(target))
				.map((target) => join(dirname(join(ROOT, doc)), target))
				.filter((target) => !existsSync(target))
				.map((target) => `${doc}: ${toPosix(target.replace(ROOT, ""))}`),
		);

		expect(broken).toEqual([]);
	});
});

describe("ADRs", () => {
	const referencesIn = (doc: string) => {
		const body = read(doc);

		return [
			...[...body.matchAll(/ADR ([\d/\s]+)/g)].flatMap(([, numbers]) => numbers.match(/\d{4}/g) ?? []),
			...[...body.matchAll(/docs\/adr\/(\d{4})-/g)].map(([, number]) => number),
		];
	};

	it("numbers files sequentially from the template, with no gaps or duplicates", () => {
		const numbers = ADR_FILES.map((file) => Number(file.split("/").pop()?.slice(0, 4)));

		expect(numbers).toEqual(numbers.map((_, index) => index));
	});

	it("names every file NNNN-kebab-title.md", () => {
		expect(ADR_FILES.filter((file) => !/^docs\/adr\/\d{4}(-[a-z\d]+)+\.md$/.test(file))).toEqual([]);
	});

	it("fills in the template: numbered heading, date, status, context, decision, consequences", () => {
		const malformed = ADR_FILES.flatMap((file) => {
			const body = read(file);
			const number = Number(file.split("/").pop()?.slice(0, 4));
			const missing = ADR_TEMPLATE_SECTIONS.filter((heading) => !body.includes(`\n## ${heading}\n`));
			const status = body.match(/\n## Status\n\n(\w+)/)?.[1] ?? "";

			return [
				...(new RegExp(`^# ${number}\\. \\S`).test(body) ? [] : [`${file}: heading is not "# ${number}. Title"`]),
				...(/\nDate: \d{4}-\d{2}-\d{2}\n/.test(body) ? [] : [`${file}: no "Date: YYYY-MM-DD" line`]),
				...(ADR_STATUSES.has(status) ? [] : [`${file}: status is "${status}"`]),
				...missing.map((heading) => `${file}: no "## ${heading}" section`),
			];
		});

		expect(malformed).toEqual([]);
	});

	it("references only ADRs that exist", () => {
		const referenced = DOCS.flatMap((doc) => referencesIn(doc).map((number) => ({ doc, number })));

		expect(referenced.length).toBeGreaterThan(0);
		expect(
			referenced
				.filter(({ number }) => !ADR_FILES.some((file) => file.startsWith(`docs/adr/${number}-`)))
				.map(({ doc, number }) => `${doc}: ADR ${number}`),
		).toEqual([]);
	});

	it("is reachable: every ADR is linked from a guide, not only from other ADRs", () => {
		const linked = new Set(["CLAUDE.md", "CONTEXT.md", ...NESTED_GUIDES].flatMap(referencesIn));

		expect(ADR_FILES.filter((file) => !linked.has(file.split("/").pop()?.slice(0, 4) ?? ""))).toEqual([]);
	});
});

describe("domain vocabulary", () => {
	const concepts = directoriesIn("src/domain");

	it("gives every domain concept a glossary entry in CONTEXT.md", () => {
		const missing = concepts
			.filter((concept) => !CONCEPTS_OUTSIDE_THE_GLOSSARY.has(concept))
			.filter((concept) => !CONTEXT_MD.includes(`**${concept[0].toUpperCase()}${concept.slice(1)}**`));

		expect(missing).toEqual([]);
	});

	it("names every domain concept in the domain guide", () => {
		const guide = read("src/domain/CLAUDE.md");
		const named = (concept: string) => guide.includes(`\`${concept}\``) || guide.includes(`## ${concept}/`);

		expect(concepts.filter((concept) => !named(concept))).toEqual([]);
	});

	it("maps every application DTO onto a domain concept", () => {
		expect(directoriesIn("src/application/dto").filter((concept) => !concepts.includes(concept))).toEqual([]);
	});

	it("registers every entity loader as a content collection", () => {
		const contentConfig = read("src/content.config.ts");

		expect(directoriesIn("src/application/entities").filter((entity) => !contentConfig.includes(entity))).toEqual([]);
	});
});

describe("infrastructure guide", () => {
	const guide = read("src/infrastructure/CLAUDE.md");

	it("points each client tag at a file that declares it", () => {
		const rows = [...guide.matchAll(/^\| `(\w+)` \| `(\w+)` \| `([\w/.]+)` \|$/gm)].map(([, tag, live, file]) => ({
			tag,
			live,
			file,
		}));

		expect(rows.length).toBeGreaterThan(0);

		for (const { tag, live, file } of rows) {
			const source = read(`src/infrastructure/${file}`);

			expect(`${file}: ${source.includes(`class ${tag} extends Context.Tag`)}`).toBe(`${file}: true`);
			expect(`${file}: ${source.includes(`const ${live} = Layer.effect`)}`).toBe(`${file}: true`);
		}
	});

	it("keeps the two runtimes it describes", () => {
		expect(guide).toContain("ManagedRuntime");
		expect(read("src/infrastructure/runtime.ts")).toContain("ManagedRuntime");
		expect(read("src/infrastructure/layers.ts")).toContain("ContactLayer");
	});

	it("keeps the Workers-safe database imports it promises", () => {
		const schema = read("src/infrastructure/db/schema.ts");
		const client = read("src/infrastructure/db/client.ts");

		expect(`${schema}${client}`).toContain("@libsql/client/web");
		expect(`${schema}${client}`).toContain("drizzle-orm/libsql/web");
	});
});

describe("styles guide", () => {
	const guide = read("src/ui/styles/CLAUDE.md");
	const layerRows = [...guide.matchAll(/^\| ([^|]+) \| `([\w.-]+)`[^|]*\|$/gm)].map(([, files, layer]) => ({
		files: [...files.matchAll(/`([\w/.-]+)`/g)].map(([, file]) => file),
		layer,
	}));

	const stylesheets = walk("src/ui/styles").filter((file) => file.endsWith(".css") && !file.endsWith("/index.css"));

	it("declares the layer order the guide shows", () => {
		const declaration =
			fences(guide)
				.find(({ language }) => language === "css")
				?.body.trim() ?? "";

		expect(declaration).toMatch(/^@layer .+;$/);
		expect(read("src/ui/styles/index.css")).toContain(declaration);
	});

	it("tabulates every stylesheet, in the layer it opens with", () => {
		const tabulated = layerRows.flatMap(({ files, layer }) => files.map((file) => ({ file, layer })));

		expect(tabulated.length).toBeGreaterThan(0);

		for (const { file, layer } of tabulated) {
			const match = stylesheets.filter((stylesheet) => stylesheet.endsWith(`/${file}`));

			const opening = read(match[0]).trimStart().split("\n")[0];

			expect(`${file}: ${match.length}`).toBe(`${file}: 1`);
			expect(`${file}: ${opening.includes(`@layer ${layer}`) || opening.includes(`layer(${layer})`)}`).toBe(
				`${file}: true`,
			);
		}

		const untabulated = stylesheets.filter(
			(stylesheet) => !tabulated.some(({ file }) => stylesheet.endsWith(`/${file}`)),
		);

		expect(untabulated).toEqual([]);
	});
});

describe("modules guide", () => {
	it("names every feature area under src/ui/modules", () => {
		const guide = read("src/ui/modules/CLAUDE.md");
		const features = directoriesIn("src/ui/modules");

		expect(features.filter((feature) => !guide.includes(`\`${feature}\``))).toEqual([]);
	});
});

describe("gotchas", () => {
	it("keeps light-dark() out of the lightningcss downlevelling", () => {
		expect(ASTRO_CONFIG).toContain("exclude: Features.LightDark");
		expect(ASTRO_CONFIG).toContain("errorRecovery: true");
	});

	it("keeps the SSR externals and the server output the guide describes", () => {
		expect(ASTRO_CONFIG).toContain('output: "server"');
		expect(ASTRO_CONFIG).toContain('external: ["node:async_hooks", "contentful"]');
		expect(WRANGLER_TOML).toContain('compatibility_flags = ["nodejs_compat"]');
	});

	it("switches the image service on CLOUDFLARE_ENV", () => {
		expect(ASTRO_CONFIG).toContain('process.env.CLOUDFLARE_ENV === "production"');
		expect(ASTRO_CONFIG).toMatch(/imageService: isProductionBuild \? "cloudflare" : "passthrough"/);
	});

	it("reads HIDE_CHROME everywhere the gotcha says it does", () => {
		const readers = [
			"src/ui/modules/core/components/baseLayout/BaseLayout.astro",
			"src/pages/articles/[...slug].astro",
			"astro.config.ts",
			".github/workflows/_deploy.yml",
		];

		expect(readers.filter((file) => !read(file).includes("HIDE_CHROME"))).toEqual([]);
	});

	it("serves dist as assets from a Workers deploy bound to the documented domain", () => {
		expect(WRANGLER_TOML).toContain('main = "@astrojs/cloudflare/entrypoints/server"');
		expect(WRANGLER_TOML).toContain('directory = "dist"');
		expect(WRANGLER_TOML).toContain('binding = "SESSION"');
		expect(WRANGLER_TOML).toContain('pattern = "biancafiore.me"');
	});
});

describe("infrastructure guide: secrets, errors and clients", () => {
	const guide = read("src/infrastructure/CLAUDE.md");
	const infrastructureFiles = walk("src/infrastructure").filter((file) => /\.(ts|tsx)$/.test(file));

	it("reads astro:env/server lazily, inside the layer, and never as a module import", () => {
		expect(guide).toContain("Never import `astro:env/server` at module top level");

		const readers = SOURCE_FILES.filter((file) => read(file).includes("astro:env/server"));

		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => !read(file).includes('import("astro:env/server")'))).toEqual([]);
		expect(readers.filter((file) => /^\s*import\s[^\n]*"astro:env\/server"/m.test(read(file)))).toEqual([]);
	});

	it("dies on irrecoverable misconfiguration rather than failing typed, in the layer the guide names", () => {
		expect(guide).toContain("`Effect.die` (see `DatabaseLive`)");
		expect(read("src/infrastructure/db/client.ts")).toContain("Effect.die(");
	});

	it("declares every tagged error in errors.ts, never beside a client", () => {
		expect(guide).toContain("don't define errors next to the client");

		const declared = [
			...read("src/infrastructure/errors.ts").matchAll(/export class (\w+) extends Data\.TaggedError/g),
		];

		expect(declared.length).toBeGreaterThan(0);
		expect(
			SOURCE_FILES.filter((file) => file !== "src/infrastructure/errors.ts").filter((file) =>
				read(file).includes("Data.TaggedError"),
			),
		).toEqual([]);
	});

	it("leaves the tag to HTTP mapping to the action, and to toActionError alone", () => {
		expect(guide).toContain("(`toActionError`), never here");
		expect(read("src/actions/index.ts")).toContain("function toActionError(");
		expect(infrastructureFiles.filter((file) => read(file).includes("ActionError"))).toEqual([]);
	});

	it("cites the reCAPTCHA score the guard actually enforces", () => {
		const guards = read("src/infrastructure/utils/guards.ts");
		const score = guards.match(/const RECAPTCHA_MINIMUM_SCORE = ([\d.]+);/)?.[1];

		expect(score).toBeDefined();
		expect(guards).toContain("< RECAPTCHA_MINIMUM_SCORE");
		expect(guide).toContain(`\`RECAPTCHA_MINIMUM_SCORE\` (${score})`);
	});
});

describe("actions guide", () => {
	const guide = read("src/actions/CLAUDE.md");
	const action = read("src/actions/index.ts");

	it("logs a failed saveContact instead of failing the request", () => {
		expect(guide).toContain("A failed `saveContact` is logged, not raised");
		expect(action).toMatch(/saveContact\([^)]*\)\.pipe\(\s*Effect\.catchAll/);
	});

	it("logs through Effect rather than console, here and everywhere in src", () => {
		expect(guide).toContain("Nothing here calls `console`");
		expect(action).toContain("Effect.logError");
		expect(SOURCE_FILES.filter((file) => /\bconsole\.\w+\(/.test(read(file)))).toEqual([]);
	});

	it("maps exactly the tags the guide says it maps", () => {
		const mapped = [...action.matchAll(/case "(\w+)":[\s\S]{0,60}?ActionError\(\{ code: "(\w+)"/g)].map(
			([, tag, code]) => `${tag} → ${code}`,
		);

		expect(mapped.length).toBeGreaterThan(0);
		expect(mapped.filter((pair) => !guide.includes(pair.split(" → ")[0]))).toEqual([]);
		expect(mapped.filter((pair) => !guide.includes(pair.split(" → ")[1]))).toEqual([]);
	});
});

describe("domain guide: purity", () => {
	const guide = read("src/domain/CLAUDE.md");
	const domainFiles = walk("src/domain").filter((file) => file.endsWith(".ts"));

	const externalImports = [
		...new Set(
			domainFiles.flatMap((file) =>
				[...read(file).matchAll(/from "([^"]+)"/g)]
					.map(([, source]) => source)
					.filter((source) => !source.startsWith(".") && !source.startsWith("@domain/")),
			),
		),
	].sort();

	it("imports nothing outward, and the guide names every module it does import", () => {
		expect(externalImports.length).toBeGreaterThan(0);
		expect(externalImports.filter((source) => /^@(application|infrastructure|modules)\//.test(source))).toEqual([]);

		const unnamed = externalImports.filter((source) => {
			const documented = source.startsWith("@shared/") ? "@shared/utils/*" : source;

			return !guide.includes(`\`${documented}\``);
		});

		expect(unnamed).toEqual([]);
	});

	it("names the shared helpers the domain actually reaches for", () => {
		const helpers = [
			...new Set(
				domainFiles.flatMap((file) =>
					[...read(file).matchAll(/import\s*\{([^}]+)\}\s*from\s*"@shared\/utils\/[^"]+"/g)].flatMap(([, names]) =>
						names.split(",").map((name) => name.trim()),
					),
				),
			),
		];

		expect(helpers.length).toBeGreaterThan(0);
		expect(helpers.filter((helper) => !guide.includes(`\`${helper}\``))).toEqual([]);
	});

	it("keeps rules synchronous: no Effect, no fetch, no env access", () => {
		expect(guide).toContain("No Effect, no I/O, no env access");
		expect(domainFiles.filter((file) => /from "effect"|fetch\(|process\.env|astro:env/.test(read(file)))).toEqual([]);
	});

	it("names exactly the concepts that carry a rules.ts", () => {
		const withRules = directoriesIn("src/domain").filter((concept) => exists(`src/domain/${concept}/rules.ts`));
		const claimed = namesIn({ text: guide, pattern: /it exists for ([^;]+) and no one else/ });

		expect(claimed.length).toBeGreaterThan(0);
		expect(claimed.sort()).toEqual(withRules.sort());
	});
});

describe("application guide: the anti-corruption boundary", () => {
	const guide = read("src/application/CLAUDE.md");
	const dtoFiles = walk("src/application/dto").filter((file) => /\.(ts|tsx)$/.test(file));
	const loaders = directoriesIn("src/application/entities").map(
		(entity) => `src/application/entities/${entity}/${entity}.ts`,
	);

	it("keeps DTOs free of I/O, Effect and env access", () => {
		expect(guide).toContain("DTOs are pure on purpose");
		expect(dtoFiles.length).toBeGreaterThan(0);
		expect(
			dtoFiles.filter((file) => /astro:env|from "effect"|getEntries|getImagePlaceholder/.test(read(file))),
		).toEqual([]);
	});

	it("keeps every DTO create synchronous, as the guide states", () => {
		expect(guide).toContain("Every `create` is synchronous");
		expect(dtoFiles.filter((file) => /create:\s*async/.test(read(file)))).toEqual([]);
	});

	it("names the only infrastructure module a DTO is allowed to reach for", () => {
		const reached = [
			...new Set(
				dtoFiles.flatMap((file) =>
					[...read(file).matchAll(/from "(@infrastructure\/[^"]+)"/g)].map(([, source]) => source),
				),
			),
		];

		expect(reached.length).toBeGreaterThan(0);
		expect(reached.filter((source) => !guide.includes(`\`${source}\``))).toEqual([]);
	});

	it("stops Contentful types at this layer: nothing downstream sees them", () => {
		expect(guide).toContain("Contentful types stop here");

		const downstream = [...walk("src/domain"), ...walk("src/ui")]
			.filter((file) => /\.(ts|tsx|astro)$/.test(file))
			.filter((file) => /from "contentful"|@contentful\/|EntryFieldTypes|EntrySkeletonType/.test(read(file)));

		expect(downstream).toEqual([]);
	});

	it("bails without credentials, fetches through runCms, and takes its schema from the domain", () => {
		expect(loaders.length).toBeGreaterThan(0);

		const broken = loaders.filter((file) => {
			const source = read(file);

			return (
				!source.includes("if (!isContentfulConfigured()) return [];") ||
				!source.includes("runCms(") ||
				!/schema:\s*\w+Schema/.test(source) ||
				!/from "@domain\//.test(source)
			);
		});

		expect(broken).toEqual([]);
	});

	it("batches every multi-query loader with unbounded concurrency", () => {
		expect(guide).toContain('Effect.all(..., { concurrency: "unbounded" })');

		const batched = loaders.filter((file) => read(file).includes("Effect.all("));

		expect(batched.length).toBeGreaterThan(0);
		expect(batched.filter((file) => !read(file).includes('{ concurrency: "unbounded" }'))).toEqual([]);
	});

	it("cites the id every loader assigns, and the one that assigns none", () => {
		const step = guide.split("\n").find((line) => line.startsWith("4. ")) ?? "";
		const assigned = [
			...new Set(
				loaders.flatMap((file) => [...read(file).matchAll(/^\t*id:\s*(?:\w+\.)?(\w+),$/gm)].map(([, field]) => field)),
			),
		];

		expect(assigned.length).toBeGreaterThan(0);
		expect(assigned.filter((field) => !step.includes(field))).toEqual([]);

		const withoutId = loaders.filter((file) => !/^\t*id:/m.test(read(file)));

		expect(withoutId).toEqual(["src/application/entities/projects/projects.ts"]);
		expect(step).toContain("`projects`");
	});
});

describe("styles guide: derived constants and source order", () => {
	const guide = read("src/ui/styles/CLAUDE.md");

	it("cites the type-scale ratio the tokens are built from", () => {
		const ratio = read("src/ui/styles/global/variables.css").match(/--ratio:\s*([\d.]+);/)?.[1];

		expect(ratio).toBeDefined();
		expect(guide).toContain(`\`--ratio: ${ratio}\``);
	});

	it("lists every editorial utility global.css declares, and no others", () => {
		const declared = [
			...new Set(
				[...read("src/ui/styles/global/global.css").matchAll(/^\t\.(editorial-[a-z-]+)[^{\n]*\{/gm)].map(
					([, name]) => name,
				),
			),
		].sort();
		const listed = [...new Set([...guide.matchAll(/`\.(editorial-[a-z-]+)`/g)].map(([, name]) => name))].sort();

		expect(declared.length).toBeGreaterThan(0);
		expect(listed).toEqual(declared);
	});

	it("keeps the reveal modifiers after the class they only beat by source order", () => {
		const reveal = read("src/ui/styles/global/reveal.css");
		const base = reveal.indexOf(".reveal {");
		const modifiers = [...reveal.matchAll(/\.reveal--[a-z-]+[^{\n]*\{/g)].map(({ index }) => index);

		expect(guide).toContain("keep them after `.reveal` in the file");
		expect(base).toBeGreaterThan(-1);
		expect(modifiers.length).toBeGreaterThan(0);
		expect(modifiers.filter((at) => at < base)).toEqual([]);
		expect(reveal).toContain("prefers-reduced-motion");
	});

	it("names one container per route, derived from the page modifier", () => {
		const containers = [
			...read("src/ui/styles/base/base.css").matchAll(
				/&\.page--([a-z-]+)\s*\{\s*container:\s*([a-z-]+)\s*\/\s*([^;]+);/g,
			),
		].map(([, route, name, axes]) => ({ route, name, axes: axes.trim() }));

		expect(containers.length).toBeGreaterThan(0);
		expect(guide).toContain("`inline-size scroll-state`");
		expect(containers.filter(({ route, name }) => name !== `${route}-page`)).toEqual([]);
		expect(containers.filter(({ axes }) => axes !== "inline-size scroll-state")).toEqual([]);
	});

	it("has no page--tag, for the reason the guide gives", () => {
		const block = read("src/const/const.ts").match(/PAGES_ROUTES = \{([\s\S]*?)\n\} as const;/)?.[1] ?? "";
		const routes = [...block.matchAll(/^\t"?([\w-]+)"?:/gm)].map(([, key]) => key);

		expect(guide).toContain("There is deliberately no `page--tag`");
		expect(routes).toContain("TAGS");
		expect(routes.indexOf("TAGS")).toBeLessThan(routes.indexOf("TAG"));
		expect(read("src/ui/modules/core/utils/page.ts")).toContain("url.pathname.includes(route)");
		expect(read("src/ui/styles/base/base.css")).not.toContain("page--tag ");
	});

	it("declares the layer order in index.css and nowhere else", () => {
		const declaring = walk("src/ui/styles")
			.filter((file) => file.endsWith(".css"))
			.filter((file) => /^@layer [^;{]+,[^;{]+;/m.test(read(file)));

		expect(guide).toContain("no file re-declares the order");
		expect(declaring).toEqual(["src/ui/styles/index.css"]);
	});
});

describe("modules guide: mixes, islands and data access", () => {
	const guide = read("src/ui/modules/CLAUDE.md");
	const stylesGuide = read("src/ui/styles/CLAUDE.md");

	it("only claims utilities that modifiers.css actually declares as blocks", () => {
		const declared = new Set(
			[...read("src/ui/styles/global/modifiers.css").matchAll(/^\t\.([a-z-]+)[^{\n]*\{/gm)].map(([, name]) => name),
		);
		const claimed = [
			...namesIn({ text: guide, pattern: /Utilities used by unrelated blocks \(([^)]+)\)/ }),
			...namesIn({ text: stylesGuide, pattern: /blocks used as a mix\* — ([^—]+) —/ }),
		];

		expect(claimed.length).toBeGreaterThan(0);
		expect(claimed.filter((name) => !declared.has(name))).toEqual([]);
	});

	it("reads content through astro:content only, never Contentful or infrastructure", () => {
		expect(guide).toContain("never by calling Contentful or `@infrastructure` directly");

		const leaks = walk("src/ui")
			.filter((file) => /\.(ts|tsx|astro)$/.test(file))
			.filter((file) => /@infrastructure\/|from "contentful"/.test(read(file)));

		expect(leaks).toEqual([]);
	});

	it("cites a container query that matches a container base.css declares and a stylesheet uses", () => {
		const cited = guide.match(/@container ([a-z-]+) \(width <= \d+px\)/);

		expect(cited).not.toBeNull();
		expect(read("src/ui/styles/base/base.css")).toContain(`container: ${cited?.[1]} /`);
		expect(
			walk("src/ui/modules").filter((file) => file.endsWith(".css") && read(file).includes(cited?.[0] ?? "")),
		).not.toEqual([]);
	});

	it("names every React island under modules", () => {
		const islands = walk("src/ui/modules").filter((file) => file.endsWith(".tsx"));
		const documented = section(guide, "Islands");

		expect(islands.length).toBeGreaterThan(0);

		const unnamed = islands.filter((file) => {
			const segments = file.replace("src/ui/modules/", "").split("/");
			const folder = segments.at(-2) ?? "";
			const parent = segments.at(-3) ?? "";

			return (
				!documented.includes(`${segments[0]}/${folder}\``) &&
				!documented.includes(`\`${folder}\``) &&
				!documented.includes(`${parent}/*`)
			);
		});

		expect(unnamed).toEqual([]);
	});
});

describe("conventions", () => {
	it("configures Biome the way the conventions claim", () => {
		const conventions = section(CLAUDE_MD, "Conventions");

		expect(BIOME_JSON.formatter.lineWidth).toBe(Number(conventions.match(/Biome: (\d+) line width/)?.[1]));
		expect(BIOME_JSON.linter.rules.suspicious.noConsole).toBe("error");
		expect(BIOME_JSON.assist.actions.source.organizeImports).toBe("on");
		expect(BIOME_JSON.files.includes).toContain("!**/src/data/**/*");
		expect(BIOME_JSON.files.includes).toContain("!**/public/**/*");
	});
});
