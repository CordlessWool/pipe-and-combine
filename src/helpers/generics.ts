import {
  AnyObject,
  GMerge,
  GOmit,
  GPick,
  KeyAnyObject,
  ObjectFromArrays,
} from "../types.js";

/**
 * Generic merge function
 * This is required to merge objects in a type-safe way with pipes
 *
 * @param fu - The function to merge
 * @returns
 */
export function g<const FI extends AnyObject | undefined, FO>(
  fu: (args: FI) => FO
): GMerge<FI, FO> {
  return (
    fu.constructor.name === "AsyncFunction"
      ? async <I extends FI>(data: I) => {
          const subset = await fu(data);
          return { ...(data ?? {}), ...(subset ?? {}) };
        }
      : <I extends FI>(data: I) => {
          const subset = fu(data);
          return { ...(data ?? {}), ...(subset ?? {}) };
        }
  ) as GMerge<FI, FO>;
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

type MapPick<T, K extends (keyof T)[]> = {
  [P in keyof K]: K[P] extends keyof T ? T[K[P]] : never;
};

const mapPick = <T, K extends (keyof T)[]>(
  obj: T,
  pick: Readonly<K>
): MapPick<T, K> => pick.map((p) => obj[p]) as MapPick<T, K>;

/**
 * Execute a function with picked variables
 *
 * @param fu - function to execute
 * @param pick - variables to pick from the data object
 * @returns - Returns the data object that given to the function
 */
export const exec = <
  const TArgs extends unknown[],
  const TPick extends string[],
  GI extends ObjectFromArrays<TPick, TArgs> = ObjectFromArrays<TPick, TArgs>
>(
  fu: (...args: TArgs) => unknown | Promise<unknown>,
  pick: TPick
) =>
  fu.constructor.name === "AsyncFunction"
    ? g(async (data: GI) => {
        const dataArray = mapPick<GI, TPick>(data, pick) as TArgs;
        await fu(...dataArray);
      })
    : g((data: GI) => {
        const dataArray = mapPick<GI, TPick>(data, pick) as TArgs;
        fu(...dataArray);
      });
