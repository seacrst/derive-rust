import esbuild from "esbuild";

esbuild.build({
  outdir: "lib/esm",
  splitting: true,
  minify: true,
  entryPoints: ["src/**/*.ts"],
  format: "esm",
  platform: "neutral"
});