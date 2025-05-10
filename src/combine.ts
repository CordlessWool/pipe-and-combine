import { isAsync } from "./helpers/async.js";
import type { AnyFunction, IsAsyncFunction } from "./types.js";

type CombineMap<
  AF extends AnyFunction,
  TInput extends any[],
  TOutput extends any
> = AF extends AnyFunction<TInput, TOutput>
  ? AF
  : (...value: TInput) => TOutput;

export type CombineArray<
  T extends readonly AnyFunction[],
  TInput extends any[],
  TOutput extends any
> = T extends readonly [...infer U]
  ? U extends AnyFunction[]
    ? {
        [X in keyof U]: CombineMap<
          U[X],
          TInput extends any ? Parameters<U[0]> : TInput,
          TOutput extends any ? ReturnType<U[X]> : TOutput
        >;
      }
    : never
  : never;

export type CombineReturn<T extends readonly AnyFunction[]> = {
  [X in keyof T]: ReturnType<T[X]>;
};

/**
 * Return a function that combines multiple functions into one. Input and Output types defines the functions could be added to the combine function.
 */
export const prepareCombine =
  <TInput extends any[], TOutput = any>() =>
  <T extends readonly AnyFunction[]>(
    ...fus: CombineArray<T, TInput, TOutput>
  ) => {
    let isAnyAsync = false;
    const fuStrs = fus.map((fu, i) => {
      const sync = !isAsync(fu);
      if (sync) {
        return `const r${i} = (${fu.toString()})(...args);`;
      } else {
        isAnyAsync = true;
        return `const r${i} = await ${fu.toString()};`;
      }
    });
    const rAttrNames = fus.map((_, i) => `r${i}`);
    const executeAble = new Function(`return ${
      isAnyAsync ? "async " : ""
    }(...args) => {
      ${fuStrs.join("")};
      return [${rAttrNames.join(",")}];
    }`);

    console.log(executeAble.toString());

    type ReturnType = TOutput extends any ? CombineReturn<T> : TOutput[];
    return executeAble() as unknown as IsAsyncFunction<
      typeof executeAble
    > extends true
      ? Promise<ReturnType>
      : ReturnType;
  };

/**
 * Combine multiple functions into one function.
 * Input type is defined by the first function.
 * The Returned function will return an array of the return values of the functions.
 */
export const combine = prepareCombine();
