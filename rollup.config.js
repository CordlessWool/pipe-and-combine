import typescript from "rollup-plugin-typescript2";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/entry.ts", // Entry point
    output: [
      {
        file: "dist/lib.cjs", // CommonJS output
        format: "cjs",
        sourcemap: false,
      },
      {
        file: "dist/lib.js", // ESM output
        format: "esm",
        sourcemap: false,
      },
    ],
    plugins: [
      nodeResolve(), // Resolve node modules
      typescript({ tsconfig: "./tsconfig.json" }), // TypeScript plugin
    ],
    external: [], // Specify external dependencies here, if any
  },
  {
    input: "./dist/entry.d.ts",
    output: {
      file: "./dist/entry.d.cts", // Generate .cts for CommonJS
      format: "es",
    },
    plugins: [dts()],
  },
];
