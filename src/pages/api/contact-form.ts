import { z } from "zod";
import type { APIRoute } from "astro";
import { DEFAULT_LOCALE_STRING } from "../../consts.ts";
import { app } from "../../server/firebase/server.ts";
import { getFirestore } from "firebase-admin/firestore";
import { sendEmail } from "../../server/email/server.ts";

interface CustomError {
	message: string;
	status?: number;
}

const contactFormSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	message: z.string(),
	date: z.union([z.date(), z.string()]),
});

const createContactSchema = contactFormSchema.omit({ id: true, date: true });

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();

		const contactValidation = createContactSchema.safeParse({
			name: formData.get("name"),
			email: formData.get("email"),
			message: formData.get("message"),
		});

		if (!contactValidation.success)
			throw new Error(
				contactValidation.error?.errors.join(", ") || "Invalid data",
			);

		const { data } = contactValidation;
		const database = getFirestore(app);
		const contactsRef = database.collection("contacts");

		await contactsRef.add({
			id: crypto.randomUUID(),
			name: data.name,
			email: data.email,
			message: data.message,
			date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
		});

		const { data: emailData, error: emailError } = await sendEmail(data);

		if (emailError && !emailData) {
			throw new Error(
				`Something went wrong sending the email. Error: ${emailError.message} (${emailError.name})`,
			);
		}

		return new Response(null, { status: 200 });
	} catch (error: unknown) {
		const typedError = error as CustomError;

		const message = typedError.message || "Something went wrong";
		const status = typedError.status || 500;

		return new Response(message, {
			status,
		});
	}
};
