import { type PortableTextComponents, toHTML } from "@portabletext/to-html";
import type { ArbitraryTypedObject, PortableTextBlock } from "@portabletext/types";

export type PortableTextContent = Array<PortableTextBlock | ArbitraryTypedObject>;

export const PORTABLE_TEXT_COMPONENTS = {
	marks: {
		underline: ({ children }) => `<u>${children}</u>`,
		superscript: ({ children }) => `<sup>${children}</sup>`,
		subscript: ({ children }) => `<sub>${children}</sub>`,
	},
	types: {
		break: () => "<hr/>",
	},
	block: {
		blockquote: ({ children }) => `<blockquote><p>${children}</p></blockquote>`,
	},
	unknownType: () => "",
	unknownMark: ({ children }) => children,
} satisfies PortableTextComponents;

interface RenderPortableTextParams {
	value: PortableTextContent | undefined;
	components?: PortableTextComponents;
}

export function renderPortableText({ value, components = PORTABLE_TEXT_COMPONENTS }: RenderPortableTextParams): string {
	return toHTML(value ?? [], { components, onMissingComponent: false });
}
