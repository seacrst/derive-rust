import {defineConfig} from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: [
        "src/index.ts"
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