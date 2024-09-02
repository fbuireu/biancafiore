import { DEFAULT_LOCALE_STRING } from "@const/index";
import type { ContactFormData } from "@shared/ui/types";

interface SaveContactParams {
	contactData: Omit<ContactFormData, "recaptcha"> & { id: string };
	databaseRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
}

export async function saveContact({ databaseRef, contactData }: SaveContactParams): Promise<void> {
	await databaseRef.add({
		id: contactData.id,
		name: contactData.name,
		email: contactData.email,
		message: contactData.message,
		date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
	});
}
