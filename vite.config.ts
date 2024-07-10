import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { EsLinter, linterPlugin, TypeScriptLinter } from "vite-plugin-linter";

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  return {
    base: "./",
    plugins: [
      preact(),
      linterPlugin({
        include: ["./src/**/*.ts", "./src/**/*.tsx"],
        linters: [new EsLinter({ configEnv: configEnv }), new TypeScriptLinter()]
      })
    ]
  };
});
