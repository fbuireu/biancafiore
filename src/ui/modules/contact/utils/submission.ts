export interface ContactActionResult {
	data?: { ok: boolean } | undefined;
	error?: { status: number; message: string } | undefined;
}

export type ContactSubmission = { ok: true } | { ok: false; status: number; message: string };

export const UNDELIVERED_MESSAGE =
	"Whoopsie! Your message didn't make it. Please check your connection and try again in a few minutes.";

export const UNDELIVERED_SUBMISSION: ContactSubmission = {
	ok: false,
	status: 500,
	message: UNDELIVERED_MESSAGE,
};

export const toContactSubmission = ({ data, error }: ContactActionResult): ContactSubmission => {
	if (error) {
		return { ok: false, status: error.status, message: error.message };
	}

	return data?.ok ? { ok: true } : UNDELIVERED_SUBMISSION;
};
