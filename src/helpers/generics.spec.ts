import { test, describe, assertType, expect } from "vitest";
import { g, addDate, omit, pick } from "./generics.js";

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
    const result = merge({ test: "t", text: "text" });
    expect(result).toEqual({ test: "t", test2: "t", text: "text" });
  });

  test("g without input", () => {
    const merge = g(() => ({ test2: "t2" }));
    const result = merge({ test: "t", text: "text" });
    expect(result).toEqual({ test: "t", test2: "t2", text: "text" });
  });

  test("g without return", () => {
    const merge = g((data: { test: string }) => {});
    const result = merge({ test: "t", text: "text" });
    expect(result).toEqual({ test: "t", text: "text" });
  });
});
