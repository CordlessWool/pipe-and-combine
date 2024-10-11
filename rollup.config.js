import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
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
    terser(), // Minifies the output (optional)
  ],
  external: [], // Specify external dependencies here, if any
};
