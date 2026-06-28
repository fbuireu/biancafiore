import { DEFAULT_LOCALE_STRING } from "@const/const";
import type { Except } from "@const/types";
import { Database } from "@infrastructure/db/client";
import { Contact } from "@infrastructure/db/schema";
import type { DatabaseError } from "@infrastructure/errors";
import type { ContactFormData } from "@shared/ui/types";
import { Effect } from "effect";

interface SaveContactParams extends Except<ContactFormData, "recaptcha"> {
	emailId: string;
}

export const saveContact = (contactData: SaveContactParams): Effect.Effect<void, DatabaseError, Database> =>
	Effect.gen(function* () {
		const { db, run } = yield* Database;
		yield* run(
			db.insert(Contact).values({
				...contactData,
				id: crypto.randomUUID(),
				createdDate: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
				modifiedDate: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
			}),
		);
	});
