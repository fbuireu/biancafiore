import { Data } from "effect";

export class CmsError extends Data.TaggedError("CmsError")<{
	message: string;
	cause?: unknown;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	message: string;
	cause?: unknown;
}> {}

export class EmailError extends Data.TaggedError("EmailError")<{
	message: string;
	cause?: unknown;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
	message: string;
}> {}

export class DuplicateContactError extends Data.TaggedError("DuplicateContactError")<{
	message: string;
}> {}
