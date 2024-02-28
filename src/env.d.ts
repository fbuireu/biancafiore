/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
    readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
    readonly PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY: string;
    readonly GOOGLE_RECAPTCHA_SECRET_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
