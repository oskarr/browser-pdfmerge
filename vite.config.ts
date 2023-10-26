import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import vpl from "vite-plugin-linter";

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  const { EsLinter, linterPlugin, TypeScriptLinter } = vpl;
  return {
    "plugins": [
      preact(),
      linterPlugin({
        "include": ["./src/**/*.ts", "./src/**/*.tsx"],
        "linters": [new EsLinter({ "configEnv": configEnv }), new TypeScriptLinter()]
      })
    ]
  };
});
