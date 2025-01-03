import typescript from "rollup-plugin-typescript2";
import { dts } from "rollup-plugin-dts";

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
