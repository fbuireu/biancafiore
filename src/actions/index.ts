// @ts-ignore
import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { DEFAULT_LOCALE_STRING } from "@const/index";
import { app } from "@infrastructure/database/server";
import type { ContactFormData } from "@shared/ui/types";
import { getFirestore } from "firebase-admin/firestore";
import { sendEmail } from "@infrastructure/utils/sendEmail";
import { getContactData } from "@infrastructure/utils/getContactData";
import { Exception } from "@domain/errors";

type ActionHandlerParams = Omit<ContactFormData, "recaptcha">;

const database = getFirestore(app);

// todo: isolate
const createException = (message: string, code: string) =>
    new Exception({ message, code });

const handleValidation = (data: ActionHandlerParams) => {
    const result = contactFormSchema.safeParse(data);
    if (!result.success) {
        throw createException(
            result.error?.errors.join(", ") || "Invalid data",
            "BAD_REQUEST"
        );
    }
    return result.data;
};

const processContact = async (data: ActionHandlerParams) => {
    const databaseRef = database.collection("contacts");
    const existingContact = await getContactData({ databaseRef, data });

    if (!existingContact.empty) {
        throw createException(
            "Please be patient, we have already received your message.",
            "UNAUTHORIZED"
        );
    }

    const { data: emailData, error: emailError } = await sendEmail(data);

    if (emailError) {
        throw createException(
            `Something went wrong sending the email. Error: ${emailError.message} (${emailError.name})`,
            "EMAIL_ERROR"
        );
    }

    await databaseRef.add({
        id: emailData?.id,
        name: data.name,
        email: data.email,
        message: data.message,
        date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
    });

    return { ok: !!emailData && !emailError };
};

// todo: isolate

export const server = {
    contact: defineAction({
        accept: "form",
        input: contactFormSchema,
        handler: async ({ name, email, message }: ActionHandlerParams) => {
            try {
                const validatedData = handleValidation({
                    name,
                    email,
                    message,
                });
                return await processContact(validatedData);
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
        },
    }),
};
