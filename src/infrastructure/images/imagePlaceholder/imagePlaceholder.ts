import { decode, isBlurhashValid } from "blurhash";

export const PLACEHOLDER_WIDTH = 12;
export const MAX_PLACEHOLDER_HEIGHT = 24;

const BMP_HEADER_BYTES = 54;
const DIB_HEADER_BYTES = 40;
const BITS_PER_PIXEL = 24;
const BYTES_PER_PIXEL = 3;
const RGBA_CHANNELS = 4;
const ROW_ALIGNMENT = 4;

interface ImagePlaceholderParams {
	blurhash?: string | null;
	width: number;
	height: number;
}

interface BitmapParams {
	pixels: Uint8ClampedArray;
	width: number;
	height: number;
}

function bitmap({ pixels, width, height }: BitmapParams): Uint8Array {
	const rowBytes = Math.ceil((width * BYTES_PER_PIXEL) / ROW_ALIGNMENT) * ROW_ALIGNMENT;
	const bytes = new Uint8Array(BMP_HEADER_BYTES + rowBytes * height);
	const view = new DataView(bytes.buffer);

	bytes.set([0x42, 0x4d]);
	view.setUint32(2, bytes.length, true);
	view.setUint32(10, BMP_HEADER_BYTES, true);
	view.setUint32(14, DIB_HEADER_BYTES, true);
	view.setInt32(18, width, true);
	view.setInt32(22, height, true);
	view.setUint16(26, 1, true);
	view.setUint16(28, BITS_PER_PIXEL, true);
	view.setUint32(34, rowBytes * height, true);

	for (let y = 0; y < height; y++) {
		const row = BMP_HEADER_BYTES + (height - 1 - y) * rowBytes;

		for (let x = 0; x < width; x++) {
			const pixel = (y * width + x) * RGBA_CHANNELS;
			const offset = row + x * BYTES_PER_PIXEL;

			bytes[offset] = pixels[pixel + 2] ?? 0;
			bytes[offset + 1] = pixels[pixel + 1] ?? 0;
			bytes[offset + 2] = pixels[pixel] ?? 0;
		}
	}

	return bytes;
}

export function imagePlaceholder({ blurhash, width, height }: ImagePlaceholderParams): string | undefined {
	if (!blurhash || !isBlurhashValid(blurhash).result || width <= 0 || height <= 0) return undefined;

	const placeholderHeight = Math.min(
		MAX_PLACEHOLDER_HEIGHT,
		Math.max(1, Math.round((PLACEHOLDER_WIDTH * height) / width)),
	);
	const pixels = decode(blurhash, PLACEHOLDER_WIDTH, placeholderHeight);

	return `data:image/bmp;base64,${Buffer.from(bitmap({ pixels, width: PLACEHOLDER_WIDTH, height: placeholderHeight })).toString("base64")}`;
}
