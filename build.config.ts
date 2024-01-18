import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  outDir: "dist",
  declaration: "compatible",
  clean: true,
  sourcemap: true,
});
