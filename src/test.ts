import { AnyObject } from "./helper";

export type GMerge<I, O> = ((data: I) => I & O) & {
  __brand: "GMerge";
};

export const g = <const FI extends AnyObject, FO>(
  fu: (args: FI) => FO,
): GMerge<FI, FO> =>
  ((data) => {
    const subset = fu(data);
    return { ...data, ...subset };
  }) as GMerge<FI, FO>;

const genericFunction = g((d: { n: number; s: string; b: boolean }) => {
  return {
    n: d.n.toString(),
    s: d.s.toUpperCase(),
    b: d.b.toString(),
    length: 3,
  };
});

export type MergeObjects<A, B> = {
  [X in keyof A | keyof B]: X extends keyof B
    ? B[X]
    : X extends keyof A
      ? A[X]
      : never;
};

type InferFunction<F extends (...args: any) => any, I> =
  F extends GMerge<infer GI, infer GO>
    ? I extends GI
      ? MergeObjects<I, GO>
      : "Input does not match"
    : "Function is not a GFunction";

type T = InferFunction<
  typeof genericFunction,
  { n: number; s: string; b: boolean; c: string }
>;
