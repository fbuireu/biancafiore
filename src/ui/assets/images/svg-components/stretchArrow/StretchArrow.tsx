import clsx from "clsx";
import type { SVGProps } from "react";

interface StretchArrowProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
	title?: string;
}

export const StretchArrow = ({ title = "Arrow", classNames, ...props }: StretchArrowProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={clsx("stretch-arrow", classNames)}
			{...props}
		>
			<title>{title}</title>
			<path className="stretch-arrow__shaft" d="M 5,12 h 14" />
			<path className="stretch-arrow__tip" d="M 12,5 l 7,7 l -7,7" />
		</svg>
	);
};
