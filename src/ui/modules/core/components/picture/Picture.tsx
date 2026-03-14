import { Image } from "@modules/core/components/image";
import type { ImgHTMLAttributes } from "react";

interface CustomPictureProps {
	classNames?: string;
}

type PictureProps = ImgHTMLAttributes<HTMLPictureElement> & CustomPictureProps;

export const Picture = ({ src, classNames, ...props }: PictureProps) => (
	<picture className={classNames}>
		<Image src={src} {...props} />
	</picture>
);
