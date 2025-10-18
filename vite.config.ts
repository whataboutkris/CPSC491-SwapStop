import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/setupTests.ts",
    css: true,

    // 👇 Add these:
    include: [
      "src/__frontend-tests__/**/*.test.{js,ts,jsx,tsx}",
      "src/__backend-tests__/**/*.test.{js,ts,jsx,tsx}",
    ],

    // Optional, helps debug:
    logHeapUsage: true,
    pool: "threads",
  },
});