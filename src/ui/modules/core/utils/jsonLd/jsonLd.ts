interface BuildWebSiteSchemaParams {
	url: string;
	name: string;
	description: string;
	author: {
		name: string;
		jobTitle: string;
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
	image?: {
		url: string;
		width: number;
		height: number;
	};
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

export function buildItemListSchema(urls: string[]): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: urls.map((url, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url,
		})),
	});
}

export function buildWebSiteSchema({ url, name, description, author }: BuildWebSiteSchemaParams): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebSite",
		url,
		name,
		description,
		author: {
			"@type": "Person",
			name: author.name,
			jobTitle: author.jobTitle,
			url,
		},
	});
}

export function buildContactPageSchema({ url, name, description }: BuildContactPageSchemaParams): string {
	return JSON.stringify({
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
	image,
	datePublished,
	dateModified,
	author,
	publisher,
}: BuildBlogPostingSchemaParams): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		url,
		headline,
		description,
		inLanguage: "en",
		...(image && {
			image: {
				"@type": "ImageObject",
				url: image.url,
				width: image.width,
				height: image.height,
			},
		}),
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
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": url,
		},
	});
}

export function buildBreadcrumbListSchema(items: BreadcrumbListItem[]): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map(({ name, url }, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@id": url,
				name,
			},
		})),
	});
}

export function buildProfilePageSchema({ person, latestArticle }: BuildProfilePageSchemaParams): string {
	return JSON.stringify({
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
