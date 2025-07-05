/// <reference types="vitest" />
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { safeRoutes } from "safe-routes/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isE2eTestEnv = env.E2E_ENV;
  const isUnitTestEnv = env.NODE_ENV === "test";

  const testOnlyPlugins = [mdx(), tailwindcss()];

  return {
    plugins:
      isUnitTestEnv || mode === "test"
        ? testOnlyPlugins
        : [...testOnlyPlugins, reactRouter(), safeRoutes()],
    resolve: {
      alias: {
        "@services": path.resolve(
          __dirname,
          isE2eTestEnv ? "./e2e/mocks/services" : "./app/.server/services",
        ),
        "~": path.resolve(__dirname, "./app"),
      },
    },
    server: {
      ...(env.DEV_HOST ? { allowedHosts: [env.DEV_HOST] } : {}),
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
    },
    test: {
      environment: "jsdom",
      exclude: ["node_modules", "e2e", "tmp"],
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
