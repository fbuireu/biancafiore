import { EmailError } from "@infrastructure/errors";
import { Context, Effect, Layer } from "effect";
import { type CreateEmailOptions, Resend } from "resend";

export class EmailClient extends Context.Tag("EmailClient")<
	EmailClient,
	{
		send(payload: CreateEmailOptions): Effect.Effect<{ id: string }, EmailError>;
	}
>() {}

export const EmailClientLive = Layer.effect(
	EmailClient,
	Effect.gen(function* () {
		const { getSecret } = yield* Effect.promise(() => import("astro:env/server"));
		const emails = new Resend(getSecret("RESEND_API_KEY")).emails;

		return {
			send: (payload) =>
				Effect.tryPromise({
					try: () => emails.send(payload),
					catch: (cause) =>
						new EmailError({
							message: cause instanceof Error ? cause.message : String(cause),
							cause,
						}),
				}).pipe(
					Effect.flatMap(({ data, error }) =>
						error || !data
							? Effect.fail(
									new EmailError({
										message: error?.message ?? "Something went wrong while sending the email",
										cause: error,
									}),
								)
							: Effect.succeed({ id: data.id }),
					),
				),
		};
	}),
);
