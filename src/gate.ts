import { combine, type CombineArray } from "./combine";
import type { AnyFunction } from "./helper";

export class GateException<T extends any[]> extends Error {
  public readonly result: T;

  constructor(result: T) {
    super(`Gate validateion failed: ${JSON.stringify(result)}`);
    this.result = result;
  }
}

export const prepareGate =
  <TInput extends [...any[]], VInput extends [...any[]] = TInput>(
    modifier?: AnyFunction<TInput, VInput>,
  ) =>
  <T extends readonly AnyFunction[]>(...fus: CombineArray<T, VInput, any>) => {
    const combined = combine<AnyFunction<VInput, any>[]>(...fus);
    return (...input: TInput extends VInput ? Parameters<T[0]> : TInput) => {
      const vInput = (
        modifier ? modifier(...(input as TInput)) : input
      ) as VInput;
      const result = combined(...vInput);
      if (result.some((result) => result === false)) {
        throw new GateException(result);
      } else {
        return input;
      }
    };
  };

export const gate = prepareGate();
