import { Effect } from "effect";
import { definePlugin } from "emdash";
import type { EmailDeliverEvent } from "emdash/plugin";
import { EmailClient, EmailClientLive } from "../../../email/server";
import { EMAIL_DELIVERY } from "./const";

export const deliver = ({ message }: EmailDeliverEvent): Promise<void> =>
	Effect.runPromise(
		EmailClient.pipe(
			Effect.flatMap((client) => client.sendCmsEmail(message)),
			Effect.asVoid,
			Effect.provide(EmailClientLive),
		),
	);

export function createPlugin() {
	return definePlugin({
		id: EMAIL_DELIVERY.ID,
		version: EMAIL_DELIVERY.VERSION,
		capabilities: ["hooks.email-transport:register"],
		hooks: { "email:deliver": { handler: deliver, exclusive: true } },
	});
}
