import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./testSetup.ts",

        coverage: {
            provider: "v8",

            reporter: [
                "text",
                "html",
            ],

            include: [
                "src/**/*.{ts,tsx}",
            ],

            exclude: [
                "src/main.tsx",
                "src/constants.ts",
                "src/vite-env.d.ts",
                "src/**/*.d.ts",
                "src/types/*.ts",
                "src/contexts/**/*.ts",
            ],

            thresholds: {
                lines: 80,
                statements: 80,
            },
        },
    },
});