export function deSlugify(slug: string): string {
	return slug
		.replace(/-/g, ' ')
		.replace(/\b\w/g, match => match.toUpperCase());
}