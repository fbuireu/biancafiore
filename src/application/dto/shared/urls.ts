import { type WebUrl, webUrlSchema } from "@domain/shared/url";

const MAIL_AND_PHONE_PROTOCOLS = new Set(["mailto:", "tel:"]);
const SITE_RELATIVE = /^\/(?!\/)|^#/;

const isMailOrPhone = (url: string): boolean =>
	URL.canParse(url) && MAIL_AND_PHONE_PROTOCOLS.has(new URL(url).protocol);

export const isWebUrl = (url: string): url is WebUrl => webUrlSchema.validate(url);

export const isSafeHref = (url: string): boolean => SITE_RELATIVE.test(url) || isWebUrl(url) || isMailOrPhone(url);

export const isSafeImageUrl = (url: string): boolean => /^\/(?!\/)/.test(url) || isWebUrl(url);
