import {defineConfig} from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: [
        "src/index.ts",
        "src/match.ts",
        "src/range.ts",
        "src/option.ts",
        "src/result.ts",
        "src/core.ts",
        "src/sync.ts",
        "src/cmp.ts",
      ],
      name: "derive-rust",
      fileName: (fmt, name) => fmt === "es" ? `${name}.js` : `${name}.umd.${fmt}`
    },
    outDir: "lib"
  },
  plugins: [
    dts({
      exclude: ["src/test.ts"]
    })
  ]
});