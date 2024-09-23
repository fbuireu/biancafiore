import { Link as LinkIcon } from "@assets/images/svg-components/link";
import { BLOCKS } from "@contentful/rich-text-types";
import type { Block, Text } from "@contentful/rich-text-types";
import { slugify } from "@modules/core/utils/slugify";
import ReactDOMServer from "react-dom/server";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

type HeadingBlock = Block & { content: Text[] };

export function parseHeadings() {
	return Object.fromEntries(
		HEADING_LEVELS.map((level) => [
			BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS],
			(node: HeadingBlock) => {
				const text = node.content.map((child: Text) => child.value).join("");
				const linkIcon = ReactDOMServer.renderToStaticMarkup(<LinkIcon />);
				const id = slugify(text);

				return `
					<h${level} id="${id}"class="article__heading flex flex-start align-baseline">
						<a href="#${id}" onclick="window.location.hash='${id}'">
							${text}
						</a>
						${linkIcon}
					</h${level}>
				`;
			},
		]),
	);
}
