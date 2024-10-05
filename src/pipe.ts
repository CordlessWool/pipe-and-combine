import type { LastIndex, Prev } from "./helper";

type PipeFunction<TInput extends Array<any> = Array<any>, TOutput = any> = (
  ...inputs: TInput
) => TOutput;

type PipeReduce<AF extends PipeFunction, BF extends PipeFunction> =
  BF extends PipeFunction<[ReturnType<AF>], unknown>
    ? BF
    : (...value: [ReturnType<AF>]) => unknown;

type PipeArray<T extends readonly PipeFunction[]> = {
  [X in keyof T]: X extends "0" | 0 ? T[X] : PipeReduce<T[Prev<X>], T[X]>;
};

export const pipe =
  <T extends readonly PipeFunction[]>(...fus: PipeArray<T>) =>
  (...input: Parameters<T[0]>): ReturnType<PipeArray<T>[LastIndex<T>]> =>
    fus.reduce((acc, f) => f(acc), input) as ReturnType<
      PipeArray<T>[LastIndex<T>]
    >;
