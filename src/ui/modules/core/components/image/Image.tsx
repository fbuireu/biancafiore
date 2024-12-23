import type { ImgHTMLAttributes, JSX } from "react";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	classNames?: string;
}

export const Image = ({ src, alt, decoding = "async", loading = "lazy", classNames }: ImageProps): JSX.Element => (
	<img src={src} alt={alt} className={classNames} decoding={decoding} loading={loading} />
);
