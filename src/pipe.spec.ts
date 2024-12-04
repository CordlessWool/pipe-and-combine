import { test, describe, expect } from "vitest";
import { pipe } from "./pipe";
import { apply } from "./helpers";

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

  test("apply", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const rest = (x: number): [number, number] => {
      const b = x % 2;
      const a = x - b;
      return [a, b];
    };
    const multiply = (x: number, y: number) => x * y;
    const toStr = (x: number) => x.toString();
    const pipeline = pipe(double, increment, rest, apply(multiply), toStr);
    expect(pipeline(1)).toBe("2");
  });

  test("pipe auto async", async () => {
    const increment = (x: number) => x + 1;
    const square = (x: number): Promise<number> =>
      new Promise((resolve) => setTimeout(() => resolve(x * x), 10));
    const toStr = async (x: number): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve(x.toString()), 10));

    const pipeline = pipe(increment, square, toStr);
    await expect(pipeline(2)).resolves.toBe("9");
  });
});

describe("pipeAsync", () => {
  test("simple", async () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, increment, toStr);
    await expect(pipeline(2)).resolves.toBe("26");
  });
});

describe("performance", () => {
  const add = (a: number) => (x: number) => x + a;
  const sub = (a: number) => (x: number) => x - a;
  const mul = (a: number) => (x: number) => x * a;
  const div = (a: number) => (x: number) => x / a;

  test("async pipe", () => {
    const as = (a: number) => async (x: number) => x + a;
    console.time("CreatedAsync");
    const pipeline = pipe(add(2), sub(3), add(1), as(2), mul(2), div(2));
    console.timeLog("CreatedAsync");
    for (let i = 0; i < 100000; i++) {
      pipeline(i);
    }
    console.timeEnd("CreatedAsync");
  });

  test("pipe", () => {
    console.time("Created");
    const pipeline = pipe(add(2), sub(3), add(1), mul(2), div(2));
    console.timeLog("Created");
    for (let i = 0; i < 100000; i++) {
      pipeline(i);
    }
    console.timeEnd("Created");
  });

  test("async without pipe", async () => {
    const as = (a: number) => async (x: number) => x + a;
    console.time("Created Async Without Pipe");
    const pipeline = async (x: number) => {
      const b = add(2)(x);
      const c = sub(3)(b);
      const d = add(1)(c);
      const a1 = await as(2)(d);

      const e = mul(2)(a1);
      const f = div(2)(e);
      return f;
    };
    console.timeLog("Created Async Without Pipe");
    for (let i = 0; i < 100000; i++) {
      await pipeline(i);
    }
    console.timeEnd("Created Async Without Pipe");
  });
});
