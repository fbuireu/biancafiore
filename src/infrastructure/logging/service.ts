import { Context, Layer } from "effect";
import { type Logger, logger } from "./logger";

export class LoggerService extends Context.Service<LoggerService, Logger>()("LoggerService") {
	static readonly layer = Layer.sync(LoggerService, () => logger);
}
