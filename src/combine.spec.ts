import { test, describe, expect } from "vitest";
import { combine } from "./combine.js";

describe("combine", () => {
  test("combine with one param", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const square = (x: number) => x * x;
    const toStr = (x: number) => x.toString();

    const c = combine(double, increment, square, toStr);
    expect(c(3)).toEqual([6, 4, 9, "3"]);
  });

  test("combine multiple function with multiple params", () => {
    const add = (a: number, b: number) => a + b;
    const multiply = (a: number, b: number) => a * b;
    const divide = (a: number, b: number) => a / b;
    const other = (a: number, b: number) => (a - b).toString();
    const str = (a: number) => a.toString();

    const c = combine(add, multiply, divide, other, str);
    expect(c(1, 2)).toEqual([3, 2, 0.5, "-1", "1"]);
  });

  test("combine with async functions", async () => {
    const asyncDouble = async (x: number) => x * 2;
    const asyncIncrement = async (x: number) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(x + 1), 20);
      });
    };
    const asyncSquare = async (x: number) => x * x;
    const asyncToStr = async (x: number) => x.toString();

    const c = combine(asyncDouble, asyncIncrement, asyncSquare, asyncToStr);
    expect(await c(3)).toEqual([6, 4, 9, "3"]);
  });

  test("combine with async and non-async functions", async () => {
    const asyncDouble = (x: number) => x * 2;
    const asyncIncrement = async (x: number) => {
      return new Promise((resolve) => setTimeout(() => resolve(x + 1), 20));
    };
    const asyncSquare = (x: number) => x * x;
    const asyncToStr = async (x: number) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(x.toString()), 20);
      });
    };

    const c = combine(asyncDouble, asyncIncrement, asyncSquare, asyncToStr);
    expect(await c(3)).toEqual([6, 4, 9, "3"]);
  });
});
