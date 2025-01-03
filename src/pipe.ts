import type {
  AnyFunction,
  LastIndex,
  Prev,
  PropablyPromise,
  HasAsyncFunction,
  GType,
  GQueue,
} from "./types.js";

/**
 *   AF: A Function
 *   BF: B Function
 *   AI: A Function Input
 *   BO: B Function Output
 */

type PrevReturn<
  F extends readonly AnyFunction[],
  X extends `${number}` | number,
  I extends any[]
> = X extends "0"
  ? I
  : F[Prev<X>] extends GType
  ? GQueue<F[Prev<X>], PrevReturn<F, Prev<X>, I>>
  : ReturnType<F[Prev<X>]>;

type PipeReduce<
  AI extends any[],
  BF extends AnyFunction,
  BO = unknown
> = BF extends AnyFunction<AI, BO> ? BF : (...value: AI) => BO;

type PipeArray<
  T extends readonly AnyFunction[],
  TInput extends any[] = Parameters<T[0]>,
  TOutput = ReturnType<T[LastIndex<T>]>
> = {
  [X in keyof T]: X extends "0" | 0
    ? PipeReduce<
        Awaited<TInput>,
        T[X],
        X extends `${LastIndex<T>}` ? TOutput : unknown
      >
    : X extends `${LastIndex<T>}` | LastIndex<T>
    ? PipeReduce<[Awaited<PrevReturn<T, X, TInput>>], T[X], TOutput>
    : PipeReduce<[Awaited<PrevReturn<T, X, TInput>>], T[X]>;
};

type PipeReturn<
  DefinedOutput,
  F extends readonly AnyFunction[],
  I extends any[] = Parameters<F[0]>
> = PropablyPromise<PipeDefineOutput<DefinedOutput, F, I>, HasAsyncFunction<F>>;

type PipeDefineOutput<
  DefinedOutput,
  F extends readonly AnyFunction[],
  I extends any[] = Parameters<F[0]>
> = DefinedOutput extends any
  ? F[LastIndex<F>] extends GType
    ? GQueue<F[LastIndex<F>], PrevReturn<F, LastIndex<F>, I>>
    : Awaited<ReturnType<PipeArray<F>[LastIndex<F>]>>
  : DefinedOutput;

/**
 * This function prepares a pipe function with a preset input and output.
 * The first function has to be a function that takes the input
 * and the last function has to be a function that returns the output.
 * If no input or output is defined it is defined by the first and last function.
 *
 * @returns a pipe function with a preset input and output.
 */
export const preparePipe =
  <TInput extends any[], TOutput>() =>
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T, TInput, TOutput>) => {
    const [first, ...rest] = fus;
    const chain = rest.reduce(
      (chain, f) =>
        chain.constructor.name === "AsyncFunction" ||
        f.constructor.name === "AsyncFunction"
          ? async (...args) => {
              const data = await chain(...args);
              return f(data);
            }
          : (...args) => f(chain(...args)),
      first
    );
    return chain as (
      ...input: TInput extends any ? Parameters<T[0]> : TInput
    ) => PipeReturn<TOutput, T, TInput>;
  };

/**
 * This function takes a list of functions
 * and returns a function that takes the input of the first function
 * and return the output of the last function.
 * Async functions are supported and will be awaited before passing the result to the next function.
 */
export const pipe = preparePipe();
