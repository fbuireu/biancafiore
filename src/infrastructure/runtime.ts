import { type CmsClient, CmsClientLive } from "@infrastructure/cms/client";
import { type Effect, ManagedRuntime } from "effect";

const cmsRuntime = ManagedRuntime.make(CmsClientLive);

export const runCms = <A, E>(effect: Effect.Effect<A, E, CmsClient>): Promise<A> => cmsRuntime.runPromise(effect);
