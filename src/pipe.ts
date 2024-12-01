import type {
  AnyFunction,
  ArrayMaybePromise,
  LastIndex,
  Prev,
  GMerge,
  MergeObjects,
} from "./types";

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
  T[Prev<X>] extends GMerge<any, infer GO>
    ? MergeObjects<PrevReturn<T, Prev<X>>, Awaited<GO>>
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

type PipeReturn<
  DefinedOutput,
  F extends readonly AnyFunction[],
> = DefinedOutput extends any
  ? F[LastIndex<F>] extends GMerge<any, infer GO>
    ? MergeObjects<PrevReturn<F, LastIndex<F>>, Awaited<GO>>
    : ReturnType<PipeArray<F>[LastIndex<F>]>
  : DefinedOutput;

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
    ) => PipeReturn<TOutput, T>;
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
    ) => Promise<Awaited<PipeReturn<TOutput, T>>>;
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
