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
