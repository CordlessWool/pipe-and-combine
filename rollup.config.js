import typescript from "rollup-plugin-typescript2";

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
];
