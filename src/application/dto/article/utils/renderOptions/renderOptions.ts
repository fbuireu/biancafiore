import { escapeHtml } from "@const/utils/escapeHtml";
import { slugify } from "@modules/core/utils/slugify";
import { type PortableTextHtmlComponents, toHTML } from "@portabletext/to-html";
import type { ArbitraryTypedObject, PortableTextBlock } from "@portabletext/types";
import { getOptimizedImageUrl, getOptimizedSrcset } from "@shared/utils/imageOptimization";

type RenderableBlock = PortableTextBlock | ArbitraryTypedObject;

const HEADING_STYLES = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function toProtocolRelative(url: string): string {
	return url.replace(/^https?:/, "");
}

function toEmbedUrl(url: string): string {
	try {
		const parsed = new URL(url);
		if (parsed.hostname === "youtu.be") {
			return `https://www.youtube.com/embed${parsed.pathname}`;
		}
		if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
			return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
		}
	} catch {}
	return url;
}

function isExternal(url: string): boolean {
	try {
		return new URL(url).hostname !== "biancafiore.me";
	} catch {
		return false;
	}
}

interface PortableImageValue {
	url?: string;
	width?: number;
	height?: number;
	alt?: string;
	caption?: string;
	fullBleed?: boolean;
}

function renderImage(value: PortableImageValue): string {
	if (!value?.url) return "";

	const src = toProtocolRelative(value.url);
	const displayWidth = value.width ?? 768;
	const optimizedSrc = getOptimizedImageUrl(src, { width: displayWidth, format: "webp", quality: 85 });
	const srcset = getOptimizedSrcset(src, [400, 768, 1024], { format: "webp", quality: 85 });
	const alt = escapeHtml(String(value.alt ?? ""));
	const wrapperClass = value.fullBleed ? "full-bleed" : "";

	return `
		<figure${wrapperClass ? ` class="${wrapperClass}"` : ""}>
			<img
				src="${optimizedSrc}"
				srcset="${srcset}"
				sizes="auto"
				height="${value.height ?? ""}"
				width="${value.width ?? ""}"
				alt="${alt}"
				loading="lazy"
				decoding="async"
			/>
			${value.caption ? `<figcaption>${escapeHtml(String(value.caption))}</figcaption>` : ""}
		</figure>
	`;
}

/**
 * Builds the `@portabletext/to-html` serializer set that mirrors the markup the
 * Contentful Rich Text renderer used to produce.
 *
 * @param withSections when true, headings are wrapped in the `<section>` markup
 * the article CSS relies on (scroll scopes). The plain variant (false) emits
 * bare `<h2>…</h2>` so the table-of-contents regex can pick headings up.
 */
function getComponents(withSections: boolean): Partial<PortableTextHtmlComponents> {
	return {
		types: {
			code: ({ value }) => `<pre><code>${escapeHtml(String(value?.code ?? ""))}</code></pre>`,
			codeBlock: ({ value }) => `<pre><code>${escapeHtml(String(value?.code ?? ""))}</code></pre>`,
			image: ({ value }) => renderImage(value as PortableImageValue),
			videoEmbed: ({ value }) =>
				value?.url
					? `<iframe src="${toEmbedUrl(String(value.url))}" width="100%" title="${escapeHtml(String(value.title ?? ""))}" allowfullscreen loading="lazy"></iframe>`
					: "",
			iframeEmbed: ({ value }) =>
				value?.url
					? `<iframe src="${String(value.url)}" width="100%" title="${escapeHtml(String(value.title ?? ""))}" allowfullscreen loading="lazy"></iframe>`
					: "",
		},
		marks: {
			link: ({ value, children }) => {
				const href = String(value?.href ?? "");
				if (isExternal(href)) {
					return `<a href="${href}" target="_blank" rel="noopener noreferrer">${children}<span aria-hidden="true" class="external-link-icon"> ↗</span></a>`;
				}
				return `<a href="${href}">${children}</a>`;
			},
			internalLink: ({ value, children }) => {
				const slug = value?.slug ?? value?.reference?.slug;
				return slug ? `<a href="/articles/${slug}">${children}</a>` : `${children}`;
			},
		},
		block: {
			normal: ({ children }) => `<p>${children}</p>`,
			blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
			...Object.fromEntries(
				HEADING_STYLES.map((style, index) => [
					style,
					({ children, value }: { children: string; value: PortableTextBlock }) => {
						const level = index + 1;
						const text = (value.children ?? [])
							.map((child) => ("text" in child ? (child as { text: string }).text : ""))
							.join("");
						const id = slugify(text);

						if (!withSections) return `<h${level} id="${id}">${children}</h${level}>`;

						return `
							<section style="--is: --section-${index}">
								<h${level} id="${id}" class="article__heading flex flex-start align-baseline">
									<a href="#${id}">${children}</a>
								</h${level}>
							</section>
						`;
					},
				]),
			),
		},
	};
}

const articleComponents = getComponents(true);
const plainComponents = getComponents(false);

export function renderArticleContent(blocks: RenderableBlock[] | undefined): string {
	return toHTML((blocks ?? []) as PortableTextBlock[], { components: articleComponents });
}

export function renderPlainContent(blocks: RenderableBlock[] | undefined): string {
	return toHTML((blocks ?? []) as PortableTextBlock[], { components: plainComponents });
}

export function portableTextToPlainText(blocks: RenderableBlock[] | undefined): string {
	return (blocks ?? [])
		.filter((block): block is PortableTextBlock => (block as PortableTextBlock)._type === "block")
		.map((block) =>
			(block.children ?? []).map((child) => ("text" in child ? (child as { text: string }).text : "")).join(""),
		)
		.join(" ");
}
