import { test, describe, expect } from "vitest";
import { asyncPipe, awit, dispel, pipe } from "./pipe";

describe("pipe", () => {
  const inc = (by: number) => (x: number) => x + by;
  const dec = (by: number) => (x: number) => x - by;
  const multiplyBy = (by: number) => (x: number) => x * by;
  const divideBy = (by: number) => (x: number) => x / by;
  const toStr = () => (x: number) => x.toString();
  test("should return 25", () => {
    const pipeline = pipe(inc(2), multiplyBy(7), dec(7), divideBy(3), toStr());
    expect(pipeline(2)).toBe("7");
  });

  test("dispel", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const rest = (x: number): [number, number] => {
      const b = x % 2;
      const a = x - b;
      return [a, b];
    };
    const multiply = (x: number, y: number) => x * y;
    const toStr = (x: number) => x.toString();
    const pipeline = pipe(double, increment, rest, dispel(multiply), toStr);
    expect(pipeline(1)).toBe("2");
  });

  test("awit", () => {
    const increment = (x: number) => x + 1;
    const squareSync = (x: number) => x * x;
    const square = (x: number): Promise<number> =>
      new Promise((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve(x.toString()), 100));

    const pipeline = pipe(increment, awit(square), awit(toStr));
    expect(pipeline(2)).resolves.toBe("9");
  });
});

describe("pipeAsync", () => {
  test("simple", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = asyncPipe(double, increment, square, increment, toStr);
    expect(pipeline(2)).resolves.toBe("26");
  });
});
