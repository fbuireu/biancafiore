import type { AuthorDTO, RawAuthor } from "@application/dto/author/types";
import type { Except } from "@const/types";
import { createImage } from "@shared/application/dto/utils/createImage";
import type { EmDashEntry } from "@shared/application/types";

type GetAuthorReturn = Except<AuthorDTO, "articles" | "latestArticle">;

export function getAuthor(author: EmDashEntry<RawAuthor> | undefined): GetAuthorReturn {
	const data = author?.data;

	return {
		name: data?.name ?? "",
		slug: data?.slug ?? "",
		description: data?.description ?? "",
		jobTitle: data?.jobTitle ?? "",
		currentCompany: data?.currentCompany ?? "",
		profileImage: createImage(data?.profileImage),
		socialNetworks: data?.socialNetworks ?? [],
	};
}
