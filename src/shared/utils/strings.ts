const SPACES_REGEX = /\s+/g;
const NON_ALPHA_NUMERIC_REGEX = /[^\w-]+/g;
const CONSECUTIVE_HYPHENS_REGEX = /--+/g;
const SURROUNDING_HYPHENS_REGEX = /^-+|-+$/g;
const HYPHEN_REGEX = /-/g;
const CAPITALIZE_REGEX = /\b\w/g;
const HTML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};
const UNSAFE_HTML_CHARACTERS = /[&<>"']/g;

export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.normalize("NFD")
		.trim()
		.replace(SPACES_REGEX, "-")
		.replace(NON_ALPHA_NUMERIC_REGEX, "")
		.replace(CONSECUTIVE_HYPHENS_REGEX, "-")
		.replace(SURROUNDING_HYPHENS_REGEX, "");
}

export function deSlugify(slug: string): string {
	return slug.replaceAll(HYPHEN_REGEX, " ").replace(CAPITALIZE_REGEX, (match) => match.toUpperCase());
}

export function escapeHtml(value: string): string {
	return value.replace(UNSAFE_HTML_CHARACTERS, (character) => HTML_ENTITIES[character] ?? character);
}
