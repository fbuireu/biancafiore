// @ts-ignore
import { ActionError, defineAction } from "astro:actions";
import { contactFormSchema } from "@application/entities/contact/schema";
import { app } from "@infrastructure/database/server";
import type { ContactFormData } from "@shared/ui/types";
import { getFirestore } from "firebase-admin/firestore";
import { sendEmail } from "@infrastructure/utils/sendEmail";
import { Exception } from "@domain/errors";
import { validateContact } from "@infrastructure/utils/validateContact";
import { isDuplicatedContact } from "@infrastructure/utils/isDuplicatedContact";
import { saveContact } from "@infrastructure/utils/saveContact";

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
                await isDuplicatedContact({ databaseRef, data });

                const { data: emailData } = await sendEmail(data);

                await saveContact({
                    contactData: { id: emailData?.id!, ...data },
                    databaseRef,
                });

                return { ok: !!emailData };
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
