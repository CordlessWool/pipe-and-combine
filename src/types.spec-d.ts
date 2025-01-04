import { test, describe, assertType, expectTypeOf } from "vitest";
import type { AnyObject, LastIndex, MergeObjects } from "./types.js";

describe("types", () => {
  test("LastIndex", () => {
    assertType<LastIndex<[1, 2, 3]>>(2);
    assertType<LastIndex<["1", "2", "3", "4"]>>(3);
    assertType<LastIndex<[1]>>(0);
  });

  test("MergeObject simple", () => {
    const mergeObject: MergeObjects<{ a: string }, { b: number }> = {
      a: "a",
      b: 1,
    };
    assertType<MergeObjects<{ a: string }, { b: number }>>(mergeObject);
    expectTypeOf(mergeObject).toEqualTypeOf<{ a: string; b: number }>();
  });

  test("MergeObject complex", () => {
    const mergeObject: MergeObjects<
      { a: string; d: number; o: { a: Array<string> } },
      { b: number; c: boolean; a: number }
    > = {
      a: 2,
      b: 1,
      c: true,
      d: 3,
      o: { a: [] },
    };
    expectTypeOf(mergeObject).toEqualTypeOf<{
      a: number;
      b: number;
      c: boolean;
      d: number;
      o: { a: Array<string> };
    }>();
  });

  test("MergeObejct with AnyObject", () => {
    type tt = MergeObjects<
      AnyObject,
      MergeObjects<
        {
          diff: Date;
          startup: Date;
          current: Date;
        },
        {
          current: string;
        }
      >
    >;
  });
});
