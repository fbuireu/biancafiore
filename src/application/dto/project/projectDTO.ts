import type { ProjectDTO } from "@domain/project";
import { slugify } from "@shared/utils/strings";
import { createImage } from "../shared/images";
import { renderPortableText } from "../shared/portableText";
import type { RawProject } from "./types";

export function createProjects(raw: RawProject[]): ProjectDTO[] {
	return raw.map(
		({ slug, data }): ProjectDTO => ({
			id: slug?.trim() || slugify(data.name),
			name: data.name,
			description: renderPortableText({ value: data.description }),
			image: createImage(data.image),
		}),
	);
}
