import type { ContactFormData } from "@shared/ui/types";
import { createException } from "@domain/errors/utils";

interface IsDuplicatedContactParams {
    databaseRef: FirebaseFirestore.CollectionReference<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
    >;
    data: Omit<ContactFormData, "recaptcha">;
}

export async function isDuplicatedContact({
    databaseRef,
    data,
}: IsDuplicatedContactParams): Promise<void> {
    const querySnapshot = await databaseRef
        .where("email", "==", data.email)
        .limit(1)
        .get();

    if (!querySnapshot.empty) {
        throw createException({
            message:
                "Please be patient, we have already received your message.",
            code: "UNAUTHORIZED",
        });
    }
}
