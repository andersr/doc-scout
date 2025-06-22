/// <reference types="vitest" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { safeRoutes } from "safe-routes/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isE2eTestEnv = env.E2E_ENV;
  const isUnitTestEnv = env.NODE_ENV === "test";

  return {
    plugins:
      isUnitTestEnv || mode === "test"
        ? [tailwindcss()]
        : [tailwindcss(), reactRouter(), safeRoutes()],
    resolve: {
      alias: {
        "@services": path.resolve(
          __dirname,
          isE2eTestEnv ? "./app/__mocks__/services" : "./app/.server/services",
        ),
        "~": path.resolve(__dirname, "./app"),
      },
    },
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
      ...(process.env.DEV_HOST && { allowedHosts: [process.env.DEV_HOST] }),
    },
    test: {
      environment: "jsdom",
      exclude: ["node_modules", "e2e", "tmp"],
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
