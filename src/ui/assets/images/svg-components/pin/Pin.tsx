import clsx from "clsx";
import type { SVGProps } from "react";

interface PinProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
	fill?: string;
	title?: string;
}

export const Pin = ({ fill, title = "Pin", classNames, ...props }: PinProps) => {
	return (
		<svg viewBox="-4 0 36 36" role="img" className={clsx(classNames)} {...props}>
			<title>{title}</title>
			<path
				fill={fill}
				d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"
			/>
			<circle fill="currentColor" cx="14" cy="14" r="7" />
		</svg>
	);
};
