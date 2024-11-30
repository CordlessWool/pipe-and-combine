import { AnyFunction, AnyObject, ArrayMaybePromise } from "../types";
import { g } from "./generics";

/**
 * Wrapps around a function and awaits the input parameters.
 * The return value is a promise, which resolves to the return value of the function.
 *
 * @param fu - The function to be wrapped.
 */
export const awit =
  <T extends AnyFunction<any[], Promise<any>>>(fu: T) =>
  async (
    ...maybePromise: ArrayMaybePromise<Parameters<T>>
  ): Promise<Awaited<ReturnType<T>>> => {
    const args = await Promise.all(maybePromise);
    return fu(...args);
  };

/**
 * Wrapps around a function and deserializes an array as arguments.
 * e.g. dispel(fu)([1, 2, 3]) is equal to fu(1, 2, 3)
 */
export const dispel =
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

const addDate = <FI extends AnyObject, T extends string>(tag: T) =>
  g<FI, { [x in T]: Date }>(
    () =>
      ({
        [tag]: new Date(),
      }) as { [x in T]: Date },
  );
