import clsx from "clsx";
import type { SVGProps } from "react";

interface ZoomInProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
	title?: string;
}

export const ZoomIn = ({ fill = "currentColor", title = "Zoom In", classNames, ...props }: ZoomInProps) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" id="zoom-in" viewBox="0 0 20 20" className={clsx(classNames)} {...props}>
			<title>{title}</title>
			<g
				fill="none"
				fillRule="evenodd"
				stroke="#232326"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				transform="translate(1 1)"
			>
				<circle cx="8" cy="8" r="8" stroke={fill} />
				<path d="m18 18-4.35-4.35M8 5v6M5 8h6" stroke={fill} />
			</g>
		</svg>
	);
};
