import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

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
    input: "src/types.d.ts",
    output: [{ file: "dist/types.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
