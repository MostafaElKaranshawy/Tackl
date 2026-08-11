import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        coverage: {
            provider: "v8",

            reporter: [
                "text",
                "html",
                "lcov",
            ],
            exclude: [
                "tests/**",
                "src/config/**",
                "src/models/**",
                "src/migrations/**",
                "src/seeders/**",
                "src/types/**",
                "**/*.d.ts",
                "src/enums/**",
                "src/interfaces/**",
                "src/services/emailService.ts",
            ],

            thresholds: {
                lines: 80,
                functions: 0,
                branches: 0,
                statements: 80,
            },
        },
    },
});
