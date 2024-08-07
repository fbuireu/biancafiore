import type { BreadcrumbDTOItem, RawBreadcrumb } from "@application/dto/breadcrumb/types";
import { deSlugify } from "@modules/core/utils/deSlugify";
import type { BaseDTO } from "@shared/application/dto/baseDTO.ts";

export type BreadcrumbDTO = BreadcrumbDTOItem[];

export const breadcrumbDTO: BaseDTO<RawBreadcrumb, BreadcrumbDTO> = {
	render: ({ currentPath }): BreadcrumbDTO => {
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
