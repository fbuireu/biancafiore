import type { CmsEntry } from "@infrastructure/cms/entries";
import type { RawImage } from "../shared/images";
import type { PortableTextContent } from "../shared/portableText";

export interface ProjectFields {
	name: string;
	description: PortableTextContent;
	image: RawImage;
}

export type RawProject = CmsEntry<ProjectFields>;
