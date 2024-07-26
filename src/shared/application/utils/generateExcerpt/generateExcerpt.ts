import type MarkdownIt from "markdown-it";

interface ExcerptParams {
	parser: MarkdownIt;
	content: string;
	limit?: number;
}

interface ExcerptReturnType {
	excerpt: string;
}

const EXCERPT_LIMIT = 140;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

export function generateExcerpt({ parser, content, limit = EXCERPT_LIMIT }: ExcerptParams): ExcerptReturnType {
	const excerpt = parser
		.render(content)
		.split("\n")
		.slice(0, 6)
		.flatMap((string: string) => string.replace(HTML_TAG_REGEX, "").split("\n"))
		.join(" ")
		.substring(0, limit)
		.trim();

	return { excerpt: `${excerpt}...` };
}
