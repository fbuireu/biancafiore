import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NOINDEX_ROUTES } from "@const/noindexRoutes";
import ts from "typescript";
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

const HEX_COLOURS_AWAITING_A_TOKEN = ["src/ui/modules/about/components/worldGlobe/const.ts"];

const PLAIN_LOGGER_READERS = [
	"src/infrastructure/images/imagePlaceholder/imagePlaceholder.ts",
	"src/infrastructure/logging/service.ts",
	"src/pages/500.astro",
];

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
const NESTED_GUIDE_LINK = /\]\(\.\/(src\/[\w/-]*AGENTS\.md)\)/g;
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
const CLIENT_TABLE_ROW = /^\| `(\w+)` \| `(\w+)` \| \[?`([\w/.]+)`(?:\]\([^)]+\))? \|$/gm;
const TAGGED_ERROR_DECLARATION = /export class (\w+) extends Data\.TaggedError/g;
const MODULE_LEVEL_ENV_IMPORT = /^\s*import\s[^\n]*"astro:env\/server"/m;
const RECAPTCHA_SCORE_DECLARATION = /const RECAPTCHA_MINIMUM_SCORE = ([\d.]+);/;
const DRIZZLE_IMPORT = /from "drizzle-orm(\/[\w/]+)?"/;
const CAUGHT_SAVE_CONTACT = /saveContact\([^)]*\)\.pipe\(\s*Effect\.catchAll/;
const CONSOLE_CALL = /\bconsole(\.\w+|\[\w+\])\(/;
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
const DOMAIN_RULES_CENSUS = /`rules\.ts` exists for ([^;\n]+?) and no one else/;
const IMPURE_DTO_CODE = /astro:env|from "effect"|getEntries|getImagePlaceholder/;
const ASYNC_DTO_MAPPER = /export\s+(?:const|async\s+function)\s+create\w+/;
const DTO_INFRASTRUCTURE_IMPORT = /from "(@infrastructure\/[^"]+)"/g;
const CONTENTFUL_TYPE = /from "contentful"|@contentful\/|EntryFieldTypes|EntrySkeletonType/;
const HAND_PREFIXED_ASSET_URL = /`https:\$\{/;
const ABSOLUTE_IMAGE_URL_SCHEMA = /url:\s*z\.url\(\)/;
const ASSET_SCHEME_CONSTANT = /ASSET_SCHEME = "https:"/;
const CMS_LAYER_IMPORT = /import\s*\{[^}]*CmsClientLive[^}]*\}\s*from\s*"\.\/client"/;
const LOADER_FETCH_ENTRIES = /await fetchEntries</;
const CONTENTFUL_PAGE_CAP = /CONTENTFUL_MAX_PAGE_SIZE = (\d+)/;
const LOADER_REACHING_PAST_FETCH_ENTRIES = /from "effect"|isContentfulConfigured|CmsClient|concurrency:/;
const DOMAIN_SCHEMA_BINDING = /schema:\s*\w+Schema/;
const DOMAIN_IMPORT = /from "@domain\//;
const ASTRO_SITE_READ = /Astro\.site/;
const ASTRO_URL_ORIGIN_READ = /Astro\.url\.(?:href|origin)|origin: originPath/;
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
const UNLADDERED_FONT_SIZE_CENSUS = /neither on the ladder nor container-scaled, and they sit in ([^(\n]+)\(/;
const UNLADDERED_FONT_SIZE_PARENTHETICAL =
	/neither on the ladder nor container-scaled, and they sit in [^(\n]+\(([^)]*)\)/;
const BACKTICKED_LENGTH = /`(\d[\d.]*[a-z%]+)`/g;
const SECTION_TITLE_CENSUS = /a visual change to every component still on it, and those are ([^(\n]+)\(/;
const EDITORIAL_SECTION_TITLE_CONTAINER_CLAMP = /\.editorial-section-title \{[^}]*font-size:[^;]*cqi/;
const SEMANTIC_TOKEN_DECLARATION = /^\s+(--[a-z-]+): light-dark\(/gm;
const SEMANTIC_TOKEN_CENSUS = /they are exactly ([^.\n]+)\./;
const GRID_TOKEN_IN_QUERY = /@(?:container|media)[^{]*var\(--grid-/;
const REVEAL_MODIFIER_DECLARATION = /\.reveal--[a-z-]+[^{\n]*\{/g;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
const ANIMATION_TIMELINE_DECLARATION = /^animation-timeline\s*:/;
const SCROLL_DRIVEN_SUPPORTS = /^@supports\s*\(\s*animation-timeline\s*:/;
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
const ISLAND_ROOT_CENSUS = /only three hydration roots in the whole site: ([^\n]+?)\. Every one is/;
const DTO_CITED_DEFAULT = /`(\?\? [^`\n]+)`/g;
const CREATE_AUTHOR_DEFINITION = /export function createAuthor\(/;
const AUTHOR_FIELD_MAPPING = /\bsocialNetworks: [^;\n]+,$/m;
const BYLINE_FIELD_READ = /\bfields\.(?:jobTitle|currentCompany|profileImage|socialNetworks)\b/;
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
const EMAIL_BUTTON_MODULE = "src/ui/modules/core/components/emailButton/const.ts";
const EMAIL_BUTTON_STYLESHEET = "src/ui/modules/core/components/emailButton/email-button.css";
const EMAIL_BUTTON_HOOK_DECLARATION = /export const EMAIL_BUTTON_CLASS = "([\w-]+)" as const;/;
const PLACEHOLDER_MODULE = "src/infrastructure/images/imagePlaceholder/imagePlaceholder.ts";
const PER_ENTRY_PLACEHOLDER_AWAIT = /placeholder:\s*await/;
const BOUNDED_PLACEHOLDER_READ = /const PLACEHOLDER_CONCURRENCY = \d+;/;
const BUNDLED_SCRIPT = /^\s*<script\s*>/im;
const PAGE_LOAD_LISTENER = /addEventListener\(\s*["']astro:page-load["']/;
const THEME_MODULE = "src/ui/modules/core/components/themeToggle/utils/theme.ts";
const THEME_PREFERENCE_MODULE = "src/ui/modules/core/components/themeToggle/utils/preference.ts";
const THEME_KEY_DECLARATION = /export const THEME_STORAGE_KEY = "([\w-]+)" as const;/;
const THEME_PERSISTENCE = /localStorage\.setItem|store\.setItem/;
const DECODED_EMAIL_ADDRESS = /ENCODED_EMAIL_BIANCA/;
const IMAGE_SERVICE_SWITCH = /imageService: isProductionBuild \? "cloudflare" : "passthrough"/;
const HEAD_SAMPLING_RATE = /head_sampling_rate = ([\d.]+)/g;
const EXPORT_DESTINATION = /destinations = \["([^"]+)"\]/g;
const LOGGING_MODULE = "src/infrastructure/logging/logger.ts";
const LOGGING_CONTRACT = "src/infrastructure/logging/contract.ts";
const LOGGING_SERVICE = "src/infrastructure/logging/service.ts";
const TELEMETRY_MODULE = "src/ui/modules/core/utils/telemetry.ts";
const TAG_ORIGIN = /BETTER_STACK_TAG_ORIGIN = "([^"]+)"/;
const CONSENT_REVISION_DECLARATION = /CONSENT_REVISION = (\d+);/;
const BETTER_STACK_CREDENTIAL = /BETTER_STACK_[A-Z_]*(?:TOKEN|SECRET|KEY|INGESTING_URL|SOURCE)/g;
const OBSERVABILITY_TABLES = ["observability", "observability.logs", "observability.traces"];
const HTTPS_UPGRADE_DIRECTIVE = "upgrade-insecure-requests";
const CHROME_POLICY = "src/ui/modules/core/utils/siteChrome.ts";
const CHROME_ANSWER = /^\t(\w+): boolean;$/gm;
const ASTRO_FENCE = "---\n";
const ASTRO_FRONTMATTER = /^---\n([\s\S]*?)\n---/;
const ASTRO_SCRIPT = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
const TEMPLATE_COMMENT = /<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g;
const TOOL_DIRECTIVE = /^(?:\/\/\/\s*<reference\b|\/\/\s*(?:biome-ignore|@ts-expect-error)\b|\/\*\s*biome-ignore\b)/;
const IMPORT_SPECIFIER = /(?:\bfrom|\bimport|@import)\s*\(?\s*["']([^"']+)["']/g;
const MOCKED_MODULE =
	/\bvi\.(?:mock|doMock|unmock|importActual|importMock)\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\s*\(\s*["']([^"']+)["']/g;
const EFFECT_LOG = /\bEffect\.log\w*\(/;
const FETCH_REPLACED = /\bstubGlobal\(\s*["'`]fetch["'`]|\b(?:globalThis|window|global)\.fetch\s*=(?!=)/;
const PROCESS_ENV_WRITE = /\bprocess\.env(?:\.\w+|\[[^\]]+\])\s*=(?!=)|\bdelete\s+process\.env\b/;
const JSON_READ = /\.json\(\)|JSON\.parse\(/;
const CAST_JSON = /(?:\.json\(\)|JSON\.parse\([^;]*?\))\)?\s+as\s/;
const ZOD_SPECIFIER = /^zod(?:\/|$)/;
const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
const HAND_WRITTEN_MEMOISATION = /\buse(?:Memo|Callback)\(|\bmemo\(/;
const REACT_COMPILER = "react({ compiler: true })";
const TEARDOWN_HOOK = /\bafter(?:Each|All)\(/g;
const SETUP_HOOK = /\bbefore(?:Each|All)\(/g;
const LOCALE_COMPARE_CALL = /\.localeCompare\(/g;
const DOM_TEST_FILE = /\.test\.tsx$/;
const DOM_WRITE =
	/\bdocument\.(?:body|head)\.(?:innerHTML\s*=(?!=)|append(?:Child)?\(|prepend\(|insertAdjacent(?:HTML|Element)\()|\brender(?:Hook)?\(/;
const DOM_EMPTYING = /\bcleanup\b|\bdocument\.(?:body|head)\.(?:innerHTML\s*=\s*(?:""|''|``)|replaceChildren\(\s*\))/;
const STUB_RESTORES = [
	{ stub: /\bvi\.stubGlobal\(/, restore: "vi.unstubAllGlobals()" },
	{ stub: /\bvi\.stubEnv\(/, restore: "vi.unstubAllEnvs()" },
	{ stub: /\bvi\.spyOn\(/, restore: "vi.restoreAllMocks()" },
	{ stub: /\bvi\.useFakeTimers\(/, restore: "vi.useRealTimers()" },
];
const REAL_CLOCK_YEAR = /new Date\(\)\.get(?:UTC)?FullYear\(\)/;
const CLOCK_BRACKET = /\bconst\s+(?:before|after)\w*\s*=\s*(?:Math\.floor\()?Date\.now\(\)/;
const EXPORTED_SCHEMA = /^export const (\w+Schema)\b/gm;
const UPPERCASE = /^[A-Z]$/;
const IN_PLACE_REORDER = /\.(?:sort|reverse|splice)\(/;
const LOCAL_TIME_DATE_API =
	/\.(?:get|set)(?:FullYear|Month|Date|Day|Hours|Minutes|Seconds|Milliseconds)\(|\.getTimezoneOffset\(|\.toLocale(?:Date|Time)?String\(/;
const CONTENT_PATH_LITERAL = /["'`]\/(?:articles|tags|projects)\//;
const JOINED_ROUTE =
	/\$\{PAGES_ROUTES(?:\.[A-Z_]+|\[[^\]]+\])\}(?:\/|#|\$\{)|PAGES_ROUTES(?:\.[A-Z_]+|\[[^\]]+\])\s*\+/;
const PLAIN_LOGGER_IMPORT =
	/import\s*\{[^}]*\blogger\b[^}]*\}\s*from\s*"(?:@infrastructure\/logging|\.|(?:\.\.\/)+logging)\/logger"/;
const BARREL_FILE = /\/index\.tsx?$/;
const REGISTERED_PROPERTY = /@property\s+(--[\w-]+)/g;
const REGISTERED_COLOUR = /@property\s+--[\w-]+\s*\{[^}]*syntax:\s*["']<color>["']/;
const HEX_COLOUR = /(?<![\w&])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1,5})?(?![\w-])/;
const SIBLING_COUNTING_PROPERTY = /(--[\w-]+)\s*:[^;{}]*sibling-(?:index|count)\(\)/g;
const PASS_WITH_NO_TESTS = "--pass-with-no-tests";
const SHELL_SUBSTITUTION = /\$\(|`/;
const COVERAGE_EXCLUDE = /coverage: \{[\s\S]*?exclude: \[([\s\S]*?)\]/;
const QUOTED_GLOB = /"([^"]+)"/g;
const GLOB_TOKEN = /\*\*\/|\*\*|\*|\{[^}]*\}|[.+?^$()|[\]\\]/g;
const MERMAID_DIAGRAM = /```mermaid\n([\s\S]*?)```/g;
const MERMAID_FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const DAGRE_LAYOUT = /^\s+layout: dagre$/m;

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

const wranglerTable = (table: string): string => {
	const heading = `\n[${table}]\n`;
	const opens = WRANGLER_TOML.indexOf(heading);

	if (opens === -1) return "";

	const body = WRANGLER_TOML.slice(opens + heading.length);
	const closes = body.indexOf("\n[");

	return (closes === -1 ? body : body.slice(0, closes)).trim();
};

const stripFences = (markdown: string) => markdown.replace(ANY_FENCED_BLOCK, "");

const inlineCode = (markdown: string) => [...stripFences(markdown).matchAll(INLINE_CODE)].map(([, code]) => code);

const fences = (markdown: string) =>
	[...markdown.matchAll(FENCED_BLOCK)].map(([, language, body]) => ({ language, body }));

interface SectionParams {
	markdown: string;
	heading: string;
}

const section = ({ markdown, heading }: SectionParams) => {
	const lines = markdown.split("\n");
	const start = lines.findIndex((line) => line.startsWith(`## ${heading}`));

	if (start === -1) return "";

	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith("## "));

	return (end === -1 ? rest : rest.slice(0, end)).join("\n");
};

const AGENTS_MD = read("AGENTS.md");
const CONTEXT_MD = read("CONTEXT.md");
const PACKAGE_JSON = readJson("package.json");
const TSCONFIG = readJson("tsconfig.json");
const BIOME_JSON = readJson("biome.json");
const ASTRO_CONFIG = read("astro.config.ts");
const WRANGLER_TOML = read("wrangler.toml");

const IMPORT_META_ENV_READ = /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g;
const ENV_DTS_DECLARATION = /readonly ([A-Z][A-Z0-9_]*)/g;
const MODULE_SCOPE_SIDE_EFFECT = /^(?:\w[\w.]*\.addEventListener\(|(?:const|let)\s+\w+\s*=\s*window\.matchMedia\()/m;
const ON_DEMAND_ROUTES = ["src/pages/404.astro", "src/pages/500.astro", "src/pages/contact.astro"];
const ROBOTS_DISALLOW = /^Disallow: (.+)$/gm;
const ROBOTS_SITEMAP = /^Sitemap: (.+)$/gm;
const SITE_DECLARATION = /^\tsite: "([^"]+)",$/m;
const COLLECTION_FACTORY = "src/application/entities/collection.ts";
const IDENTIFY_CHOICE = /identify: \(\w+\) => \w+\.(\w+)/g;
const INLINE_IDENTITY = /\.\.\.\w+, id: \w+\.(\w+) \}/g;
const PINNED_RUNTIME = /^- (Node|pnpm)\b/;
const VERSIONS_HEADING = "Versions";
const QUOTED_VERSION = /\d+\.\d+/;
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;
const REPINNED_RUNTIME = /^\s*(?:node-version|version|ruby-version|wranglerVersion):\s*["']?\d/m;
const CITED_IDENTITY = /`(\w+)` → `(\w+)`/g;
const SPREAD_AFTER_ID = /\{\s*id:[^}]*\.\.\./;
const HYDRATION_DIRECTIVES_ALLOWED = new Set(['only="react"', "load"]);
const NEWLINE = "\n";
const SCHEMA_BOOLEAN_DEFAULT = /(\w+): z\.boolean\(\)\.default\(false\)/g;
const DEFAULTED_IN_THE_DTO_LAYER = (field: string) =>
	new RegExp(String.raw`\b${field}\s*[:=]\s*rawArticle\.fields\.${field} \?\? false`);
const CONTEXT_TAG_CLASS = /class\s+\w+\s+extends\s+Context\.Tag/;
const LAUNDERED_SECRET = /getSecret\([^)]*\)\s+as\s+string/;
const NESTED_GUIDES = walk("src").filter((file) => file.endsWith("AGENTS.md"));
const ADR_FILES = walk("docs").filter((file) => file.endsWith(".md") && file.startsWith("docs/adr/"));
const WIKI_FILES = walk("docs").filter((file) => file.endsWith(".md") && file.startsWith("docs/wiki/"));
const CODING_STANDARDS = "CODING_STANDARDS.md";
const GUIDES = ["AGENTS.md", "CONTEXT.md", CODING_STANDARDS, ...NESTED_GUIDES];
const DOCS = [...GUIDES, "docs/BACKLOG.md", ".github/CONTRIBUTING.md", ...ADR_FILES, ...WIKI_FILES];
const isWiki = (doc: string) => doc.startsWith("docs/wiki/");
const wikiPages = new Set(WIKI_FILES.map((file) => basename(file, ".md")));

const TEST_INFRASTRUCTURE = "src/tests/";

const production = (files: string[]) =>
	files.filter((file) => !CO_LOCATED_TEST_FILE.test(file) && !file.startsWith(TEST_INFRASTRUCTURE));

const SOURCE_FILES = production(walk("src").filter((file) => SOURCE_FILE.test(file)));

const classesApplied = (source: string) =>
	[...source.matchAll(CLASS_ATTRIBUTE)].flatMap(([, doubled, singled, braced]) =>
		[...(doubled ?? singled ?? braced ?? "").matchAll(CLASS_WORD)].map(([word]) => word),
	);

interface NamesInParams {
	text: string;
	pattern: RegExp;
}

const namesIn = ({ text, pattern }: NamesInParams) =>
	[...(text.match(pattern)?.[1] ?? "").matchAll(BACKTICKED_NAME)].map(([, name]) => name);

const classSpelling = (name: string) => new RegExp(String.raw`\.${name}(?![\w-])|["'\x60\s]${name}["'\x60\s]`);

const timelinesOutsideSupports = (stylesheet: string) => {
	const preludes: string[] = [];
	const unguarded: string[] = [];
	let statement = "";

	const settle = () => {
		const declaration = statement.trim();

		if (
			ANIMATION_TIMELINE_DECLARATION.test(declaration) &&
			!preludes.some((prelude) => SCROLL_DRIVEN_SUPPORTS.test(prelude))
		) {
			unguarded.push(declaration);
		}

		statement = "";
	};

	for (const character of stylesheet.replace(CSS_COMMENT, "")) {
		if (character === "{") {
			preludes.push(statement.trim());
			statement = "";
		} else if (character === "}") {
			settle();
			preludes.pop();
		} else if (character === ";") {
			settle();
		} else {
			statement += character;
		}
	}

	return unguarded;
};

const ALIAS_TARGETS = Object.entries(TSCONFIG.compilerOptions.paths as Record<string, string[]>).map(
	([alias, [target]]) =>
		[alias.replace(TRAILING_GLOB, ""), target.replace(LEADING_RELATIVE, "").replace(TRAILING_GLOB, "")] as const,
);

describe("the censuses this file reads", () => {
	it("reads a non-empty tree, since every empty-list assertion below passes over nothing", () => {
		const censuses = {
			PROJECT_FILES,
			SOURCE_FILES,
			HAND_WRITTEN_CODE,
			DOCS,
			NESTED_GUIDES,
			ADR_FILES,
			WIKI_FILES,
			YAML_FILES,
		};

		expect(Object.entries(censuses).filter(([, files]) => files.length === 0)).toEqual([]);
		expect(NESTED_GUIDES.length).toBeGreaterThan(1);
		expect(ADR_FILES.length).toBeGreaterThan(1);
	});
});

describe("commands", () => {
	const documentedScripts = fences(section({ markdown: AGENTS_MD, heading: "Commands" }))
		.flatMap(({ body }) => body.split("\n"))
		.flatMap((line) => line.match(DOCUMENTED_SCRIPT)?.[1] ?? []);

	it("documents only scripts that exist in package.json", () => {
		expect(documentedScripts.length).toBeGreaterThan(0);
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
	const aliasLine = AGENTS_MD.split("\n").find((line) => line.startsWith("Path aliases")) ?? "";
	const documentedAliases = [...aliasLine.matchAll(DOCUMENTED_ALIAS)].map(([, name, target]) => ({
		alias: `@${name}/`,
		target: target ?? `src/${name}`,
	}));

	const structureFence = fences(section({ markdown: AGENTS_MD, heading: "Structure & aliases" }))[0]?.body ?? "";

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
		expect(ALIAS_TARGETS.length).toBeGreaterThan(0);
		expect(ALIAS_TARGETS.filter(([, target]) => !isTracked(target.replace(TRAILING_SLASH, "")))).toEqual([]);
	});

	it("describes a folder tree that exists on disk", () => {
		expect(treeEntries.length).toBeGreaterThan(0);
		expect(treeEntries.filter((entry) => !isTracked(entry))).toEqual([]);
	});

	it("lists every populated folder under src and src/ui", () => {
		const populated = [
			...populatedDirectoriesIn("src").map((name) => `src/${name}`),
			...populatedDirectoriesIn("src/ui").map((name) => `src/ui/${name}`),
		];

		expect(populated.length).toBeGreaterThan(0);
		expect(populated.filter((directory) => !treeEntries.includes(directory))).toEqual([]);
	});

	it("lists every route under src/pages", () => {
		const documentedRoutes = (structureFence.match(DOCUMENTED_ROUTES_COMMENT)?.[1] ?? "")
			.split(",")
			.map((route) => route.trim())
			.map((route) => `src/pages/${FILE_EXTENSION.test(route) ? route : `${route}.astro`}`);

		const actualRoutes = walk("src/pages").filter(
			(file) => !file.split("/").pop()?.startsWith("_") && ROUTE_FILE.test(file),
		);

		expect(documentedRoutes.length).toBeGreaterThan(0);
		expect(actualRoutes.length).toBeGreaterThan(0);
		expect(documentedRoutes.filter((route) => !exists(route))).toEqual([]);
		expect(actualRoutes.filter((route) => !documentedRoutes.includes(route))).toEqual([]);
	});

	it("links a nested guide for every AGENTS.md under src", () => {
		const linked = [
			...section({ markdown: AGENTS_MD, heading: "Structure & aliases" }).matchAll(NESTED_GUIDE_LINK),
		].map(([, target]) => target);

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

interface DocumentedPath {
	doc: string;
	token: string;
}

describe("documented paths", () => {
	const documentedPaths: DocumentedPath[] = DOCS.flatMap((doc) =>
		inlineCode(read(doc))
			.filter((token) => DOCUMENTED_PATH_EXTENSIONS.some((extension) => token.endsWith(extension)))
			.filter((token) => !NOT_A_BARE_PATH.test(token) && !token.startsWith("node:"))
			.filter((token) => !DOCUMENTED_PATH_EXTENSIONS.includes(token))
			.filter((token) => !DOCUMENTED_PATH_EXAMPLES.has(token))
			.map((token) => ({ doc, token })),
	);

	const resolves = ({ doc, token }: DocumentedPath) => {
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

		expect(PATH_WITH_LINE_NUMBER.test("src/middleware.ts:12")).toBe(true);
		expect(citations).toEqual([]);
	});
});

describe("cross-document links", () => {
	it("resolves every relative markdown link", () => {
		const links = DOCS.filter((doc) => !isWiki(doc)).flatMap((doc) =>
			[...read(doc).matchAll(RELATIVE_MARKDOWN_LINK)]
				.map(([, target]) => target.split("#")[0])
				.filter((target) => target.length > 0 && !ABSOLUTE_URL.test(target))
				.map((target) => ({ doc, target: join(dirname(join(ROOT, doc)), target) })),
		);
		const broken = links
			.filter(({ target }) => !existsSync(target))
			.map(({ doc, target }) => `${doc}: ${toPosix(target.replace(ROOT, ""))}`);

		expect(links.length).toBeGreaterThan(0);
		expect(broken).toEqual([]);
	});
});

describe("the layer map the architecture ADR draws", () => {
	const importersOf = (alias: string) =>
		SOURCE_FILES.filter((file) =>
			[...read(file).matchAll(IMPORT_SOURCE)].some(([, source]) => source.startsWith(alias)),
		);

	it("is reached from outside only by content.config.ts, which is what makes astro:content the seam", () => {
		const outside = importersOf("@application/").filter((file) => !file.startsWith("src/application/"));

		expect(outside).toEqual(["src/content.config.ts"]);
	});

	it("draws no arrow from a page or a component to the application layer, because none exists", () => {
		const adr = read("docs/adr/0012-pragmatic-ddd-domain-layer-anti-corruption-layer.md");
		const drawn = [...adr.matchAll(/^\s{4}(\w+)\s*(?:\[[^\]]*\])?\s*-->\s*(\w+)/gm)].map(
			([, from, to]) => `${from}->${to}`,
		);

		expect(drawn).not.toContain("pages->application");
		expect(drawn).not.toContain("ui->application");
		expect(drawn).toContain("config->loaders");
	});

	it("draws every layer that reaches the domain, and the domain reaching none of them", () => {
		const reachingDomain = ["src/ui/", "src/pages/", "src/actions/", "src/application/", "src/infrastructure/"].filter(
			(folder) => importersOf("@domain/").some((file) => file.startsWith(folder)),
		);

		expect(reachingDomain).toHaveLength(5);
		expect(importersOf("@application/").filter((file) => file.startsWith("src/domain/"))).toEqual([]);
		expect(importersOf("@infrastructure/").filter((file) => file.startsWith("src/domain/"))).toEqual([]);
	});
});

describe("the published wiki", () => {
	it("publishes a Home page, which is the entry point the sync writes", () => {
		expect(WIKI_FILES).toContain("docs/wiki/Home.md");
		expect(wikiPages.size).toBeGreaterThan(1);
	});

	it("links only wiki pages that exist, since a wiki link is a page name and not a path", () => {
		const links = DOCS.filter(isWiki).flatMap((doc) =>
			[...read(doc).matchAll(RELATIVE_MARKDOWN_LINK)]
				.map(([, target]) => target.split("#")[0])
				.filter((target) => target.length > 0 && !ABSOLUTE_URL.test(target) && !target.includes("/"))
				.map((target) => ({ doc, target })),
		);

		expect(links.length).toBeGreaterThan(0);
		expect(links.filter(({ target }) => !wikiPages.has(target)).map(({ doc, target }) => `${doc}: ${target}`)).toEqual(
			[],
		);
	});

	it("never points a reader at a repository path, which a wiki page cannot resolve", () => {
		expect([..."[a](../README.md)".matchAll(RELATIVE_MARKDOWN_LINK)].length).toBe(1);

		const unreachable = DOCS.filter(isWiki).flatMap((doc) =>
			[...read(doc).matchAll(RELATIVE_MARKDOWN_LINK)]
				.map(([, target]) => target.split("#")[0])
				.filter((target) => target.startsWith("./") || target.startsWith("../"))
				.map((target) => `${doc}: ${target}`),
		);

		expect(unreachable).toEqual([]);
	});
});

describe("diagrams", () => {
	it("pins every Mermaid diagram to the dagre layout, so a renderer that defaults to ELK draws it as it was drawn", () => {
		const diagrams = DOCS.flatMap((doc) => [...read(doc).matchAll(MERMAID_DIAGRAM)].map(([, body]) => ({ doc, body })));
		const pinned = (body: string) => DAGRE_LAYOUT.test(body.match(MERMAID_FRONTMATTER)?.[1] ?? "");

		expect(pinned("---\nconfig:\n  look: handDrawn\n  layout: dagre\n---\nflowchart LR")).toBe(true);
		expect(pinned("flowchart LR\n  a --> b")).toBe(false);
		expect(diagrams.length).toBeGreaterThan(0);
		expect(diagrams.filter(({ body }) => !pinned(body)).map(({ doc }) => doc)).toEqual([]);
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

	it("is reachable: every ADR is linked from a guide or the coding standards, not only from other ADRs", () => {
		const linked = new Set(GUIDES.flatMap(referencesIn));

		expect(ADR_FILES.filter((file) => !linked.has(file.split("/").pop()?.slice(0, 4) ?? ""))).toEqual([]);
	});
});

describe("domain vocabulary", () => {
	const concepts = directoriesIn("src/domain");

	it("gives every domain concept a glossary entry in CONTEXT.md", () => {
		expect(concepts.length).toBeGreaterThan(CONCEPTS_OUTSIDE_THE_GLOSSARY.size);

		const missing = concepts
			.filter((concept) => !CONCEPTS_OUTSIDE_THE_GLOSSARY.has(concept))
			.filter((concept) => !CONTEXT_MD.includes(`**${concept[0].toUpperCase()}${concept.slice(1)}**`));

		expect(missing).toEqual([]);
	});

	it("names every domain concept in the domain guide", () => {
		const guide = read("src/domain/AGENTS.md");
		const named = (concept: string) => guide.includes(`\`${concept}\``) || guide.includes(`## ${concept}/`);

		expect(concepts.filter((concept) => !named(concept))).toEqual([]);
	});

	it("maps every application DTO onto a domain concept", () => {
		const dtos = directoriesIn("src/application/dto");

		expect(dtos.length).toBeGreaterThan(0);
		expect(dtos.filter((concept) => !concepts.includes(concept))).toEqual([]);
	});

	it("registers every entity loader as a content collection", () => {
		const contentConfig = read("src/content.config.ts");
		const entities = directoriesIn("src/application/entities");

		expect(entities.length).toBeGreaterThan(0);
		expect(entities.filter((entity) => !contentConfig.includes(entity))).toEqual([]);
	});
});

describe("infrastructure guide", () => {
	const guide = read("src/infrastructure/AGENTS.md");

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
			const built = source.includes(`const ${live} = Layer.effect`) || source.includes(`const ${live} = Layer.sync`);

			expect(`${file}: ${built}`).toBe(`${file}: true`);
		}

		const declared = SOURCE_FILES.filter((file) => CONTEXT_TAG_CLASS.test(read(file))).map((file) =>
			file.replace("src/infrastructure/", ""),
		);

		expect(declared.toSorted()).toEqual(rows.map(({ file }) => file).toSorted());
	});

	it("keeps the two runtimes it describes, and only those two", () => {
		expect(guide).toContain("ManagedRuntime");

		const managed = SOURCE_FILES.filter((file) => read(file).includes("ManagedRuntime.make("));
		const provided = SOURCE_FILES.filter((file) => read(file).includes("Effect.provide(ContactLayer)"));

		expect(managed).toEqual(["src/infrastructure/cms/entries.ts"]);
		expect(provided).toEqual(["src/actions/index.ts"]);
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
	const guide = read("src/ui/styles/AGENTS.md");
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
		expect(stylesheets.length).toBeGreaterThan(0);

		for (const { file, layer } of tabulated) {
			const match = stylesheets.filter((stylesheet) => stylesheet.endsWith(`/${file}`));

			expect(`${file}: ${match.length}`).toBe(`${file}: 1`);

			const opening = read(match[0]).trimStart().split("\n")[0];

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
		const guide = read("src/ui/modules/AGENTS.md");
		const features = directoriesIn("src/ui/modules");

		expect(features.length).toBeGreaterThan(0);
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
		expect(AGENTS_MD).toContain(HTTPS_UPGRADE_DIRECTIVE);
	});

	it("decides what HIDE_CHROME means in the one module the gotcha names, and reads it nowhere else", () => {
		const readers = SOURCE_FILES.filter((file) => read(file).includes("HIDE_CHROME"));

		expect(readers).toEqual([CHROME_POLICY]);
		expect(AGENTS_MD).toContain("`@modules/core/utils/siteChrome.ts`");
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
		const guide = read("src/ui/modules/AGENTS.md");

		expect(answers.length).toBeGreaterThan(0);
		expect(answers.filter((answer) => !guide.includes(`\`${answer}\``))).toEqual([]);
	});

	it("serves dist as assets from a Workers deploy bound to the documented domain", () => {
		expect(WRANGLER_TOML).toContain('main = "@astrojs/cloudflare/entrypoints/server"');
		expect(WRANGLER_TOML).toContain('directory = "dist/client"');
		expect(WRANGLER_TOML).toContain('binding = "SESSION"');
		expect(WRANGLER_TOML).toContain('pattern = "biancafiore.me"');
	});
});

describe("observability", () => {
	const destinations = (stage: string) =>
		[...WRANGLER_TOML.matchAll(EXPORT_DESTINATION)].map(([, name]) => name).filter((name) => name.includes(stage));

	it("ships each stage into its own export destinations, which nothing else can check", () => {
		expect(AGENTS_MD).toContain("A destination belongs to the account, not to the Worker");

		const productionDestinations = destinations("production");
		const developmentDestinations = destinations("development");

		expect([...new Set(productionDestinations)]).toEqual([
			"biancafiore-web-production-logs",
			"biancafiore-web-production-traces",
		]);
		expect([...new Set(developmentDestinations)]).toEqual([
			"biancafiore-web-development-logs",
			"biancafiore-web-development-traces",
		]);
		expect(productionDestinations.filter((name) => developmentDestinations.includes(name))).toEqual([]);
	});

	it("mirrors production at the top level, so a bare deploy cannot reach the other stage's source", () => {
		expect(AGENTS_MD).toContain("The top level is production's twin");

		const blocks = (prefix: string) =>
			OBSERVABILITY_TABLES.map((table) => wranglerTable(`${prefix}${table}`)).join("|");

		expect(blocks("")).toBe(blocks("env.production."));
		expect(blocks("")).not.toBe(blocks("env.development."));
	});

	it("restates the same observability settings in every stage bar the destinations they point at", () => {
		const settings = (prefix: string) =>
			OBSERVABILITY_TABLES.map((table) => wranglerTable(`${prefix}${table}`).replace(EXPORT_DESTINATION, "")).join("|");

		expect(settings("env.production.")).toBe(settings("env.development."));
		expect(settings("env.production.")).toContain("redact_query_string = true");
	});

	it("samples nothing away, on the logs and the traces of every stage", () => {
		expect(AGENTS_MD).toContain("Sampling is `1`");
		expect([...WRANGLER_TOML.matchAll(HEAD_SAMPLING_RATE)].map(([, rate]) => rate)).toEqual(
			Array.from({ length: 6 }, () => "1"),
		);
	});

	it("keeps the export credential out of the tree, leaving the public tracking token as the only one named", () => {
		expect(AGENTS_MD).toContain("Rotating the log sink is a dashboard change");

		const named = [
			...ASTRO_CONFIG.matchAll(BETTER_STACK_CREDENTIAL),
			...read(".env.example").matchAll(BETTER_STACK_CREDENTIAL),
		]
			.concat(SOURCE_FILES.flatMap((file) => [...read(file).matchAll(BETTER_STACK_CREDENTIAL)]))
			.map(([name]) => name);

		expect(named.length).toBeGreaterThan(0);
		expect([...new Set(named)]).toEqual(["BETTER_STACK_TRACKING_TOKEN"]);
	});

	it("writes the line through console, and exempts exactly the one file that does", () => {
		const exempt = BIOME_JSON.overrides
			.filter(
				({ linter }: { linter?: { rules?: { suspicious?: { noConsole?: string } } } }) =>
					linter?.rules?.suspicious?.noConsole === "off",
			)
			.flatMap(({ includes }: { includes: string[] }) => includes);

		expect(exempt).toEqual([`**/${LOGGING_MODULE}`]);
		expect(SOURCE_FILES.filter((file) => CONSOLE_CALL.test(read(file)))).toEqual([LOGGING_MODULE]);
	});

	it("spells the line the way the sibling repositories spell it, with the context spread first", () => {
		const logger = read(LOGGING_MODULE);

		expect(read(LOGGING_CONTRACT)).toContain('LOG_SERVICE = "biancafiore-web"');
		expect(logger).toContain(
			"console[level](JSON.stringify({ ...serializable(redacted(context)), service: LOG_SERVICE, level, message }));",
		);
	});

	it("resolves the tag to the very object plain code imports, so the two cannot disagree", () => {
		const guide = read("src/infrastructure/AGENTS.md");

		expect(guide).toContain("the tag and the import cannot disagree");
		expect(read(LOGGING_SERVICE)).toContain("Layer.sync(LoggerService, () => logger)");
		expect(read("src/infrastructure/layers.ts")).toContain("LoggerServiceLive");
	});

	it("carries LoggerService in R wherever a program logs, which is what the annotation turns into a signal", () => {
		const guide = read("src/infrastructure/AGENTS.md");
		const logging = SOURCE_FILES.filter(
			(file) => file !== LOGGING_SERVICE && read(file).includes("yield* LoggerService"),
		);

		expect(guide).toContain("carries `LoggerService` in its `R`");
		expect(logging.length).toBeGreaterThan(0);
		expect(logging.filter((file) => !read(file).includes("LoggerService> =>"))).toEqual([]);
	});

	it("gates the Better Stack tag by withholding it, since it has no consent mode of its own", () => {
		const adr = read("docs/adr/0013-analytics-gated-behind-cookie-consent.md");
		const preferences = read("src/ui/modules/core/components/cookieConsent/utils/preferences.ts");
		const config = read("src/ui/modules/core/components/cookieConsent/config.ts");

		expect(adr).toContain("gated by not existing");
		expect(preferences).toContain("acceptedService(BETTER_STACK_SERVICE, ANALYTICS_CATEGORY)");
		expect(config).toContain("onConsent: () => updatePreferences()");
		expect(config).toContain("[BETTER_STACK_SERVICE]:");
	});

	it("declares a consent revision, since a stale cookie hides a service that did not exist when it was written", () => {
		const gate = read("src/ui/modules/core/components/cookieConsent/utils/consentGate.ts");
		const revision = Number(CONSENT_REVISION_DECLARATION.exec(gate)?.[1]);

		expect(read("docs/adr/0013-analytics-gated-behind-cookie-consent.md")).toContain(
			"Adding a service to a category is a `revision` bump",
		);
		expect(revision).toBeGreaterThan(0);
		expect(read("src/ui/modules/core/components/cookieConsent/config.ts")).toContain("revision: CONSENT_REVISION,");
	});

	it("tells the shared RUM source which stage it is, since one source serves both", () => {
		const telemetry = read(TELEMETRY_MODULE);

		expect(AGENTS_MD).toContain("is a **repository** variable");
		expect(read("docs/adr/0013-analytics-gated-behind-cookie-consent.md")).toContain(
			"One Better Stack source serves both stages",
		);
		expect(telemetry).toContain('"init", { environment: trackingEnvironmentFor(window.location.hostname) }');
		expect(telemetry).toContain(".workers.dev");
	});

	it("lets the edge-injected beacon through the CSP, since nothing in the tree can gate it", () => {
		const headers = read("src/const/securityHeaders.ts");

		expect(AGENTS_MD).toContain("Cloudflare Web Analytics is the exception and nothing here can gate it");
		expect(read("docs/adr/0013-analytics-gated-behind-cookie-consent.md")).toContain("the stated exception");
		expect(headers).toContain("https://static.cloudflareinsights.com");
		expect(read("src/pages/privacy-policy.astro")).toContain("Cloudflare Web Analytics");
	});

	it("lets the tag through the CSP it would otherwise be blocked by", () => {
		const headers = read("src/const/securityHeaders.ts");
		const origin = TAG_ORIGIN.exec(read(TELEMETRY_MODULE))?.[1];

		expect(origin).toBeTruthy();
		expect(headers.match(new RegExp(origin ?? "", "g"))).toHaveLength(2);
	});

	it("keeps the public tracking token apart from the export credential that never enters the tree", () => {
		expect(AGENTS_MD).toContain("is not the credential the log export uses");
		expect(ASTRO_CONFIG).toContain("BETTER_STACK_TRACKING_TOKEN: envField.string({");
		expect(read(".github/workflows/_deploy.yml")).toContain("BETTER_STACK_TRACKING_TOKEN: ${{ vars.");
	});

	it("reports an unhandled render error from the page Astro shows for one", () => {
		expect(read("src/pages/500.astro")).toContain('logger.logError({ message: "Unhandled server error"');
	});
});

describe("infrastructure guide: secrets, errors and clients", () => {
	const guide = read("src/infrastructure/AGENTS.md");
	const infrastructureFiles = production(walk("src/infrastructure").filter((file) => TYPESCRIPT_FILE.test(file)));

	it("reads astro:env/server lazily, inside the layer, and never as a module import", () => {
		expect(guide).toContain("Never import `astro:env/server` at module top level");

		const readers = SOURCE_FILES.filter((file) => read(file).includes("astro:env/server"));

		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => !read(file).includes('import("astro:env/server")'))).toEqual([]);
		expect(readers.filter((file) => MODULE_LEVEL_ENV_IMPORT.test(read(file)))).toEqual([]);
	});

	it("dies on irrecoverable misconfiguration rather than failing typed, in every layer that reads a secret", () => {
		expect(guide).toContain("`Effect.die` (see `DatabaseLive`)");

		const secretReaders = infrastructureFiles
			.filter((file) => read(file).includes("Layer.effect("))
			.filter((file) => read(file).includes("getSecret("));

		expect(secretReaders.length).toBeGreaterThan(1);
		expect(secretReaders.filter((file) => !read(file).includes("Effect.die("))).toEqual([]);
		expect(secretReaders.filter((file) => LAUNDERED_SECRET.test(read(file)))).toEqual([]);
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
		expect(infrastructureFiles.length).toBeGreaterThan(0);
		expect(infrastructureFiles.filter((file) => read(file).includes("ActionError"))).toEqual([]);
	});

	it("keeps the query builder inside the layer the tag hides it behind", () => {
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
	const guide = read("src/actions/AGENTS.md");
	const action = read("src/actions/index.ts");
	const program = read("src/actions/contact.ts");
	const mapping = read("src/actions/errorResponse.ts");

	it("logs a failed saveContact instead of failing the request", () => {
		expect(guide).toContain("A failed `saveContact` is logged, not raised");
		expect(program).toMatch(CAUGHT_SAVE_CONTACT);
	});

	it("logs through the LoggerService tag rather than console, here and everywhere in src", () => {
		expect(`${program}${mapping}`).toContain("yield* LoggerService");
		expect(SOURCE_FILES.filter((file) => CONSOLE_CALL.test(read(file)))).toEqual([LOGGING_MODULE]);
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
	const guide = read("src/domain/AGENTS.md");
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
		expect(domainFiles.length).toBeGreaterThan(0);
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
	const guide = read("src/application/AGENTS.md");
	const dtoFiles = production(walk("src/application/dto").filter((file) => TYPESCRIPT_FILE.test(file)));
	const loaders = directoriesIn("src/application/entities").map(
		(entity) => `src/application/entities/${entity}/${entity}.ts`,
	);
	const loaderSteps = [
		...loaders,
		...production(
			readdirSync(join(ROOT, "src/application/entities")).map((name) => `src/application/entities/${name}`),
		).filter((file) => TYPESCRIPT_FILE.test(file)),
	];

	it("keeps DTOs free of I/O, Effect and env access", () => {
		expect(guide).toContain("DTOs are pure on purpose");
		expect(dtoFiles.length).toBeGreaterThan(0);
		expect(dtoFiles.filter((file) => IMPURE_DTO_CODE.test(read(file)))).toEqual([]);
	});

	it("leaves the placeholder fan-out to the module that owns it, never to a loader", () => {
		expect(loaderSteps.length).toBeGreaterThan(loaders.length);
		expect(loaderSteps.filter((file) => PER_ENTRY_PLACEHOLDER_AWAIT.test(read(file)))).toEqual([]);
		expect(read(PLACEHOLDER_MODULE)).toMatch(BOUNDED_PLACEHOLDER_READ);
	});

	it("applies every optional-field default it cites, so the domain DTO stays total", () => {
		const cited = [...new Set([...guide.matchAll(DTO_CITED_DEFAULT)].map(([, fallback]) => fallback))];
		const dtoLayer = dtoFiles.map((file) => read(file)).join(NEWLINE);
		const defaulted = walk("src/domain")
			.filter((file) => file.endsWith("schema.ts"))
			.flatMap((file) => [...read(file).matchAll(SCHEMA_BOOLEAN_DEFAULT)].map(([, field]) => field));

		expect(cited.length).toBeGreaterThan(0);
		expect(cited.filter((fallback) => !dtoLayer.includes(fallback))).toEqual([]);

		expect(defaulted.length).toBeGreaterThan(0);
		expect(defaulted.filter((field) => !DEFAULTED_IN_THE_DTO_LAYER(field).test(dtoLayer))).toEqual([]);
	});

	it("turns a raw author into Byline fields in createAuthor alone, the one module the guide names", () => {
		const definitions = dtoFiles.filter((file) => CREATE_AUTHOR_DEFINITION.test(read(file)));

		expect(guide).toContain("`createAuthor` in [`dto/author/utils/author.ts`]");
		expect(definitions).toEqual(["src/application/dto/author/utils/author.ts"]);
		expect(dtoFiles.filter((file) => AUTHOR_FIELD_MAPPING.test(read(file)))).toEqual(definitions);
		expect(dtoFiles.filter((file) => BYLINE_FIELD_READ.test(read(file)))).toEqual(definitions);
	});

	it("addresses an Article from the one module the guide names, the collection id included", () => {
		const builders = dtoFiles.filter((file) => ARTICLE_REFERENCE_LITERAL.test(read(file)));

		expect(builders).toEqual(["src/application/dto/article/utils/reference.ts"]);
		expect(read("src/application/dto/article/articleDTO.ts")).toMatch(NORMALISED_ARTICLE_SLUG);
	});

	it("decides Related Articles in the one module the guide names, on the slug and with the cap it quotes", () => {
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
		expect(guide).toContain("Every `create` is synchronous");
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

		const readers = production([...walk("src/pages"), ...walk("src/ui")]).filter((file) => SOURCE_FILE.test(file));

		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => HAND_PREFIXED_ASSET_URL.test(read(file)))).toEqual([]);
	});

	it("stops Contentful types at this layer: nothing downstream sees them", () => {
		expect(guide).toContain("Contentful types stop here");

		const downstream = production([...walk("src/domain"), ...walk("src/ui")]).filter((file) => SOURCE_FILE.test(file));

		expect(downstream.length).toBeGreaterThan(0);
		expect(downstream.filter((file) => CONTENTFUL_TYPE.test(read(file)))).toEqual([]);
	});

	it("fetches through fetchEntries, and takes its schema from the domain", () => {
		expect(loaders.length).toBeGreaterThan(0);
		expect(guide).toContain("`fetchEntries<[Skeleton, …]>(query, …)`");

		const broken = loaders.filter((file) => {
			const source = read(file);
			const fetches = LOADER_FETCH_ENTRIES.test(source) || source.includes("cmsCollection");

			return !fetches || !DOMAIN_SCHEMA_BINDING.test(source) || !DOMAIN_IMPORT.test(source);
		});

		expect(broken).toEqual([]);
		expect(read(COLLECTION_FACTORY)).toMatch(LOADER_FETCH_ENTRIES);
	});

	it("leaves the credential bail, the batching and Effect itself to that one interface", () => {
		expect(guide).toContain("no Effect, no `CmsClient`, no runtime, and no credential guard");

		const entries = read("src/infrastructure/cms/entries.ts");

		expect(entries).toContain("if (!isContentfulConfigured())");
		expect(entries).toContain('{ concurrency: "unbounded" }');
		expect(loaderSteps.length).toBeGreaterThan(loaders.length);
		expect(loaderSteps.filter((file) => LOADER_REACHING_PAST_FETCH_ENTRIES.test(read(file)))).toEqual([]);
	});

	it("cites the id every loader assigns, and spreads before it rather than after", () => {
		const step = guide.split(NEWLINE).find((line) => line.includes("return entries carrying an `id`")) ?? "";
		const identities = loaders.map((file) => {
			const source = read(file);

			return {
				file,
				fields: [
					...[...source.matchAll(IDENTIFY_CHOICE)].map(([, field]) => field),
					...[...source.matchAll(INLINE_IDENTITY)].map(([, field]) => field),
				],
			};
		});
		const assigned = identities
			.map(({ file, fields }) => `${file.split("/").at(-2)} → ${[...new Set(fields)].join(", ")}`)
			.sort();
		const cited = [...step.matchAll(CITED_IDENTITY)].map(([, collection, field]) => `${collection} → ${field}`).sort();

		expect(assigned.length).toBeGreaterThan(0);
		expect(identities.filter(({ fields }) => fields.length === 0).map(({ file }) => file)).toEqual([]);
		expect(cited).toEqual(assigned);

		expect(read(COLLECTION_FACTORY)).toContain("...entry, id: identify(entry)");
		expect([...loaders, COLLECTION_FACTORY].filter((file) => SPREAD_AFTER_ID.test(read(file)))).toEqual([]);
	});
});

describe("styles guide: derived constants and source order", () => {
	const guide = read("src/ui/styles/AGENTS.md");

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

	it("pins which module font sizes escape the ladder, so the drift can only shrink", () => {
		const declarations = walk("src/ui/modules")
			.filter((file) => file.endsWith(".css"))
			.flatMap((file) => [...read(file).matchAll(MODULE_FONT_SIZE)].map(([, value]) => ({ file, value })));
		const unladdered = declarations.filter(({ value }) => !value.includes("var(--font-size") && !value.includes("cqi"));
		const censused = namesIn({ text: guide, pattern: UNLADDERED_FONT_SIZE_CENSUS });
		const censusedValues = [
			...(guide.match(UNLADDERED_FONT_SIZE_PARENTHETICAL)?.[1] ?? "").matchAll(BACKTICKED_LENGTH),
		].map(([, value]) => value);

		expect(declarations.length).toBeGreaterThan(0);
		expect(unladdered.map(({ value }) => value.trim()).sort()).toEqual(censusedValues.sort());
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

		const stylesheets = walk("src/ui").filter((file) => file.endsWith(".css"));

		expect(stylesheets.length).toBeGreaterThan(0);
		expect(stylesheets.filter((file) => GRID_TOKEN_IN_QUERY.test(read(file)))).toEqual([]);
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

	it("scrolls an animation only inside @supports, since without the feature it holds its last frame", () => {
		expect(guide).toContain("runs in zero seconds and holds its last frame");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const unguarded = stylesheets.flatMap((file) =>
			timelinesOutsideSupports(read(file)).map((declaration) => `${file}: ${declaration}`),
		);

		expect(
			timelinesOutsideSupports("@supports (animation-timeline: view()) { .a { animation-timeline: view(); } }"),
		).toEqual([]);
		expect(
			timelinesOutsideSupports("@supports not (animation-timeline: view()) { .a { animation-timeline: view() } }"),
		).toEqual(["animation-timeline: view()"]);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect(unguarded).toEqual([]);
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
		expect(read("src/ui/modules/core/utils/page.ts")).toContain("isWithin({ pathname: url.pathname");
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
		const declaring = [...walk("src/ui"), ...walk("src/pages")]
			.filter((file) => file.endsWith(".css"))
			.filter((file) => LAYER_ORDER_DECLARATION.test(read(file)));

		expect(guide).toContain("no file re-declares the order");
		expect(declaring).toEqual(["src/ui/styles/index.css"]);
	});
});

describe("modules guide: mixes, islands and data access", () => {
	const guide = read("src/ui/modules/AGENTS.md");
	const stylesGuide = read("src/ui/styles/AGENTS.md");

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

		const components = production(walk("src/ui")).filter((file) => SOURCE_FILE.test(file));

		expect(components.length).toBeGreaterThan(0);
		expect(components.filter((file) => LEAKED_INFRASTRUCTURE_IMPORT.test(read(file)))).toEqual([]);
	});

	it("dereferences through one module, on promises rather than Effect", () => {
		expect(guide).toContain("`getEntry` is called nowhere else under `src/ui` or `src/pages`");
		expect(guide).toContain("nothing under `src/ui` imports `effect` at all");

		const resolver = read(DEREFERENCING_MODULE);

		expect(resolver).toContain("export async function resolveArticle(");
		expect(resolver).toContain("export async function resolveArticles(");

		const sources = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => SOURCE_FILE.test(file));

		expect(sources.length).toBeGreaterThan(0);
		expect(sources.filter((file) => file !== DEREFERENCING_MODULE && GET_ENTRY_CALL.test(read(file)))).toEqual([]);
		expect(sources.filter((file) => file.startsWith("src/ui/") && EFFECT_IMPORT.test(read(file)))).toEqual([]);
	});

	it("declares the Email button's hook once, where its template, its stylesheet and its listener all read it", () => {
		expect(guide).toContain("declared once, in that module");

		const hook = read(EMAIL_BUTTON_MODULE).match(EMAIL_BUTTON_HOOK_DECLARATION)?.[1] ?? "";
		const spelling = classSpelling(hook);
		const candidates = production([...walk("src/ui"), ...walk("src/pages")]).filter(
			(file) => file !== EMAIL_BUTTON_MODULE && file !== EMAIL_BUTTON_STYLESHEET,
		);

		expect(hook).not.toBe("");
		expect(spelling.test(read(EMAIL_BUTTON_STYLESHEET))).toBe(true);
		expect(spelling.test(`<a class="x ${hook}">`)).toBe(true);
		expect(spelling.test(`import "./${hook}.css";`)).toBe(false);
		expect(candidates.length).toBeGreaterThan(0);
		expect(candidates.filter((file) => spelling.test(read(file)))).toEqual([]);
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
		expect(guide).toContain("no folder deviates");

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
		const stylesheets = walk("src/ui/modules").filter((file) => file.endsWith(".css"));

		expect(components.length).toBeGreaterThan(0);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect(components.filter((file) => ASTRO_STYLE_BLOCK.test(read(file)))).toEqual([]);
		expect(stylesheets.filter((file) => read(file).includes("@layer"))).toEqual([]);
	});

	it("hydrates only the roots the Islands section censuses, and server-renders every root that can survive it", () => {
		const hydrated = production([...walk("src/ui"), ...walk("src/pages")])
			.filter((file) => SOURCE_FILE.test(file))
			.flatMap((file) =>
				[...read(file).matchAll(HYDRATION_DIRECTIVE)].map(([, name, directive, value]) => ({
					name,
					directive: `${directive}${value ? `="${value}"` : ""}`,
				})),
			);

		expect(hydrated.length).toBeGreaterThan(0);
		expect(hydrated.filter(({ directive }) => !HYDRATION_DIRECTIVES_ALLOWED.has(directive))).toEqual([]);
		expect(
			hydrated
				.filter(({ directive }) => directive === "load")
				.map(({ name }) => name)
				.sort(),
		).toEqual(["ContactFormProvider", "WorldGlobe"]);
		expect(hydrated.map(({ name }) => name).sort()).toEqual(
			namesIn({ text: guide, pattern: ISLAND_ROOT_CENSUS }).sort(),
		);
	});

	it("names every React island under modules", () => {
		const islands = production(walk("src/ui/modules")).filter((file) => file.endsWith(".tsx"));
		const documented = section({ markdown: guide, heading: "Islands" });

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

const FUNCTION_SIGNATURE = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/g;
const ARROW_SIGNATURE =
	/(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*(?::[^=]*)?=\s*(?:useCallback\(\s*)?(?:async\s*)?\(([^)]*)\)\s*(?::[^=]*)?=>/g;
const DESTRUCTURED_PARAMETER =
	/(?:function\s+(\w+)\s*(?:<[^>()]*>)?|(?:const|let)\s+(\w+)\s*(?::[^=]*)?=\s*(?:useCallback\(\s*)?(?:async\s*)?(?:<[^>()]*>)?)\s*\(\s*\{[^{}]*\}\s*:\s*(\{|[A-Z]\w*)/g;
const INLINE_TYPE = "{";
const OPENING = "(";
const PARAMETER_OBJECT_SUFFIX = "Params";
const DECLARED_PARAMS_TYPE = /^\s*(?:export\s+)?(?:interface|type)\s+(\w+Params)\b/gm;
const MISNAMED_PARAMETER_OBJECT = /(?:Options|Opts|Args|Arguments)$/;
const TRAILING_COMMA = /,\s*$/;

const HAND_WRITTEN_CODE = [
	...readdirSync(ROOT).filter((name) => TYPESCRIPT_FILE.test(name)),
	...walk("src").filter((file) => SOURCE_FILE.test(file)),
	...walk("e2e").filter((file) => TYPESCRIPT_FILE.test(file)),
	...walk("docs").filter((file) => TYPESCRIPT_FILE.test(file)),
];

const paramsTypeFor = (name: string) => `${name[0].toUpperCase()}${name.slice(1)}${PARAMETER_OBJECT_SUFFIX}`;

const positionalSignatures = (source: string) =>
	[...source.matchAll(FUNCTION_SIGNATURE), ...source.matchAll(ARROW_SIGNATURE)]
		.map(([, name, parameters]) => ({ name, parameters: (parameters ?? "").trim().replace(TRAILING_COMMA, "") }))
		.filter(({ parameters }) => parameters.length > 0 && !parameters.startsWith("{"))
		.filter(({ parameters }) => topLevelArity(parameters) > 1)
		.map(({ name }) => name);

interface CodeSource {
	file: string;
	source: string;
}

const parameterObjects = (source: string) =>
	[...source.matchAll(DESTRUCTURED_PARAMETER)].map(([, declared, assigned, type]) => ({
		name: declared ?? assigned,
		type,
	}));

const declaredFunctions = (source: string) => [
	...[...source.matchAll(FUNCTION_SIGNATURE), ...source.matchAll(ARROW_SIGNATURE)].map(([, name]) => name),
	...parameterObjects(source).map(({ name }) => name),
];

const countOf = (names: string[]) =>
	names.reduce((counts, name) => counts.set(name, (counts.get(name) ?? 0) + 1), new Map<string, number>());

const roleTypes = (sources: CodeSource[]) => {
	const takers = countOf(sources.flatMap(({ source }) => parameterObjects(source).map(({ type }) => type)));
	const declarations = countOf(
		sources.flatMap(({ source }) => [...source.matchAll(DECLARED_PARAMS_TYPE)].map(([, type]) => type)),
	);
	const functionNamed = new Set(sources.flatMap(({ source }) => declaredFunctions(source).map(paramsTypeFor)));

	return new Set(
		[...takers]
			.filter(([type, taken]) => taken > 1 && declarations.get(type) === 1 && !functionNamed.has(type))
			.map(([type]) => type),
	);
};

const misnamedParameterObjects = (sources: CodeSource[]) => {
	const roles = roleTypes(sources);

	return sources.flatMap(({ file, source }) =>
		parameterObjects(source)
			.filter(
				({ name, type }) =>
					type === INLINE_TYPE ||
					MISNAMED_PARAMETER_OBJECT.test(type) ||
					(type.endsWith(PARAMETER_OBJECT_SUFFIX) && type !== paramsTypeFor(name) && !roles.has(type)),
			)
			.map(({ name, type }) => `${file}: ${name} takes ${type === INLINE_TYPE ? "an inline type" : type}`),
	);
};

function topLevelArity(parameters: string): number {
	let depth = 0;
	let arity = 1;

	for (const character of parameters) {
		if ("<([{".includes(character)) depth += 1;
		else if (">)]}".includes(character)) depth -= 1;
		else if (character === "," && depth === 0) arity += 1;
	}

	return arity;
}

describe("conventions", () => {
	it("configures Biome the way the conventions claim", () => {
		const conventions = section({ markdown: AGENTS_MD, heading: "Conventions" });

		expect(BIOME_JSON.formatter.lineWidth).toBe(Number(conventions.match(DOCUMENTED_LINE_WIDTH)?.[1]));
		expect(BIOME_JSON.linter.rules.suspicious.noConsole).toBe("error");
		expect(BIOME_JSON.assist.actions.source.organizeImports).toBe("on");
		expect(BIOME_JSON.files.includes).toContain("!**/public/**/*");
	});

	it("types exactly the variables something reads through import.meta.env, and no others", () => {
		const consumed = new Set(
			[...walk("src"), "astro.config.ts"]
				.filter((file) => SOURCE_FILE.test(file) || file === "astro.config.ts")
				.flatMap((file) => [...read(file).matchAll(IMPORT_META_ENV_READ)].map(([, name]) => name))
				.filter((name) => name !== "DEV"),
		);
		const declared = new Set([...read("src/env.d.ts").matchAll(ENV_DTS_DECLARATION)].map(([, name]) => name));

		expect(consumed.size).toBeGreaterThan(0);
		expect([...declared].filter((name) => !consumed.has(name)).toSorted()).toEqual([]);
		expect([...consumed].filter((name) => !declared.has(name)).toSorted()).toEqual([]);
	});

	it("registers no listener and reads no media query at module scope, as the modules guide claims", () => {
		const guide = read("src/ui/modules/AGENTS.md");

		expect(guide).toContain("Neither does the module it imports");

		const modules = production(walk("src/ui").filter((file) => TYPESCRIPT_FILE.test(file)));
		const offenders = modules.filter((file) => MODULE_SCOPE_SIDE_EFFECT.test(read(file)));

		expect(modules.length).toBeGreaterThan(0);
		expect(offenders).toEqual([]);
	});

	it("declares prerender on every page ADR 0011 says ships as static HTML", () => {
		const adr = read("docs/adr/0011-hybrid-rendering-prerender-content-ssr-dynamic.md");

		expect(adr).toContain("forgetting the flag is what silently makes it dynamic");

		const routes = walk("src/pages").filter((file) => ROUTE_FILE.test(file) && !basename(file).startsWith("_"));
		const dynamic = routes.filter((file) => !read(file).includes("export const prerender = true"));

		expect(routes.length).toBeGreaterThan(0);
		expect(dynamic.toSorted()).toEqual(ON_DEMAND_ROUTES.toSorted());
	});

	it("disallows the same routes in robots.txt that it keeps out of the sitemap", () => {
		const disallowed = [...read("public/robots.txt").matchAll(ROBOTS_DISALLOW)].map(([, route]) => route.trim());

		expect(disallowed.length).toBeGreaterThan(0);
		expect(disallowed.toSorted()).toEqual([...NOINDEX_ROUTES].toSorted());
	});

	it("points robots.txt at the sitemap index the site writes, which the smoke run leaves to this file", () => {
		const site = ASTRO_CONFIG.match(SITE_DECLARATION)?.[1];
		const sitemaps = [...read("public/robots.txt").matchAll(ROBOTS_SITEMAP)].map(([, url]) => url.trim());

		expect(site).toBeDefined();
		expect(ASTRO_CONFIG).toContain("sitemap(");
		expect(sitemaps).toEqual([`${site}/sitemap-index.xml`]);
	});

	it("passes two or more arguments as one object, in production code, the tests, e2e and this file alike", () => {
		const conventions = section({ markdown: AGENTS_MD, heading: "Conventions" });
		const positional = HAND_WRITTEN_CODE.flatMap((file) =>
			positionalSignatures(read(file)).map((name) => `${file}: ${name}`),
		);

		expect(conventions).toContain("One argument is positional; two or more are one object");
		expect(positionalSignatures(`const submit = useCallback(async ${OPENING}data, token) => data);`)).toEqual([
			"submit",
		]);
		expect(HAND_WRITTEN_CODE.filter((file) => file.startsWith("e2e/")).length).toBeGreaterThan(0);
		expect(HAND_WRITTEN_CODE.filter((file) => CO_LOCATED_TEST_FILE.test(file)).length).toBeGreaterThan(0);
		expect(positional).toEqual([]);
	});

	it("types a parameter object after the function that takes it, the role sibling functions share, or the record it unpacks, never inline", () => {
		const misnamed = misnamedParameterObjects(HAND_WRITTEN_CODE.map((file) => ({ file, source: read(file) })));
		const findingsIn = (source: string) => misnamedParameterObjects([{ file: "a.ts", source }]);
		const paged = "interface PagedParams { page: number }\n";
		const first = `const first = ${OPENING}{ page }: PagedParams) => page;\n`;
		const last = `const last = ${OPENING}{ page }: PagedParams) => page;\n`;

		expect(findingsIn(`function makeTag${OPENING}{ name }: MakeTagParams) {}`)).toEqual([]);
		expect(findingsIn(`const toRow = ${OPENING}{ id }: ContactRow) => id;`)).toEqual([]);
		expect(findingsIn(`const settle = async ${OPENING}{ page }: ThemeParams) => page;`)).toEqual([
			"a.ts: settle takes ThemeParams",
		]);
		expect(findingsIn(`function double${OPENING}{ url }: DoubleOptions) {}`)).toEqual([
			"a.ts: double takes DoubleOptions",
		]);
		expect(findingsIn(`const resolves = ${OPENING}{ doc }: { doc: string }) => doc;`)).toEqual([
			"a.ts: resolves takes an inline type",
		]);
		expect(findingsIn(`${paged}${first}${last}`)).toEqual([]);
		expect(findingsIn(`${paged}${first}`)).toEqual(["a.ts: first takes PagedParams"]);
		expect(findingsIn(`${paged}${first}${last}const paged = ${OPENING}{ page }: PagedParams) => page;\n`)).toEqual([
			"a.ts: first takes PagedParams",
			"a.ts: last takes PagedParams",
		]);
		expect(
			misnamedParameterObjects([
				{ file: "a.ts", source: `${paged}${first}` },
				{ file: "b.ts", source: `${paged}${last}` },
			]),
		).toEqual(["a.ts: first takes PagedParams", "b.ts: last takes PagedParams"]);
		expect(misnamed).toEqual([]);
	});

	it("resolves the site origin in the one module the conventions name", () => {
		const conventions = section({ markdown: AGENTS_MD, heading: "Conventions" });

		expect(conventions).toContain("only reader of `SITE_URL`");
		const readers = SOURCE_FILES.filter((file) => !file.endsWith(".d.ts")).filter((file) =>
			SITE_ORIGIN_READ.test(read(file)),
		);

		expect(readers).toEqual(["src/const/routes.ts"]);
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

interface Comment {
	at: number;
	text: string;
}

interface ScriptCommentsParams {
	source: string;
	kind: ts.ScriptKind;
}

const scriptComments = ({ source, kind }: ScriptCommentsParams): Comment[] => {
	const file = ts.createSourceFile("scanned", source, ts.ScriptTarget.Latest, true, kind);
	const found = new Map<number, string>();
	const visit = (node: ts.Node): void => {
		if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;

		const children = node.getChildren(file);

		if (children.length === 0) {
			const start = node.getStart(file);
			const trivia = [
				...(ts.getTrailingCommentRanges(source, node.getFullStart()) ?? []),
				...(ts.getLeadingCommentRanges(source, node.getFullStart()) ?? []),
			];

			for (const { pos, end } of trivia) if (end <= start) found.set(pos, source.slice(pos, end));
		}

		for (const child of children) visit(child);
	};

	visit(file);

	return [...found].map(([at, text]) => ({ at, text }));
};

const astroComments = (source: string): Comment[] => {
	const frontmatter = source.match(ASTRO_FRONTMATTER)?.[1];
	const regions = [
		...(frontmatter === undefined ? [] : [{ offset: ASTRO_FENCE.length, body: frontmatter }]),
		...[...source.matchAll(ASTRO_SCRIPT)].map((match) => ({
			offset: (match.index ?? 0) + match[0].indexOf(">") + 1,
			body: match[1],
		})),
	];

	return [
		...regions.flatMap(({ offset, body }) =>
			scriptComments({ source: body, kind: ts.ScriptKind.TS }).map(({ at, text }) => ({ at: offset + at, text })),
		),
		...[...source.matchAll(TEMPLATE_COMMENT)].map((match) => ({ at: match.index ?? 0, text: match[0] })),
	];
};

interface CommentsInParams {
	file: string;
	source: string;
}

const commentsIn = ({ file, source }: CommentsInParams): Comment[] => {
	if (file.endsWith(".astro")) return astroComments(source);
	if (file.endsWith(".css"))
		return [...source.matchAll(CSS_COMMENT)].map((match) => ({ at: match.index ?? 0, text: match[0] }));

	return scriptComments({ source, kind: file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS });
};

interface LineAtParams {
	source: string;
	at: number;
}

const lineAt = ({ source, at }: LineAtParams) => source.slice(0, at).split(NEWLINE).length;

const COMMENTED_SOURCES = [...HAND_WRITTEN_CODE, ...walk("src").filter((file) => file.endsWith(".css"))];

interface CallArgumentsParams {
	source: string;
	call: RegExp;
}

const callArguments = ({ source, call }: CallArgumentsParams): string[] =>
	[...source.matchAll(call)].map(({ index }) => {
		const opening = source.indexOf("(", index);
		let depth = 0;

		for (let at = opening; at < source.length; at += 1) {
			if (source[at] === "(") depth += 1;
			else if (source[at] === ")") depth -= 1;

			if (depth === 0) return source.slice(opening + 1, at);
		}

		return "";
	});

const missingRestores = (source: string): string[] =>
	STUB_RESTORES.filter(({ stub }) => stub.test(source))
		.filter(({ restore }) => !callArguments({ source, call: TEARDOWN_HOOK }).some((body) => body.includes(restore)))
		.map(({ restore }) => restore);

const unlocalisedComparisons = (source: string): string[] =>
	callArguments({ source, call: LOCALE_COMPARE_CALL }).filter((args) => topLevelArity(args) < 2);

const documentLeaks = (source: string): string[] => [
	...(DOM_WRITE.test(source) && !callArguments({ source, call: TEARDOWN_HOOK }).some((body) => DOM_EMPTYING.test(body))
		? ["written and never emptied in an afterEach or afterAll"]
		: []),
	...(callArguments({ source, call: SETUP_HOOK }).some((body) => DOM_EMPTYING.test(body))
		? ["emptied in a beforeEach or beforeAll"]
		: []),
];

const UNIT_TESTS = HAND_WRITTEN_CODE.filter((file) => file.startsWith("src/") && CO_LOCATED_TEST_FILE.test(file));

const zodDeclarationsIn = (manifest: Record<string, Record<string, string> | undefined>): string[] =>
	DEPENDENCY_FIELDS.filter((field) => manifest[field]?.zod !== undefined);

const unitOf = (file: string) => {
	const parts = file.split("/");

	if (parts[1] === "ui" && parts[2] === "modules") return parts.slice(0, 4).join("/");
	if (parts[1] === "ui") return parts.slice(0, 3).join("/");

	return parts.length > 2 ? parts.slice(0, 2).join("/") : parts[0];
};

const moduleSpecifiers = (source: string): string[] =>
	[...source.matchAll(IMPORT_SPECIFIER), ...source.matchAll(MOCKED_MODULE)].map(([, specifier]) => specifier);

interface ImportTargetParams {
	file: string;
	specifier: string;
}

const importTarget = ({ file, specifier }: ImportTargetParams): string | undefined => {
	if (specifier.startsWith(".")) return toPosix(join(dirname(file), specifier));

	const alias = ALIAS_TARGETS.find(([name]) => specifier.startsWith(name));

	return alias && specifier.replace(alias[0], alias[1]);
};

const globToRegExp = (glob: string) =>
	new RegExp(
		`^${glob.replace(GLOB_TOKEN, (token) => {
			if (token === "**/") return "(?:.*/)?";
			if (token === "**") return ".*";
			if (token === "*") return "[^/]*";
			if (token.startsWith("{")) return `(?:${token.slice(1, -1).split(",").join("|")})`;

			return `\\${token}`;
		})}$`,
	);

describe("the hand-written code", () => {
	it("carries no comment but a tool directive, since a line's reason lives in the commit, the pull request, an ADR or CODING_STANDARDS.md", () => {
		const commented = COMMENTED_SOURCES.flatMap((file) => {
			const source = read(file);

			return commentsIn({ file, source })
				.filter(({ text }) => !TOOL_DIRECTIVE.test(text))
				.map(({ at }) => `${file}:${lineAt({ source, at })}`);
		});
		const spoken = (sample: CommentsInParams) => commentsIn(sample).map(({ text }) => text);

		expect(spoken({ file: "a.ts", source: 'const url = "https://a.b"; const slash = /\\/\\//; // said' })).toEqual([
			"// said",
		]);
		expect(spoken({ file: "a.tsx", source: 'const link = <a href="https://a.b">//text, not a comment</a>;' })).toEqual(
			[],
		);
		expect(spoken({ file: "a.astro", source: "---\nconst a = 1; /* said */\n---\n<p>a</p><!-- said -->" })).toEqual([
			"/* said */",
			"<!-- said -->",
		]);
		expect(spoken({ file: "a.css", source: ".a { color: red; } /* said */" })).toEqual(["/* said */"]);
		expect(TOOL_DIRECTIVE.test("// biome-ignore lint/style/noArguments: the vendor reads them")).toBe(true);
		expect(TOOL_DIRECTIVE.test("// @ts-ignore")).toBe(false);
		expect(COMMENTED_SOURCES.filter((file) => file.startsWith("e2e/")).length).toBeGreaterThan(0);
		expect(COMMENTED_SOURCES.filter((file) => file.endsWith(".css")).length).toBeGreaterThan(0);
		expect(commented).toEqual([]);
	});

	it("writes an import that leaves its layer or feature with the alias and one that stays inside it relative, so an alias always marks a crossed boundary, and reaches src/actions from nowhere outside it", () => {
		const imports = walk("src")
			.filter((file) => SOURCE_FILE.test(file) || file.endsWith(".css"))
			.flatMap((file) => moduleSpecifiers(read(file)).map((specifier) => ({ file, specifier })))
			.flatMap(({ file, specifier }) => {
				const target = importTarget({ file, specifier });

				return target === undefined
					? []
					: [
							{
								file,
								specifier,
								target,
								aliased: !specifier.startsWith("."),
								crossing: unitOf(file) !== unitOf(target),
							},
						];
			});
		const misspelled = imports
			.filter(({ aliased, crossing }) => aliased !== crossing)
			.map(({ file, specifier }) => `${file}: ${specifier}`);
		const reachingActions = imports
			.filter(({ file, target }) => target.startsWith("src/actions/") && !file.startsWith("src/actions/"))
			.map(({ file, specifier }) => `${file}: ${specifier}`);

		expect(
			moduleSpecifiers(
				'vi.mock("./client"); const real = await vi.importActual<typeof import("./client")>("./client");',
			),
		).toEqual(["./client", "./client", "./client"]);
		expect(importTarget({ file: "src/domain/article/rules.ts", specifier: "../shared/image" })).toBe(
			"src/domain/shared/image",
		);
		expect(importTarget({ file: "src/pages/about.astro", specifier: "astro:content" })).toBeUndefined();
		expect(unitOf("src/ui/modules/home/components/blog/Blog.astro")).toBe("src/ui/modules/home");
		expect(unitOf("src/domain/article/rules.ts")).toBe("src/domain");
		expect(imports.filter(({ aliased }) => aliased).length).toBeGreaterThan(0);
		expect(imports.filter(({ specifier }) => specifier.startsWith("../")).length).toBeGreaterThan(0);
		expect(misspelled).toEqual([]);
		expect(reachingActions).toEqual([]);
	});

	it("logs through logger or LoggerService and never through Effect's own log, whose lines reach the export in another shape", () => {
		const sources = HAND_WRITTEN_CODE.filter((file) => file.startsWith("src/"));

		expect(sources.length).toBeGreaterThan(0);
		expect(sources.filter((file) => EFFECT_LOG.test(read(file)))).toEqual([]);
	});

	it("doubles a bare fetch with MSW and never replaces the global, which would answer a wrong request as readily", () => {
		expect(HAND_WRITTEN_CODE.length).toBeGreaterThan(0);
		expect(HAND_WRITTEN_CODE.filter((file) => FETCH_REPLACED.test(read(file)))).toEqual([]);
	});

	it("varies the environment under test through vi.stubEnv, never by writing to the process environment", () => {
		const tests = HAND_WRITTEN_CODE.filter(
			(file) => CO_LOCATED_TEST_FILE.test(file) || file.startsWith(TEST_INFRASTRUCTURE) || file.startsWith("e2e/"),
		);

		expect(tests.length).toBeGreaterThan(0);
		expect(tests.filter((file) => PROCESS_ENV_WRITE.test(read(file)))).toEqual([]);
	});

	it("undoes every stubbed global, stubbed variable, spy, faked clock and node appended to the document in an afterEach or afterAll, which a failing assertion cannot skip", () => {
		const stubbing = STUB_RESTORES.map(({ stub }) => UNIT_TESTS.filter((file) => stub.test(read(file))).length);
		const leaking = UNIT_TESTS.flatMap((file) => missingRestores(read(file)).map((restore) => `${file}: ${restore}`));
		const domTests = UNIT_TESTS.filter((file) => DOM_TEST_FILE.test(file));
		const leakingDocuments = domTests.flatMap((file) => documentLeaks(read(file)).map((leak) => `${file}: ${leak}`));

		expect(missingRestores('it("a", () => { vi.stubGlobal("a", 1); vi.unstubAllGlobals(); });')).toEqual([
			"vi.unstubAllGlobals()",
		]);
		expect(missingRestores('afterEach(() => { if (a) { b(); } vi.restoreAllMocks(); }); vi.spyOn(a, "b");')).toEqual(
			[],
		);
		expect(documentLeaks('it("a", () => { document.body.append(card); });')).toEqual([
			"written and never emptied in an afterEach or afterAll",
		]);
		expect(documentLeaks('afterEach(cleanup);\nit("a", () => { render(null); });')).toEqual([]);
		expect(
			documentLeaks(
				'beforeEach(() => { document.body.innerHTML = MARKUP; });\nafterEach(() => { document.body.innerHTML = ""; });',
			),
		).toEqual([]);
		expect(
			documentLeaks(
				'beforeEach(() => { document.body.innerHTML = ""; });\nit("a", () => { document.body.append(card); });',
			),
		).toEqual(["written and never emptied in an afterEach or afterAll", "emptied in a beforeEach or beforeAll"]);
		expect(stubbing).not.toContain(0);
		expect(domTests.filter((file) => DOM_WRITE.test(read(file))).length).toBeGreaterThan(0);
		expect(leaking).toEqual([]);
		expect(leakingDocuments).toEqual([]);
	});

	it("passes a locale to every localeCompare in src, so no order a visitor sees depends on the machine that built it", () => {
		const sources = HAND_WRITTEN_CODE.filter((file) => file.startsWith("src/"));
		const unlocalised = sources.flatMap((file) =>
			unlocalisedComparisons(read(file)).map((args) => `${file}: localeCompare(${args})`),
		);

		expect(unlocalisedComparisons("a.name.localeCompare(b.name)")).toEqual(["b.name"]);
		expect(unlocalisedComparisons("a.localeCompare(b, DEFAULT_LOCALE_STRING)")).toEqual([]);
		expect(unlocalisedComparisons("a.localeCompare(pick(b, c))")).toEqual(["pick(b, c)"]);
		expect(sources.filter((file) => read(file).includes(".localeCompare(")).length).toBeGreaterThan(0);
		expect(unlocalised).toEqual([]);
	});

	it("pins the clock rather than reading the year off it or bracketing Date.now()", () => {
		const unpinned = UNIT_TESTS.filter((file) => REAL_CLOCK_YEAR.test(read(file)) || CLOCK_BRACKET.test(read(file)));

		expect(REAL_CLOCK_YEAR.test("year: new Date().getFullYear(),")).toBe(true);
		expect(REAL_CLOCK_YEAR.test("const year = new Date().getUTCFullYear();")).toBe(true);
		expect(CLOCK_BRACKET.test("const before = Math.floor(Date.now() / 1000);")).toBe(true);
		expect(UNIT_TESTS.length).toBeGreaterThan(0);
		expect(unpinned).toEqual([]);
	});

	it("casts nothing a .json() or JSON.parse call answers, which a schema checks or a literal comparison reads instead", () => {
		const readers = SOURCE_FILES.filter((file) => JSON_READ.test(read(file)));

		expect(CAST_JSON.test("return (await response.json()) as Verdict;")).toBe(true);
		expect(CAST_JSON.test("const { categories } = JSON.parse(decodeURIComponent(stored)) as Consent;")).toBe(true);
		expect(CAST_JSON.test("const answer: unknown = await response.json();")).toBe(false);
		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => CAST_JSON.test(read(file)))).toEqual([]);
	});

	it("imports Zod only through astro/zod, and declares no zod of its own", () => {
		const specifiers = HAND_WRITTEN_CODE.flatMap((file) =>
			[...read(file).matchAll(IMPORT_SPECIFIER)].map(([, specifier]) => ({ file, specifier })),
		);
		const direct = specifiers
			.filter(({ specifier }) => ZOD_SPECIFIER.test(specifier))
			.map(({ file, specifier }) => `${file} imports ${specifier}`);

		expect(zodDeclarationsIn({ devDependencies: { zod: "x" } })).toEqual(["devDependencies"]);
		expect(specifiers.filter(({ specifier }) => specifier === "astro/zod").length).toBeGreaterThan(0);
		expect(direct).toEqual([]);
		expect(zodDeclarationsIn(PACKAGE_JSON)).toEqual([]);
	});

	it("memoises nothing by hand, since astro.config.ts compiles every component with the React Compiler", () => {
		const modules = SOURCE_FILES.filter((file) => TYPESCRIPT_FILE.test(file));

		expect(ASTRO_CONFIG).toContain(REACT_COMPILER);
		expect(HAND_WRITTEN_MEMOISATION.test("const submit = useCallback(async () => {}, []);")).toBe(true);
		expect(HAND_WRITTEN_MEMOISATION.test("export const WorldGlobe = memo(() => null);")).toBe(true);
		expect(HAND_WRITTEN_MEMOISATION.test("const reference = useRef(null);")).toBe(false);
		expect(modules.filter((file) => file.endsWith(".tsx")).length).toBeGreaterThan(0);
		expect(modules.filter((file) => HAND_WRITTEN_MEMOISATION.test(read(file)))).toEqual([]);
	});
});

describe("the domain and the application layer", () => {
	const domainSources = walk("src/domain").filter(
		(file) => TYPESCRIPT_FILE.test(file) && !CO_LOCATED_TEST_FILE.test(file),
	);

	it("names every schema after its concept, in the singular", () => {
		const schemas = domainSources
			.filter((file) => !file.startsWith("src/domain/shared/"))
			.flatMap((file) =>
				[...read(file).matchAll(EXPORTED_SCHEMA)].map(([, name]) => ({ file, name, concept: file.split("/")[2] })),
			);
		const misnamed = schemas
			.filter(({ name, concept }) => !name.startsWith(concept) || !UPPERCASE.test(name[concept.length] ?? ""))
			.map(({ file, name }) => `${file}: ${name}`);

		expect(schemas.length).toBeGreaterThan(0);
		expect(misnamed).toEqual([]);
	});

	it("reorders no array in place in a domain rule, since a DTO and a page can hold the same array", () => {
		expect(domainSources.length).toBeGreaterThan(0);
		expect(domainSources.filter((file) => IN_PLACE_REORDER.test(read(file)))).toEqual([]);
	});

	it("reads no local-time Date API in either layer, since CI prerenders in one time zone and an author builds in another", () => {
		const sources = production([...walk("src/domain"), ...walk("src/application")]).filter((file) =>
			TYPESCRIPT_FILE.test(file),
		);

		expect(sources.length).toBeGreaterThan(domainSources.length);
		expect(sources.filter((file) => LOCAL_TIME_DATE_API.test(read(file)))).toEqual([]);
	});
});

describe("one module spells each thing", () => {
	it("spells a content URL in @const alone: no literal path to an Article, a Tag or a Project, and no route joined to a slug", () => {
		const elsewhere = SOURCE_FILES.filter((file) => !file.startsWith("src/const/"));

		expect(elsewhere.length).toBeGreaterThan(0);
		expect(read("src/const/routes.ts")).toMatch(JOINED_ROUTE);
		expect(elsewhere.filter((file) => CONTENT_PATH_LITERAL.test(read(file)) || JOINED_ROUTE.test(read(file)))).toEqual(
			[],
		);
	});

	it("imports the plain logger only where no layer can provide LoggerService, so an unintended log stays a compile error", () => {
		const importers = SOURCE_FILES.filter((file) => PLAIN_LOGGER_IMPORT.test(read(file)));

		expect(importers.toSorted()).toEqual(PLAIN_LOGGER_READERS.toSorted());
	});

	it("carries no index.ts barrel under src/ui/modules, since a component is imported by its own path", () => {
		const modules = walk("src/ui/modules");

		expect(modules.length).toBeGreaterThan(0);
		expect(modules.filter((file) => BARREL_FILE.test(file))).toEqual([]);
	});
});

describe("colour", () => {
	it("registers no colour token with @property, so a theme switch flips it rather than interpolating it", () => {
		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));

		expect(stylesheets.length).toBeGreaterThan(0);
		expect([...read("src/ui/styles/global/variables.css").matchAll(REGISTERED_PROPERTY)].length).toBeGreaterThan(0);
		expect(REGISTERED_COLOUR.test('@property --ink { syntax: "<color>"; inherits: true; }')).toBe(true);
		expect(stylesheets.filter((file) => REGISTERED_COLOUR.test(read(file)))).toEqual([]);
	});

	it("writes no hex colour in a component or route stylesheet or a module under src/ui, bar the globe the backlog names", () => {
		const sources = production([...walk("src/ui"), ...walk("src/pages")])
			.filter((file) => !file.startsWith("src/ui/styles/"))
			.filter((file) => SOURCE_FILE.test(file) || file.endsWith(".css"));
		const coloured = sources.filter((file) => HEX_COLOUR.test(read(file)));

		expect(sources.filter((file) => file.endsWith(".css")).length).toBeGreaterThan(0);
		expect(HEX_COLOUR.test("fill: #c0ffee;")).toBe(true);
		expect(HEX_COLOUR.test('href="#contact" &#39;')).toBe(false);
		expect(coloured.toSorted()).toEqual(HEX_COLOURS_AWAITING_A_TOKEN);
	});

	it("registers every custom property that counts siblings, or a child would read its own index", () => {
		const registered = new Set(
			[...read("src/ui/styles/global/variables.css").matchAll(REGISTERED_PROPERTY)].map(([, name]) => name),
		);
		const counting = walk("src")
			.filter((file) => file.endsWith(".css"))
			.flatMap((file) => [...read(file).matchAll(SIBLING_COUNTING_PROPERTY)].map(([, name]) => ({ file, name })));

		expect(counting.length).toBeGreaterThan(0);
		expect(counting.filter(({ name }) => !registered.has(name)).map(({ file, name }) => `${file}: ${name}`)).toEqual(
			[],
		);
	});
});

describe("the scripts and the coverage config", () => {
	it("passes --pass-with-no-tests to test:e2e:changed alone, and to no workflow, where it would turn an empty run green", () => {
		const scripts = Object.entries(PACKAGE_JSON.scripts as Record<string, string>);
		const workflows = walk(".github").filter((file) => file.endsWith(".yml"));

		expect(scripts.filter(([, command]) => command.includes(PASS_WITH_NO_TESTS)).map(([name]) => name)).toEqual([
			"test:e2e:changed",
		]);
		expect(workflows.length).toBeGreaterThan(0);
		expect(workflows.filter((file) => read(file).includes(PASS_WITH_NO_TESTS))).toEqual([]);
	});

	it("runs no package script through a shell substitution, which cmd on Windows passes on as literal text", () => {
		const scripts = Object.entries(PACKAGE_JSON.scripts as Record<string, string>);

		expect(scripts.length).toBeGreaterThan(0);
		expect(scripts.filter(([, command]) => SHELL_SUBSTITUTION.test(command)).map(([name]) => name)).toEqual([]);
	});

	it("excludes from coverage only globs that match a file, since a stale entry is a false claim about the tree", () => {
		const globs = [...(read("vitest.config.ts").match(COVERAGE_EXCLUDE)?.[1] ?? "").matchAll(QUOTED_GLOB)].map(
			([, glob]) => glob,
		);

		expect(globs.length).toBeGreaterThan(0);
		expect(globToRegExp("src/**/*.test.{ts,tsx}").test("src/a/b.test.tsx")).toBe(true);
		expect(globToRegExp("src/**/types.ts").test("src/types.ts")).toBe(true);
		expect(globToRegExp("src/data/**").test("src/database/a.ts")).toBe(false);
		expect(globs.filter((glob) => !PROJECT_FILES.some((file) => globToRegExp(glob).test(file)))).toEqual([]);
	});
});

describe("pinned versions", () => {
	const pinned = AGENTS_MD.split(NEWLINE).flatMap((line) => line.match(PINNED_RUNTIME)?.[1] ?? []);

	it("names every runtime it pins", () => {
		expect(pinned.sort()).toEqual(["Node", "pnpm"]);
	});

	it("quotes a version for none of them, since nothing here would keep one current", () => {
		const versions = section({ markdown: AGENTS_MD, heading: VERSIONS_HEADING });
		const quoting = versions.split(NEWLINE).filter((line) => QUOTED_VERSION.test(line));

		expect(versions).not.toBe("");
		expect(quoting).toEqual([]);
	});

	it("pins Node once: .nvmrc and engines.node are one fact, so they say the same thing", () => {
		expect(read(".nvmrc").trim()).toBe(PACKAGE_JSON.engines.node);
	});

	it("pins pnpm once, through packageManager", () => {
		expect(PACKAGE_JSON.packageManager.split("@")[0]).toBe("pnpm");
	});

	it("pins every runtime to an exact version, never a range", () => {
		expect(PACKAGE_JSON.engines.node).toMatch(EXACT_VERSION);
		expect(PACKAGE_JSON.packageManager.split("@")[1]).toMatch(EXACT_VERSION);
	});

	it("lets no workflow or composite action pin a runtime the manifest already pins", () => {
		const workflows = walk(".github").filter((file) => file.endsWith(".yml"));
		const repinned = workflows.filter((file) => REPINNED_RUNTIME.test(read(file)));

		expect(workflows.length).toBeGreaterThan(0);
		expect(repinned).toEqual([]);
	});
});

const YAML_FILE = /\.ya?ml$/;
const GENERATED_YAML = new Set(["pnpm-lock.yaml"]);
const USES_LINE = /^\s*(?:-\s+)?uses:\s*(\S+)(.*)$/;
const SELF_REFERENCE = /^[$.]\//;
const PINNED_TARGET = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/;
const PIN_COMMENT = /^\s+#\s\S+$/;
const YAML_DIRECTIVE = /^#\s*(?:zizmor|yaml-language-server):/;
const RENOVATE_ANNOTATION = /^# Renovate security update: \S/;
const RENOVATE_ANNOTATED_FILE = "pnpm-workspace.yaml";
const BLOCK_SCALAR = /(?:^|[:-])\s+[|>][-+\d]*$/;
const BARE_BLOCK_ITEM = /^\s*-\s+[|>]/;
const YAML_LEAD = /^(\s*)(-\s+)?/;
const QUOTE_OPENING = /(?:^|[:[{,-])\s*$/;

const YAML_FILES = PROJECT_FILES.filter((file) => YAML_FILE.test(file) && !GENERATED_YAML.has(basename(file)));

const unpinnedUses = (source: string): string[] =>
	source.split(NEWLINE).flatMap((line) => {
		const [, target, rest = ""] = line.match(USES_LINE) ?? [];

		if (target === undefined || SELF_REFERENCE.test(target)) return [];

		return PINNED_TARGET.test(target) && PIN_COMMENT.test(rest) ? [] : [target];
	});

const yamlCommentIn = (line: string): string | undefined => {
	let quote: string | undefined;

	for (let at = 0; at < line.length; at += 1) {
		const character = line[at];

		if (quote) {
			if (character === "\\" && quote === '"') at += 1;
			else if (character === quote) quote = undefined;
		} else if ((character === '"' || character === "'") && QUOTE_OPENING.test(line.slice(0, at))) {
			quote = character;
		} else if (character === "#" && (at === 0 || line[at - 1] === " " || line[at - 1] === "\t")) {
			return line.slice(at);
		}
	}

	return undefined;
};

interface YamlComment {
	line: number;
	comment: string;
}

const yamlComments = (source: string): YamlComment[] => {
	const comments: YamlComment[] = [];
	let blockIndent: number | undefined;

	for (const [index, line] of source.split(NEWLINE).entries()) {
		const [, spaces = "", dash = ""] = line.match(YAML_LEAD) ?? [];

		if (blockIndent !== undefined && (line.trim() === "" || spaces.length > blockIndent)) continue;

		const comment = yamlCommentIn(line);
		const code = (comment === undefined ? line : line.slice(0, line.length - comment.length)).trimEnd();

		blockIndent = BLOCK_SCALAR.test(code) ? spaces.length + (BARE_BLOCK_ITEM.test(code) ? 0 : dash.length) : undefined;

		if (comment !== undefined) comments.push({ line: index + 1, comment });
	}

	return comments;
};

interface AllowedYamlCommentParams {
	file: string;
	line: string;
	comment: string;
}

const allowedYamlComment = ({ file, line, comment }: AllowedYamlCommentParams): boolean => {
	const [, target] = line.match(USES_LINE) ?? [];

	return (
		(target !== undefined && PINNED_TARGET.test(target)) ||
		YAML_DIRECTIVE.test(comment) ||
		(file === RENOVATE_ANNOTATED_FILE && RENOVATE_ANNOTATION.test(comment))
	);
};

describe("the workflows", () => {
	const workflows = walk(".github/workflows").filter((file) => file.endsWith(".yml"));
	const steps = workflows.flatMap((file) =>
		read(file)
			.split("- name:")
			.map((step) => ({ file, step })),
	);
	const RETRY_WRAPPER = "nick-fields/retry";
	const DEPLOY_COMMAND = /\bwrangler deploy\b/;
	const BUILD_COMMAND = /\b(?:astro build|pnpm build)\b/;
	const SECRET_COMMAND = /\bwrangler secret\b/;
	const CLEANUP_GROUP = /group: CI-refs\/pull\/\$\{\{ github\.event\.pull_request\.number \}\}\/merge/;
	const AGGREGATE_NEEDS = /name: Check\n\s+needs: \[([^\]]+)\]\n\s+if: \$\{\{ always\(\) \}\}/;

	it("runs every deploy, build and secret write without a retry wrapper", () => {
		const wrapped = steps
			.filter(({ step }) => DEPLOY_COMMAND.test(step) || BUILD_COMMAND.test(step) || SECRET_COMMAND.test(step))
			.filter(({ step }) => step.includes(RETRY_WRAPPER))
			.map(({ file, step }) => `${file} ->${step.split("\n")[0]}`);
		const deploying = steps.filter(({ step }) => DEPLOY_COMMAND.test(step)).length;

		expect(deploying).toBeGreaterThan(0);
		expect(wrapped).toEqual([]);
	});

	it("queues the preview Worker cleanup behind the pull request's own CI run", () => {
		expect(read(".github/workflows/ci.yml")).toMatch(/^name: CI$/m);
		expect(read(".github/workflows/cleanup-development.yml")).toMatch(CLEANUP_GROUP);
	});

	it("names every deploy with a --message of its own, so a long commit message cannot reach the annotation", () => {
		const deploys = steps.flatMap(({ file, step }) =>
			step
				.split(NEWLINE)
				.filter((line) => DEPLOY_COMMAND.test(line))
				.map((line) => ({ file, line })),
		);

		expect(deploys.length).toBeGreaterThan(0);
		expect(deploys.filter(({ line }) => !line.includes("--message")).map(({ file }) => file)).toEqual([]);
	});

	it("aggregates every gated job under Check, so the preview E2E run gates a merge", () => {
		const needs = (read(".github/workflows/ci.yml").match(AGGREGATE_NEEDS)?.[1] ?? "")
			.split(",")
			.map((job) => job.trim());

		expect(needs).toEqual(
			expect.arrayContaining(["verify", "deploy-development", "e2e", "deploy-production", "smoke", "release"]),
		);
	});
});

describe("the YAML", () => {
	it("pins every action of another repository to a full commit SHA, its version or branch in a trailing comment", () => {
		const sha = "0".repeat(40);
		const pinned = YAML_FILES.flatMap((file) =>
			read(file)
				.split(NEWLINE)
				.filter((line) => USES_LINE.test(line) && line.includes("@")),
		);
		const unpinned = YAML_FILES.flatMap((file) => unpinnedUses(read(file)).map((target) => `${file}: ${target}`));

		expect(unpinnedUses(`      - uses: actions/checkout@${sha} # v7.0.1`)).toEqual([]);
		expect(unpinnedUses("      - uses: actions/checkout@v7")).toEqual(["actions/checkout@v7"]);
		expect(unpinnedUses(`        uses: actions/checkout@${sha}`)).toEqual([`actions/checkout@${sha}`]);
		expect(unpinnedUses("      - uses: $/.github/actions/prepare-env")).toEqual([]);
		expect(pinned.length).toBeGreaterThan(0);
		expect(unpinned).toEqual([]);
	});

	it("carries no comment but a SHA pin's version, a tool directive and the line Renovate writes above an entry it exempts", () => {
		const commented = YAML_FILES.flatMap((file) => {
			const lines = read(file).split(NEWLINE);

			return yamlComments(read(file))
				.filter(({ line, comment }) => !allowedYamlComment({ file, line: lines[line - 1], comment }))
				.map(({ line, comment }) => `${file}:${line}: ${comment}`);
		});
		const scanned = (source: string) => yamlComments(source).map(({ line, comment }) => `${line}: ${comment}`);
		const renovate = "# Renovate security update: astro@7.1.0";

		expect(scanned("a: 1 # why\nb: '#kept'\nc: |\n  # content\nd: x#y\n")).toEqual(["1: # why"]);
		expect(scanned("run: |\n  echo '#1' # shell\n  ### heading\nnext: 2 # why\n")).toEqual(["4: # why"]);
		expect(scanned("- run: |\n    x # inside\n  shell: bash # why\n")).toEqual(["3: # why"]);
		expect(scanned(`name: "a # b"\nurl: https://a.b/#c\n`)).toEqual([]);
		expect(allowedYamlComment({ file: "a.yml", line: `uses: a/b@${"0".repeat(40)} # v1`, comment: "# v1" })).toBe(true);
		expect(
			allowedYamlComment({
				file: "a.yml",
				line: "# zizmor: ignore[artipacked]",
				comment: "# zizmor: ignore[artipacked]",
			}),
		).toBe(true);
		expect(allowedYamlComment({ file: RENOVATE_ANNOTATED_FILE, line: `  ${renovate}`, comment: renovate })).toBe(true);
		expect(allowedYamlComment({ file: "a.yml", line: `  ${renovate}`, comment: renovate })).toBe(false);
		expect(YAML_FILES).toContain(RENOVATE_ANNOTATED_FILE);
		expect(commented).toEqual([]);
	});
});

const VERSIONED_DEPENDENCIES: Record<string, string[]> = {
	astro: ["Astro"],
	"@astrojs/starlight": ["Starlight"],
	effect: ["Effect"],
	next: ["Next", "Next.js"],
	react: ["React"],
	tailwindcss: ["Tailwind", "Tailwind CSS"],
	typescript: ["TypeScript"],
	wrangler: ["wrangler", "Wrangler"],
	zod: ["Zod", "zod"],
};
const escapeForRegExp = (name: string): string => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const statedVersionPattern = (names: string[]): RegExp =>
	new RegExp(`\\b(?:${names.map(escapeForRegExp).join("|")})\\s+(?:v|@)?\\d+(?:\\.\\d+)*\\b`, "g");
interface PolicedNamesParams {
	readonly declared: Set<string>;
	readonly runtimes: string[];
}
const policedNames = ({ declared, runtimes }: PolicedNamesParams): string[] => [
	...runtimes,
	...Object.entries(VERSIONED_DEPENDENCIES)
		.filter(([dependency]) => declared.has(dependency))
		.flatMap(([, names]) => names),
];
const declaredIn = (manifests: { dependencies?: object; devDependencies?: object }[]): Set<string> =>
	new Set(manifests.flatMap((manifest) => Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })));
const POLICED_NAMES = policedNames({ declared: declaredIn([PACKAGE_JSON]), runtimes: ["Node", "Node.js", "pnpm"] });
const STATED_VERSION = statedVersionPattern(POLICED_NAMES);

describe("stated versions", () => {
	it("polices the runtimes and every versioned dependency the manifests declare, and nothing else", () => {
		const declared = declaredIn([PACKAGE_JSON]);
		const namesOf = (isDeclared: boolean) =>
			Object.entries(VERSIONED_DEPENDENCIES)
				.filter(([dependency]) => declared.has(dependency) === isDeclared)
				.flatMap(([, names]) => names);

		expect(namesOf(true).length).toBeGreaterThan(0);
		expect(namesOf(false).length).toBeGreaterThan(0);
		expect(POLICED_NAMES).toEqual(expect.arrayContaining(["Node", "pnpm", ...namesOf(true)]));
		expect(POLICED_NAMES.filter((name) => namesOf(false).includes(name))).toEqual([]);
	});

	it("states the current version of nothing a bot moves, outside the ADRs, which are dated", () => {
		const documents = [...new Set([...DOCS, "README.md", ".github/CONTRIBUTING.md"])].filter(
			(file) => !file.startsWith("docs/adr/") && existsSync(join(ROOT, file)),
		);
		const stated = documents.flatMap((file) =>
			[...read(file).matchAll(STATED_VERSION)].map(([match]) => `${file}: ${match}`),
		);

		expect(documents.length).toBeGreaterThan(0);
		expect(stated).toEqual([]);
	});
});

const BREAKING_PARSER_OPTS = {
	headerPattern: "^(\\w*)(?:\\((.*)\\))?!?: (.*)$",
	breakingHeaderPattern: "^(\\w*)(?:\\((.*)\\))?!: (.*)$",
};
const COMMIT_PARSING_PLUGINS = ["@semantic-release/commit-analyzer", "@semantic-release/release-notes-generator"];
const RELEASE_CONFIG_PATTERN = /(^|\/)(\.releaserc(\.\w+)?|release\.config\.\w+)$/;

type ReleasePlugin = string | [string, Record<string, unknown>?];

interface ParserOptsOfParams {
	plugins: ReleasePlugin[];
	name: string;
}

const parserOptsOf = ({ plugins, name }: ParserOptsOfParams): unknown => {
	const entry = plugins.find((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === name);

	return Array.isArray(entry) ? entry[1]?.parserOpts : undefined;
};

describe("the release config parses the commit grammar commitlint accepts", () => {
	const configs = walk(".").filter((file) => RELEASE_CONFIG_PATTERN.test(file));

	it("teaches every plugin that parses a commit message the same header grammar", () => {
		const wrong = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };

			return COMMIT_PARSING_PLUGINS.filter(
				(name) => JSON.stringify(parserOptsOf({ plugins, name })) !== JSON.stringify(BREAKING_PARSER_OPTS),
			).map((name) => `${file}: ${name}`);
		});

		expect(configs.length).toBeGreaterThan(0);
		expect(wrong).toEqual([]);
	});

	it("commits the release, which commitlint never sees, under the release scope and [skip ci] so it starts no run", () => {
		const wrong = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };
			const entry = plugins.find(
				(plugin: ReleasePlugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === "@semantic-release/git",
			);
			const message = Array.isArray(entry) ? String(entry[1]?.message) : "";

			return message.startsWith(`chore(release): \${nextRelease.version}`) && message.includes("[skip ci]")
				? []
				: [`${file}: ${message}`];
		});

		expect(wrong).toEqual([]);
	});

	it("commits only the files a release rewrites, and a version bump never touches the lockfile", () => {
		const listed = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };
			const entry = plugins.find(
				(plugin: ReleasePlugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === "@semantic-release/git",
			);
			const assets = Array.isArray(entry) ? ((entry[1]?.assets as string[]) ?? []) : [];

			return assets.filter((asset) => asset.includes("lock")).map((asset) => `${file}: ${asset}`);
		});

		expect(listed).toEqual([]);
	});
});
