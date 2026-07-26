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

const INDEXED_DIRECTORIES = [".github", "docs", "drizzle", "src", "tests"];

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

describe("conventions", () => {
	it("configures Biome the way the conventions claim", () => {
		const conventions = section(CLAUDE_MD, "Conventions");

		expect(BIOME_JSON.formatter.lineWidth).toBe(Number(conventions.match(/Biome: (\d+) line width/)?.[1]));
		expect(BIOME_JSON.linter.rules.suspicious.noConsole.level).toBe("error");
		expect(BIOME_JSON.linter.rules.suspicious.noConsole.options.allow).toEqual(["error"]);
		expect(BIOME_JSON.assist.actions.source.organizeImports).toBe("on");
		expect(BIOME_JSON.files.includes).toContain("!**/src/data/**/*");
		expect(BIOME_JSON.files.includes).toContain("!**/public/**/*");
	});
});
