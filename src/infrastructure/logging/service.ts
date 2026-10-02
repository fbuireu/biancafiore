import { Context, Layer } from "effect";
import { type Logger, logger } from "./logger";

export class LoggerService extends Context.Tag("LoggerService")<LoggerService, Logger>() {}

export const LoggerServiceLive = Layer.sync(LoggerService, () => logger);
