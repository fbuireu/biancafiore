import type { Except } from "@const/types.ts";
import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types.ts";

interface IsDuplicatedContactParams {
	databaseRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
	data: Except<ContactFormData, "recaptcha">;
}

const ALIAS_REGEX = /(\+.*?)(?=@)/;

export async function checkDuplicatedEntries({ databaseRef, data }: IsDuplicatedContactParams): Promise<void> {
	const { empty } = await databaseRef.where("email", "==", data.email.replace(ALIAS_REGEX, "")).limit(1).get();

	if (!empty) {
		throw new Exception({
			message: "You already contacted. Please be patient, I will get back to you ASAP.",
			code: "UNAUTHORIZED",
		});
	}
}
