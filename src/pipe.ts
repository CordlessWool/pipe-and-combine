import type {
  AnyFunction,
  ArrayMaybePromise,
  LastIndex,
  MaybePromise,
  Prev,
} from "./helper";

type PipeReduce<AF extends AnyFunction, BF extends AnyFunction> =
  BF extends AnyFunction<[Awaited<ReturnType<AF>>], unknown>
    ? BF
    : (...value: [ReturnType<AF>]) => unknown;

type PipeReduceFirst<AI extends any[], BF extends AnyFunction> =
  BF extends AnyFunction<AI, unknown> ? BF : (...value: AI) => unknown;

type PipeReduceLast<AF extends AnyFunction, BF extends AnyFunction, BO> =
  BF extends AnyFunction<[Awaited<ReturnType<AF>>], BO>
    ? BF
    : (...value: [ReturnType<AF>]) => BO;

type PipeArray<
  T extends readonly AnyFunction[],
  TInput extends any[] = Parameters<T[0]>,
  TOutput = ReturnType<T[LastIndex<T>]>,
> = {
  [X in keyof T]: X extends "0" | 0
    ? PipeReduceFirst<TInput, T[X]>
    : X extends `${LastIndex<T>}` | LastIndex<T>
      ? PipeReduceLast<T[Prev<X>], T[X], TOutput>
      : PipeReduce<T[Prev<X>], T[X]>;
};

export const pipeAsync =
  <T extends readonly AnyFunction<any[], MaybePromise<any>>[]>(
    ...fus: PipeArray<T>
  ) =>
  async <TInput extends any[] = ArrayMaybePromise<Parameters<T[0]>>>(
    ...input: TInput
  ) =>
    fus.reduce(async (maybePromise, f) => {
      const result = await maybePromise;
      return f(result);
    }, Promise.all(input)) as ReturnType<PipeArray<T>[LastIndex<T>]>;

export const pipe =
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T>) =>
  <TInput extends any[] = Parameters<T[0]>>(
    ...input: TInput
  ): ReturnType<PipeArray<T>[LastIndex<T>]> =>
    fus.reduce((acc, f) => f(acc), input) as ReturnType<
      PipeArray<T>[LastIndex<T>]
    >;

export const createPipe =
  <TInput extends any[] = never, TOutput = never>() =>
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T, TInput, TOutput>) =>
  (
    ...input: TInput extends never ? Parameters<T[0]> : TInput
  ): ReturnType<PipeArray<T>[LastIndex<T>]> =>
    fus.reduce((acc, f) => f(acc), input) as ReturnType<
      PipeArray<T>[LastIndex<T>]
    >;

const p = createPipe<[string], number>();
const ex = p(
  (i: string): number => Number(i),
  (i: number) => i * 2,
);
const r = ex("2");
