import type { BreadcrumbDTOItem, RawBreadcrumb } from "@domain/breadcrumb/types";
import type { BaseDTO } from "@domain/shared/baseDTO";
import { deSlugify } from "@shared/utils/strings";

export type BreadcrumbDTO = BreadcrumbDTOItem[];

export const breadcrumbDTO: BaseDTO<RawBreadcrumb, BreadcrumbDTO> = {
	create: ({ currentPath }) => {
		const pathSegments = currentPath.split("/").filter((segment) => segment.trim() !== "");
		const breadcrumbs: BreadcrumbDTOItem[] = pathSegments.map((_, index) => {
			const link = `/${pathSegments.slice(0, index + 1).join("/")}`;
			const label = deSlugify(pathSegments[index] ?? "");

			return { label, link };
		});

		if (currentPath !== "/") {
			breadcrumbs.unshift({ label: "Home", link: "/" });
		}

		return breadcrumbs;
	},
};
