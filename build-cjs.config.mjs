import esbuild from "esbuild";

esbuild.build({
  outdir: "lib/cjs",
  bundle: true,
  minify: true,
  entryPoints: ["src/**/*.ts"],
  format: "cjs",
  platform: "node"
});