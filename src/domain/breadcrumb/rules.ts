import { deSlugify } from "@shared/utils/strings";
import type { BreadcrumbDTOItem } from "./types";

export function createBreadcrumbs(currentPath: string): BreadcrumbDTOItem[] {
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
}
