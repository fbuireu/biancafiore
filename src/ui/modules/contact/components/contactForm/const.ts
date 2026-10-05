export const FormStatus = {
	INITIAL: "initial",
	LOADING: "loading",
	SUCCESS: "success",
	ERROR: "error",
	UNAUTHORIZED: "unauthorized",
} as const;

export type FormStatus = (typeof FormStatus)[keyof typeof FormStatus];
