import { AnyObject, GMerge } from "../types";

export const g = <const FI extends AnyObject, FO>(
  fu: (args: FI) => FO,
): GMerge<FI, FO> =>
  ((data) => {
    const subset = fu(data);
    return { ...data, ...subset };
  }) as GMerge<FI, FO>;

export const addDate = <FI extends AnyObject, T extends string>(tag: T) =>
  g<FI, { [x in T]: Date }>(
    () =>
      ({
        [tag]: new Date(),
      }) as { [x in T]: Date },
  );
