import type { AnyFunction, LastIndex, Prev } from "./helper";

type PipeReduce<AF extends AnyFunction, BF extends AnyFunction> =
  BF extends AnyFunction<[ReturnType<AF>], unknown>
    ? BF
    : (...value: [ReturnType<AF>]) => unknown;

type PipeArray<T extends readonly AnyFunction[]> = {
  [X in keyof T]: X extends "0" | 0 ? T[X] : PipeReduce<T[Prev<X>], T[X]>;
};

export const pipe =
  <T extends readonly AnyFunction[]>(...fus: PipeArray<T>) =>
  (...input: Parameters<T[0]>): ReturnType<PipeArray<T>[LastIndex<T>]> =>
    fus.reduce((acc, f) => f(acc), input) as ReturnType<
      PipeArray<T>[LastIndex<T>]
    >;
