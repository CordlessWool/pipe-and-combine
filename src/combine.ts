import { isAsync } from "./helpers/async.js";
import type { AnyFunction } from "./types.js";

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
> = {
  [X in keyof T]: CombineMap<
    T[X],
    TInput extends any ? Parameters<T[0]> : TInput,
    TOutput extends any ? ReturnType<T[X]> : TOutput
  >;
};

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
  ) =>
    fus.some((fu) => isAsync(fu))
      ? async (...input: TInput extends any ? Parameters<T[0]> : TInput) => {
          type ReturnArray = TOutput extends any ? CombineReturn<T> : TOutput[];
          const result = [];
          for (const fu of fus) {
            if (isAsync(fu)) {
              result.push(await fu(...input));
            } else {
              result.push(fu(...input));
            }
          }
          return result as ReturnArray;
        }
      : (...input: TInput extends any ? Parameters<T[0]> : TInput) =>
          fus.map((fu) => fu(...input)) as TOutput extends any
            ? CombineReturn<T>
            : TOutput[];

/**
 * Combine multiple functions into one function.
 * Input type is defined by the first function.
 * The Returned function will return an array of the return values of the functions.
 */
export const combine = prepareCombine();
