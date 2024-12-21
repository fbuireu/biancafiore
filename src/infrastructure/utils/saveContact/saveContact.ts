import { Contact, db } from "astro:db";
import { DEFAULT_LOCALE_STRING } from "@const/const.ts";
import type { Except } from "@const/types.ts";
import type { ContactFormData } from "@shared/ui/types";
import type { CreateEmailResponseSuccess } from "resend";

type SaveContactParams = Except<ContactFormData, "recaptcha"> & CreateEmailResponseSuccess;

export async function saveContact(contactData: SaveContactParams): Promise<void> {
	await db.insert(Contact).values({
		...contactData,
		date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
	});
}
