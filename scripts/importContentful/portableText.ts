import { type ContentfulAsset, type ContentfulEntry, contentTypeOf, linkedId } from "./contentful.ts";

export interface UploadedMedia {
	id: string;
	url: string;
	storageKey: string;
	filename: string;
	mimeType: string;
	width?: number;
	height?: number;
	blurhash?: string;
	dominantColor?: string;
}

export interface RichTextNode {
	nodeType: string;
	value?: string;
	marks?: Array<{ type: string }>;
	data?: Record<string, unknown>;
	content?: RichTextNode[];
}

export interface ConversionContext {
	entries: Map<string, ContentfulEntry>;
	assets: Map<string, ContentfulAsset>;
	media: Map<string, UploadedMedia>;
	title: string;
	warnings: string[];
	nextKey: () => string;
}

export type PortableTextBlock = Record<string, unknown> & { _type: string; _key: string };

type ListItem = "bullet" | "number";

interface Span {
	_type: "span";
	_key: string;
	text: string;
	marks: string[];
}

interface MarkDef {
	_type: "link";
	_key: string;
	href: string;
}

interface Inline {
	children: Span[];
	markDefs: MarkDef[];
}

interface Converting {
	context: ConversionContext;
}

interface NodeParams extends Converting {
	node: RichTextNode;
}

interface InlineOfParams extends Converting {
	nodes: RichTextNode[];
}

interface TextBlockParams extends NodeParams {
	style: string;
	list?: { listItem: ListItem; level: number };
}

interface ListBlocksParams extends NodeParams {
	listItem: ListItem;
	level: number;
}

interface ImageBlockParams extends Converting {
	assetId: string | undefined;
	alignment?: string;
	caption?: string;
}

interface DescribedAssetParams extends Converting {
	assetId: string | undefined;
}

interface RichTextToPortableTextParams extends Converting {
	document: unknown;
}

interface AssetIdsInParams {
	document: unknown;
	entries: Map<string, ContentfulEntry>;
}

const MARKS: Record<string, string> = {
	bold: "strong",
	italic: "em",
	underline: "underline",
	code: "code",
	superscript: "superscript",
	subscript: "subscript",
	strikethrough: "strike-through",
};

const HEADING = /^heading-([1-6])$/;

const ALIGNMENT: Record<string, string> = { fullBleed: "full", breakout: "wide" };

const LIST_ITEM: Record<string, ListItem> = { "unordered-list": "bullet", "ordered-list": "number" };

const LINE_BREAK: RichTextNode = { nodeType: "text", value: "\n", marks: [] };

export function joinedParagraphs(paragraphs: RichTextNode[]): RichTextNode {
	return {
		nodeType: "paragraph",
		content: paragraphs.flatMap((paragraph, index) => [
			...(index > 0 ? [LINE_BREAK] : []),
			...(paragraph.content ?? []),
		]),
	};
}

export function articleHref(slug: string): string {
	return `/articles/${slug.trim()}`;
}

export const textOf = (value: unknown): string | undefined =>
	typeof value === "string" && value.trim() ? value : undefined;

function describedAsset({ assetId, context }: DescribedAssetParams): string | undefined {
	const asset = context.assets.get(assetId ?? "");

	return textOf(asset?.fields.description) ?? textOf(asset?.fields.title);
}

function inlineOf({ nodes, context }: InlineOfParams): Inline {
	const inline: Inline = { children: [], markDefs: [] };

	const push = (value: string, marks: string[]) => {
		if (value) inline.children.push({ _type: "span", _key: context.nextKey(), text: value, marks });
	};

	const link = (href: string): string => {
		const markDef: MarkDef = { _type: "link", _key: context.nextKey(), href };

		inline.markDefs.push(markDef);

		return markDef._key;
	};

	const walk = (node: RichTextNode, marks: string[]): void => {
		if (node.nodeType === "text") {
			const own = (node.marks ?? []).flatMap(({ type }) => (MARKS[type] ? [MARKS[type]] : []));

			push(node.value ?? "", [...marks, ...own]);
			return;
		}

		const targetId = linkedId(node.data?.target);

		if (node.nodeType === "hyperlink" && typeof node.data?.uri === "string") {
			const key = link(node.data.uri);

			for (const child of node.content ?? []) walk(child, [...marks, key]);
			return;
		}

		if (node.nodeType === "entry-hyperlink" || node.nodeType === "embedded-entry-inline") {
			const entry = context.entries.get(targetId ?? "");
			const slug = textOf(entry?.fields.slug);

			if (entry && contentTypeOf(entry) === "article" && slug) {
				const key = link(articleHref(slug));
				const children = node.nodeType === "embedded-entry-inline" ? [] : (node.content ?? []);

				if (children.length === 0) push(textOf(entry.fields.title) ?? slug, [...marks, key]);
				for (const child of children) walk(child, [...marks, key]);
				return;
			}

			context.warnings.push(`An inline link to entry ${targetId} is not a published Article, so it is kept as text`);
		}

		if (node.nodeType === "asset-hyperlink") {
			const media = context.media.get(targetId ?? "");

			if (media) {
				const key = link(media.url);

				for (const child of node.content ?? []) walk(child, [...marks, key]);
				return;
			}
		}

		for (const child of node.content ?? []) walk(child, marks);
	};

	for (const node of nodes) walk(node, []);

	return inline;
}

function textBlock({ node, style, list, context }: TextBlockParams): PortableTextBlock[] {
	const { children, markDefs } = inlineOf({ nodes: node.content ?? [], context });

	if (children.length === 0) return [];

	return [
		{
			_type: "block",
			_key: context.nextKey(),
			style,
			children,
			markDefs,
			...(list && { listItem: list.listItem, level: list.level }),
		},
	];
}

function listBlocks({ node, listItem, level, context }: ListBlocksParams): PortableTextBlock[] {
	return (node.content ?? []).flatMap((item) => {
		const children = item.content ?? [];
		const paragraphs = children.filter((child) => !LIST_ITEM[child.nodeType]);
		const nestedLists = children.filter((child) => LIST_ITEM[child.nodeType]);

		return [
			...textBlock({ node: joinedParagraphs(paragraphs), style: "normal", list: { listItem, level }, context }),
			...nestedLists.flatMap((child) =>
				listBlocks({ node: child, listItem: LIST_ITEM[child.nodeType], level: level + 1, context }),
			),
		];
	});
}

function imageBlock({ assetId, alignment, caption, context }: ImageBlockParams): PortableTextBlock[] {
	const media = context.media.get(assetId ?? "");

	if (!media) {
		context.warnings.push(`An image points at asset ${assetId}, which has no uploaded file, so it is dropped`);
		return [];
	}

	return [
		{
			_type: "image",
			_key: context.nextKey(),
			asset: { _ref: media.id, url: media.url },
			alt: describedAsset({ assetId, context }) ?? context.title,
			...(caption && { caption }),
			...(media.width && { width: media.width }),
			...(media.height && { height: media.height }),
			...(media.blurhash && { blurhash: media.blurhash }),
			...(media.dominantColor && { dominantColor: media.dominantColor }),
			...(alignment && { alignment }),
		},
	];
}

function embeddedEntry({ node, context }: NodeParams): PortableTextBlock[] {
	const id = linkedId(node.data?.target);
	const entry = context.entries.get(id ?? "");

	if (!entry) {
		context.warnings.push(`An embedded entry ${id} is not published, so it is dropped`);
		return [];
	}

	const { fields } = entry;
	const key = context.nextKey();
	const assetId = linkedId(fields.image);

	switch (contentTypeOf(entry)) {
		case "codeBlock":
			return textOf(fields.code) ? [{ _type: "code", _key: key, code: fields.code }] : [];
		case "videoEmbed":
			return [{ _type: "videoEmbed", _key: key, url: fields.url, title: fields.title }];
		case "iframeEmbed":
			return [{ _type: "iframe", _key: key, src: fields.url, ...(textOf(fields.title) && { title: fields.title }) }];
		case "imageEmbed":
			return imageBlock({
				assetId,
				alignment: ALIGNMENT[String(fields.layout)],
				caption: textOf(fields.caption),
				context,
			});
		case "splitBlock": {
			const media = context.media.get(assetId ?? "");

			return [
				{
					_type: "splitBlock",
					_key: key,
					...(textOf(fields.heading) && { heading: fields.heading }),
					...(textOf(fields.text) && { text: fields.text }),
					...(media && { image: media.url }),
					alt: describedAsset({ assetId, context }) ?? "",
				},
			];
		}
		default:
			context.warnings.push(`An embedded ${contentTypeOf(entry)} (${id}) has no Portable Text block, so it is dropped`);
			return [];
	}
}

function tableBlock({ node, context }: NodeParams): PortableTextBlock[] {
	const rows = (node.content ?? []).map((row) => ({
		_type: "tableRow",
		_key: context.nextKey(),
		cells: (row.content ?? []).map((cell) => {
			const { children, markDefs } = inlineOf({ nodes: joinedParagraphs(cell.content ?? []).content ?? [], context });

			return {
				_type: "tableCell",
				_key: context.nextKey(),
				content: children,
				markDefs,
				...(cell.nodeType === "table-header-cell" && { isHeader: true }),
			};
		}),
	}));

	return [{ _type: "table", _key: context.nextKey(), rows }];
}

function block({ node, context }: NodeParams): PortableTextBlock[] {
	const heading = node.nodeType.match(HEADING);
	const listItem = LIST_ITEM[node.nodeType];

	if (heading) return textBlock({ node, style: `h${heading[1]}`, context });
	if (listItem) return listBlocks({ node, listItem, level: 1, context });

	switch (node.nodeType) {
		case "paragraph":
			return textBlock({ node, style: "normal", context });
		case "blockquote":
			return textBlock({ node: joinedParagraphs(node.content ?? []), style: "blockquote", context });
		case "hr":
			return [{ _type: "break", _key: context.nextKey(), style: "lineBreak" }];
		case "table":
			return tableBlock({ node, context });
		case "embedded-entry-block":
			return embeddedEntry({ node, context });
		case "embedded-asset-block": {
			const assetId = linkedId(node.data?.target);

			return imageBlock({
				assetId,
				alignment: "full",
				caption: textOf(context.assets.get(assetId ?? "")?.fields.description),
				context,
			});
		}
		default:
			context.warnings.push(`A ${node.nodeType} node has no Portable Text equivalent, so it is dropped`);
			return [];
	}
}

export function richTextToPortableText({ document, context }: RichTextToPortableTextParams): PortableTextBlock[] {
	return ((document as RichTextNode | undefined)?.content ?? []).flatMap((node) => block({ node, context }));
}

export function assetIdsIn({ document, entries }: AssetIdsInParams): string[] {
	const ids = new Set<string>();

	const walk = (node: RichTextNode): void => {
		const id = linkedId(node.data?.target);

		if (id && (node.nodeType === "embedded-asset-block" || node.nodeType === "asset-hyperlink")) ids.add(id);

		const imageId =
			id && node.nodeType === "embedded-entry-block" ? linkedId(entries.get(id)?.fields.image) : undefined;

		if (imageId) ids.add(imageId);

		for (const child of node.content ?? []) walk(child);
	};

	for (const node of (document as RichTextNode | undefined)?.content ?? []) walk(node);

	return [...ids];
}
