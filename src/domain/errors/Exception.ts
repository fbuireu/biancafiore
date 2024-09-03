import type { ActionErrorCode } from "astro/dist/actions/runtime/virtual/shared";

interface ExceptionParams {
	message: string;
	code?: ActionErrorCode;
}

export class Exception extends Error {
	code: ActionErrorCode;

	constructor({ message, code = "INTERNAL_SERVER_ERROR" }: ExceptionParams) {
		super(message);
		this.name = "Exception";
		this.code = code;
	}
}
