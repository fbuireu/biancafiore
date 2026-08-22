import { absoluteUrl, articleHref, DEFAULT_LOCALE_STRING, projectHref, tagHref } from "@const/index";

const ARTICLE_IMAGE_CROPS = [
	{ width: 1200, height: 675 },
	{ width: 1200, height: 900 },
	{ width: 1200, height: 1200 },
] as const;

interface BuildWebSiteSchemaParams {
	path: string;
	name: string;
	description: string;
	author: {
		name: string;
		jobTitle: string;
		path: string;
	};
}

interface BuildContactPageSchemaParams {
	path: string;
	name: string;
	description: string;
}

interface BuildBlogPostingSchemaParams {
	path: string;
	headline: string;
	description: string;
	imageUrl?: string;
	datePublished: string;
	dateModified?: string;
	author: {
		name: string;
		jobTitle: string;
		path: string;
	};
	publisher: {
		name: string;
		path: string;
	};
	keywords?: string[];
}

interface BreadcrumbListItem {
	name: string;
	path: string;
}

interface BuildProfilePageSchemaParams {
	person: {
		id: string;
		name: string;
		path: string;
		image: string;
		jobTitle: string;
		company: string;
		sameAs: string[];
	};
	latestArticle?: {
		headline: string;
		path: string;
		datePublished: string;
	};
}

function buildArticleImageVariants(imageUrl: string): string[] {
	return ARTICLE_IMAGE_CROPS.map(({ width, height }) => `${imageUrl}?w=${width}&h=${height}&fit=fill`);
}

function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replaceAll("<", String.raw`\u003c`);
}

function buildItemListSchema(urls: string[]): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: urls.map((url, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url,
		})),
	});
}

export function buildArticleListSchema(slugs: string[]): string {
	return buildItemListSchema(slugs.map((slug) => absoluteUrl(articleHref(slug))));
}

export function buildProjectListSchema(ids: string[]): string {
	return buildItemListSchema(ids.map((id) => absoluteUrl(projectHref(id))));
}

export function buildTagListSchema(slugs: string[]): string {
	return buildItemListSchema(slugs.map((slug) => absoluteUrl(tagHref(slug))));
}

export function buildWebSiteSchema({ path, name, description, author }: BuildWebSiteSchemaParams): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		url: absoluteUrl(path),
		name,
		description,
		author: {
			"@type": "Person",
			name: author.name,
			jobTitle: author.jobTitle,
			url: absoluteUrl(author.path),
		},
	});
}

export function buildContactPageSchema({ path, name, description }: BuildContactPageSchemaParams): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "ContactPage",
		url: absoluteUrl(path),
		name,
		description,
	});
}

export function buildBlogPostingSchema({
	path,
	headline,
	description,
	imageUrl,
	datePublished,
	dateModified,
	author,
	publisher,
	keywords,
}: BuildBlogPostingSchemaParams): string {
	const url = absoluteUrl(path);

	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		url,
		headline,
		description,
		inLanguage: DEFAULT_LOCALE_STRING,
		...(imageUrl && { image: buildArticleImageVariants(imageUrl) }),
		datePublished,
		dateModified,
		author: {
			"@type": "Person",
			name: author.name,
			jobTitle: author.jobTitle,
			url: absoluteUrl(author.path),
		},
		publisher: {
			"@type": "Person",
			name: publisher.name,
			url: absoluteUrl(publisher.path),
		},
		...(keywords && keywords.length > 0 && { keywords: keywords.join(", ") }),
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
	});
}

export function buildBreadcrumbListSchema(items: BreadcrumbListItem[]): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map(({ name, path }, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name,
			item: absoluteUrl(path),
		})),
	});
}

export function buildProfilePageSchema({ person, latestArticle }: BuildProfilePageSchemaParams): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		mainEntity: {
			"@id": person.id,
			"@type": "Person",
			name: person.name,
			url: absoluteUrl(person.path),
			image: person.image,
			jobTitle: person.jobTitle,
			worksFor: {
				"@type": "Organization",
				name: person.company,
			},
			sameAs: person.sameAs,
		},
		...(latestArticle && {
			hasPart: [
				{
					"@type": "Article",
					headline: latestArticle.headline,
					url: absoluteUrl(latestArticle.path),
					datePublished: latestArticle.datePublished,
					author: { "@id": person.id },
				},
			],
		}),
	});
}
