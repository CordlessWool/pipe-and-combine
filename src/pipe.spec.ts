import { test, describe, expect } from "bun:test";
import { pipe } from "./pipe";

describe("pipe", () => {
  const double = (x: number) => x * 2;
  const increment = (x: number) => x + 1;
  const square = (x: number) => x * x;
  const toStr = (x: number) => x.toString();

  test("should return 25", () => {
    const pipeline = pipe(double, increment, square, toStr);
    expect(pipeline(2)).toBe("25");
  });
});
