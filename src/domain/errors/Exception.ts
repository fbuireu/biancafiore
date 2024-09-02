interface ExceptionParams {
	message: string;
	code?: string;
}

export class Exception extends Error {
	code: string;

	constructor({ message, code = "INTERNAL_SERVER_ERROR" }: ExceptionParams) {
		super(message);
		this.name = "Exception";
		this.code = code;
	}
}
