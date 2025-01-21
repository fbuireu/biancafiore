import { Contact, db } from "astro:db";
import { DEFAULT_LOCALE_STRING } from "@const/const";
import type { Except } from "@const/types";
import type { ContactFormData } from "@shared/ui/types";

type SaveContactParams = Except<ContactFormData, "recaptcha">;

export async function saveContact(contactData: SaveContactParams): Promise<void> {
	await db.insert(Contact).values({
		...contactData,
		id: crypto.randomUUID(),
		date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
	});
}
