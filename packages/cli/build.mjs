import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  outdir: "./bin",
  packages: "external",
  platform: "node",
  bundle: true,
});
