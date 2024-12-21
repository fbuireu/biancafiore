import { Contact, db, eq } from "astro:db";
import type { Except } from "@const/types.ts";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types.ts";

type IsDuplicatedContactParams = Except<ContactFormData, "recaptcha">;

const ALIAS_REGEX = /(\+.*?)(?=@)/;

export async function checkDuplicatedEntries(data: IsDuplicatedContactParams): Promise<void> {
	const references = await db
		.select()
		.from(Contact)
		.where(eq(Contact.email, data.email.replace(ALIAS_REGEX, "")))
		.limit(1);

	if (references.length) {
		throw new Exception({
			message: "You already contacted. Please be patient, I will get back to you ASAP.",
			code: "UNAUTHORIZED",
		});
	}
}
