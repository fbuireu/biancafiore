const WEB_PROTOCOLS = new Set(["http:", "https:"]);
const LINK_PROTOCOLS = new Set([...WEB_PROTOCOLS, "mailto:", "tel:"]);
const SITE_RELATIVE = /^\/(?!\/)|^#/;

interface HasProtocolInParams {
	url: string;
	protocols: ReadonlySet<string>;
}

const hasProtocolIn = ({ url, protocols }: HasProtocolInParams): boolean =>
	URL.canParse(url) && protocols.has(new URL(url).protocol);

export const isWebUrl = (url: string): boolean => hasProtocolIn({ url, protocols: WEB_PROTOCOLS });

export const isSafeHref = (url: string): boolean =>
	SITE_RELATIVE.test(url) || hasProtocolIn({ url, protocols: LINK_PROTOCOLS });

export const isSafeImageUrl = (url: string): boolean => /^\/(?!\/)/.test(url) || isWebUrl(url);
