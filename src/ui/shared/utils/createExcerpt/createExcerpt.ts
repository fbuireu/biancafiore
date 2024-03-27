import MarkdownIt from 'markdown-it';

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

export function createExcerpt({ parser, content, limit = EXCERPT_LIMIT }: ExcerptParams): ExcerptReturnType {
    const excerpt = parser
        .render(content)
        .split('\n')
        .slice(0, 6)
        .map((string: string) => string.replace(HTML_TAG_REGEX, '').split('\n'))
        .flat()
        .join(' ')
        .substring(0, limit)
        .trim();

    return { excerpt: `${excerpt}...` };
}
