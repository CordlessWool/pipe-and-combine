import { test, describe, assertType, expect } from "vitest";
import { g, addDate, omit, pick } from "./generics";

describe("generics helper functions", () => {
  test("addDate", () => {
    const result = addDate("test")({ test: "t", text: "text" });
    assertType<Date>(result.test);
    expect(result.test).toBeInstanceOf(Date);
    expect(result.text).toBe("text");
  });

  test("omit", () => {
    const result = omit("test")({ test: "t", text: "text" });
    expect(result).toEqual({ text: "text" });
  });

  test("pick", () => {
    const result = pick("test")({ test: "t", text: "text" });
    expect(result).toEqual({ test: "t" });
  });

  test("g", () => {
    const merge = g((data: { test: string }) => ({ test2: data.test }));
    // @ts-expect-error
    const result = merge({ test: "t", text: "text" });
    expect(result).toEqual({ test: "t", test2: "t", text: "text" });
  });
});
