import { getSecret } from "astro:env/server";
import type { ServiceAccount } from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";

const activeApps = getApps();
const SERVICE_ACCOUNT = {
	type: "service_account",
	project_id: getSecret("FIREBASE_PROJECT_ID"),
	private_key_id: getSecret("FIREBASE_PRIVATE_KEY_ID"),
	private_key: getSecret("FIREBASE_PRIVATE_KEY"),
	client_email: getSecret("FIREBASE_CLIENT_EMAIL"),
	client_id: getSecret("FIREBASE_CLIENT_ID"),
	auth_uri: getSecret("FIREBASE_AUTH_URI"),
	token_uri: getSecret("FIREBASE_TOKEN_URI"),
	auth_provider_x509_cert_url: getSecret("FIREBASE_AUTH_CERT_URL"),
	client_x509_cert_url: getSecret("FIREBASE_CLIENT_CERT_URL"),
};

export const app =
	activeApps.length === 0
		? initializeApp({
				credential: cert(SERVICE_ACCOUNT as ServiceAccount),
			})
		: activeApps[0];
