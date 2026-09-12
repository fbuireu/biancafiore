import { type Logger, logger } from "@infrastructure/logging/logger";
import { Context, Layer } from "effect";

export class LoggerService extends Context.Tag("LoggerService")<LoggerService, Logger>() {}

export const LoggerServiceLive = Layer.sync(LoggerService, () => logger);
