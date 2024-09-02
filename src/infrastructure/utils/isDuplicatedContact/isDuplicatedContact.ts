import { Exception } from "@domain/errors";
import type { ContactFormData } from "@shared/ui/types";

interface IsDuplicatedContactParams {
	databaseRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
	data: Omit<ContactFormData, "recaptcha">;
}

export async function isDuplicatedContact({ databaseRef, data }: IsDuplicatedContactParams): Promise<void> {
	const querySnapshot = await databaseRef.where("email", "==", data.email).limit(1).get();

	if (!querySnapshot.empty) {
		throw new Exception({
			message: "You already contacted. Please be patient, I will get back to you ASAP.",
			code: "UNAUTHORIZED",
		});
	}
}
