import type { AnyFunction } from "./helper";

type CombineMap<
  AF extends AnyFunction,
  TInput extends any[],
  TOutput extends any,
> =
  AF extends AnyFunction<TInput, TOutput> ? AF : (...value: TInput) => TOutput;

export type CombineArray<
  T extends readonly AnyFunction[],
  TInput extends any[],
  TOutput extends any,
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

export const prepareCombine =
  <TInput extends any[], TOutput = any>() =>
  <T extends readonly AnyFunction[]>(
    ...fus: CombineArray<T, TInput, TOutput>
  ) =>
  (...input: TInput extends any ? Parameters<T[0]> : TInput) =>
    fus.map((fu) => fu(...input)) as TOutput extends any
      ? CombineReturn<T>
      : TOutput[];

export const combine = prepareCombine();
