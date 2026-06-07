const HTML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

const UNSAFE_HTML_CHARACTERS = /[&<>"']/g;

export function escapeHtml(value: string): string {
	return value.replace(UNSAFE_HTML_CHARACTERS, (character) => HTML_ENTITIES[character] ?? character);
}
