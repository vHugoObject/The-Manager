import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["vitest.setup.ts"],
    projects: [
      {
        test: {
          include: ["**/*.unit.test.ts"],
          name: "unit",
          environment: "node",
	  testTimeout: 9000,
        },
      },
      {
        test: {
          include: ["**/*.test.tsx"],
          name: "components",
          environment: "jsdom",
        },
      },
      {
        test: {
          include: ["**/*.browser.test.ts"],
          name: "browser",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
