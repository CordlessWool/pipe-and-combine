import { AnyFunction, AnyObject } from "../types";
import { g } from "./generics";

/**
 * Wrapps around a function and deserializes an array as arguments.
 * e.g. apply(fu)([1, 2, 3]) is equal to fu(1, 2, 3)
 */
export const apply =
  <T extends AnyFunction>(fu: T) =>
  (args: Parameters<T>): ReturnType<T> => {
    if (args.length === 1 && Array.isArray(args[0])) {
      return fu(...args[0]);
    }
    return fu(...args);
  };

/**
 * Executes a function with all values of an array.
 * e.g. execute(fu)([1, 2, 3]) is equal to [fu(1), fu(2), fu(3)]
 */
export const map =
  <T, U>(fn: (arg: T) => U) =>
  (arr: T[]) =>
    arr.map(fn);

export const addDate = <FI extends AnyObject, T extends string>(tag: T) =>
  g<FI, { [x in T]: Date }>(
    () =>
      ({
        [tag]: new Date(),
      } as { [x in T]: Date })
  );
