// @ts-ignore
import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { DEFAULT_LOCALE_STRING } from "@const/index";
import { app } from "@infrastructure/database/server";
import type { ContactFormData } from "@shared/ui/types";
import { getFirestore } from "firebase-admin/firestore";
import { sendEmail } from "@infrastructure/utils/sendEmail";
import { Exception } from "@domain/errors";
import { createException } from "@domain/errors/utils";
import { validateContact } from "@infrastructure/utils/validateContact";
import { isDuplicatedContact } from "@infrastructure/utils/isDuplicatedContact";

type ActionHandlerParams = Omit<ContactFormData, "recaptcha">;

const database = getFirestore(app);

export const server = {
    contact: defineAction({
        accept: "form",
        input: contactFormSchema,
        handler: async ({ name, email, message }: ActionHandlerParams) => {
            try {
                const data = validateContact({
                    name,
                    email,
                    message,
                });
                const databaseRef = database.collection("contacts");
                const querySnapshot = await isDuplicatedContact({
                    databaseRef,
                    data,
                });

                if (!querySnapshot.empty) {
                    throw createException({
                        message:
                            "Please be patient, we have already received your message.",
                        code: "UNAUTHORIZED",
                    });
                }

                const { data: emailData, error: emailError } = await sendEmail(
                    data
                );

                if (emailError) {
                    throw createException({
                        message: `Something went wrong sending the email. Error: ${emailError.message} (${emailError.name})`,
                    });
                }

                await databaseRef.add({
                    id: emailData?.id,
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    date: new Date().toLocaleString(DEFAULT_LOCALE_STRING),
                });

                return { ok: !!emailData && !emailError };
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
