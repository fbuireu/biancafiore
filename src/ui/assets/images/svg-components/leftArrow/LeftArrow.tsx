import clsx from "clsx";
import type { SVGProps } from "react";

interface LeftArrowProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
}

export const LeftArrow = ({ fill = "currentColor", classNames, ...props }: LeftArrowProps) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" className={clsx(classNames)} {...props}>
			<title>Arrow</title>
			<g id="Left">
				<polygon
					points="24 12.001 2.914 12.001 8.208 6.706 7.501 5.999 1 12.501 7.5 19.001 8.207 18.294 2.914 13.001 24 13.001 24 12.001"
					style={{ fill }}
					stroke="#232326"
					strokeWidth="0.25"
				/>
			</g>
		</svg>
	);
};
