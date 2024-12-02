import { AnyObject, GMerge, GMergeAsync, MaybePromise } from "../types";

/**
 * Generic merge function
 * This is required to merge objects in a type-safe way with pipes
 *
 * @param fu - The function to merge
 * @returns
 */
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => FO,
): GMerge<FI, FO>;
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => Promise<FO>,
): GMergeAsync<FI, FO>;
export function g<const FI extends AnyObject, FO>(
  fu: (args: FI) => MaybePromise<FO>,
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
      }) as { [x in T]: Date },
  );
