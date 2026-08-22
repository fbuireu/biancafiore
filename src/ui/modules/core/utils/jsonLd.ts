import { absoluteUrl, articleHref, DEFAULT_LOCALE_STRING, projectHref, tagHref } from "@const/index";

const ARTICLE_IMAGE_CROPS = [
	{ width: 1200, height: 675 },
	{ width: 1200, height: 900 },
	{ width: 1200, height: 1200 },
] as const;

interface BuildWebSiteSchemaParams {
	url: string;
	name: string;
	description: string;
	author: {
		name: string;
		jobTitle: string;
		url: string;
	};
}

interface BuildContactPageSchemaParams {
	url: string;
	name: string;
	description: string;
}

interface BuildBlogPostingSchemaParams {
	url: string;
	headline: string;
	description: string;
	imageUrl?: string;
	datePublished: string;
	dateModified?: string;
	author: {
		name: string;
		jobTitle: string;
		url: string;
	};
	publisher: {
		name: string;
		url: string;
	};
	keywords?: string[];
}

interface BreadcrumbListItem {
	name: string;
	url: string;
}

interface BuildProfilePageSchemaParams {
	person: {
		id: string;
		name: string;
		url: string;
		image: string;
		jobTitle: string;
		company: string;
		sameAs: string[];
	};
	latestArticle?: {
		headline: string;
		url: string;
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

export function buildWebSiteSchema({ url, name, description, author }: BuildWebSiteSchemaParams): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		url,
		name,
		description,
		author: {
			"@type": "Person",
			name: author.name,
			jobTitle: author.jobTitle,
			url: author.url,
		},
	});
}

export function buildContactPageSchema({ url, name, description }: BuildContactPageSchemaParams): string {
	return serializeJsonLd({
		"@context": "https://schema.org",
		"@type": "ContactPage",
		url,
		name,
		description,
	});
}

export function buildBlogPostingSchema({
	url,
	headline,
	description,
	imageUrl,
	datePublished,
	dateModified,
	author,
	publisher,
	keywords,
}: BuildBlogPostingSchemaParams): string {
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
			url: author.url,
		},
		publisher: {
			"@type": "Person",
			name: publisher.name,
			url: publisher.url,
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
		itemListElement: items.map(({ name, url }, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name,
			item: url,
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
			url: person.url,
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
					url: latestArticle.url,
					datePublished: latestArticle.datePublished,
					author: { "@id": person.id },
				},
			],
		}),
	});
}
