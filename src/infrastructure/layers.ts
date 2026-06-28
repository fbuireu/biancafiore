import { DatabaseLive } from "@infrastructure/db/client";
import { EmailClientLive } from "@infrastructure/email/server";
import { Layer } from "effect";

export const ContactLayer = Layer.mergeAll(DatabaseLive, EmailClientLive);
