import type { ContactFormData } from "@shared/ui/types";

interface GetContactDataParams {
    databaseRef: FirebaseFirestore.CollectionReference<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
    >;
    data: Omit<ContactFormData, "recaptcha">;
}

export async function getContactData({
    databaseRef,
    data,
}: GetContactDataParams): Promise<
    FirebaseFirestore.QuerySnapshot<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
    >
> {
    return await databaseRef.where("email", "==", data.email).limit(1).get();
}
