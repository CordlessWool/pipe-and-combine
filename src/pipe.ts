import type { AnyFunction, ArrayMaybePromise, LastIndex, Prev } from "./helper";
import { GMerge, MergeObjects } from "./test";

/**
 *   AF: A Function
 *   BF: B Function
 *   AI: A Function Input
 *   BO: B Function Output
 */

type PrevReturn<
  T extends readonly AnyFunction[],
  X extends `${number}` | number,
> =
  T[Prev<X>] extends GMerge<infer GI, infer GO>
    ? MergeObjects<PrevReturn<T, Prev<X>>, GO>
    : ReturnType<T[Prev<X>]>;

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

/**
 * Wrapps around a function and awaits the input parameters.
 * The return value is a promise, which resolves to the return value of the function.
 *
 * @param fu - The function to be wrapped.
 */
export const awit =
  <T extends AnyFunction<any[], Promise<any>>>(fu: T) =>
  async (
    ...maybePromise: ArrayMaybePromise<Parameters<T>>
  ): Promise<Awaited<ReturnType<T>>> => {
    const args = await Promise.all(maybePromise);
    return fu(...args);
  };

/**
 * Wrapps around a function and deserializes an array as arguments.
 * e.g. dispel(fu)([1, 2, 3]) is equal to fu(1, 2, 3)
 */
export const dispel =
  <T extends AnyFunction>(fu: T) =>
  (args: Parameters<T>): ReturnType<T> => {
    if (args.length === 1 && Array.isArray(args[0])) {
      return fu(...args[0]);
    }
    return fu(...args);
  };

/**
 * Executes a function with all values of an array.
 * e.g. execute(fu)([1, 2, 3]) is equal to [fu(1), fu(2), fu(3)]
 */
export const map =
  <T, U>(fn: (arg: T) => U) =>
  (arr: T[]) =>
    arr.map(fn);

/**
 * This function prepares a pipe function with a preset input and output.
 * The first function has to be a function that takes the input
 * and the last function has to be a function that returns the output.
 *
 * @returns a pipe function with a preset input and output.
 */
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

/**
 * This function prepares a async pipe function with a preset input and output.
 * The first function has to be a function that takes the input
 * and the last function has to be a function that returns the output.
 *
 * @returns a pipe function with a preset input and output.
 */
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

/**
 * This function takes a list of functions and returns a function that takes the input of the first function and the output of the last function.
 */
export const pipe = preparePipe();

/**
 * This function takes a list of functions and returns a function that takes the input of the first function and the output of the last function.
 * Async functions are supported and will be awaited before passing the result to the next function.
 */
export const asyncPipe = prepareAsyncPipe();
