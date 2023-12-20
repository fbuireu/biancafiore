/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
