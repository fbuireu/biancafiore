import type { ImgHTMLAttributes } from "react";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	classNames?: string;
}

export const Image = ({ src, alt, decoding = "async", loading = "lazy", classNames }: ImageProps) => (
	<img src={src} alt={alt} className={classNames} decoding={decoding} loading={loading} />
);
