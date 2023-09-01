import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  outdir: "./bin",
  platform: "node",
  bundle: true,
});
