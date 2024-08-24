/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    test: {
        include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    },
});
