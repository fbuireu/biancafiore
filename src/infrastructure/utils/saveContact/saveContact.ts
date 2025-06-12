// @ts-ignore:next-line
import { ActionError } from "astro:actions";
import { Contact, db } from "astro:db";
import { DEFAULT_LOCALE_STRING } from "@const/const";
import type { Except } from "@const/types";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";

interface SaveContactParams extends Except<ContactFormData, "recaptcha"> {
	emailId: string;
}

export async function saveContact(contactData: SaveContactParams): Promise<void> {
	try {
		await db.insert(Contact).values({
			...contactData,
			date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
		});
	} catch (error: unknown) {
		if (error instanceof Exception) {
			throw new ActionError({
				code: error.code,
				message: error.message,
			});
		}

		throw new ActionError({
			code: "INTERNAL_SERVER_ERROR",
			message:
				"Whoopsie! Something went wrong. It's my fault (or actually my boyfriend's). Please try again in a few minutes after refreshing the page.",
		});
	}
}
