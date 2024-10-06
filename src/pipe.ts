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

type PipeArray<T extends readonly AnyFunction[]> = {
  [X in keyof T]: X extends "0" | 0 ? T[X] : PipeReduce<T[Prev<X>], T[X]>;
};

export const pipeAsync =
  <T extends readonly AnyFunction<any[], MaybePromise<any>>[]>(
    ...fus: PipeArray<T>
  ) =>
  async (...input: ArrayMaybePromise<Parameters<T[0]>>) =>
    fus.reduce(async (maybePromise, f) => {
      const result = await maybePromise;
      return f(result);
    }, Promise.all(input)) as ReturnType<PipeArray<T>[LastIndex<T>]>;

export const pipe =
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T>) =>
  (...input: Parameters<T[0]>): ReturnType<PipeArray<T>[LastIndex<T>]> =>
    fus.reduce((acc, f) => f(acc), input) as ReturnType<
      PipeArray<T>[LastIndex<T>]
    >;
