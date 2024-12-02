import { test, describe, assertType, expectTypeOf } from "vitest";
import { pipe, preparePipe } from "./pipe";
import { g as gm } from "./helpers";
import { addDate, omit } from "./helpers/generics";

describe("pipe", () => {
  test("should return string", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const square = (x: number) => x * x;
    const toStr = (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<string>();
    assertType<string>(pipeline(2));
  });

  test("pipe return is detected automaticly to be async", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, increment, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<Promise<string>>();
    assertType<Promise<string>>(pipeline(2));
  });

  test("pipe with generics", () => {
    const init = () => () => ({ test: "test" });
    const addStartupTime = (time: Date = new Date()) =>
      gm(() => ({
        startup: time,
      }));
    const timeDiff = () =>
      gm((data: { startup: Date; current: Date }) => {
        return {
          ...data,
          diff: new Date(data.current.getTime() - data.startup.getTime()),
        };
      });

    const addHello = () => gm(() => ({ hello: "test" }));

    const currentToString = () =>
      gm((data: { current: Date }) => {
        return {
          current: data.current.toString(),
        };
      });

    const pipeline = pipe(
      init(),
      addStartupTime(),
      addDate("current"),
      timeDiff(),
      currentToString(),
      addHello(),
      addDate("current"),
      omit("hello")
    );

    expectTypeOf(pipeline).returns.toEqualTypeOf<{
      current: Date;
      startup: Date;
      diff: Date;
      test: string;
    }>();
  });
});

describe("asyncPipe", () => {
  test("should return Promise<string>", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, increment, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<Promise<string>>();
    assertType<Promise<string>>(pipeline(2));
  });

  test("async pipe with generics", () => {
    const init = () => () => ({ test: "test" });
    const addStartupTime = (time: Date = new Date()) =>
      gm(async () => ({
        startup: time,
      }));
    const pause = (ms: number) =>
      gm(() => new Promise<{}>((r) => setTimeout(() => r({}), ms)));
    const timeDiff = () =>
      gm(async (data: { startup: Date; current: Date }) => {
        return {
          ...data,
          diff: new Date(data.current.getTime() - data.startup.getTime()),
        };
      });

    const currentToString = () =>
      gm((data: { current: Date }) => {
        return {
          current: data.current.toString(),
        };
      });

    const pipeline = pipe(
      init(),
      addStartupTime(),
      pause(1),
      addDate("current"),
      timeDiff(),
      currentToString()
    );

    expectTypeOf(pipeline).returns.toEqualTypeOf<
      Promise<{
        test: string;
        startup: Date;
        current: string;
        diff: Date;
      }>
    >();
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
      (i: number) => i.toString()
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
      (i: number) => i.toString()
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
      (i: number) => i.toString()
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
      (i: number) => i.toString()
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });
});
