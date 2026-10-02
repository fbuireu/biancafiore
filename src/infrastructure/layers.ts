import { Layer } from "effect";
import { DatabaseLive } from "./db/client";
import { EmailClientLive } from "./email/server";
import { LoggerServiceLive } from "./logging/service";

export const ContactLayer = Layer.mergeAll(DatabaseLive, EmailClientLive, LoggerServiceLive);
