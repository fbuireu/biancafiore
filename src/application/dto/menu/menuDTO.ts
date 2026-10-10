import type { MenuDTO, MenuItemDTO } from "@domain/menu";
import { isSafeHref } from "../shared/urls";
import { DEFAULT_MENU_ITEMS } from "./defaults";
import type { RawMenu } from "./types";

const LINKED_LABEL = /^(?<before>[^[\]]*)\[(?<label>[^[\]]+)\](?<after>[^[\]]*)$/;
const NEW_TAB = "_blank";

const textOf = (value: string | undefined): string | undefined => value?.trim() || undefined;

function createMenuItem({ label, url, target }: NonNullable<RawMenu["items"]>[number]): MenuItemDTO[] {
	const href = url.trim();

	if (!isSafeHref(href)) return [];

	const linked = LINKED_LABEL.exec(label.trim())?.groups;

	return [
		{
			label: textOf(linked?.label) ?? label.trim(),
			href,
			before: textOf(linked?.before),
			after: textOf(linked?.after),
			opensInNewTab: target === NEW_TAB,
		},
	];
}

export function createMenu({ name, items }: RawMenu): MenuDTO {
	return { name, items: items ? items.flatMap(createMenuItem) : DEFAULT_MENU_ITEMS[name].map((item) => ({ ...item })) };
}
