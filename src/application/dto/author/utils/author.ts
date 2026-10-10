import type { Except } from "@const/types";
import type { AuthorDTO } from "@domain/author";
import type { AnyRawArticle } from "../../article/types";
import { createImage } from "../../shared/images";
import type { RawAuthor } from "../types";

interface BylineAuthorParams {
	rawArticle: AnyRawArticle;
	rawAuthors: RawAuthor[];
}

interface CreditsParams {
	rawAuthor: RawAuthor;
	rawArticle: AnyRawArticle;
}

interface RawAuthorIdentity {
	id?: string;
	slug: string | null;
	data: { name: string };
}

const entryOf = ({ id }: Pick<RawAuthorIdentity, "id">): string => (id ? ` (id ${id})` : "");

export const credits = ({ rawAuthor, rawArticle }: CreditsParams): boolean =>
	rawAuthor.references.articles.some(({ id }) => id === rawArticle.id);

export function bylineAuthor({ rawArticle, rawAuthors }: BylineAuthorParams): RawAuthor {
	const author = rawAuthors.find((rawAuthor) => credits({ rawAuthor, rawArticle }));

	if (!author) {
		throw new Error(
			`An Article (${rawArticle.slug ?? rawArticle.id}) is credited to no published author, so no byline can name it`,
		);
	}

	return author;
}

export function authorIdentity(author: RawAuthorIdentity): Pick<AuthorDTO, "name" | "slug"> {
	const name = author.data.name.trim();
	const slug = (author.slug ?? "").trim();

	if (!slug) {
		throw new Error(`The Author "${name}"${entryOf(author)} has no slug, so no page can address them`);
	}

	if (!name) {
		throw new Error(
			`The Author "${slug}"${entryOf(author)} has an empty name, so the Tag Index cannot file their Author Tag under a letter`,
		);
	}

	return { name, slug };
}

export function createAuthor(rawAuthor: RawAuthor): Except<AuthorDTO, "latestArticle"> {
	const { data } = rawAuthor;

	return {
		...authorIdentity(rawAuthor),
		description: data.description,
		jobTitle: data.job_title,
		currentCompany: data.current_company,
		profileImage: createImage(data.profile_image),
		socialNetworks: (data.social_networks ?? []).map(({ url }) => url),
	};
}
