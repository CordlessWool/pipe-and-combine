import { isAsync } from "./helpers/async.js";
import type { AnyFunction, EmptyParams, HasAsyncFunction } from "./types.js";

type CombineMap<
  AF extends AnyFunction,
  TInput extends Array<unknown>,
  TOutput
> = AF extends AnyFunction<TInput, TOutput>
  ? AF
  : (...value: TInput) => TOutput;

export type CombineArray<
  T extends readonly AnyFunction[],
  TInput extends any[] | EmptyParams,
  TOutput
> = {
  [X in keyof T]: CombineMap<
    T[X],
    TInput extends EmptyParams ? Parameters<T[0]> : TInput,
    TOutput extends EmptyParams ? ReturnType<T[X]> : TOutput
  >;
};

export type CombineReturn<T extends readonly AnyFunction[]> = {
  [X in keyof T]: ReturnType<T[X]>;
};

/**
 * Return a function that combines multiple functions into one. Input and Output types defines the functions could be added to the combine function.
 */
export const prepareCombine =
  <TInput extends any[] | EmptyParams = EmptyParams, TOutput = EmptyParams>() =>
  <T extends readonly AnyFunction[]>(
    ...fus: CombineArray<T, TInput, TOutput>
  ) => {
    type In = TInput extends EmptyParams ? Parameters<T[0]> : TInput;
    type Out = TOutput extends EmptyParams
      ? CombineReturn<T>
      : TOutput extends void
      ? void
      : TOutput[];
    const func = fus.some((fu) => isAsync(fu))
      ? async (...input: TInput extends any ? Parameters<T[0]> : TInput) => {
          const result = [];
          for (const fu of fus) {
            if (isAsync(fu)) {
              result.push(await fu(...input));
            } else {
              result.push(fu(...input));
            }
          }
          return result;
        }
      : (...input: TInput extends any ? Parameters<T[0]> : TInput) =>
          fus.map((fu) => fu(...input)) as TOutput extends any
            ? CombineReturn<T>
            : TOutput[];
    return func as unknown as HasAsyncFunction<T> extends true
      ? (...input: In) => Promise<Out>
      : (...input: In) => Out;
  };

/**
 * Combine multiple functions into one function.
 * Input type is defined by the first function.
 * The Returned function will return an array of the return values of the functions.
 */
export const combine = prepareCombine();
