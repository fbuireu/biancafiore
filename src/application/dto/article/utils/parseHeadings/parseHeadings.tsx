import type { Block, Text, TopLevelBlock } from "@contentful/rich-text-types";
import { BLOCKS } from "@contentful/rich-text-types";
import { slugify } from "@modules/core/utils/slugify";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

type HeadingBlock = Block & { content: Text[] };

interface CreateSectionParams {
	level: number;
	index: number;
	id: string;
	text: string;
	content: string;
}

interface ExtractContentFromNextNodesParams {
	nextNodes: TopLevelBlock[];
	level: number;
}

const extractContentFromNextNodes = ({ nextNodes, level }: ExtractContentFromNextNodesParams): string => {
	if (!Array.isArray(nextNodes)) {
		return "";
	}

	return nextNodes
		.map((nextNode) => {
			if (nextNode.nodeType !== BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS]) {
				return nextNode.content.map((child) => ("value" in child ? child.value : "")).join("");
			}
			return "";
		})
		.join("");
};

const createSection = ({ level, id, text, content, index }: CreateSectionParams) => {
	return `
    <section style="--is: --section-${index}">
      <h${level} id="${id}" class="article__heading flex flex-start align-baseline">
        <a href="#${id}">${text}</a>
      </h${level}>
      <p>${content}</p>
    </section>
  `;
};

export function parseHeadings() {
	return Object.fromEntries(
		HEADING_LEVELS.map((level, index) => [
			BLOCKS[`HEADING_${level}` as keyof typeof BLOCKS],
			(node: HeadingBlock, nextNodes: TopLevelBlock[]) => {
				const text = node.content.map((child: Text) => child.value).join("");
				const id = slugify(text);
				const content = extractContentFromNextNodes({ nextNodes, level });

				return createSection({ level, index, id, text, content });
			},
		]),
	);
}
