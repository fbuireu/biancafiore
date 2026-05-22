import { ActionError } from "astro:actions";
import { Contact, db, eq } from "astro:db";
import type { Except } from "@const/types";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";

type CheckDuplicatedEntriesParams = Except<ContactFormData, "recaptcha" | "emailId">;

const ALIAS_REGEX = /(\+.*?)(?=@)/;

export async function checkDuplicatedEntries(data: CheckDuplicatedEntriesParams): Promise<void> {
	try {
		const duplicates = await db
			.select()
			.from(Contact)
			.where(eq(Contact.email, data.email.replace(ALIAS_REGEX, "")))
			.limit(1);

		if (duplicates.length) {
			throw new Exception({
				message: "You already contacted. Please be patient, I will get back to you ASAP.",
				code: "UNAUTHORIZED",
			});
		}
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
