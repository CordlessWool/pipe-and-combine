export type Increment<N extends number> = [...BuildArray<N>, unknown]["length"];

export type AnyObject = Record<string | number | symbol, any>;
export type KeyAnyObject<T extends readonly (string | number | symbol)[]> = {
  [X in keyof T as T[X] extends string | number | symbol ? T[X] : never]: any;
};

export type Decrement<N extends number> = N extends 0
  ? never // If the number is 0, there's nothing to decrement
  : BuildArray<N> extends [...infer Rest, infer _]
  ? Rest["length"]
  : never;
type BuildArray<
  Length extends number,
  Arr extends unknown[] = []
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
  TOutput = any
> = (...inputs: TInput) => TOutput;

export type MaybePromise<T> = T | Promise<T>;
export type ArrayMaybePromise<T> = {
  [x in keyof T]: MaybePromise<T[x]>;
};

type ExcludeGeneric<T> = string extends T // do we actually have a string index signature?
  ? never
  : symbol extends T // is it a symbol index signature?
  ? never
  : number extends T // is it a number index signature?
  ? never
  : T;

export type MergeObjects<A, B> = {
  [X in ExcludeGeneric<keyof A> | keyof B]: X extends keyof B
    ? B[X]
    : X extends keyof A
    ? A[X]
    : never;
};


export type PropablyPromise<R, B> = B extends true ? Promise<R> : R;

type IsAsyncFunction<T> = T extends (...args: any[]) => Promise<any>
  ? true
  : false;

export type HasAsyncFunction<T extends readonly AnyFunction[]> = T extends [
  infer First,
  ...infer Rest extends readonly AnyFunction[]
]
  ? IsAsyncFunction<First> extends true
    ? true
    : HasAsyncFunction<Rest>
  : false;

export type ObjectFromEntries<T extends Array<readonly [string, unknown]>> = {
  [X in T[number] as X[0]]: X[1];
};

export type ArraysToEntries<
  K extends string[],
  V extends unknown[]
> = K["length"] extends V["length"]
  ? {
      [X in keyof K]: [K[X], X extends keyof V ? V[X] : never];
    }
  : never;

export type ObjectFromArrays<
  K extends string[],
  V extends unknown[]
> = ObjectFromEntries<ArraysToEntries<K, V>>;

/**
 * Generics
 */
export type GMerge<I, O> = ((data: I) => I & O) & {
  __brand: "GMerge";
};

export type GMergeAsync<I, O> = ((data: I) => Promise<I & O>) & {
  __brand: "GMerge";
};

export type GOmit<I, K extends string> = ((data: I) => Omit<I, K>) & {
  __brand: "GOmit";
};
export type GPick<I, K extends keyof I> = ((data: I) => Pick<I, K>) & {
  __brand: "GPick";
};

export type GType =
  | GMerge<any, any>
  | GMergeAsync<any, any>
  | GOmit<any, any>
  | GPick<any, any>;

export type GQueue<F, I extends any[]> = F extends GMerge<any, infer B>
  ? MergeObjects<I[0], Awaited<B>>
  : F extends GOmit<any, infer K>
  ? Omit<I[0], K>
  : F extends GPick<any, infer K>
  ? Pick<I[0], K extends keyof I[0] ? K : never>
  : never;
