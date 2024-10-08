import type {
  AnyFunction,
  ArrayMaybePromise,
  LastIndex,
  MaybePromise,
  Prev,
} from "./helper";

/**
 *   AF: A Function
 *   BF: B Function
 *   AI: A Function Input
 *   BO: B Function Output
 */

type PipeReduce<AF extends AnyFunction, BF extends AnyFunction> =
  BF extends AnyFunction<[Awaited<ReturnType<AF>>], unknown>
    ? BF
    : (...value: [ReturnType<AF>]) => unknown;

type PipeReduceFirst<AI extends any[], BF extends AnyFunction, BO = unknown> =
  BF extends AnyFunction<AI, BO> ? BF : (...value: AI) => BO;

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
    ? PipeReduceFirst<
        TInput,
        T[X],
        X extends `${LastIndex<T>}` ? TOutput : unknown
      >
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

export const preparePipe =
  <TInput extends any[], TOutput>() =>
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T, TInput, TOutput>) =>
  (...input: TInput extends any ? Parameters<T[0]> : TInput) =>
    fus.reduce((acc, f) => f(acc), input) as TOutput extends any
      ? ReturnType<PipeArray<T>[LastIndex<T>]>
      : TOutput;

export const pipe = preparePipe();

const p = preparePipe<[string], number>();
const ex = p(
  (i: string): number => Number(i),
  (i: number) => i + 1,
);
const r = ex("2");

const p1 = preparePipe();
const ex1 = p1((i: string): number => Number(i));
const r1 = ex1("2");
