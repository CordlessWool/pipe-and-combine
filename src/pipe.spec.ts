import { test, describe, expect } from "vitest";
import { asyncPipe, pipe } from "./pipe";

describe("pipe", () => {
  test("should return 25", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const square = (x: number) => x * x;
    const toStr = (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, toStr);
    expect(pipeline(2)).toBe("25");
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
