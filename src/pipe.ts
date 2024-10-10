import type { AnyFunction, ArrayMaybePromise, LastIndex, Prev } from "./helper";

/**
 *   AF: A Function
 *   BF: B Function
 *   AI: A Function Input
 *   BO: B Function Output
 */

type PrevReturn<
  T extends readonly AnyFunction[],
  X extends `${number}` | number,
> = ReturnType<T[Prev<X>]>;

type PipeReduce<AI extends any[], BF extends AnyFunction, BO = unknown> =
  BF extends AnyFunction<AI, BO> ? BF : (...value: AI) => BO;

type PipeArray<
  T extends readonly AnyFunction[],
  TInput extends any[] = Parameters<T[0]>,
  TOutput = ReturnType<T[LastIndex<T>]>,
> = {
  [X in keyof T]: X extends "0" | 0
    ? PipeReduce<TInput, T[X], X extends `${LastIndex<T>}` ? TOutput : unknown>
    : X extends `${LastIndex<T>}` | LastIndex<T>
      ? PipeReduce<[PrevReturn<T, X>], T[X], TOutput>
      : PipeReduce<[PrevReturn<T, X>], T[X]>;
};

type AsyncPipeArray<
  T extends readonly AnyFunction[],
  TInput extends any[] = Parameters<T[0]>,
  TOutput = ReturnType<T[LastIndex<T>]>,
> = {
  [X in keyof T]: X extends "0" | 0
    ? PipeReduce<
        Awaited<TInput>,
        T[X],
        X extends `${LastIndex<T>}` ? TOutput : unknown
      >
    : X extends `${LastIndex<T>}` | LastIndex<T>
      ? PipeReduce<[Awaited<PrevReturn<T, X>>], T[X], TOutput>
      : PipeReduce<[Awaited<PrevReturn<T, X>>], T[X]>;
};

export const awit =
  <T extends AnyFunction<any[], Promise<any>>>(fu: T) =>
  async (
    ...maybePromise: ArrayMaybePromise<Parameters<T>>
  ): Promise<Awaited<ReturnType<T>>> => {
    const args = await Promise.all(maybePromise);
    return fu(...args);
  };

export const dispel =
  <T extends AnyFunction>(fu: T) =>
  (args: Parameters<T>): ReturnType<T> => {
    if (args.length === 1 && Array.isArray(args[0])) {
      return fu(...args[0]);
    }
    return fu(...args);
  };

export const preparePipe =
  <TInput extends any[], TOutput>() =>
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T, TInput, TOutput>) => {
    const [first, ...rest] = fus;
    const chain = rest.reduce(
      (acc, f) =>
        (...args) =>
          f(acc(...args)),
      first,
    );
    return chain as (
      ...input: TInput extends any ? Parameters<T[0]> : TInput
    ) => TOutput extends any ? ReturnType<PipeArray<T>[LastIndex<T>]> : TOutput;
  };

export const prepareAsyncPipe =
  <TInput extends any[], TOutput>() =>
  <T extends readonly AnyFunction[]>(
    ...fus: AsyncPipeArray<T, TInput, TOutput>
  ) => {
    const [first, ...rest] = fus;
    const chain = rest.reduce(
      (chain, f) =>
        async (...args) => {
          const data = await chain(...args);
          return f(data);
        },
      first,
    );
    return chain as (
      ...input: TInput extends any
        ? ArrayMaybePromise<Parameters<T[0]>>
        : TInput
    ) => Promise<
      TOutput extends any
        ? Awaited<ReturnType<PipeArray<T>[LastIndex<T>]>>
        : Awaited<TOutput>
    >;
  };

export const pipe = preparePipe();
export const asyncPipe = prepareAsyncPipe();
