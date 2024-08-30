export interface ContactFormData {
	name: string;
	email: string;
	message: string;
	recaptcha: string;
}

export enum FormStatus {
	INITIAL = "initial",
	LOADING = "loading",
	SUCCESS = "success",
	ERROR = "error",
}
