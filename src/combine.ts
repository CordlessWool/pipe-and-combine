import { AnyFunction } from "./helper";

type CombineMap<AF extends AnyFunction, TInput extends unknown[]> =
  AF extends AnyFunction<TInput, infer B> ? AF : (...value: TInput) => unknown;

type CombineArray<T extends readonly AnyFunction[]> = {
  [X in keyof T]: CombineMap<T[X], Parameters<T[0]>>;
};

type CombineReturn<T extends readonly AnyFunction[]> = {
  [X in keyof T]: ReturnType<T[X]>;
};

export const combine =
  <T extends readonly AnyFunction[]>(...fus: CombineArray<T>) =>
  (...input: Parameters<T[0]>): CombineReturn<T> =>
    fus.map((fu) => fu(...input)) as CombineReturn<T>;
