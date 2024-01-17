import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { RollupOptions } from "rollup";
import typescript from "@rollup/plugin-typescript";
import typescriptModule from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_DIRNAME = "src";

const getInput = (endMatchPattern: string) => {
  const entryPoints = fs
    .readdirSync(path.join(__dirname, ENTRY_DIRNAME), {
      recursive: true,
    })
    .filter((file) => file.toString("utf-8").endsWith(endMatchPattern));

  const pairs = entryPoints.map((_file) => {
    const file = path.join(ENTRY_DIRNAME, _file.toString()); // src/LinkedList/index.ts
    const fileWithoutExt = file.slice(0, file.length - path.extname(file).length); // src/LinkedList/index
    return [
      path.relative(ENTRY_DIRNAME, fileWithoutExt), // LinkedList/index
      file,
    ];
  });

  const input = Object.fromEntries(pairs);
  console.log(input);

  return input;
};

const sharedPlugins = [
  typescript({
    typescript: typescriptModule,
    tsconfig: "./tsconfig.build.json",
    exclude: ["rollup.config.ts", "**/*.test.ts"],
  }),
];

const config: RollupOptions[] = [
  {
    input: getInput("index.ts"),
    output: [
      {
        dir: "dist",
        format: "es",
        entryFileNames: "[name].mjs",
      },
      {
        dir: "dist",
        format: "cjs",
        entryFileNames: "[name].cjs",
      },
    ],
    plugins: [...sharedPlugins],
  },
];

export default config;
