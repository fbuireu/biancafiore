import { Layer } from "effect";
import { Database } from "./db/client";
import { EmailClient } from "./email/server";
import { LoggerService } from "./logging/service";

export const ContactLayer = Layer.mergeAll(Database.layer, EmailClient.layer, LoggerService.layer);
