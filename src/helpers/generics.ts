import {
  AnyObject,
  GMerge,
  GMergeAsync,
  GOmit,
  GPick,
  KeyAnyObject,
  MaybePromise,
} from "../types";

/**
 * Generic merge function
 * This is required to merge objects in a type-safe way with pipes
 *
 * @param fu - The function to merge
 * @returns
 */
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => FO
): GMerge<FI, FO>;
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => Promise<FO>
): GMergeAsync<FI, FO>;
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => MaybePromise<FO>
) {
  return fu.constructor.name === "AsyncFunction"
    ? ((async (data) => {
        const subset = await fu(data);
        return { ...data, ...subset };
      }) as GMergeAsync<FI, FO>)
    : (((data) => {
        const subset = fu(data);
        return { ...data, ...subset };
      }) as GMerge<FI, FO>);
}

/**
 * Adds a timestamp (Date) to the object
 *
 * @param tag - The key to use for the timestamp
 * @returns
 */
export const addDate = <FI extends AnyObject, T extends string>(tag: T) =>
  g<FI, { [x in T]: Date }>(
    () =>
      ({
        [tag]: new Date(),
      } as { [x in T]: Date })
  );

/**
 * Omit keys from an object
 *
 * @param keys - The keys to omit
 * @returns The object without the omitted keys
 */
export const omit = <T extends KeyAnyObject<K>, K extends string[]>(
  ...keys: K
) =>
  (<O extends T>(obj: O) =>
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => !keys.includes(key))
    )) as GOmit<any, K[number]>;

/**
 * Pick keys from an object
 *
 * @param keys - The keys to keep
 * @returns The object with the picked keys
 */
export const pick = <T extends KeyAnyObject<K>, K extends string[]>(
  ...keys: K
) =>
  ((obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => keys.includes(key))
    )) as GPick<any, K[number]>;
