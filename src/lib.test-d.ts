import { test, describe, expectTypeOf } from "vitest";
import { preparePipe } from "./pipe.js";
import { apply } from "./helpers/index.js";
import { gate } from "./gate.js";

describe("type integration", () => {
  interface User {
    isAdmin: boolean;
    isUser: boolean;
    isGuest: boolean;
    company?: string;
  }
  const isAuthorized =
    (attr: keyof User, value: string | number | boolean) => (user: User) =>
      user[attr] === value;
  test("preparedPipe with gate", () => {
    const user: User = {
      isAdmin: true,
      isUser: false,
      isGuest: false,
      company: "Cotton-Coding",
    };

    const preparedPipe = preparePipe<[User], string>();

    const pipeRunner = preparedPipe(
      gate(
        isAuthorized("isAdmin", true),
        isAuthorized("company", "Cotton-Coding")
      ),
      apply((user: User) => user.company ?? "")
    );
    expectTypeOf(pipeRunner).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(pipeRunner(user)).toEqualTypeOf<string>();
  });

  test("preparedPipe with preparedPipe", () => {
    const user: User = {
      isAdmin: true,
      isUser: false,
      isGuest: false,
      company: "Cotton-Coding",
    };

    const preparedPipe = preparePipe<[User], string>();

    const pipeRunner = preparedPipe(
      gate(
        isAuthorized("isAdmin", true),
        isAuthorized("company", "Cotton-Coding")
      ),
      apply((user: User) => user.company ?? "")
    );
    expectTypeOf(pipeRunner).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(pipeRunner(user)).toEqualTypeOf<string>();
  });
});
