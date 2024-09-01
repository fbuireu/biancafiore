import { getSecret } from "astro:env/server";
import { Resend } from "resend";

export const { emails } = new Resend(getSecret("RESEND_API_KEY"));
