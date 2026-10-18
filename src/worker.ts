import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { type WarmStore, warmCache } from "@infrastructure/cache/warm";

export { PluginBridge };

interface ScheduledTick {
	scheduledTime: number;
}

interface WorkerEnv {
	SESSION: WarmStore;
	EMDASH_SITE_URL: string;
}

interface WorkerContext {
	waitUntil(promise: Promise<unknown>): void;
	exports: { default: { fetch(request: Request): Promise<Response> } };
}

const runScheduledTasks = createScheduledHandler({ generalCron: "* * * * *" });

export default {
	...handler,
	scheduled(controller: ScheduledTick, env: WorkerEnv, ctx: WorkerContext): void {
		runScheduledTasks(controller, env, ctx);
		ctx.waitUntil(
			warmCache({
				fetch: (request) => ctx.exports.default.fetch(request),
				store: env.SESSION,
				origin: env.EMDASH_SITE_URL,
				now: controller.scheduledTime,
			}),
		);
	},
};
