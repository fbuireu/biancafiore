const HYPHEN_REGEX = /-/g;
const CAPITALIZE_REGEX = /\b\w/g;

export function deSlugify(slug: string): string {
	return slug.replace(HYPHEN_REGEX, " ").replace(CAPITALIZE_REGEX, (match) => match.toUpperCase());
}
