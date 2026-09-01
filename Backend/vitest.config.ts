import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: ["./tests/setup.ts"],
        environment: "node",
        coverage: {
            provider: "v8",

            reporter: [
                "text",
                "html",
                "lcov",
            ],
            include: [
                "src/**",
            ],
            exclude: [
                "tests/**",
                "src/config/**",
                "src/migrations/**",
                "src/seeders/**",
                "**/*.d.ts",
                "src/index.ts",
            ],

            thresholds: {
                lines: 80,
                statements: 80,
            },
        },
    },
});
