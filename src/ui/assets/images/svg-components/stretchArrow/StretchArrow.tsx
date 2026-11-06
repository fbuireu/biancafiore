import type { SVGProps } from "react";
import stretchArrow from "../../svg/stretch-arrow.svg?raw";

const STRETCH_ARROW_PATH = /<path class="([^"]+)" d="([^"]+)"/g;

const PATHS = [...stretchArrow.matchAll(STRETCH_ARROW_PATH)].map(([, className, data]) => ({ className, data }));

interface StretchArrowProps extends SVGProps<SVGSVGElement> {
	title: string;
}

export const StretchArrow = ({ title, ...props }: StretchArrowProps) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="stretch-arrow" {...props}>
			<title>{title}</title>
			{PATHS.map(({ className, data }) => (
				<path key={className} className={className} d={data} />
			))}
		</svg>
	);
};
