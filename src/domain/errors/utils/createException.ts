import { Exception } from "@domain/errors";

interface CreateExceptionParams {
    message: string;
    code?: string;
}

export function createException({
    message,
    code = "INTERNAL_SERVER_ERROR",
}: CreateExceptionParams) {
    return new Exception({ message, code });
}
