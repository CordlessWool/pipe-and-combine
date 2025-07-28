import type {
  AnyFunction,
  LastIndex,
  Prev,
  PropablyPromise,
  HasAsyncFunction,
  GType,
  GQueue,
  EmptyParams,
  IsAny,
} from "./types.js";

/**
 *   AF: A Function
 *   BF: B Function
 *   AI: A Function Input
 *   BO: B Function Output
 */

export type PrevReturn<
  F extends readonly AnyFunction[],
  X extends `${number}` | number,
  I extends any[],
> = X extends "0" | 0
  ? I
  : F[Prev<X>] extends GType
    ? [Awaited<GQueue<F[Prev<X>], PrevReturn<F, Prev<X>, I>>>]
    : [Awaited<ReturnType<F[Prev<X>]>>];

export type FnReturn<F extends AnyFunction, I extends any[]> = F extends GType
  ? Awaited<GQueue<F, I>>
  : Awaited<ReturnType<F>>;

export type RawReturn<F extends AnyFunction, I extends any[]> = F extends GType
  ? GQueue<F, I>
  : ReturnType<F>;

export type PipeReduce<AI extends any[], BF extends AnyFunction, BO = unknown> =
  BF extends AnyFunction<AI, BO> ? BF : (...value: AI) => BO;

export type PipeArray<
  TFus extends readonly AnyFunction[],
  TInput extends unknown[],
  Acc extends AnyFunction[] = [],
> = TFus extends [
  infer Fu extends AnyFunction,
  ...infer Rest extends AnyFunction[],
]
  ? PipeArray<
      Rest,
      [FnReturn<Fu, TInput>],
      [
        ...Acc,
        IsAny<RawReturn<Fu, TInput>> extends true
          ? (...input: TInput) => Parameters<Rest[0]>[0]
          : (...input: TInput) => RawReturn<Fu, TInput>,
      ]
    >
  : [...Acc, ...TFus]; //...TFus is necessary to start the loop

type PipeReturn<
  DefinedOutput,
  F extends readonly AnyFunction[],
  I extends any[] = Parameters<F[0]>,
> = PropablyPromise<PipeDefineOutput<DefinedOutput, F, I>, HasAsyncFunction<F>>;

type PipeDefineOutput<
  DefinedOutput,
  F extends readonly AnyFunction[],
  I extends any[] = Parameters<F[0]>,
> = DefinedOutput extends any
  ? F[LastIndex<F>] extends GType
    ? GQueue<F[LastIndex<F>], PrevReturn<F, LastIndex<F>, I>>
    : Awaited<ReturnType<PipeArray<F, I>[LastIndex<F>]>>
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
  <TInput extends any[] | EmptyParams = EmptyParams, TOutput = unknown>() =>
  <T extends readonly AnyFunction[]>(
    ...fus: PipeArray<
      T,
      TInput extends EmptyParams ? Parameters<T[0]> : TInput,
      []
    >
  ) => {
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
      first,
    );
    type FI = TInput extends EmptyParams ? Parameters<T[0]> : TInput;
    return chain as T[0] extends GType
      ? <I extends FI>(...input: I) => PipeReturn<TOutput, T, I>
      : (...input: FI) => PipeReturn<TOutput, T, FI>;
  };

/**
 * This function takes a list of functions
 * and returns a function that takes the input of the first function
 * and return the output of the last function.
 * Async functions are supported and will be awaited before passing the result to the next function.
 */
export const pipe = preparePipe();
export const run = <T extends readonly AnyFunction[]>(
  ...fus: PipeArray<T, []>
) => preparePipe<[], unknown>()<T>(...fus)();
