import { Image } from "@modules/core/components/image";
import type { ImageFormats } from "@shared/application/types";
import type { ImgHTMLAttributes } from "react";

interface CustomPictureProps {
	classNames?: string;
	formats: ImageFormats;
}

type PictureProps = ImgHTMLAttributes<HTMLPictureElement> & CustomPictureProps;

export const Picture = ({ formats, src, classNames, ...props }: PictureProps) => {
	return (
		<picture className={classNames}>
			{formats.avif && <source srcSet={src} type="image/avif" />}
			{formats.webp && <source srcSet={src} type="image/webp" />}
			<Image src={src} {...props} />
		</picture>
	);
};
