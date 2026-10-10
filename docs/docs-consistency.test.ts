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

const INDEXED_DIRECTORIES = [".github", "docs", "drizzle", "scripts", "seed", "src"];

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

const MODULES_WHOSE_EXPORTS_THE_FRAMEWORK_READS = new Set([
	"src/actions/index.ts",
	"src/live.config.ts",
	"src/worker.ts",
	"src/env.d.ts",
	"src/middleware.ts",
]);

const MODULES_SHARED_BYTE_FOR_BYTE = new Set(["src/infrastructure/logging/logger.ts"]);

const GENERATED_SOURCES = new Set(["emdash-env.d.ts"]);

const PLAIN_LOGGER_READERS = ["src/infrastructure/logging/service.ts", "src/pages/500.astro"];

const DOCUMENTED_PATH_EXAMPLES = new Set(["file.ts:123", "NNNN-kebab-title.md", "BACKLOG.md"]);

const ADR_TEMPLATE_SECTIONS = ["Status", "Context", "Decision", "Consequences"];

const ADR_STATUSES = new Set(["Template", "Proposed", "Accepted", "Superseded", "Deprecated"]);

const ADR_NUMBERS_WITHDRAWN = new Set([10]);

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
const IMPURE_DTO_CODE = /astro:env|from "effect"|fetchEntries|listEntries|getImagePlaceholder/;
const ASYNC_DTO_MAPPER = /export\s+(?:const|async\s+function)\s+create\w+/;
const DTO_INFRASTRUCTURE_IMPORT = /from "(@infrastructure\/[^"]+)"/g;
const CMS_TYPE = /from "emdash"|@portabletext\/|\bCmsEntry\b|\bCmsReference\b|\bCmsTerm\b/;
const HAND_PREFIXED_ASSET_URL = /`https:\$\{/;
const RELATIVE_IMAGE_URL_SCHEMA = /url:\s*z\.string\(\)/;
const MEDIA_RESOLUTION = /data: resolveMedia\(fields\)/;
const CMS_LAYER_IMPORT = /import\s*\{[^}]*CmsClientLive[^}]*\}\s*from\s*"\.\/client"/;
const LOADER_FETCH_ENTRIES = /await fetchEntries</;
const EMDASH_PAGE_CAP = /EMDASH_MAX_PAGE_SIZE = (\d+)/;
const REFERENCE_CONCURRENCY = /REFERENCE_READS_IN_FLIGHT = (\d+)/;
const LOADER_REACHING_PAST_FETCH_ENTRIES = /from "effect"|CmsClient|concurrency:/;
const DOMAIN_SCHEMA_BINDING = /schema:\s*\w+Schema,/;
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
const FIXED_POSITION_DECLARATION = /^position\s*:\s*fixed$/;
const NAVIGATION_DECLARATION = /^navigation\s*:/;
const MOTION_REDUCE = /^@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
const STOPPED_ANIMATION = /^animation\s*:\s*none\s*!important$/;
const KEYFRAMES_DECLARATION = /@keyframes\s+([\w-]+)/g;
const ANIMATION_PROPERTY = /^animation(?:-name)?\s*:/;
const ANIMATION_VALUE_SEPARATOR = /[\s,]+/;
const GLOBAL_CASCADE = "src/ui/styles/";
const VENDOR_STYLESHEET = "src/ui/styles/vendor/cookie-consent.css";
const NOT_ARGUMENT = /:not\([^)]*\)/g;
const STRETCH_ARROW_SVG_PATH = /<path class="stretch-arrow__(\w+)" d="([^"]+)"/g;
const STRETCH_ARROW_HOVER_TOKEN = /--stretch-arrow-(\w+)-hover:\s*path\("([^"]+)"\)/g;
const PATH_COMMAND = /([a-zA-Z])([^a-zA-Z]*)/g;
const PATH_NUMBER = /-?\d*\.?\d+/g;
const PATH_DATA_LITERAL = /\bd="[Mm]/;
const LAYER_WRAPPER = /^@layer\s/;
const SINGLE_CLASS_RULE = /^\.([\w-]+)$/;
const CLASS_ATTRIBUTE_VALUE = /class(?:Name)?="([^"{$]*)"/g;
const FLEX_ONLY_PROPERTIES = new Set(["flex-flow", "flex-wrap", "flex-direction"]);
const ALIGNMENT_PROPERTIES = new Set(["justify-content", "align-items"]);
const FLEX_DISPLAYS = new Set(["flex", "inline-flex"]);
const GRID_DISPLAYS = new Set(["grid", "inline-grid"]);
const TYPED_ATTR_READ = /attr\(\s*(data-[\w-]+)\s+type\(/g;
const STATIC_ID_ATTRIBUTE = /[\s<]id="([\w-]+)"/g;
const COLOUR_LITERAL =
	/(?<![\w-])(?:oklch|oklab|lch|lab|rgba?|hsla?|hwb|color)\(|(?<![\w&])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1,5})?(?![\w-])/g;
const TOKEN_FILE = "src/ui/styles/global/variables.css";
const SHARE_IMAGE_IMPORT = /import\s+\w+\s+from\s+"@assets\/images\/jpg\/([\w.-]+\.jpg)"/;
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const SHARE_IMAGE_MAX_BYTES = 250 * 1024;
const STATIC_GSAP_IMPORT = /^\s*import\s[^;]*\sfrom\s+["']gsap["']/m;
const DYNAMIC_GSAP_IMPORT = /import\(\s*["']gsap["']\s*\)/;
const SLIDER_STYLESHEET = "src/ui/styles/global/slider.css";
const SLIDER_RAMP_PROPERTY = /^--(?:slides-per-view|slider-gap)\s*:/;
const ARTICLE_SLIDER_IMPORT = /import\s+ArticleSlider\s+from\s+["'][^"']*ArticleSlider\.astro["']/;
const STRETCH_ARROW_MORPH_FILE = "src/ui/styles/global/global.css";
const STRETCH_ARROW_STATE_QUERY = /@container style\(--stretch-arrow: hover\)/g;
const STRETCH_ARROW_STATE_DECLARATION = /--stretch-arrow: hover;/;
const ARROW_BOX = "arrow-box";
const INLINED_STRETCH_ARROW = /<[a-zA-Z][^<>]*\sset:html=\{stretchArrow\}[^<>]*>/g;
const ARROW_BOX_MOTION = /^(?:opacity|translate|transition(?:-[a-z-]+)?)$/;
const REVEALED_ARROW_BOX = new Map([
	["opacity", "1"],
	["translate", "0 0"],
]);
const COMBINATOR_OUTSIDE_PARENTHESES = /\s*[\s>~+]\s*(?![^(]*\))/;
const SVG_URL = /url\(\s*["']?[^)"']*\.svg["']?\s*\)/;
const MASK_PROPERTY = /^mask(?:-image)?\s*:/;
const CURRENT_COLOUR_FILL = /^background-color\s*:\s*currentColor$/i;
const REVEAL_BLOCKS = new Set(["reveal", "reveal-once"]);
const VIEW_TRANSITION_PSEUDOS = "::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)";
const ANIMATION_TIMELINE_ANYWHERE = /animation-timeline\s*:/;
const FIXED_ANYWHERE = /position\s*:\s*fixed/;
const SCROLL_DRIVEN_SUPPORTS = /^@supports\s*\(\s*animation-timeline\s*:/;
const MOTION_OPT_IN = /^@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/;
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
const CLASS_ATTRIBUTE = /class(?:Names?|:list)?=(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^}]*\})*)\})/g;
const CLASS_WORD = /[a-zA-Z][\w-]*/g;
const ISLAND_ROOT_COUNT = /only (\w+) hydration roots in the whole site/;
const ISLAND_ROOT_CENSUS = /hydration roots in the whole site: ([^\n]+?)\. Every one is/;
const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six"];
const DTO_CITED_DEFAULT = /`((?:\?\?|\|\|) [^`\n]+)`/g;
const CREATE_AUTHOR_DEFINITION = /export function createAuthor\(/;
const AUTHOR_FIELD_MAPPING = /\bsocialNetworks: [^;\n]+,$/m;
const BYLINE_FIELD_READ = /\bdata\.(?:job_title|current_company|profile_image|social_networks)\b/;
const ARTICLE_REFERENCE_LITERAL = /collection: "articles"/;
const NORMALISED_ARTICLE_SLUG = /slug: articleSlug\(/;
const AUTHORED_RELATED_ARTICLES = /references\.related_articles/;
const RELATED_ARTICLES_CAP = /INFERRED_RELATED_ARTICLES_LIMIT = (\d+)/;
const TITLE_AS_IDENTITY = /data\.title ===/;
const ARTICLE_SLUG_CALL = /articleSlug\(/;
const ARTICLE_PUBLISH_DATE_READER = /export function articlePublishDateISO\(/;
const EXIT_EXTRACTION = /\bCause\.(?:failureOption|dieOption)\(/;
const LOCALE_DATE_CALL = /\.toLocaleDateString\(/g;
const LOCALE_TIME_CALL = /\.toLocale(?:Time)?String\(/g;
const PINNED_ZONE = /\btimeZone\s*:/;
const NAMED_ZONE = /\btimeZoneName\s*:/;
const TRANSITION_NAME_SPELLING = /featured-image-\$\{/;
const ROBOTS_OVERRIDE = /\brobots\s*:/;
const HEAD_OF_THE_BLOG = /readArticles\(\)\)\s*\.slice\(/;
const OPEN_GRAPH_LOCALE_FROM_SITE_LOCALE = /property="og:locale" content=\{openGraphLocale\(DEFAULT_LOCALE_STRING\)\}/;
const DATA_HAS_ATTRIBUTE = /\bdata-has-/;
const SCOPED_PACKAGE = /^(@[^/]+\/[^/]+)/;
const RANDOM_DRAW = /\bMath\.random\(/;
const MESSAGE_READ = /\.message\b/;
const COMPARATOR = /\.(?:localeCompare|sort|toSorted)\(/;
const AUTHOR_AND_TAG_READER = /\/dto\/(?:article|author|tag)\//;
const IDENTITY_TRIM = /\b(?:data\.name|label|(?:author|tag)\.slug)(?: \?\? "")?\)?\.trim\(\)/;
const RAW_FAVORITE_READ = /\w\.data\.is_favorite\b/;
const RAW_PUBLISH_DATE_READ = /\bpublishDateISO\(\s*\w+\.data\.publish_date\s*\)/;
const LEAKED_INFRASTRUCTURE_IMPORT = /@infrastructure\/|from "emdash"/;
const DEREFERENCING_MODULE = "src/ui/modules/core/utils/entries.ts";
const LIVE_READ_CALL = /\bgetLive(?:Entry|Collection)\(/;
const EFFECT_IMPORT = /from "effect"/;
const CITED_CONTAINER_QUERY = /@container ([a-z-]+) \(width <= \d+px\)/;
const PLACEHOLDER_MODULE = "src/infrastructure/images/imagePlaceholder/imagePlaceholder.ts";
const PLACEHOLDER_FETCH = /\bfetch\(|getImagePlaceholders|withImagePlaceholders/;
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
const TELEMETRY_MODULE = "src/ui/modules/core/components/cookieConsent/utils/telemetry.ts";
const INLINE_SCRIPTS_MODULE = "src/ui/modules/core/utils/inlineScripts.ts";
const DIRECTIVE_SCRIPT_IMPORT = /from "astro\/runtime\/client\/(\w+)\.prebuilt\.js"/g;
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
const QUERY_SUFFIX = /\?.*$/;
const MODULE_SUFFIXES = ["", ".ts", ".tsx", ".astro", "/index.ts", "/index.tsx"];
const LAZY_LOADER = "lazy";
const MODULES = "src/ui/modules";
const CORE_MODULE = `${MODULES}/core`;
const CORE_COMPONENTS = `${CORE_MODULE}/components`;
const COMPONENT_FOLDER = /^(src\/ui\/modules\/[^/]+\/components\/[^/]+)\//;
const FEATURE_OF_MODULE = /^src\/ui\/modules\/([^/]+)\//;
const FEATURE_UTILITY = /^src\/ui\/modules\/[^/]+\/utils\//;
const CALENDLY_WIDGET_CLASS_DECLARATION = /WIDGET_CLASS: "([^"]+)"/;
const TYPE_SELECTOR_LEAD = /^[a-zA-Z]/;
const FRAME_SIZING_BLOCK = /\{([^{}]*\bframe-sizing:\s*content-height[^{}]*)\}/g;
const FRAME_FLOOR = /\bmin-height:\s*(?!0\b|auto\b)[^;\s]/;
const AUTO_HEIGHT = /\bheight:\s*auto\b/;
const IFRAME_EMBED_DECLARATION = /const IFRAME_EMBED_CLASS = "([\w-]+)";/;
const SELECTOR_CLASS = /(?:^|[\s>+~,(])\.([A-Za-z][\w-]*)/g;
const SELECTOR_ID = /(?:^|[\s>+~,(])#(?![\da-fA-F]{3,8}\b)([A-Za-z][\w-]*)/g;
const HOOK_EXPORT = /_(CLASS|ID)$/;
const CLASS_LIST_OPERATIONS = new Set(["add", "remove", "toggle", "contains", "replace"]);
const ARIA_LABELLED_BY = /aria-labelledby="([^"]+)"/;
const ARIA_LABEL = /\saria-label="/;
const INLINE_STYLE = /\sstyle="([^"]*)"/g;
const VENDOR_INLINE_STYLES = ["display:none;visibility:hidden"];
const PARAMS_TYPE_NAME = /Params$/;
const PARAMS_DECLARATION = /\b(?:interface|type)\s+\w+Params\b/g;
const STRING_METHODS = new Set(["endsWith", "startsWith", "includes", "indexOf", "match", "replace", "split"]);
const MIX_STYLESHEETS = ["global.css", "modifiers.css"];
const CSS_RULE_PRELUDE = /([^{};]*)\{/g;
const QUOTED_STRING = /"[^"]*"|'[^']*'/g;
const CLASS_LITERAL = /"([^"]*)"|'([^']*)'|`([^`]*)`/g;
const TEMPLATE_HOLE = /\$\{[^}]*\}/g;
const HOLE_MARK = "\u0001";
const WHITESPACE = /\s+/;
const WHITESPACE_RUN = /\s+/g;
const COMPARED_LITERAL = /[!=]==?\s*(?:"[^"]*"|'[^']*')|(?:"[^"]*"|'[^']*')\s*[!=]==?/g;
const BLOCK_SEPARATOR = /__|--/;
const WRAPPER_SUFFIX = /-wrapper$/;
const PAGE_BLOCK = "page";
const BLOCKS_GROUPED_UNDER_A_PARENT = [
	{ folder: `${MODULES}/core/components/header/atoms/`, block: "header" },
	{ folder: `${MODULES}/contact/components/form/`, block: "contact-form" },
];
const IMPORT_SPECIFIER = /(?:\bfrom|\bimport|@import)\s*\(?\s*["']([^"']+)["']/g;
const MOCKED_MODULE =
	/\bvi\.(?:mock|doMock|unmock|importActual|importMock)\s*(?:<(?:[^<>]|<[^<>]*>)*>)?\s*\(\s*["']([^"']+)["']/g;
const EFFECT_LOG = /\bEffect\.log\w*\(/;
const FETCH_REPLACED = /\bstubGlobal\(\s*["'`]fetch["'`]|\b(?:globalThis|window|global)\.fetch\s*=(?!=)/;
const PROCESS_ENV_WRITE = /\bprocess\.env(?:\.\w+|\[[^\]]+\])\s*=(?!=)|\bdelete\s+process\.env\b/;
const JSON_READ = /\.json\(\)|JSON\.parse\(/;
const CAST_JSON = /(?:\.json\(\)|JSON\.parse\([^;]*?\))\)?\s+as\s/;
const ZOD_SPECIFIER = /^zod(?:\/|$)/;
const ZOD_MODULE = "src/shared/utils/zod";
const JITLESS_ZOD = "z.config({ jitless: true });";
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

interface TomlTableParams {
	toml: string;
	table: string;
}

const tomlTable = ({ toml, table }: TomlTableParams): string => {
	const heading = `\n[${table}]\n`;
	const opens = toml.indexOf(heading);

	if (opens === -1) return "";

	const body = toml.slice(opens + heading.length);
	const closes = body.indexOf("\n[");

	return (closes === -1 ? body : body.slice(0, closes)).trim();
};

const wranglerTable = (table: string): string => tomlTable({ toml: WRANGLER_TOML, table });

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
const GLOSSARY_MD = read("GLOSSARY.md");
const PACKAGE_JSON = readJson("package.json");
const TSCONFIG = readJson("tsconfig.json");
const BIOME_JSON = readJson("biome.json");
const ASTRO_CONFIG = read("astro.config.ts");
const WRANGLER_TOML = read("wrangler.toml");

const IMPORT_META_ENV_READ = /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g;
const ENV_DTS_DECLARATION = /readonly ([A-Z][A-Z0-9_]*)/g;
const MODULE_SCOPE_SIDE_EFFECT = /^(?:\w[\w.]*\.addEventListener\(|(?:const|let)\s+\w+\s*=\s*window\.matchMedia\()/m;
const PRERENDERED_ROUTES = ["src/pages/privacy-policy.astro", "src/pages/terms-and-conditions.astro"];
const QUOTED_ROUTE = /^\t"(\/[^"]*)",$/gm;
const CACHE_TAG_LIST = /CONTENT_CACHE_TAGS = \[([^\]]+)\]/;
const DOUBLE_QUOTED_VALUE = /"([^"]+)"/g;
const INDEX_ROUTE = /(?:^|\/)index$/;
const TRAILING_ROUTE_SLASH = /\/$/;
const ROBOTS_DISALLOW = /^Disallow: (.+)$/gm;
const ROBOTS_SITEMAP = /^Sitemap: (.+)$/gm;
const SITE_DECLARATION = /^\tsite: environment\.SITE_URL,$/m;
const CONFIG_TIME_ENV_READ = /(?<!["'])import\.meta\.env\.\w+/;
const ENV_EXAMPLE_SITE_URL = /^SITE_URL=(.+)$/m;
const COLLECTION_FACTORY = "src/application/entities/collection.ts";
const SHARED_QUERIES = "src/application/entities/queries.ts";
const IDENTIFY_CHOICE = /identify: \(\w+\) => \w+\.(\w+)/g;
const INLINE_IDENTITY = /\.\.\.\w+, id: \w+\.(\w+) \}/g;
const PINNED_RUNTIME = /^- (Node|pnpm)\b/;
const VERSIONS_HEADING = "Versions";
const QUOTED_VERSION = /\d+\.\d+/;
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;
const REPINNED_RUNTIME = /^\s*(?:node-version|version|ruby-version|wranglerVersion):\s*["']?\d/m;
const CITED_IDENTITY = /`(\w+)` → `(\w+)`/g;
const SPREAD_AFTER_ID = /\{\s*id:[^}]*\.\.\./;
const HYDRATION_DIRECTIVES_ALLOWED = new Set(["load"]);
const NEWLINE = "\n";
const SCHEMA_BOOLEAN_DEFAULT = /(\w+): z\.boolean\(\)\.default\(false\)/g;
const SNAKE_CASED = /[A-Z]/g;
const DEFAULTED_IN_THE_DTO_LAYER = (field: string) =>
	new RegExp(
		String.raw`\b(?:${field}\s*[:=]|return)\s*flagOf\(rawArticle\.data\.${field.replace(SNAKE_CASED, (letter) => `_${letter.toLowerCase()}`)}\)`,
	);
const CONTEXT_TAG_CLASS = /class\s+\w+\s+extends\s+Context\.Tag/;
const LAUNDERED_SECRET = /getSecret\([^)]*\)\s+as\s+string/;
const NESTED_GUIDES = walk("src").filter((file) => file.endsWith("AGENTS.md"));
const ADR_FILES = walk("docs").filter((file) => file.endsWith(".md") && file.startsWith("docs/adr/"));
const WIKI_FILES = walk("docs").filter((file) => file.endsWith(".md") && file.startsWith("docs/wiki/"));
const CODING_STANDARDS = "CODING_STANDARDS.md";
const GUIDES = ["AGENTS.md", "GLOSSARY.md", CODING_STANDARDS, ...NESTED_GUIDES];
const DOCS = [...GUIDES, ".github/CONTRIBUTING.md", ...ADR_FILES, ...WIKI_FILES];
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

interface CssDeclaration {
	declaration: string;
	preludes: string[];
}

const declarationsIn = (stylesheet: string): CssDeclaration[] => {
	const preludes: string[] = [];
	const found: CssDeclaration[] = [];
	let statement = "";

	const settle = () => {
		const declaration = statement.trim();

		if (declaration) found.push({ declaration, preludes: [...preludes] });

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

	return found;
};

const declaredOutsideTheGuard = (kind: RegExp) => (stylesheet: string) =>
	declarationsIn(stylesheet)
		.filter(
			({ declaration, preludes }) =>
				kind.test(declaration) &&
				!(
					preludes.some((prelude) => SCROLL_DRIVEN_SUPPORTS.test(prelude)) &&
					preludes.some((prelude) => MOTION_OPT_IN.test(prelude))
				),
		)
		.map(({ declaration }) => declaration);

const pathCommands = (data: string) =>
	[...data.matchAll(PATH_COMMAND)]
		.map(([, letter, numbers]) => `${letter}${numbers.match(PATH_NUMBER)?.length ?? 0}`)
		.join(" ");

const deadUtilities = (stylesheets: string) => {
	const declarations = declarationsIn(stylesheets);
	const propertyOf = (declaration: string) => declaration.split(":")[0].trim();
	const settingOf = (declaration: string) => declaration.slice(declaration.indexOf(":") + 1).trim();
	const utilities = new Map<string, Map<string, string>>();
	const nested = new Set<string>();
	const settled = new Map<string, Map<string, string>>();

	for (const { declaration, preludes } of declarations) {
		const property = propertyOf(declaration);
		const utility = LAYER_WRAPPER.test(preludes[0] ?? "") ? preludes[1]?.match(SINGLE_CLASS_RULE)?.[1] : undefined;
		const component = preludes.length === 1 ? preludes[0].match(SINGLE_CLASS_RULE)?.[1] : undefined;

		if (utility && preludes.length > 2) nested.add(utility);

		if (utility && preludes.length === 2 && !property.startsWith("--")) {
			utilities.set(utility, (utilities.get(utility) ?? new Map()).set(property, settingOf(declaration)));
		}

		if (component) settled.set(component, (settled.get(component) ?? new Map()).set(property, settingOf(declaration)));
	}

	for (const name of nested) utilities.delete(name);

	return (markup: string) =>
		[...markup.matchAll(CLASS_ATTRIBUTE_VALUE)].flatMap(([, value]) => {
			const words = value.trim().split(WHITESPACE);
			const owners = words.filter((word) => settled.has(word));
			const settledBy = (property: string) => owners.map((word) => settled.get(word)?.get(property)).find(Boolean);
			const display = settledBy("display") ?? words.map((word) => utilities.get(word)?.get("display")).find(Boolean);
			const inert = (property: string) => {
				if (display === undefined || FLEX_DISPLAYS.has(display)) return false;

				return (
					FLEX_ONLY_PROPERTIES.has(property) || (ALIGNMENT_PROPERTIES.has(property) && !GRID_DISPLAYS.has(display))
				);
			};

			return words
				.filter((word) => utilities.has(word))
				.filter((word) =>
					[...(utilities.get(word)?.keys() ?? [])].every(
						(property) => settledBy(property) !== undefined || inert(property),
					),
				)
				.map((word) => `class="${value}": .${word}`);
		});
};

const unreadIds = (sources: string[]) => {
	const declared = sources.flatMap((source) => [...source.matchAll(STATIC_ID_ATTRIBUTE)].map(([, id]) => id));
	const mentions = (id: string) =>
		sources.reduce(
			(count, source) => count + (source.match(new RegExp(`(?<![\\w-])${id}(?![\\w-])`, "g"))?.length ?? 0),
			0,
		);

	return [...new Set(declared)].filter((id) => mentions(id) <= declared.filter((other) => other === id).length);
};

const START_OF_FRAME_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

const jpegSize = (bytes: Buffer) => {
	let offset = 2;

	while (offset + 9 <= bytes.length && bytes[offset] === 0xff) {
		const marker = bytes[offset + 1];

		if (START_OF_FRAME_MARKERS.has(marker)) {
			return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
		}

		offset += 2 + bytes.readUInt16BE(offset + 2);
	}

	return undefined;
};

const svgPaintFaults = (stylesheet: string) => {
	const declarations = declarationsIn(stylesheet);

	return declarations
		.filter(({ declaration }) => SVG_URL.test(declaration))
		.flatMap(({ declaration, preludes }) => {
			if (!MASK_PROPERTY.test(declaration)) return [`${declaration} draws an svg with its own fill`];

			const painted = declarations.some(
				(other) => other.preludes.join("|") === preludes.join("|") && CURRENT_COLOUR_FILL.test(other.declaration),
			);

			return painted ? [] : [`${declaration} masks an svg that no background-color: currentColor paints`];
		});
};

interface ArrowBoxFaultsParams {
	holders: Set<string>;
	stylesheet: string;
}

interface StyledSubject {
	rule: string;
	classes: string[];
	property: string;
	value: string;
}

const styledSubjectsIn = (stylesheet: string): StyledSubject[] =>
	declarationsIn(stylesheet).map(({ declaration, preludes }) => {
		const rule = preludes.findLast((prelude) => !prelude.startsWith("@")) ?? "";
		const subjects = selectorsOf(rule).map((selector) => selector.split(COMBINATOR_OUTSIDE_PARENTHESES).at(-1) ?? "");

		return {
			rule,
			classes: subjects.flatMap((subject) => [...subject.matchAll(ANY_CLASS_TOKEN)].map(([, name]) => name)),
			property: declaration.slice(0, declaration.indexOf(":")).trim(),
			value: declaration
				.slice(declaration.indexOf(":") + 1)
				.replace(WHITESPACE_RUN, " ")
				.trim(),
		};
	});

const arrowBoxFaults = ({ holders, stylesheet }: ArrowBoxFaultsParams): string[] =>
	styledSubjectsIn(stylesheet)
		.filter(({ classes, property, value }) => {
			const holdsTheArrow = classes.some((name) => holders.has(name));

			return holdsTheArrow && ARROW_BOX_MOTION.test(property) && REVEALED_ARROW_BOX.get(property) !== value;
		})
		.map(({ rule, property, value }) => `${rule} { ${property}: ${value} }`);

const revealedClassesIn = (stylesheet: string): string[] =>
	styledSubjectsIn(stylesheet)
		.filter(({ property, value }) => property === "opacity" && REVEALED_ARROW_BOX.get(property) === value)
		.flatMap(({ classes }) => classes);

const keyframesDeclaredIn = (stylesheet: string) =>
	[...stylesheet.matchAll(KEYFRAMES_DECLARATION)].map(([, name]) => name);

const animationNamesIn = (stylesheet: string) =>
	declarationsIn(stylesheet)
		.filter(({ declaration }) => ANIMATION_PROPERTY.test(declaration))
		.flatMap(({ declaration }) => declaration.replace(ANIMATION_PROPERTY, "").trim().split(ANIMATION_VALUE_SEPARATOR));

const misplacedKeyframes = (sheets: Map<string, string>) => {
	const readersOf = (name: string) =>
		[...sheets].filter(([, css]) => animationNamesIn(css).includes(name)).map(([file]) => file);

	return [...sheets].flatMap(([file, css]) =>
		keyframesDeclaredIn(css).flatMap((name) => {
			const readers = readersOf(name);
			const inGlobalCascade = file.startsWith(GLOBAL_CASCADE);

			if (readers.length === 0) return [`${file}: ${name} is read by no stylesheet`];

			if (inGlobalCascade) {
				return readers.length === 1 && !readers[0].startsWith(GLOBAL_CASCADE)
					? [`${file}: ${name} is read only by ${readers[0]}, which should declare it`]
					: [];
			}

			return readers.length === 1 && readers[0] === file
				? []
				: [`${file}: ${name} is read by ${readers.join(", ")}, so only the global cascade can declare it`];
		}),
	);
};

const classesOwnedBy = (owned: Set<string>) => (stylesheet: string) =>
	selectorClassesIn(stylesheet.replace(NOT_ARGUMENT, "")).filter((name) => owned.has(classBlock(name)));

const viewTransitionNavigations = (stylesheet: string) =>
	declarationsIn(stylesheet)
		.filter(({ declaration }) => NAVIGATION_DECLARATION.test(declaration))
		.map(({ declaration, preludes }) => ({
			value: declaration.replace(NAVIGATION_DECLARATION, "").trim(),
			rule: preludes.at(-1),
			reduced: preludes.some((prelude) => MOTION_REDUCE.test(prelude)),
		}));

const unguardedTimelines = declaredOutsideTheGuard(ANIMATION_TIMELINE_DECLARATION);
const unguardedFixedLayers = declaredOutsideTheGuard(FIXED_POSITION_DECLARATION);

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

	it("is reached from outside only by live.config.ts, which is what makes astro:content the seam", () => {
		const outside = importersOf("@application/").filter((file) => !file.startsWith("src/application/"));

		expect(outside).toEqual(["src/live.config.ts"]);
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

interface ExpectedAdrNumbersParams {
	numbers: number[];
	withdrawn: Set<number>;
}

const expectedAdrNumbers = ({ numbers, withdrawn }: ExpectedAdrNumbersParams): number[] =>
	Array.from({ length: Math.max(...numbers, ...withdrawn) + 1 }, (_, number) => number).filter(
		(number) => !withdrawn.has(number),
	);

interface IsAdrSequenceParams {
	numbers: number[];
	withdrawn: Set<number>;
}

const isAdrSequence = ({ numbers, withdrawn }: IsAdrSequenceParams): boolean =>
	JSON.stringify(numbers) === JSON.stringify(expectedAdrNumbers({ numbers, withdrawn }));

describe("ADRs", () => {
	const referencesIn = (doc: string) => {
		const body = read(doc);

		return [
			...[...body.matchAll(ADR_REFERENCE)].flatMap(([, numbers]) => numbers.match(ADR_NUMBER) ?? []),
			...[...body.matchAll(ADR_PATH_REFERENCE)].map(([, number]) => number),
		];
	};

	it("numbers files sequentially from the template, with no duplicates and no gap but a withdrawn number, which is never taken again", () => {
		const numbers = ADR_FILES.map((file) => Number(file.split("/").pop()?.slice(0, 4)));

		expect(isAdrSequence({ numbers: [0, 1, 3], withdrawn: new Set([2]) })).toBe(true);
		expect(isAdrSequence({ numbers: [0, 1, 3], withdrawn: new Set([2, 4]) })).toBe(true);
		expect(isAdrSequence({ numbers: [0, 1, 3], withdrawn: new Set() })).toBe(false);
		expect(isAdrSequence({ numbers: [0, 1, 2, 3], withdrawn: new Set([2]) })).toBe(false);
		expect(isAdrSequence({ numbers: [0, 1, 1, 3], withdrawn: new Set([2]) })).toBe(false);
		expect(isAdrSequence({ numbers: [0, 1, 3, 4], withdrawn: new Set([2, 4]) })).toBe(false);
		expect(numbers.length).toBeGreaterThan(ADR_NUMBERS_WITHDRAWN.size);
		expect(numbers).toEqual(expectedAdrNumbers({ numbers, withdrawn: ADR_NUMBERS_WITHDRAWN }));
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

const BACKLOG_FILE = /(?:^|\/)backlog\.md$/i;
const KNOWN_BREACHES_HEADING = /^#{1,6}\s+(?:\d+\.\s+)?Known (?:inconsistencies|defects|breaches)\b/im;

describe("the documents keep no backlog", () => {
	const tree = walk(".");
	const markdown = tree.filter((file) => file.endsWith(".md"));

	it("fixes a breach in the change that finds it, or reports it on the pull request, so no backlog and no list of known breaches holds a claim that nothing keeps true", () => {
		const backlogs = tree.filter((file) => BACKLOG_FILE.test(file));
		const listing = markdown.filter((file) => KNOWN_BREACHES_HEADING.test(read(file)));

		expect(["./docs/BACKLOG.md", "./BACKLOG.md", "./docs/backlog.md"].map((file) => BACKLOG_FILE.test(file))).toEqual([
			true,
			true,
			true,
		]);
		expect(["./docs/backlog-notes.md", "./docs/no-backlog.md"].map((file) => BACKLOG_FILE.test(file))).toEqual([
			false,
			false,
		]);
		expect(
			[
				"## 8. Known inconsistencies\n\n- an entry\n",
				"### Known defects\n",
				"intro\n\n## Known breaches of the coding standards\n",
			].map((text) => KNOWN_BREACHES_HEADING.test(text)),
		).toEqual([true, true, true]);
		expect(
			["a breach is not a known breaches list", "**Known defects** in a sentence"].map((text) =>
				KNOWN_BREACHES_HEADING.test(text),
			),
		).toEqual([false, false]);
		expect(DOCS.filter((doc) => !markdown.includes(`./${doc}`))).toEqual([]);
		expect(backlogs).toEqual([]);
		expect(listing).toEqual([]);
	});
});

describe("domain vocabulary", () => {
	const concepts = directoriesIn("src/domain");

	it("gives every domain concept a glossary entry in GLOSSARY.md", () => {
		expect(concepts.length).toBeGreaterThan(CONCEPTS_OUTSIDE_THE_GLOSSARY.size);

		const missing = concepts
			.filter((concept) => !CONCEPTS_OUTSIDE_THE_GLOSSARY.has(concept))
			.filter((concept) => !GLOSSARY_MD.includes(`**${concept[0].toUpperCase()}${concept.slice(1)}**`));

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

	it("registers every entity loader as a live collection", () => {
		const liveConfig = read("src/live.config.ts");
		const entities = directoriesIn("src/application/entities");

		expect(entities.length).toBeGreaterThan(0);
		expect(entities.filter((entity) => !liveConfig.includes(`${entity}: defineLiveCollection(${entity})`))).toEqual([]);
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
		const cap = entries.match(EMDASH_PAGE_CAP)?.[1];

		expect(cap).toBeDefined();
		expect(guide).toContain("the page cursor, and with it the promise that the answer is complete");
		expect(guide).toContain(`capped at ${cap} per request`);
		expect(entries).toContain("page.nextCursor");
	});

	it("reads references with the bounded concurrency it quotes", () => {
		const entries = read("src/infrastructure/cms/entries.ts");
		const inFlight = entries.match(REFERENCE_CONCURRENCY)?.[1];

		expect(inFlight).toBeDefined();
		expect(guide).toContain(`\`REFERENCE_READS_IN_FLIGHT\` (${inFlight})`);
		expect(entries).toContain("{ concurrency: REFERENCE_READS_IN_FLIGHT }");
	});

	it("asks EmDash's public query API for published entries only, which serves no draft outside a preview", () => {
		const client = read("src/infrastructure/cms/client.ts");

		expect(client).toContain('PUBLISHED_STATUS = "published"');
		expect(client).toContain("status: PUBLISHED_STATUS");
		expect(client).toContain('import("emdash")');
		expect(client).toContain("emdash.getEmDashCollection(");
		expect(client).toContain("emdash.getEmDashReferences(");
		expect(read("AGENTS.md")).toContain("A public query never sees a draft.");
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
		expect(ASTRO_CONFIG).toContain('external: ["node:async_hooks"]');
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
		expect(WRANGLER_TOML).toContain('main = "./src/worker.ts"');
		expect(read("src/worker.ts")).toContain('from "@emdash-cms/cloudflare/worker"');
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
			.filter(({ linter }: BiomeOverride) => linter?.rules?.suspicious?.noConsole === "off")
			.flatMap(({ includes }: BiomeOverride) => includes);

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

	it("names each inline script in the production policy by its digest, derived from the text the page renders", () => {
		const hashing = read(INLINE_SCRIPTS_MODULE);
		const directives = [...hashing.matchAll(DIRECTIVE_SCRIPT_IMPORT)].map(([, name]) => name);

		expect(AGENTS_MD).toContain("`script-src` names each inline script by its sha256");
		expect(read("docs/adr/0013-analytics-gated-behind-cookie-consent.md")).toContain(
			"named in the policy by its digest",
		);
		expect(hashing).toContain("THEME_BOOTSTRAP_SCRIPT");
		expect(hashing).toContain("consentBootstrapScript(analyticsId)");
		expect(read("astro.config.ts")).toContain("inlineScriptHashes(environment.GOOGLE_ANALYTICS_ID)");
		expect(read("src/middleware.ts")).toContain("inlineScriptHashes(GOOGLE_ANALYTICS_ID)");
		expect([
			...'import load from "astro/runtime/client/load.prebuilt.js";'.matchAll(DIRECTIVE_SCRIPT_IMPORT),
		]).toHaveLength(1);
		expect(directives.length).toBeGreaterThan(0);
		expect(directives.sort()).toEqual([...HYDRATION_DIRECTIVES_ALLOWED].sort());
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

	it("decodes the blur placeholder inside the image mapper, so nothing fetches after the DTO", () => {
		expect(guide).toContain("Nothing here fetches after the DTO.");

		expect(loaderSteps.length).toBeGreaterThan(loaders.length);
		expect([...loaderSteps, PLACEHOLDER_MODULE].filter((file) => PLACEHOLDER_FETCH.test(read(file)))).toEqual([]);
		expect(read("src/application/dto/shared/images.ts")).toContain("imagePlaceholder({");
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

	it("reads an Article's publish date in the one function that names the entry it refuses, beside the slug", () => {
		const reader = "src/application/dto/article/utils/reference.ts";

		expect(guide).toContain("`articlePublishDateISO`");
		expect(read(reader)).toMatch(ARTICLE_PUBLISH_DATE_READER);
		expect(dtoFiles).toContain(reader);
		expect(dtoFiles.filter((file) => file !== reader && RAW_PUBLISH_DATE_READ.test(read(file)))).toEqual([]);
	});

	it("reads a raw Author's and Tag's name and slug, and an Article's Favorite flag, in one helper each, so every reader trims and defaults alike", () => {
		const identities = ["src/application/dto/author/utils/author.ts", "src/application/dto/tag/utils/tag.ts"];
		const reference = "src/application/dto/article/utils/reference.ts";

		for (const helper of ["authorIdentity", "tagIdentity", "articleTagSlugs", "credits", "articleIsFavorite"]) {
			expect(guide).toContain(`\`${helper}\``);
		}

		const readers = dtoFiles.filter((file) => AUTHOR_AND_TAG_READER.test(file));

		expect(identities.filter((file) => !IDENTITY_TRIM.test(read(file)))).toEqual([]);
		expect(readers.length).toBeGreaterThan(identities.length);
		expect(readers.filter((file) => !identities.includes(file) && IDENTITY_TRIM.test(read(file)))).toEqual([]);
		expect(RAW_FAVORITE_READ.test(read(reference))).toBe(true);
		expect(dtoFiles.filter((file) => file !== reference && RAW_FAVORITE_READ.test(read(file)))).toEqual([]);
	});

	it("orders nothing itself: a comparator is a domain rule the mappers call, so one rule has one implementation", () => {
		const mappers = [...dtoFiles, ...loaderSteps];

		expect(mappers.length).toBeGreaterThan(dtoFiles.length);
		expect(mappers.filter((file) => COMPARATOR.test(read(file)))).toEqual([]);
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

	it("receives asset urls as paths from the client, made absolute only by absoluteUrl where they are written out", () => {
		expect(guide).toContain("An asset URL arrives relative, on this Worker's origin");
		expect(read("src/domain/shared/image.ts")).toMatch(RELATIVE_IMAGE_URL_SCHEMA);
		expect(read("src/infrastructure/cms/client.ts")).toMatch(MEDIA_RESOLUTION);
		expect(read("src/ui/modules/core/components/seo/Seo.astro")).toContain("absoluteUrl(image)");
		expect(read("src/ui/modules/core/utils/jsonLd.ts")).toContain("absoluteUrl(person.image)");
		expect(read("src/ui/modules/core/utils/jsonLd.ts")).toContain("imageCrops.map((crop) => absoluteUrl(crop))");

		const readers = production(walk("src")).filter((file) => SOURCE_FILE.test(file));

		expect(readers.length).toBeGreaterThan(0);
		expect(readers.filter((file) => HAND_PREFIXED_ASSET_URL.test(read(file)))).toEqual([]);
	});

	it("stops EmDash types at this layer: nothing downstream sees them", () => {
		expect(guide).toContain("EmDash types stop here");

		const downstream = production([...walk("src/domain"), ...walk("src/ui"), ...walk("src/pages")]).filter((file) =>
			SOURCE_FILE.test(file),
		);

		expect(downstream.length).toBeGreaterThan(0);
		expect(downstream.filter((file) => CMS_TYPE.test(read(file)))).toEqual([]);
	});

	it("fetches through fetchEntries, and binds a schema the domain exports as it is, never one it builds", () => {
		expect(loaders.length).toBeGreaterThan(0);
		expect(guide).toContain("`fetchEntries<[RawEntry, …]>(query, …)`");

		const broken = loaders.filter((file) => {
			const source = read(file);
			const fetches = LOADER_FETCH_ENTRIES.test(source) || source.includes("await fetchArticlesAndAuthors()");

			return !fetches || !DOMAIN_SCHEMA_BINDING.test(source) || !DOMAIN_IMPORT.test(source);
		});

		expect(broken).toEqual([]);
		expect(read(SHARED_QUERIES)).toContain("fetchEntries<[RawArticle, RawAuthor]>(ARTICLES_QUERY, AUTHORS_QUERY)");
	});

	it("leaves the batching and Effect itself to that one interface", () => {
		expect(guide).toContain("no Effect, no `CmsClient`, no runtime; no page cursor either");

		const entries = read("src/infrastructure/cms/entries.ts");

		expect(entries).toContain('{ concurrency: "unbounded" }');
		expect(loaderSteps.length).toBeGreaterThan(loaders.length);
		expect(loaderSteps.filter((file) => LOADER_REACHING_PAST_FETCH_ENTRIES.test(read(file)))).toEqual([]);
	});

	it("cites the id every loader assigns, and spreads before it rather than after", () => {
		const step = guide.split(NEWLINE).find((line) => line.includes("key every entry with `identify`")) ?? "";
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

		expect(read(COLLECTION_FACTORY)).toContain("({ id: identify(data), data })");
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

	it("scrolls an animation only inside @supports and a no-preference motion query, since without the feature it holds its last frame and a reduced-motion reset cannot shorten a scroll timeline", () => {
		expect(guide).toContain("runs in zero seconds and holds its last frame");
		expect(guide).toContain("a scroll timeline ignores the duration the reset shortens");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const unguarded = stylesheets.flatMap((file) =>
			unguardedTimelines(read(file)).map((declaration) => `${file}: ${declaration}`),
		);
		const supports = "@supports (animation-timeline: view())";
		const motion = "@media (prefers-reduced-motion: no-preference)";
		const declaration = ".a { animation-timeline: view(); }";

		expect(unguardedTimelines(`${motion} { ${supports} { ${declaration} } }`)).toEqual([]);
		expect(unguardedTimelines(`${supports} { ${motion} { ${declaration} } }`)).toEqual([]);
		expect(unguardedTimelines(`${supports} { ${declaration} }`)).toEqual(["animation-timeline: view()"]);
		expect(unguardedTimelines(`${motion} { ${declaration} }`)).toEqual(["animation-timeline: view()"]);
		expect(
			unguardedTimelines(
				`${motion} { @supports not (animation-timeline: view()) { .a { animation-timeline: view() } } }`,
			),
		).toEqual(["animation-timeline: view()"]);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect(unguarded).toEqual([]);
	});

	it("fixes a layer in place only inside the scroll timeline guard of a stylesheet that animates by one, since a layer only a timeline uncovers hides the rest without it", () => {
		expect(guide).toContain("lays the image out beside its text in flow");

		const timelined = walk("src").filter(
			(file) => file.endsWith(".css") && ANIMATION_TIMELINE_ANYWHERE.test(read(file)),
		);
		const fixing = timelined.filter((file) => FIXED_ANYWHERE.test(read(file)));
		const unguarded = timelined.flatMap((file) =>
			unguardedFixedLayers(read(file)).map((declaration) => `${file}: ${declaration}`),
		);
		const supports = "@supports (animation-timeline: view())";
		const motion = "@media (prefers-reduced-motion: no-preference)";
		const declaration = ".a { position: fixed; }";

		expect(unguardedFixedLayers(`${motion} { ${supports} { ${declaration} } }`)).toEqual([]);
		expect(
			unguardedFixedLayers(`${motion} { ${supports} { @container page (width >= 1px) { ${declaration} } } }`),
		).toEqual([]);
		expect(unguardedFixedLayers(`${supports} { ${declaration} }`)).toEqual(["position: fixed"]);
		expect(unguardedFixedLayers(`@container page (width >= 1px) { ${declaration} }`)).toEqual(["position: fixed"]);
		expect(unguardedFixedLayers(".a { position: sticky; }")).toEqual([]);
		expect(timelined.length).toBeGreaterThan(0);
		expect(fixing.length).toBeGreaterThan(0);
		expect(unguarded).toEqual([]);
	});

	it("stops view transitions for a reader who asked for less motion: a cross-document one by opting its @view-transition rule out, any other by removing the animation of its pseudo-elements", () => {
		expect(guide).toContain("`navigation` is a descriptor of that rule, not a property");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const found = stylesheets.flatMap((file) =>
			viewTransitionNavigations(read(file)).map((navigation) => ({ file, ...navigation })),
		);
		const optIn = "@view-transition { navigation: auto; }";
		const optOut = "@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }";
		const pseudos = "::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*)";
		const stopped = (stylesheet: string) =>
			declarationsIn(stylesheet)
				.filter(
					({ declaration, preludes }) =>
						STOPPED_ANIMATION.test(declaration) && preludes.some((prelude) => MOTION_REDUCE.test(prelude)),
				)
				.map(({ preludes }) => preludes.at(-1)?.replace(WHITESPACE_RUN, " "));

		expect(viewTransitionNavigations(`${optIn} ${optOut}`)).toEqual([
			{ value: "auto", rule: "@view-transition", reduced: false },
			{ value: "none", rule: "@view-transition", reduced: true },
		]);
		expect(viewTransitionNavigations("html { @media (prefers-reduced-motion: reduce) { navigation: auto; } }")).toEqual(
			[{ value: "auto", rule: "@media (prefers-reduced-motion: reduce)", reduced: true }],
		);
		expect(stopped(`@media (prefers-reduced-motion: reduce) { ${pseudos} { animation: none !important; } }`)).toEqual([
			VIEW_TRANSITION_PSEUDOS,
		]);
		expect(stopped(`${pseudos} { animation: none !important; }`)).toEqual([]);
		expect(found.length).toBeGreaterThan(0);
		expect(found.filter(({ rule }) => rule !== "@view-transition")).toEqual([]);

		for (const file of new Set(found.map((navigation) => navigation.file))) {
			expect(
				found
					.filter((navigation) => navigation.file === file)
					.map(({ value, reduced }) => `${value}${reduced ? " when reduced" : ""}`),
				file,
			).toEqual(["auto", "none when reduced"]);
			expect(stopped(read(file)), file).toEqual([VIEW_TRANSITION_PSEUDOS]);
		}
	});

	it("declares a keyframes block in the one stylesheet that reads it, and in the global cascade only for a global stylesheet or for two readers, since a stylesheet loads only where its component renders", () => {
		expect(guide).toContain("`@keyframes` sit beside the stylesheet that reads them");

		const sheets = new Map(
			walk("src")
				.filter((file) => file.endsWith(".css"))
				.map((file) => [file, read(file)]),
		);
		const declared = [...sheets].flatMap(([file, css]) => keyframesDeclaredIn(css).map((name) => ({ file, name })));
		const global = "src/ui/styles/global/animations.css";
		const keyframes = "@keyframes a { to { opacity: 1; } }";
		const sample = (files: Record<string, string>) => misplacedKeyframes(new Map(Object.entries(files)));

		expect(sample({ [global]: keyframes, "src/ui/modules/x/x.css": ".x { animation: a 1s linear both; }" })).toEqual([
			`${global}: a is read only by src/ui/modules/x/x.css, which should declare it`,
		]);
		expect(
			sample({
				[global]: keyframes,
				"src/ui/modules/x/x.css": ".x { animation: a 1s; }",
				"src/ui/modules/y/y.css": ".y { animation-name: b, a; }",
			}),
		).toEqual([]);
		expect(sample({ [global]: keyframes, "src/ui/styles/global/reveal.css": ".r { animation: a both; }" })).toEqual([]);
		expect(sample({ "src/ui/modules/x/x.css": `${keyframes} .x { animation: a 1s; }` })).toEqual([]);
		expect(
			sample({ "src/ui/modules/x/x.css": keyframes, "src/ui/modules/y/y.css": ".y { animation: a 1s; }" }),
		).toEqual([
			"src/ui/modules/x/x.css: a is read by src/ui/modules/y/y.css, so only the global cascade can declare it",
		]);
		expect(sample({ "src/ui/modules/x/x.css": keyframes })).toEqual([
			"src/ui/modules/x/x.css: a is read by no stylesheet",
		]);
		expect(declared.filter(({ file }) => file.startsWith(GLOBAL_CASCADE)).length).toBeGreaterThan(0);
		expect(declared.filter(({ file }) => !file.startsWith(GLOBAL_CASCADE)).length).toBeGreaterThan(0);
		expect(misplacedKeyframes(sheets)).toEqual([]);
	});

	it("keeps the rules of a component in its stylesheet: the global cascade selects no class a component owns, and reveal.css names only the reveal blocks", () => {
		expect(guide).toContain("A global stylesheet selects no class a component owns");

		const owned = new Set(COMPONENT_FOLDERS.flatMap((folder) => [kebab(basename(folder)), ...parentBlocksOf(folder)]));
		const stylesheets = walk("src/ui/styles").filter((file) => file.endsWith(".css") && file !== VENDOR_STYLESHEET);
		const claimed = stylesheets.flatMap((file) => classesOwnedBy(owned)(read(file)).map((name) => `${file}: .${name}`));
		const reveal = new Set(selectorClassesIn(read("src/ui/styles/global/reveal.css")).map(classBlock));

		expect(classesOwnedBy(new Set(["logo"]))(".logo__link { scale: 1; } .logo { a: b; }")).toEqual([
			"logo__link",
			"logo",
		]);
		expect(classesOwnedBy(new Set(["logo"]))("svg { &:not(.logo, .x svg) { fill: red; } }")).toEqual([]);
		expect(owned.size).toBeGreaterThan(0);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect(claimed).toEqual([]);
		expect(reveal.size).toBeGreaterThan(0);
		expect([...reveal].filter((block) => !REVEAL_BLOCKS.has(block))).toEqual([]);
	});

	it("keeps the stretch arrow's rest path in its svg alone, with the hover tokens on the same path commands, since a d only morphs between paths of one shape", () => {
		expect(guide).toContain("`StretchArrow.tsx` reads its paths from it");

		const svg = read("src/ui/assets/images/svg/stretch-arrow.svg");
		const component = read("src/ui/assets/images/svg-components/stretchArrow/StretchArrow.tsx");
		const variables = read("src/ui/styles/global/variables.css");
		const named = (matches: IterableIterator<RegExpMatchArray>) =>
			Object.fromEntries([...matches].map(([, name, data]) => [name, pathCommands(data)]));
		const rest = named(svg.matchAll(STRETCH_ARROW_SVG_PATH));
		const hover = named(variables.matchAll(STRETCH_ARROW_HOVER_TOKEN));

		expect(pathCommands("M 5,12 h 14")).toBe("M2 h1");
		expect(pathCommands("M 12,5 l 7,7 l -7,7")).toBe("M2 l2 l2");
		expect(pathCommands("M12 5L7.5-3z")).toBe("M2 L2 z0");
		expect(Object.keys(rest).sort()).toEqual(["shaft", "tip"]);
		expect(hover).toEqual(rest);
		expect(component).toContain("stretch-arrow.svg?raw");
		expect(PATH_DATA_LITERAL.test(component)).toBe(false);
	});

	it("draws an svg from a stylesheet as a mask over currentColor, never as a background, since the file's own fill ignores the theme", () => {
		expect(guide).toContain("An svg a stylesheet draws is a mask painted with `currentColor`");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const drawing = stylesheets.filter((file) => SVG_URL.test(read(file)));
		const faults = stylesheets.flatMap((file) => svgPaintFaults(read(file)).map((fault) => `${file}: ${fault}`));

		expect(svgPaintFaults('.a::before { background: url("x.svg") no-repeat right center / 1rem; }')).toEqual([
			'background: url("x.svg") no-repeat right center / 1rem draws an svg with its own fill',
		]);
		expect(svgPaintFaults('.a::before { background-color: currentColor; mask: url("x.svg") no-repeat; }')).toEqual([]);
		expect(svgPaintFaults(".a::before { mask-image: url(x.svg); }")).toEqual([
			"mask-image: url(x.svg) masks an svg that no background-color: currentColor paints",
		]);
		expect(svgPaintFaults('.a { background: url("x.png"); } @import url("y.css");')).toEqual([]);
		expect(drawing.length).toBeGreaterThan(0);
		expect(faults).toEqual([]);
	});

	it("puts no atomic utility on an element whose own block settles every property it sets, or makes it inert, since a component stylesheet is unlayered and beats it", () => {
		expect(guide).toContain("A utility an element's own block already settles is dead there");

		const stylesheets = [
			...walk("src/ui/styles/global").filter((file) => file.endsWith(".css")),
			...walk("src")
				.filter((file) => file.endsWith(".css"))
				.filter((file) => !file.startsWith("src/ui/styles/")),
		]
			.map((file) => read(file))
			.join("\n");
		const templates = production(walk("src").filter((file) => /\.(astro|tsx)$/.test(file)));
		const attributes = templates.flatMap((file) => [...read(file).matchAll(CLASS_ATTRIBUTE_VALUE)]);
		const dead = templates.flatMap((file) =>
			deadUtilities(stylesheets)(read(file)).map((fault) => `${file}: ${fault}`),
		);
		const sample = `@layer global { .flex { display: flex; } .grid { display: grid; } .row-wrap { flex-flow: row wrap; } .between { justify-content: space-between; } .centre { align-items: center; } .wrapper { max-width: 10px; @container x (width > 1px) { padding: 0; } } } .a { display: grid; } .b { justify-content: flex-end; } .c { display: block; } .d { @media (width > 1px) { justify-content: start; } }`;
		const deadIn = (markup: string) => deadUtilities(sample)(markup);

		expect(deadIn('<div class="a flex row-wrap">')).toEqual([
			'class="a flex row-wrap": .flex',
			'class="a flex row-wrap": .row-wrap',
		]);
		expect(deadIn('<div class="b flex between">')).toEqual(['class="b flex between": .between']);
		expect(deadIn('<div class="c flex centre">')).toEqual([
			'class="c flex centre": .flex',
			'class="c flex centre": .centre',
		]);
		expect(deadIn('<div class="a centre between">')).toEqual([]);
		expect(deadIn('<div class="d between">')).toEqual([]);
		expect(deadIn('<div class="a wrapper">')).toEqual([]);
		expect(deadIn('<div class="flex row-wrap between centre">')).toEqual([]);
		expect(deadIn('<div class="b {x}">')).toEqual([]);
		expect(attributes.length).toBeGreaterThan(0);
		expect(dead).toEqual([]);
	});

	it("reads a count with sibling-count(), so typed attr() reads only the two stagger attributes the guide names", () => {
		expect(guide).toContain("`data-index` + typed `attr()`");
		expect(guide).toContain("`data-reveal-index`");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const attributes = [
			...new Set(stylesheets.flatMap((file) => [...read(file).matchAll(TYPED_ATTR_READ)].map(([, name]) => name))),
		].sort();

		expect([..."z-index: attr(data-x type(<number>), 0)".matchAll(TYPED_ATTR_READ)].map(([, name]) => name)).toEqual([
			"data-x",
		]);
		expect([..."content: attr(data-x)".matchAll(TYPED_ATTR_READ)]).toEqual([]);
		expect(attributes).toEqual(["data-index", "data-reveal-index"]);
	});

	it("writes a colour literal in variables.css alone, so every other stylesheet, the vendor's included, reads a token", () => {
		expect(guide).toContain("Colour literals live in `variables.css`");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css") && file !== TOKEN_FILE);
		const literals = stylesheets.flatMap((file) =>
			[...read(file).matchAll(COLOUR_LITERAL)].map(([literal]) => `${file}: ${literal}`),
		);
		const found = (css: string) => [...css.matchAll(COLOUR_LITERAL)].map(([literal]) => literal);

		expect(found("a { color: oklch(0 0 0); background: rgb(0 0 0 / 5%); }")).toEqual(["oklch(", "rgb("]);
		expect(found("a { fill: #fff; stroke: #c0ffee; }")).toEqual(["#fff", "#c0ffee"]);
		expect(found("a { color: color-mix(in srgb, var(--a) 5%, var(--b)); b: light-dark(var(--c), var(--d)); }")).toEqual(
			[],
		);
		expect(found("a { background: url(#cutout); --x: var(--oklch-base); }")).toEqual([]);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect(read(TOKEN_FILE).match(COLOUR_LITERAL)?.length).toBeGreaterThan(0);
		expect(literals).toEqual([]);
	});

	it("writes the stretch arrow's hover morph once, in global.css, which every trigger reaches by declaring --stretch-arrow: hover", () => {
		expect(guide).toContain("a trigger declares `--stretch-arrow: hover` in its hover state");

		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const reads = (token: string) =>
			stylesheets.flatMap((file) =>
				[...read(file).matchAll(new RegExp(`var\\(--stretch-arrow-${token}-hover\\)`, "g"))].map(() => file),
			);
		const triggers = stylesheets.filter((file) => STRETCH_ARROW_STATE_DECLARATION.test(read(file)));

		expect(reads("shaft")).toEqual([STRETCH_ARROW_MORPH_FILE]);
		expect(reads("tip")).toEqual([STRETCH_ARROW_MORPH_FILE]);
		expect(read(STRETCH_ARROW_MORPH_FILE).match(STRETCH_ARROW_STATE_QUERY)).toHaveLength(1);
		expect(triggers.length).toBeGreaterThan(1);
	});

	it("writes the box an arrow waits in once, as .arrow-box in global.css, so a trigger only reveals it and no two arrows hide at different offsets or speeds", () => {
		expect(guide).toContain("The box an arrow waits in until a hover reveals it is written once too");

		const box = declarationsIn(read(STRETCH_ARROW_MORPH_FILE)).filter(
			({ preludes }) => preludes.at(-1) === `.${ARROW_BOX}`,
		);
		const declared = (property: string) =>
			box
				.map(({ declaration }) => declaration.replace(WHITESPACE_RUN, " "))
				.find((declaration) => declaration.startsWith(`${property}: `));
		const templates = production(walk("src").filter((file) => file.endsWith(".astro")));
		const holding = templates.flatMap((file) => [...read(file).matchAll(INLINED_STRETCH_ARROW)].map(([tag]) => tag));
		const holders = new Set(holding.flatMap((tag) => classLiteralsIn(tag)));
		const stylesheets = walk("src").filter((file) => file.endsWith(".css") && file !== STRETCH_ARROW_MORPH_FILE);
		const faults = stylesheets.flatMap((file) =>
			arrowBoxFaults({ holders, stylesheet: read(file) }).map((fault) => `${file}: ${fault}`),
		);
		const revealed = new Set(stylesheets.flatMap((file) => revealedClassesIn(read(file))));
		const unboxed = holding.filter((tag) => {
			const classes = classLiteralsIn(tag);

			return classes.some((name) => revealed.has(name)) && !classes.includes(ARROW_BOX);
		});
		const sample = (stylesheet: string) => arrowBoxFaults({ holders: new Set(["x__arrow"]), stylesheet });

		expect(
			sample(
				".x__arrow { vertical-align: middle; } .x:is(:hover, :focus-visible) { & .x__arrow { opacity: 1; translate: 0 0; } }",
			),
		).toEqual([]);
		expect(sample(".x__arrow { opacity: 0; translate: -7px 0; transition: opacity 0.3s ease; }")).toEqual([
			".x__arrow { opacity: 0 }",
			".x__arrow { translate: -7px 0 }",
			".x__arrow { transition: opacity 0.3s ease }",
		]);
		expect(sample(".x:hover { & .x__arrow { translate: 4px 0; } }")).toEqual(["& .x__arrow { translate: 4px 0 }"]);
		expect(sample(".x__arrow svg { translate: 1px 0; } .x__arrow-free { opacity: 0; }")).toEqual([]);
		expect(
			[
				...'<a><span class="y__arrow arrow-box" aria-hidden="true" set:html={stretchArrow} /></a>'.matchAll(
					INLINED_STRETCH_ARROW,
				),
			].flatMap(([tag]) => classLiteralsIn(tag)),
		).toEqual(["y__arrow", ARROW_BOX]);
		expect(guide).toContain(`\`${declared("translate")}\``);
		expect(guide).toContain(`\`${declared("transition")}\``);
		expect(revealedClassesIn(".x:hover { & .x__arrow { opacity: 1; } } .y { opacity: 0.5; }")).toEqual(["x__arrow"]);
		expect(holding.length).toBeGreaterThan(1);
		expect(holders).toContain(ARROW_BOX);
		expect(stylesheets.length).toBeGreaterThan(0);
		expect([...revealed].filter((name) => holders.has(name)).length).toBeGreaterThan(1);
		expect(faults).toEqual([]);
		expect(unboxed).toEqual([]);
	});

	it("writes the slider's responsive ramp once, as the default in slider.css, so a placement states only the steps that differ from it", () => {
		expect(guide).toContain("A placement states only the steps that differ from the slider's default ramp");

		const steps = (stylesheet: string) =>
			declarationsIn(stylesheet)
				.filter(({ declaration }) => SLIDER_RAMP_PROPERTY.test(declaration))
				.map(({ declaration, preludes }) =>
					`${declaration.replace(WHITESPACE_RUN, " ")} @ ${preludes.filter((prelude) => prelude.startsWith("@media")).join(" ")}`.trim(),
				);
		const defaults = new Set(steps(read(SLIDER_STYLESHEET)));
		const placements = walk("src/ui/modules")
			.filter((file) => file.endsWith(".astro") && ARTICLE_SLIDER_IMPORT.test(read(file)))
			.map((file) => dirname(file));
		const stylesheets = placements.flatMap((folder) => filesIn(folder).filter((file) => file.endsWith(".css")));
		const restated = stylesheets.flatMap((file) =>
			steps(read(file))
				.filter((step) => defaults.has(step))
				.map((step) => `${file}: ${step}`),
		);

		expect(
			steps("a { --slides-per-view: 1; @media (width >= 720px) { --slides-per-view: 2; --slider-gap: 2rem; } }"),
		).toEqual([
			"--slides-per-view: 1 @",
			"--slides-per-view: 2 @ @media (width >= 720px)",
			"--slider-gap: 2rem @ @media (width >= 720px)",
		]);
		expect(ARTICLE_SLIDER_IMPORT.test('import ArticleSlider from "../articleSlider/ArticleSlider.astro";')).toBe(true);
		expect(defaults.size).toBeGreaterThan(0);
		expect(placements.length).toBeGreaterThan(1);
		expect(stylesheets.length).toBeGreaterThan(1);
		expect(restated).toEqual([]);
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
		expect(read("src/ui/modules/core/components/baseLayout/utils/page.ts")).toContain(
			"isWithin({ pathname: url.pathname",
		);
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

	it("names every block after the component that owns it, and scopes every rule of a component stylesheet under a class", () => {
		expect(guide).toContain("sits under one block named after it");

		const shared = sharedBlocks();
		const strays = COMPONENT_FOLDERS.flatMap((folder) => foreignClasses({ folder, shared }));
		const unscoped = COMPONENT_FOLDERS.flatMap((folder) =>
			filesIn(folder)
				.filter((file) => file.endsWith(".css"))
				.flatMap((file) =>
					topLevelSelectors(read(file))
						.filter((selector) => TYPE_SELECTOR_LEAD.test(selector))
						.map((selector) => `${file}: ${selector}`),
				),
		);

		expect(
			selectorClassesIn(
				'.a-b__c.d--e > .f[href$=".pdf"] { color: red; } @media (width > 1px) { .g { margin: 0.5rem; background: url(x.svg); } }',
			),
		).toEqual(["a-b__c", "d--e", "f", "g"]);
		expect(
			classLiteralsIn(
				`<a class="x y" class:list={["z", \`w \${v}\`, \`\${a}--b c\`, { "r-k": sel === "k" }, cond && "u"]} classNames="t" className={clsx("s")} />`,
			),
		).toEqual(["x", "y", "z", "w", "c", "r-k", "u", "t", "s"]);
		expect(["slider__btn--next", "footer-wrapper", "reveal"].map(classBlock)).toEqual(["slider", "footer", "reveal"]);
		expect(topLevelSelectors("footer, .a:is(b, c) { x: y; } .d { .e { f: g; } } @media (a) { h { i: j; } }")).toEqual([
			"footer",
			".a:is(b, c)",
			".d",
		]);
		expect(parentBlocksOf(`${MODULES}/core/components/header/atoms/menu`)).toEqual(["header"]);
		expect(parentBlocksOf(`${MODULES}/core/components/header`)).toEqual([]);
		expect(COMPONENT_FOLDERS.length).toBeGreaterThan(0);
		expect(shared.size).toBeGreaterThan(0);
		expect(strays).toEqual([]);
		expect(unscoped).toEqual([]);
	});

	it("names the republished banner by the label it shows, so the name a screen reader says is the text a reader sees", () => {
		const banner = read("src/ui/modules/article/components/republishedBanner/RepublishedBanner.astro");
		const labelledBy = banner.match(ARIA_LABELLED_BY)?.[1] ?? "";

		expect(labelledBy).not.toBe("");
		expect(banner).toMatch(new RegExp(`id="${labelledBy}"[^>]*>Archival note<`));
		expect(ARIA_LABEL.test(banner)).toBe(false);
	});

	it("declares a static id only where something reads it, since an unread id is a name that can repeat for nothing", () => {
		expect(guide).toContain("An `id` is declared where something reads it");

		const sources = production(walk("src").filter((file) => /\.(astro|tsx|ts|css)$/.test(file))).map((file) =>
			read(file),
		);
		const declared = sources.flatMap((source) => [...source.matchAll(STATIC_ID_ATTRIBUTE)]);

		expect(unreadIds(['<svg id="a">', '<p id="b" aria-labelledby="b">'])).toEqual(["a"]);
		expect(unreadIds(['<clipPath id="c">', "fill: url(#c);"])).toEqual([]);
		expect(unreadIds(["<div id={dynamic}>"])).toEqual([]);
		expect(declared.length).toBeGreaterThan(0);
		expect(unreadIds(sources)).toEqual([]);
	});

	it("imports gsap dynamically under core, since a static import there ships it on every page for an animation a reader may never trigger", () => {
		expect(guide).toContain("The header loads GSAP when the first click needs it");

		const core = production(walk(`${MODULES}/core`)).filter((file) => SOURCE_FILE.test(file));
		const sources = core.map((file) => [file, read(file)] as const);

		expect(STATIC_GSAP_IMPORT.test('import { gsap, Power2 } from "gsap";\nconst x = 1;')).toBe(true);
		expect(STATIC_GSAP_IMPORT.test('const { gsap } = await import("gsap");')).toBe(false);
		expect(DYNAMIC_GSAP_IMPORT.test('const { gsap } = await import("gsap");')).toBe(true);
		expect(core.length).toBeGreaterThan(0);
		expect(sources.filter(([, source]) => STATIC_GSAP_IMPORT.test(source)).map(([file]) => file)).toEqual([]);
		expect(sources.filter(([, source]) => DYNAMIC_GSAP_IMPORT.test(source)).map(([file]) => file)).toEqual([
			`${MODULES}/core/components/header/utils/interactions.ts`,
		]);
	});

	it("shares a 1200 by 630 card as the default image, a tenth of the portrait's weight", () => {
		expect(guide).toContain("The default share image is a 1200 by 630 card");

		const file = read("src/ui/modules/core/components/seo/const.ts").match(SHARE_IMAGE_IMPORT)?.[1] ?? "";
		const path = `src/ui/assets/images/jpg/${file}`;
		const bytes = readFileSync(join(ROOT, path));
		const sof = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x76, 0x04, 0xb0, 0x03]);

		expect(jpegSize(sof)).toEqual({ width: 1200, height: 630 });
		expect(
			jpegSize(
				Buffer.from([
					0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x10, 0x00, 0x20,
				]),
			),
		).toEqual({ width: 32, height: 16 });
		expect(file).not.toBe("");
		expect(jpegSize(bytes)).toEqual({ width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT });
		expect(bytes.length).toBeLessThanOrEqual(SHARE_IMAGE_MAX_BYTES);
	});

	it("styles a template through its stylesheet, an inline style carrying custom properties only, bar the vendor's own snippet", () => {
		const templates = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => file.endsWith(".astro"));
		const properties = (style: string) =>
			style
				.split(";")
				.map((declaration) => declaration.split(":")[0].trim())
				.filter((property) => property !== "" && !property.startsWith("--"));
		const inline = templates.flatMap((file) =>
			[...read(file).matchAll(INLINE_STYLE)]
				.filter(([, style]) => !VENDOR_INLINE_STYLES.includes(style))
				.flatMap(([, style]) => properties(style).map((property) => `${file}: ${property}`)),
		);

		expect(properties("--level: 2; color:red;margin: 0")).toEqual(["color", "margin"]);
		expect(templates.length).toBeGreaterThan(0);
		expect(templates.filter((file) => read(file).includes(" style=")).length).toBeGreaterThan(0);
		expect(inline).toEqual([]);
	});

	it("writes a rule once, so no two stylesheets carry the same block", () => {
		const copies = new Map<string, Set<string>>();

		for (const file of walk("src").filter((entry) => entry.endsWith(".css"))) {
			for (const { prelude, body } of topLevelRulesIn(read(file))) {
				const key = `${prelude} {${body}}`;

				copies.set(key, (copies.get(key) ?? new Set<string>()).add(file));
			}
		}

		const repeated = [...copies]
			.filter(([, files]) => files.size > 1)
			.map(([rule, files]) => `${[...files].join(", ")}: ${rule.slice(0, 80)}`);

		expect(topLevelRulesIn(".a { b: c; }\n@media (x) { .d { e: f; } }\n.g,\n.h { i: j; .k { l: m; } }")).toEqual([
			{ prelude: ".a", body: "b: c;" },
			{ prelude: ".g, .h", body: "i: j; .k { l: m; }" },
		]);
		expect(copies.size).toBeGreaterThan(0);
		expect(repeated).toEqual([]);
	});

	it("reads content through astro:content only, never the CMS or infrastructure", () => {
		expect(guide).toContain("never by calling the CMS or `@infrastructure` directly");

		const components = production(walk("src/ui")).filter((file) => SOURCE_FILE.test(file));

		expect(components.length).toBeGreaterThan(0);
		expect(components.filter((file) => LEAKED_INFRASTRUCTURE_IMPORT.test(read(file)))).toEqual([]);
	});

	it("dereferences through one module, on promises rather than Effect", () => {
		expect(guide).toContain("is the one module that calls `getLiveCollection` and `getLiveEntry`");
		expect(guide).toContain("nothing under `src/ui` imports `effect` at all");

		const resolver = read(DEREFERENCING_MODULE);

		expect(resolver).toContain("export function resolveArticle(");
		expect(resolver).toContain("export function resolveArticles(");

		const sources = production([...walk("src/ui"), ...walk("src/pages")]).filter((file) => SOURCE_FILE.test(file));

		expect(sources.length).toBeGreaterThan(0);
		expect(sources.filter((file) => file !== DEREFERENCING_MODULE && LIVE_READ_CALL.test(read(file)))).toEqual([]);
		expect(sources.filter((file) => file.startsWith("src/ui/") && EFFECT_IMPORT.test(read(file)))).toEqual([]);
	});

	it("spells a class or an id a script or a spec reaches for once, in the const.ts of its component, which the template, the script and the spec import", async () => {
		expect(guide).toContain("spelled once, in the component's `const.ts`");

		const hooks = await declaredHooks();
		const classes = new Set(hooks.filter(({ name }) => name.endsWith("_CLASS")).map(({ value }) => value));
		const mixes = new Set(
			walk("src/ui/styles/global")
				.filter((file) => MIX_STYLESHEETS.includes(basename(file)))
				.flatMap((file) => selectorClassesIn(read(file))),
		);
		const markup = production([...walk("src/ui"), ...walk("src/pages")]);
		const scripts = [
			...markup.filter(
				(file) =>
					file.startsWith("src/ui/") &&
					file.endsWith(".ts") &&
					!file.endsWith(".d.ts") &&
					basename(file) !== "const.ts",
			),
			...markup.filter((file) => file.startsWith("src/ui/") && file.endsWith(".astro")),
			...walk("e2e").filter((file) => file.endsWith(".ts")),
			"docs/built-output.test.ts",
		];
		const reached = scripts.flatMap((file) =>
			selectorLiteralsIn({ file, source: read(file) })
				.filter((name) => !mixes.has(name))
				.map((name) => `${file}: ${name}`),
		);
		const styled = new Set(
			markup.filter((file) => file.endsWith(".css")).flatMap((file) => selectorClassesIn(read(file))),
		);
		const unstyled = hooks.filter(({ name, value }) => name.endsWith("_CLASS") && !styled.has(value));
		const respelled = markup
			.filter((file) => file.endsWith(".astro") || file.endsWith(".tsx"))
			.flatMap((file) =>
				classLiteralsIn(read(file))
					.filter((name) => classes.has(name))
					.map((name) => `${file}: ${name}`),
			);

		expect(
			selectorLiteralsIn({
				file: "a.ts",
				source:
					'document.querySelector(".a-b > #c"); el.classList.toggle("d__e", on); import("./f"); const hex = "#fff"; const url = "a.b"; host.endsWith(".g.dev");',
			}),
		).toEqual(["a-b", "c", "d__e"]);
		expect(hooks.length).toBeGreaterThan(0);
		expect(scripts.length).toBeGreaterThan(0);
		expect(mixes.size).toBeGreaterThan(0);
		expect(reached).toEqual([]);
		expect(unstyled).toEqual([]);
		expect(respelled).toEqual([]);
	});

	it("sizes an iframe that follows its content from a floor that keeps its current size, since the embedded page decides when the property takes effect", () => {
		expect(read(CODING_STANDARDS)).toContain("`frame-sizing: content-height`");

		const blocks = [...walk("src/ui"), ...walk("src/pages")]
			.filter((file) => file.endsWith(".css"))
			.flatMap((file) => [...read(file).matchAll(FRAME_SIZING_BLOCK)].map(([, body]) => ({ file, body })));
		const floorless = blocks.filter(({ body }) => !AUTO_HEIGHT.test(body) || !FRAME_FLOOR.test(body));

		expect(FRAME_FLOOR.test("height: auto; min-height: 100%;")).toBe(true);
		expect(FRAME_FLOOR.test("height: auto; min-height: calc(100cqi * 9 / 16);")).toBe(true);
		expect(FRAME_FLOOR.test("height: auto; min-height: 0;")).toBe(false);
		expect(FRAME_FLOOR.test("height: auto;")).toBe(false);
		expect(blocks.length).toBeGreaterThan(1);
		expect(floorless.map(({ file }) => file)).toEqual([]);
	});

	it("wraps the generic iframe embed in the block the article stylesheet sizes, and keeps it whole across a column", () => {
		const renderer = read("src/application/dto/article/utils/content.ts");
		const wrapper = renderer.match(IFRAME_EMBED_DECLARATION)?.[1] ?? "";
		const stylesheet = read("src/pages/articles/_article.css");

		expect(wrapper).not.toBe("");
		expect(renderer).toContain(`<div class="\${IFRAME_EMBED_CLASS}"><iframe`);
		expect(stylesheet).toMatch(new RegExp(`\\.${wrapper} \\{\\s*container-type: inline-size;`));
		expect(stylesheet).toMatch(new RegExp(`:is\\([^)]*\\.${wrapper}[^)]*\\) \\{\\s*break-inside: avoid;`));
		expect(stylesheet).toMatch(new RegExp(`\\.${wrapper} \\{[^}]*?iframe \\{[^}]*?display: block;`));
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

	it("hydrates only the roots the Islands section censuses, each with client:load so the server renders it", () => {
		const hydrated = production([...walk("src/ui"), ...walk("src/pages")])
			.filter((file) => SOURCE_FILE.test(file))
			.flatMap((file) =>
				[...read(file).matchAll(HYDRATION_DIRECTIVE)].map(([, name, directive, value]) => ({
					name,
					directive: `${directive}${value ? `="${value}"` : ""}`,
				})),
			);
		const censused = namesIn({ text: guide, pattern: ISLAND_ROOT_CENSUS }).sort();

		expect(hydrated.length).toBeGreaterThan(0);
		expect(censused.length).toBeGreaterThan(0);
		expect(guide.match(ISLAND_ROOT_COUNT)?.[1]).toBe(NUMBER_WORDS[censused.length]);
		expect(hydrated.filter(({ directive }) => !HYDRATION_DIRECTIVES_ALLOWED.has(directive))).toEqual([]);
		expect(hydrated.map(({ name }) => name).sort()).toEqual(["ContactFormProvider", "WorldGlobe"]);
		expect(hydrated.map(({ name }) => name).sort()).toEqual(censused);
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
	...readdirSync(ROOT).filter((name) => TYPESCRIPT_FILE.test(name) && !GENERATED_SOURCES.has(name)),
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

	it("prerenders only the pages that read no content, as ADR 0022 says", () => {
		const adr = read("docs/adr/0022-content-renders-per-request-behind-the-workers-cache.md");

		expect(adr).toContain("Only the two legal pages, which read no content, keep `export const prerender = true`.");

		const routes = walk("src/pages").filter((file) => ROUTE_FILE.test(file) && !basename(file).startsWith("_"));
		const prerendered = routes.filter((file) => read(file).includes("export const prerender = true"));

		expect(routes.length).toBeGreaterThan(0);
		expect(prerendered.toSorted()).toEqual(PRERENDERED_ROUTES.toSorted());
	});

	it("caches every content route under one rule, carrying every content collection's tag", () => {
		const cache = read("src/const/contentCache.ts");
		const cachedRoutes = [...cache.matchAll(QUOTED_ROUTE)].map(([, route]) => route);
		const tags = [...(cache.match(CACHE_TAG_LIST)?.[1] ?? "").matchAll(DOUBLE_QUOTED_VALUE)].map(([, tag]) => tag);
		const collections = directoriesIn("src/application/entities").filter((entity) => entity !== "tags");
		const contentRoutes = walk("src/pages")
			.filter((file) => ROUTE_FILE.test(file) && !basename(file).startsWith("_"))
			.filter((file) => !read(file).includes("export const prerender = true"))
			.filter((file) => !["src/pages/contact.astro", "src/pages/500.astro"].includes(file))
			.map(
				(file) =>
					`/${file.replace("src/pages/", "").replace(ROUTE_FILE, "").replace(INDEX_ROUTE, "")}`.replace(
						TRAILING_ROUTE_SLASH,
						"",
					) || "/",
			);

		expect(read("astro.config.ts")).toContain(
			"routeRules: Object.fromEntries(CONTENT_ROUTES.map((route) => [route, CONTENT_CACHE]))",
		);
		expect(cachedRoutes.toSorted()).toEqual(contentRoutes.toSorted());
		expect(collections.filter((collection) => !tags.includes(collection))).toEqual([]);
		expect(tags).toContain("emdash:taxonomy:tag");
	});

	it("disallows in robots.txt the routes it keeps out of the sitemap, and EmDash's admin", () => {
		const disallowed = [...read("public/robots.txt").matchAll(ROBOTS_DISALLOW)].map(([, route]) => route.trim());

		expect(disallowed.length).toBeGreaterThan(0);
		expect(disallowed.toSorted()).toEqual([...NOINDEX_ROUTES, "/_emdash/"].toSorted());
		expect(read("public/robots.txt")).toContain("Sitemap: https://biancafiore.me/sitemap.xml");
	});

	it("writes the site origin once, in SITE_URL, which the config reads for `site` and robots.txt repeats because a static file reads nothing", () => {
		const example = read(".env.example").match(ENV_EXAMPLE_SITE_URL)?.[1]?.trim();
		const sitemaps = [...read("public/robots.txt").matchAll(ROBOTS_SITEMAP)].map(([, url]) => url.trim());

		expect(example).toBeDefined();
		expect(ASTRO_CONFIG).toMatch(SITE_DECLARATION);
		expect(ASTRO_CONFIG).not.toMatch(CONFIG_TIME_ENV_READ);
		expect(CONFIG_TIME_ENV_READ.test("site: import.meta.env.SITE_URL,")).toBe(true);
		expect(CONFIG_TIME_ENV_READ.test('"import.meta.env.IMAGE_CDN": 1')).toBe(false);
		expect(ASTRO_CONFIG).not.toContain(example as string);
		expect(read("docs/built-output.test.ts")).not.toContain(example as string);
		expect(sitemaps).toEqual([`${example}/sitemap.xml`]);
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

	it("gives no params type, and no inline parameter type, a single field of its own", () => {
		const findingsIn = (source: string) => singleFieldParameterTypesIn({ file: "a.ts", source });
		const declared = HAND_WRITTEN_CODE.flatMap((file) => [...read(file).matchAll(PARAMS_DECLARATION)]);
		const single = HAND_WRITTEN_CODE.flatMap((file) =>
			singleFieldParameterTypesIn({ file, source: read(file) }).map((type) => `${file}: ${type}`),
		);

		expect(AGENTS_MD).toContain("A parameter object never holds a single field");
		expect(findingsIn("interface FooParams { a: string }")).toEqual(["FooParams"]);
		expect(findingsIn("interface FooParams { a: string; b: string }")).toEqual([]);
		expect(findingsIn("type FooParams = { a: string };")).toEqual(["FooParams"]);
		expect(findingsIn("interface FooParams extends Base { a: string }")).toEqual([]);
		expect(findingsIn("type FooParams = Base & { a: string };")).toEqual([]);
		expect(findingsIn("interface Props { id: string }")).toEqual([]);
		expect(findingsIn(`const f = ${OPENING}{ a }: { a: string }) => a;`)).toEqual(["an inline parameter type"]);
		expect(findingsIn(`items.map(${OPENING}item: { url: string }) => item.url);`)).toEqual([
			"an inline parameter type",
		]);
		expect(findingsIn(`const f = ${OPENING}{ a, b }: { a: string; b: string }) => a;`)).toEqual([]);
		expect(declared.length).toBeGreaterThan(0);
		expect(single).toEqual([]);
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

const unpinnedDates = (source: string): string[] => [
	...callArguments({ source, call: LOCALE_DATE_CALL }).filter((args) => !PINNED_ZONE.test(args)),
	...callArguments({ source, call: LOCALE_TIME_CALL }).filter(
		(args) => !PINNED_ZONE.test(args) || !NAMED_ZONE.test(args),
	),
];

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

interface ScriptRegion {
	body: string;
	kind: ts.ScriptKind;
}

const scriptRegions = ({ file, source }: CodeSource): ScriptRegion[] => {
	if (!file.endsWith(".astro"))
		return [{ body: source, kind: file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS }];

	const frontmatter = source.match(ASTRO_FRONTMATTER)?.[1];

	return [
		...(frontmatter === undefined ? [] : [{ body: frontmatter, kind: ts.ScriptKind.TS }]),
		...[...source.matchAll(ASTRO_SCRIPT)].map((match) => ({ body: match[1], kind: ts.ScriptKind.TS })),
	];
};

interface ModuleOfParams {
	file: string;
	specifier: string;
}

const moduleOf = ({ file, specifier }: ModuleOfParams): string | undefined => {
	const target = importTarget({ file, specifier: specifier.replace(QUERY_SUFFIX, "") });

	return target === undefined
		? undefined
		: MODULE_SUFFIXES.map((suffix) => `${target}${suffix}`).find(
				(candidate) => exists(candidate) && statSync(join(ROOT, candidate)).isFile(),
			);
};

interface ModuleImports {
	named: Map<string, Set<string>>;
	whole: Set<string>;
	reexported: Map<string, Set<string>>;
}

const emptyImports = (): ModuleImports => ({ named: new Map(), whole: new Set(), reexported: new Map() });

interface NoteNamedImportParams {
	imports: ModuleImports;
	target: string;
	name: string;
}

const noteNamedImport = ({ imports, target, name }: NoteNamedImportParams) =>
	imports.named.set(target, (imports.named.get(target) ?? new Set<string>()).add(name));

interface ImportsInParams extends CodeSource {
	into: ModuleImports;
}

interface NamedParams {
	specifier: string;
	name: string | undefined;
}

const bindingKey = (element: ts.BindingElement | ts.ImportSpecifier | ts.ExportSpecifier): string | undefined => {
	const key = element.propertyName ?? element.name;

	return ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : undefined;
};

const importsIn = ({ file, source, into: imports }: ImportsInParams): ModuleImports => {
	const target = (specifier: string) => moduleOf({ file, specifier });
	const named = ({ specifier, name }: NamedParams) => {
		const resolved = target(specifier);

		if (resolved !== undefined && name !== undefined) noteNamedImport({ imports, target: resolved, name });
	};
	const whole = (specifier: string) => {
		const resolved = target(specifier);

		if (resolved !== undefined) imports.whole.add(resolved);
	};
	const visit = (node: ts.Node): void => {
		if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
			const specifier = node.moduleSpecifier.text;
			const bindings = node.importClause?.namedBindings;

			if (node.importClause?.name) named({ specifier, name: "default" });
			if (bindings && ts.isNamespaceImport(bindings)) whole(specifier);
			if (bindings && ts.isNamedImports(bindings)) {
				for (const element of bindings.elements) named({ specifier, name: bindingKey(element) });
			}
			if (!node.importClause) whole(specifier);
		}

		if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
			const specifier = node.moduleSpecifier.text;
			const resolved = target(specifier);

			if (node.exportClause && ts.isNamedExports(node.exportClause)) {
				for (const element of node.exportClause.elements) named({ specifier, name: bindingKey(element) });
			} else if (resolved !== undefined) {
				imports.reexported.set(file, (imports.reexported.get(file) ?? new Set<string>()).add(resolved));
			}
		}

		if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
			whole(node.argument.literal.text);
		}

		if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments[0] &&
			ts.isStringLiteral(node.arguments[0])
		) {
			const specifier = node.arguments[0].text;
			const declaration = ts.isAwaitExpression(node.parent) ? node.parent.parent : undefined;

			if (declaration && ts.isVariableDeclaration(declaration) && ts.isObjectBindingPattern(declaration.name)) {
				for (const element of declaration.name.elements) named({ specifier, name: bindingKey(element) });
			} else if (
				ts.isArrowFunction(node.parent) &&
				ts.isCallExpression(node.parent.parent) &&
				node.parent.parent.expression.getText() === LAZY_LOADER
			) {
				named({ specifier, name: "default" });
			} else {
				whole(specifier);
			}
		}

		ts.forEachChild(node, visit);
	};

	for (const { body, kind } of scriptRegions({ file, source })) {
		visit(ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, kind));
	}

	return imports;
};

const namesReached = (imports: ModuleImports): ModuleImports => {
	const reached = {
		named: new Map([...imports.named].map(([module, names]) => [module, new Set(names)])),
		whole: new Set(imports.whole),
		reexported: imports.reexported,
	};

	for (let changed = true; changed; ) {
		changed = false;

		for (const [barrel, modules] of reached.reexported) {
			for (const module of modules) {
				if (reached.whole.has(barrel) && !reached.whole.has(module)) {
					reached.whole.add(module);
					changed = true;
				}

				for (const name of reached.named.get(barrel) ?? []) {
					const names = reached.named.get(module) ?? new Set<string>();

					if (!names.has(name)) {
						reached.named.set(module, names.add(name));
						changed = true;
					}
				}
			}
		}
	}

	return reached;
};

const importedSpecifiers = ({ file, source }: CodeSource): string[] => {
	const specifiers: string[] = [];
	const visit = (node: ts.Node): void => {
		if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
			if (ts.isStringLiteral(node.moduleSpecifier)) specifiers.push(node.moduleSpecifier.text);
		}

		if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
			specifiers.push(node.argument.literal.text);
		}

		if (
			ts.isCallExpression(node) &&
			node.expression.kind === ts.SyntaxKind.ImportKeyword &&
			node.arguments[0] &&
			ts.isStringLiteral(node.arguments[0])
		) {
			specifiers.push(node.arguments[0].text);
		}

		ts.forEachChild(node, visit);
	};

	for (const { body, kind } of scriptRegions({ file, source })) {
		visit(ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, kind));
	}

	return specifiers;
};

const exportedNames = ({ file, source }: CodeSource): string[] =>
	ts
		.createSourceFile(
			file,
			source,
			ts.ScriptTarget.Latest,
			true,
			file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
		)
		.statements.flatMap((statement) => {
			if (ts.isExportDeclaration(statement)) {
				return !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)
					? statement.exportClause.elements.map((element) => element.name.text)
					: [];
			}

			const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
			const exported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
			const byDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

			if (!exported || byDefault) return [];
			if (ts.isVariableStatement(statement)) {
				return statement.declarationList.declarations.flatMap(({ name }) => (ts.isIdentifier(name) ? [name.text] : []));
			}

			return "name" in statement && statement.name && ts.isIdentifier(statement.name as ts.Node)
				? [(statement.name as ts.Identifier).text]
				: [];
		});

interface ExportedWithoutImporterParams {
	modules: CodeSource[];
	importers: CodeSource[];
}

const exportedWithoutImporter = ({ modules, importers }: ExportedWithoutImporterParams): string[] => {
	const imports = namesReached(
		importers.reduce((all, importer) => importsIn({ ...importer, into: all }), emptyImports()),
	);

	return modules.flatMap((module) =>
		exportedNames(module)
			.filter((name) => !imports.whole.has(module.file) && !imports.named.get(module.file)?.has(name))
			.map((name) => `${module.file}: ${name}`),
	);
};

const readersByModule = (): Map<string, Set<string>> => {
	const readers = new Map<string, Set<string>>();

	for (const file of SOURCE_FILES) {
		const { named, whole } = importsIn({ file, source: read(file), into: emptyImports() });

		for (const module of [...named.keys(), ...whole]) {
			readers.set(module, (readers.get(module) ?? new Set<string>()).add(file));
		}
	}

	return readers;
};

interface ReadersOfParams {
	path: string;
	readers: Map<string, Set<string>>;
}

const readersOf = ({ path, readers }: ReadersOfParams): string[] =>
	[...readers].flatMap(([module, files]) =>
		module === path || module.startsWith(`${path}/`)
			? [...files].filter((file) => file !== path && !file.startsWith(`${path}/`))
			: [],
	);

const staysInCore = (readers: string[]): boolean => {
	const features = new Set(
		readers.map((file) => file.match(FEATURE_OF_MODULE)?.[1]).filter((feature) => feature && feature !== "core"),
	);

	return (
		readers.some((file) => file.startsWith("src/pages/") || file.startsWith(`${CORE_MODULE}/`)) || features.size > 1
	);
};

const soleComponentReading = (readers: string[]): string | undefined => {
	const components = new Set(readers.map((file) => file.match(COMPONENT_FOLDER)?.[1]));

	return components.size === 1 ? [...components][0] : undefined;
};

const kebab = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const classBlock = (name: string): string => name.split(BLOCK_SEPARATOR)[0].replace(WRAPPER_SUFFIX, "");

const selectorClassesIn = (css: string): string[] =>
	[...css.matchAll(CSS_RULE_PRELUDE)].flatMap(([, prelude]) =>
		prelude.trimStart().startsWith("@")
			? []
			: [...prelude.replace(QUOTED_STRING, "").matchAll(ANY_CLASS_TOKEN)].map(([, name]) => name),
	);

const classLiteralsIn = (source: string): string[] =>
	[...source.matchAll(CLASS_ATTRIBUTE)].flatMap(([, doubled, singled, braced]) =>
		(
			doubled ??
			singled ??
			[...(braced ?? "").replace(COMPARED_LITERAL, " ").matchAll(CLASS_LITERAL)]
				.map(([, quoted, apostrophed, templated]) => quoted ?? apostrophed ?? templated)
				.join(" ")
		)
			.replace(TEMPLATE_HOLE, HOLE_MARK)
			.split(WHITESPACE)
			.filter((word) => word !== "" && !word.includes(HOLE_MARK)),
	);

const selectorsOf = (prelude: string): string[] => {
	const selectors: string[] = [];
	let depth = 0;
	let current = "";

	for (const character of prelude) {
		if (character === "(") depth += 1;
		if (character === ")") depth -= 1;

		if (character === "," && depth === 0) {
			selectors.push(current.trim());
			current = "";
		} else {
			current += character;
		}
	}

	return [...selectors, current.trim()];
};

interface TopLevelRule {
	prelude: string;
	body: string;
}

const squash = (text: string): string => text.replace(WHITESPACE_RUN, " ").trim();

const topLevelRulesIn = (css: string): TopLevelRule[] => {
	const rules: TopLevelRule[] = [];
	let depth = 0;
	let prelude = "";
	let body = "";

	for (const character of css) {
		if (character === "{") {
			depth += 1;

			if (depth > 1) body += character;
		} else if (character === "}") {
			depth -= 1;

			if (depth > 0) {
				body += character;
			} else {
				if (!prelude.trim().startsWith("@")) rules.push({ prelude: squash(prelude), body: squash(body) });

				prelude = "";
				body = "";
			}
		} else if (depth === 0) {
			prelude = character === ";" ? "" : prelude + character;
		} else {
			body += character;
		}
	}

	return rules;
};

const topLevelSelectors = (css: string): string[] =>
	topLevelRulesIn(css).flatMap(({ prelude }) => selectorsOf(prelude));

const filesIn = (folder: string): string[] =>
	readdirSync(join(ROOT, folder), { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => `${folder}/${entry.name}`);

const COMPONENT_FOLDERS = [
	...new Set(
		walk(MODULES)
			.filter((file) => COMPONENT_FILE.test(basename(file)))
			.map((file) => dirname(file)),
	),
];

const parentBlocksOf = (folder: string): string[] =>
	BLOCKS_GROUPED_UNDER_A_PARENT.filter((group) => `${folder}/`.startsWith(group.folder)).map(({ block }) => block);

const sharedBlocks = (): Set<string> =>
	new Set(
		[
			PAGE_BLOCK,
			read("src/const/calendly.ts").match(CALENDLY_WIDGET_CLASS_DECLARATION)?.[1] ?? "",
			...walk("src/ui/styles/global")
				.filter((file) => file.endsWith(".css"))
				.flatMap((file) => selectorClassesIn(read(file))),
			...walk("src/ui/assets")
				.filter((file) => file.endsWith(".svg"))
				.flatMap((file) => classLiteralsIn(read(file))),
		].map(classBlock),
	);

interface ForeignClassesParams {
	folder: string;
	shared: Set<string>;
}

const foreignClasses = ({ folder, shared }: ForeignClassesParams): string[] => {
	const files = filesIn(folder);
	const templates = files.filter((file) => COMPONENT_FILE.test(basename(file)));
	const rendered = templates
		.flatMap((file) => {
			const { named, whole } = importsIn({ file, source: read(file), into: emptyImports() });

			return [...named.keys(), ...whole].map((module) => dirname(module));
		})
		.filter((imported) => COMPONENT_FOLDERS.includes(imported));
	const allowed = new Set([
		...shared,
		...[folder, ...rendered].flatMap((owner) => [kebab(basename(owner)), ...parentBlocksOf(owner)]),
	]);

	return [
		...new Set([
			...templates.flatMap((file) => classLiteralsIn(read(file))),
			...files.filter((file) => file.endsWith(".css")).flatMap((file) => selectorClassesIn(read(file))),
		]),
	]
		.filter((name) => !allowed.has(classBlock(name)))
		.map((name) => `${folder}: ${name}`);
};

const selectorLiteralsIn = ({ file, source }: CodeSource): string[] => {
	const found: string[] = [];
	const scan = (text: string) =>
		found.push(...[...text.matchAll(SELECTOR_CLASS), ...text.matchAll(SELECTOR_ID)].map(([, name]) => name));
	const isClassListOperation = (node: ts.CallExpression) =>
		ts.isPropertyAccessExpression(node.expression) &&
		CLASS_LIST_OPERATIONS.has(node.expression.name.text) &&
		ts.isPropertyAccessExpression(node.expression.expression) &&
		node.expression.expression.name.text === "classList";
	const isTextArgument = (node: ts.Node) =>
		ts.isCallExpression(node.parent) &&
		ts.isPropertyAccessExpression(node.parent.expression) &&
		STRING_METHODS.has(node.parent.expression.name.text);
	const visit = (node: ts.Node): void => {
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;

		if (
			(ts.isStringLiteralLike(node) ||
				ts.isTemplateHead(node) ||
				ts.isTemplateMiddle(node) ||
				ts.isTemplateTail(node)) &&
			!isTextArgument(node)
		) {
			scan(node.text);
		}

		if (ts.isCallExpression(node) && isClassListOperation(node)) {
			found.push(...node.arguments.filter(ts.isStringLiteralLike).map((argument) => argument.text));
		}

		ts.forEachChild(node, visit);
	};

	for (const { body, kind } of scriptRegions({ file, source })) {
		visit(ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, kind));
	}

	return found;
};

const singleFieldParameterTypesIn = ({ file, source }: CodeSource): string[] => {
	const found: string[] = [];
	const visit = (node: ts.Node): void => {
		if (
			ts.isInterfaceDeclaration(node) &&
			PARAMS_TYPE_NAME.test(node.name.text) &&
			!node.heritageClauses &&
			node.members.length === 1
		) {
			found.push(node.name.text);
		}

		if (
			ts.isTypeAliasDeclaration(node) &&
			PARAMS_TYPE_NAME.test(node.name.text) &&
			ts.isTypeLiteralNode(node.type) &&
			node.type.members.length === 1
		) {
			found.push(node.name.text);
		}

		if (ts.isParameter(node) && node.type && ts.isTypeLiteralNode(node.type) && node.type.members.length === 1) {
			found.push("an inline parameter type");
		}

		ts.forEachChild(node, visit);
	};

	for (const { body, kind } of scriptRegions({ file, source })) {
		visit(ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, kind));
	}

	return found;
};

interface BiomeOverride {
	includes: string[];
	linter?: { rules?: { suspicious?: { noConsole?: string } } };
}

interface Hook {
	file: string;
	name: string;
	value: string;
}

const declaredHooks = async (): Promise<Hook[]> =>
	(
		await Promise.all(
			walk(MODULES)
				.filter((file) => basename(file) === "const.ts")
				.map(async (file) => ({ file, exports: (await import(join(ROOT, file))) as Record<string, unknown> })),
		)
	).flatMap(({ file, exports }) =>
		Object.entries(exports).flatMap(([name, value]) =>
			HOOK_EXPORT.test(name) && typeof value === "string" ? [{ file, name, value }] : [],
		),
	);

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

	it("exports only what another module imports, so a name nothing reaches stays private", () => {
		const modules = SOURCE_FILES.filter(
			(file) =>
				!file.startsWith("src/pages/") &&
				!file.endsWith(".astro") &&
				!file.endsWith(".d.ts") &&
				!MODULES_WHOSE_EXPORTS_THE_FRAMEWORK_READS.has(file) &&
				!MODULES_SHARED_BYTE_FOR_BYTE.has(file),
		).map((file) => ({ file, source: read(file) }));
		const importers = HAND_WRITTEN_CODE.map((file) => ({ file, source: read(file) }));
		const sample = importsIn({
			file: "src/pages/about.astro",
			source:
				'---\nimport { absoluteUrl, type Foo as Bar } from "@const/routes";\nconst { logger } = await import("@infrastructure/logging/logger");\n---\n<script>import "@modules/core/utils/pathname";</script>',
			into: emptyImports(),
		});
		const barrel = namesReached({
			named: new Map([["src/domain/author/index.ts", new Set(["authorSchema"])]]),
			whole: new Set(),
			reexported: new Map([["src/domain/author/index.ts", new Set(["src/domain/author/schema.ts"])]]),
		});

		expect([...(sample.named.get("src/const/routes.ts") ?? [])]).toEqual(["absoluteUrl", "Foo"]);
		expect([...(sample.named.get("src/infrastructure/logging/logger.ts") ?? [])]).toEqual(["logger"]);
		expect([...sample.whole]).toEqual(["src/ui/modules/core/utils/pathname.ts"]);
		expect(barrel.named.get("src/domain/author/schema.ts")).toEqual(new Set(["authorSchema"]));
		expect(
			exportedNames({
				file: "a.ts",
				source:
					"export const a = 1, b = 2; export function c() {} export interface D {} export type E = D; export class F {} const g = 3; export { g as h }; export default 1;",
			}),
		).toEqual(["a", "b", "c", "D", "E", "F", "h"]);
		expect(modules.flatMap(exportedNames).length).toBeGreaterThan(0);
		expect(importers.length).toBeGreaterThan(modules.length);
		expect(exportedWithoutImporter({ modules, importers })).toEqual([]);
	});

	it("keeps in @shared/ui only what two units read, since a name one feature reads belongs to that feature", () => {
		const modules = SOURCE_FILES.filter((file) => file.startsWith("src/shared/ui/"));
		const readers = new Map<string, Set<string>>();

		for (const importer of SOURCE_FILES) {
			const { named } = importsIn({ file: importer, source: read(importer), into: emptyImports() });

			for (const module of modules) {
				for (const name of named.get(module) ?? []) {
					readers.set(
						`${module}: ${name}`,
						(readers.get(`${module}: ${name}`) ?? new Set<string>()).add(unitOf(importer)),
					);
				}
			}
		}

		const declared = [
			...new Set(
				modules.flatMap((file) => exportedNames({ file, source: read(file) }).map((name) => `${file}: ${name}`)),
			),
		];

		expect(declared.length).toBeGreaterThan(0);
		expect(declared.filter((name) => (readers.get(name)?.size ?? 0) < 2)).toEqual([]);
	});

	it("keeps a component in core only when core, a page or two features read it, and a helper in a feature's utils/ only when two components or a page read it", () => {
		const readers = readersByModule();
		const components = directoriesIn(CORE_COMPONENTS).map((name) => `${CORE_COMPONENTS}/${name}`);
		const helpers = SOURCE_FILES.filter((file) => FEATURE_UTILITY.test(file));
		const inFeature = (name: string) => `src/ui/modules/${name}/components/a/A.astro`;

		expect(staysInCore([inFeature("articles")])).toBe(false);
		expect(staysInCore([inFeature("about"), inFeature("home")])).toBe(true);
		expect(staysInCore(["src/pages/index.astro"])).toBe(true);
		expect(staysInCore([inFeature("core"), inFeature("contact")])).toBe(true);
		expect(staysInCore([])).toBe(false);
		expect(soleComponentReading([inFeature("contact"), "src/ui/modules/contact/components/a/utils/b.ts"])).toBe(
			"src/ui/modules/contact/components/a",
		);
		expect(soleComponentReading(["src/pages/contact.astro", inFeature("contact")])).toBeUndefined();
		expect(components.length).toBeGreaterThan(0);
		expect(helpers.length).toBeGreaterThan(0);
		expect(components.filter((path) => !staysInCore(readersOf({ path, readers })))).toEqual([]);
		expect(helpers.filter((path) => soleComponentReading(readersOf({ path, readers })) !== undefined)).toEqual([]);
	});

	it("logs through logger or LoggerService and never through Effect's own log, whose lines reach the export in another shape", () => {
		const sources = HAND_WRITTEN_CODE.filter((file) => file.startsWith("src/"));

		expect(sources.length).toBeGreaterThan(0);
		expect(sources.filter((file) => EFFECT_LOG.test(read(file)))).toEqual([]);
	});

	it("reads the failure or the defect off an Effect Exit in one shared helper, never in a copy a test declares", () => {
		const helper = "src/tests/helpers/exit.ts";

		expect(UNIT_TESTS.length).toBeGreaterThan(0);
		expect(exists(helper)).toBe(true);
		expect(read(helper)).toMatch(EXIT_EXTRACTION);
		expect(UNIT_TESTS.filter((file) => EXIT_EXTRACTION.test(read(file)))).toEqual([]);
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

	it("spells the featured image's view transition name in one function, since the card and the page must agree on it", () => {
		const helper = "src/ui/modules/core/components/blurImage/utils/transition.ts";
		const spellers = SOURCE_FILES.filter((file) => TRANSITION_NAME_SPELLING.test(read(file)));

		expect(spellers).toEqual([helper]);
		expect(SOURCE_FILES.filter((file) => read(file).includes("featuredImageTransitionName"))).toContain(
			"src/ui/modules/core/components/articleCard/ArticleCard.astro",
		);
		expect(SOURCE_FILES.filter((file) => read(file).includes("featuredImageTransitionName"))).toContain(
			"src/pages/articles/[...slug].astro",
		);
	});

	it("declares each unindexed route once, in one module, and lets the legal pages inherit their robots from it", () => {
		const declarations = [...SOURCE_FILES, "astro.config.ts"].filter((file) =>
			NOINDEX_ROUTES.some((route) => read(file).includes(`"${route}"`)),
		);
		const pages = NOINDEX_ROUTES.map((route) => `src/pages${route}.astro`);

		expect(NOINDEX_ROUTES.length).toBeGreaterThan(0);
		expect(declarations).toEqual(["src/const/noindexRoutes.ts"]);
		expect(pages.filter((page) => !exists(page))).toEqual([]);
		expect(pages.filter((page) => ROBOTS_OVERRIDE.test(read(page)))).toEqual([]);
	});

	it("takes the head of the Blog in blogPreview alone, so a page that wants a Blog Preview asks for one", () => {
		const takers = SOURCE_FILES.filter((file) => HEAD_OF_THE_BLOG.test(read(file)));

		expect(read("src/ui/modules/core/utils/blogPreview.ts")).toMatch(HEAD_OF_THE_BLOG);
		expect(takers).toEqual(["src/ui/modules/core/utils/blogPreview.ts"]);
	});

	it("derives the Open Graph locale from the language the pages declare, never from a literal that can disagree with it", () => {
		expect(read("src/ui/modules/core/components/seo/Seo.astro")).toMatch(OPEN_GRAPH_LOCALE_FROM_SITE_LOCALE);
		expect(read("src/ui/modules/core/components/baseLayout/BaseLayout.astro")).toContain(
			"<html lang={DEFAULT_LOCALE_STRING}",
		);
	});

	it("expresses a variant as a modifier and never as a data-has-* attribute a stylesheet or a script tests", () => {
		const stylesheets = walk("src").filter((file) => file.endsWith(".css"));
		const markup = [...SOURCE_FILES, ...stylesheets];

		expect(stylesheets.length).toBeGreaterThan(0);
		expect(DATA_HAS_ATTRIBUTE.test('<div data-has-dots="true">')).toBe(true);
		expect(markup.filter((file) => DATA_HAS_ATTRIBUTE.test(read(file)))).toEqual([]);
	});

	it("shuffles Related Articles once, in the module that owns it, so the slides and the structured data list one order", () => {
		const owner = "src/ui/modules/core/components/relatedArticles/utils/shuffle.ts";
		const drawers = SOURCE_FILES.filter((file) => RANDOM_DRAW.test(read(file)));
		const section = read("src/ui/modules/core/components/relatedArticles/RelatedArticles.astro");

		expect(drawers).toEqual([owner]);
		expect(section).toContain("shuffle(");
		expect(section.indexOf("shuffle(")).toBeLessThan(section.indexOf("buildArticleListSchema("));
	});

	it("prints no error message from a route, which only the Worker log is for", () => {
		const routes = SOURCE_FILES.filter((file) => file.startsWith("src/pages/"));

		expect(routes.length).toBeGreaterThan(0);
		expect(MESSAGE_READ.test("const reference = error.message;")).toBe(true);
		expect(routes.filter((file) => MESSAGE_READ.test(read(file)))).toEqual([]);
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

	it("pins the zone of every date it prints and names it on a time, so no line a reader sees depends on the machine that wrote it", () => {
		const printing = SOURCE_FILES.filter((file) => /\.toLocale(?:Date|Time)?String\(/.test(read(file)));
		const unpinned = SOURCE_FILES.flatMap((file) => unpinnedDates(read(file)).map((args) => `${file}: (${args})`));

		expect(unpinnedDates("d.toLocaleDateString('en-GB')")).toEqual(["'en-GB'"]);
		expect(unpinnedDates("d.toLocaleDateString('en-GB', { timeZone: 'UTC' })")).toEqual([]);
		expect(unpinnedDates("d.toLocaleString('en-GB', { timeZone: 'UTC' })")).toEqual(["'en-GB', { timeZone: 'UTC' }"]);
		expect(unpinnedDates("d.toLocaleTimeString('en-GB', { timeZoneName: 'short' })")).toEqual([
			"'en-GB', { timeZoneName: 'short' }",
		]);
		expect(unpinnedDates("d.toLocaleString('en-GB', { timeZone: 'UTC', timeZoneName: 'short' })")).toEqual([]);
		expect(printing.length).toBeGreaterThan(0);
		expect(unpinned).toEqual([]);
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

	it("declares every package it imports, so none resolves by the accident of being hoisted", () => {
		const declared = new Set(DEPENDENCY_FIELDS.flatMap((field) => Object.keys(PACKAGE_JSON[field] ?? {})));
		const packageOf = (specifier: string) => specifier.match(SCOPED_PACKAGE)?.[1] ?? specifier.split("/")[0];
		const isPackage = (specifier: string) =>
			!specifier.startsWith(".") &&
			!specifier.startsWith("node:") &&
			!specifier.startsWith("astro:") &&
			!ALIAS_TARGETS.some(([alias]) => specifier.startsWith(alias));
		const imported = HAND_WRITTEN_CODE.flatMap((file) =>
			importedSpecifiers({ file, source: read(file) })
				.filter(isPackage)
				.map((specifier) => ({ file, name: packageOf(specifier) })),
		);

		expect(
			importedSpecifiers({
				file: "a.ts",
				source:
					'import type { A } from "@commitlint/types"; export * from "vitest/config"; const b = await import("effect"); type C = import("msw").D; it("reads from", () => {}); const d = "import";',
			}),
		).toEqual(["@commitlint/types", "vitest/config", "effect", "msw"]);
		expect(packageOf("@commitlint/types")).toBe("@commitlint/types");
		expect(packageOf("react-dom/server")).toBe("react-dom");
		expect(imported.length).toBeGreaterThan(0);
		expect(imported.filter(({ name }) => !declared.has(name)).map(({ file, name }) => `${file}: ${name}`)).toEqual([]);
	});

	it("imports Zod only through @shared/utils/zod, which turns its JIT off before any schema is built, so no page probes an eval the policy refuses, and declares no zod of its own", () => {
		const specifiers = HAND_WRITTEN_CODE.flatMap((file) =>
			[...read(file).matchAll(IMPORT_SPECIFIER)].map(([, specifier]) => ({ file, specifier })),
		);
		const direct = specifiers
			.filter(({ specifier }) => ZOD_SPECIFIER.test(specifier))
			.map(({ file, specifier }) => `${file} imports ${specifier}`);
		const astroZodReaders = specifiers
			.filter(({ specifier }) => specifier === "astro/zod")
			.map(({ file }) => file.replace(TYPESCRIPT_FILE, ""));
		const wrapperReaders = specifiers.filter((specifier) => importTarget(specifier) === ZOD_MODULE);

		expect(zodDeclarationsIn({ devDependencies: { zod: "x" } })).toEqual(["devDependencies"]);
		expect(importTarget({ file: "src/shared/ui/types.ts", specifier: "../utils/zod" })).toBe(ZOD_MODULE);
		expect(importTarget({ file: "src/domain/city/schema.ts", specifier: "@shared/utils/zod" })).toBe(ZOD_MODULE);
		expect(wrapperReaders.length).toBeGreaterThan(0);
		expect(direct).toEqual([]);
		expect(astroZodReaders).toEqual([ZOD_MODULE]);
		expect(read(`${ZOD_MODULE}.ts`)).toContain(JITLESS_ZOD);
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

	it("reads no local-time Date API in either layer, since the Worker renders in one time zone and a contributor tests in another", () => {
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

	it("writes no hex colour in a component or route stylesheet or a module under src/ui, so a colour is a token resolved at runtime", () => {
		const sources = production([...walk("src/ui"), ...walk("src/pages")])
			.filter((file) => !file.startsWith("src/ui/styles/"))
			.filter((file) => SOURCE_FILE.test(file) || file.endsWith(".css"));
		const coloured = sources.filter((file) => HEX_COLOUR.test(read(file)));

		expect(sources.filter((file) => file.endsWith(".css")).length).toBeGreaterThan(0);
		expect(HEX_COLOUR.test("fill: #c0ffee;")).toBe(true);
		expect(HEX_COLOUR.test('href="#contact" &#39;')).toBe(false);
		expect(coloured).toEqual([]);
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
	const SHARED_DEPLOY_MESSAGE = /^\$\{\{ github\.sha \}\}-\$\{\{ github\.event_name \}\}$/;
	const DEPLOY_MESSAGE_ARGUMENT = /--message[ =]("?)((?:\$\{\{[^}]*\}\}|[^\s"])+)\1/;
	const SHELL_VARIABLE = /^\$\{?(\w+)\}?$/;
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

	interface DeployMessageParams {
		step: string;
		line: string;
	}

	const deployMessage = ({ step, line }: DeployMessageParams): string => {
		const argument = DEPLOY_MESSAGE_ARGUMENT.exec(line)?.[2] ?? "";
		const variable = SHELL_VARIABLE.exec(argument)?.[1];
		if (variable === undefined) return argument;
		const declaration = step
			.split(NEWLINE)
			.map((text) => text.trim())
			.find((text) => text.startsWith(`${variable}:`));
		return declaration?.slice(variable.length + 1).trim() ?? "";
	};

	it("names every deploy with the --message the deploying repositories share, <sha>-<event> as one token, because forever-pto's OpenNext deploy re-spawns wrangler through a shell", () => {
		const deploys = steps.flatMap(({ file, step }) =>
			step
				.split(NEWLINE)
				.filter((line) => DEPLOY_COMMAND.test(line))
				.map((line) => ({ file, message: deployMessage({ step, line }) })),
		);

		expect(deploys.length).toBeGreaterThan(0);
		expect(
			deploys
				.filter(({ message }) => !SHARED_DEPLOY_MESSAGE.test(message))
				.map(({ file, message }) => `${file} (${message})`),
		).toEqual([]);
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

const PLAYWRIGHT_CONFIG = /(?:^|\/)playwright\.config\.[cm]?[jt]s$/;
const PLAYWRIGHT_PROJECTS = `[
	{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
	{ name: "webkit", use: { ...devices["Desktop Safari"] } },
]`;
const COMMA_BEFORE_CLOSER = /,([}\]])/g;
const WORKFLOW_JOBS = /^jobs:\s*$/m;
const WORKFLOW_JOB_HEADER = /^ {2}(?=[\w-]+:\s*$)/m;
const PLAYWRIGHT_RUN = /\bplaywright test\b|\bpnpm test:e2e\b/;
const PLAYWRIGHT_INSTALL = /\bplaywright install(?:-deps)?\b([^\n]*)/g;
const PLAYWRIGHT_BROWSERS = "chromium webkit";
const YAML_ITEM_DASH = /^-\s+/;
const PLAYWRIGHT_BROWSER_STEPS = [
	/^path: ~\/\.cache\/ms-playwright$/,
	/^key: .+-playwright-chromium-webkit-.+$/,
	/^if: steps\.playwright-cache\.outputs\.cache-hit != 'true'$/,
	/^run: pnpm exec playwright install --with-deps chromium webkit$/,
	/^if: steps\.playwright-cache\.outputs\.cache-hit == 'true'$/,
	/^run: pnpm exec playwright install-deps chromium webkit$/,
];

const compactCode = (code: string): string => code.replace(WHITESPACE_RUN, "").replace(COMMA_BEFORE_CLOSER, "$1");

const playwrightProjects = (config: string): string | undefined => {
	const file = ts.createSourceFile("playwright.config.ts", config, ts.ScriptTarget.Latest, true);
	let projects: string | undefined;
	const visit = (node: ts.Node): void => {
		if (ts.isPropertyAssignment(node) && node.name.getText(file) === "projects")
			projects = node.initializer.getText(file);

		ts.forEachChild(node, visit);
	};

	visit(file);

	return projects;
};

const jobsIn = (workflow: string): string[] =>
	(workflow.split(WORKFLOW_JOBS)[1] ?? "").split(WORKFLOW_JOB_HEADER).filter((job) => job.trim() !== "");

const missingBrowserSteps = (job: string): string[] => {
	const lines = job.split(NEWLINE).map((line) => line.trim().replace(YAML_ITEM_DASH, ""));

	return PLAYWRIGHT_RUN.test(job)
		? PLAYWRIGHT_BROWSER_STEPS.filter((step) => !lines.some((line) => step.test(line))).map((step) => step.source)
		: [];
};

const installedBrowsers = (workflow: string): string[] =>
	[...workflow.matchAll(PLAYWRIGHT_INSTALL)].map(([, rest]) =>
		rest
			.trim()
			.split(WHITESPACE)
			.filter((word) => !word.startsWith("-"))
			.join(" "),
	);

describe("the end-to-end browsers", () => {
	it("runs every Playwright config in Chromium and WebKit alone, in CI and locally alike", () => {
		const configs = walk(".").filter((file) => PLAYWRIGHT_CONFIG.test(file));
		const sample = (projects: string) =>
			compactCode(
				playwrightProjects(`export default defineConfig({ testDir: "./e2e", projects: ${projects} });`) ?? "",
			);
		const expanded = `[\n\t{\n\t\tname: "chromium",\n\t\tuse: { ...devices["Desktop Chrome"] },\n\t},\n\t{\n\t\tname: "webkit",\n\t\tuse: { ...devices["Desktop Safari"] },\n\t},\n]`;

		expect(sample(expanded)).toBe(compactCode(PLAYWRIGHT_PROJECTS));
		expect(sample(`process.env.CI ? ${PLAYWRIGHT_PROJECTS} : [{ name: "chromium" }]`)).not.toBe(
			compactCode(PLAYWRIGHT_PROJECTS),
		);
		expect(
			sample(PLAYWRIGHT_PROJECTS.replace("]", `\t{ name: "firefox", use: { ...devices["Desktop Firefox"] } },\n]`)),
		).not.toBe(compactCode(PLAYWRIGHT_PROJECTS));
		expect(configs.length).toBeGreaterThan(0);
		expect(
			configs.filter((file) => compactCode(playwrightProjects(read(file)) ?? "") !== compactCode(PLAYWRIGHT_PROJECTS)),
		).toEqual([]);
	});

	it("installs both browsers in every job that runs Playwright, behind a cache keyed on them, so a cache saved with one is never restored into a run of both", () => {
		const workflows = walk(".github/workflows").filter((file) => file.endsWith(".yml"));
		const jobs = workflows.flatMap((file) => jobsIn(read(file)).map((job) => ({ file, job })));
		const running = jobs.filter(({ job }) => PLAYWRIGHT_RUN.test(job));
		const steps = [
			"path: ~/.cache/ms-playwright",
			"key: os-playwright-chromium-webkit-lockfile",
			"if: steps.playwright-cache.outputs.cache-hit != 'true'",
			"run: pnpm exec playwright install --with-deps chromium webkit",
			"if: steps.playwright-cache.outputs.cache-hit == 'true'",
			"run: pnpm exec playwright install-deps chromium webkit",
		];
		const workflow = (lines: string[]) =>
			`name: x\njobs:\n  e2e:\n    steps:\n      - name: Browsers\n${lines.map((line) => `        ${line}`).join(NEWLINE)}\n      - run: pnpm test:e2e\n  other:\n    steps:\n      - run: echo\n`;
		const keyedOnChromium = steps.map((step) => step.replace("-playwright-chromium-webkit-", "-playwright-"));

		expect(jobsIn(workflow(steps)).length).toBe(2);
		expect(jobsIn(workflow(steps)).flatMap(missingBrowserSteps)).toEqual([]);
		expect(jobsIn(workflow(keyedOnChromium)).flatMap(missingBrowserSteps)).toEqual([
			PLAYWRIGHT_BROWSER_STEPS[1].source,
		]);
		expect(installedBrowsers("run: pnpm exec playwright install --with-deps chromium\n")).toEqual(["chromium"]);
		expect(installedBrowsers(steps.join(NEWLINE))).toEqual([PLAYWRIGHT_BROWSERS, PLAYWRIGHT_BROWSERS]);
		expect(running.length).toBeGreaterThan(1);
		expect(running.flatMap(({ file, job }) => missingBrowserSteps(job).map((step) => `${file}: ${step}`))).toEqual([]);
		expect(
			workflows.flatMap((file) =>
				installedBrowsers(read(file))
					.filter((browsers) => browsers !== PLAYWRIGHT_BROWSERS)
					.map((browsers) => `${file}: ${browsers}`),
			),
		).toEqual([]);
	});
});

const ACCESS_FIXTURE = "e2e/fixtures.ts";
const PLAYWRIGHT_PACKAGE = "@playwright/test";
const EXTRA_HEADERS_OPTION = "extraHTTPHeaders";
const EXTRA_HEADERS_SETTER = "setExtraHTTPHeaders";

const importsPlaywrightValues = (source: string): boolean =>
	ts
		.createSourceFile("spec.ts", source, ts.ScriptTarget.Latest, true)
		.statements.filter(ts.isImportDeclaration)
		.filter(({ moduleSpecifier }) => ts.isStringLiteral(moduleSpecifier) && moduleSpecifier.text === PLAYWRIGHT_PACKAGE)
		.some(({ importClause }) => {
			if (!importClause) return true;
			if (importClause.isTypeOnly) return false;
			if (importClause.name) return true;
			const bindings = importClause.namedBindings;

			return !bindings || ts.isNamespaceImport(bindings) || bindings.elements.some((element) => !element.isTypeOnly);
		});

const setsExtraHeaders = (source: string): boolean => {
	const file = ts.createSourceFile("source.ts", source, ts.ScriptTarget.Latest, true);
	let found = false;
	const visit = (node: ts.Node): void => {
		if (
			(ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) &&
			node.name.getText(file) === EXTRA_HEADERS_OPTION
		)
			found = true;
		if (ts.isPropertyAccessExpression(node) && node.name.text === EXTRA_HEADERS_SETTER) found = true;

		ts.forEachChild(node, visit);
	};

	visit(file);

	return found;
};

describe("the preview's Access token", () => {
	const e2eSources = walk("e2e").filter((file) => file.endsWith(".ts") && file !== ACCESS_FIXTURE);

	it("reaches every spec through e2e/fixtures.ts, which sends it to the preview's origin alone, so no spec takes a value from @playwright/test", () => {
		expect(importsPlaywrightValues('import { expect, test } from "@playwright/test";')).toBe(true);
		expect(importsPlaywrightValues('import { expect, type Page, test } from "@playwright/test";')).toBe(true);
		expect(importsPlaywrightValues('import * as playwright from "@playwright/test";')).toBe(true);
		expect(importsPlaywrightValues('import type { Page } from "@playwright/test";')).toBe(false);
		expect(importsPlaywrightValues('import { type Page } from "@playwright/test";')).toBe(false);
		expect(importsPlaywrightValues('import { expect, test } from "./fixtures";')).toBe(false);
		expect(exists(ACCESS_FIXTURE)).toBe(true);
		expect(e2eSources.filter((file) => file.endsWith(".spec.ts")).length).toBeGreaterThan(0);
		expect(e2eSources.filter((file) => importsPlaywrightValues(read(file)))).toEqual([]);
	});

	it("is set as extraHTTPHeaders by no Playwright config and no spec, because Playwright sends those on every request a page makes, to every third party included", () => {
		const configs = walk(".").filter((file) => PLAYWRIGHT_CONFIG.test(file));

		expect(setsExtraHeaders("export default defineConfig({ use: { extraHTTPHeaders: headers } });")).toBe(true);
		expect(setsExtraHeaders("test.use({ extraHTTPHeaders });")).toBe(true);
		expect(setsExtraHeaders("await page.setExtraHTTPHeaders(headers);")).toBe(true);
		expect(setsExtraHeaders('export default defineConfig({ use: { baseURL: "http://localhost" } });')).toBe(false);
		expect(configs.length).toBeGreaterThan(0);
		expect([...configs, ...e2eSources].filter((file) => setsExtraHeaders(read(file)))).toEqual([]);
	});
});

const SECURITY_TXT = /(?:^|\/)(?:public|assets)\/(?:.+\/)?security\.txt$/;
const SECURITY_TXT_PATH = "/.well-known/security.txt";
const SECURITY_TXT_FIELD = /^([\w-]+): *(.*)$/gm;
const SECURITY_TXT_SHAPE = ["Contact", "Expires", "Preferred-Languages", "Canonical", "Policy"].join(", ");
const SECURITY_TXT_RENEWAL_DAYS = 30;
const SECURITY_TXT_LIFETIME_YEARS = 2;
const DAY_IN_MS = 86_400_000;
const BARE_ORIGIN = /^https:\/\/[^/]+$/;
const GITHUB_REPOSITORY = /^git\+(https:\/\/github\.com\/[\w.-]+\/[\w-]+)\.git$/;
const SITES_SERVED = 1;

interface SecurityTxtFaultsParams {
	text: string;
	origin: string;
	repository: string;
	now: number;
}

const securityTxtFaults = ({ text, origin, repository, now }: SecurityTxtFaultsParams): string[] => {
	const fields = new Map([...text.matchAll(SECURITY_TXT_FIELD)].map(([, name, value]) => [name, value.trim()]));
	const shape = [...fields.keys()].join(", ");
	const expires = fields.get("Expires") ?? "";
	const instant = Date.parse(expires);
	const ceiling = new Date(now);
	const canonical = `${origin}${SECURITY_TXT_PATH}`;
	const policy = `${repository}/security/policy`;

	ceiling.setUTCFullYear(ceiling.getUTCFullYear() + SECURITY_TXT_LIFETIME_YEARS);

	const checks: [boolean, string][] = [
		[shape === SECURITY_TXT_SHAPE, `its fields are ${shape}, not ${SECURITY_TXT_SHAPE}`],
		[
			!Number.isNaN(instant) && new Date(instant).toISOString() === expires,
			`Expires ${expires} is not an ISO 8601 instant`,
		],
		[
			!(instant - now < SECURITY_TXT_RENEWAL_DAYS * DAY_IN_MS),
			`Expires ${expires} is fewer than ${SECURITY_TXT_RENEWAL_DAYS} days away: renew it`,
		],
		[!(instant > ceiling.getTime()), `Expires ${expires} is more than ${SECURITY_TXT_LIFETIME_YEARS} years away`],
		[fields.get("Canonical") === canonical, `Canonical ${fields.get("Canonical")} is not ${canonical}`],
		[fields.get("Policy") === policy, `Policy ${fields.get("Policy")} is not ${policy}`],
	];

	return checks.filter(([holds]) => !holds).map(([, fault]) => fault);
};

describe("security.txt", () => {
	const origin = read(".env.example").match(ENV_EXAMPLE_SITE_URL)?.[1]?.trim() ?? "";
	const repository = String(PACKAGE_JSON.repository?.url).match(GITHUB_REPOSITORY)?.[1] ?? "";
	const sites = new Map([["public", origin]]);
	const files = walk(".")
		.map((file) => file.replace(LEADING_RELATIVE, ""))
		.filter((file) => SECURITY_TXT.test(file));

	it("keeps one security.txt on every site this repository serves, naming a contact, the site's own canonical URL and this repository's policy, and reads the real clock on purpose: an Expires fewer than 30 days away turns main red a month before the file lapses, so the fix is to renew it, and one more than two years away is past the owner's ceiling", () => {
		const now = Date.UTC(2026, 9, 10);
		const inDays = (days: number) => new Date(now + days * DAY_IN_MS).toISOString();
		const sample = (fields: Record<string, string>) =>
			securityTxtFaults({
				text: Object.entries(fields)
					.map(([name, value]) => `${name}: ${value}`)
					.join(NEWLINE),
				origin: "https://example.org",
				repository: "https://github.com/owner/site",
				now,
			});
		const valid = {
			Contact: "mailto:security@example.org",
			Expires: inDays(365),
			"Preferred-Languages": "en",
			Canonical: "https://example.org/.well-known/security.txt",
			Policy: "https://github.com/owner/site/security/policy",
		};
		const { Canonical: canonical, ...noCanonical } = valid;
		const { Policy: policy, ...noPolicy } = valid;

		expect(SECURITY_TXT.test("apps/docs/public/.well-known/security.txt")).toBe(true);
		expect(SECURITY_TXT.test("app/assets/security.txt")).toBe(true);
		expect(SECURITY_TXT.test("docs/security.txt")).toBe(false);
		expect(sample(valid)).toEqual([]);
		expect(sample({ ...valid, Expires: inDays(30) })).toEqual([]);
		expect(sample({ ...valid, Expires: inDays(29) })).toEqual([
			`Expires ${inDays(29)} is fewer than 30 days away: renew it`,
		]);
		expect(sample({ ...valid, Expires: "2028-10-01T00:00:00.000Z" })).toEqual([]);
		expect(sample({ ...valid, Expires: "2028-10-11T00:00:00.000Z" })).toEqual([
			"Expires 2028-10-11T00:00:00.000Z is more than 2 years away",
		]);
		expect(sample({ ...valid, Expires: "the first of October" })).toEqual([
			"Expires the first of October is not an ISO 8601 instant",
		]);
		expect(sample(noCanonical)).toEqual([
			"its fields are Contact, Expires, Preferred-Languages, Policy, not Contact, Expires, Preferred-Languages, Canonical, Policy",
			`Canonical undefined is not ${canonical}`,
		]);
		expect(sample({ ...valid, Canonical: "https://example.com/.well-known/security.txt" })).toEqual([
			`Canonical https://example.com/.well-known/security.txt is not ${canonical}`,
		]);
		expect(sample(noPolicy)).toEqual([
			"its fields are Contact, Expires, Preferred-Languages, Canonical, not Contact, Expires, Preferred-Languages, Canonical, Policy",
			`Policy undefined is not ${policy}`,
		]);
		expect(origin).toMatch(BARE_ORIGIN);
		expect(repository).not.toBe("");
		expect(files.length).toBeGreaterThanOrEqual(SITES_SERVED);
		expect(files).toEqual([...sites.keys()].map((folder) => `${folder}${SECURITY_TXT_PATH}`));
		expect(
			files.flatMap((file) =>
				securityTxtFaults({
					text: read(file),
					origin: sites.get(file.slice(0, -SECURITY_TXT_PATH.length)) ?? "",
					repository,
					now: Date.now(),
				}).map((fault) => `${file}: ${fault}`),
			),
		).toEqual([]);
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

describe("the CMS", () => {
	interface SeedField {
		slug: string;
		type: string;
		validation?: { relation?: string };
	}

	interface SeedCollection {
		slug: string;
		dateField?: string;
		fields: SeedField[];
	}

	interface SeedTaxonomy {
		name: string;
		collections: string[];
	}

	interface SeedRelation {
		slug: string;
		parentCollection: string;
		childCollection: string;
	}

	interface Seed {
		collections: SeedCollection[];
		taxonomies: SeedTaxonomy[];
		relations: SeedRelation[];
	}

	const WRANGLER = read("wrangler.toml");
	const STAGES = ["production", "development"];
	const SYSTEM_ORDER_FIELDS = ["created_at", "updated_at", "published_at"];
	const HANDLED_CRON = /generalCron: "([^"]+)"/;
	const TRIGGERED_CRONS = /crons = \[([^\]]*)\]/;
	const QUERIED_COLLECTION = /collection: "(\w+)"/g;
	const ORDERED_QUERY = /collection: "(\w+)"[^}]*?orderBy: "(\w+)"/g;
	const { collections, taxonomies, relations } = readJson("seed/seed.json") as Seed;
	const applicationGuide = read("src/application/AGENTS.md");
	const loaders = production(walk("src/application/entities").filter((file) => TYPESCRIPT_FILE.test(file)));
	const declaredCollections = collections.map(({ slug }) => slug);
	const cronsOf = (table: string): string[] =>
		[...(tomlTable({ toml: WRANGLER, table }).match(TRIGGERED_CRONS)?.[1] ?? "").matchAll(DOUBLE_QUOTED_VALUE)].map(
			([, cron]) => cron,
		);

	it("names the same cron in the scheduled handler and in production's triggers, and none in development's", () => {
		const handled = read("src/worker.ts").match(HANDLED_CRON)?.[1];

		expect(handled).toBeDefined();
		expect(cronsOf("triggers")).toEqual([handled]);
		expect(cronsOf("env.production.triggers")).toEqual([handled]);
		expect(cronsOf("env.development.triggers")).toEqual([]);
		expect(AGENTS_MD).toContain("EmDash's cron is named twice");
	});

	it("asks the CMS only for collections its seed declares, and documents every one of them", () => {
		const asked = [
			...new Set(loaders.flatMap((file) => [...read(file).matchAll(QUERIED_COLLECTION)].map(([, name]) => name))),
		];

		expect(asked.length).toBeGreaterThan(0);
		expect(asked.filter((name) => !declaredCollections.includes(name))).toEqual([]);
		expect(declaredCollections.filter((name) => !applicationGuide.includes(`| \`${name}\` |`))).toEqual([]);
	});

	it("files Tags under the taxonomy the mappers read, on the collection they read it from", () => {
		const taxonomy = read("src/application/dto/article/types.ts").match(/ARTICLE_TAG_TAXONOMY = "(\w+)"/)?.[1];

		expect(taxonomy).toBeDefined();
		expect(taxonomies.find(({ name }) => name === taxonomy)?.collections).toEqual(["articles"]);
		expect(declaredCollections).not.toContain("tags");
	});

	it("reads only reference fields the seed declares, and the Author relation from both of its ends", () => {
		const declared = collections
			.flatMap(({ fields }) => fields.filter(({ type }) => type === "reference"))
			.map(({ slug }) => slug);
		const readFields = [
			read("src/application/dto/author/types.ts").match(/AUTHOR_ARTICLES_FIELD = "(\w+)"/)?.[1],
			read("src/application/entities/articles/articles.ts").match(/RELATED_ARTICLES_FIELD = "(\w+)"/)?.[1],
		];
		const authorRelation = relations.find(
			({ parentCollection, childCollection }) => parentCollection === "articles" && childCollection === "authors",
		);
		const boundTo = (collection: string) =>
			collections
				.find(({ slug }) => slug === collection)
				?.fields.filter(({ validation }) => validation?.relation === authorRelation?.slug)
				.map(({ slug }) => slug);

		expect(readFields.filter((field) => !field || !declared.includes(field))).toEqual([]);
		expect(authorRelation).toBeDefined();
		expect(boundTo("articles")).toEqual(["author"]);
		expect(boundTo("authors")).toEqual([readFields[0]]);
	});

	it("orders by a field EmDash sorts on: a system column, or the collection's own date field", () => {
		const ordered = loaders.flatMap((file) =>
			[...read(file).matchAll(ORDERED_QUERY)].map(([, collection, field]) => ({ collection, field })),
		);
		const unsortable = ordered.filter(
			({ collection, field }) =>
				!SYSTEM_ORDER_FIELDS.includes(field) &&
				collections.find(({ slug }) => slug === collection)?.dateField !== field,
		);

		expect(ordered.length).toBeGreaterThan(0);
		expect(unsortable).toEqual([]);
	});

	it("keeps the generated collection types it typechecks against in step with the seed", () => {
		const generated = read("emdash-env.d.ts");

		expect(declaredCollections.filter((name) => !generated.includes(`${name}: `))).toEqual([]);
		expect(read("tsconfig.json")).toContain('"emdash-env.d.ts"');
	});

	it("binds the database and the bucket under the names the integration reads, in every stage", () => {
		const config = read("astro.config.ts");

		expect(config).toContain('d1({ binding: "DB" })');
		expect(config).toContain('r2({ binding: "MEDIA" })');
		expect(config).toContain("provider: cacheCloudflare()");
		expect(WRANGLER.match(/binding = "DB"/g)).toHaveLength(STAGES.length + 1);
		expect(WRANGLER.match(/binding = "MEDIA"/g)).toHaveLength(STAGES.length + 1);
		expect(WRANGLER).toContain('main = "./src/worker.ts"');
		expect(tomlTable({ toml: WRANGLER, table: "vars" })).toBe(
			tomlTable({ toml: WRANGLER, table: "env.production.vars" }),
		);
		expect(read("src/worker.ts")).toContain("PluginBridge");
	});

	it("leaves EmDash's routes to EmDash's own headers", () => {
		const middleware = read("src/middleware.ts");

		expect(middleware).toContain('const EMDASH_ROUTES = "/_emdash/"');
		expect(middleware).toContain("if (url.pathname.startsWith(EMDASH_ROUTES)) return response;");
	});

	it("names in the guide every plugin astro.config.ts registers", () => {
		const registered = [
			...(read("astro.config.ts").match(/plugins: \[([^\]]*)\]/)?.[1] ?? "").matchAll(/(\w+)\(\)/g),
		].map(([, plugin]) => plugin);

		expect(registered.length).toBeGreaterThan(0);
		expect(registered.filter((plugin) => !read("src/infrastructure/AGENTS.md").includes(`\`${plugin}\``))).toEqual([]);
		expect(registered.filter((plugin) => !exists(`src/infrastructure/cms/plugins/${plugin}/descriptor.ts`))).toEqual(
			[],
		);
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
const RELEASE_COMMIT_PLUGIN = "@semantic-release/git";
const RELEASE_CONFIG_PATTERN = /(^|\/)(\.releaserc(\.\w+)?|release\.config\.\w+)$/;

type ReleasePlugin = string | [string, Record<string, unknown>?];

interface PluginOptionsOfParams {
	plugins: ReleasePlugin[];
	name: string;
}

const pluginOptionsOf = ({ plugins, name }: PluginOptionsOfParams): Record<string, unknown> | undefined => {
	const entry = plugins.find((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === name);

	return Array.isArray(entry) ? entry[1] : undefined;
};

describe("the release config parses the commit grammar commitlint accepts", () => {
	const configs = walk(".").filter((file) => RELEASE_CONFIG_PATTERN.test(file));

	it("teaches every plugin that parses a commit message the same header grammar", () => {
		const wrong = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };

			return COMMIT_PARSING_PLUGINS.filter(
				(name) =>
					JSON.stringify(pluginOptionsOf({ plugins, name })?.parserOpts) !== JSON.stringify(BREAKING_PARSER_OPTS),
			).map((name) => `${file}: ${name}`);
		});

		expect(configs.length).toBeGreaterThan(0);
		expect(wrong).toEqual([]);
	});

	it("commits the release, which commitlint never sees, under the release scope and [skip ci] so it starts no run", () => {
		const wrong = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };
			const message = String(pluginOptionsOf({ plugins, name: RELEASE_COMMIT_PLUGIN })?.message ?? "");

			return message.startsWith(`chore(release): \${nextRelease.version}`) && message.includes("[skip ci]")
				? []
				: [`${file}: ${message}`];
		});

		expect(wrong).toEqual([]);
	});

	it("commits only the files a release rewrites, and a version bump never touches the lockfile", () => {
		const listed = configs.flatMap((file) => {
			const { plugins } = readJson(file) as { plugins: ReleasePlugin[] };
			const assets = (pluginOptionsOf({ plugins, name: RELEASE_COMMIT_PLUGIN })?.assets as string[] | undefined) ?? [];

			return assets.filter((asset) => asset.includes("lock")).map((asset) => `${file}: ${asset}`);
		});

		expect(listed).toEqual([]);
	});
});
