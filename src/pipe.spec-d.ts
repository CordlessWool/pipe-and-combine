import { test, describe, expect, assertType, expectTypeOf } from "vitest";
import { pipe, pipeAsync, preparePipe } from "./pipe";

describe("pipe", () => {
  test("should return 25", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const square = (x: number) => x * x;
    const toStr = (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<string>();
    assertType<string>(pipeline(2));
  });
});

describe.skip("pipeAsync", () => {
  test("simple", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipeAsync(double, increment, square, increment, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<Promise<string>>();
    assertType<Promise<string>>(pipeline(2));
  });
});

describe("preparePipe", () => {
  test("preparePipe without params", () => {
    const pipe = preparePipe();
    assertType<Function>(pipe);
    const transformer = pipe((i: string): number => Number(i));
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<number>();
    assertType<number>(transformer("2"));
  });

  test("preparePipe with params", () => {
    const pipe = preparePipe<[string], string>();
    const transformer = pipe(
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString(),
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });
  test("preparePipe assert params are reference (Input)", () => {
    const pipe = preparePipe<[number], string>();
    const transformer = pipe(
      // @ts-expect-error
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString(),
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });

  test("preparePipe assert params are reference (Output)", () => {
    const pipe = preparePipe<[string], number>();
    const transformer = pipe(
      (i: string): number => Number(i),
      (i: number) => i + 1,
      // @ts-expect-error
      (i: number) => i.toString(),
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });

  test("preparePipe assert params are reference (Input and Output)", () => {
    const pipe = preparePipe<[number], number>();
    const transformer = pipe(
      // @ts-expect-error
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString(),
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });
});
