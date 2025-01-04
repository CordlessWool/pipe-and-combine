import { test, describe, assertType, expectTypeOf } from "vitest";
import {
  pipe,
  PipeArray,
  PipeReduce,
  preparePipe,
  PrevReturn,
} from "./pipe.js";
import { g } from "./helpers/index.js";
import { addDate, exec, omit } from "./helpers/generics.js";
import { Dirent } from "node:fs";
import { AnyObject, LastIndex, MergeObjects } from "./types.js";

describe("pipe", () => {
  test("should return string", () => {
    const double = (x: number) => x * 2;
    const increment = (x: number) => x + 1;
    const square = (x: number) => x * x;
    const toStr = (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<string>();
    assertType<string>(pipeline(2));
  });

  test("pipe return is detected automaticly to be async", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, increment, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<Promise<string>>();
    assertType<Promise<string>>(pipeline(2));
  });

  test("pipe with generics", () => {
    const init = () => () => ({ test: "test" });
    const addStartupTime = (time: Date = new Date()) =>
      g(() => ({
        startup: time,
      }));
    const timeDiff = () =>
      g((data: { startup: Date; current: Date }) => {
        return {
          ...data,
          diff: new Date(data.current.getTime() - data.startup.getTime()),
        };
      });

    const addHello = () => g(() => ({ hello: "test" }));

    const currentToString = () =>
      g((data: { current: Date }) => {
        return {
          current: data.current.toString(),
        };
      });

    const pipeline = pipe(
      addStartupTime(),
      addDate("current"),
      timeDiff(),
      currentToString(),
      addHello(),
      addDate("done"),
      omit("hello")
    );

    expectTypeOf(pipeline).returns.toEqualTypeOf<{
      current: string;
      done: Date;
      startup: Date;
      diff: Date;
    }>();
  });

  test("pipe with generic and object input", () => {
    const t = () =>
      g((dir: { base: string; $type: 0 }) => {
        return {
          readAt: new Date(),
          content: [] as Dirent[],
        } satisfies { readAt: Date; content: Dirent[] };
      });

    type t2 = ReturnType<typeof t>;
    const only =
      (type: 0 | 1) => (dir: { content: Dirent[]; base: string }) => {
        if (type === 0)
          return dir.content
            .filter((item) => item.isDirectory())
            .map((item) => ({
              $type: 0 as const,
              base: dir.base,
              path: item.path,
            }));
        else {
          return dir.content
            .filter((item) => item.isFile())
            .map((item) => ({
              $type: 1 as const,
              base: dir.base,
              path: item.path,
            }));
        }
      };

    // TODO: Seperate types tests
    // const onlyDirs = only(0);
    // const tg = t();
    // type Input = Parameters<typeof tg>;
    // type TFus = [typeof tg, typeof onlyDirs];
    // type Return = PipeReduce<
    //   PrevReturn<TFus, 1, any>,
    //   typeof onlyDirs,
    //   unknown
    // >;
    // type Arr = PipeArray<TFus, any[]>;
    // type o = ReturnType<typeof onlyDirs>;

    const getAllFiles = pipe(t(), only(0));
    expectTypeOf(getAllFiles).returns.toEqualTypeOf<
      | {
          $type: 0;
          base: string;
          path: string;
        }[]
      | {
          $type: 1;
          base: string;
          path: string;
        }[]
    >();
  });
});

describe("asyncPipe", () => {
  test("should return Promise<string>", () => {
    const double = async (x: number) => x * 2;
    const increment = async (x: number) => Promise.resolve(x + 1);
    const square = async (x: number) =>
      new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
    const toStr = async (x: number) => x.toString();

    const pipeline = pipe(double, increment, square, increment, toStr);
    expectTypeOf(pipeline).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(pipeline).returns.toEqualTypeOf<Promise<string>>();
    assertType<Promise<string>>(pipeline(2));
  });

  test("async pipe with generics", () => {
    const init = () => () => ({ test: "test" });
    const addStartupTime = (time: Date = new Date()) =>
      g(async () => ({
        startup: time,
      }));
    const pause = (ms: number) =>
      g(() => new Promise<{}>((r) => setTimeout(() => r({}), ms)));
    const timeDiff = () =>
      g(async (data: { startup: Date; current: Date }) => {
        return {
          ...data,
          diff: new Date(data.current.getTime() - data.startup.getTime()),
        };
      });

    const currentToString = () =>
      g((data: { current: Date }) => {
        return {
          current: data.current.toString(),
        };
      });

    const pipeline = pipe(
      init(),
      addStartupTime(),
      pause(1),
      addDate("current"),
      timeDiff(),
      currentToString()
    );

    expectTypeOf(pipeline).returns.toEqualTypeOf<
      Promise<{
        test: string;
        startup: Date;
        current: string;
        diff: Date;
      }>
    >();
  });

  test("generic, async and complex types", () => {
    type Other = {
      name: string;
    };

    type NewProject = {
      name: string;
    };
    type Project = {
      id: string;
      name: string;
    };

    const initPipe =
      () =>
      (data: {
        random: { name: string };
      }): { project: NewProject; other: Other } => ({
        project: data.random,
        other: {
          name: "test",
        },
      });
    const createProject = () =>
      g(
        async (data: {
          project: NewProject;
        }): Promise<{ project: Project }> => {
          return { project: { id: "1", ...data.project } };
        }
      );

    const test = () =>
      g((data: { project: Project; timestamp: Date }) => {
        return {};
      });

    createProject()(initPipe()({ random: { name: "test" } }));

    const save = (project: Project, when: Date) => {};

    const pipeline = pipe(
      initPipe(),
      createProject(),
      addDate("timestamp"),
      exec(save, ["project", "timestamp"])
    );
  });
});

describe("preparePipe", () => {
  test("preparePipe without params", () => {
    const pipe = preparePipe();
    assertType<Function>(pipe);
    const transformer = pipe((i: string): number => Number(i));
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<number>();
    assertType<number>(transformer("2"));
  });

  test("preparePipe with params", () => {
    const pipe = preparePipe<[string], string>();
    const transformer = pipe(
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString()
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });
  test("preparePipe assert params are reference (Input)", () => {
    const pipe = preparePipe<[number], string>();
    const transformer = pipe(
      // @ts-expect-error
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString()
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });

  test("preparePipe assert params are reference (Output)", () => {
    const pipe = preparePipe<[string], number>();
    const transformer = pipe(
      (i: string): number => Number(i),
      (i: number) => i + 1,
      // @ts-expect-error
      (i: number) => i.toString()
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });

  test("preparePipe assert params are reference (Input and Output)", () => {
    const pipe = preparePipe<[number], number>();
    const transformer = pipe(
      // @ts-expect-error
      (i: string): number => Number(i),
      (i: number) => i + 1,
      (i: number) => i.toString()
    );
    expectTypeOf(transformer).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(transformer).returns.toEqualTypeOf<string>();
    assertType<string>(transformer("2"));
  });
});
