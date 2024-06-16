import type { SVGProps } from "react";
import clsx from "clsx";

interface PinProps extends SVGProps<SVGSVGElement> {
	classNames?: string;
	fill?: string;
}

export const Pin = ({ fill, classNames, ...props }: PinProps) => {
	return (
		<svg viewBox="-4 0 36 36" className={clsx(classNames)} {...props}>
			<title>Pin</title>
			<path
				fill={fill}
				d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"
			/>
			<circle fill="currentColor" cx="14" cy="14" r="7" />
		</svg>
	);
};
