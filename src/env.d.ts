/// <reference path="../.astro/types.d.ts" />
import { z } from 'zod';

const envVariables = z.object({
    VITE_PUBLIC_GOOGLE_ANALYTICS_ID: z.string(),
});

envVariables.parse(process.env);

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}
