export type Increment<N extends number> = [...BuildArray<N>, unknown]["length"];

export type AnyObject = Record<string | number | symbol, any>;

export type Decrement<N extends number> = N extends 0
  ? never // If the number is 0, there's nothing to decrement
  : BuildArray<N> extends [...infer Rest, infer _]
    ? Rest["length"]
    : never;
type BuildArray<
  Length extends number,
  Arr extends unknown[] = [],
> = Arr["length"] extends Length ? Arr : BuildArray<Length, [...Arr, unknown]>;

export type LastIndex<T extends Array<unknown> | readonly [...unknown[]]> =
  T extends {
    length: infer L extends number;
  }
    ? Decrement<L>
    : never;

export type StringToNumber<T extends `${number}`> =
  `${T}` extends `${infer N extends number}` ? N : never;

export type Prev<T extends number | `${number}`> = T extends number
  ? Decrement<T>
  : T extends string
    ? Decrement<StringToNumber<T>>
    : never;

export type Next<T extends number | `${number}`> = T extends number
  ? Increment<T>
  : T extends string
    ? Increment<StringToNumber<T>>
    : never;

export type AnyFunction<
  TInput extends [...any[]] = [...any[]],
  TOutput = any,
> = (...inputs: TInput) => TOutput;

export type MaybePromise<T> = T | Promise<T>;
export type ArrayMaybePromise<T> = {
  [x in keyof T]: MaybePromise<T[x]>;
};
