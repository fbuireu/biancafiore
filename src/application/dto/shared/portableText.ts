import { isTagPath } from "@const/index";
import type { PortableText } from "@domain/shared/portableText";
import { z } from "@shared/utils/zod";

export type PortableTextContent = PortableText;

type PortableTextNode = PortableText[number];

const CANONICAL_ORIGIN = "https://biancafiore.me";
const CANONICAL_HOSTNAME = "biancafiore.me";
const WEB_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_PROTOCOLS = new Set([...WEB_PROTOCOLS, "mailto:", "tel:"]);
const ABSOLUTE_URL = /^[a-z][a-z\d+.-]*:/i;

const linkSchema = z.looseObject({ _type: z.literal("link"), _key: z.string(), href: z.string().min(1) });

const markDefsSchema = z.array(z.looseObject({ _type: z.string(), _key: z.string() }));

const spanSchema = z.looseObject({ _type: z.literal("span"), text: z.string(), marks: z.array(z.string()).optional() });

const textBlockSchema = z.looseObject({ _type: z.literal("block"), children: z.array(z.unknown()) });

const tableSchema = z.looseObject({
	_type: z.literal("table"),
	markDefs: markDefsSchema.optional(),
	rows: z.array(
		z.looseObject({
			cells: z.array(z.looseObject({ content: z.array(z.unknown()), markDefs: markDefsSchema.optional() })),
		}),
	),
});

type MarkDef = z.infer<typeof markDefsSchema>[number];

function prepareLink(markDef: MarkDef): MarkDef | undefined {
	if (!linkSchema.validate(markDef) || !URL.canParse(markDef.href, CANONICAL_ORIGIN)) {
		return undefined;
	}

	const url = new URL(markDef.href, CANONICAL_ORIGIN);

	if (!SAFE_PROTOCOLS.has(url.protocol)) {
		return undefined;
	}

	if (!WEB_PROTOCOLS.has(url.protocol)) {
		return markDef;
	}

	if (url.hostname !== CANONICAL_HOSTNAME) {
		return { ...markDef, blank: true };
	}

	const href = ABSOLUTE_URL.test(markDef.href) ? `${url.pathname}${url.search}${url.hash}` : markDef.href;

	return { ...markDef, href, blank: isTagPath(url.pathname) };
}

const prepareMarkDef = (markDef: MarkDef): MarkDef | undefined =>
	markDef._type === "link" ? prepareLink(markDef) : markDef;

interface PrepareInlineParams {
	children: unknown[];
	markDefs: MarkDef[];
}

function prepareInline({ children, markDefs }: PrepareInlineParams): PrepareInlineParams {
	const prepared = markDefs.flatMap((markDef) => prepareMarkDef(markDef) ?? []);
	const dropped = new Set(
		markDefs.filter((markDef) => !prepared.some(({ _key }) => _key === markDef._key)).map(({ _key }) => _key),
	);

	return {
		markDefs: prepared,
		children: children.map((child) =>
			spanSchema.validate(child) && child.marks?.some((mark) => dropped.has(mark))
				? { ...child, marks: child.marks.filter((mark) => !dropped.has(mark)) }
				: child,
		),
	};
}

const markDefsOf = (value: unknown): MarkDef[] => (markDefsSchema.validate(value) ? value : []);

function prepareTable(table: z.infer<typeof tableSchema>): PortableTextNode {
	const tableMarkDefs = markDefsOf(table.markDefs);

	return {
		...table,
		markDefs: prepareInline({ children: [], markDefs: tableMarkDefs }).markDefs,
		rows: table.rows.map((row) => ({
			...row,
			cells: row.cells.map((cell) => {
				const { children, markDefs } = prepareInline({
					children: cell.content,
					markDefs: [...tableMarkDefs, ...markDefsOf(cell.markDefs)],
				});

				return {
					...cell,
					content: children,
					markDefs: markDefs.filter(({ _key }) => markDefsOf(cell.markDefs).some((own) => own._key === _key)),
				};
			}),
		})),
	};
}

export function prepareLinks(content: PortableText | undefined): PortableText {
	return (content ?? []).map((node) => {
		if (textBlockSchema.validate(node)) {
			return { ...node, ...prepareInline({ children: node.children, markDefs: markDefsOf(node.markDefs) }) };
		}

		return tableSchema.validate(node) ? prepareTable(node) : node;
	});
}

const spanText = (children: unknown[]): string =>
	children.map((child) => (spanSchema.validate(child) ? child.text : "")).join("");

const stringsOf = (...values: unknown[]): string[] =>
	values.filter((value): value is string => typeof value === "string" && value.length > 0);

function textOf(node: PortableTextNode): string[] {
	if (textBlockSchema.validate(node)) {
		return [spanText(node.children)];
	}

	if (tableSchema.validate(node)) {
		return node.rows.flatMap(({ cells }) => cells.map(({ content }) => spanText(content)));
	}

	return stringsOf(node.caption, node.heading, node.text, node.code);
}

export function prepareProse(content: PortableText | undefined): PortableText {
	return prepareLinks(content).filter((node) => textBlockSchema.validate(node));
}

export function proseOf(content: PortableText | undefined): string {
	return (content ?? [])
		.filter((node) => textBlockSchema.validate(node))
		.flatMap(textOf)
		.join(" ");
}

export function readableTextOf(content: PortableText | undefined): string {
	return (content ?? []).flatMap(textOf).join(" ");
}
