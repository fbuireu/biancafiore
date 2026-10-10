import { MENU_NAME, type MenuDTO, type MenuName, menuSchema } from "@domain/menu";
import { fetchMenu } from "@infrastructure/cms/entries";
import { createMenu } from "../../dto/menu";
import { contentLoader } from "../collection";

const MENU_NAMES = Object.values(MENU_NAME);

const isMenuName = (name: string): name is MenuName => MENU_NAMES.some((menuName) => menuName === name);

const loadMenu = async (name: MenuName): Promise<MenuDTO> => createMenu({ name, items: await fetchMenu(name) });

export const menus = {
	loader: contentLoader<MenuDTO>({
		name: "menus",
		load: async () => Promise.all(MENU_NAMES.map(loadMenu)),
		identify: (menu) => menu.name,
		loadOne: async (name) => (isMenuName(name) ? loadMenu(name) : undefined),
		loadPrerendered: (name) => (isMenuName(name) ? createMenu({ name }) : undefined),
	}),
	schema: menuSchema,
};
