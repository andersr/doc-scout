/// <reference types="vitest" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { safeRoutes } from "safe-routes/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins:
    process.env.NODE_ENV === "test" || mode === "test"
      ? [tailwindcss(), tsconfigPaths()]
      : [tailwindcss(), reactRouter(), tsconfigPaths(), safeRoutes()],
  server: {
    port: 3000,
    ...(process.env.DEV_HOST && { allowedHosts: [process.env.DEV_HOST] }),
  },
  test: {
    environment: "jsdom",
    exclude: ["node_modules", "e2e", "tmp"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
}));
