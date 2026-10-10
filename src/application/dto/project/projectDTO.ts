import type { ProjectDTO } from "@domain/project";
import { slugify } from "@shared/utils/strings";
import { createImage } from "../shared/images";
import { prepareProse } from "../shared/portableText";
import type { RawProject } from "./types";

export function createProjects(raw: RawProject[]): ProjectDTO[] {
	return raw.map(
		({ slug, data }): ProjectDTO => ({
			id: slug?.trim() || slugify(data.name),
			name: data.name,
			description: prepareProse(data.description),
			image: createImage(data.image),
		}),
	);
}
