import { AnyFunction } from "../types";

export const isAsync = (fu: AnyFunction) =>
  fu.constructor.name === "AsyncFunction";
