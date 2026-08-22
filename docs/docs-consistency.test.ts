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

const STYLESHEETS_STYLING_A_VENDOR_DOM = new Set(["src/ui/styles/vendor/cookie-consent.css"]);

const STYLESHEET_OUTSIDE_A_COMPONENT_FOLDER = "src/ui/modules/contact/components/form/shared.css";

const ROUTES_WITH_NO_PAGE_CONTAINER = ["404", "500", "tag"];

const DOCUMENTED_PATH_EXAMPLES = new Set(["file.ts:123", "NNNN-kebab-title.md"]);

const ADR_TEMPLATE_SECTIONS = ["Status", "Context", "Decision", "Consequences"];

const ADR_STATUSES = new Set(["Template", "Proposed", "Accepted", "Superseded", "Deprecated"]);

const INLINE_CODE = /`([^`\n]+)`/g;
const FENCED_BLOCK = /```(\w*)\n([\s\S]*?)```/g;
const ANY_FENCED_BLOCK = /```[\s\S]*?```/g;
const TRAILING_GLOB = /\*$/;
const LEADING_RELATIVE = /^\.\//;
const LEADING_SLASH = /^\//;
const TRAILING_SLASH = /\/$/;
const BACKTICKED_NAME = /`\.?([\w-]+)`/g;
const DOCUMENTED_SCRIPT = /^pnpm\s+([a-z0-9:._-]+)/;
const DOCUMENTED_ALIAS = /@([a-z]+)\/\*(?:\s*\(→\s*([^)]+)\))?/g;
const DOCUMENTED_ROUTES_COMMENT = /pages\/\s*#\s*routes \(([^)]+)\)/;
const NESTED_GUIDE_LINK = /\]\(\.\/(src\/[\w/-]*CLAUDE\.md)\)/g;
const RELATIVE_MARKDOWN_LINK = /\]\(([^)#][^)]*)\)/g;
const ABSOLUTE_URL = /^[a-z]+:/;
const DOCUMENTED_LINE_WIDTH = /Biome: (\d+) line width/;
const SOURCE_FILE = /\.(ts|tsx|astro)$/;
const TYPESCRIPT_FILE = /\.(ts|tsx)$/;
const CO_LOCATED_TEST_FILE = /\.test\.(ts|tsx)$/;
const ROUTE_FILE = /\.(astro|ts)$/;
const FILE_EXTENSION = /\.\w+$/;
const PATH_WITH_LINE_NUMBER = /\.(ts|tsx|astro|css):\d+/;
const NOT_A_BARE_PATH = /[<>*…(),\s]/;
const ENV_SCHEMA_FIELD = /(\w+): envField\./g;
const ENV_EXAMPLE_VARIABLE = /^([A-Z][A-Z0-9_]*)=/gm;
const CLIENT_ENV_FIELD = /(\w+): envField\.\w+\(\{[^}]*\}\)/g;
const EXPORTED_CONSTANT = /^export const (\w+)/gm;
const ADR_REFERENCE = /ADR ([\d/\s]+)/g;
const ADR_NUMBER = /\d{4}/g;
const ADR_PATH_REFERENCE = /docs\/adr\/(\d{4})-/g;
const ADR_FILENAME = /^docs\/adr\/\d{4}(-[a-z\d]+)+\.md$/;
const ADR_STATUS = /\n## Status\n\n(\w+)/;
const ADR_DATE = /\nDate: \d{4}-\d{2}-\d{2}\n/;
const CLIENT_TABLE_ROW = /^\| `(\w+)` \| `(\w+)` \| `([\w/.]+)` \|$/gm;
const TAGGED_ERROR_DECLARATION = /export class (\w+) extends Data\.TaggedError/g;
const MODULE_LEVEL_ENV_IMPORT = /^\s*import\s[^\n]*"astro:env\/server"/m;
const RECAPTCHA_SCORE_DECLARATION = /const RECAPTCHA_MINIMUM_SCORE = ([\d.]+);/;
const DRIZZLE_IMPORT = /from "drizzle-orm(\/[\w/]+)?"/;
const CAUGHT_SAVE_CONTACT = /saveContact\([^)]*\)\.pipe\(\s*Effect\.catchAll/;
const CONSOLE_CALL = /\bconsole\.\w+\(/;
const TAG_TO_STATUS_CASE = /case "(\w+)":[\s\S]{0,60}?code: "(\w+)"/g;
const DOCUMENTED_TAG_TO_STATUS = /`(?:\w+Error)` → `[A-Z_]+`/g;
const ANSWERED_STATUS = /code: "(\w+)"/g;
const CONSTRUCTED_ACTION_ERROR = /new ActionError\(\{/;
const ASTRO_MODULE_IMPORT = /from "astro:/;
const DOCUMENTED_CATCH_ALL_STATUS = /collapses into one generic `([A-Z_]+)` message/;
const IMPORT_SOURCE = /from "([^"]+)"/g;
const OUTWARD_IMPORT = /^@(application|infrastructure|modules)\//;
const SHARED_UTILS_IMPORT = /import\s*\{([^}]+)\}\s*from\s*"@shared\/utils\/[^"]+"/g;
const IMPURE_DOMAIN_CODE = /from "effect"|fetch\(|process\.env|astro:env/;
const DOMAIN_RULES_CENSUS = /([^;.\n]*\bno one else\b)/;
const IMPURE_DTO_CODE = /astro:env|from "effect"|getEntries|getImagePlaceholder/;
const ASYNC_DTO_MAPPER = /export\s+(?:const|async\s+function)\s+create\w+/;
const DTO_INFRASTRUCTURE_IMPORT = /from "(@infrastructure\/[^"]+)"/g;
const CONTENTFUL_TYPE = /from "contentful"|@contentful\/|EntryFieldTypes|EntrySkeletonType/;
const HAND_PREFIXED_ASSET_URL = /`https:\$\{/;
const ABSOLUTE_IMAGE_URL_SCHEMA = /url:\s*z\.url\(\)/;
const ASSET_SCHEME_CONSTANT = /ASSET_SCHEME = "https:"/;
const CMS_LAYER_IMPORT = /import\s*\{[^}]*CmsClientLive[^}]*\}\s*from\s*"@infrastructure\/cms\/client"/;
const LOADER_FETCH_ENTRIES = /await fetchEntries</;
const CONTENTFUL_PAGE_CAP = /CONTENTFUL_MAX_PAGE_SIZE = (\d+)/;
const LOADER_REACHING_PAST_FETCH_ENTRIES = /from "effect"|isContentfulConfigured|CmsClient|concurrency:/;
const DOMAIN_SCHEMA_BINDING = /schema:\s*\w+Schema/;
const DOMAIN_IMPORT = /from "@domain\//;
const ASTRO_SITE_READ = /Astro\.site/;
const ASTRO_URL_ORIGIN_READ = /Astro\.url\.(?:href|origin)|origin: originPath/;
const LOADER_ID_ASSIGNMENT = /\bid:\s*(?:\w+\.)?(\w+),/g;
const ANY_ID_ASSIGNMENT = /\bid:\s/;
const TYPE_SCALE_RATIO = /--ratio:\s*([\d.]+);/;
const EDITORIAL_UTILITY_DECLARATION = /^\t\.(editorial-[a-z-]+)[^{\n]*\{/gm;
const EDITORIAL_UTILITY_CITATION = /`\.(editorial-[a-z-]+)`/g;
const GLOBAL_UTILITY_DECLARATION = /^\t\.([a-z][a-z-]*)[^{\n]*\{/gm;
const GLOBAL_UTILITY_CENSUS = /^- \*\*`global\.css` utilities\.\*\* (.+)$/m;
const CLASS_CITATION = /`\.([a-z][a-z-]*)`/g;
const GRID_MEASURE_ROOT_DECLARATION = /^\t\t(--grid-[a-z-]+):/gm;
const GRID_MEASURE_PROPERTY_DECLARATION = /^@property (--grid-[a-z-]+)/gm;
const GRID_MEASURE_USE = /var\((--grid-[a-z-]+)\)/g;
const MODULE_FONT_SIZE = /font-size:\s*([^;}\n]+)/g;
const CONTAINER_SCALED_CENSUS = /under `@modules` the components taking it are ([^.]+)\./;
const UNLADDERED_FONT_SIZE_COUNT = /(\d+) further `font-size` declarations/;
const UNLADDERED_FONT_SIZE_CENSUS = /neither on the ladder nor container-scaled, and they sit in ([^:]+):/;
const SECTION_TITLE_CENSUS = /a visual change to every component still on it, and those are ([^:]+):/;
const EDITORIAL_SECTION_TITLE_CONTAINER_CLAMP = /\.editorial-section-title \{[^}]*font-size:[^;]*cqi/;
const SEMANTIC_TOKEN_DECLARATION = /^\s+(--[a-z-]+): light-dark\(/gm;
const SEMANTIC_TOKEN_CENSUS = /they are exactly ([^:]+):/;
const GRID_TOKEN_IN_QUERY = /@(?:container|media)[^{]*var\(--grid-/;
const REVEAL_MODIFIER_DECLARATION = /\.reveal--[a-z-]+[^{\n]*\{/g;
const PAGE_CONTAINER_DECLARATION = /&\.page--([a-z\d-]+)\s*\{\s*container:\s*([a-z\d-]+)\s*\/\s*([^;]+);/g;
const SITE_ORIGIN_READ = /\bSITE_URL\b/;
const PAGES_ROUTES_BLOCK = /PAGES_ROUTES = \{([\s\S]*?)\n\} as const;/;
const PAGES_ROUTES_KEY = /^\t"?([\w-]+)"?:/gm;
const LAYER_ORDER_DECLARATION = /^@layer [^;{]+,[^;{]+;/m;
const LAYER_TABLE_ROW = /^\| ([^|]+) \| `([\w.-]+)`[^|]*\|$/gm;
const STYLESHEET_CITATION = /`([\w/.-]+)`/g;
const LAYER_STATEMENT = /^@layer .+;$/;
const INVERTED_SECTION_CENSUS = /the components that do are ([^.]+)\./;
const INVERTED_SECTION_MIX = "inverted-color-scheme";
const INVERTED_SECTION_MARKUP = /class="([^"]*inverted-color-scheme[^"]*)"/g;
const MODIFIER_BLOCK_DECLARATION = /^\t\.([a-z-]+)[^{\n]*\{/gm;
const MIXED_UTILITY_TABLE_ROW = /^\| `([a-z][a-z-]*)` \| [^|]+ \|$/gm;
const MIXED_UTILITY_BULLET = /^\t- `([a-z][a-z-]*)`: /gm;
const STANDALONE_MODIFIER_CLASS = /\.--[\w-]+/g;
const SMACSS_STATE_CLASS = /\.(?:is|has)-[\w-]+/g;
const ANY_CLASS_TOKEN = /\.(-{0,2}[a-zA-Z_][\w-]*)/g;
const COMPONENT_FILE = /^[A-Z][A-Za-z\d]*\.(astro|tsx)$/;
const ASTRO_STYLE_BLOCK = /<style[\s>]/;
const HYDRATION_DIRECTIVE = /<(\w+)[^>]*\sclient:([\w-]+)(?:="([^"]*)")?/g;
const CLASS_ATTRIBUTE = /class(?:Name|:list)?=(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^}]*\})*)\})/g;
const CLASS_WORD = /[a-zA-Z][\w-]*/g;
const ISLAND_ROOT_CENSUS = /only three hydration roots in the whole site: (.+?)\. Every one is/;
const DTO_CITED_DEFAULT = /`(\?\? [^`\n]+)`/g;
const CREATE_AUTHOR_DEFINITION = /export function createAuthor\(/;
const AUTHOR_FIELD_MAPPING = /\bsocialNetworks: [^;\n]+,$/m;
const ARTICLE_REFERENCE_LITERAL = /collection: "articles"/;
const NORMALISED_ARTICLE_SLUG = /slug: articleSlug\(/;
const AUTHORED_RELATED_ARTICLES = /fields\.relatedArticles/;
const RELATED_ARTICLES_CAP = /INFERRED_RELATED_ARTICLES_LIMIT = (\d+)/;
const TITLE_AS_IDENTITY = /fields\.title ===/;
const ARTICLE_SLUG_CALL = /articleSlug\(/;
const LEAKED_INFRASTRUCTURE_IMPORT = /@infrastructure\/|from "contentful"/;
const DEREFERENCING_MODULE = "src/ui/modules/core/utils/entries.ts";
const GET_ENTRY_CALL = /\bgetEntry\(/;
const EFFECT_IMPORT = /from "effect"/;
const CITED_CONTAINER_QUERY = /@container ([a-z-]+) \(width <= \d+px\)/;
const EMAIL_BUTTON_MODULE = "src/ui/modules/core/components/emailButton/utils/interactions.ts";
const EMAIL_BUTTON_STYLESHEET = "src/ui/modules/core/components/emailButton/email-button.css";
const EMAIL_BUTTON_HOOK_DECLARATION = /export const EMAIL_BUTTON_CLASS = "([\w-]+)";/;
const PLACEHOLDER_MODULE = "src/infrastructure/images/imagePlaceholder/imagePlaceholder.ts";
const PER_ENTRY_PLACEHOLDER_AWAIT = /placeholder:\s*await/;
const BOUNDED_PLACEHOLDER_READ = /const PLACEHOLDER_CONCURRENCY = \d+;/;
const BUNDLED_SCRIPT = /^\s*<script>/m;
const PAGE_LOAD_LISTENER = /addEventListener\(\s*["']astro:page-load["']/;
const THEME_MODULE = "src/ui/modules/core/components/themeToggle/utils/theme.ts";
const THEME_PREFERENCE_MODULE = "src/ui/modules/core/components/themeToggle/utils/preference.ts";
const THEME_KEY_DECLARATION = /export const THEME_STORAGE_KEY = "([\w-]+)" as const;/;
const THEME_PERSISTENCE = /localStorage\.setItem|store\.setItem/;
const DECODED_EMAIL_ADDRESS = /ENCODED_EMAIL_BIANCA/;
const IMAGE_SERVICE_SWITCH = /imageService: isProductionBuild \? "cloudflare" : "passthrough"/;
const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";
const CHROME_POLICY = "src/ui/modules/core/utils/siteChrome.ts";
const CHROME_ANSWER = /^\t(\w+): boolean;$/gm;

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

const stripFences = (markdown: string) => markdown.replace(ANY_FENCED_BLOCK, "");

const inlineCode = (markdown: string) => [...stripFences(markdown).matchAll(INLINE_CODE)].map(([, code]) => code);

const fences = (markdown: string) =>
	[...markdown.matchAll(FENCED_BLOCK)].map(([, language, body]) => ({ language, body }));

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

const TEST_INFRASTRUCTURE = "src/tests/";

const production = (files: string[]) =>
	files.filter((file) => !CO_LOCATED_TEST_FILE.test(file) && !file.startsWith(TEST_INFRASTRUCTURE));

const SOURCE_FILES = production(walk("src").filter((file) => SOURCE_FILE.test(file)));

const classesApplied = (source: string) =>
	[...source.matchAll(CLASS_ATTRIBUTE)].flatMap(([, doubled, singled, braced]) =>
		[...(doubled ?? singled ?? braced ?? "").matchAll(CLASS_WORD)].map(([word]) => word),
	);

const namesIn = ({ text, pattern }: { text: string; pattern: RegExp }) =>
	[...(text.match(pattern)?.[1] ?? "").matchAll(BACKTICKED_NAME)].map(([, name]) => name);

const ALIAS_TARGETS = Object.entries(TSCONFIG.compilerOptions.paths as Record<string, string[]>).map(
	([alias, [target]]) =>
		[alias.replace(TRAILING_GLOB, ""), target.replace(LEADING_RELATIVE, "").replace(TRAILING_GLOB, "")] as const,
);

describe("commands", () => {
	const documentedScripts = fences(section(CLAUDE_MD, "Commands"))
		.flatMap(({ body }) => body.split("\n"))
		.flatMap((line) => line.match(DOCUMENTED_SCRIPT)?.[1] ?? []);

	it("documents only scripts that exist in package.json", () => {
		expect(documentedScripts.filter((script) => !(script in PACKAGE_JSON.scripts))).toEqual([]);
	});

	it("documents every package script that is not deliberately left out", () => {
		const undocumented = Object.keys(PACKAGE_JSON.scripts).filter(
			(script) => !documentedScripts.includes(script) && !SCRIPTS_INTENTIONALLY_UNDOCUMENTED.has(script),
		);

		expect(undocumented).toEqual([]);
	});
});

describe("structure and aliases", () => {
	const aliasLine = CLAUDE_MD.split("\n").find((line) => line.startsWith("Path aliases")) ?? "";
	const documentedAliases = [...aliasLine.matchAll(DOCUMENTED_ALIAS)].map(([, name, target]) => ({
		alias: `@${name}/`,
		target: target ?? `src/${name}`,
	}));

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
				const bare = name.replace(TRAILING_SLASH, "");
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
			expect(`${alias} → ${targets.get(alias)?.replace(TRAILING_SLASH, "")}`).toBe(`${alias} → ${target}`);
		}
	});

	it("maps every alias onto a folder that holds at least one tracked file", () => {
		expect(ALIAS_TARGETS.filter(([, target]) => !isTracked(target.replace(TRAILING_SLASH, "")))).toEqual([]);
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
		const documentedRoutes = (structureFence.match(DOCUMENTED_ROUTES_COMMENT)?.[1] ?? "")
			.split(",")
			.map((route) => route.trim())
			.map((route) => `src/pages/${FILE_EXTENSION.test(route) ? route : `${route}.astro`}`);

		const actualRoutes = walk("src/pages").filter(
			(file) => !file.split("/").pop()?.startsWith("_") && ROUTE_FILE.test(file),
		);

		expect(documentedRoutes.filter((route) => !exists(route))).toEqual([]);
		expect(actualRoutes.filter((route) => !documentedRoutes.includes(route))).toEqual([]);
	});

	it("links a nested guide for every CLAUDE.md under src", () => {
		const linked = [...section(CLAUDE_MD, "Structure & aliases").matchAll(NESTED_GUIDE_LINK)].map(
			([, target]) => target,
		);

		expect([...new Set(linked)].sort()).toEqual(NESTED_GUIDES.sort());
	});
});

describe("environment", () => {
	const schemaVariables = [...ASTRO_CONFIG.matchAll(ENV_SCHEMA_FIELD)].map(([, name]) => name).sort();
	const exampleVariables = [...read(".env.example").matchAll(ENV_EXAMPLE_VARIABLE)].map(([, name]) => name).sort();

	it("declares the same variables in .env.example and the astro.config env schema", () => {
		expect(exampleVariables).toEqual(schemaVariables);
	});

	it("stands in for every client variable in the astro:env/client double, as ADR 0016 warns it must", () => {
		const clientVariables = [...ASTRO_CONFIG.matchAll(CLIENT_ENV_FIELD)]
			.filter(([declaration]) => declaration.includes('context: "client"'))
			.map(([, name]) => name)
			.sort();
		const doubled = [...read("src/tests/doubles/astroEnvClient.ts").matchAll(EXPORTED_CONSTANT)]
			.map(([, name]) => name)
			.sort();

		expect(clientVariables.length).toBeGreaterThan(0);
		expect(doubled).toEqual(clientVariables);
	});
});

describe("documented paths", () => {
	const documentedPaths = DOCS.flatMap((doc) =>
		inlineCode(read(doc))
			.filter((token) => DOCUMENTED_PATH_EXTENSIONS.some((extension) => token.endsWith(extension)))
			.filter((token) => !NOT_A_BARE_PATH.test(token) && !token.startsWith("node:"))
			.filter((token) => !DOCUMENTED_PATH_EXAMPLES.has(token))
			.map((token) => ({ doc, token })),
	);

	const resolves = ({ doc, token }: { doc: string; token: string }) => {
		const aliased = ALIAS_TARGETS.find(([alias]) => token.startsWith(alias));
		const candidate = aliased
			? token.replace(aliased[0], aliased[1])
			: token.replace(LEADING_RELATIVE, "").replace(LEADING_SLASH, "");
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
				.filter((token) => PATH_WITH_LINE_NUMBER.test(token) && !DOCUMENTED_PATH_EXAMPLES.has(token))
				.map((token) => `${doc}: ${token}`),
		);

		expect(citations).toEqual([]);
	});
});

describe("cross-document links", () => {
	it("resolves every relative markdown link", () => {
		const broken = DOCS.flatMap((doc) =>
			[...read(doc).matchAll(RELATIVE_MARKDOWN_LINK)]
				.map(([, target]) => target.split("#")[0])
				.filter((target) => target.length > 0 && !ABSOLUTE_URL.test(target))
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
			...[...body.matchAll(ADR_REFERENCE)].flatMap(([, numbers]) => numbers.match(ADR_NUMBER) ?? []),
			...[...body.matchAll(ADR_PATH_REFERENCE)].map(([, number]) => number),
		];
	};

	it("numbers files sequentially from the template, with no gaps or duplicates", () => {
		const numbers = ADR_FILES.map((file) => Number(file.split("/").pop()?.slice(0, 4)));

		expect(numbers).toEqual(numbers.map((_, index) => index));
	});

	it("names every file NNNN-kebab-title.md", () => {
		expect(ADR_FILES.filter((file) => !ADR_FILENAME.test(file))).toEqual([]);
	});

	it("fills in the template: numbered heading, date, status, context, decision, consequences", () => {
		const malformed = ADR_FILES.flatMap((file) => {
			const body = read(file);
			const number = Number(file.split("/").pop()?.slice(0, 4));
			const missing = ADR_TEMPLATE_SECTIONS.filter((heading) => !body.includes(`\n## ${heading}\n`));
			const status = body.match(ADR_STATUS)?.[1] ?? "";

			return [
				...(new RegExp(`^# ${number}\\. \\S`).test(body) ? [] : [`${file}: heading is not "# ${number}. Title"`]),
				...(ADR_DATE.test(body) ? [] : [`${file}: no "Date: YYYY-MM-DD" line`]),
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
		const rows = [...guide.matchAll(CLIENT_TABLE_ROW)].map(([, tag, live, file]) => ({
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
		expect(read("src/infrastructure/cms/entries.ts")).toContain("ManagedRuntime");
		expect(read("src/infrastructure/layers.ts")).toContain("ContactLayer");
	});

	it("owns the page cursor, and quotes the per-request cap the code walks it at", () => {
		const entries = read("src/infrastructure/cms/entries.ts");
		const cap = entries.match(CONTENTFUL_PAGE_CAP)?.[1];

		expect(cap).toBeDefined();
		expect(guide).toContain("the page cursor, and with it the promise that the answer is complete");
		expect(guide).toContain(`capped at ${cap} per request`);
		expect(entries).toContain("collection.total");
	});

	it("builds the CMS runtime from an imported layer, which is what keeps the doubles substitutable", () => {
		const entries = read("src/infrastructure/cms/entries.ts");

		expect(guide).toContain("imports `CmsClientLive` across the module boundary");
		expect(entries).toMatch(CMS_LAYER_IMPORT);
		expect(read("src/infrastructure/cms/client.ts")).not.toContain("ManagedRuntime");
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
	const layerRows = [...guide.matchAll(LAYER_TABLE_ROW)].map(([, files, layer]) => ({
		files: [...files.matchAll(STYLESHEET_CITATION)].map(([, file]) => file),
		layer,
	}));

	const stylesheets = walk("src/ui/styles").filter((file) => file.endsWith(".css") && !file.endsWith("/index.css"));

	it("declares the layer order the guide shows", () => {
		const declaration =
			fences(guide)
				.find(({ language }) => language === "css")
				?.body.trim() ?? "";

		expect(declaration).toMatch(LAYER_STATEMENT);
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
		expect(ASTRO_CONFIG).toMatch(IMAGE_SERVICE_SWITCH);
	});

	it("keeps the https upgrade out of the dev CSP, which WebKit obeys on localhost", () => {
		const headers = read("src/const/securityHeaders.ts");
		const middleware = read("src/middleware.ts");

		expect(headers).toContain(HTTPS_UPGRADE_DIRECTIVE);
		expect(middleware).toContain("import.meta.env.DEV");
		expect(middleware).not.toContain(HTTPS_UPGRADE_DIRECTIVE);
		expect(CLAUDE_MD).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("decides what HIDE_CHROME means in the one module the gotcha names, and reads it nowhere else", () => {
		const readers = SOURCE_FILES.filter((file) => read(file).includes("HIDE_CHROME"));

		expect(readers).toEqual([CHROME_POLICY]);
		expect(CLAUDE_MD).toContain("`@modules/core/utils/siteChrome.ts`");
		expect(read("astro.config.ts")).toContain("HIDE_CHROME");
		expect(read(".github/workflows/_deploy.yml")).toContain("HIDE_CHROME");
	});

	it("asks the chrome policy rather than the flag, wherever chrome is conditional", () => {
		const asking = SOURCE_FILES.filter((file) => read(file).includes("siteChrome(Astro.url)"));

		expect(asking.sort()).toEqual(
			[
				"src/pages/articles/[...slug].astro",
				"src/ui/modules/core/components/baseLayout/BaseLayout.astro",
				"src/ui/modules/core/components/breadcrumbs/Breadcrumbs.astro",
			].sort(),
		);

		const answers = [...read(CHROME_POLICY).matchAll(CHROME_ANSWER)].map(([, answer]) => answer);
		const guide = read("src/ui/modules/CLAUDE.md");

		expect(answers.length).toBeGreaterThan(0);
		expect(answers.filter((answer) => !guide.includes(`\`${answer}\``))).toEqual([]);
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
	const infrastructureFiles = production(walk("src/infrastructure").filter((file) => TYPESCRIPT_FILE.test(file)));

	it("reads astro:env/server lazily, inside the layer, and never as a module import", () => {
		expect(guide).toContain("Never import `astro:env/server` at module top level");

		const readers = SOURCE_FILES.filter((file) => read(file).includes("astro:env/server"));

		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => !read(file).includes('import("astro:env/server")'))).toEqual([]);
		expect(readers.filter((file) => MODULE_LEVEL_ENV_IMPORT.test(read(file)))).toEqual([]);
	});

	it("dies on irrecoverable misconfiguration rather than failing typed, in the layer the guide names", () => {
		expect(guide).toContain("`Effect.die` (see `DatabaseLive`)");
		expect(read("src/infrastructure/db/client.ts")).toContain("Effect.die(");
	});

	it("declares every tagged error in errors.ts, never beside a client", () => {
		expect(guide).toContain("don't define errors next to the client");

		const declared = [...read("src/infrastructure/errors.ts").matchAll(TAGGED_ERROR_DECLARATION)];

		expect(declared.length).toBeGreaterThan(0);
		expect(
			SOURCE_FILES.filter((file) => file !== "src/infrastructure/errors.ts").filter((file) =>
				read(file).includes("Data.TaggedError"),
			),
		).toEqual([]);
	});

	it("leaves the tag to HTTP mapping to the action, and to contactErrorResponse alone", () => {
		expect(guide).toContain("(`contactErrorResponse`), never here");
		expect(read("src/actions/errorResponse.ts")).toContain("export const contactErrorResponse = (");
		expect(infrastructureFiles.filter((file) => read(file).includes("ActionError"))).toEqual([]);
	});

	it("keeps the query builder inside the layer the tag hides it behind", () => {
		expect(guide).toContain("never re-exports the vendor's own object");

		const drizzleImporters = SOURCE_FILES.filter((file) => DRIZZLE_IMPORT.test(read(file)));

		expect(drizzleImporters.length).toBeGreaterThan(0);
		expect(drizzleImporters.filter((file) => !file.startsWith("src/infrastructure/db/"))).toEqual([]);
	});

	it("cites the reCAPTCHA score the guard actually enforces", () => {
		const guards = read("src/infrastructure/utils/guards.ts");
		const score = guards.match(RECAPTCHA_SCORE_DECLARATION)?.[1];

		expect(score).toBeDefined();
		expect(guards).toContain("< RECAPTCHA_MINIMUM_SCORE");
		expect(guide).toContain(`\`RECAPTCHA_MINIMUM_SCORE\` (${score})`);
	});
});

describe("actions guide", () => {
	const guide = read("src/actions/CLAUDE.md");
	const action = read("src/actions/index.ts");
	const program = read("src/actions/contact.ts");
	const mapping = read("src/actions/errorResponse.ts");

	it("logs a failed saveContact instead of failing the request", () => {
		expect(guide).toContain("A failed `saveContact` is logged, not raised");
		expect(program).toMatch(CAUGHT_SAVE_CONTACT);
	});

	it("logs through Effect rather than console, here and everywhere in src", () => {
		expect(guide).toContain("Nothing here calls `console`");
		expect(`${program}${mapping}`).toContain("Effect.logError");
		expect(SOURCE_FILES.filter((file) => CONSOLE_CALL.test(read(file)))).toEqual([]);
	});

	it("maps exactly the tags the guide says it maps", () => {
		const cases = [...mapping.matchAll(TAG_TO_STATUS_CASE)].map(([, tag, code]) => ({ tag, code }));
		const mapped = cases.map(({ tag, code }) => `\`${tag}\` → \`${code}\``);
		const documented = [...guide.matchAll(DOCUMENTED_TAG_TO_STATUS)].map(([pair]) => pair);

		expect(mapped.length).toBeGreaterThan(0);
		expect(documented.sort()).toEqual(mapped.sort());
	});

	it("answers no status the guide does not account for, whatever shape the mapping is written in", () => {
		const catchAll = guide.match(DOCUMENTED_CATCH_ALL_STATUS)?.[1];
		const documented = [...guide.matchAll(DOCUMENTED_TAG_TO_STATUS)]
			.map(([pair]) => pair.split(" → ")[1].replaceAll("`", ""))
			.sort();
		const answered = [...mapping.matchAll(ANSWERED_STATUS)].map(([, code]) => code);

		expect(catchAll).toBeDefined();
		expect(answered.filter((code) => code === catchAll)).toEqual([catchAll]);
		expect(answered.filter((code) => code !== catchAll).sort()).toEqual(documented);
	});

	it("keeps the mapping runnable from a test, and the astro edge free of statuses", () => {
		expect(guide).toContain("so a unit test can run the mapping");
		expect(mapping).not.toMatch(ASTRO_MODULE_IMPORT);
		expect(action).toContain("contactErrorResponse(cause)");
		expect(action).not.toMatch(CONSTRUCTED_ACTION_ERROR);
	});
});

describe("domain guide: purity", () => {
	const guide = read("src/domain/CLAUDE.md");
	const domainFiles = production(walk("src/domain").filter((file) => file.endsWith(".ts")));

	const externalImports = [
		...new Set(
			domainFiles.flatMap((file) =>
				[...read(file).matchAll(IMPORT_SOURCE)]
					.map(([, source]) => source)
					.filter((source) => !source.startsWith(".") && !source.startsWith("@domain/")),
			),
		),
	].sort();

	it("imports nothing outward, and the guide names every module it does import", () => {
		expect(externalImports.length).toBeGreaterThan(0);
		expect(externalImports.filter((source) => OUTWARD_IMPORT.test(source))).toEqual([]);

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
					[...read(file).matchAll(SHARED_UTILS_IMPORT)].flatMap(([, names]) =>
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
		expect(domainFiles.filter((file) => IMPURE_DOMAIN_CODE.test(read(file)))).toEqual([]);
	});

	it("names exactly the concepts that carry a rules.ts", () => {
		const withRules = directoriesIn("src/domain").filter((concept) => exists(`src/domain/${concept}/rules.ts`));
		const claimed = namesIn({ text: guide, pattern: DOMAIN_RULES_CENSUS });

		expect(claimed.length).toBeGreaterThan(0);
		expect(claimed.sort()).toEqual(withRules.sort());
	});
});

describe("application guide: the anti-corruption boundary", () => {
	const guide = read("src/application/CLAUDE.md");
	const dtoFiles = production(walk("src/application/dto").filter((file) => TYPESCRIPT_FILE.test(file)));
	const loaders = directoriesIn("src/application/entities").map(
		(entity) => `src/application/entities/${entity}/${entity}.ts`,
	);

	it("keeps DTOs free of I/O, Effect and env access", () => {
		expect(guide).toContain("DTOs are pure on purpose");
		expect(dtoFiles.length).toBeGreaterThan(0);
		expect(dtoFiles.filter((file) => IMPURE_DTO_CODE.test(read(file)))).toEqual([]);
	});

	it("leaves the placeholder fan-out to the module that owns it, never to a loader", () => {
		expect(guide).toContain("never for a `Promise.all` of its own");

		expect(loaders.length).toBeGreaterThan(0);
		expect(loaders.filter((file) => PER_ENTRY_PLACEHOLDER_AWAIT.test(read(file)))).toEqual([]);
		expect(read(PLACEHOLDER_MODULE)).toMatch(BOUNDED_PLACEHOLDER_READ);
	});

	it("applies every optional-field default it cites, so the domain DTO stays total", () => {
		const cited = [...new Set([...guide.matchAll(DTO_CITED_DEFAULT)].map(([, fallback]) => fallback))];
		const dtoLayer = dtoFiles.map((file) => read(file)).join("\n");

		expect(cited.length).toBeGreaterThan(0);
		expect(cited.filter((fallback) => !dtoLayer.includes(fallback))).toEqual([]);
	});

	it("turns a raw author into Author fields in the one module the guide names", () => {
		expect(guide).toContain("One raw entry, one mapping");

		const definitions = dtoFiles.filter((file) => CREATE_AUTHOR_DEFINITION.test(read(file)));

		expect(definitions).toEqual(["src/application/dto/author/utils/author.ts"]);
		expect(dtoFiles.filter((file) => AUTHOR_FIELD_MAPPING.test(read(file)))).toEqual(definitions);
	});

	it("addresses an Article from the one module the guide names, the collection id included", () => {
		expect(guide).toContain("One raw entry, one address");

		const builders = dtoFiles.filter((file) => ARTICLE_REFERENCE_LITERAL.test(read(file)));

		expect(builders).toEqual(["src/application/dto/article/utils/reference.ts"]);
		expect(read("src/application/dto/article/articleDTO.ts")).toMatch(NORMALISED_ARTICLE_SLUG);
	});

	it("decides Related Articles in the one module the guide names, on the slug and with the cap it quotes", () => {
		expect(guide).toContain("One concept, one decision");

		const decider = "src/application/dto/article/utils/articles.ts";
		const source = read(decider);
		const cap = source.match(RELATED_ARTICLES_CAP)?.[1];

		expect(dtoFiles.filter((file) => AUTHORED_RELATED_ARTICLES.test(read(file)))).toEqual([decider]);
		expect(cap).toBeDefined();
		expect(guide).toContain(`\`INFERRED_RELATED_ARTICLES_LIMIT\` (${cap})`);
		expect(source).toMatch(ARTICLE_SLUG_CALL);
		expect(dtoFiles.filter((file) => TITLE_AS_IDENTITY.test(read(file)))).toEqual([]);
	});

	it("keeps every DTO mapper synchronous, as the guide states", () => {
		expect(guide).toContain("Every mapper is synchronous");
		expect(dtoFiles.filter((file) => ASYNC_DTO_MAPPER.test(read(file)))).toEqual([]);
	});

	it("names the only infrastructure module a DTO is allowed to reach for", () => {
		const reached = [
			...new Set(
				dtoFiles.flatMap((file) => [...read(file).matchAll(DTO_INFRASTRUCTURE_IMPORT)].map(([, source]) => source)),
			),
		];

		expect(reached.length).toBeGreaterThan(0);
		expect(reached.filter((source) => !guide.includes(`\`${source}\``))).toEqual([]);
	});

	it("absolutises the asset url here, so nothing downstream re-adds the scheme", () => {
		expect(guide).toContain("An asset URL is absolutised here");
		expect(read("src/domain/shared/image.ts")).toMatch(ABSOLUTE_IMAGE_URL_SCHEMA);
		expect(read("src/application/dto/shared/images.ts")).toMatch(ASSET_SCHEME_CONSTANT);

		const downstream = production([...walk("src/pages"), ...walk("src/ui")])
			.filter((file) => SOURCE_FILE.test(file))
			.filter((file) => HAND_PREFIXED_ASSET_URL.test(read(file)));

		expect(downstream).toEqual([]);
	});

	it("stops Contentful types at this layer: nothing downstream sees them", () => {
		expect(guide).toContain("Contentful types stop here");

		const downstream = production([...walk("src/domain"), ...walk("src/ui")])
			.filter((file) => SOURCE_FILE.test(file))
			.filter((file) => CONTENTFUL_TYPE.test(read(file)));

		expect(downstream).toEqual([]);
	});

	it("fetches through fetchEntries, and takes its schema from the domain", () => {
		expect(loaders.length).toBeGreaterThan(0);
		expect(guide).toContain("`fetchEntries<[Skeleton, …]>(query, …)`");

		const broken = loaders.filter((file) => {
			const source = read(file);

			return !LOADER_FETCH_ENTRIES.test(source) || !DOMAIN_SCHEMA_BINDING.test(source) || !DOMAIN_IMPORT.test(source);
		});

		expect(broken).toEqual([]);
	});

	it("leaves the credential bail, the batching and Effect itself to that one interface", () => {
		expect(guide).toContain("no Effect, no `CmsClient`, no runtime, no credential guard");

		const entries = read("src/infrastructure/cms/entries.ts");

		expect(entries).toContain("if (!isContentfulConfigured())");
		expect(entries).toContain('{ concurrency: "unbounded" }');
		expect(loaders.filter((file) => LOADER_REACHING_PAST_FETCH_ENTRIES.test(read(file)))).toEqual([]);
	});

	it("cites the id every loader assigns, and the one that assigns none", () => {
		const step = guide.split("\n").find((line) => line.startsWith("4. ")) ?? "";
		const assigned = [
			...new Set(loaders.flatMap((file) => [...read(file).matchAll(LOADER_ID_ASSIGNMENT)].map(([, field]) => field))),
		];

		expect(assigned.length).toBeGreaterThan(0);
		expect(assigned.filter((field) => !step.includes(field))).toEqual([]);

		const withoutId = loaders.filter((file) => !ANY_ID_ASSIGNMENT.test(read(file)));

		expect(withoutId).toEqual(["src/application/entities/projects/projects.ts"]);
		expect(step).toContain("`projects`");
	});
});

describe("styles guide: derived constants and source order", () => {
	const guide = read("src/ui/styles/CLAUDE.md");

	it("cites the type-scale ratio the tokens are built from", () => {
		const ratio = read("src/ui/styles/global/variables.css").match(TYPE_SCALE_RATIO)?.[1];

		expect(ratio).toBeDefined();
		expect(guide).toContain(`\`--ratio: ${ratio}\``);
	});

	it("lists every editorial utility global.css declares, and no others", () => {
		const declared = [
			...new Set(
				[...read("src/ui/styles/global/global.css").matchAll(EDITORIAL_UTILITY_DECLARATION)].map(([, name]) => name),
			),
		].sort();
		const listed = [...new Set([...guide.matchAll(EDITORIAL_UTILITY_CITATION)].map(([, name]) => name))].sort();

		expect(declared.length).toBeGreaterThan(0);
		expect(listed).toEqual(declared);
	});

	it("censuses every block global.css declares, so an unlisted utility gets reinvented instead of reused", () => {
		const declared = [
			...new Set(
				[...read("src/ui/styles/global/global.css").matchAll(GLOBAL_UTILITY_DECLARATION)].map(([, name]) => name),
			),
		].sort();
		const census = guide.match(GLOBAL_UTILITY_CENSUS)?.[1] ?? "";
		const listed = [...new Set([...census.matchAll(CLASS_CITATION)].map(([, name]) => name))].sort();

		expect(declared.length).toBeGreaterThan(0);
		expect(listed).toEqual(declared);
	});

	it("declares no global.css utility that nothing applies", () => {
		const declared = [
			...new Set(
				[...read("src/ui/styles/global/global.css").matchAll(GLOBAL_UTILITY_DECLARATION)].map(([, name]) => name),
			),
		];
		const applied = new Set(
			SOURCE_FILES.filter((file) => !file.startsWith("src/ui/styles/")).flatMap((file) => classesApplied(read(file))),
		);

		expect(declared.length).toBeGreaterThan(0);
		expect(guide).toContain("So does declaring one nothing uses");
		expect(declared.filter((name) => !applied.has(name))).toEqual([]);
	});

	it("censuses every component still on the non-canonical .section-title", () => {
		const onIt = walk("src/ui/modules")
			.filter((file) => file.endsWith(".astro"))
			.filter((file) => classesApplied(read(file)).includes("section-title"))
			.map((file) => file.split("/").at(-2) ?? "");
		const censused = namesIn({ text: guide, pattern: SECTION_TITLE_CENSUS });

		expect(guide).toContain("`.editorial-section-title` is the canonical one");
		expect(onIt.length).toBeGreaterThan(0);
		expect(censused.sort()).toEqual([...new Set(onIt)].sort());
	});

	it("names every component that leaves the ladder for a container-scaled clamp", () => {
		const scaled = walk("src/ui/modules")
			.filter((file) => file.endsWith(".css"))
			.filter((file) =>
				[...read(file).matchAll(MODULE_FONT_SIZE)].some(
					([, value]) => !value.includes("var(--font-size") && value.includes("cqi"),
				),
			)
			.map((file) => file.split("/").at(-2) ?? "");
		const censused = namesIn({ text: guide, pattern: CONTAINER_SCALED_CENSUS });

		expect(scaled.length).toBeGreaterThan(0);
		expect(censused.sort()).toEqual([...new Set(scaled)].sort());
		expect(read("src/ui/styles/global/global.css")).toMatch(EDITORIAL_SECTION_TITLE_CONTAINER_CLAMP);
	});

	it("pins how many module font sizes escape the ladder, so the drift can only shrink", () => {
		const declarations = walk("src/ui/modules")
			.filter((file) => file.endsWith(".css"))
			.flatMap((file) => [...read(file).matchAll(MODULE_FONT_SIZE)].map(([, value]) => ({ file, value })));
		const unladdered = declarations.filter(({ value }) => !value.includes("var(--font-size") && !value.includes("cqi"));
		const censused = namesIn({ text: guide, pattern: UNLADDERED_FONT_SIZE_CENSUS });

		expect(declarations.length).toBeGreaterThan(0);
		expect(unladdered.length).toBe(Number(guide.match(UNLADDERED_FONT_SIZE_COUNT)?.[1]));
		expect(censused.sort()).toEqual([...new Set(unladdered.map(({ file }) => file.split("/").at(-2) ?? ""))].sort());
	});

	it("declares every --grid-* measure twice, and none that nothing consumes", () => {
		const variables = read("src/ui/styles/global/variables.css");
		const inRoot = [...new Set([...variables.matchAll(GRID_MEASURE_ROOT_DECLARATION)].map(([, name]) => name))].sort();
		const asProperty = [
			...new Set([...variables.matchAll(GRID_MEASURE_PROPERTY_DECLARATION)].map(([, name]) => name)),
		].sort();
		const consumed = new Set(
			walk("src")
				.filter((file) => file.endsWith(".css") || SOURCE_FILE.test(file))
				.flatMap((file) => [...read(file).matchAll(GRID_MEASURE_USE)].map(([, name]) => name)),
		);

		expect(guide).toContain("rejects any `--grid-*` nothing consumes");
		expect(inRoot.length).toBeGreaterThan(0);
		expect(asProperty).toEqual(inRoot);
		expect(inRoot.filter((name) => !consumed.has(name))).toEqual([]);
	});

	it("names every light-dark() token as semantic, and claims none that variables.css does not define", () => {
		const declared = [
			...new Set(
				[...read("src/ui/styles/global/variables.css").matchAll(SEMANTIC_TOKEN_DECLARATION)].map(([, name]) => name),
			),
		].sort();
		const censused = namesIn({ text: guide, pattern: SEMANTIC_TOKEN_CENSUS }).sort();

		expect(declared.length).toBeGreaterThan(0);
		expect(censused).toEqual(declared);
	});

	it("keeps the --grid-* tokens as widths: a query condition cannot read a custom property", () => {
		expect(guide).toContain("never a query condition");

		const misused = walk("src/ui")
			.filter((file) => file.endsWith(".css"))
			.filter((file) => GRID_TOKEN_IN_QUERY.test(read(file)));

		expect(misused).toEqual([]);
	});

	it("keeps the reveal modifiers after the class they only beat by source order", () => {
		const reveal = read("src/ui/styles/global/reveal.css");
		const base = reveal.indexOf(".reveal {");
		const modifiers = [...reveal.matchAll(REVEAL_MODIFIER_DECLARATION)].map(({ index }) => index);

		expect(guide).toContain("keep them after `.reveal` in the file");
		expect(base).toBeGreaterThan(-1);
		expect(modifiers.length).toBeGreaterThan(0);
		expect(modifiers.filter((at) => at < base)).toEqual([]);
		expect(reveal).toContain("prefers-reduced-motion");
	});

	it("names one container per route, derived from the page modifier", () => {
		const containers = [...read("src/ui/styles/base/base.css").matchAll(PAGE_CONTAINER_DECLARATION)].map(
			([, route, name, axes]) => ({ route, name, axes: axes.trim() }),
		);

		expect(containers.length).toBeGreaterThan(0);
		expect(guide).toContain("`inline-size scroll-state`");
		expect(containers.filter(({ route, name }) => name !== `${route}-page`)).toEqual([]);
		expect(containers.filter(({ axes }) => axes !== "inline-size scroll-state")).toEqual([]);

		const block = read("src/const/const.ts").match(PAGES_ROUTES_BLOCK)?.[1] ?? "";
		const uncontained = [...block.matchAll(PAGES_ROUTES_KEY)]
			.map(([, key]) => key.toLowerCase())
			.filter((route) => !containers.some(({ route: named }) => named === route))
			.sort();

		expect(uncontained).toEqual(ROUTES_WITH_NO_PAGE_CONTAINER);
		expect(uncontained.filter((route) => !guide.includes(`\`${route}\``))).toEqual([]);
	});

	it("has no page--tag, for the reason the guide gives", () => {
		const block = read("src/const/const.ts").match(PAGES_ROUTES_BLOCK)?.[1] ?? "";
		const routes = [...block.matchAll(PAGES_ROUTES_KEY)].map(([, key]) => key);

		expect(guide).toContain("There is deliberately no `page--tag`");
		expect(routes).toContain("TAGS");
		expect(routes.indexOf("TAGS")).toBeLessThan(routes.indexOf("TAG"));
		expect(read("src/ui/modules/core/utils/page.ts")).toContain("isWithin(url.pathname");
		expect(read("src/ui/styles/base/base.css")).not.toContain("page--tag ");
	});

	it("censuses every component that inverts against the page, and claims no others", () => {
		const inverting = production(walk("src/ui/modules"))
			.filter((file) => SOURCE_FILE.test(file) && classesApplied(read(file)).includes("inverted-color-scheme"))
			.map((file) => file.split("/").at(-2) ?? "");
		const censused = namesIn({ text: guide, pattern: INVERTED_SECTION_CENSUS });

		expect(inverting.length).toBeGreaterThan(0);
		expect(censused.sort()).toEqual([...new Set(inverting)].sort());
	});

	it("lets the header observe the mix rather than naming the blocks that carry it", () => {
		const interactions = read("src/ui/modules/core/components/header/utils/interactions.ts");
		const blocks = production(walk("src/ui/modules"))
			.filter((file) => SOURCE_FILE.test(file))
			.flatMap((file) => [...read(file).matchAll(INVERTED_SECTION_MARKUP)])
			.flatMap(([, applied]) => [...applied.matchAll(CLASS_WORD)].map(([word]) => word))
			.filter((name) => name !== INVERTED_SECTION_MIX);

		expect(guide).toContain("observes every `.inverted-color-scheme`");
		expect(blocks.length).toBeGreaterThan(0);
		expect(interactions).toContain(`.${INVERTED_SECTION_MIX}`);
		expect(blocks.filter((name) => interactions.includes(`.${name}`))).toEqual([]);
	});

	it("declares the layer order in index.css and nowhere else", () => {
		const declaring = walk("src/ui/styles")
			.filter((file) => file.endsWith(".css"))
			.filter((file) => LAYER_ORDER_DECLARATION.test(read(file)));

		expect(guide).toContain("no file re-declares the order");
		expect(declaring).toEqual(["src/ui/styles/index.css"]);
	});
});

describe("modules guide: mixes, islands and data access", () => {
	const guide = read("src/ui/modules/CLAUDE.md");
	const stylesGuide = read("src/ui/styles/CLAUDE.md");

	const declaredModifiers = [
		...new Set(
			[...read("src/ui/styles/global/modifiers.css").matchAll(MODIFIER_BLOCK_DECLARATION)].map(([, name]) => name),
		),
	].sort();

	const tabulatedModifiers = [...stylesGuide.matchAll(MIXED_UTILITY_TABLE_ROW)].map(([, name]) => name);
	const listedModifiers = [...guide.matchAll(MIXED_UTILITY_BULLET)].map(([, name]) => name);

	it("only claims utilities that modifiers.css actually declares as blocks", () => {
		const claimed = [...tabulatedModifiers, ...listedModifiers];

		expect(claimed.length).toBeGreaterThan(0);
		expect(claimed.filter((name) => !declaredModifiers.includes(name))).toEqual([]);
	});

	it("names every block modifiers.css declares in both guides, so none is left undocumented", () => {
		expect(declaredModifiers.length).toBeGreaterThan(0);
		expect([...tabulatedModifiers].sort()).toEqual(declaredModifiers);
		expect([...listedModifiers].sort()).toEqual(declaredModifiers);
	});

	const stylesheets = walk("src/ui")
		.filter((file) => file.endsWith(".css"))
		.filter((file) => !STYLESHEETS_STYLING_A_VENDOR_DOM.has(file));

	it("writes modifiers the way BEM does: fused onto a block, never standalone or `is-`/`has-` prefixed", () => {
		expect(guide).toContain("No standalone `.--modifier` classes");
		expect(guide).toContain("no `is-`/`has-` prefixes");
		expect(stylesGuide).toContain("never `is-`/`has-` state classes");

		const violations = stylesheets.flatMap((file) => {
			const source = read(file);

			return [...source.matchAll(STANDALONE_MODIFIER_CLASS), ...source.matchAll(SMACSS_STATE_CLASS)].map(
				([selector]) => `${file}: ${selector}`,
			);
		});

		expect(stylesheets.length).toBeGreaterThan(0);
		expect(violations).toEqual([]);
	});

	it("fuses every modifier onto a block that exists, so none is a bare descendant standing in for one", () => {
		expect(stylesGuide).toContain("rejects a modifier whose block appears nowhere");

		const classesIn = (source: string) => [...source.matchAll(ANY_CLASS_TOKEN)].map(([, name]) => name);
		const declared = new Set(stylesheets.flatMap((file) => classesIn(read(file))));

		for (const file of production(walk("src/ui")).filter((file) => SOURCE_FILE.test(file))) {
			for (const word of classesApplied(read(file))) declared.add(word);
		}

		const orphans = stylesheets.flatMap((file) =>
			[...new Set(classesIn(read(file)))]
				.filter((name) => name.includes("--") && !declared.has(name.slice(0, name.indexOf("--"))))
				.map((name) => `${file}: .${name}`),
		);

		expect(declared.size).toBeGreaterThan(0);
		expect(orphans).toEqual([]);
	});

	it("reads content through astro:content only, never Contentful or infrastructure", () => {
		expect(guide).toContain("never by calling Contentful or `@infrastructure` directly");

		const leaks = production(walk("src/ui"))
			.filter((file) => SOURCE_FILE.test(file))
			.filter((file) => LEAKED_INFRASTRUCTURE_IMPORT.test(read(file)));

		expect(leaks).toEqual([]);
	});

	it("dereferences through one module, on promises rather than Effect", () => {
		expect(guide).toContain("`getEntry` is called nowhere else under `src/ui` or `src/pages`");
		expect(guide).toContain("Nothing under `src/ui` imports `effect` at all");

		const resolver = read(DEREFERENCING_MODULE);

		expect(resolver).toContain("export async function resolveArticle(");
		expect(resolver).toContain("export async function resolveArticles(");

		const sources = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => SOURCE_FILE.test(file));

		expect(sources.filter((file) => file !== DEREFERENCING_MODULE && GET_ENTRY_CALL.test(read(file)))).toEqual([]);
		expect(sources.filter((file) => file.startsWith("src/ui/") && EFFECT_IMPORT.test(read(file)))).toEqual([]);
	});

	it("declares the Email button's hook once, where its template, its stylesheet and its listener all read it", () => {
		expect(guide).toContain("declared once, in that module");

		const hook = read(EMAIL_BUTTON_MODULE).match(EMAIL_BUTTON_HOOK_DECLARATION)?.[1];

		expect(hook).toBeDefined();
		expect(read(EMAIL_BUTTON_STYLESHEET)).toContain(`.${hook}`);

		const respelled = production([...walk("src/ui"), ...walk("src/pages")])
			.filter((file) => file !== EMAIL_BUTTON_MODULE && file !== EMAIL_BUTTON_STYLESHEET)
			.filter((file) => read(file).includes(hook ?? ""));

		expect(respelled).toEqual([]);
	});

	it("bootstraps the theme from the module that owns the preference, and paints without persisting", () => {
		expect(guide).toContain("Only a click on the toggle persists");
		expect(guide).toContain("`Head.astro` renders `THEME_BOOTSTRAP_SCRIPT` with `set:html`");

		const key = read("src/ui/modules/core/components/themeToggle/const.ts").match(THEME_KEY_DECLARATION)?.[1];
		const head = read("src/ui/modules/core/components/head/Head.astro");

		expect(key).toBeDefined();
		expect(head).toContain("set:html={THEME_BOOTSTRAP_SCRIPT}");
		expect(head).not.toContain(`"${key}"`);
		expect(read(THEME_PREFERENCE_MODULE)).toContain("THEME_BOOTSTRAP_SCRIPT");
		expect(THEME_PERSISTENCE.test(read(THEME_MODULE))).toBe(false);
	});

	it("keeps the address the base64 protects out of what the server renders", () => {
		expect(guide).toContain("never server-rendered");

		const templates = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => file.endsWith(".astro"));

		expect(templates.length).toBeGreaterThan(0);
		expect(templates.filter((file) => DECODED_EMAIL_ADDRESS.test(read(file)))).toEqual([]);
	});

	it("initialises every bundled script on astro:page-load, so a swapped-in body is still wired", () => {
		expect(guide).toContain("once per session");

		const templates = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => file.endsWith(".astro"));
		const bundled = templates.filter((file) => BUNDLED_SCRIPT.test(read(file)));

		expect(bundled.length).toBeGreaterThan(0);
		expect(bundled.filter((file) => !PAGE_LOAD_LISTENER.test(read(file)))).toEqual([]);
	});

	it("cites a container query that matches a container base.css declares and a stylesheet uses", () => {
		const cited = guide.match(CITED_CONTAINER_QUERY);

		expect(cited).not.toBeNull();
		expect(read("src/ui/styles/base/base.css")).toContain(`container: ${cited?.[1]} /`);
		expect(
			walk("src/ui/modules").filter((file) => file.endsWith(".css") && read(file).includes(cited?.[0] ?? "")),
		).not.toEqual([]);
	});

	it("names each component folder camelCase, the component PascalCase and the stylesheet kebab-case of both", () => {
		expect(guide).toContain("No folder deviates");

		const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
		const folders = new Map<string, string[]>();

		for (const file of walk("src/ui/modules")) {
			const folder = file.slice(0, file.lastIndexOf("/"));

			folders.set(folder, [...(folders.get(folder) ?? []), file.split("/").pop() ?? ""]);
		}

		const misnamed = [...folders].flatMap(([folder, names]) => {
			const components = names.filter((name) => COMPONENT_FILE.test(name));

			if (components.length === 0) return [];

			const own = folder.split("/").pop() ?? "";

			return [
				...(/^[a-z][A-Za-z\d]*$/.test(own) ? [] : [`${folder}: folder is not camelCase`]),
				...(components.some((name) => name.startsWith(own[0].toUpperCase() + own.slice(1)))
					? []
					: [`${folder}: no component named after the folder`]),
				...names
					.filter((name) => name.endsWith(".css") && name !== `${kebab(own)}.css`)
					.map((name) => `${folder}/${name}`),
			];
		});

		expect(folders.size).toBeGreaterThan(0);
		expect(misnamed).toEqual([]);
		expect(exists(STYLESHEET_OUTSIDE_A_COMPONENT_FOLDER)).toBe(true);
		expect(guide).toContain("the only shared stylesheet in the tree");
	});

	it("leaves component CSS unscoped and unlayered, which is what makes class names the only isolation", () => {
		expect(guide).toContain("the class names are the only isolation there is");
		expect(guide).toContain("Component stylesheets are unlayered");

		const components = production(walk("src/ui/modules")).filter((file) => file.endsWith(".astro"));

		expect(components.filter((file) => ASTRO_STYLE_BLOCK.test(read(file)))).toEqual([]);
		expect(walk("src/ui/modules").filter((file) => file.endsWith(".css") && read(file).includes("@layer"))).toEqual([]);
	});

	it("hydrates only the roots the Islands section censuses, and only with client:only", () => {
		const hydrated = production(walk("src/ui"))
			.filter((file) => SOURCE_FILE.test(file))
			.flatMap((file) =>
				[...read(file).matchAll(HYDRATION_DIRECTIVE)].map(([, name, directive, value]) => ({
					name,
					directive: `${directive}${value ? `="${value}"` : ""}`,
				})),
			);

		expect(hydrated.length).toBeGreaterThan(0);
		expect(hydrated.filter(({ directive }) => directive !== 'only="react"')).toEqual([]);
		expect(hydrated.map(({ name }) => name).sort()).toEqual(
			namesIn({ text: guide, pattern: ISLAND_ROOT_CENSUS }).sort(),
		);
	});

	it("names every React island under modules", () => {
		const islands = production(walk("src/ui/modules")).filter((file) => file.endsWith(".tsx"));
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

		expect(BIOME_JSON.formatter.lineWidth).toBe(Number(conventions.match(DOCUMENTED_LINE_WIDTH)?.[1]));
		expect(BIOME_JSON.linter.rules.suspicious.noConsole).toBe("error");
		expect(BIOME_JSON.assist.actions.source.organizeImports).toBe("on");
		expect(BIOME_JSON.files.includes).toContain("!**/src/data/**/*");
		expect(BIOME_JSON.files.includes).toContain("!**/public/**/*");
	});

	it("resolves the site origin in the one module the conventions name", () => {
		const conventions = section(CLAUDE_MD, "Conventions");

		expect(conventions).toContain("only reader of `SITE_URL`");
		expect(SOURCE_FILES.filter((file) => SITE_ORIGIN_READ.test(read(file)))).toEqual(["src/const/routes.ts"]);
		expect(SOURCE_FILES.filter((file) => ASTRO_SITE_READ.test(read(file)))).toEqual([]);
		expect(SOURCE_FILES.filter((file) => ASTRO_URL_ORIGIN_READ.test(read(file)))).toEqual([]);
	});

	it("sets the consent default before anything that reads it, which is the order ADR 0013 calls load-bearing", () => {
		const head = read("src/ui/modules/core/components/head/Head.astro");
		const gate = read("src/ui/modules/core/components/cookieConsent/utils/consentGate.ts");
		const adr = read("docs/adr/0013-analytics-gated-behind-cookie-consent.md");

		expect(adr).toContain("stays first");
		expect(gate).toContain("gtag('consent', 'default'");
		expect(head.indexOf("consentBootstrapScript")).toBeGreaterThan(-1);
		expect(head.indexOf("set:html={consentBootstrapScript(")).toBeLessThan(
			head.indexOf("googletagmanager.com/gtag/js"),
		);
		expect(head.indexOf("set:html={consentBootstrapScript(")).toBeLessThan(head.indexOf("googletagmanager.com/gtm.js"));
	});
});
