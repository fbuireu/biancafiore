import type { MenuName } from "@domain/menu";
import type { CmsMenuItem } from "@infrastructure/cms/entries";

export interface RawMenu {
	name: MenuName;
	items?: CmsMenuItem[];
}
